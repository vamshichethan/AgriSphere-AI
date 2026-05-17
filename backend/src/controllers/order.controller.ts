import { Request, Response, NextFunction } from 'express';
import { query } from '../config/db';
import { createError } from '../middleware/errorHandler';
import { v4 as uuidv4 } from 'uuid';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import { emitToUser } from '../config/socket';

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID as string,
  key_secret: process.env.RAZORPAY_KEY_SECRET as string,
});

export const createOrder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { listing_id, quantity_ordered } = req.body;
    if (!listing_id || !quantity_ordered) throw createError('Listing ID and quantity are required.', 400);

    // Fetch listing and validate availability
    const listingResult = await query(
      `SELECT * FROM listings WHERE id = $1 AND status = 'active'`,
      [listing_id]
    );
    if (!listingResult.rowCount) throw createError('Listing not available.', 404);

    const listing = listingResult.rows[0];
    if (quantity_ordered > listing.quantity_quintals) {
      throw createError(`Only ${listing.quantity_quintals} quintals available.`, 400);
    }

    const totalAmount = listing.price_per_quintal * quantity_ordered;
    const amountInPaise = Math.round(totalAmount * 100);
    const orderId = uuidv4();

    // Create Razorpay order
    const razorpayOrder = await razorpay.orders.create({
      amount: amountInPaise,
      currency: 'INR',
      receipt: orderId,
    });

    // Store order in DB
    await query(
      `INSERT INTO orders (id, buyer_id, listing_id, quantity_ordered, total_amount, razorpay_order_id)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [orderId, req.user!.userId, listing_id, quantity_ordered, totalAmount, razorpayOrder.id]
    );

    res.status(201).json({
      success: true,
      order: { id: orderId, total_amount: totalAmount, razorpay_order_id: razorpayOrder.id },
      razorpay_key: process.env.RAZORPAY_KEY_ID,
    });
  } catch (err) {
    next(err);
  }
};

export const verifyPayment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, order_id } = req.body;

    // Verify HMAC signature
    const body = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSig = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET as string)
      .update(body)
      .digest('hex');

    if (expectedSig !== razorpay_signature) {
      throw createError('Payment verification failed. Invalid signature.', 400);
    }

    // Fetch order for amount & farmer notification
    const orderResult = await query(
      `SELECT o.*, l.farmer_id, l.crop_name, l.quantity_quintals, l.price_per_quintal
       FROM orders o JOIN listings l ON o.listing_id = l.id
       WHERE o.id = $1`,
      [order_id]
    );
    if (!orderResult.rowCount) throw createError('Order not found.', 404);
    const order = orderResult.rows[0];

    const paymentId = uuidv4();
    // Mark order as paid
    await query(`UPDATE orders SET status = 'paid' WHERE id = $1`, [order_id]);
    // Deduct stock from listing
    await query(
      `UPDATE listings SET quantity_quintals = quantity_quintals - $1 WHERE id = $2`,
      [order.quantity_ordered, order.listing_id]
    );
    // Record payment
    await query(
      `INSERT INTO payments (id, order_id, transaction_id, payment_status, amount_paid)
       VALUES ($1, $2, $3, 'paid', $4)`,
      [paymentId, order_id, razorpay_payment_id, order.total_amount]
    );

    // Notify farmer via socket
    emitToUser(order.farmer_id, 'order:new', {
      message: `New order received for ${order.crop_name}!`,
      order_id,
      amount: order.total_amount,
    });

    res.status(200).json({ success: true, message: 'Payment verified and order confirmed.' });
  } catch (err) {
    next(err);
  }
};

export const getMyOrders = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const role = req.user!.role;
    const field = role === 'buyer' ? 'o.buyer_id' : 'l.farmer_id';

    const result = await query(
      `SELECT o.*, l.crop_name, l.price_per_quintal, l.image_url,
              u.name AS farmer_name
       FROM orders o
       JOIN listings l ON o.listing_id = l.id
       JOIN users u ON l.farmer_id = u.id
       WHERE ${field} = $1
       ORDER BY o.created_at DESC`,
      [req.user!.userId]
    );
    res.status(200).json({ success: true, orders: result.rows });
  } catch (err) {
    next(err);
  }
};
