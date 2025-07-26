import { sequelize, User, Product, Order, OrderItem, CartItem } from '../models/index.js';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Database optimization script
 * Adds indexes and optimizes database performance
 */

async function optimizeDatabase() {
  try {
    console.log('🔧 Starting database optimization...');

    // Connect to database
    await sequelize.authenticate();
    console.log('✅ Connected to database');

    // Add indexes for better query performance
    console.log('📊 Adding database indexes...');

    // User table indexes
    await sequelize.query(`
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    `);
    await sequelize.query(`
      CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
    `);
    await sequelize.query(`
      CREATE INDEX IF NOT EXISTS idx_users_google_id ON users(googleId);
    `);
    await sequelize.query(`
      CREATE INDEX IF NOT EXISTS idx_users_telegram_id ON users(telegramId);
    `);
    await sequelize.query(`
      CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
    `);
    await sequelize.query(`
      CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(createdAt);
    `);

    // Product table indexes
    await sequelize.query(`
      CREATE INDEX IF NOT EXISTS idx_products_seller_id ON products(sellerId);
    `);
    await sequelize.query(`
      CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
    `);
    await sequelize.query(`
      CREATE INDEX IF NOT EXISTS idx_products_available ON products(available);
    `);
    await sequelize.query(`
      CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(createdAt);
    `);

    // Order table indexes
    await sequelize.query(`
      CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(userId);
    `);
    await sequelize.query(`
      CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
    `);
    await sequelize.query(`
      CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(createdAt);
    `);
    await sequelize.query(`
      CREATE INDEX IF NOT EXISTS idx_orders_qr_code ON orders(qrCode);
    `);

    // OrderItem table indexes
    await sequelize.query(`
      CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON orderitems(orderId);
    `);
    await sequelize.query(`
      CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON orderitems(productId);
    `);

    // CartItem table indexes
    await sequelize.query(`
      CREATE INDEX IF NOT EXISTS idx_cart_items_user_id ON cartitems(userId);
    `);
    await sequelize.query(`
      CREATE INDEX IF NOT EXISTS idx_cart_items_product_id ON cartitems(productId);
    `);
    await sequelize.query(`
      CREATE INDEX IF NOT EXISTS idx_cart_items_session_id ON cartitems(sessionId);
    `);
    await sequelize.query(`
      CREATE INDEX IF NOT EXISTS idx_cart_items_active ON cartitems(active);
    `);

    // Composite indexes for common queries
    await sequelize.query(`
      CREATE INDEX IF NOT EXISTS idx_users_email_password ON users(email, password);
    `);
    await sequelize.query(`
      CREATE INDEX IF NOT EXISTS idx_users_username_password ON users(username, password);
    `);
    await sequelize.query(`
      CREATE INDEX IF NOT EXISTS idx_orders_user_status ON orders(userId, status);
    `);
    await sequelize.query(`
      CREATE INDEX IF NOT EXISTS idx_cart_items_user_active ON cartitems(userId, active);
    `);
    await sequelize.query(`
      CREATE INDEX IF NOT EXISTS idx_cart_items_session_active ON cartitems(sessionId, active);
    `);

    console.log('✅ Database indexes created successfully');

    // Analyze tables for better query optimization
    console.log('📈 Analyzing tables for optimization...');
    
    const tables = ['users', 'products', 'orders', 'orderitems', 'cartitems'];
    for (const table of tables) {
      await sequelize.query(`ANALYZE TABLE ${table};`);
    }

    console.log('✅ Table analysis completed');

    // Get database statistics
    console.log('📊 Database Statistics:');
    
    const userCount = await User.count();
    const productCount = await Product.count();
    const orderCount = await Order.count();
    const cartItemCount = await CartItem.count();

    console.log(`   Users: ${userCount}`);
    console.log(`   Products: ${productCount}`);
    console.log(`   Orders: ${orderCount}`);
    console.log(`   Cart Items: ${cartItemCount}`);

    // Check for potential issues
    console.log('🔍 Checking for potential issues...');
    
    // Check for users without proper indexes
    const usersWithoutEmail = await User.count({ where: { email: null } });
    const usersWithoutUsername = await User.count({ where: { username: null } });
    
    if (usersWithoutEmail > 0) {
      console.warn(`⚠️  Found ${usersWithoutEmail} users without email`);
    }
    
    if (usersWithoutUsername > 0) {
      console.warn(`⚠️  Found ${usersWithoutUsername} users without username`);
    }

    // Check for orphaned records
    const orphanedOrderItems = await sequelize.query(`
      SELECT COUNT(*) as count FROM orderitems oi 
      LEFT JOIN orders o ON oi.orderId = o.id 
      WHERE o.id IS NULL
    `, { type: sequelize.QueryTypes.SELECT });

    if (orphanedOrderItems[0].count > 0) {
      console.warn(`⚠️  Found ${orphanedOrderItems[0].count} orphaned order items`);
    }

    console.log('🎉 Database optimization completed successfully!');

  } catch (error) {
    console.error('❌ Database optimization failed:', error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

// Run optimization if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  optimizeDatabase();
}

export default optimizeDatabase;
