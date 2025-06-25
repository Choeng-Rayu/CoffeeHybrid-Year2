import mongoose from 'mongoose';
import Product from './models/Product.js';

mongoose.connect('mongodb+srv://choengrayu233:VuC7KNrmUI1bgQ8L@cluster0.bvsjf4v.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0');

async function debugBotAddOns() {
  try {
    console.log('🔍 Debugging bot add-on selection issue...');
    
    // Get all products with add-ons
    const products = await Product.find({ 
      addOns: { $exists: true, $not: { $size: 0 } } 
    });
    
    console.log(`\n📦 Found ${products.length} products with add-ons:`);
    
    products.forEach((product, index) => {
      console.log(`\n${index + 1}. Product: ${product.name}`);
      console.log(`   Category: ${product.category}`);
      console.log(`   Add-ons: ${product.addOns.length}`);
      
      product.addOns.forEach((addOn, addOnIndex) => {
        console.log(`     ${addOnIndex + 1}. Name: "${addOn.name}"`);
        console.log(`        Price: $${addOn.price}`);
        console.log(`        Name length: ${addOn.name.length}`);
        console.log(`        Name chars: [${addOn.name.split('').map(c => c.charCodeAt(0)).join(', ')}]`);
        
        // Test the regex extraction
        const buttonText1 = `➕ ${addOn.name}`;
        const buttonText2 = `✅ ${addOn.name}`;
        const extracted1 = buttonText1.replace(/^[✅➕]\s/, '');
        const extracted2 = buttonText2.replace(/^[✅➕]\s/, '');
        
        console.log(`        Button text 1: "${buttonText1}"`);
        console.log(`        Extracted 1: "${extracted1}"`);
        console.log(`        Match 1: ${extracted1 === addOn.name}`);
        console.log(`        Button text 2: "${buttonText2}"`);
        console.log(`        Extracted 2: "${extracted2}"`);
        console.log(`        Match 2: ${extracted2 === addOn.name}`);
      });
    });
    
    // Test specific scenarios
    console.log('\n🧪 Testing specific scenarios:');
    
    if (products.length > 0) {
      const testProduct = products[0];
      console.log(`\nTesting with product: ${testProduct.name}`);
      
      if (testProduct.addOns.length > 0) {
        const testAddOn = testProduct.addOns[0];
        console.log(`Testing with add-on: "${testAddOn.name}"`);
        
        // Simulate the bot logic
        const simulatedButtonText = `➕ ${testAddOn.name}`;
        console.log(`Simulated button text: "${simulatedButtonText}"`);
        
        const extractedName = simulatedButtonText.replace(/^[✅➕]\s/, '');
        console.log(`Extracted name: "${extractedName}"`);
        
        const foundAddOn = testProduct.addOns.find(a => a.name === extractedName);
        console.log(`Found add-on: ${foundAddOn ? 'YES' : 'NO'}`);
        
        if (!foundAddOn) {
          console.log('❌ This would cause "Invalid add-on selection" error!');
          
          // Check for potential issues
          console.log('\n🔍 Debugging potential issues:');
          console.log(`Original name: "${testAddOn.name}"`);
          console.log(`Extracted name: "${extractedName}"`);
          console.log(`Names equal: ${testAddOn.name === extractedName}`);
          console.log(`Original length: ${testAddOn.name.length}`);
          console.log(`Extracted length: ${extractedName.length}`);
          
          // Check for whitespace issues
          console.log(`Original trimmed: "${testAddOn.name.trim()}"`);
          console.log(`Extracted trimmed: "${extractedName.trim()}"`);
          console.log(`Trimmed equal: ${testAddOn.name.trim() === extractedName.trim()}`);
          
        } else {
          console.log('✅ This would work correctly!');
        }
      }
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

debugBotAddOns();
