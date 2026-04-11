import { Router } from 'express';
import * as notificationCtrl from '../controllers/notification.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

router.use(authMiddleware);

router.get('/', notificationCtrl.getNotifications);
router.patch('/:id/read', notificationCtrl.markAsRead);
router.post('/read-all', notificationCtrl.markAllAsRead);

export default router;