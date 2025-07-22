import { sequelize, User, Product, OrderItem } from '../models/index.js';

async function insertData() {
  const users = [
    { username: 'customer1', email: 'customer1@example.com', password: 'password123', role: 'customer' },
    { username: 'seller1', email: 'seller1@example.com', password: 'password123', role: 'seller', shopName: 'Coffee Central' },
    { username: 'admin1', email: 'admin1@example.com', password: 'password123', role: 'admin' }
  ];

  const products = [
    { name: 'Americano', description: 'Rich espresso with hot water', category: 'hot', basePrice: 3.50, sellerId: 2 },
    { name: 'Latte', description: 'Espresso with steamed milk', category: 'hot', basePrice: 4.75, sellerId: 2 },
    { name: 'Cappuccino', description: 'Espresso with steamed milk foam', category: 'hot', basePrice: 4.25, sellerId: 2 }
  ];

  const orderItems = [
    { name: 'Americano', size: 'medium', sugarLevel: 'medium', iceLevel: 'none', addOns: [{ name: 'Extra Shot', price: 0.75 }], price: 3.75, quantity: 1 },
    { name: 'Latte', size: 'large', sugarLevel: 'low', iceLevel: 'none', addOns: [{ name: 'Vanilla Syrup', price: 0.50 }], price: 5.25, quantity: 2 },
    { name: 'Cappuccino', size: 'small', sugarLevel: 'none', iceLevel: 'none', addOns: [], price: 4.00, quantity: 1 }
  ];

  try {
    await sequelize.sync();
    await User.bulkCreate(users);
    await Product.bulkCreate(products);
    await OrderItem.bulkCreate(orderItems);
    console.log('✅ Successfully inserted data into users, products, and order_items tables');
  } catch (error) {
    console.error('❌ Error inserting data:', error);
  }
}

insertData();
