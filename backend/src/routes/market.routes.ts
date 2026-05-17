import { Router, Request, Response, NextFunction } from 'express';
import { query } from '../config/db';

const router = Router();

// Get all distinct states and crops for dropdowns
router.get('/states', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await query(`SELECT DISTINCT location_state AS state FROM listings ORDER BY state`);
    res.json({ success: true, states: result.rows.map(r => r.state) });
  } catch (err) { next(err); }
});

// Simulated market price data (replace with eNAM / Agmarknet API later)
router.get('/prices', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { state, crop } = req.query;

    const result = await query(
      `SELECT crop_name, location_state,
              AVG(price_per_quintal) AS avg_price,
              MIN(price_per_quintal) AS min_price,
              MAX(price_per_quintal) AS max_price,
              COUNT(*) AS total_listings
       FROM listings
       WHERE status = 'active'
       ${state ? `AND location_state = $1` : ''}
       ${crop ? `AND LOWER(crop_name) ILIKE $${state ? 2 : 1}` : ''}
       GROUP BY crop_name, location_state
       ORDER BY avg_price DESC`,
      [state, crop ? `%${crop}%` : undefined].filter(Boolean)
    );

    res.json({ success: true, market_prices: result.rows });
  } catch (err) { next(err); }
});

export default router;
