import express from 'express';
import {
  getSuperAdminDashboard,
  getAllSellers,
  createSeller,
  getAllOrders,
  toggleSellerStatus
} from '../controllers/superAdminController.js';
import { validateJWT, requireAdmin } from '../middleWare/security.js';
import { body } from 'express-validator';
import { handleValidationErrors } from '../middleWare/validation.js';

const router = express.Router();

// Middleware to ensure only super admins can access these routes
const requireSuperAdmin = (req, res, next) => {
  console.log('🔍 Super Admin Middleware Debug:');
  console.log('   req.user:', req.user);
  console.log('   req.user.role:', req.user?.role);
  console.log('   Authorization header:', req.headers.authorization);

  if (!req.user || req.user.role !== 'admin') {
    console.log('❌ Access denied - User:', req.user);
    return res.status(403).json({
      success: false,
      message: 'Access denied. Super admin privileges required.',
      debug: {
        hasUser: !!req.user,
        userRole: req.user?.role,
        userId: req.user?.userId || req.user?.id
      }
    });
  }

  console.log('✅ Super admin access granted');
  next();
};

// Apply authentication and super admin check to all routes
router.use(validateJWT);
router.use(requireSuperAdmin);

/**
 * @swagger
 * /api/super-admin/dashboard:
 *   get:
 *     summary: Get super admin dashboard overview
 *     tags: [Super Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard data retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 dashboard:
 *                   type: object
 *                   properties:
 *                     overview:
 *                       type: object
 *                       properties:
 *                         totalUsers:
 *                           type: integer
 *                         totalSellers:
 *                           type: integer
 *                         totalOrders:
 *                           type: integer
 *                         totalRevenue:
 *                           type: number
 *                     ordersByStatus:
 *                       type: object
 *                     recentOrders:
 *                       type: array
 *                     topSellers:
 *                       type: array
 *       403:
 *         description: Access denied
 */
router.get('/dashboard', getSuperAdminDashboard);

/**
 * @swagger
 * /api/super-admin/sellers:
 *   get:
 *     summary: Get all sellers with statistics
 *     tags: [Super Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Items per page
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term
 *     responses:
 *       200:
 *         description: Sellers retrieved successfully
 */
router.get('/sellers', getAllSellers);

/**
 * @swagger
 * /api/super-admin/sellers:
 *   post:
 *     summary: Create new seller account
 *     tags: [Super Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - email
 *               - password
 *               - shopName
 *             properties:
 *               username:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               shopName:
 *                 type: string
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *     responses:
 *       201:
 *         description: Seller created successfully
 *       400:
 *         description: Validation error or user already exists
 */
router.post('/sellers', [
  body('username')
    .trim()
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be between 3 and 30 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscores'),
  
  body('email')
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  
  body('password')
    .isLength({ min: 6, max: 100 })
    .withMessage('Password must be between 6 and 100 characters'),
  
  body('shopName')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Shop name must be between 2 and 100 characters'),
  
  body('firstName')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('First name must be less than 50 characters'),
  
  body('lastName')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Last name must be less than 50 characters'),
  
  handleValidationErrors
], createSeller);

/**
 * @swagger
 * /api/super-admin/orders:
 *   get:
 *     summary: Get all orders with filtering options
 *     tags: [Super Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Items per page
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, completed, cancelled, no-show]
 *         description: Filter by order status
 *       - in: query
 *         name: sellerId
 *         schema:
 *           type: integer
 *         description: Filter by seller ID
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter orders from this date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter orders until this date
 *     responses:
 *       200:
 *         description: Orders retrieved successfully
 */
router.get('/orders', getAllOrders);

/**
 * @swagger
 * /api/super-admin/sellers/{sellerId}/toggle-status:
 *   patch:
 *     summary: Block or unblock a seller
 *     tags: [Super Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: sellerId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Seller ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - isBlocked
 *             properties:
 *               isBlocked:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Seller status updated successfully
 *       404:
 *         description: Seller not found
 */
router.patch('/sellers/:sellerId/toggle-status', [
  body('isBlocked')
    .isBoolean()
    .withMessage('isBlocked must be a boolean value'),
  
  handleValidationErrors
], toggleSellerStatus);

export default router;
