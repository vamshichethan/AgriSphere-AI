import { Router } from 'express';
import { uploadAndDiagnose, getMyDiagnoses } from '../controllers/diagnosis.controller';
import { authenticate, authorize } from '../middleware/auth';
import { uploadLeafImage } from '../middleware/upload';

const router = Router();

router.post('/analyze', authenticate, authorize('farmer'), uploadLeafImage, uploadAndDiagnose);
router.get('/mine', authenticate, authorize('farmer'), getMyDiagnoses);

export default router;
