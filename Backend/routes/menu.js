import express from 'express';
import Product from '../models/Product.js';
import User from '../models/User.js';
// import { getSampleProducts } from '../data/sampleProducts.js'; // re-enable for sample data

const router = express.Router();

// Get all menu items (Sequelize)
router.get('/', async (req, res) => {
  try {
    const { category } = req.query;
    let where = {};
    if (category) {
      where.category = category;
    }
    const products = await Product.findAll({ where, order: [['category', 'ASC'], ['name', 'ASC']] });
    res.json({
      success: true,
      products
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get menu items by category (Sequelize)
router.get('/category/:category', async (req, res) => {
  try {
    const { category } = req.params;
    const products = await Product.findAll({
      where: { category: category.toLowerCase() },
      order: [['name', 'ASC']]
    });
    res.json({
      success: true,
      category,
      products
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single product (Sequelize)
router.get('/product/:id', async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json({
      success: true,
      product
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Initialize menu with sample data (for development, Sequelize only)
router.post('/initialize', async (req, res) => {
  try {
    // Check if products already exist
    const existingProducts = await Product.count();
    if (existingProducts > 0) {
      return res.json({ message: 'Menu already initialized' });
    }
    // Create default sellers first
    const defaultSellers = [
      {
        username: 'coffeeshop1',
        email: 'shop1@coffeehybrid.com',
        password: 'seller123',
        role: 'seller',
        shopName: 'Coffee Central'
      },
      {
        username: 'coffeeshop2',
        email: 'shop2@coffeehybrid.com',
        password: 'seller123',
        role: 'seller',
        shopName: 'Bean Paradise'
      },
      {
        username: 'coffeeshop3',
        email: 'shop3@coffeehybrid.com',
        password: 'seller123',
        role: 'seller',
        shopName: 'Brew Masters'
      }
    ];
    const sellers = [];
    for (const sellerData of defaultSellers) {
      let existingSeller = await User.findOne({ where: { email: sellerData.email } });
      if (!existingSeller) {
        existingSeller = await User.create(sellerData);
      }
      sellers.push(existingSeller);
    }
    const sampleProducts = getSampleProducts(sellers);
    await Product.bulkCreate(sampleProducts);
    res.json({
      success: true,
      message: 'Menu initialized with sample products',
      count: sampleProducts.length
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
