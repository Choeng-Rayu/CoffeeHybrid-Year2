// Controller for admin-related logic
import { User, Product, Order } from '../models/index.js';
import { Op } from 'sequelize';

/**
 * @swagger
 * /admin/register-seller:
 *   post:
 *     summary: Register a new seller
 *     tags: [Admin]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               shopName:
 *                 type: string
 *     responses:
 *       201:
 *         description: Seller registered successfully
 *       400:
 *         description: User with this email or username already exists
 */

/**
 * @swagger
 * /admin/add-product:
 *   post:
 *     summary: Add a new product
 *     tags: [Admin]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               category:
 *                 type: string
 *               basePrice:
 *                 type: number
 *               image:
 *                 type: string
 *               sizes:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                     priceModifier:
 *                       type: number
 *               addOns:
 *                 type: array
 *                 items:
 *                   type: string
 *               preparationTime:
 *                 type: number
 *               featured:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Product added successfully
 */

export const registerSeller = async (req, res, next) => {
  try {
    const { username, email, password, shopName } = req.body;
    const existingUser = await User.findOne({
      where: { [Op.or]: [{ email }, { username }] }
    });
    if (existingUser) {
      return res.status(400).json({ error: 'User with this email or username already exists' });
    }
    const seller = await User.create({ username, email, password, role: 'seller', shopName });
    res.status(201).json({ success: true, seller });
  } catch (err) {
    next(err);
  }
};

export const addProduct = async (req, res, next) => {
  try {
    const { name, description, category, basePrice, image, sizes, addOns, preparationTime, featured } = req.body;
    const product = await Product.create({
      name,
      description,
      category,
      basePrice,
      image,
      sizes: sizes || [
        { name: 'small', priceModifier: -0.50 },
        { name: 'medium', priceModifier: 0 },
        { name: 'large', priceModifier: 0.50 }
      ],
      addOns: addOns || [],
      sellerId: req.user.id,
      shopName: req.user.shopName,
      preparationTime: preparationTime || 5,
      featured: featured || false
    });
    res.status(201).json({ success: true, message: 'Product added successfully', product });
  } catch (err) {
    next(err);
  }
};

export const getSellerProducts = async (req, res, next) => {
  try {
    const { sellerId } = req.params;
    const products = await Product.findAll({ where: { sellerId }, order: [['createdAt', 'DESC']] });
    res.json({ success: true, products });
  } catch (err) {
    next(err);
  }
};

export const updateProduct = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const updates = req.body;
    const product = await Product.findOne({ where: { id: productId, sellerId: req.user.id } });
    if (!product) {
      return res.status(404).json({ error: 'Product not found or access denied' });
    }
    delete updates.userId;
    delete updates.sellerId;
    await product.update(updates);
    res.json({ success: true, message: 'Product updated successfully', product });
  } catch (err) {
    next(err);
  }
};

export const deleteProduct = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const product = await Product.findOne({ where: { id: productId, sellerId: req.user.id } });
    if (!product) {
      return res.status(404).json({ error: 'Product not found or access denied' });
    }
    await product.destroy();
    res.json({ success: true, message: 'Product deleted successfully' });
  } catch (err) {
    next(err);
  }
};

// Placeholder for getSellerAnalytics
export const getSellerAnalytics = async (req, res, next) => {
  try {
    // TODO: Implement analytics logic here
    res.json({ success: true, message: 'Seller analytics endpoint (to be implemented)' });
  } catch (err) {
    next(err);
  }
};

// Placeholder for getSellerDashboardStats
export const getSellerDashboardStats = async (req, res, next) => {
  try {
    // TODO: Implement dashboard stats logic here
    res.json({ success: true, message: 'Seller dashboard stats endpoint (to be implemented)' });
  } catch (err) {
    next(err);
  }
};

// Placeholder for getSellerOrders
export const getSellerOrders = async (req, res, next) => {
  try {
    // TODO: Implement seller orders logic here
    res.json({ success: true, message: 'Seller orders endpoint (to be implemented)' });
  } catch (err) {
    next(err);
  }
};

// Additional admin controller methods for orders, dashboard, analytics can be added here
