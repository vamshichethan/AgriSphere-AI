import { Request, Response, NextFunction } from 'express';
import axios from 'axios';
import { query } from '../config/db';
import { createError } from '../middleware/errorHandler';

export const predictYield = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { state, district, crop, season, area_hectares } = req.body;

    if (!state || !district || !crop || !season || !area_hectares) {
      throw createError('State, district, crop, season, and area are required.', 400);
    }

    const mlResponse = await axios.post(`${process.env.ML_SERVICE_URL}/predict/yield`, {
      state, district, crop, season, area_hectares: Number(area_hectares),
    });

    res.status(200).json({ success: true, prediction: mlResponse.data });
  } catch (err) {
    next(err);
  }
};

export const getHistoricalYield = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { state, crop, season, from_year, to_year } = req.query;

    let where = `WHERE 1=1`;
    const params: unknown[] = [];
    let pc = 1;

    if (state) { where += ` AND state = $${pc++}`; params.push(state); }
    if (crop) { where += ` AND LOWER(crop) = LOWER($${pc++})`; params.push(crop); }
    if (season) { where += ` AND LOWER(season) = LOWER($${pc++})`; params.push(season); }
    if (from_year) { where += ` AND crop_year >= $${pc++}`; params.push(Number(from_year)); }
    if (to_year) { where += ` AND crop_year <= $${pc++}`; params.push(Number(to_year)); }

    const result = await query(
      `SELECT state, district, crop_year, season, crop,
              area_hectares, production_quintals, yield_quintals_per_hectare
       FROM crop_yields_historical
       ${where}
       ORDER BY crop_year DESC
       LIMIT 500`,
      params
    );

    res.status(200).json({ success: true, data: result.rows, total: result.rowCount });
  } catch (err) {
    next(err);
  }
};

export const getTopCrops = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { state } = req.query;
    const params: unknown[] = [];

    const result = await query(
      `SELECT crop, AVG(yield_quintals_per_hectare) AS avg_yield,
              SUM(production_quintals) AS total_production
       FROM crop_yields_historical
       ${state ? `WHERE state = $1` : ''}
       GROUP BY crop
       ORDER BY avg_yield DESC
       LIMIT 10`,
      state ? [state] : params
    );

    res.status(200).json({ success: true, top_crops: result.rows });
  } catch (err) {
    next(err);
  }
};

export const getFilterOptions = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const [states, crops, seasons] = await Promise.all([
      query(`SELECT DISTINCT state FROM crop_yields_historical ORDER BY state`),
      query(`SELECT DISTINCT crop FROM crop_yields_historical ORDER BY crop`),
      query(`SELECT DISTINCT season FROM crop_yields_historical ORDER BY season`),
    ]);

    res.status(200).json({
      success: true,
      states: states.rows.map(r => r.state),
      crops: crops.rows.map(r => r.crop),
      seasons: seasons.rows.map(r => r.season),
    });
  } catch (err) {
    next(err);
  }
};
