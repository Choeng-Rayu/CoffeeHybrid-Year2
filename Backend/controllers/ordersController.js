// Controller for order-related logic
import { Order, User, Product, OrderItem } from '../models/index.js';
import { v4 as uuidv4 } from 'uuid';
import qr from 'qr-image';

/**
 * @swagger
 * /orders:
 *   post:
 *     summary: Create a new order
 *     tags: [Orders]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     productId:
 *                       type: string
 *                     size:
 *                       type: string
 *                     addOns:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           name:
 *                             type: string
 *                     quantity:
 *                       type: number
 *               orderSource:
 *                 type: string
 *               customerInfo:
 *                 type: object
 *                 properties:
 *                   name:
 *                     type: string
 *                   phone:
 *                     type: string
 *     responses:
 *       201:
 *         description: Order created successfully
 *       404:
 *         description: User or product not found
 *       403:
 *         description: Account is blocked
 */

export const createOrder = async (req, res, next) => {
  try {
    const { userId, items, orderSource, customerInfo } = req.body;

    // Validate user
    const user = await User.findByPk(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });
    if (user.isBlocked) return res.status(403).json({ error: 'Account is blocked due to no-shows' });

    let total = 0;
    const orderItemsData = [];

    // Process each item and calculate prices
    for (const item of items) {
      const product = await Product.findByPk(item.productId);
      if (!product) return res.status(404).json({ error: `Product ${item.productId} not found` });

      let itemPrice = product.basePrice;

      // Add size price modifier
      if (item.size) {
        const sizeOption = product.sizes?.find(s => s.name === item.size);
        if (sizeOption) itemPrice += sizeOption.priceModifier;
      }

      // Add add-ons price
      let addOnsPrice = 0;
      const itemAddOns = [];
      if (item.addOns && item.addOns.length > 0) {
        for (const addOn of item.addOns) {
          const productAddOn = product.addOns?.find(a => a.name === addOn.name);
          if (productAddOn) {
            addOnsPrice += productAddOn.price;
            itemAddOns.push({ name: addOn.name, price: productAddOn.price });
          }
        }
      }

      itemPrice += addOnsPrice;
      const quantity = item.quantity || 1;
      const totalItemPrice = itemPrice * quantity;

      orderItemsData.push({
        productId: product.id,
        name: product.name,
        size: item.size || 'medium',
        sugarLevel: item.sugarLevel || 'medium',
        iceLevel: item.iceLevel || 'medium',
        addOns: itemAddOns,
        price: totalItemPrice,
        quantity
      });

      total += totalItemPrice;
    }

    // Generate unique QR token
    const qrToken = uuidv4();

    // Create order first
    const order = await Order.create({
      userId,
      total,
      qrToken,
      orderSource: orderSource || 'web',
      customerInfo
    });

    // Create order items and associate with order
    const createdOrderItems = [];
    for (const itemData of orderItemsData) {
      const orderItem = await OrderItem.create({
        ...itemData,
        orderId: order.id
      });
      createdOrderItems.push(orderItem);
    }

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      order: {
        id: order.id,
        items: createdOrderItems,
        total: order.total,
        qrToken: order.qrToken,
        status: order.status,
        orderSource: order.orderSource,
        customerInfo: order.customerInfo,
        createdAt: order.createdAt,
        expiresAt: order.expiresAt
      }
    });
  } catch (err) {
    console.error('Error creating order:', err);
    next(err);
  }
};

export const getQrCode = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findByPk(orderId);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    const qrSvg = qr.image(order.qrToken, { type: 'svg' });
    res.type('svg');
    qrSvg.pipe(res);
  } catch (err) {
    next(err);
  }
};

export const verifyQrCode = async (req, res, next) => {
  try {
    const { qrToken } = req.body;
    const order = await Order.findOne({ where: { qrToken } });
    if (!order) return res.status(404).json({ error: 'Invalid QR code' });
    if (order.status !== 'pending') return res.status(400).json({ error: 'Order already completed or cancelled' });
    order.status = 'completed';
    await order.save();
    res.json({ success: true, message: 'Order verified and completed', order });
  } catch (err) {
    next(err);
  }
};

export const getUserOrderHistory = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const orders = await Order.findAll({
      where: { userId },
      include: [{
        model: OrderItem,
        as: 'items'
      }],
      order: [['createdAt', 'DESC']]
    });
    res.json({ success: true, orders });
  } catch (err) {
    next(err);
  }
};

export const getSingleOrder = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findByPk(orderId, {
      include: [{
        model: OrderItem,
        as: 'items'
      }]
    });
    if (!order) return res.status(404).json({ error: 'Order not found' });
    res.json({ success: true, order });
  } catch (err) {
    next(err);
  }
};

export const cancelOrder = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findByPk(orderId);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    if (order.status !== 'pending') return res.status(400).json({ error: 'Only pending orders can be cancelled' });
    order.status = 'cancelled';
    await order.save();
    res.json({ success: true, message: 'Order cancelled', order });
  } catch (err) {
    next(err);
  }
};

// Additional controller methods for order-related logic can be added here
