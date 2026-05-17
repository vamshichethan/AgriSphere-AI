import { Request, Response, NextFunction } from 'express';
import { query } from '../config/db';
import { createError } from '../middleware/errorHandler';
import cloudinary from '../config/cloudinary';
import { v4 as uuidv4 } from 'uuid';
import { emitToUser } from '../config/socket';

export const createListing = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { crop_name, quantity_quintals, price_per_quintal, location_state, location_district, description } = req.body;

    if (!crop_name || !quantity_quintals || !price_per_quintal || !location_state || !location_district) {
      throw createError('All listing fields are required.', 400);
    }

    let imageUrl: string | null = null;

    // Upload crop image if provided
    if (req.file) {
      const uploadResult = await new Promise<{ secure_url: string }>((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: 'agriflow/listings', resource_type: 'image' },
          (error, result) => {
            if (error || !result) return reject(createError('Image upload failed.', 500));
            resolve(result as { secure_url: string });
          }
        );
        stream.end(req.file!.buffer);
      });
      imageUrl = uploadResult.secure_url;
    }

    const id = uuidv4();
    const result = await query(
      `INSERT INTO listings (id, farmer_id, crop_name, quantity_quintals, price_per_quintal,
        location_state, location_district, description, image_url)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [id, req.user!.userId, crop_name, quantity_quintals, price_per_quintal, location_state, location_district, description || null, imageUrl]
    );

    res.status(201).json({ success: true, listing: result.rows[0] });
  } catch (err) {
    next(err);
  }
};

export const getListings = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { state, crop, min_price, max_price, page = 1, limit = 12 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    let whereClause = `WHERE l.status = 'active'`;
    const params: unknown[] = [];
    let paramCount = 1;

    if (state) { whereClause += ` AND l.location_state = $${paramCount++}`; params.push(state); }
    if (crop) { whereClause += ` AND LOWER(l.crop_name) ILIKE $${paramCount++}`; params.push(`%${crop}%`); }
    if (min_price) { whereClause += ` AND l.price_per_quintal >= $${paramCount++}`; params.push(Number(min_price)); }
    if (max_price) { whereClause += ` AND l.price_per_quintal <= $${paramCount++}`; params.push(Number(max_price)); }

    const countResult = await query(`SELECT COUNT(*) FROM listings l ${whereClause}`, params);
    const total = parseInt(countResult.rows[0].count);

    params.push(Number(limit), offset);
    const result = await query(
      `SELECT l.*, u.name AS farmer_name, u.state AS farmer_state
       FROM listings l
       JOIN users u ON l.farmer_id = u.id
       ${whereClause}
       ORDER BY l.created_at DESC
       LIMIT $${paramCount} OFFSET $${paramCount + 1}`,
      params
    );

    res.status(200).json({
      success: true,
      listings: result.rows,
      pagination: { total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / Number(limit)) },
    });
  } catch (err) {
    next(err);
  }
};

export const getMyListings = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await query(
      `SELECT *
       FROM listings
       WHERE farmer_id = $1
       ORDER BY created_at DESC`,
      [req.user!.userId]
    );

    res.status(200).json({ success: true, listings: result.rows });
  } catch (err) {
    next(err);
  }
};

export const getListingById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await query(
      `SELECT l.*, u.name AS farmer_name, u.state AS farmer_state, u.district AS farmer_district
       FROM listings l JOIN users u ON l.farmer_id = u.id
       WHERE l.id = $1`,
      [req.params.id]
    );
    if (!result.rowCount) throw createError('Listing not found.', 404);
    res.status(200).json({ success: true, listing: result.rows[0] });
  } catch (err) {
    next(err);
  }
};

export const updateListing = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { price_per_quintal, quantity_quintals, status } = req.body;
    const result = await query(
      `UPDATE listings SET price_per_quintal = COALESCE($1, price_per_quintal),
        quantity_quintals = COALESCE($2, quantity_quintals),
        status = COALESCE($3, status)
       WHERE id = $4 AND farmer_id = $5
       RETURNING *`,
      [price_per_quintal, quantity_quintals, status, req.params.id, req.user!.userId]
    );
    if (!result.rowCount) throw createError('Listing not found or unauthorized.', 404);
    res.status(200).json({ success: true, listing: result.rows[0] });
  } catch (err) {
    next(err);
  }
};

export const deleteListing = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await query(
      `DELETE FROM listings WHERE id = $1 AND farmer_id = $2 RETURNING id`,
      [req.params.id, req.user!.userId]
    );
    if (!result.rowCount) throw createError('Listing not found or unauthorized.', 404);
    res.status(200).json({ success: true, message: 'Listing deleted successfully.' });
  } catch (err) {
    next(err);
  }
};
