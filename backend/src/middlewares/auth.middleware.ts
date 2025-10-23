import { Request, Response, NextFunction } from 'express';
import jwt, { Secret, TokenExpiredError  } from 'jsonwebtoken';
import { JWT_SECRET } from '../config';
import prisma from '../prisma/client';

/**
 * Middleware to verify JWT and attach user (safeUser) to req.user
 */
export async function authMiddleware(req: Request, res: Response, next: NextFunction) {
  try {
    const header = req.headers['authorization'];

    const parts = String(header).split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return res.status(401).json({ error: 'Invalid Authorization header format' });
    }

    const token = parts[1];
    if (!token) return res.status(401).json({ error: 'Missing token' });

    const payload: any = jwt.verify(token, JWT_SECRET as Secret, { algorithms: ['HS256'] });
    if (!payload?.sub) return res.status(401).json({ error: 'Invalid token payload' });

    const user = await prisma.user.findUnique({ where: { id: Number(payload.sub) } });
    if (!user) return res.status(401).json({ error: 'User not found' });

    if (user.email && user.emailConfirmed === false) {
      return res.status(403).json({ error: 'Email not confirmed' });
    }

    (req as any).user = {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      emailConfirmed: user.emailConfirmed,
      createdAt: user.createdAt,
    };

    return next();
  } catch (err: any) {
    if (err instanceof TokenExpiredError) {
      return res.status(401).json({ error: 'Token expired' });
    }
    console.error('JWT verification failed:', err);
    return res.status(401).json({ error: 'Unauthorized' });
  }
}
