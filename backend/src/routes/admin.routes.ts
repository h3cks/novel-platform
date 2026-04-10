import { Router } from 'express';
import { getStats, getUsers, blockUser, changeRole } from '../controllers/admin.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { requireRole } from '../middlewares/role.middleware';

const router = Router();

// Захищаємо всі маршрути: вимагаємо токен і перевіряємо, чи є роль у масиві
router.use(authMiddleware);
router.use(requireRole(['ADMIN', 'MODERATOR']));

router.get('/stats', getStats);
router.get('/users', getUsers);
// Виправлено: :userId замість :id, щоб відповідало контролеру
router.patch('/users/:userId/role', changeRole);
router.post('/users/:userId/block', blockUser);

export default router;