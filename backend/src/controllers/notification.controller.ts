import { Request, Response } from 'express';
import prisma from '../prisma/client';
import { ok, fail } from '../utils/response';
import { asyncHandler } from '../middlewares/asyncHandler';

// Отримати всі сповіщення поточного користувача
export const getNotifications = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user.id;

  const notifications = await prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: 50, // Беремо останні 50, щоб не перевантажувати базу
  });

  return ok(res, notifications);
});

// Відмітити одне сповіщення як прочитане
export const markAsRead = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const id = Number(req.params.id);

  const notification = await prisma.notification.findUnique({ where: { id } });
  if (!notification) return fail(res, 404, 'NOT_FOUND', 'Сповіщення не знайдено');
  if (notification.userId !== userId) return fail(res, 403, 'FORBIDDEN', 'Доступ заборонено');

  await prisma.notification.update({
    where: { id },
    data: { read: true }
  });

  return ok(res, { success: true });
});

// Відмітити всі сповіщення як прочитані
export const markAllAsRead = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user.id;

  await prisma.notification.updateMany({
    where: { userId, read: false },
    data: { read: true }
  });

  return ok(res, { success: true });
});