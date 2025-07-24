import { sequelize, User, Product, Order, OrderItem, CartItem } from '../models/index.js';
import dotenv from 'dotenv';

dotenv.config();

async function setupCloudDatabase() {
  try {
    console.log('🔄 Setting up cloud database (Aiven)...');
    
    // Test database connection
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully.');
    
    // Check if we need to disable foreign key checks temporarily
    console.log('🔧 Configuring database for cloud setup...');
    
    // Step 1: Create tables in the correct order (parent tables first)
    console.log('📋 Creating tables in dependency order...');
    
    // 1. Create User table first (no dependencies)
    console.log('   Creating Users table...');
    await User.sync({ force: false, alter: true });
    
    // 2. Create Product table (depends on User via sellerId)
    console.log('   Creating Products table...');
    await Product.sync({ force: false, alter: true });
    
    // 3. Create Order table (depends on User via userId)
    console.log('   Creating Orders table...');
    await Order.sync({ force: false, alter: true });
    
    // 4. Create OrderItem table (depends on Order and Product)
    console.log('   Creating OrderItems table...');
    await OrderItem.sync({ force: false, alter: true });
    
    // 5. Create CartItem table (depends on User and Product)
    console.log('   Creating CartItems table...');
    await CartItem.sync({ force: false, alter: true });
    
    console.log('✅ All tables created successfully!');
    
    // Step 2: Add foreign key constraints manually if needed
    console.log('🔗 Setting up foreign key relationships...');
    
    try {
      // Add foreign key constraints using raw SQL for better control
      const queryInterface = sequelize.getQueryInterface();
      
      // Check if foreign keys already exist before adding them
      const [results] = await sequelize.query(`
        SELECT CONSTRAINT_NAME 
        FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
        WHERE TABLE_SCHEMA = DATABASE() 
        AND CONSTRAINT_NAME LIKE '%_ibfk_%'
      `);
      
      if (results.length === 0) {
        console.log('   Adding foreign key constraints...');
        
        // Add foreign keys for Orders table
        await sequelize.query(`
          ALTER TABLE orders 
          ADD CONSTRAINT fk_orders_user 
          FOREIGN KEY (userId) REFERENCES users(id) 
          ON DELETE CASCADE ON UPDATE CASCADE
        `);
        
        // Add foreign keys for Products table
        await sequelize.query(`
          ALTER TABLE products 
          ADD CONSTRAINT fk_products_seller 
          FOREIGN KEY (sellerId) REFERENCES users(id) 
          ON DELETE CASCADE ON UPDATE CASCADE
        `);
        
        // Add foreign keys for OrderItems table
        await sequelize.query(`
          ALTER TABLE OrderItems 
          ADD CONSTRAINT fk_orderitems_order 
          FOREIGN KEY (orderId) REFERENCES orders(id) 
          ON DELETE CASCADE ON UPDATE CASCADE
        `);
        
        await sequelize.query(`
          ALTER TABLE OrderItems 
          ADD CONSTRAINT fk_orderitems_product 
          FOREIGN KEY (productId) REFERENCES products(id) 
          ON DELETE CASCADE ON UPDATE CASCADE
        `);
        
        // Add foreign keys for CartItems table
        await sequelize.query(`
          ALTER TABLE CartItems 
          ADD CONSTRAINT fk_cartitems_user 
          FOREIGN KEY (userId) REFERENCES users(id) 
          ON DELETE CASCADE ON UPDATE CASCADE
        `);
        
        await sequelize.query(`
          ALTER TABLE CartItems 
          ADD CONSTRAINT fk_cartitems_product 
          FOREIGN KEY (productId) REFERENCES products(id) 
          ON DELETE CASCADE ON UPDATE CASCADE
        `);
        
        console.log('✅ Foreign key constraints added successfully!');
      } else {
        console.log('✅ Foreign key constraints already exist.');
      }
      
    } catch (fkError) {
      console.log('⚠️  Foreign key constraints may already exist or be handled by Sequelize associations.');
      console.log('   This is normal for cloud databases. Continuing...');
    }
    
    console.log('\n📊 Database setup complete!');
    console.log('📋 Tables created:');
    console.log('   - users (base table)');
    console.log('   - products (references users.sellerId)');
    console.log('   - orders (references users.userId)');
    console.log('   - OrderItems (references orders.orderId, products.productId)');
    console.log('   - CartItems (references users.userId, products.productId)');
    
    console.log('\n🔗 Associations configured:');
    console.log('   - User ↔ Product (seller relationship)');
    console.log('   - User ↔ Order (customer relationship)');
    console.log('   - User ↔ CartItem (cart ownership)');
    console.log('   - Order ↔ OrderItem (order contents)');
    console.log('   - Product ↔ OrderItem (product details)');
    console.log('   - Product ↔ CartItem (cart contents)');
    
    console.log('\n🎯 Next steps:');
    console.log('   1. Run: npm run insert-sample-data');
    console.log('   2. Test the application');
    console.log('   3. Verify foreign key relationships work correctly');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error setting up cloud database:', error);
    console.error('\n🔍 Troubleshooting tips:');
    console.error('   1. Check your .env file has correct Aiven credentials');
    console.error('   2. Ensure ca.pem file exists in Backend/ directory');
    console.error('   3. Verify your Aiven database allows foreign key constraints');
    console.error('   4. Check if tables already exist and have data');
    process.exit(1);
  }
}

setupCloudDatabase();
