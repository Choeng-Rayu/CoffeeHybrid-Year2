import { CartItem, User, Product } from '../models/index.js';
import { v4 as uuidv4 } from 'uuid';

/**
 * @swagger
 * /cart:
 *   post:
 *     summary: Add item to cart (persistent)
 *     tags: [Cart]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: integer
 *                 description: User ID (optional for guest users)
 *               sessionId:
 *                 type: string
 *                 description: Browser session ID
 *               productId:
 *                 type: integer
 *               size:
 *                 type: string
 *               sugarLevel:
 *                 type: string
 *               iceLevel:
 *                 type: string
 *               addOns:
 *                 type: array
 *               quantity:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Item added to cart successfully
 */
export const addToCart = async (req, res, next) => {
  try {
    const { 
      userId, 
      sessionId, 
      productId, 
      size = 'medium', 
      sugarLevel = 'medium', 
      iceLevel = 'medium', 
      addOns = [], 
      quantity = 1 
    } = req.body;

    // Validate required fields
    if (!sessionId || !productId) {
      return res.status(400).json({ error: 'sessionId and productId are required' });
    }

    // Get product details
    const product = await Product.findByPk(productId);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Calculate price
    let itemPrice = product.basePrice;
    
    // Add size price modifier
    if (product.sizes && size) {
      const sizeOption = product.sizes.find(s => s.name === size);
      if (sizeOption) itemPrice += sizeOption.priceModifier;
    }
    
    // Add add-ons price
    let addOnsPrice = 0;
    if (addOns && addOns.length > 0) {
      for (const addOn of addOns) {
        const productAddOn = product.addOns?.find(a => a.name === addOn.name);
        if (productAddOn) {
          addOnsPrice += productAddOn.price;
        }
      }
    }
    
    itemPrice += addOnsPrice;
    const totalPrice = itemPrice * quantity;

    // Create cart item
    const cartItem = await CartItem.create({
      userId: userId || null,
      sessionId,
      productId,
      name: product.name,
      size,
      sugarLevel,
      iceLevel,
      addOns,
      basePrice: product.basePrice,
      totalPrice,
      quantity,
      isActive: true
    });

    res.status(201).json({
      success: true,
      message: 'Item added to cart',
      cartItem
    });
  } catch (err) {
    console.error('Error adding to cart:', err);
    next(err);
  }
};

/**
 * @swagger
 * /cart/{sessionId}:
 *   get:
 *     summary: Get cart items for session
 *     tags: [Cart]
 *     parameters:
 *       - in: path
 *         name: sessionId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: userId
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Cart items retrieved successfully
 */
export const getCart = async (req, res, next) => {
  try {
    const { sessionId } = req.params;
    const { userId } = req.query;

    const whereClause = {
      sessionId,
      isActive: true
    };

    if (userId) {
      whereClause.userId = userId;
    }

    const cartItems = await CartItem.findAll({
      where: whereClause,
      include: [{
        model: Product,
        as: 'product'
      }],
      order: [['createdAt', 'ASC']]
    });

    const total = cartItems.reduce((sum, item) => sum + item.totalPrice, 0);

    res.json({
      success: true,
      cartItems,
      total,
      count: cartItems.length
    });
  } catch (err) {
    console.error('Error getting cart:', err);
    next(err);
  }
};

/**
 * @swagger
 * /cart/{cartItemId}:
 *   put:
 *     summary: Update cart item
 *     tags: [Cart]
 *     parameters:
 *       - in: path
 *         name: cartItemId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               quantity:
 *                 type: integer
 *               size:
 *                 type: string
 *               sugarLevel:
 *                 type: string
 *               iceLevel:
 *                 type: string
 *               addOns:
 *                 type: array
 *     responses:
 *       200:
 *         description: Cart item updated successfully
 */
export const updateCartItem = async (req, res, next) => {
  try {
    const { cartItemId } = req.params;
    const { quantity, size, sugarLevel, iceLevel, addOns } = req.body;

    const cartItem = await CartItem.findByPk(cartItemId, {
      include: [{
        model: Product,
        as: 'product'
      }]
    });

    if (!cartItem) {
      return res.status(404).json({ error: 'Cart item not found' });
    }

    // Recalculate price if size or addOns changed
    let itemPrice = cartItem.product.basePrice;
    
    if (size && cartItem.product.sizes) {
      const sizeOption = cartItem.product.sizes.find(s => s.name === size);
      if (sizeOption) itemPrice += sizeOption.priceModifier;
    }
    
    let addOnsPrice = 0;
    if (addOns && addOns.length > 0) {
      for (const addOn of addOns) {
        const productAddOn = cartItem.product.addOns?.find(a => a.name === addOn.name);
        if (productAddOn) {
          addOnsPrice += productAddOn.price;
        }
      }
    }
    
    itemPrice += addOnsPrice;
    const totalPrice = itemPrice * (quantity || cartItem.quantity);

    // Update cart item
    await cartItem.update({
      quantity: quantity || cartItem.quantity,
      size: size || cartItem.size,
      sugarLevel: sugarLevel || cartItem.sugarLevel,
      iceLevel: iceLevel || cartItem.iceLevel,
      addOns: addOns || cartItem.addOns,
      totalPrice
    });

    res.json({
      success: true,
      message: 'Cart item updated',
      cartItem
    });
  } catch (err) {
    console.error('Error updating cart item:', err);
    next(err);
  }
};

/**
 * @swagger
 * /cart/{cartItemId}:
 *   delete:
 *     summary: Remove item from cart
 *     tags: [Cart]
 *     parameters:
 *       - in: path
 *         name: cartItemId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Item removed from cart successfully
 */
export const removeFromCart = async (req, res, next) => {
  try {
    const { cartItemId } = req.params;

    const cartItem = await CartItem.findByPk(cartItemId);
    if (!cartItem) {
      return res.status(404).json({ error: 'Cart item not found' });
    }

    // Soft delete - mark as inactive instead of deleting
    await cartItem.update({ isActive: false });

    res.json({
      success: true,
      message: 'Item removed from cart'
    });
  } catch (err) {
    console.error('Error removing from cart:', err);
    next(err);
  }
};

/**
 * @swagger
 * /cart/clear/{sessionId}:
 *   delete:
 *     summary: Clear entire cart for session
 *     tags: [Cart]
 *     parameters:
 *       - in: path
 *         name: sessionId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Cart cleared successfully
 */
export const clearCart = async (req, res, next) => {
  try {
    const { sessionId } = req.params;
    const { userId } = req.query;

    const whereClause = {
      sessionId,
      isActive: true
    };

    if (userId) {
      whereClause.userId = userId;
    }

    await CartItem.update(
      { isActive: false },
      { where: whereClause }
    );

    res.json({
      success: true,
      message: 'Cart cleared'
    });
  } catch (err) {
    console.error('Error clearing cart:', err);
    next(err);
  }
};

/**
 * @swagger
 * /cart/sync:
 *   post:
 *     summary: Sync localStorage cart with database
 *     tags: [Cart]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               sessionId:
 *                 type: string
 *               userId:
 *                 type: integer
 *               cartItems:
 *                 type: array
 *     responses:
 *       200:
 *         description: Cart synced successfully
 */
export const syncCart = async (req, res, next) => {
  try {
    const { sessionId, userId, cartItems } = req.body;

    if (!sessionId || !cartItems) {
      return res.status(400).json({ error: 'sessionId and cartItems are required' });
    }

    // Clear existing cart items for this session
    await CartItem.update(
      { isActive: false },
      { 
        where: { 
          sessionId,
          isActive: true
        }
      }
    );

    // Add new cart items
    const createdItems = [];
    for (const item of cartItems) {
      const product = await Product.findByPk(item.productId);
      if (product) {
        const cartItem = await CartItem.create({
          userId: userId || null,
          sessionId,
          productId: item.productId,
          name: item.name,
          size: item.size,
          sugarLevel: item.sugarLevel,
          iceLevel: item.iceLevel,
          addOns: item.addOns,
          basePrice: item.basePrice,
          totalPrice: item.totalPrice,
          quantity: item.quantity,
          isActive: true
        });
        createdItems.push(cartItem);
      }
    }

    res.json({
      success: true,
      message: 'Cart synced successfully',
      cartItems: createdItems
    });
  } catch (err) {
    console.error('Error syncing cart:', err);
    next(err);
  }
};
