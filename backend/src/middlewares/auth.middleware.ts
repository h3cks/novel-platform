import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import * as config from '../config';
import prisma from '../prisma/client';

declare global {
  namespace Express {
    interface Request {
      user?: any;
      userId?: number;
    }
  }
}

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    let token: string | undefined;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    } else if (authHeader) {
      token = authHeader;
    }

    if (!token) {
      res.status(401).json({ success: false, message: 'Не авторизовано. Токен відсутній.' });
      return;
    }

    const secret = (config as any).JWT_SECRET || (config as any).jwtSecret || process.env.JWT_SECRET || 'secret';

    // Розумне декодування
    const decoded = jwt.verify(token, secret) as any;
    const tokenUserId = decoded.id || decoded.userId || decoded.sub;

    if (!tokenUserId) {
      res.status(401).json({ success: false, message: 'Недійсний формат токена (відсутній ID).' });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: Number(tokenUserId) },
      select: { id: true, role: true, email: true, username: true }
    });

    if (!user) {
      res.status(401).json({ success: false, message: 'Користувача більше не існує.' });
      return;
    }

    req.user = user;
    req.userId = user.id;
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({ success: false, message: 'Час дії токена минув. Увійдіть знову.' });
    } else if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({ success: false, message: 'Недійсний токен авторизації.' });
    } else {
      console.error('Auth Middleware Error:', error);
      res.status(500).json({ success: false, message: 'Внутрішня помилка сервера при перевірці токена.' });
    }
  }
};