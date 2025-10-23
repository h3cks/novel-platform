import { Request, Response } from 'express';
import * as chapterService from '../services/chapter.service';
import prisma from '../prisma/client';
import { sanitizeContent, countWordsFromHtml } from '../utils/text';
import { MIN_WORDS_PER_CHAPTER } from '../config';


function validateTitle(title: any) {
  return typeof title === 'string' && title.trim().length >= 1 && title.trim().length <= 250;
}


function validateContent(content: any) {
  return typeof content === 'string' && content.trim().length > 0;
}


export async function createChapter(req: Request, res: Response) {
  try {
    const novelId = Number(req.params.novelId);
    if (!Number.isInteger(novelId) || novelId <= 0) return res.status(400).json({ error: 'Invalid novelId' });


    const user = (req as any).user;
    if (!user) return res.status(401).json({ error: 'Unauthorized' });


// Permissions: only the author may create chapters (admins and moderators cannot create content)
    const novel = await prisma.novel.findUnique({ where: { id: novelId } });
    if (!novel) return res.status(404).json({ error: 'Novel not found' });


    if (user.role === 'ADMIN' || user.role === 'MODERATOR') {
      return res.status(403).json({ error: 'Admins and moderators cannot create chapters' });
    }
    if (user.id !== novel.authorId) {
      return res.status(403).json({ error: 'Forbidden' });
    }


    const { title, content } = req.body ?? {};
    if (!validateTitle(title)) return res.status(400).json({ error: 'Invalid title' });
    if (!validateContent(content)) return res.status(400).json({ error: 'Content required' });


// sanitize and count words before calling service to give immediate feedback
    const cleanContent = sanitizeContent(content);
    const wc = countWordsFromHtml(cleanContent);
    if (wc < MIN_WORDS_PER_CHAPTER) {
      return res.status(400).json({ error: `Chapter must have at least ${MIN_WORDS_PER_CHAPTER} words after sanitization` });
    }


    const chapter = await chapterService.createChapter(novelId, user.id, { title: String(title).trim(), content: cleanContent });
    return res.status(201).json({ chapter });
  } catch (err: any) {
    console.error('createChapter error:', err);
    if (err?.code === 'NOVEL_NOT_FOUND') return res.status(404).json({ error: 'Novel not found' });
    return res.status(500).json({ error: 'Server error' });
  }
}

/**
 * GET /novels/:novelId/chapters
 */
export async function listChapters(req: Request, res: Response) {
  try {
    const novelId = Number(req.params.novelId);
    if (!Number.isInteger(novelId) || novelId <= 0) return res.status(400).json({ error: 'Invalid novelId' });

    const novel = await prisma.novel.findUnique({ where: { id: novelId } });
    if (!novel) return res.status(404).json({ error: 'Novel not found' });

    // access: if novel not published -> only author/mod/moderator/admin
    if (novel.status !== 'PUBLISHED') {
      const user = (req as any).user;
      if (!user) return res.status(403).json({ error: 'Forbidden' });
      if (user.id !== novel.authorId && !['MODERATOR', 'ADMIN'].includes(user.role)) {
        return res.status(403).json({ error: 'Forbidden' });
      }
    }

    const page = req.query.page ? Number(req.query.page) : 1;
    const limit = req.query.limit ? Number(req.query.limit) : 20;
    const result = await chapterService.listChaptersByNovel(novelId, page, limit);

    // For list, we can add short excerpt (first 200 chars) by fetching content individually or leave it to front
    // Here we return metadata only (no full content)
    return res.json(result);
  } catch (err: any) {
    console.error('listChapters error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
}

/**
 * GET /novels/:novelId/chapters/:id
 */
export async function getChapter(req: Request, res: Response) {
  try {
    const novelId = Number(req.params.novelId);
    const id = Number(req.params.id);
    if (!Number.isInteger(novelId) || novelId <= 0) return res.status(400).json({ error: 'Invalid novelId' });
    if (!Number.isInteger(id) || id <= 0) return res.status(400).json({ error: 'Invalid id' });

    const chapter = await chapterService.getChapterById(id);
    if (!chapter) return res.status(404).json({ error: 'Chapter not found' });

    if (chapter.novelId !== novelId) return res.status(400).json({ error: 'Chapter does not belong to this novel' });

    // access control by novel.status
    if (chapter.novel.status !== 'PUBLISHED') {
      const user = (req as any).user;
      if (!user) return res.status(403).json({ error: 'Forbidden' });
      if (user.id !== chapter.novel.authorId && !['MODERATOR', 'ADMIN'].includes(user.role)) {
        return res.status(403).json({ error: 'Forbidden' });
      }
    }

    // record view if authenticated
    const user = (req as any).user;
    if (user) {
      try {
        await prisma.viewHistory.create({
          data: {
            userId: user.id,
            novelId: chapter.novelId,
            chapterId: chapter.id,
          },
        });
      } catch (e) {
        // don't fail request if view logging fails
        console.warn('Failed to record view', e);
      }
    }

    return res.json({ chapter });
  } catch (err: any) {
    console.error('getChapter error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
}

/**
 * PATCH /novels/:novelId/chapters/:id
 */
export async function updateChapter(req: Request, res: Response) {
  try {
    const novelId = Number(req.params.novelId);
    const id = Number(req.params.id);
    if (!Number.isInteger(novelId) || novelId <= 0) return res.status(400).json({ error: 'Invalid novelId' });
    if (!Number.isInteger(id) || id <= 0) return res.status(400).json({ error: 'Invalid id' });

    const user = (req as any).user;
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    const chapter = await chapterService.getChapterById(id);
    if (!chapter) return res.status(404).json({ error: 'Chapter not found' });
    if (chapter.novelId !== novelId) return res.status(400).json({ error: 'Chapter does not belong to this novel' });

    if (user.id !== chapter.novel.authorId && user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const { title, content } = req.body ?? {};
    if (typeof title !== 'undefined') {
      if (!validateTitle(title)) return res.status(400).json({ error: 'Invalid title' });
    }
    if (typeof content !== 'undefined') {
      if (!validateContent(content)) return res.status(400).json({ error: 'Invalid content' });
      const wc = countWordsFromHtml(content);
      if (wc < MIN_WORDS_PER_CHAPTER) {
        return res.status(400).json({ error: `Chapter must have at least ${MIN_WORDS_PER_CHAPTER} words` });
      }
    }

    const updated = await chapterService.updateChapter(id, { title, content });
    return res.json({ chapter: updated });
  } catch (err: any) {
    console.error('updateChapter error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
}

/**
 * DELETE /novels/:novelId/chapters/:id
 */
export async function deleteChapter(req: Request, res: Response) {
  try {
    const novelId = Number(req.params.novelId);
    const id = Number(req.params.id);
    if (!Number.isInteger(novelId) || novelId <= 0) return res.status(400).json({ error: 'Invalid novelId' });
    if (!Number.isInteger(id) || id <= 0) return res.status(400).json({ error: 'Invalid id' });

    const user = (req as any).user;
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    const chapter = await chapterService.getChapterById(id);
    if (!chapter) return res.status(404).json({ error: 'Chapter not found' });
    if (chapter.novelId !== novelId) return res.status(400).json({ error: 'Chapter does not belong to this novel' });

    if (user.id !== chapter.novel.authorId && user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Forbidden' });
    }

    await chapterService.deleteChapter(id);
    return res.json({ ok: true });
  } catch (err: any) {
    console.error('deleteChapter error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
}
