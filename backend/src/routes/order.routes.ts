import { Router } from 'express';
import { createOrder, verifyPayment, getMyOrders } from '../controllers/order.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.post('/', authenticate, createOrder);
router.post('/verify-payment', authenticate, verifyPayment);
router.get('/mine', authenticate, getMyOrders);

export default router;
