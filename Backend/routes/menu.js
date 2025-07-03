import express from 'express';
import { getAllProducts, getProductsByCategory, getProductById, initializeMenu } from '../controllers/menuController.js';

const router = express.Router();

// Get all menu items (Sequelize)
router.get('/', getAllProducts);

// Get menu items by category (Sequelize)
router.get('/category/:category', getProductsByCategory);

// Get single product (Sequelize)
router.get('/product/:id', getProductById);

// Initialize menu with sample data (for development, Sequelize only)
router.post('/initialize', initializeMenu);

export default router;
