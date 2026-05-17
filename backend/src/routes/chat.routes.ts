import { Router } from 'express';
import { chatWithBot } from '../controllers/chat.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.post('/', authenticate, chatWithBot);

export default router;
