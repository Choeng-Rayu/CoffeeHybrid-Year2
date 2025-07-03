import express from 'express';
import { createOrder, getQrCode, verifyQrCode, getUserOrderHistory, getSingleOrder, cancelOrder } from '../controllers/ordersController.js';

const router = express.Router();

// Create new order
router.post('/', createOrder);

// Get QR code for order
router.get('/:orderId/qr', getQrCode);

// Verify QR code and complete order
router.post('/verify-qr', verifyQrCode);

// Get user's order history
router.get('/user/:userId', getUserOrderHistory);

// Get single order details
router.get('/:orderId', getSingleOrder);

// Cancel order (only if pending)
router.patch('/:orderId/cancel', cancelOrder);

export default router;
