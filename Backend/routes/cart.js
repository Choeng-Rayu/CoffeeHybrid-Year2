import express from 'express';
import { 
  addToCart, 
  getCart, 
  updateCartItem, 
  removeFromCart, 
  clearCart, 
  syncCart 
} from '../controllers/cartController.js';

const router = express.Router();

// Add item to cart
router.post('/', addToCart);

// Get cart items for session
router.get('/:sessionId', getCart);

// Update cart item
router.put('/:cartItemId', updateCartItem);

// Remove item from cart
router.delete('/:cartItemId', removeFromCart);

// Clear entire cart for session
router.delete('/clear/:sessionId', clearCart);

// Sync localStorage cart with database
router.post('/sync', syncCart);

export default router;
