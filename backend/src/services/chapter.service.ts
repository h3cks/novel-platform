import prisma from '../prisma/client';
import { countWordsFromHtml, sanitizeContent } from '../utils/text';


type CreateChapterInput = {
  title: string;
  content: string;
};
const MAX_RETRIES = 3;

export async function createChapter(novelId: number, actorId: number, input: CreateChapterInput) {
// sanitize and prepare
  const cleanContent = sanitizeContent(input.content);
  const wordCount = countWordsFromHtml(cleanContent);


// retry loop for possible unique constraint collisions on order
  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      const created = await prisma.$transaction(async (tx) => {
// ensure novel exists
        const novel = await tx.novel.findUnique({ where: { id: novelId } });
        if (!novel) throw Object.assign(new Error('Novel not found'), { code: 'NOVEL_NOT_FOUND' });


// compute next order within the tx
        const agg = await tx.chapter.aggregate({
          where: { novelId },
          _max: { order: true },
        });
        const nextOrder = (agg._max.order ?? 0) + 1;


// create chapter
        const chapter = await tx.chapter.create({
          data: {
            novelId,
            title: input.title,
            content: cleanContent,
            wordCount,
            order: nextOrder,
          },
        });


// recompute sum of word counts for the novel
        const sum = await tx.chapter.aggregate({
          where: { novelId },
          _sum: { wordCount: true },
        });
        const totalWords = sum._sum.wordCount ?? 0;


// update novel.wordCount
        await tx.novel.update({
          where: { id: novelId },
          data: { wordCount: totalWords },
        });


        return chapter;
      });


      return created;
    } catch (err: any) {
// If unique constraint on (novelId, order) happened, retry
      if (err?.code === 'P2002' && attempt < MAX_RETRIES - 1) {
// wait tiny bit optionally, then retry
        await new Promise((r) => setTimeout(r, 50));
        continue;
      }
      throw err;
    }
  }


  throw new Error('Unable to create chapter due to concurrency issues');
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
  return chapter;
}

export async function updateChapter(chapterId: number, data: { title?: string; content?: string }) {
// sanitize if content provided
  const updates: any = {};
  if (typeof data.title !== 'undefined') updates.title = data.title;
  if (typeof data.content !== 'undefined') {
    const clean = sanitizeContent(data.content);
    const wc = countWordsFromHtml(clean);
    updates.content = clean;
    updates.wordCount = wc;
  }


// perform update + recompute novel.wordCount in transaction
  const updated = await prisma.$transaction(async (tx) => {
    const ch = await tx.chapter.update({
      where: { id: chapterId },
      data: updates,
    });


// recompute sum
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


// recompute sum
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
