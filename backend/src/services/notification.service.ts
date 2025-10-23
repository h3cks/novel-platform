import prisma from '../prisma/client';

export async function getNotificationsForUser(userId: number, page = 1, limit = 50) {
  const skip = (Math.max(1, page) - 1) * limit;
  const items = await prisma.notification.findMany({ where: { userId }, orderBy: { createdAt: 'desc' }, skip, take: limit });
  return items;
}

export async function markNotificationRead(id: number, userId: number) {
  const n = await prisma.notification.findUnique({ where: { id } });
  if (!n) throw Object.assign(new Error('Not found'), { code: 'NOT_FOUND' });
  if (n.userId !== userId) throw Object.assign(new Error('Forbidden'), { code: 'FORBIDDEN' });
  await prisma.notification.update({ where: { id }, data: { read: true } });
  return true;
}
