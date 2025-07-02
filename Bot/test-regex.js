// Test the regex pattern used for add-on selection
const testTexts = [
  '➕ Decaf',
  '➕ Oat Milk', 
  '➕ Extra Shot',
  '✅ Decaf',
  '✅ Oat Milk',
  '✅ Add to Cart',
  '⬅️ Back to Customization'
];

const regex = /^[✅➕]\s/;

console.log('🧪 Testing add-on regex pattern:', regex);
console.log('');

testTexts.forEach((text, index) => {
  const matches = regex.test(text);
  const extracted = text.replace(/^[✅➕]\s/, '');
  
  console.log(`${index + 1}. Text: "${text}"`);
  console.log(`   Matches: ${matches ? '✅' : '❌'}`);
  console.log(`   Extracted: "${extracted}"`);
  console.log('');
});

// Test specific cases
console.log('🔍 Specific tests:');
console.log('');

const addOnText = '➕ Decaf';
console.log(`Testing: "${addOnText}"`);
console.log(`Regex test: ${regex.test(addOnText)}`);
console.log(`Extracted name: "${addOnText.replace(/^[✅➕]\s/, '')}"`);
console.log('');

const cartText = '✅ Add to Cart';
console.log(`Testing: "${cartText}"`);
console.log(`Regex test: ${regex.test(cartText)}`);
console.log(`Should be skipped: ${cartText === '✅ Add to Cart'}`);
console.log('');

console.log('✅ Regex test completed!');
