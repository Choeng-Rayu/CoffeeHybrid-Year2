import express from 'express';
import { registerSeller, addProduct, getSellerProducts, updateProduct, deleteProduct, getSellerOrders, getSellerDashboardStats, getSellerAnalytics, exportOrdersCSV, exportAnalyticsCSV } from '../controllers/adminController.js';
import { requireSeller } from '../middleWare/requireSeller.js';

const router = express.Router();

// Register seller account
router.post('/register-seller', registerSeller);

// Add new product (sellers only)
router.post('/products', requireSeller, addProduct);

// Get seller's products
router.get('/products/:sellerId', getSellerProducts);

// Update product (seller's own products only)
router.put('/products/:productId', requireSeller, updateProduct);

// Delete product (seller's own products only)
router.delete('/products/:productId', requireSeller, deleteProduct);

// Get seller's orders
router.get('/orders/:sellerId', getSellerOrders);

// Get seller dashboard stats
router.get('/dashboard/:sellerId', getSellerDashboardStats);

// Get comprehensive sales analytics
router.get('/analytics/:sellerId', getSellerAnalytics);

// CSV Export routes
router.get('/export/orders/:sellerId', exportOrdersCSV);
router.get('/export/analytics/:sellerId', exportAnalyticsCSV);

export default router;
