// Controller for admin-related logic
import { User, Product, Order, OrderItem } from '../models/index.js';
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

/**
 * @swagger
 * /admin/analytics/{sellerId}:
 *   get:
 *     summary: Get sales analytics for a seller
 *     tags: [Admin]
 *     parameters:
 *       - in: path
 *         name: sellerId
 *         schema:
 *           type: string
 *         required: true
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [today, week, month, year, all]
 *         description: Time period to filter analytics
 *       - in: query
 *         name: groupBy
 *         schema:
 *           type: string
 *         description: Grouping for charts (hour/day)
 *     responses:
 *       200:
 *         description: Analytics data
 */
export const getSellerAnalytics = async (req, res, next) => {
  try {
    const { sellerId } = req.params;
    const { period, groupBy } = req.query;
    // Determine date filter based on period
    let startDate = null;
    if (period && period !== 'all') {
      startDate = new Date();
      switch (period) {
        case 'today':
          startDate.setHours(0, 0, 0, 0);
          break;
        case 'week':
          startDate.setDate(startDate.getDate() - 7);
          break;
        case 'month':
          startDate.setMonth(startDate.getMonth() - 1);
          break;
        case 'year':
          startDate.setFullYear(startDate.getFullYear() - 1);
          break;
        default:
          startDate = null;
      }
    }
    // Fetch items for this seller, optionally filtering by order date
    const orderInclude = { model: Order, as: 'order', required: true };
    if (startDate) {
      orderInclude.where = { createdAt: { [Op.gte]: startDate } };
    }
    const items = await OrderItem.findAll({
      include: [
        { model: Product, as: 'product', where: { sellerId } },
        orderInclude
      ]
    });
    // Overview stats
    const orderIds = new Set(items.map(i => i.orderId));
    const totalOrders = orderIds.size;
    const totalRevenue = items.reduce((sum, i) => sum + (i.price || 0), 0);
    const totalItemsSold = items.reduce((sum, i) => sum + (i.quantity || 0), 0);
    const averageOrderValue = totalOrders ? totalRevenue / totalOrders : 0;
    const overview = {
      totalOrders,
      totalRevenue,
      averageOrderValue,
      totalItemsSold
    };
    // Detailed product performance
    const prodMap = {};
    const catMap = {};
    const trendMap = {};
    const sizeMap = {};
    const addOnMap = {};
    items.forEach(item => {
      const prod = item.product;
      const orderTime = item.order.createdAt;
      // Product performance
      if (!prodMap[prod.id]) prodMap[prod.id] = { _id: prod.id, productName: prod.name, category: prod.category, totalSold: 0, totalRevenue: 0, orderIds: new Set() };
      prodMap[prod.id].totalSold += item.quantity;
      prodMap[prod.id].totalRevenue += item.price;
      prodMap[prod.id].orderIds.add(item.orderId);
      // Category performance
      if (!catMap[prod.category]) catMap[prod.category] = { _id: prod.category, category: prod.category, totalSold: 0, totalRevenue: 0 };
      catMap[prod.category].totalSold += item.quantity;
      catMap[prod.category].totalRevenue += item.price;
      // Sales trends grouped by period (hour/day)
      const key = groupBy === 'hour'
        ? new Date(orderTime).getHours()
        : new Date(orderTime).toISOString().slice(0,10);
      if (!trendMap[key]) trendMap[key] = { _id: key, totalOrders: new Set(), totalRevenue: 0 };
      trendMap[key].totalOrders.add(item.orderId);
      trendMap[key].totalRevenue += item.price;
      // Size analysis
      if (!sizeMap[item.size]) sizeMap[item.size] = { _id: item.size, size: item.size, totalSold: 0, totalRevenue: 0 };
      sizeMap[item.size].totalSold += item.quantity;
      sizeMap[item.size].totalRevenue += item.price;
      // Add-on analysis
      (item.addOns || []).forEach(ao => {
        if (!addOnMap[ao.name]) addOnMap[ao.name] = { _id: ao.name, addOn: ao.name, count: 0, revenue: 0 };
        addOnMap[ao.name].count += 1;
        addOnMap[ao.name].revenue += ao.price;
      });
    });
    const productPerformance = Object.values(prodMap).map(p => ({
      _id: p._id,
      productName: p.productName,
      category: p.category,
      totalSold: p.totalSold,
      totalRevenue: p.totalRevenue,
      averagePrice: p.totalSold ? p.totalRevenue / p.totalSold : 0,
      orderCount: p.orderIds.size
    })).sort((a,b) => b.totalSold - a.totalSold);
    const categoryPerformance = Object.values(catMap);
    const salesTrends = Object.values(trendMap).map(t => ({
      _id: t._id,
      totalOrders: t.totalOrders.size,
      totalRevenue: t.totalRevenue
    })).sort((a,b) => a._id < b._id ? -1 : 1);
    const sizeAnalysis = Object.values(sizeMap);
    const addOnAnalysis = Object.values(addOnMap);
    res.json({ success: true, analytics: { overview, productPerformance, categoryPerformance, salesTrends, sizeAnalysis, addOnAnalysis } });
  } catch (err) {
    next(err);
  }
};

/**
 * @swagger
 * /admin/dashboard/{sellerId}:
 *   get:
 *     summary: Get dashboard stats for a seller
 *     tags: [Admin]
 *     parameters:
 *       - in: path
 *         name: sellerId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the seller
 *     responses:
 *       200:
 *         description: Dashboard statistics
 */
export const getSellerDashboardStats = async (req, res, next) => {
  try {
    const { sellerId } = req.params;
    // Count this seller's products
    const productCount = await Product.count({ where: { sellerId } });

    // Count today's orders containing this seller's products
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const todayOrders = await Order.count({
      where: { createdAt: { [Op.gte]: startOfDay } },
      include: [{
        model: OrderItem, as: 'items', include: [{ model: Product, as: 'product', where: { sellerId } }]
      }],
      distinct: true
    });

    // Aggregate order counts by status
    const statuses = ['pending', 'completed', 'no-show'];
    const orderStats = await Promise.all(statuses.map(async status => {
      const count = await Order.count({
        where: { status },
        include: [{ model: OrderItem, as: 'items', include: [{ model: Product, as: 'product', where: { sellerId } }] }],
        distinct: true
      });
      return { _id: status, count };
    }));

    res.json({ success: true, stats: { productCount, todayOrders, orderStats } });
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
