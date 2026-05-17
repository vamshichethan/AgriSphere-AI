import { Router } from 'express';
import { predictYield, getHistoricalYield, getTopCrops, getFilterOptions } from '../controllers/yield.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/filters', getFilterOptions);
router.get('/historical', getHistoricalYield);
router.get('/top-crops', getTopCrops);
router.post('/predict', authenticate, predictYield);

export default router;
