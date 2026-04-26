import { Request, Response } from 'express';
import prisma from '../prisma/client';
import { asyncHandler } from '../middlewares/asyncHandler';

export const getStats = asyncHandler(async (req: Request, res: Response) => {
  const totalUsers = await prisma.user.count();

  // Тепер рахуємо онлайн красиво, по новому полю:
  const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);
  const onlineUsers = await prisma.user.count({
    where: { lastActive: { gte: fifteenMinutesAgo } }
  });

  const newNovels = await prisma.novel.count({
    where: { createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } }
  });

  const openReports = await prisma.report.count({ where: { status: 'OPEN' } });

  res.status(200).json({ success: true, data: { totalUsers, newNovels, openReports, onlineUsers } });
});

export const getUsers = asyncHandler(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  let limit = parseInt(req.query.limit as string) || 20;

  // Захист від зловживань (обмежуємо максимальний ліміт)
  if (limit > 100) limit = 100;

  const skip = (page - 1) * limit;
  const search = req.query.search as string;
  const role = req.query.role as string;

  const whereClause: any = {};

  if (search) {
    whereClause.OR = [
      { username: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } }
    ];
  }

  if (role && role !== 'ALL') {
    whereClause.role = role;
  }

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where: whereClause,
      skip,
      take: limit,
      select: { id: true, username: true, email: true, role: true, isBlocked: true, lastActive: true },
      orderBy: { createdAt: 'desc' }
    }),
    prisma.user.count({ where: whereClause })
  ]);

  res.status(200).json({ success: true, data: { users, total } });
});

export const getUserDetail = asyncHandler(async (req: Request, res: Response) => {
  const { userId } = req.params;
  const id = Number(userId);

  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      username: true,
      email: true,
      role: true,
      isBlocked: true,
      lastActive: true,
      createdAt: true,
      novels: {
        select: {
          id: true,
          title: true,
          status: true,
          flagged: true,
          createdAt: true,
          _count: { select: { chapters: true } }
        }
      },
      comments: {
        take: 20, // останні 20 коментарів
        orderBy: { createdAt: 'desc' },
        include: {
          novel: { select: { title: true } },
          chapter: { select: { title: true, order: true } }
        }
      }
    }
  });

  if (!user) {
    return res.status(404).json({ success: false, message: "Користувача не знайдено" });
  }

  // Знаходимо всі скарги, де цей користувач є об'єктом (targetId)
  const reportsAgainst = await prisma.report.findMany({
    where: {
      targetType: 'user',
      targetId: id
    },
    include: {
      reporter: { select: { username: true } }
    },
    orderBy: { createdAt: 'desc' }
  });

  res.status(200).json({
    success: true,
    data: { ...user, reportsAgainst }
  });
});

export const changeRole = asyncHandler(async (req: Request, res: Response) => {
  const { userId } = req.params;
  const { role } = req.body;
  const currentUser = (req as any).user; // Той, хто робить запит

  const validRoles = ['READER', 'AUTHOR', 'MODERATOR', 'ADMIN'];
  if (!validRoles.includes(role)) {
    return res.status(400).json({ success: false, message: "Невалідна роль" });
  }

  const userToChange = await prisma.user.findUnique({
    where: { id: Number(userId) }
  });

  if (!userToChange) return res.status(404).json({ success: false, message: "Користувача не знайдено" });

  if (currentUser.role === 'MODERATOR' && (role === 'ADMIN' || role === 'MODERATOR' || userToChange.role === 'ADMIN' || userToChange.role === 'MODERATOR')) {
    return res.status(403).json({ success: false, message: "Недостатньо прав для управління привілейованими ролями" });
  }

  // Оновлюємо роль
  const updatedUser = await prisma.user.update({
    where: { id: Number(userId) },
    data: { role }
  });

  // ЗАПИСУЄМО В ЛОГ
  await prisma.auditLog.create({
    data: {
      actorId: currentUser.id,
      action: 'CHANGE_ROLE',
      targetType: 'USER',
      targetId: updatedUser.id,
      details: JSON.stringify({ oldRole: userToChange.role, newRole: updatedUser.role })
    }
  });

  res.status(200).json({ success: true, data: updatedUser });
});


export const blockUser = asyncHandler(async (req: Request, res: Response) => {
  const { userId } = req.params;
  const { isBlocked, reason } = req.body;
  const currentUser = (req as any).user;

  if (Number(userId) === currentUser.id) {
    return res.status(400).json({ success: false, message: "Ви не можете заблокувати себе." });
  }

  const user = await prisma.user.findUnique({ where: { id: Number(userId) } });
  if (!user) return res.status(404).json({ success: false, message: "Користувача не знайдено" });

  if (currentUser.role === 'MODERATOR' && user.role === 'ADMIN') {
    return res.status(403).json({ success: false, message: "Модератор не може застосовувати санкції до Адміністратора" });
  }
  await prisma.user.update({
    where: { id: Number(userId) },
    data: { isBlocked }
  });

  // ЗАПИСУЄМО В ЛОГ
  await prisma.auditLog.create({
    data: {
      actorId: currentUser.id,
      action: isBlocked ? 'BLOCK_USER' : 'UNBLOCK_USER',
      targetType: 'USER',
      targetId: user.id,
      reason: reason || (isBlocked ? 'Порушення правил' : 'Схвалено адміністратором')
    }
  });

  res.status(200).json({ success: true, message: isBlocked ? "Заблоковано" : "Розблоковано" });
});

/**
 * Блокування/Розблокування новели
 */
export const blockNovel = asyncHandler(async (req: Request, res: Response) => {
  const { novelId } = req.params;
  const { isBlocked, reason } = req.body; // Додати читання body

  const novel = await prisma.novel.findUnique({ where: { id: Number(novelId) } });
  if (!novel) return res.status(404).json({ success: false, message: "Новелу не знайдено" });

  const updatedNovel = await prisma.novel.update({
    where: { id: Number(novelId) },
    data: { flagged: isBlocked } // Встановлюємо конкретний статус
  });

  await prisma.auditLog.create({
    data: {
      actorId: (req as any).user.id,
      action: isBlocked ? 'BLOCK_NOVEL' : 'UNBLOCK_NOVEL',
      targetType: 'NOVEL',
      targetId: Number(novelId),
      reason: reason || 'Порушення правил',
      details: JSON.stringify({ title: novel.title })
    }
  });
  res.status(200).json({ success: true, message: isBlocked ? "Заблоковано" : "Розблоковано" });
});

export const createGenre = asyncHandler(async (req: Request, res: Response) => {
  const { name, description } = req.body;

  if (!name || !name.trim()) {
    return res.status(400).json({ success: false, message: "Назва жанру обов'язкова" });
  }

  const cleanName = name.trim();

  // Перевірка на існування (без урахування регістру для PostgreSQL)
  const existingGenre = await prisma.genre.findFirst({
    where: {
      name: {
        equals: cleanName,
        mode: 'insensitive' // ігноруємо великі/малі літери
      }
    }
  });

  if (existingGenre) {
    return res.status(400).json({ success: false, message: "Жанр з такою назвою вже існує!" });
  }

  const genre = await prisma.genre.create({
    data: { name: cleanName, description: description?.trim() }
  });

  res.status(201).json({ success: true, data: genre });
});

export const createTag = asyncHandler(async (req: Request, res: Response) => {
  const { name } = req.body;

  if (!name || !name.trim()) {
    return res.status(400).json({ success: false, message: "Назва тегу обов'язкова" });
  }

  const cleanName = name.trim();

  // Перевірка на існування (без урахування регістру)
  const existingTag = await prisma.tag.findFirst({
    where: {
      name: {
        equals: cleanName,
        mode: 'insensitive'
      }
    }
  });

  if (existingTag) {
    return res.status(400).json({ success: false, message: "Тег з такою назвою вже існує!" });
  }

  const tag = await prisma.tag.create({
    data: { name: cleanName }
  });

  res.status(201).json({ success: true, data: tag });
});

/**
 * Масова розсилка сповіщень усім користувачам
 */
export const sendBroadcast = asyncHandler(async (req: Request, res: Response) => {
  const { title, message } = req.body;

  if (!title || !message) {
    return res.status(400).json({ success: false, message: "Заголовок та текст повідомлення обов'язкові" });
  }

  // Отримуємо ID всіх активних користувачів
  const users = await prisma.user.findMany({
    where: { isBlocked: false },
    select: { id: true }
  });

  // Створюємо сповіщення для кожного користувача
  if (users.length > 0) {
    await prisma.notification.createMany({
      data: users.map(user => ({
        userId: user.id,
        title,
        message,
        type: 'SYSTEM', // Тип сповіщення для ідентифікації системних розсилок
      }))
    });
  }

  res.status(200).json({
    success: true,
    message: `Розсилку успішно відправлено ${users.length} користувачам`
  });
});

// Додайте getNovels до списку експорту на початку файлу та реалізацію внизу
export const getNovels = asyncHandler(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  let limit = parseInt(req.query.limit as string) || 20;
  if (limit > 100) limit = 100;
  const skip = (page - 1) * limit;

  const [novels, total] = await Promise.all([
    prisma.novel.findMany({
      skip,
      take: limit,
      include: {
        author: { select: { id: true, username: true } },
        _count: { select: { chapters: true } }
      },
      orderBy: { createdAt: 'desc' }
    }),
    prisma.novel.count()
  ]);

  res.status(200).json({ success: true, data: { novels, total } });
});

// Отримання списків для адмінки
export const getGenres = asyncHandler(async (req: Request, res: Response) => {
  const genres = await prisma.genre.findMany({
    include: { _count: { select: { novels: true } } },
    orderBy: { name: 'asc' }
  });
  res.status(200).json({ success: true, data: genres });
});

export const getTags = asyncHandler(async (req: Request, res: Response) => {
  const tags = await prisma.tag.findMany({
    include: { _count: { select: { novels: true } } },
    orderBy: { name: 'asc' }
  });
  res.status(200).json({ success: true, data: tags });
});

// Видалення
export const deleteGenre = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  await prisma.genre.delete({ where: { id: Number(id) } });
  res.status(200).json({ success: true, message: "Жанр видалено" });
});

export const deleteTag = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  await prisma.tag.delete({ where: { id: Number(id) } });
  res.status(200).json({ success: true, message: "Тег видалено" });
});

// Деталі новели для адміна
export const getAdminNovelDetail = asyncHandler(async (req: Request, res: Response) => {
  const { novelId } = req.params;
  const novel = await prisma.novel.findUnique({
    where: { id: Number(novelId) },
    include: {
      author: { select: { id: true, username: true, email: true } },
      genres: { include: { genre: true } },
      tags: { include: { tag: true } },
      chapters: { select: { id: true, title: true, order: true, createdAt: true } },
      _count: { select: { comments: true, ratings: true, followers: true } }
    }
  });

  if (!novel) return res.status(404).json({ success: false, message: "Новелу не знайдено" });

  const reports = await prisma.report.findMany({
    where: { targetType: 'novel', targetId: Number(novelId) },
    include: { reporter: { select: { username: true } } },
    orderBy: { createdAt: 'desc' }
  });

  res.status(200).json({ success: true, data: { ...novel, reports } });
});

/**
 * Повне (фізичне) видалення користувача
 */
export const deleteUser = asyncHandler(async (req: Request, res: Response) => {
  const { userId } = req.params;
  const adminId = (req as any).user.id;
  const currentUser = (req as any).user;

  if (Number(userId) === adminId) {
    return res.status(400).json({ success: false, message: "Ви не можете видалити власний акаунт." });
  }

  const user = await prisma.user.findUnique({ where: { id: Number(userId) } });
  if (!user) return res.status(404).json({ success: false, message: "Користувача не знайдено" });

  if (currentUser.role === 'MODERATOR' && user.role === 'ADMIN') {
    return res.status(403).json({ success: false, message: "Модератор не може застосовувати санкції до Адміністратора" });
  }

  await prisma.auditLog.create({
    data: {
      actorId: (req as any).user.id,
      action: 'DELETE_USER',
      targetType: 'USER',
      targetId: Number(userId),
      details: JSON.stringify({ title: user.displayName })
    }
  });

  // Фізичне видалення з бази
  await prisma.user.delete({
    where: { id: Number(userId) }
  });

  res.status(200).json({ success: true, message: "Користувача та всі його дані успішно видалено" });
});

/**
 * Повне (фізичне) видалення новели
 */
export const deleteNovel = asyncHandler(async (req: Request, res: Response) => {
  const { novelId } = req.params;

  const novel = await prisma.novel.findUnique({ where: { id: Number(novelId) } });
  if (!novel) return res.status(404).json({ success: false, message: "Новелу не знайдено" });

  // Фізичне видалення новели
  await prisma.novel.delete({
    where: { id: Number(novelId) }
  });

  await prisma.auditLog.create({
    data: {
      actorId: (req as any).user.id,
      action: 'DELETE_NOVEL',
      targetType: 'NOVEL',
      targetId: Number(novelId),
      details: JSON.stringify({ title: novel.title })
    }
  });

  res.status(200).json({ success: true, message: "Новелу успішно видалено" });
});


export const getAuditLogs = asyncHandler(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 30;
  const skip = (page - 1) * limit;

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      skip,
      take: limit,
      include: {
        actor: { select: { id: true, username: true, role: true } }
      },
      orderBy: { createdAt: 'desc' }
    }),
    prisma.auditLog.count()
  ]);

  res.status(200).json({ success: true, data: { logs, total } });
});