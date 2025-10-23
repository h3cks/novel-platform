import { Request, Response } from 'express';
import * as authService from '../services/auth.service';
import { isEmail, isPasswordValid, isUsernameValid } from '../utils/validators';

export async function register(req: Request, res: Response) {
  try {
    const { username, email, password } = req.body;

    if (!password || !isPasswordValid(password)) {
      return res.status(400).json({ error: 'Password must be at least 8 chars, include uppercase, lowercase, digit, special char' });
    }

    if (email && !isEmail(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    if (username && !isUsernameValid(username)) {
      return res.status(400).json({ error: 'Username must be 3-30 chars, letters, digits, underscores only' });
    }

    if (!email && !username) {
      return res.status(400).json({ error: 'Either email or username is required' });
    }

    const user = await authService.registerUser({ username, email, password });
    return res.status(201).json({ user });
  } catch (err: any) {
    if (err.code === 'EMAIL_TAKEN' || err.code === 'USERNAME_TAKEN') {
      return res.status(409).json({ error: err.message });
    }
    return res.status(400).json({ error: err.message || 'Registration failed' });
  }
}

export async function confirmEmail(req: Request, res: Response) {
  try {
    const { token } = req.query;
    if (!token || typeof token !== 'string') {
      return res.status(400).send('Missing token');
    }
    const user = await authService.confirmEmail(token);

    return res.json({
      message: 'Email підтверджено успішно ✅',
      user,
    });
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
}

export async function resendConfirmation(req: Request, res: Response) {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email required' });
    if (!isEmail(email)) return res.status(400).json({ error: 'Invalid email format' });
    await authService.resendConfirmation(email);
    return res.json({ ok: true });
  } catch (err: any) {
    return res.status(500).json({ error: 'Unable to resend confirmation' });
  }
}

export async function login(req: Request, res: Response) {
  try {
    const { identifier, password } = req.body;
    const { token, user } = await authService.login(identifier, password);
    return res.json({ token, user });
  } catch (err: any) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
}

export async function me(req: Request, res: Response) {
  try {
    // req.user set by auth.middleware
    const user = (req as any).user;
    if (!user) return res.status(401).json({ error: 'Unauthorized' });
    return res.json({ user });
  } catch (err: any) {
    return res.status(500).json({ error: 'Server error' });
  }
}

export async function changePassword(req: Request, res: Response) {
  try {
    const user = (req as any).user;
    if (!user) return res.status(401).json({ error: 'Unauthorized' });
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) return res.status(400).json({ error: 'Missing fields' });
    if (!isPasswordValid(newPassword)) return res.status(400).json({ error: 'New password does not meet requirements' });
    await authService.changePassword(user.id, currentPassword, newPassword);
    return res.json({ ok: true });
  } catch (err: any) {
    if (err.code === 'INVALID_PASSWORD') return res.status(400).json({ error: err.message });
    return res.status(500).json({ error: 'Server error' });
  }
}

export async function requestPasswordReset(req: Request, res: Response) {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email required' });
    if (!isEmail(email)) return res.status(400).json({ error: 'Invalid email format' });
    await authService.requestPasswordReset(email);
    return res.json({ ok: true });
  } catch (err: any) {
    return res.status(500).json({ error: 'Server error' });
  }
}

export async function resetPassword(req: Request, res: Response) {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) return res.status(400).json({ error: 'Missing fields' });
    if (!isPasswordValid(newPassword)) return res.status(400).json({ error: 'New password does not meet requirements' });
    await authService.resetPassword(token, newPassword);
    return res.json({ ok: true });
  } catch (err: any) {
    if (err.code === 'TOKEN_EXPIRED' || err.code === 'INVALID_TOKEN') {
      return res.status(400).json({ error: err.message });
    }
    return res.status(500).json({ error: 'Server error' });
  }
}
