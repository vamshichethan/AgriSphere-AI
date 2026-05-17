import multer from 'multer';
import { createError } from './errorHandler';

const storage = multer.memoryStorage();

const fileFilter = (_req: Express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(createError('Only JPEG, PNG, and WEBP images are allowed.', 400));
  }
};

// For crop disease leaf images (max 5MB)
export const uploadLeafImage = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
}).single('leaf_image');

// For crop listing product images (max 8MB)
export const uploadCropImage = multer({
  storage,
  fileFilter,
  limits: { fileSize: 8 * 1024 * 1024 },
}).single('crop_image');
