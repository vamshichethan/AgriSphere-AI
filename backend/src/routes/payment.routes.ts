import { Router } from 'express';

// Payment webhook route (Razorpay calls this directly)
const router = Router();

router.post('/webhook', (req, res) => {
  // Razorpay webhook handler (extend as needed)
  console.log('💳 Razorpay webhook received:', req.body);
  res.status(200).json({ received: true });
});

export default router;
