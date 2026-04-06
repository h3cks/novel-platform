// backend/src/services/novel.service.ts
import prisma from '../prisma/client';

const MAX_GENRES = 5;
const MAX_TAGS = 20;

function toSlug(s: string) {
  return s
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '') // remove non-word chars
    .replace(/\-+/g, '-')
    .slice(0, 100);
}

export type NovelCreateInput = {
  title: string;
  description?: string | null;
  coverUrl?: string | null;
  genreIds?: number[];
  genreNames?: string[];
  createMissingGenres?: boolean;
  tagIds?: number[];
};

export async function createNovel(data: NovelCreateInput, authorId: number) {
  // Валідація кількості
  if (Array.isArray(data.genreIds) && data.genreIds.length > MAX_GENRES) {
    throw { code: 'INVALID_PAYLOAD', message: `Max ${MAX_GENRES} genres allowed` };
  }
  if (Array.isArray(data.tagIds) && data.tagIds.length > MAX_TAGS) {
    throw { code: 'INVALID_PAYLOAD', message: `Max ${MAX_TAGS} tags allowed` };
  }

  // Валідація існування жанрів
  if (Array.isArray(data.genreIds) && data.genreIds.length > 0) {
    const existing = await prisma.genre.findMany({
      where: { id: { in: data.genreIds } },
      select: { id: true },
    });
    const existingIds = new Set(existing.map((g) => g.id));
    const missing = data.genreIds.filter((id) => !existingIds.has(id));
    if (missing.length > 0) {
      throw { code: 'INVALID_PAYLOAD', message: `Invalid genreIds: ${missing.join(',')}` };
    }
  }

  // Валідація існування тегів
  if (Array.isArray(data.tagIds) && data.tagIds.length > 0) {
    const existing = await prisma.tag.findMany({
      where: { id: { in: data.tagIds } },
      select: { id: true },
    });
    const existingIds = new Set(existing.map((t) => t.id));
    const missing = data.tagIds.filter((id) => !existingIds.has(id));
    if (missing.length > 0) {
      throw { code: 'INVALID_PAYLOAD', message: `Invalid tagIds: ${missing.join(',')}` };
    }
  }

  return prisma.$transaction(async (tx) => {
    const created = await tx.novel.create({
      data: {
        title: data.title,
        description: data.description ?? null,
        coverUrl: data.coverUrl ?? null,
        authorId,
        status: 'DRAFT',
      },
    });

    // Оптимізоване додавання жанрів через createMany
    if (Array.isArray(data.genreIds) && data.genreIds.length > 0) {
      const genreData = data.genreIds.map((gid) => ({ novelId: created.id, genreId: gid }));
      await tx.novelGenre.createMany({
        data: genreData,
        skipDuplicates: true,
      });
    }

    // Додавання жанрів за іменами (тут залишаємо цикл, бо можливе створення нових записів)
    if (Array.isArray(data.genreNames) && data.genreNames.length > 0) {
      for (const raw of data.genreNames) {
        const name = String(raw).trim();
        if (!name) continue;
        const existing = await tx.genre.findUnique({ where: { name } });

        if (existing) {
          try {
            await tx.novelGenre.create({ data: { novelId: created.id, genreId: existing.id } });
          } catch (e) {} // ігноруємо можливі дублікати
        } else if (data.createMissingGenres) {
          try {
            const newGenre = await tx.genre.create({ data: { name, slug: toSlug(name) } });
            await tx.novelGenre.create({ data: { novelId: created.id, genreId: newGenre.id } });
          } catch (e) {}
        }
      }
    }


    if (Array.isArray(data.tagIds) && data.tagIds.length > 0) {
      const tagData = data.tagIds.map((tid) => ({ novelId: created.id, tagId: tid }));
      await tx.novelTag.createMany({
        data: tagData,
        skipDuplicates: true,
      });
    }

    return created;
  });
}

export type FindNovelsOptions = {
  q?: string | null;
  authorId?: number | null;
  status?: string | null;
  page?: number;
  limit?: number;
  requester?: { id: number; role: string } | null;
  genreId?: number | null;
  tagName?: string | null;
  tagId?: number | null;
  sort?: string | null; // ДОДАНО: підтримка сортування
};

export async function findNovels(opts: FindNovelsOptions) {
  const page = Math.max(1, opts.page ?? 1);
  const limit = Math.min(50, Math.max(1, opts.limit ?? 10));
  const skip = (page - 1) * limit;

  const where: any = {};

  if (opts.q) {
    where.title = { contains: opts.q, mode: 'insensitive' as const };
  }
  if (opts.authorId) where.authorId = opts.authorId;

  // Visibility handling
  if (opts.status) {
    if (
      opts.requester?.role === 'ADMIN' ||
      opts.requester?.role === 'MODERATOR' ||
      (opts.requester && opts.authorId && opts.requester.id === opts.authorId)
    ) {
      where.status = opts.status;
    } else {
      where.status = 'PUBLISHED';
    }
  } else {
    if (opts.requester?.role === 'ADMIN' || opts.requester?.role === 'MODERATOR') {
      // all
    } else if (opts.requester && opts.authorId && opts.requester.id === opts.authorId) {
      // author sees own
    } else {
      where.status = 'PUBLISHED';
    }
  }

  if (opts.genreId) {
    where.genres = { some: { genreId: opts.genreId } };
  }

  if (opts.tagId) {
    where.tags = { some: { tagId: opts.tagId } };
  } else if (opts.tagName) {
    where.tags = { some: { tag: { name: opts.tagName } } };
  }

  // ДОДАНО: Логіка сортування
  let orderBy: any = { createdAt: 'desc' };

  if (opts.sort === 'recommended') {
    // Проста імітація рекомендацій (найвищий рейтинг або найбільше закладок).
    // Для початку візьмемо сортування по ID (або замініть на rating, якщо є поле).
    orderBy = { id: 'desc' };
  } else if (opts.sort === 'views_week' || opts.sort === 'views_day') {
    // В ідеалі тут має бути запит до таблиці аналітики,
    // але для старту (щоб не ламати поточну БД) сортуємо за updatedAt
    orderBy = { updatedAt: 'desc' };
  }

  const [total, items] = await Promise.all([
    prisma.novel.count({ where }),
    prisma.novel.findMany({
      where,
      skip,
      take: limit,
      orderBy, // ВИКОРИСТОВУЄМО ДИНАМІЧНЕ СОРТУВАННЯ
      include: {
        author: { select: { id: true, username: true, displayName: true, avatarUrl: true } },
        tags: { include: { tag: true } },
        genres: { include: { genre: true } },
      },
    }),
  ]);

  return { items, meta: { page, limit, total } };
}

export async function getNovelById(id: number) {
  const novel = await prisma.novel.findUnique({
    where: { id },
    include: {
      author: { select: { id: true, username: true, displayName: true, avatarUrl: true } },
      tags: { include: { tag: true } },
      genres: { include: { genre: true } },
    },
  });
  return novel;
}

export async function updateNovel(
  id: number,
  updates: {
    title?: string;
    description?: string | null;
    coverUrl?: string | null;
    genreIds?: number[] | null;
    genreNames?: string[] | null;
    createMissingGenres?: boolean;
    tagIds?: number[] | null;
  },
) {
  if (Array.isArray(updates.genreIds) && updates.genreIds.length > MAX_GENRES) {
    throw { code: 'INVALID_PAYLOAD', message: `Max ${MAX_GENRES} genres allowed` };
  }
  if (Array.isArray(updates.tagIds) && updates.tagIds.length > MAX_TAGS) {
    throw { code: 'INVALID_PAYLOAD', message: `Max ${MAX_TAGS} tags allowed` };
  }

  if (Array.isArray(updates.genreIds) && updates.genreIds.length > 0) {
    const existing = await prisma.genre.findMany({
      where: { id: { in: updates.genreIds } },
      select: { id: true },
    });
    const existingIds = new Set(existing.map((g) => g.id));
    const missing = updates.genreIds.filter((gid) => !existingIds.has(gid));
    if (missing.length > 0) {
      throw { code: 'INVALID_PAYLOAD', message: `Invalid genreIds: ${missing.join(',')}` };
    }
  }

  if (Array.isArray(updates.tagIds) && updates.tagIds.length > 0) {
    const existing = await prisma.tag.findMany({
      where: { id: { in: updates.tagIds } },
      select: { id: true },
    });
    const existingIds = new Set(existing.map((t) => t.id));
    const missing = updates.tagIds.filter((tid) => !existingIds.has(tid));
    if (missing.length > 0) {
      throw { code: 'INVALID_PAYLOAD', message: `Invalid tagIds: ${missing.join(',')}` };
    }
  }

  return prisma.$transaction(async (tx) => {
    const updated = await tx.novel.update({
      where: { id },
      data: {
        title: updates.title,
        description: typeof updates.description !== 'undefined' ? updates.description : undefined,
        coverUrl: typeof updates.coverUrl !== 'undefined' ? updates.coverUrl : undefined,
      },
    });

    // Оновлення жанрів по ID
    if (Array.isArray(updates.genreIds)) {
      await tx.novelGenre.deleteMany({ where: { novelId: id } });

      const validGenreIds = updates.genreIds.filter((gid) => Number.isInteger(gid) && gid > 0);
      if (validGenreIds.length > 0) {
        const genreData = validGenreIds.map((gid) => ({ novelId: id, genreId: gid }));
        await tx.novelGenre.createMany({
          data: genreData,
          skipDuplicates: true,
        });
      }
    }

    // Оновлення жанрів по імені
    if (Array.isArray(updates.genreNames)) {
      await tx.novelGenre.deleteMany({ where: { novelId: id } });
      for (const raw of updates.genreNames) {
        const name = String(raw).trim();
        if (!name) continue;
        const existing = await tx.genre.findUnique({ where: { name } });

        if (existing) {
          try {
            await tx.novelGenre.create({ data: { novelId: id, genreId: existing.id } });
          } catch (e) {}
        } else if (updates.createMissingGenres) {
          try {
            const newGenre = await tx.genre.create({ data: { name, slug: toSlug(name) } });
            await tx.novelGenre.create({ data: { novelId: id, genreId: newGenre.id } });
          } catch (e) {}
        }
      }
    }

    // ВИПРАВЛЕНО: Оновлення тегів по ID (помилка з data.tagIds та created.id)
    if (Array.isArray(updates.tagIds)) {
      await tx.novelTag.deleteMany({ where: { novelId: id } });

      const validTagIds = updates.tagIds.filter((tid) => Number.isInteger(tid) && tid > 0);
      if (validTagIds.length > 0) {
        const tagData = validTagIds.map((tid) => ({ novelId: id, tagId: tid }));
        await tx.novelTag.createMany({
          data: tagData,
          skipDuplicates: true,
        });
      }
    }

    return updated;
  });
}

export async function getLatestUpdates(limit: number = 15) {
  // Знаходимо останні опубліковані глави
  const latestChapters = await prisma.chapter.findMany({
    where: {
      novel: {
        status: 'PUBLISHED' // Тільки для опублікованих новел
      }
    },
    orderBy: { createdAt: 'desc' },
    take: limit,
    include: {
      novel: {
        select: {
          id: true,
          title: true,
          author: { select: { username: true } }
        }
      }
    }
  });

  return latestChapters.map(ch => ({
    id: ch.id,
    novelId: ch.novelId,
    novelTitle: ch.novel.title,
    chapterId: ch.id,
    chapterNumber: ch.order, // Припускаючи, що поле називається order
    chapterTitle: ch.title,
    authorUsername: ch.novel.author.username,
    updatedAt: ch.createdAt.toISOString()
  }));
}

export async function deleteNovel(id: number) {
  // Прибрано try/catch. Якщо видалення пов'язаних сутностей падає,
  // вся транзакція має автоматично скасуватися (Rollback), щоб не псувати базу.
  return prisma.$transaction(async (tx) => {
    await tx.viewHistory.deleteMany({ where: { novelId: id } });
    await tx.chapter.deleteMany({ where: { novelId: id } });
    await tx.comment.deleteMany({ where: { novelId: id } });
    await tx.rating.deleteMany({ where: { novelId: id } });
    await tx.novelTag.deleteMany({ where: { novelId: id } });
    await tx.novelGenre.deleteMany({ where: { novelId: id } });
    await tx.follow.deleteMany({ where: { novelId: id } });

    const deleted = await tx.novel.delete({ where: { id } });
    return deleted;
  });
}