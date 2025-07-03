// Example Product Controller
import { Product } from '../models/index.js';

export const getAllProducts = async (req, res, next) => {
  try {
    const products = await Product.findAll();
    res.json({ success: true, products });
  } catch (err) {
    next(err);
  }
};

// Add more product controller methods as needed
