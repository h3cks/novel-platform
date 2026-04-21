import { Router } from 'express';
import {
  getStats,
  getUsers,
  blockUser,
  changeRole,
  blockNovel,
  createGenre,
  createTag,
  sendBroadcast
} from '../controllers/admin.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { requireRole } from '../middlewares/role.middleware';

const router = Router();

router.use(authMiddleware);
router.use(requireRole(['ADMIN', 'MODERATOR']));

// Статистика та користувачі
router.get('/stats', getStats);
router.get('/users', getUsers);
router.patch('/users/:userId/role', changeRole);
router.post('/users/:userId/block', blockUser);

// Управління контентом (
router.post('/novels/:novelId/block', blockNovel);
router.post('/genres', createGenre);
router.post('/tags', createTag);

// Системні сповіщення
router.post('/broadcast', sendBroadcast);

export default router;