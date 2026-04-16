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
  const limit = parseInt(req.query.limit as string) || 20;
  const skip = (page - 1) * limit;

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      skip, take: limit,
      // ДОДАТИ isBlocked та lastActive у вибірку
      select: { id: true, username: true, email: true, role: true, isBlocked: true, lastActive: true }
    }),
    prisma.user.count()
  ]);

  res.status(200).json({ success: true, data: { users, total } });
});

export const changeRole = asyncHandler(async (req: Request, res: Response) => {
  const { userId } = req.params;
  const { role } = req.body;
  const updatedUser = await prisma.user.update({
    where: { id: Number(userId) },
    data: { role }
  });
  res.status(200).json({ success: true, data: updatedUser });
});




// Тепер функція блокування працює реально!
export const blockUser = asyncHandler(async (req: Request, res: Response) => {
  const { userId } = req.params;
  const adminId = (req as any).user.id;

  if (Number(userId) === adminId) {
    return res.status(400).json({ success: false, message: "Ви не можете заблокувати себе." });
  }

  // Отримуємо поточний стан юзера
  const user = await prisma.user.findUnique({ where: { id: Number(userId) } });
  if (!user) return res.status(404).json({ success: false, message: "Користувача не знайдено" });

  // Перемикаємо стан (заблокувати/розблокувати)
  await prisma.user.update({
    where: { id: Number(userId) },
    data: { isBlocked: !user.isBlocked }
  });

  res.status(200).json({ success: true, message: user.isBlocked ? "Розблоковано" : "Заблоковано" });
});

