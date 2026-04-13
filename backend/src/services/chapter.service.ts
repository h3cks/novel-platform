// src/services/chapter.service.ts
import prisma from '../prisma/client';
import { countWordsFromHtml, sanitizeContent, stripHtml } from '../utils/text';
import { notifyNovelAndAuthorFollowers } from './notification.service';
import * as notificationService from './notification.service';
import * as cfg from '../config';

const MIN_WORDS_PER_CHAPTER_EFFECTIVE = Number(
  cfg.MIN_WORDS_PER_CHAPTER ?? process.env.MIN_WORDS_PER_CHAPTER ?? 100,
);
const DUPLICATE_CONTENT_THRESHOLD = Number(
  cfg.DUPLICATE_CONTENT_THRESHOLD ?? process.env.DUPLICATE_CONTENT_THRESHOLD ?? 0.6,
);
const MAX_COMPARE_CHAPTERS = Number(
  cfg.MAX_COMPARE_CHAPTERS ?? process.env.MAX_COMPARE_CHAPTERS ?? 50,
);
const MAX_EXTERNAL_LINKS = Number(cfg.MAX_EXTERNAL_LINKS ?? process.env.MAX_EXTERNAL_LINKS ?? 5);

const LANG_DETECTION_ENABLED =
  (cfg.LANG_DETECTION_ENABLED ?? process.env.LANG_DETECTION_ENABLED ?? 'false') === 'true';
const LANG_DETECTION_RATIO = Number(
  cfg.LANG_DETECTION_RATIO ?? process.env.LANG_DETECTION_RATIO ?? 0.6,
);

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

function cyrillicRatio(text: string) {
  if (!text) return 0;
  const letters = text.match(/\p{L}/gu) ?? [];
  if (letters.length === 0) return 0;
  let cyrCount = 0;
  for (const ch of letters) {
    if (/\p{Script=Cyrillic}/u.test(ch)) cyrCount++;
  }
  return cyrCount / letters.length;
}

type CreateChapterInput = {
  title: string;
  content: string;
};

export async function createChapter(novelId: number, actorId: number, input: CreateChapterInput) {
  const cleanContent = sanitizeContent(input.content);
  const wordCount = countWordsFromHtml(cleanContent);

  if (wordCount < MIN_WORDS_PER_CHAPTER_EFFECTIVE) {
    const e: any = new Error(`Chapter must have at least ${MIN_WORDS_PER_CHAPTER_EFFECTIVE} words`);
    e.code = 'CHAPTER_TOO_SHORT';
    throw e;
  }

  const newSh = shingles(stripHtml(cleanContent), 5);

  const recentChapters = await prisma.chapter.findMany({
    where: { novelId },
    orderBy: { createdAt: 'desc' },
    take: MAX_COMPARE_CHAPTERS,
    select: { id: true, content: true },
  });

  let duplicateDetected = false;
  let duplicateDetails: any = null;
  if (DUPLICATE_CONTENT_THRESHOLD > 0 && recentChapters.length > 0) {
    for (const rc of recentChapters) {
      const rcSh = shingles(stripHtml(rc.content), 5);
      const sim = jaccard(newSh, rcSh);
      if (sim >= DUPLICATE_CONTENT_THRESHOLD) {
        duplicateDetected = true;
        duplicateDetails = { existingChapterId: rc.id, similarity: sim };
        break;
      }
    }
  }

  const recentContents = recentChapters.map((r) => r.content);
  recentContents.unshift(cleanContent);
  const allLinks = recentContents.flatMap((c) => extractLinksFromHtml(c));
  const domains = Array.from(new Set(allLinks.map(domainOfUrl).filter(Boolean)));
  const tooManyExternal = domains.length > MAX_EXTERNAL_LINKS;

  let languageProblem = false;
  let languageRatio: number | null = null;
  if (LANG_DETECTION_ENABLED) {
    const plain = stripHtml(cleanContent ?? '');
    languageRatio = cyrillicRatio(plain);
    if (languageRatio < LANG_DETECTION_RATIO) {
      languageProblem = true;
    }
  }

  const createdChapter = await prisma.$transaction(async (tx) => {
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(${novelId});`;

    const novel = await tx.novel.findUnique({ where: { id: novelId } });
    if (!novel) throw Object.assign(new Error('Novel not found'), { code: 'NOVEL_NOT_FOUND' });

    const agg = await tx.chapter.aggregate({
      where: { novelId },
      _max: { order: true },
    });
    const nextOrder = (agg._max.order ?? 0) + 1;

    const chapter = await tx.chapter.create({
      data: {
        novelId,
        title: input.title,
        content: cleanContent,
        wordCount,
        order: nextOrder,
      },
    });

    const sum = await tx.chapter.aggregate({
      where: { novelId },
      _sum: { wordCount: true },
    });
    const totalWords = sum._sum.wordCount ?? 0;

    const novelUpdate: any = { wordCount: totalWords };
    if (duplicateDetected || tooManyExternal || languageProblem) {
      novelUpdate.status = 'REVIEWING';
      novelUpdate.flagged = true;
    }

    await tx.novel.update({
      where: { id: novelId },
      data: novelUpdate,
    });

    return chapter;
  });

  // Post-transaction: send notifications
  if (duplicateDetected || tooManyExternal || (LANG_DETECTION_ENABLED && languageProblem)) {
    try {
      const novelAfter = await prisma.novel.findUnique({
        where: { id: novelId },
        select: { authorId: true, title: true },
      });
      const authorId = novelAfter?.authorId ?? null;

      if (authorId) {
        const messageParts: string[] = [];
        if (duplicateDetected)
          messageParts.push(
            `Глава можливо дублює існуючий контент (схожість ${Number(duplicateDetails.similarity).toFixed(2)}).`,
          );
        if (tooManyExternal)
          messageParts.push(`Знайдено багато зовнішніх доменів (${domains.length}).`);
        if (LANG_DETECTION_ENABLED && languageProblem)
          messageParts.push(
            `Мовна перевірка: текст має низьку частку кирилиці (${(languageRatio ?? 0 * 100).toFixed(1)}%).`,
          );

        const msg = `Глава "${createdChapter.title}" помічена для перевірки: ${messageParts.join(' ')}`;

        await notificationService.createNotification({
          userId: authorId,
          type: 'CHAPTER_FLAGGED',
          targetType: 'NOVEL', // ЗМІНЕНО: ведемо на сторінку новели
          targetId: novelId,   // ЗМІНЕНО: передаємо ID новели
          actorId: actorId,
          message: msg,
        });
      }
    } catch (e) {
      console.warn('Failed to create flag notification', e);
    }
  }

  // Normal follower notification
  setImmediate(() => {
    try {
      notifyNovelAndAuthorFollowers(novelId, actorId, `Нова глава "${createdChapter.title}"`, {
        targetType: 'NOVEL', // ЗМІНЕНО: тепер посилання вестиме на сторінку новели
        targetId: novelId,   // ЗМІНЕНО: передаємо ID новели замість ID глави
      });
    } catch (e) {
      console.warn('notify failed', e);
    }
  });

  return createdChapter;
}

export async function listChaptersByNovel(novelId: number, page = 1, limit = 20) {
  const p = Math.max(1, page);
  const l = Math.min(100, Math.max(1, limit));
  const skip = (p - 1) * l;

  const [total, items] = await Promise.all([
    prisma.chapter.count({ where: { novelId } }),
    prisma.chapter.findMany({
      where: { novelId },
      orderBy: { order: 'asc' },
      skip,
      take: l,
      select: {
        id: true,
        title: true,
        order: true,
        wordCount: true,
        createdAt: true,
        updatedAt: true,
      },
    }),
  ]);

  return {
    items,
    meta: { page: p, limit: l, total },
  };
}

export async function getChapterById(id: number) {
  const chapter = await prisma.chapter.findUnique({
    where: { id },
    include: {
      novel: {
        select: { id: true, title: true, status: true, authorId: true },
      },
    },
  });

  if (!chapter) return null;

  const prevChapter = await prisma.chapter.findFirst({
    where: { novelId: chapter.novelId, order: { lt: chapter.order } },
    orderBy: { order: 'desc' },
    select: { id: true },
  });

  const nextChapter = await prisma.chapter.findFirst({
    where: { novelId: chapter.novelId, order: { gt: chapter.order } },
    orderBy: { order: 'asc' },
    select: { id: true },
  });

  return {
    ...chapter,
    prevChapterId: prevChapter?.id || null,
    nextChapterId: nextChapter?.id || null,
  };
}

export async function updateChapter(chapterId: number, data: { title?: string; content?: string }) {
  const updates: any = {};
  if (typeof data.title !== 'undefined') updates.title = data.title;
  if (typeof data.content !== 'undefined') {
    const clean = sanitizeContent(data.content);
    const wc = countWordsFromHtml(clean);
    updates.content = clean;
    updates.wordCount = wc;
  }

  const updated = await prisma.$transaction(async (tx) => {
    const ch = await tx.chapter.update({
      where: { id: chapterId },
      data: updates,
    });

    const sum = await tx.chapter.aggregate({
      where: { novelId: ch.novelId },
      _sum: { wordCount: true },
    });
    const totalWords = sum._sum.wordCount ?? 0;
    await tx.novel.update({
      where: { id: ch.novelId },
      data: { wordCount: totalWords },
    });

    return tx.chapter.findUnique({ where: { id: chapterId } });
  });

  return updated;
}

export async function deleteChapter(chapterId: number) {
  return prisma.$transaction(async (tx) => {
    const ch = await tx.chapter.findUnique({ where: { id: chapterId } });
    if (!ch) throw Object.assign(new Error('Chapter not found'), { code: 'CH_NOT_FOUND' });

    await tx.chapter.delete({ where: { id: chapterId } });

    const sum = await tx.chapter.aggregate({
      where: { novelId: ch.novelId },
      _sum: { wordCount: true },
    });
    const totalWords = sum._sum.wordCount ?? 0;
    await tx.novel.update({
      where: { id: ch.novelId },
      data: { wordCount: totalWords },
    });

    return { ok: true };
  });
}