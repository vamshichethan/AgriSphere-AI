import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { query } from '../config/db';

const router = Router();

router.get('/profile', authenticate, async (req, res, next) => {
  try {
    const result = await query(
      'SELECT id, name, email, role, state, district, created_at FROM users WHERE id = $1',
      [req.user!.userId]
    );
    res.json({ success: true, user: result.rows[0] });
  } catch (err) { next(err); }
});

router.put('/profile', authenticate, async (req, res, next) => {
  try {
    const { name, state, district } = req.body;
    const result = await query(
      `UPDATE users SET
        name = COALESCE($1, name),
        state = COALESCE($2, state),
        district = COALESCE($3, district)
       WHERE id = $4 RETURNING id, name, email, role, state, district`,
      [name, state, district, req.user!.userId]
    );
    res.json({ success: true, user: result.rows[0] });
  } catch (err) { next(err); }
});

export default router;
