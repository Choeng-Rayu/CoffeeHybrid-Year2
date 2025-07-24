import { OrderItem, Order, Product, User } from './models/index.js';
import { Op } from 'sequelize';

async function testData() {
  try {
    console.log('🔍 Testing database data...');
    
    // Test basic data existence
    const orderCount = await Order.count();
    const productCount = await Product.count();
    const orderItemCount = await OrderItem.count();
    
    console.log(`📊 Database counts:`);
    console.log(`   Orders: ${orderCount}`);
    console.log(`   Products: ${productCount}`);
    console.log(`   OrderItems: ${orderItemCount}`);
    
    if (orderItemCount === 0) {
      console.log('⚠️  No OrderItems found - this is why analytics shows 0');
      return;
    }
    
    // Test a seller's data
    const sellers = await User.findAll({ where: { role: 'seller' }, limit: 1 });
    if (sellers.length === 0) {
      console.log('⚠️  No sellers found');
      return;
    }
    
    const sellerId = sellers[0].id;
    console.log(`\n🏪 Testing seller: ${sellers[0].username} (ID: ${sellerId})`);
    
    // Test the actual query used in analytics
    const items = await OrderItem.findAll({
      include: [
        { model: Product, as: 'product', where: { sellerId } },
        { model: Order, as: 'order', required: true }
      ],
      limit: 5
    });
    
    console.log(`📦 OrderItems for seller ${sellerId}: ${items.length}`);
    
    if (items.length > 0) {
      console.log('✅ Sample item:', {
        id: items[0].id,
        productName: items[0].product?.name,
        price: items[0].price,
        quantity: items[0].quantity,
        orderId: items[0].orderId
      });
      
      // Test analytics calculation
      const totalRevenue = items.reduce((sum, item) => sum + (item.price || 0), 0);
      const totalQuantity = items.reduce((sum, item) => sum + (item.quantity || 0), 0);
      const orderIds = new Set(items.map(i => i.orderId));
      
      console.log('📈 Analytics preview:', {
        totalOrders: orderIds.size,
        totalRevenue: totalRevenue.toFixed(2),
        totalItemsSold: totalQuantity
      });
    } else {
      console.log('⚠️  No items found for this seller - checking products...');
      
      const sellerProducts = await Product.findAll({ where: { sellerId } });
      console.log(`   Seller has ${sellerProducts.length} products`);
      
      if (sellerProducts.length > 0) {
        console.log('   Sample product:', sellerProducts[0].name);
        
        // Check if any orders exist with this seller's products
        const ordersWithSellerProducts = await OrderItem.findAll({
          include: [
            { model: Product, as: 'product', where: { sellerId } }
          ]
        });
        console.log(`   OrderItems with seller products (without Order filter): ${ordersWithSellerProducts.length}`);
      }
    }
    
  } catch (error) {
    console.error('❌ Test error:', error.message);
    console.error('Stack:', error.stack);
  }
}

testData();
