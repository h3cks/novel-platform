import { Request, Response } from 'express';
import * as novelService from '../services/novel.service';
import prisma from '../prisma/client';
import { isValidUrl, stripTags } from '../utils/validators';
import * as publishService from '../services/publish.service';

function validateTitle(title: any) {
  return typeof title === 'string' && title.trim().length >= 3 && title.trim().length <= 250;
}


export async function createNovel(req: Request, res: Response) {
  try {
    const user = (req as any).user;
    if (!user) return res.status(401).json({ error: 'Unauthorized' });


    if (user.role === 'ADMIN')
      return res.status(403).json({ error: 'Admins cannot create novels' });


    if (!user.emailConfirmed) {
      return res.status(403).json({ error: 'Email must be confirmed to create novels' });
    }


    const { title, description, coverUrl } = req.body ?? {};


    if (!validateTitle(title))
      return res.status(400).json({ error: 'Invalid title (3-250 chars)' });


    if (typeof description !== 'undefined' && description !== null) {
      if (typeof description !== 'string' || description.trim().length > 2000)
        return res.status(400).json({ error: 'description max 2000 chars' });
    }


    if (typeof coverUrl !== 'undefined' && coverUrl !== null) {
      if (!isValidUrl(coverUrl))
        return res.status(400).json({ error: 'coverUrl must be a valid URL' });
    }


    const cleanedTitle = stripTags(String(title).trim());
    const cleanedDescription = description ? stripTags(String(description).trim()) : null;
    const cleanedCover = coverUrl ? String(coverUrl).trim() : null;


// 🔹 Створення новели
    const novel = await novelService.createNovel(
      { title: cleanedTitle, description: cleanedDescription, coverUrl: cleanedCover },
      user.id
    );


// 🔹 Якщо користувач був READER — оновлюємо роль на AUTHOR
    let newRole = user.role;
    if (user.role === 'READER') {
      const updated = await prisma.user.update({
        where: { id: user.id },
        data: { role: 'AUTHOR' },
        select: { role: true },
      });
      newRole = updated.role;
    }


    return res.status(201).json({
      message: 'Novel created successfully',
      novel,
      newRole,
    });
  } catch (err: any) {
    console.error('createNovel error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
}

export async function listNovels(req: Request, res: Response) {
  try {
    const q = typeof req.query.q === 'string' ? req.query.q : undefined;
    const authorId = req.query.authorId ? Number(req.query.authorId) : undefined;
    const status = typeof req.query.status === 'string' ? req.query.status : undefined;
    const page = req.query.page ? Number(req.query.page) : undefined;
    const limit = req.query.limit ? Number(req.query.limit) : undefined;


    const requester = (req as any).user ? { id: (req as any).user.id, role: (req as any).user.role } : null;


    const result = await novelService.findNovels({
      q,
      authorId,
      status,
      page,
      limit,
      requester,
    });


    return res.json(result);
  } catch (err: any) {
    console.error('listNovels error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
}


export async function getNovel(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) return res.status(400).json({ error: 'Invalid id' });


    const novel = await novelService.getNovelById(id);
    if (!novel) return res.status(404).json({ error: 'Not found' });


// access control: if not published, only author or moderator/admin can see
    if (novel.status !== 'PUBLISHED') {
      const user = (req as any).user;
      if (!user) return res.status(403).json({ error: 'Forbidden' });
      if (user.id !== novel.authorId && !['MODERATOR', 'ADMIN'].includes(user.role)) {
        return res.status(403).json({ error: 'Forbidden' });
      }
    }


    return res.json({ novel });
  } catch (err: any) {
    console.error('getNovel error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
}

export async function publishNovel(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) return res.status(400).json({ error: 'Invalid id' });


    const user = (req as any).user;
    if (!user) return res.status(401).json({ error: 'Unauthorized' });


// author-only publish
    const novel = await prisma.novel.findUnique({ where: { id } });
    if (!novel) return res.status(404).json({ error: 'Novel not found' });
    if (novel.authorId !== user.id) return res.status(403).json({ error: 'Forbidden' });


    const result = await publishService.attemptPublish(id, user.id);
    if (result.ok) return res.json({ ok: true, status: result.status });
    return res.status(200).json({ ok: false, status: result.status, reasons: result.reasons, details: result.details });
  } catch (err: any) {
    console.error('publishNovel error:', err);
    if (err?.code === 'NOVEL_NOT_FOUND') return res.status(404).json({ error: 'Novel not found' });
    if (err?.code === 'FORBIDDEN') return res.status(403).json({ error: 'Forbidden' });
    return res.status(500).json({ error: 'Server error' });
  }
}

// updateNovel & deleteNovel
export async function updateNovel(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) return res.status(400).json({ error: 'Invalid id' });


    const user = (req as any).user;
    if (!user) return res.status(401).json({ error: 'Unauthorized' });


    const novel = await novelService.getNovelById(id);
    if (!novel) return res.status(404).json({ error: 'Novel not found' });


    if (user.id !== novel.authorId && user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Forbidden' });
    }


    const { title, description, coverUrl } = req.body ?? {};
    const updates: any = {};


    if (typeof title !== 'undefined') {
      if (!validateTitle(title)) return res.status(400).json({ error: 'Invalid title (3-250 chars)' });
      updates.title = stripTags(String(title).trim());
    }


    if (typeof description !== 'undefined') {
      if (description !== null && (typeof description !== 'string' || description.trim().length > 2000)) {
        return res.status(400).json({ error: 'description max 2000 chars' });
      }
      updates.description = description ? stripTags(String(description).trim()) : null;
    }


    if (typeof coverUrl !== 'undefined') {
      if (coverUrl !== null && !isValidUrl(coverUrl)) {
        return res.status(400).json({ error: 'coverUrl must be a valid URL' });
      }
      updates.coverUrl = coverUrl ?? null;
    }


    if (Object.keys(updates).length === 0) return res.status(400).json({ error: 'No fields to update' });


    const updated = await novelService.updateNovel(id, updates);
    return res.json({ novel: updated });
  } catch (err: any) {
    console.error('updateNovel error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
}


export async function deleteNovel(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) return res.status(400).json({ error: 'Invalid id' });


    const user = (req as any).user;
    if (!user) return res.status(401).json({ error: 'Unauthorized' });


    const novel = await novelService.getNovelById(id);
    if (!novel) return res.status(404).json({ error: 'Novel not found' });


    if (user.id !== novel.authorId && user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Forbidden' });
    }


    await novelService.deleteNovel(id);
    return res.json({ ok: true });
  } catch (err: any) {
    console.error('deleteNovel error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
}