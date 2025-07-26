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

    // Check if user has a shopName, if not provide a default based on their role
    let shopName = req.user.shopName;
    if (!shopName) {
      if (req.user.role === 'admin') {
        shopName = 'Admin Store';
      } else if (req.user.role === 'seller') {
        shopName = `${req.user.username}'s Shop`;
      } else {
        return res.status(400).json({
          success: false,
          error: 'Shop name is required. Please update your profile with a shop name first.'
        });
      }
    }

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
      shopName: shopName,
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
    console.log('📊 Analytics requested for seller:', req.params.sellerId);
    const { sellerId } = req.params;
    const { period = 'all' } = req.query;

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
    // Fetch orders containing this seller's products
    const whereClause = {};
    if (startDate) {
      whereClause.createdAt = { [Op.gte]: startDate };
    }

    const orders = await Order.findAll({
      where: whereClause,
      include: [{
        model: OrderItem,
        as: 'items',
        include: [{
          model: Product,
          as: 'product',
          where: { sellerId }
        }]
      }]
    });

    // Filter orders that contain this seller's products
    const sellerOrders = orders.filter(order =>
      order.items && order.items.length > 0
    );

    console.log(`📋 Found ${orders.length} total orders, ${sellerOrders.length} contain seller's products`);

    // Calculate overview stats
    const totalOrders = sellerOrders.length;
    let totalRevenue = 0;
    let totalItemsSold = 0;

    sellerOrders.forEach(order => {
      if (order.status === 'completed') {
        totalRevenue += parseFloat(order.total || 0);
      }
      order.items.forEach(item => {
        totalItemsSold += parseInt(item.quantity || 0);
      });
    });

    const averageOrderValue = totalOrders ? totalRevenue / totalOrders : 0;

    const overview = {
      totalOrders,
      totalRevenue,
      averageOrderValue,
      totalItemsSold
    };
    // Calculate detailed analytics
    const productPerformance = [];
    const categoryPerformance = [];
    const salesTrends = [];
    const sizeAnalysis = [];
    const addOnAnalysis = [];

    // Product performance analysis
    const productStats = {};
    const categoryStats = {};
    const sizeStats = {};
    const addOnStats = {};

    sellerOrders.forEach(order => {

      order.items.forEach(item => {
        const product = item.product;
        const productId = product.id;

        // Product performance
        if (!productStats[productId]) {
          productStats[productId] = {
            id: productId,
            _id: productId, // For compatibility
            productName: product.name,
            category: product.category,
            totalSold: 0,
            totalRevenue: 0,
            orderCount: 0
          };
        }
        productStats[productId].totalSold += parseInt(item.quantity || 0);
        productStats[productId].totalRevenue += parseFloat(item.price || 0);
        productStats[productId].orderCount += 1;

        // Category performance
        const category = product.category;
        if (!categoryStats[category]) {
          categoryStats[category] = {
            id: category,
            _id: category,
            category: category,
            totalSold: 0,
            totalRevenue: 0
          };
        }
        categoryStats[category].totalSold += parseInt(item.quantity || 0);
        categoryStats[category].totalRevenue += parseFloat(item.price || 0);

        // Size analysis
        const size = item.size;
        if (!sizeStats[size]) {
          sizeStats[size] = {
            id: size,
            _id: size,
            size: size,
            totalSold: 0,
            totalRevenue: 0
          };
        }
        sizeStats[size].totalSold += parseInt(item.quantity || 0);
        sizeStats[size].totalRevenue += parseFloat(item.price || 0);

        // Add-on analysis
        if (item.addOns && Array.isArray(item.addOns)) {
          item.addOns.forEach(addOn => {
            const addOnName = addOn.name;
            if (!addOnStats[addOnName]) {
              addOnStats[addOnName] = {
                id: addOnName,
                _id: addOnName,
                addOn: addOnName,
                count: 0,
                revenue: 0
              };
            }
            addOnStats[addOnName].count += 1;
            addOnStats[addOnName].revenue += parseFloat(addOn.price || 0);
          });
        }
      });
    });

    // Convert to arrays and add calculated fields
    Object.values(productStats).forEach(product => {
      product.averagePrice = product.totalSold ? product.totalRevenue / product.totalSold : 0;
      productPerformance.push(product);
    });
    productPerformance.sort((a, b) => b.totalSold - a.totalSold);

    categoryPerformance.push(...Object.values(categoryStats));
    sizeAnalysis.push(...Object.values(sizeStats));
    addOnAnalysis.push(...Object.values(addOnStats));

    // Simple sales trends (daily)
    const dailyStats = {};
    sellerOrders.forEach(order => {
      const date = new Date(order.createdAt).toISOString().slice(0, 10);
      if (!dailyStats[date]) {
        dailyStats[date] = {
          id: date,
          _id: date,
          date: date,
          totalOrders: 0,
          totalRevenue: 0
        };
      }
      dailyStats[date].totalOrders += 1;
      if (order.status === 'completed') {
        dailyStats[date].totalRevenue += parseFloat(order.total || 0);
      }
    });
    salesTrends.push(...Object.values(dailyStats).sort((a, b) => a.date.localeCompare(b.date)));

    res.json({
      success: true,
      analytics: {
        overview,
        productPerformance,
        categoryPerformance,
        salesTrends,
        sizeAnalysis,
        addOnAnalysis
      }
    });
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
    console.log('📊 Dashboard stats requested for seller:', req.params.sellerId);
    const { sellerId } = req.params;

    // Count this seller's products
    const productCount = await Product.count({ where: { sellerId } });

    // Count today's orders containing this seller's products
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const todayOrders = await Order.count({
      where: { createdAt: { [Op.gte]: startOfDay } },
      include: [{
        model: OrderItem,
        as: 'items',
        include: [{
          model: Product,
          as: 'product',
          where: { sellerId }
        }]
      }],
      distinct: true
    });

    // Calculate total revenue for this seller
    const revenueResult = await Order.findAll({
      include: [{
        model: OrderItem,
        as: 'items',
        include: [{
          model: Product,
          as: 'product',
          where: { sellerId }
        }]
      }],
      attributes: ['total', 'status']
    });

    let totalRevenue = 0;
    const statusCounts = { pending: 0, completed: 0, 'no-show': 0, cancelled: 0 };

    revenueResult.forEach(order => {
      if (order.status === 'completed') {
        totalRevenue += parseFloat(order.total || 0);
      }
      statusCounts[order.status] = (statusCounts[order.status] || 0) + 1;
    });

    // Format order stats for frontend compatibility
    const orderStats = Object.entries(statusCounts).map(([status, count]) => ({
      id: status,
      _id: status, // Keep for backward compatibility
      status,
      count,
      totalRevenue: status === 'completed' ? totalRevenue : 0
    }));

    res.json({
      success: true,
      stats: {
        productCount,
        todayOrders,
        totalRevenue,
        orderStats
      }
    });
  } catch (err) {
    console.error('Dashboard stats error:', err);
    next(err);
  }
};

/**
 * @swagger
 * /admin/orders/{sellerId}:
 *   get:
 *     summary: Get orders for a specific seller
 *     tags: [Admin]
 *     parameters:
 *       - in: path
 *         name: sellerId
 *         required: true
 *         schema:
 *           type: integer
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Seller orders retrieved successfully
 */
export const getSellerOrders = async (req, res, next) => {
  try {
    const { sellerId } = req.params;
    const { status, limit = 50, offset = 0 } = req.query;

    const whereClause = {};
    if (status) {
      whereClause.status = status;
    }

    const orders = await Order.findAll({
      where: whereClause,
      include: [{
        model: OrderItem,
        as: 'items',
        include: [{
          model: Product,
          as: 'product',
          where: { sellerId }
        }]
      }],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    // Filter orders that actually contain this seller's products
    const sellerOrders = orders.filter(order =>
      order.items && order.items.length > 0
    );

    res.json({
      success: true,
      orders: sellerOrders,
      total: sellerOrders.length
    });
  } catch (err) {
    console.error('Seller orders error:', err);
    next(err);
  }
};

/**
 * @swagger
 * /admin/export/orders/{sellerId}:
 *   get:
 *     summary: Export seller orders to CSV
 *     tags: [Admin]
 *     parameters:
 *       - in: path
 *         name: sellerId
 *         required: true
 *         schema:
 *           type: integer
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: CSV file download
 *         content:
 *           text/csv:
 *             schema:
 *               type: string
 */
export const exportOrdersCSV = async (req, res, next) => {
  try {
    const { sellerId } = req.params;
    const { status, startDate, endDate } = req.query;

    const whereClause = {};
    if (status) {
      whereClause.status = status;
    }
    if (startDate || endDate) {
      whereClause.createdAt = {};
      if (startDate) {
        whereClause.createdAt[Op.gte] = new Date(startDate);
      }
      if (endDate) {
        whereClause.createdAt[Op.lte] = new Date(endDate);
      }
    }

    const orders = await Order.findAll({
      where: whereClause,
      include: [{
        model: OrderItem,
        as: 'items',
        include: [{
          model: Product,
          as: 'product',
          where: { sellerId }
        }]
      }],
      order: [['createdAt', 'DESC']]
    });

    // Filter orders that contain this seller's products
    const sellerOrders = orders.filter(order =>
      order.items && order.items.length > 0
    );

    // Generate CSV content
    const csvHeaders = [
      'Order ID',
      'Date',
      'Status',
      'Customer Info',
      'Product Name',
      'Size',
      'Sugar Level',
      'Ice Level',
      'Add-ons',
      'Quantity',
      'Item Price',
      'Order Total',
      'Order Source',
      'QR Token'
    ];

    let csvContent = csvHeaders.join(',') + '\n';

    sellerOrders.forEach(order => {
      const customerInfo = order.customerInfo ?
        `"${order.customerInfo.name || ''} (${order.customerInfo.phone || ''})"` :
        'N/A';

      order.items.forEach(item => {
        const addOns = item.addOns && item.addOns.length > 0 ?
          `"${item.addOns.map(ao => ao.name).join(', ')}"` :
          'None';

        const row = [
          order.id,
          new Date(order.createdAt).toISOString().slice(0, 19).replace('T', ' '),
          order.status,
          customerInfo,
          `"${item.name}"`,
          item.size,
          item.sugarLevel,
          item.iceLevel,
          addOns,
          item.quantity,
          item.price,
          order.total,
          order.orderSource,
          order.qrToken
        ];

        csvContent += row.join(',') + '\n';
      });
    });

    // Set headers for CSV download
    const filename = `orders_${sellerId}_${new Date().toISOString().slice(0, 10)}.csv`;
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(csvContent);

  } catch (err) {
    console.error('Export orders CSV error:', err);
    next(err);
  }
};

/**
 * @swagger
 * /admin/export/analytics/{sellerId}:
 *   get:
 *     summary: Export seller analytics to CSV
 *     tags: [Admin]
 *     parameters:
 *       - in: path
 *         name: sellerId
 *         required: true
 *         schema:
 *           type: integer
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [today, week, month, year, all]
 *     responses:
 *       200:
 *         description: CSV file download
 */
export const exportAnalyticsCSV = async (req, res, next) => {
  try {
    const { sellerId } = req.params;
    const { period = 'all' } = req.query;

    // Get analytics data (reuse existing logic)
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
      }
    }

    const whereClause = {};
    if (startDate) {
      whereClause.createdAt = { [Op.gte]: startDate };
    }

    const orders = await Order.findAll({
      where: whereClause,
      include: [{
        model: OrderItem,
        as: 'items',
        include: [{
          model: Product,
          as: 'product',
          where: { sellerId }
        }]
      }]
    });

    const sellerOrders = orders.filter(order =>
      order.items && order.items.length > 0
    );

    // Product performance CSV
    const productStats = {};
    sellerOrders.forEach(order => {
      order.items.forEach(item => {
        const product = item.product;
        const productId = product.id;

        if (!productStats[productId]) {
          productStats[productId] = {
            productName: product.name,
            category: product.category,
            totalSold: 0,
            totalRevenue: 0,
            orderCount: 0
          };
        }
        productStats[productId].totalSold += parseInt(item.quantity || 0);
        productStats[productId].totalRevenue += parseFloat(item.price || 0);
        productStats[productId].orderCount += 1;
      });
    });

    // Generate CSV content
    const csvHeaders = [
      'Product Name',
      'Category',
      'Total Sold',
      'Total Revenue',
      'Average Price',
      'Order Count'
    ];

    let csvContent = csvHeaders.join(',') + '\n';

    Object.values(productStats).forEach(product => {
      const averagePrice = product.totalSold ? product.totalRevenue / product.totalSold : 0;
      const row = [
        `"${product.productName}"`,
        product.category,
        product.totalSold,
        product.totalRevenue.toFixed(2),
        averagePrice.toFixed(2),
        product.orderCount
      ];
      csvContent += row.join(',') + '\n';
    });

    // Set headers for CSV download
    const filename = `analytics_${sellerId}_${period}_${new Date().toISOString().slice(0, 10)}.csv`;
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(csvContent);

  } catch (err) {
    console.error('Export analytics CSV error:', err);
    next(err);
  }
};

// Additional admin controller methods for orders, dashboard, analytics can be added here
