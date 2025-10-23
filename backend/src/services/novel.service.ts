import prisma from '../prisma/client';

export type NovelCreateInput = {
  title: string;
  description?: string | null;
  coverUrl?: string | null;
};

export async function createNovel(data: NovelCreateInput, authorId: number) {
  const created = await prisma.novel.create({
    data: {
      title: data.title,
      description: data.description ?? null,
      coverUrl: data.coverUrl ?? null,
      authorId,
      status: 'DRAFT',
    },
  });
  return created;
}


export type FindNovelsOptions = {
  q?: string | null;
  authorId?: number | null;
  status?: string | null;
  page?: number;
  limit?: number;
  requester?: { id: number; role: string } | null;
};

export async function findNovels(opts: FindNovelsOptions) {
  const page = Math.max(1, opts.page ?? 1);
  const limit = Math.min(50, Math.max(1, opts.limit ?? 10));
  const skip = (page - 1) * limit;


  const where: any = {};


// text search by title (case-insensitive)
  if (opts.q) {
    where.title = { contains: opts.q, mode: 'insensitive' as const };
  }


  if (opts.authorId) {
    where.authorId = opts.authorId;
  }


// Visibility handling
  if (opts.status) {
// requester can request specific status if ADMIN, MODERATOR, or author of requested authorId
    if (opts.requester?.role === 'ADMIN' || opts.requester?.role === 'MODERATOR' ||
      (opts.requester && opts.authorId && opts.requester.id === opts.authorId)) {
      where.status = opts.status;
    } else {
// others only see published
      where.status = 'PUBLISHED';
    }
  } else {
// no explicit status filter
    if (opts.requester?.role === 'ADMIN' || opts.requester?.role === 'MODERATOR') {
// admin & moderator: see all -> no status filter
    } else if (opts.requester && opts.authorId && opts.requester.id === opts.authorId) {
// author viewing own novels: see all
    } else {
// public or other users: only published
      where.status = 'PUBLISHED';
    }
  }


  const [total, items] = await Promise.all([
    prisma.novel.count({ where }),
    prisma.novel.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        author: {
          select: { id: true, username: true, displayName: true, avatarUrl: true },
        },
      },
    }),
  ]);


  return {
    items,
    meta: { page, limit, total },
  };
}

export async function getNovelById(id: number) {
  const novel = await prisma.novel.findUnique({
    where: { id },
    include: {
      author: { select: { id: true, username: true, displayName: true, avatarUrl: true } },
    },
  });
  return novel;
}


export async function updateNovel(id: number, updates: { title?: string; description?: string | null; coverUrl?: string | null }) {
  const updated = await prisma.novel.update({
    where: { id },
    data: updates,
  });
  return updated;
}

export async function deleteNovel(id: number) {
// Hard delete: remove chapters and related viewHistory then novel in a transaction
  return prisma.$transaction(async (tx) => {
// delete viewHistory records tied to this novel
    try {
      await tx.viewHistory.deleteMany({ where: { novelId: id } });
    } catch (e) {
// ignore if table doesn't exist or other issues; allow delete to proceed
      console.warn('Warning deleting viewHistory for novel', id, e);
    }


// delete chapters
    try {
      await tx.chapter.deleteMany({ where: { novelId: id } });
    } catch (e) {
      console.warn('Warning deleting chapters for novel', id, e);
    }


// If there are comments/ratings tied directly to novel, try deleting them too (best-effort)
    try {
      await tx.comment.deleteMany({ where: { novelId: id } });
    } catch (e) {
// ignore
    }
    try {
      await tx.rating.deleteMany({ where: { novelId: id } });
    } catch (e) {
// ignore
    }


// finally delete the novel itself
    const deleted = await tx.novel.delete({ where: { id } });
    return deleted;
  });
}
