// Controller for menu-related logic
import { Product, User } from '../models/index.js';

export const getAllProducts = async (req, res, next) => {
  try {
    const { category } = req.query;
    let where = {};
    if (category) {
      where.category = category;
    }
    const products = await Product.findAll({ where, order: [['category', 'ASC'], ['name', 'ASC']] });
    res.json({ success: true, products });
  } catch (err) {
    next(err);
  }
};

export const getProductsByCategory = async (req, res, next) => {
  try {
    const { category } = req.params;
    const products = await Product.findAll({
      where: { category: category.toLowerCase() },
      order: [['name', 'ASC']]
    });
    res.json({ success: true, category, products });
  } catch (err) {
    next(err);
  }
};

export const getProductById = async (req, res, next) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json({ success: true, product });
  } catch (err) {
    next(err);
  }
};

export const initializeMenu = async (req, res, next) => {
  try {
    const existingProducts = await Product.count();
    if (existingProducts > 0) {
      return res.json({ message: 'Menu already initialized' });
    }
    const defaultSellers = [
      { username: 'coffeeshop1', email: 'shop1@coffeehybrid.com', password: 'seller123', role: 'seller', shopName: 'Coffee Central' },
      { username: 'coffeeshop2', email: 'shop2@coffeehybrid.com', password: 'seller123', role: 'seller', shopName: 'Bean Paradise' },
      { username: 'coffeeshop3', email: 'shop3@coffeehybrid.com', password: 'seller123', role: 'seller', shopName: 'Brew Masters' }
    ];
    const sellers = [];
    for (const sellerData of defaultSellers) {
      let existingSeller = await User.findOne({ where: { email: sellerData.email } });
      if (!existingSeller) {
        existingSeller = await User.create(sellerData);
      }
      sellers.push(existingSeller);
    }
    // Uncomment and import getSampleProducts if needed
    // const sampleProducts = getSampleProducts(sellers);
    // await Product.bulkCreate(sampleProducts);
    res.json({ success: true, message: 'Menu initialized with sample products' });
  } catch (err) {
    next(err);
  }
};
