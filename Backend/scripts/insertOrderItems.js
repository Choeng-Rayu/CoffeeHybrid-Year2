import { sequelize } from '../models/index.js';
import OrderItem from '../models/Order.js';

async function insertOrderItems() {
  const items = [
    { name: 'Americano', size: 'medium', sugarLevel: 'medium', iceLevel: 'none', addOns: [{ name: 'Extra Shot', price: 0.75 }], price: 3.75, quantity: 1 },
    { name: 'Latte', size: 'large', sugarLevel: 'low', iceLevel: 'none', addOns: [{ name: 'Vanilla Syrup', price: 0.50 }], price: 5.25, quantity: 2 },
    { name: 'Cappuccino', size: 'small', sugarLevel: 'none', iceLevel: 'none', addOns: [], price: 4.00, quantity: 1 },
    { name: 'Mocha', size: 'medium', sugarLevel: 'high', iceLevel: 'none', addOns: [{ name: 'Chocolate Syrup', price: 0.75 }], price: 5.50, quantity: 1 },
    { name: 'Cold Brew', size: 'large', sugarLevel: 'medium', iceLevel: 'high', addOns: [{ name: 'Caramel Syrup', price: 0.50 }], price: 4.75, quantity: 1 },
    { name: 'Flat White', size: 'medium', sugarLevel: 'low', iceLevel: 'none', addOns: [], price: 4.50, quantity: 1 },
    { name: 'Iced Americano', size: 'medium', sugarLevel: 'none', iceLevel: 'high', addOns: [], price: 3.75, quantity: 1 },
    { name: 'Frappuccino', size: 'large', sugarLevel: 'medium', iceLevel: 'high', addOns: [{ name: 'Whipped Cream', price: 0.75 }], price: 6.00, quantity: 1 },
    { name: 'Espresso', size: 'small', sugarLevel: 'none', iceLevel: 'none', addOns: [], price: 2.50, quantity: 1 },
    { name: 'Matcha Latte', size: 'medium', sugarLevel: 'low', iceLevel: 'none', addOns: [{ name: 'Honey', price: 0.50 }], price: 5.00, quantity: 1 }
  ];

  try {
    await sequelize.sync();
    await OrderItem.bulkCreate(items);
    console.log('✅ Successfully inserted 10 rows into the order_items table');
  } catch (error) {
    console.error('❌ Error inserting rows:', error);
  }
}

insertOrderItems();
