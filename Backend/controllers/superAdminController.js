import { User, Product, Order, OrderItem, sequelize } from '../models/index.js';
import { Op } from 'sequelize';
import bcrypt from 'bcryptjs';

// Get comprehensive dashboard overview
export const getSuperAdminDashboard = async (req, res, next) => {
  try {
    // Get total counts
    const totalUsers = await User.count({ where: { role: 'customer' } });
    const totalSellers = await User.count({ where: { role: 'seller' } });
    const totalAdmins = await User.count({ where: { role: 'admin' } });
    const totalProducts = await Product.count();
    const totalOrders = await Order.count();

    // Get orders by status
    const ordersByStatus = await Order.findAll({
      attributes: ['status', [sequelize.fn('COUNT', sequelize.col('status')), 'count']],
      group: ['status'],
      raw: true
    });

    // Get recent orders (last 10)
    const recentOrders = await Order.findAll({
      limit: 10,
      order: [['createdAt', 'DESC']],
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'email']
        },
        {
          model: OrderItem,
          as: 'items',
          attributes: ['name', 'quantity', 'price']
        }
      ]
    });

    // Get revenue statistics
    const totalRevenue = await Order.sum('total', {
      where: { status: 'completed' }
    }) || 0;

    const todayRevenue = await Order.sum('total', {
      where: {
        status: 'completed',
        createdAt: {
          [Op.gte]: new Date(new Date().setHours(0, 0, 0, 0))
        }
      }
    }) || 0;

    // Get top sellers by revenue
    const topSellers = await User.findAll({
      where: { role: 'seller' },
      attributes: ['id', 'username', 'email', 'shopName'],
      include: [
        {
          model: Product,
          as: 'products',
          attributes: ['id'],
          include: [
            {
              model: OrderItem,
              as: 'orderItems',
              attributes: ['price', 'quantity'],
              include: [
                {
                  model: Order,
                  as: 'order',
                  where: { status: 'completed' },
                  attributes: []
                }
              ]
            }
          ]
        }
      ],
      limit: 5
    });

    // Calculate seller revenues
    const sellersWithRevenue = topSellers.map(seller => {
      let totalRevenue = 0;
      seller.products.forEach(product => {
        product.orderItems.forEach(item => {
          totalRevenue += item.price * item.quantity;
        });
      });
      return {
        id: seller.id,
        username: seller.username,
        email: seller.email,
        shopName: seller.shopName,
        totalRevenue,
        productCount: seller.products.length
      };
    }).sort((a, b) => b.totalRevenue - a.totalRevenue);

    res.json({
      success: true,
      dashboard: {
        overview: {
          totalUsers,
          totalSellers,
          totalAdmins,
          totalProducts,
          totalOrders,
          totalRevenue,
          todayRevenue
        },
        ordersByStatus: ordersByStatus.reduce((acc, item) => {
          acc[item.status] = parseInt(item.count);
          return acc;
        }, {}),
        recentOrders,
        topSellers: sellersWithRevenue
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get all sellers with their statistics
export const getAllSellers = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search = '' } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = {
      role: 'seller',
      ...(search && {
        [Op.or]: [
          { username: { [Op.like]: `%${search}%` } },
          { email: { [Op.like]: `%${search}%` } },
          { shopName: { [Op.like]: `%${search}%` } }
        ]
      })
    };

    const sellers = await User.findAndCountAll({
      where: whereClause,
      attributes: ['id', 'username', 'email', 'shopName', 'createdAt', 'isBlocked'],
      include: [
        {
          model: Product,
          as: 'products',
          attributes: ['id', 'available']
        }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']]
    });

    // Calculate statistics for each seller
    const sellersWithStats = await Promise.all(
      sellers.rows.map(async (seller) => {
        const totalOrders = await Order.count({
          include: [
            {
              model: OrderItem,
              as: 'items',
              include: [
                {
                  model: Product,
                  as: 'product',
                  where: { sellerId: seller.id }
                }
              ]
            }
          ]
        });

        const totalRevenue = await Order.sum('total', {
          where: { status: 'completed' },
          include: [
            {
              model: OrderItem,
              as: 'items',
              include: [
                {
                  model: Product,
                  as: 'product',
                  where: { sellerId: seller.id }
                }
              ]
            }
          ]
        }) || 0;

        return {
          ...seller.toJSON(),
          stats: {
            totalProducts: seller.products.length,
            activeProducts: seller.products.filter(p => p.available).length,
            totalOrders,
            totalRevenue
          }
        };
      })
    );

    res.json({
      success: true,
      sellers: sellersWithStats,
      pagination: {
        total: sellers.count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(sellers.count / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

// Create new seller account
export const createSeller = async (req, res, next) => {
  try {
    const { username, email, password, shopName, firstName, lastName } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({
      where: {
        [Op.or]: [{ email }, { username }]
      }
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'User with this email or username already exists'
      });
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create seller
    const seller = await User.create({
      username,
      email,
      password: hashedPassword,
      role: 'seller',
      shopName,
      firstName,
      lastName,
      authProvider: 'local',
      isEmailVerified: true
    });

    res.status(201).json({
      success: true,
      message: 'Seller account created successfully',
      seller: {
        id: seller.id,
        username: seller.username,
        email: seller.email,
        shopName: seller.shopName,
        role: seller.role
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get all orders with seller information
export const getAllOrders = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status, sellerId, startDate, endDate } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = {};
    if (status) whereClause.status = status;
    if (startDate) whereClause.createdAt = { [Op.gte]: new Date(startDate) };
    if (endDate) {
      whereClause.createdAt = {
        ...whereClause.createdAt,
        [Op.lte]: new Date(endDate)
      };
    }

    const orders = await Order.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'email']
        },
        {
          model: OrderItem,
          as: 'items',
          include: [
            {
              model: Product,
              as: 'product',
              attributes: ['id', 'name', 'sellerId'],
              include: [
                {
                  model: User,
                  as: 'seller',
                  attributes: ['id', 'username', 'shopName'],
                  where: sellerId ? { id: sellerId } : undefined
                }
              ]
            }
          ]
        }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      orders: orders.rows,
      pagination: {
        total: orders.count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(orders.count / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

// Toggle seller status (block/unblock)
export const toggleSellerStatus = async (req, res, next) => {
  try {
    const { sellerId } = req.params;
    const { isBlocked } = req.body;

    const seller = await User.findOne({
      where: { id: sellerId, role: 'seller' }
    });

    if (!seller) {
      return res.status(404).json({
        success: false,
        error: 'Seller not found'
      });
    }

    seller.isBlocked = isBlocked;
    await seller.save();

    res.json({
      success: true,
      message: `Seller ${isBlocked ? 'blocked' : 'unblocked'} successfully`,
      seller: {
        id: seller.id,
        username: seller.username,
        isBlocked: seller.isBlocked
      }
    });
  } catch (error) {
    next(error);
  }
};
