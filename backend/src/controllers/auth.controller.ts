import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { query } from '../config/db';
import { createError } from '../middleware/errorHandler';

const generateToken = (userId: string, role: string, email: string) => {
  return jwt.sign(
    { userId, role, email },
    process.env.JWT_SECRET as string,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

export const signup = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, email, password, role, state, district } = req.body;

    // Validate required fields
    if (!name || !email || !password || !role) {
      throw createError('Name, email, password, and role are required.', 400);
    }
    if (!['farmer', 'buyer'].includes(role)) {
      throw createError('Role must be farmer or buyer.', 400);
    }

    // Check if email already exists
    const existing = await query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rowCount && existing.rowCount > 0) {
      throw createError('An account with this email already exists.', 409);
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const id = uuidv4();

    const result = await query(
      `INSERT INTO users (id, name, email, password_hash, role, state, district)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, name, email, role, state, district, created_at`,
      [id, name, email, passwordHash, role, state || null, district || null]
    );

    const user = result.rows[0];
    const token = generateToken(user.id, user.role, user.email);

    res.cookie('agriflow_token', token, cookieOptions);
    res.status(201).json({
      success: true,
      message: 'Account created successfully.',
      user,
      token,
    });
  } catch (err) {
    next(err);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) throw createError('Email and password are required.', 400);

    const result = await query(
      'SELECT id, name, email, password_hash, role, state, district FROM users WHERE email = $1',
      [email]
    );
    if (!result.rowCount || result.rowCount === 0) {
      throw createError('Invalid email or password.', 401);
    }

    const user = result.rows[0];
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) throw createError('Invalid email or password.', 401);

    const token = generateToken(user.id, user.role, user.email);
    const { password_hash, ...safeUser } = user;

    res.cookie('agriflow_token', token, cookieOptions);
    res.status(200).json({
      success: true,
      message: `Welcome back, ${user.name}!`,
      user: safeUser,
      token,
    });
  } catch (err) {
    next(err);
  }
};

export const logout = (_req: Request, res: Response) => {
  res.clearCookie('agriflow_token');
  res.status(200).json({ success: true, message: 'Logged out successfully.' });
};

export const getMe = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await query(
      'SELECT id, name, email, role, state, district, created_at FROM users WHERE id = $1',
      [req.user!.userId]
    );
    if (!result.rowCount) throw createError('User not found.', 404);

    res.status(200).json({ success: true, user: result.rows[0] });
  } catch (err) {
    next(err);
  }
};
