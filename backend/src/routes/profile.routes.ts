import { Router } from 'express';
import * as profileCtrl from '../controllers/profile.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

// ВАЖЛИВО: Ці маршрути мають бути ПЕРЕД /:id
router.get('/bookmarks', authMiddleware, profileCtrl.getBookmarks);
router.get('/history', authMiddleware, profileCtrl.getHistory);
router.post('/history', authMiddleware, profileCtrl.recordHistory);

// Protected: оновлення власного профілю
router.patch('/', authMiddleware, profileCtrl.updateProfile);

// Видалення акаунта з усіма даними
router.delete('/', authMiddleware, profileCtrl.deleteProfile);
router.delete('/:id', authMiddleware, profileCtrl.deleteProfile);

// Public: перегляд профілю по id
router.get('/:id', profileCtrl.getProfile);

export default router;