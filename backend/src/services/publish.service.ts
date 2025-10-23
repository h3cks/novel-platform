// src/services/publish.service.ts
import prisma from '../prisma/client';
import { stripHtml, countWordsFromHtml } from '../utils/text';
import { sendMail } from './email.service';
import * as cfg from '../config'; // optional - використовуємо якщо є
// fallback values
const MIN_WORDS_TOTAL = Number(cfg.MIN_WORDS_TOTAL ?? process.env.MIN_WORDS_TOTAL ?? 2000);
const MIN_CHAPTERS = Number(cfg.MIN_CHAPTERS ?? process.env.MIN_CHAPTERS ?? 1);
const MIN_WORDS_PER_CHAPTER = Number(cfg.MIN_WORDS_PER_CHAPTER ?? process.env.MIN_WORDS_PER_CHAPTER ?? 100);
const MAX_EXTERNAL_LINKS = Number(cfg.MAX_EXTERNAL_LINKS ?? process.env.MAX_EXTERNAL_LINKS ?? 5);
const DUPLICATE_CONTENT_THRESHOLD = Number(cfg.DUPLICATE_CONTENT_THRESHOLD ?? process.env.DUPLICATE_CONTENT_THRESHOLD ?? 0.6);
const LANG_DETECTION_ENABLED = (process.env.LANG_DETECTION_ENABLED ?? 'false') === 'true';
const LANG_DETECTION_RATIO = Number(cfg.LANG_DETECTION_RATIO ?? process.env.LANG_DETECTION_RATIO ?? 0.6);

function extractLinksFromHtml(html: string): string[] {
  const matches = html.match(/https?:\/\/[^\s"'<>]+/gi);
  return matches ?? [];
}

function domainOfUrl(urlStr: string): string | null {
  try {
    const u = new URL(urlStr);
    return u.hostname.replace(/^www\./, '');
  } catch {
    return null;
  }
}

/** create k-word shingles (lowercased) */
function shingles(text: string, k = 5): Set<string> {
  const words = text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .split(/\s+/)
    .filter(Boolean);
  const s = new Set<string>();
  if (words.length < k) {
    if (words.length > 0) s.add(words.join(' '));
    return s;
  }
  for (let i = 0; i <= words.length - k; i++) {
    s.add(words.slice(i, i + k).join(' '));
  }
  return s;
}

function jaccard(a: Set<string>, b: Set<string>) {
  const A = a.size;
  const B = b.size;
  if (A === 0 && B === 0) return 1;
  let inter = 0;
  for (const x of a) if (b.has(x)) inter++;
  const union = A + B - inter;
  return union === 0 ? 0 : inter / union;
}

/**
 * Language heuristic: ratio of Cyrillic letters to all letters.
 * Simple but works as quick heuristic for UA/RU vs EN.
 */
function cyrillicRatio(text: string) {
  const letters = text.match(/\p{L}/gu) ?? [];
  if (letters.length === 0) return 0;
  const cyr = letters.filter((ch) => /\p{Script=Cyrillic}/u.test(ch));
  return cyr.length / letters.length;
}

type PublishCheckResult = {
  ok: boolean;
  reasons: string[]; // machine-readable keys
  details?: any;
};

export async function runPrePublishChecks(novelId: number): Promise<PublishCheckResult> {
  const novel = await prisma.novel.findUnique({
    where: { id: novelId },
    include: { chapters: true, author: { select: { id: true, email: true, username: true } } },
  });
  if (!novel) throw Object.assign(new Error('Novel not found'), { code: 'NOVEL_NOT_FOUND' });

  const reasons: string[] = [];
  const details: any = {};

  // 1) MIN_CHAPTERS
  const chapterCount = novel.chapters.length;
  if (chapterCount < MIN_CHAPTERS) {
    reasons.push('min_chapters');
    details.minChapters = { required: MIN_CHAPTERS, actual: chapterCount };
  }

  // 2) MIN_WORDS_TOTAL
  const totalWords = novel.wordCount ?? novel.chapters.reduce((s, c) => s + (c.wordCount ?? countWordsFromHtml(c.content)), 0);
  if (totalWords < MIN_WORDS_TOTAL) {
    reasons.push('min_words_total');
    details.minWordsTotal = { required: MIN_WORDS_TOTAL, actual: totalWords };
  }

  // 3) MIN_WORDS_PER_CHAPTER
  const shortChapters = novel.chapters.filter((c) => (c.wordCount ?? countWordsFromHtml(c.content)) < MIN_WORDS_PER_CHAPTER);
  if (shortChapters.length > 0) {
    reasons.push('min_words_per_chapter');
    details.shortChapters = shortChapters.map((c) => ({ id: c.id, order: c.order, wordCount: c.wordCount ?? countWordsFromHtml(c.content) }));
  }



  // 4) MAX_EXTERNAL_LINKS
  const allLinks = novel.chapters.flatMap((c) => extractLinksFromHtml(c.content));
  const domains = Array.from(new Set(allLinks.map(domainOfUrl).filter(Boolean)));
  if (domains.length > MAX_EXTERNAL_LINKS) {
    reasons.push('too_many_external_links');
    details.externalLinks = { count: allLinks.length, uniqueDomains: domains };
  }

  // 5) DUPLICATE_CONTENT_THRESHOLD (pairwise Jaccard on shingles)
  if (DUPLICATE_CONTENT_THRESHOLD > 0 && novel.chapters.length >= 2) {
    const shinglesByChapter = novel.chapters.map((c) => ({ id: c.id, sh: shingles(stripHtml(c.content), 5) }));
    let dupPairs: any[] = [];
    for (let i = 0; i < shinglesByChapter.length; i++) {
      for (let j = i + 1; j < shinglesByChapter.length; j++) {
        const a = shinglesByChapter[i].sh;
        const b = shinglesByChapter[j].sh;
        const sim = jaccard(a, b);
        if (sim >= DUPLICATE_CONTENT_THRESHOLD) {
          dupPairs.push({ a: shinglesByChapter[i].id, b: shinglesByChapter[j].id, similarity: sim });
        }
      }
    }
    if (dupPairs.length > 0) {
      reasons.push('duplicate_content');
      details.duplicates = dupPairs;
    }
  }

  // 6) LANG_DETECTION (heuristic Cyrillic ratio)
  if (LANG_DETECTION_ENABLED) {
    const combined = stripHtml(novel.chapters.map((c) => c.content).join(' '));
    const ratio = cyrillicRatio(combined);
    if (ratio < LANG_DETECTION_RATIO) {
      reasons.push('language_detection');
      details.language = { ratio, required: LANG_DETECTION_RATIO };
    }
  }

  const ok = reasons.length === 0;
  return { ok, reasons, details };
}

/**
 * Try to publish a novel.
 * If checks pass -> set PUBLISHED, publishedAt.
 * If checks fail -> set REVIEWING and return reasons.
 */
export async function attemptPublish(novelId: number, actorId: number) {

  // load novel + author
  const novel = await prisma.novel.findUnique({ where: { id: novelId }, include: { author: { select: { id: true, email: true, username: true } } } });

  if (!novel) throw Object.assign(new Error('Novel not found'), { code: 'NOVEL_NOT_FOUND' });

  if (novel.status === 'BLOCKED') {
    throw Object.assign(new Error('Forbidden: novel is blocked'), { code: 'FORBIDDEN' });
  }

  if (!novel) throw Object.assign(new Error('Novel not found'), { code: 'NOVEL_NOT_FOUND' });

  // Only author can publish (policy). Moderators/admins handle reviews via reports.
  if (novel.authorId !== actorId) throw Object.assign(new Error('Forbidden'), { code: 'FORBIDDEN' });

  if (novel.status === 'PUBLISHED') {
    // already published — treat as success (idempotent)
    return { ok: true, status: 'PUBLISHED', reasons: [], details: { message: 'Already published' } };
  }

  const check = await runPrePublishChecks(novelId);

  if (check.ok) {
    // publish
    try {
      const updated = await prisma.novel.update({
        where: { id: novelId },
        data: { status: 'PUBLISHED', publishedAt: new Date(), autoPublished: true },
      });

      // notify author
      if (novel.author?.email) {
        const subject = `Ваша новела "${novel.title}" опублікована`;
        const html = `<p>Доброго дня, ${novel.author.username ?? 'Автор'}.</p>
          <p>Ваша новела "<strong>${novel.title}</strong>" успішно пройшла автоматичні перевірки і була опублікована.</p>
          <p>Дякуємо! Якщо хочете — поділіться посиланням.</p>`;
        try { await sendMail(novel.author.email, subject, html); } catch (e) { console.warn('Failed to send publish email', e); }
      }

      return { ok: true, status: 'PUBLISHED', reasons: [], details: { novel: updated } };
    } catch (e: any) {
      console.error('Failed to update novel status to PUBLISHED', e);
      throw Object.assign(new Error('DB_UPDATE_FAILED'), { code: 'DB_ERROR', details: e });
    }
  } else {
    // move to REVIEWING (so moderators can see it), but do not block reading if policy says so.
    const updated = await prisma.novel.update({
      where: { id: novelId },
      data: { status: 'REVIEWING', autoPublished: false },
    });

    // notify author with reasons
    if (novel.author?.email) {
      const subject = `Ваша новела "${novel.title}" потребує перевірки / правок`;
      const html = `<p>Доброго дня, ${novel.author.username ?? 'Автор'}.</p>
        <p>Ваша новела "<strong>${novel.title}</strong>" не пройшла автоматичні перевірки і була переведена в статус <strong>REVIEWING</strong>.</p>
        <p>Проблеми:</p>
        <ul>${check.reasons.map(r => `<li>${r}</li>`).join('')}</ul>
        <p>Деталі: <pre>${JSON.stringify(check.details, null, 2)}</pre></p>
        <p>Виправте зауваження або зверніться до модератора.</p>`;
      try { await sendMail(novel.author.email, subject, html); } catch (e) { console.warn('Failed to send review email', e); }
    }

    return { ok: false, status: 'REVIEWING', reasons: check.reasons, details: check.details };
  }
}
