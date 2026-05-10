// backend/src/services/profile.service.ts
import prisma from '../prisma/client';
export async function getProfileById(id: number) {
  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      email: true,
      username: true,
      displayName: true,
      avatarUrl: true,
      role: true,
      emailConfirmed: true,
      createdAt: true,

      novels: {
        where: { status: 'PUBLISHED' },
        include: {
          author: {
            // ВАЖЛИВО: Додали id: true сюди!
            select: { id: true, username: true, displayName: true }
          }
        }
      }
    },
  });

  return user ?? null;
}

export async function updateProfile(
  userId: number,
  data: { displayName?: string | null; avatarUrl?: string | null },
) {
  const toUpdate: any = {};
  if (typeof data.displayName !== 'undefined') toUpdate.displayName = data.displayName;
  if (typeof data.avatarUrl !== 'undefined') toUpdate.avatarUrl = data.avatarUrl;

  const updated = await prisma.user.update({
    where: { id: userId },
    data: toUpdate,
    select: {
      id: true,
      email: true,
      username: true,
      displayName: true,
      avatarUrl: true,
      role: true,
      emailConfirmed: true,
      createdAt: true,
    },
  });
  return updated;
}

export async function deleteProfileAndAllData(actor: { id: number; role: string }, userId: number) {
  try {
    // Перевірка авторизації
    if (!(actor && (actor.id === userId || actor.role === 'ADMIN'))) {
      const err: any = new Error('Forbidden');
      err.code = 'FORBIDDEN';
      throw err;
    }

    // Переконаємось, що користувач існує
    const userExists = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true },
    });
    if (!userExists) return { success: false, error: 'User not found' };

    // Знайдемо всі новели автора і їхні глави
    const novels = await prisma.novel.findMany({
      where: { authorId: userId },
      select: { id: true },
    });
    const novelIds = novels.map((n) => n.id);

    let chapterIds: number[] = [];
    if (novelIds.length > 0) {
      const chapters = await prisma.chapter.findMany({
        where: { novelId: { in: novelIds } },
        select: { id: true },
      });
      chapterIds = chapters.map((c) => c.id);
    }

    // Знайдемо всі коментарі
    const userComments = await prisma.comment.findMany({ where: { userId }, select: { id: true } });
    const userCommentIds = userComments.map((c) => c.id);

    // Побудуємо масив операцій для транзакції
    const ops: any[] = [];

    // 1. Очищення зв'язків користувача
    ops.push(prisma.notification.deleteMany({ where: { OR: [{ userId }, { actorId: userId }] } }));
    ops.push(prisma.viewHistory.deleteMany({ where: { userId } }));
    ops.push(prisma.rating.deleteMany({ where: { userId } }));
    ops.push(prisma.follow.deleteMany({ where: { userId } }));
    ops.push(
      prisma.userFollow.deleteMany({
        where: { OR: [{ followerId: userId }, { authorId: userId }] },
      }),
    );
    ops.push(prisma.report.deleteMany({ where: { reporterId: userId } }));
    ops.push(
      prisma.report.updateMany({ where: { moderatorId: userId }, data: { moderatorId: null } }),
    );

    // 2. Обробка коментарів користувача
    if (userCommentIds.length > 0) {
      ops.push(
        prisma.comment.updateMany({
          where: { parentId: { in: userCommentIds } },
          data: { parentId: null },
        }),
      );
      ops.push(prisma.comment.deleteMany({ where: { id: { in: userCommentIds } } }));
    }

    // 3. Видалення залежностей від новел (ТІЛЬКИ для Авторів)
    if (novelIds.length > 0) {
      ops.push(prisma.comment.deleteMany({ where: { novelId: { in: novelIds } } }));
      ops.push(prisma.rating.deleteMany({ where: { novelId: { in: novelIds } } }));
      ops.push(prisma.follow.deleteMany({ where: { novelId: { in: novelIds } } }));
      ops.push(prisma.novelTag.deleteMany({ where: { novelId: { in: novelIds } } }));

      // ВИПРАВЛЕНО: Додано видалення жанрів новели!
      ops.push(prisma.novelGenre.deleteMany({ where: { novelId: { in: novelIds } } }));

      ops.push(prisma.viewHistory.deleteMany({ where: { novelId: { in: novelIds } } }));
    }

    // 4. Видалення залежностей від глав
    if (chapterIds.length > 0) {
      ops.push(prisma.comment.deleteMany({ where: { chapterId: { in: chapterIds } } }));
      ops.push(prisma.viewHistory.deleteMany({ where: { chapterId: { in: chapterIds } } }));
    }

    // 5. Видалення звітів (Reports), спрямованих на новели/глави автора
    if (novelIds.length > 0 || chapterIds.length > 0) {
      const reportOrWhere: any[] = [];
      if (novelIds.length > 0)
        reportOrWhere.push({ AND: [{ targetType: 'novel' }, { targetId: { in: novelIds } }] });
      if (chapterIds.length > 0)
        reportOrWhere.push({ AND: [{ targetType: 'chapter' }, { targetId: { in: chapterIds } }] });

      if (reportOrWhere.length > 0) {
        ops.push(prisma.report.deleteMany({ where: { OR: reportOrWhere } }));
      }
    }

    // 6. Фінальне видалення сутностей
    if (novelIds.length > 0) {
      if (chapterIds.length > 0) {
        ops.push(prisma.chapter.deleteMany({ where: { id: { in: chapterIds } } }));
      }
      ops.push(prisma.novel.deleteMany({ where: { id: { in: novelIds } } }));
    }

    // Нарешті — видаляємо самого користувача
    ops.push(prisma.user.delete({ where: { id: userId } }));

    // Виконаємо все в одній транзакції
    await prisma.$transaction(ops);

    return { success: true };
  } catch (err: any) {
    if (err?.code === 'FORBIDDEN') throw err;
    console.error('Failed to fully delete user and data:', err);
    return { success: false, error: err.message ?? 'Failed to delete user' };
  }
}