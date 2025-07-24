import { sequelize, User, Product, Order, OrderItem } from '../models/index.js';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

async function insertSampleData() {
  try {
    console.log('🔄 Inserting sample data...');
    
    // Hash passwords
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    const users = [
      { 
        username: 'john_doe', 
        email: 'john@example.com', 
        password: hashedPassword, 
        role: 'customer',
        firstName: 'John',
        lastName: 'Doe',
        isEmailVerified: true
      },
      { 
        username: 'jane_smith', 
        email: 'jane@example.com', 
        password: hashedPassword, 
        role: 'seller', 
        shopName: 'Jane\'s Coffee',
        firstName: 'Jane',
        lastName: 'Smith',
        isEmailVerified: true
      },
      { 
        username: 'admin_user', 
        email: 'admin@example.com', 
        password: hashedPassword, 
        role: 'admin',
        firstName: 'Admin',
        lastName: 'User',
        isEmailVerified: true
      }
    ];

    const products = [
      { 
        name: 'Americano', 
        description: 'Strong black coffee', 
        category: 'hot', 
        basePrice: 3.00, 
        sellerId: 2, 
        shopName: 'Jane\'s Coffee', 
        available: true,
        sizes: [
          { name: 'small', priceModifier: -0.50 },
          { name: 'medium', priceModifier: 0 },
          { name: 'large', priceModifier: 0.75 }
        ],
        addOns: [
          { name: 'Extra Shot', price: 0.75 },
          { name: 'Decaf', price: 0 }
        ],
        preparationTime: 3,
        featured: true
      },
      { 
        name: 'Latte', 
        description: 'Coffee with steamed milk', 
        category: 'hot', 
        basePrice: 4.75, 
        sellerId: 2, 
        shopName: 'Jane\'s Coffee', 
        available: true,
        sizes: [
          { name: 'small', priceModifier: -0.50 },
          { name: 'medium', priceModifier: 0 },
          { name: 'large', priceModifier: 0.75 }
        ],
        addOns: [
          { name: 'Vanilla Syrup', price: 0.50 },
          { name: 'Caramel Syrup', price: 0.50 },
          { name: 'Extra Shot', price: 0.75 }
        ],
        preparationTime: 5,
        featured: false
      },
      { 
        name: 'Cappuccino', 
        description: 'Espresso with foamed milk', 
        category: 'hot', 
        basePrice: 4.00, 
        sellerId: 2, 
        shopName: 'Jane\'s Coffee', 
        available: true,
        sizes: [
          { name: 'small', priceModifier: -0.50 },
          { name: 'medium', priceModifier: 0 },
          { name: 'large', priceModifier: 0.75 }
        ],
        addOns: [
          { name: 'Cinnamon', price: 0.25 },
          { name: 'Chocolate Powder', price: 0.50 }
        ],
        preparationTime: 4,
        featured: true
      },
      { 
        name: 'Iced Coffee', 
        description: 'Cold brewed coffee over ice', 
        category: 'iced', 
        basePrice: 3.50, 
        sellerId: 2, 
        shopName: 'Jane\'s Coffee', 
        available: true,
        sizes: [
          { name: 'small', priceModifier: -0.50 },
          { name: 'medium', priceModifier: 0 },
          { name: 'large', priceModifier: 0.75 }
        ],
        addOns: [
          { name: 'Vanilla Syrup', price: 0.50 },
          { name: 'Simple Syrup', price: 0.25 }
        ],
        preparationTime: 2,
        featured: false
      }
    ];

    // Insert users first
    const createdUsers = await User.bulkCreate(users, { returning: true });
    console.log(`✅ Inserted ${createdUsers.length} users`);
    
    // Insert products
    const createdProducts = await Product.bulkCreate(products, { returning: true });
    console.log(`✅ Inserted ${createdProducts.length} products`);
    
    // Create a sample order
    const sampleOrder = await Order.create({
      userId: 1, // john_doe
      total: 4.25,
      qrToken: uuidv4(),
      orderSource: 'web',
      customerInfo: {
        name: 'John Doe',
        phone: '+1234567890'
      },
      status: 'pending'
    });
    
    // Create order items for the sample order
    await OrderItem.create({
      orderId: sampleOrder.id,
      productId: 1, // Americano
      name: 'Americano',
      size: 'medium',
      sugarLevel: 'medium',
      iceLevel: 'none',
      addOns: [{ name: 'Extra Shot', price: 0.75 }],
      price: 3.75,
      quantity: 1
    });
    
    console.log(`✅ Created sample order with ID: ${sampleOrder.id}`);
    console.log('✅ Successfully inserted all sample data!');
    
    console.log('\n📊 Summary:');
    console.log(`   - ${createdUsers.length} users created`);
    console.log(`   - ${createdProducts.length} products created`);
    console.log(`   - 1 sample order created`);
    console.log(`   - 1 order item created`);
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error inserting data:', error);
    process.exit(1);
  }
}

insertSampleData();
