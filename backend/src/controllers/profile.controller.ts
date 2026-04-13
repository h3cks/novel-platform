import { Request, Response } from 'express';
import * as profileService from '../services/profile.service';
import { isDisplayNameValid, isValidUrl } from '../utils/validators';
import { ok, fail } from '../utils/response';
import { asyncHandler } from '../middlewares/asyncHandler';
import prisma from '../prisma/client';

export const getProfile = asyncHandler(async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) return fail(res, 400, 'INVALID_ID', 'Invalid id');

  const user = await profileService.getProfileById(id);
  if (!user) return fail(res, 404, 'USER_NOT_FOUND', 'User not found');
  return ok(res, { user });
});

export const updateProfile = asyncHandler(async (req: Request, res: Response) => {
  const currentUser = (req as any).user;
  if (!currentUser) return fail(res, 401, 'UNAUTHORIZED', 'Unauthorized');

  const { displayName, avatarUrl } = req.body;
  const updateData: any = {};

  if (displayName !== undefined && displayName !== null) {
    if (!isDisplayNameValid(displayName)) {
      return fail(res, 400, 'INVALID_DISPLAY_NAME', 'displayName must be 1-100 chars');
    }
    updateData.displayName = displayName.trim();
  }

  if (avatarUrl !== undefined && avatarUrl !== null) {
    if (!isValidUrl(avatarUrl)) {
      return fail(res, 400, 'INVALID_AVATAR_URL', 'avatarUrl must be valid URL (http/https)');
    }
    updateData.avatarUrl = avatarUrl.trim();
  }

  if (Object.keys(updateData).length === 0) {
    return fail(res, 400, 'NO_UPDATES', 'No fields to update');
  }

  const updated = await profileService.updateProfile(currentUser.id, updateData);
  return ok(res, { user: updated });
});

export const deleteProfile = asyncHandler(async (req: Request, res: Response) => {
  const currentUser = (req as any).user;
  if (!currentUser) return fail(res, 401, 'UNAUTHORIZED', 'Unauthorized');

  const paramId = req.params.id ? Number(req.params.id) : currentUser.id;
  if (!Number.isInteger(paramId) || paramId <= 0) return fail(res, 400, 'INVALID_ID', 'Invalid id');

  try {
    const result = await profileService.deleteProfileAndAllData(
      { id: currentUser.id, role: currentUser.role },
      paramId,
    );

    if (!result.success) {
      if (result.error === 'User not found')
        return fail(res, 404, 'USER_NOT_FOUND', 'User not found');
      return fail(res, 500, 'DELETE_FAILED', result.error);
    }

    return ok(res, { success: true, message: 'Account and all related data deleted' });
  } catch (err: any) {
    if (err?.code === 'FORBIDDEN') return fail(res, 403, 'FORBIDDEN', 'Forbidden');
    throw err;
  }
});

export const getBookmarks = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const bookmarks = await prisma.follow.findMany({
    where: { userId },
    include: {
      novel: {
        select: { id: true, title: true, coverUrl: true, author: { select: { username: true } } }
      }
    },
    orderBy: { createdAt: 'desc' }
  });
  res.status(200).json({ success: true, data: bookmarks });
});

export const getHistory = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user.id;

  const history = await prisma.viewHistory.findMany({
    where: { userId },
    orderBy: { viewedAt: 'desc' },
    distinct: ['novelId'], // ВАЖЛИВО: Залишає лише один (найостанніший) запис для кожної новели
    take: 30, // Можна збільшити, якщо хочете зберігати більше 30 унікальних новел в історії
    include: {
      novel: {
        select: { id: true, title: true, coverUrl: true }
      },
      chapter: {
        select: { id: true, title: true, order: true }
      }
    }
  });

  const validHistory = history.filter((h: any) => h.novel && h.chapter);
  res.status(200).json({ success: true, data: validHistory });
});

export const recordHistory = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const { novelId, chapterId } = req.body;

  if (!novelId || !chapterId) return fail(res, 400, 'INVALID_DATA', 'novelId and chapterId required');

  await prisma.$transaction(async (tx) => {
    // Видаляємо старий запис для цієї ж новели, щоб історія не розросталась в БД
    await tx.viewHistory.deleteMany({
      where: { userId, novelId: Number(novelId) }
    });

    // Створюємо новий запис з поточним прочитаним розділом
    await tx.viewHistory.create({
      data: { userId, novelId: Number(novelId), chapterId: Number(chapterId) }
    });
  });

  res.status(200).json({ success: true });
});