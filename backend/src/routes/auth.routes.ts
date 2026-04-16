import { Router } from 'express';
import * as authCtrl from '../controllers/auth.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { loginRateLimiter, softRateLimiter } from '../middlewares/rateLimit.middleware';

const router = Router();

router.post('/register', authCtrl.register);
router.get('/confirm', authCtrl.confirmEmail);
router.post('/resend-confirmation', softRateLimiter, authCtrl.resendConfirmation);

router.post('/login', loginRateLimiter, authCtrl.login);
router.post('/logout', authCtrl.logout);

router.post('/request-password-reset', softRateLimiter, authCtrl.requestPasswordReset);
router.post('/reset-password', authCtrl.resetPassword);

router.get('/me', authMiddleware, authCtrl.getMe);
router.patch('/change-password', authMiddleware, authCtrl.changePassword);

router.patch('/change-email', authMiddleware, authCtrl.changeEmail);
export default router;
