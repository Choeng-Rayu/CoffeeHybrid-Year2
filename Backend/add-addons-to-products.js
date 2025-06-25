import mongoose from 'mongoose';
import Product from './models/Product.js';

mongoose.connect('mongodb+srv://choengrayu233:VuC7KNrmUI1bgQ8L@cluster0.bvsjf4v.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0');

async function addAddOnsToProducts() {
  try {
    console.log('🔧 Adding add-ons to existing products...');
    
    // Get all products
    const products = await Product.find({});
    console.log(`Found ${products.length} products:`);
    
    products.forEach((product, index) => {
      console.log(`   ${index + 1}. ${product.name} (Category: ${product.category})`);
      console.log(`      Current add-ons: ${product.addOns?.length || 0}`);
    });
    
    // Define common add-ons for different categories
    const commonAddOns = [
      { name: 'Extra Shot', price: 1.00 },
      { name: 'Decaf', price: 0.00 },
      { name: 'Oat Milk', price: 0.60 },
      { name: 'Almond Milk', price: 0.60 },
      { name: 'Soy Milk', price: 0.50 }
    ];
    
    const hotDrinkAddOns = [
      ...commonAddOns,
      { name: 'Vanilla Syrup', price: 0.75 },
      { name: 'Caramel Syrup', price: 0.75 },
      { name: 'Hazelnut Syrup', price: 0.75 },
      { name: 'Cinnamon', price: 0.50 },
      { name: 'Whipped Cream', price: 0.75 }
    ];
    
    const coldDrinkAddOns = [
      ...commonAddOns,
      { name: 'Vanilla Syrup', price: 0.75 },
      { name: 'Caramel Syrup', price: 0.75 },
      { name: 'Chocolate Syrup', price: 0.75 },
      { name: 'Whipped Cream', price: 0.75 },
      { name: 'Ice Cream Scoop', price: 1.50 }
    ];
    
    const frappeAddOns = [
      ...commonAddOns,
      { name: 'Whipped Cream', price: 0.75 },
      { name: 'Caramel Drizzle', price: 0.50 },
      { name: 'Chocolate Chips', price: 0.60 },
      { name: 'Cookie Crumbs', price: 0.60 },
      { name: 'Ice Cream Scoop', price: 1.50 }
    ];
    
    console.log('\n🔧 Updating products with add-ons...');
    
    for (const product of products) {
      let addOnsToAdd = [];
      
      // Determine add-ons based on category
      if (product.category === 'hot') {
        addOnsToAdd = hotDrinkAddOns;
      } else if (product.category === 'cold' || product.category === 'iced') {
        addOnsToAdd = coldDrinkAddOns;
      } else if (product.category === 'frappe') {
        addOnsToAdd = frappeAddOns;
      } else {
        // Default to common add-ons
        addOnsToAdd = commonAddOns;
      }
      
      // Update the product
      await Product.findByIdAndUpdate(product._id, {
        $set: { addOns: addOnsToAdd }
      });
      
      console.log(`✅ Updated ${product.name} with ${addOnsToAdd.length} add-ons`);
    }
    
    console.log('\n🎉 All products updated with add-ons!');
    
    // Verify the updates
    console.log('\n🔍 Verifying updates...');
    const updatedProducts = await Product.find({});
    
    updatedProducts.forEach((product, index) => {
      console.log(`\n${index + 1}. ${product.name}`);
      console.log(`   Category: ${product.category}`);
      console.log(`   Add-ons: ${product.addOns.length}`);
      product.addOns.slice(0, 3).forEach((addOn, addOnIndex) => {
        console.log(`     ${addOnIndex + 1}. ${addOn.name} - $${addOn.price.toFixed(2)}`);
      });
      if (product.addOns.length > 3) {
        console.log(`     ... and ${product.addOns.length - 3} more`);
      }
    });
    
    console.log('\n✅ Bot add-on selection should now work correctly!');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

addAddOnsToProducts();
