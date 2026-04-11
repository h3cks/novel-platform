import { Router } from 'express';
import * as novelCtrl from '../controllers/novel.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
// Додаємо authOptional, якщо його тут ще немає
import { authOptional } from '../middlewares/authOptional.middleware';

const router = Router();

router.post('/', authMiddleware, novelCtrl.createNovel);
router.get('/', authOptional, novelCtrl.listNovels);

// ВИПРАВЛЕНО: замінено authMiddleware на authOptional (або можна взагалі прибрати мідлвару)
router.get('/latest-updates', authOptional, novelCtrl.getLatestUpdates);

router.get('/:id', authOptional, novelCtrl.getNovel);
router.post('/:id/publish', authMiddleware, novelCtrl.publishNovel);
router.patch('/:id', authMiddleware, novelCtrl.updateNovel);
router.delete('/:id', authMiddleware, novelCtrl.deleteNovel);

export default router;