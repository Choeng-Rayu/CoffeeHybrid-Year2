import { sequelize, User, Product, Order, OrderItem, CartItem } from '../models/index.js';
import dotenv from 'dotenv';

dotenv.config();

async function syncDatabase() {
  try {
    console.log('🔄 Starting database synchronization...');
    
    // Test database connection
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully.');
    
    // Drop all tables and recreate them (use with caution!)
    console.log('⚠️  Dropping existing tables and recreating...');
    await sequelize.sync({ force: true });
    
    console.log('✅ Database synchronized successfully!');
    console.log('\n📊 Tables created:');
    console.log('   - users');
    console.log('   - products');
    console.log('   - orders');
    console.log('   - OrderItems');
    console.log('   - CartItems (new - for persistent cart)');
    
    console.log('\n🔧 Database structure updated to match MongoDB schema:');
    console.log('   ✅ Order model: Added qrToken, orderSource, customerInfo, pickupTime, expiresAt');
    console.log('   ✅ OrderItem model: Added productId, orderId, proper enums for size/sugar/ice levels');
    console.log('   ✅ Product model: Added preparationTime, featured fields');
    console.log('   ✅ Proper associations between Order ↔ OrderItem ↔ Product');
    
    console.log('\n🎯 Next steps:');
    console.log('   1. Run: npm run insert-data (to populate with sample data)');
    console.log('   2. Test the application with cart functionality');
    console.log('   3. Verify orders persist after page refresh');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error synchronizing database:', error);
    process.exit(1);
  }
}

syncDatabase();
