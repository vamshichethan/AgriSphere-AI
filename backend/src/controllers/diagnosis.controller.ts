import { Request, Response, NextFunction } from 'express';
import { query } from '../config/db';
import { createError } from '../middleware/errorHandler';
import cloudinary from '../config/cloudinary';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';

export const uploadAndDiagnose = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.file) throw createError('Leaf image is required.', 400);

    const farmerId = req.user!.userId;

    // 1. Upload image buffer to Cloudinary
    const uploadResult = await new Promise<{ secure_url: string }>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: 'agriflow/diagnoses', resource_type: 'image' },
        (error, result) => {
          if (error || !result) return reject(createError('Image upload failed.', 500));
          resolve(result as { secure_url: string });
        }
      );
      stream.end(req.file!.buffer);
    });

    const imageUrl = uploadResult.secure_url;

    // 2. Send image URL to FastAPI ML service for classification
    const mlResponse = await axios.post(`${process.env.ML_SERVICE_URL}/predict/disease`, {
      image_url: imageUrl,
    });

    const { crop, disease, confidence } = mlResponse.data;

    // 3. Fetch treatment info from disease catalogue
    const catalogResult = await query(
      `SELECT id, symptoms, organic_treatment, chemical_treatment, prevention_measures
       FROM disease_catalogue
       WHERE LOWER(crop_name) = LOWER($1) AND LOWER(disease_name) = LOWER($2)
       LIMIT 1`,
      [crop, disease]
    );

    const treatment = catalogResult.rows[0] || null;
    const id = uuidv4();

    // 4. Log diagnosis to DB
    await query(
      `INSERT INTO disease_diagnoses (id, farmer_id, image_url, crop_detected, disease_detected, confidence_score, catalog_disease_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [id, farmerId, imageUrl, crop, disease, confidence, treatment?.id || null]
    );

    res.status(200).json({
      success: true,
      diagnosis: {
        id,
        imageUrl,
        crop,
        disease,
        confidence: parseFloat((confidence * 100).toFixed(2)),
        treatment,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const getMyDiagnoses = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await query(
      `SELECT d.*, dc.symptoms, dc.organic_treatment, dc.chemical_treatment, dc.prevention_measures
       FROM disease_diagnoses d
       LEFT JOIN disease_catalogue dc ON d.catalog_disease_id = dc.id
       WHERE d.farmer_id = $1
       ORDER BY d.created_at DESC
       LIMIT 20`,
      [req.user!.userId]
    );

    res.status(200).json({ success: true, diagnoses: result.rows });
  } catch (err) {
    next(err);
  }
};
