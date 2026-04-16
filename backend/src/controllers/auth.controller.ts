import { Request, Response } from 'express';
import * as authService from '../services/auth.service';
import { isEmail, isPasswordValid, isUsernameValid } from '../utils/validators';
import { ok, fail } from '../utils/response';
import { asyncHandler } from '../middlewares/asyncHandler';
import prisma from '../prisma/client';

export const register = asyncHandler(async (req: Request, res: Response) => {
  const { username, email, password } = req.body;

  if (!password || !isPasswordValid(password)) {
    return fail(
      res,
      400,
      'INVALID_PASSWORD',
      'Password must be at least 8 chars, include uppercase, lowercase, digit, special char',
    );
  }

  if (email && !isEmail(email)) {
    return fail(res, 400, 'INVALID_EMAIL', 'Invalid email format');
  }

  if (username && !isUsernameValid(username)) {
    return fail(
      res,
      400,
      'INVALID_USERNAME',
      'Username must be 3-30 chars, letters, digits, underscores only',
    );
  }

  if (!email && !username) {
    return fail(res, 400, 'MISSING_IDENTIFIER', 'Either email or username is required');
  }

  try {
    const user = await authService.registerUser({ username, email, password });
    return ok(res, { user }, undefined, 201);
  } catch (err: any) {
    if (err.code === 'EMAIL_TAKEN' || err.code === 'USERNAME_TAKEN') {
      return fail(res, 409, err.code, err.message);
    }
    if (err.code === 'EMAIL_SEND_FAILED') {
      return fail(
        res,
        502,
        'EMAIL_SEND_FAILED',
        'Failed to send confirmation email, try again later',
      );
    }
    throw err;
  }
});

export const confirmEmail = asyncHandler(async (req: Request, res: Response) => {
  const { token } = req.query;
  if (!token || typeof token !== 'string') {
    return fail(res, 400, 'MISSING_TOKEN', 'Missing token');
  }
  const user = await authService.confirmEmail(token);
  return ok(res, { message: 'Email підтверджено успішно ✅', user });
});

export const resendConfirmation = asyncHandler(async (req: Request, res: Response) => {
  const { email } = req.body;
  if (!email) return fail(res, 400, 'EMAIL_REQUIRED', 'Email required');
  if (!isEmail(email)) return fail(res, 400, 'INVALID_EMAIL', 'Invalid email format');
  try {
    await authService.resendConfirmation(email);
    return ok(res, { ok: true });
  } catch (err: any) {
    return fail(res, 500, 'RESEND_FAILED', 'Unable to resend confirmation');
  }
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { identifier, email, username, password } = req.body;
  const id = identifier ?? email ?? username;
  if (!id || !password) {
    return fail(
      res,
      400,
      'MISSING_FIELDS',
      'Missing identifier (identifier|email|username) or password',
    );
  }

  try {
    const { token, user } = await authService.login(id, password);

    // Встановлюємо HttpOnly cookie для middleware
    res.cookie('token', token, {
      httpOnly: true, // Забороняє доступ з JS (захист від XSS)
      secure: process.env.NODE_ENV === 'production', // Працює тільки через HTTPS у продакшені
      sameSite: 'lax', // Дозволяє передавати куку при переходах
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 днів (повинно збігатися з терміном дії JWT)
    });

    return ok(res, { token, user });
  } catch (err: any) {
    if (err.code === 'INVALID_CREDENTIALS') {
      return fail(res, 401, 'INVALID_CREDENTIALS', 'Invalid credentials');
    }
    throw err;
  }
});

// Новий контролер для безпечного виходу
export const logout = asyncHandler(async (req: Request, res: Response) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  });
  return ok(res, { ok: true, message: 'Вихід успішний' });
});

export const getMe = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.userId || (req.user && req.user.id);

    if (!userId) {
      // Виправлено сигнатуру fail (додано код помилки 'UNAUTHORIZED')
      fail(res, 401, 'UNAUTHORIZED', 'Не знайдено ID користувача у запиті');
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: Number(userId) },
    });

    if (!user) {
      fail(res, 404, 'NOT_FOUND', 'Користувача не знайдено');
      return;
    }

    const { password, ...safeUser } = user;

    ok(res, { user: safeUser });
  } catch (error) {
    console.error('🔥 Помилка в контролері getMe:', error);
    fail(res, 500, 'SERVER_ERROR', 'Внутрішня помилка при завантаженні профілю');
  }
};

export const changePassword = asyncHandler(async (req: Request, res: Response) => {
  const user = (req as any).user;
  if (!user) return fail(res, 401, 'UNAUTHORIZED', 'Unauthorized');

  // Додано підтримку oldPassword для сумісності з нашим фронтендом
  const { currentPassword, oldPassword, newPassword } = req.body;
  const passwordToVerify = currentPassword || oldPassword;

  if (!passwordToVerify || !newPassword) return fail(res, 400, 'MISSING_FIELDS', 'Missing fields');
  if (!isPasswordValid(newPassword))
    return fail(res, 400, 'INVALID_PASSWORD', 'New password does not meet requirements');

  try {
    await authService.changePassword(user.id, passwordToVerify, newPassword);
    return ok(res, { ok: true, message: 'Пароль успішно змінено' });
  } catch (err: any) {
    if (err.code === 'INVALID_PASSWORD') return fail(res, 400, 'INVALID_PASSWORD', err.message);
    throw err;
  }
});

// Новий контролер для зміни Email
export const changeEmail = asyncHandler(async (req: Request, res: Response) => {
  const user = (req as any).user;
  if (!user) return fail(res, 401, 'UNAUTHORIZED', 'Unauthorized');

  const { newEmail } = req.body;

  if (!newEmail) return fail(res, 400, 'MISSING_FIELDS', 'New email is required');
  if (!isEmail(newEmail)) return fail(res, 400, 'INVALID_EMAIL', 'Invalid email format');

  try {
    const updatedUser = await authService.changeEmail(user.id, newEmail);
    return ok(res, { ok: true, user: updatedUser, message: 'Email змінено. Перевірте пошту для підтвердження.' });
  } catch (err: any) {
    if (err.code === 'EMAIL_TAKEN') {
      return fail(res, 409, 'EMAIL_TAKEN', 'This email is already in use by another account');
    }
    throw err;
  }
});

export const requestPasswordReset = asyncHandler(async (req: Request, res: Response) => {
  const { email } = req.body;
  if (!email) return fail(res, 400, 'EMAIL_REQUIRED', 'Email required');
  if (!isEmail(email)) return fail(res, 400, 'INVALID_EMAIL', 'Invalid email format');

  try {
    await authService.requestPasswordReset(email);
    return ok(res, { ok: true });
  } catch (err: any) {
    throw err;
  }
});

export const resetPassword = asyncHandler(async (req: Request, res: Response) => {
  const { token, newPassword } = req.body;
  if (!token || !newPassword) return fail(res, 400, 'MISSING_FIELDS', 'Missing fields');
  if (!isPasswordValid(newPassword))
    return fail(res, 400, 'INVALID_PASSWORD', 'New password does not meet requirements');

  try {
    await authService.resetPassword(token, newPassword);
    return ok(res, { ok: true });
  } catch (err: any) {
    if (err.code === 'TOKEN_EXPIRED' || err.code === 'INVALID_TOKEN') {
      return fail(res, 400, err.code, err.message);
    }
    throw err;
  }
});

