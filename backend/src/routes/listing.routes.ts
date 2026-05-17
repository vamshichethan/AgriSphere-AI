import { Router } from 'express';
import { createListing, getListings, getMyListings, getListingById, updateListing, deleteListing } from '../controllers/listing.controller';
import { authenticate, authorize } from '../middleware/auth';
import { uploadCropImage } from '../middleware/upload';

const router = Router();

router.get('/', getListings);
router.get('/mine', authenticate, authorize('farmer'), getMyListings);
router.get('/:id', getListingById);
router.post('/', authenticate, authorize('farmer'), uploadCropImage, createListing);
router.put('/:id', authenticate, authorize('farmer'), updateListing);
router.delete('/:id', authenticate, authorize('farmer'), deleteListing);

export default router;
