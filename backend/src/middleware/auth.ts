import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { createError } from './errorHandler';

export interface JWTPayload {
  userId: string;
  role: 'farmer' | 'buyer' | 'admin';
  email: string;
}

// Extend Express Request to carry user data
declare global {
  namespace Express {
    interface Request {
      user?: JWTPayload;
    }
  }
}

export const authenticate = (req: Request, _res: Response, next: NextFunction) => {
  try {
    const token =
      req.cookies?.agriflow_token ||
      req.headers.authorization?.split(' ')[1];

    if (!token) throw createError('Authentication required. Please log in.', 401);

    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as JWTPayload;
    req.user = decoded;
    next();
  } catch (err) {
    next(createError('Invalid or expired token. Please log in again.', 401));
  }
};

export const authorize = (...roles: Array<'farmer' | 'buyer' | 'admin'>) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(createError('You do not have permission to access this resource.', 403));
    }
    next();
  };
};
