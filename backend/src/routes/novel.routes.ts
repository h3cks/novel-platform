import { Router } from 'express';
import * as novelCtrl from '../controllers/novel.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { authOptional } from '../middlewares/authOptional.middleware';

const router = Router();

router.post('/', authMiddleware, novelCtrl.createNovel);
router.get('/', authOptional, novelCtrl.listNovels);
router.get('/latest-updates', authOptional, novelCtrl.getLatestUpdates);
router.get('/:id', authOptional, novelCtrl.getNovel);

// НОВІ РОУТИ:
router.post('/:id/rate', authMiddleware, novelCtrl.rateNovel);
router.post('/:id/bookmark', authMiddleware, novelCtrl.addBookmark);
router.delete('/:id/bookmark', authMiddleware, novelCtrl.removeBookmark);

router.post('/:id/publish', authMiddleware, novelCtrl.publishNovel);
router.patch('/:id', authMiddleware, novelCtrl.updateNovel);
router.delete('/:id', authMiddleware, novelCtrl.deleteNovel);

export default router;