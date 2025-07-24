import { Order, OrderItem, Product } from './models/index.js';

async function checkOrders() {
  try {
    console.log('📋 Checking orders in database...\n');
    
    const orders = await Order.findAll({
      include: [{
        model: OrderItem,
        as: 'items',
        include: [{
          model: Product,
          as: 'product'
        }]
      }]
    });
    
    console.log(`Found ${orders.length} orders:\n`);
    
    orders.forEach((order, i) => {
      console.log(`${i+1}. Order ${order.id}:`);
      console.log(`   Status: ${order.status}`);
      console.log(`   Total: $${order.total}`);
      console.log(`   Items: ${order.items.length}`);
      console.log(`   Created: ${order.createdAt}`);
      
      order.items.forEach((item, j) => {
        console.log(`   Item ${j+1}: ${item.name}`);
        console.log(`     Product ID: ${item.productId}`);
        console.log(`     Seller ID: ${item.product?.sellerId || 'N/A'}`);
        console.log(`     Price: $${item.price}`);
        console.log(`     Quantity: ${item.quantity}`);
      });
      console.log('');
    });
    
    // Check specifically for seller ID 2
    console.log('🔍 Checking orders for seller ID 2...\n');
    
    const seller2Orders = orders.filter(order => 
      order.items.some(item => item.product && item.product.sellerId === 2)
    );
    
    console.log(`Found ${seller2Orders.length} orders for seller 2:`);
    seller2Orders.forEach((order, i) => {
      console.log(`${i+1}. Order ${order.id}: status=${order.status}, total=$${order.total}`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkOrders();
