// Controller for menu-related logic
import { Product, User } from '../models/index.js';

/**
 * @swagger
 * /menu:
 *   get:
 *     summary: Get all products with pagination
 *     tags: [Menu]
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter products by category
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of products per page
 *     responses:
 *       200:
 *         description: Paginated list of products
 */

/**
 * @swagger
 * /menu/{category}:
 *   get:
 *     summary: Get products by category
 *     tags: [Menu]
 *     parameters:
 *       - in: path
 *         name: category
 *         required: true
 *         schema:
 *           type: string
 *         description: Category name
 *     responses:
 *       200:
 *         description: List of products in the category
 */

/**
 * @swagger
 * /menu/product/{id}:
 *   get:
 *     summary: Get product by ID
 *     tags: [Menu]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *     responses:
 *       200:
 *         description: Product details
 *       404:
 *         description: Product not found
 */

export const getAllProducts = async (req, res, next) => {
  try {
    const { category, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    let where = { available: true }; // Only show available products
    if (category) {
      where.category = category;
    }

    const result = await Product.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['category', 'ASC'], ['name', 'ASC']]
    });

    const totalPages = Math.ceil(result.count / limit);

    res.json({
      success: true,
      products: result.rows,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalProducts: result.count,
        limit: parseInt(limit),
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    });
  } catch (err) {
    next(err);
  }
};

export const getProductsByCategory = async (req, res, next) => {
  try {
    const { category } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const result = await Product.findAndCountAll({
      where: {
        category: category.toLowerCase(),
        available: true
      },
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['name', 'ASC']]
    });

    const totalPages = Math.ceil(result.count / limit);

    res.json({
      success: true,
      category,
      products: result.rows,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalProducts: result.count,
        limit: parseInt(limit),
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    });
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
