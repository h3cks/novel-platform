import { Router } from 'express';
import {
  getStats,
  getUsers,
  blockUser,
  changeRole,
  blockNovel,
  createGenre,
  createTag,
  sendBroadcast,
  getNovels,
  getUserDetail,
  getAdminNovelDetail,
  getTags,
  getGenres,
  deleteTag,
  deleteGenre
} from '../controllers/admin.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { requireRole } from '../middlewares/role.middleware';

const router = Router();

router.use(authMiddleware);
router.use(requireRole(['ADMIN', 'MODERATOR']));

// Статистика та користувачі
router.get('/stats', getStats);
router.get('/users', getUsers);
router.get('/users/:userId', getUserDetail);
router.get('/novels', getNovels);
router.get('/novels/:novelId/detail', getAdminNovelDetail);

router.patch('/users/:userId/role', changeRole);
router.post('/users/:userId/block', blockUser);

// Жанри та теги
router.get('/genres', getGenres);
router.delete('/genres/:id', deleteGenre);
router.get('/tags', getTags);
router.delete('/tags/:id', deleteTag);

// Управління контентом (
router.post('/novels/:novelId/block', blockNovel);
router.post('/genres', createGenre);
router.post('/tags', createTag);

// Системні сповіщення
router.post('/broadcast', sendBroadcast);

export default router;