import { Request, Response, NextFunction } from 'express';
import axios from 'axios';
import { query } from '../config/db';
import { createError } from '../middleware/errorHandler';

const fallbackHistoricalYield = [
  { state: 'Maharashtra', district: 'Pune', crop_year: 2018, season: 'Rabi', crop: 'Wheat', area_hectares: 1200, production_quintals: 3900, yield_quintals_per_hectare: 3.25 },
  { state: 'Maharashtra', district: 'Pune', crop_year: 2019, season: 'Rabi', crop: 'Wheat', area_hectares: 1240, production_quintals: 4216, yield_quintals_per_hectare: 3.40 },
  { state: 'Maharashtra', district: 'Pune', crop_year: 2020, season: 'Rabi', crop: 'Wheat', area_hectares: 1180, production_quintals: 3894, yield_quintals_per_hectare: 3.30 },
  { state: 'Maharashtra', district: 'Pune', crop_year: 2021, season: 'Rabi', crop: 'Wheat', area_hectares: 1300, production_quintals: 4615, yield_quintals_per_hectare: 3.55 },
  { state: 'Maharashtra', district: 'Pune', crop_year: 2022, season: 'Rabi', crop: 'Wheat', area_hectares: 1280, production_quintals: 4736, yield_quintals_per_hectare: 3.70 },
  { state: 'Maharashtra', district: 'Pune', crop_year: 2023, season: 'Rabi', crop: 'Wheat', area_hectares: 1350, production_quintals: 5265, yield_quintals_per_hectare: 3.90 },
  { state: 'Karnataka', district: 'Mandya', crop_year: 2023, season: 'Kharif', crop: 'Rice', area_hectares: 2200, production_quintals: 9460, yield_quintals_per_hectare: 4.30 },
  { state: 'Punjab', district: 'Ludhiana', crop_year: 2023, season: 'Rabi', crop: 'Wheat', area_hectares: 3200, production_quintals: 14400, yield_quintals_per_hectare: 4.50 },
];

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

    if (result.rowCount && result.rowCount > 0) {
      res.status(200).json({ success: true, data: result.rows, total: result.rowCount });
      return;
    }

    const filteredFallback = fallbackHistoricalYield.filter((row) => {
      if (state && row.state !== state) return false;
      if (crop && row.crop.toLowerCase() !== String(crop).toLowerCase()) return false;
      if (season && row.season.toLowerCase() !== String(season).toLowerCase()) return false;
      if (from_year && row.crop_year < Number(from_year)) return false;
      if (to_year && row.crop_year > Number(to_year)) return false;
      return true;
    });

    res.status(200).json({ success: true, data: filteredFallback, total: filteredFallback.length, source: 'fallback' });
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

    const fallbackStates = [...new Set(fallbackHistoricalYield.map((row) => row.state))].sort();
    const fallbackCrops = [...new Set(fallbackHistoricalYield.map((row) => row.crop))].sort();
    const fallbackSeasons = [...new Set(fallbackHistoricalYield.map((row) => row.season))].sort();

    res.status(200).json({
      success: true,
      states: states.rowCount ? states.rows.map(r => r.state) : fallbackStates,
      crops: crops.rowCount ? crops.rows.map(r => r.crop) : fallbackCrops,
      seasons: seasons.rowCount ? seasons.rows.map(r => r.season) : fallbackSeasons,
    });
  } catch (err) {
    next(err);
  }
};
