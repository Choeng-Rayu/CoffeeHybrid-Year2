console.log('🚀 Bot script starting...');

import { Telegraf, Markup } from 'telegraf';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import qr from 'qr-image';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

console.log('📦 Imports loaded successfully');
dotenv.config();
console.log('⚙️ Environment config loaded');

const bot = new Telegraf(process.env.BOT_TOKEN);
const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:5000/api';

// User session storage (in production, use Redis or database)
const userSessions = new Map();

// API helper functions
const api = {
  async registerUser(telegramData) {
    const response = await axios.post(`${API_BASE_URL}/auth/register-telegram`, telegramData);
    return response.data;
  },

  async getMenu(category = null, page = 1, limit = 10) {
    const url = category ? `${API_BASE_URL}/menu/category/${category}` : `${API_BASE_URL}/menu`;
    const response = await axios.get(url, {
      params: { page, limit }
    });
    return response.data;
  },

  async createOrder(orderData) {
    const response = await axios.post(`${API_BASE_URL}/orders`, orderData);
    return response.data;
  },

  async getUserOrders(userId) {
    const response = await axios.get(`${API_BASE_URL}/orders/user/${userId}`);
    return response.data;
  }
};

// Helper functions
function getUserSession(userId) {
  if (!userSessions.has(userId)) {
    userSessions.set(userId, {
      user: null,
      cart: [],
      currentProduct: null,
      customization: {}
    });
  }
  return userSessions.get(userId);
}

function formatPrice(price) {
  return `$${price.toFixed(2)}`;
}

function calculateItemPrice(product, customizations) {
  let price = product.basePrice;

  // Add size modifier
  if (customizations.size && product.sizes) {
    const sizeOption = product.sizes.find(s => s.name === customizations.size);
    if (sizeOption) {
      price += sizeOption.priceModifier;
    }
  }

  // Add add-ons price
  if (customizations.addOns && customizations.addOns.length > 0) {
    const addOnsPrice = customizations.addOns.reduce((total, addOn) => total + addOn.price, 0);
    price += addOnsPrice;
  }

  return price * (customizations.quantity || 1);
}

// Bot commands and handlers
bot.start(async (ctx) => {
  const telegramUser = ctx.from;
  const session = getUserSession(telegramUser.id);

  console.log(`👤 User started bot: ${telegramUser.first_name} (@${telegramUser.username || 'no_username'}) - ID: ${telegramUser.id}`);

  try {
    // Register or get existing user
    const userData = {
      telegramId: telegramUser.id.toString(),
      username: telegramUser.username || `user_${telegramUser.id}`,
      firstName: telegramUser.first_name,
      lastName: telegramUser.last_name
    };

    const response = await api.registerUser(userData);
    session.user = response.user;

    const welcomeMessage = `
☕ Welcome to CoffeeHybrid Bot! ☕

Hello ${telegramUser.first_name || 'there'}! 

I'm here to help you order delicious coffee with ease. Here's what you can do:

🍵 Browse our menu
🛒 Add items to cart
📱 Get QR codes for pickup
📋 View your order history

Use the menu below to get started!
    `;

    await ctx.reply(welcomeMessage, Markup.keyboard([
      ['🍵 Browse Menu', '🛒 View Cart'],
      ['📋 My Orders', '❓ Help']
    ]).resize());

  } catch (error) {
    console.error('Error in start command:', error);
    await ctx.reply('Sorry, there was an error setting up your account. Please try again later.');
  }
});

bot.hears('🍵 Browse Menu', async (ctx) => {
  console.log(`📋 User browsing menu: ${ctx.from.first_name} (ID: ${ctx.from.id})`);

  const menuKeyboard = Markup.keyboard([
    ['☕ Hot Coffee', '🧊 Iced Coffee'],
    ['🥤 Frappes', '📋 All Items'],
    ['🛒 View Cart', '🏠 Main Menu']
  ]).resize();

  await ctx.reply('What type of coffee would you like to explore?', menuKeyboard);
});

// Handle category selection and pagination
async function handleCategoryMenu(ctx, page = 1) {
  const categoryMap = {
    '☕ Hot Coffee': 'hot',
    '🧊 Iced Coffee': 'iced',
    '🥤 Frappes': 'frappe',
    '📋 All Items': null
  };

  const session = getUserSession(ctx.from.id);
  const category = categoryMap[ctx.message.text] || session.currentCategory;
  const categoryName = ctx.message.text || session.currentCategoryName;

  console.log(`☕ User selected category: ${categoryName} (${category || 'all'}) - Page: ${page} - User: ${ctx.from.first_name}`);

  try {
    const menuData = await api.getMenu(category, page, 10);
    const products = menuData.products;
    const pagination = menuData.pagination;

    if (products.length === 0) {
      await ctx.reply('No items available in this category right now.');
      return;
    }

    let message = `${categoryName}\n\n`;

    // Add pagination info
    if (pagination) {
      message += `📄 Page ${pagination.currentPage} of ${pagination.totalPages} (${pagination.totalProducts} items)\n\n`;
    }

    const buttons = [];
    const startIndex = ((page - 1) * 10) + 1;

    products.forEach((product, index) => {
      const priceRange = product.sizes && product.sizes.length > 0
        ? `${formatPrice(product.basePrice + Math.min(...product.sizes.map(s => s.priceModifier)))} - ${formatPrice(product.basePrice + Math.max(...product.sizes.map(s => s.priceModifier)))}`
        : formatPrice(product.basePrice);

      const productNumber = startIndex + index;
      message += `${productNumber}. ${product.name}\n`;
      message += `   ${product.description}\n`;
      message += `   Price: ${priceRange}\n\n`;

      buttons.push([`${productNumber}. ${product.name}`]);
    });

    // Add pagination buttons
    const paginationButtons = [];
    if (pagination && pagination.hasPrevPage) {
      paginationButtons.push('⬅️ Previous Page');
    }
    if (pagination && pagination.hasNextPage) {
      paginationButtons.push('➡️ Next Page');
    }

    if (paginationButtons.length > 0) {
      buttons.push(paginationButtons);
    }

    buttons.push(['🛒 View Cart', '🏠 Main Menu']);

    // Store products and pagination info in session
    session.currentProducts = products;
    session.currentCategory = category;
    session.currentCategoryName = categoryName;
    session.currentPage = page;
    session.pagination = pagination;

    await ctx.reply(message, Markup.keyboard(buttons).resize());

  } catch (error) {
    console.error('Error fetching menu:', error);
    await ctx.reply('Sorry, I couldn\'t load the menu right now. Please try again later.');
  }
}

bot.hears(['☕ Hot Coffee', '🧊 Iced Coffee', '🥤 Frappes', '📋 All Items'], async (ctx) => {
  await handleCategoryMenu(ctx, 1);
});

// Handle pagination navigation
bot.hears(['⬅️ Previous Page', '➡️ Next Page'], async (ctx) => {
  const session = getUserSession(ctx.from.id);

  if (!session || !session.pagination) {
    await ctx.reply('Please select a category first.');
    return;
  }

  let newPage = session.currentPage;

  if (ctx.message.text === '⬅️ Previous Page' && session.pagination.hasPrevPage) {
    newPage = session.currentPage - 1;
  } else if (ctx.message.text === '➡️ Next Page' && session.pagination.hasNextPage) {
    newPage = session.currentPage + 1;
  } else {
    return; // Invalid pagination action
  }

  await handleCategoryMenu(ctx, newPage);
});

// Handle product selection
bot.hears(/^\d+\.\s/, async (ctx) => {
  const session = getUserSession(ctx.from.id);

  if (!session.currentProducts) {
    await ctx.reply('Please browse the menu first.');
    return;
  }

  const productNumber = parseInt(ctx.message.text.split('.')[0]);
  const currentPage = session.currentPage || 1;
  const startIndex = ((currentPage - 1) * 10) + 1;
  const productIndex = productNumber - startIndex;
  const product = session.currentProducts[productIndex];

  if (!product || productIndex < 0 || productIndex >= session.currentProducts.length) {
    await ctx.reply('Invalid selection. Please choose from the current page menu.');
    return;
  }

  session.currentProduct = product;
  session.customization = {
    size: product.sizes?.[0]?.name || 'medium',
    sugarLevel: 'medium',
    iceLevel: 'medium',
    addOns: [],
    quantity: 1
  };

  let message = `${product.name}\n\n`;
  message += `${product.description}\n\n`;

  // Size selection
  if (product.sizes && product.sizes.length > 0) {
    message += 'Available sizes:\n';
    const sizeButtons = [];
    
    product.sizes.forEach(size => {
      const price = product.basePrice + size.priceModifier;
      message += `• ${size.name.charAt(0).toUpperCase() + size.name.slice(1)} - ${formatPrice(price)}\n`;
      sizeButtons.push([`Size: ${size.name}`]);
    });

    sizeButtons.push(['Continue with Medium']);
    await ctx.reply(message, Markup.keyboard(sizeButtons).resize());
  } else {
    await showCustomizationOptions(ctx, product);
  }
});

// Handle size selection
bot.hears(/^Size:\s/, async (ctx) => {
  const session = getUserSession(ctx.from.id);
  const size = ctx.message.text.replace('Size: ', '').toLowerCase();
  
  if (session.currentProduct && session.customization) {
    session.customization.size = size;
    await showCustomizationOptions(ctx, session.currentProduct);
  }
});

async function showCustomizationOptions(ctx, product) {
  const session = getUserSession(ctx.from.id);

  // Check if product and session are valid
  if (!product || !product.name || !session.customization) {
    await ctx.reply('Error: Product information not available. Please select a product again.');
    return;
  }

  let message = `Customizing: ${product.name}\n\n`;
  message += `Current selection:\n`;
  message += `• Size: ${session.customization.size}\n`;
  message += `• Sugar: ${session.customization.sugarLevel}\n`;

  if (product.category === 'iced' || product.category === 'frappe') {
    message += `• Ice: ${session.customization.iceLevel}\n`;
  }

  message += `• Quantity: ${session.customization.quantity}\n\n`;

  const currentPrice = calculateItemPrice(product, session.customization);
  message += `Current price: ${formatPrice(currentPrice)}\n\n`;
  message += 'What would you like to customize?';

  const buttons = [
    ['🍯 Sugar Level', '🧊 Ice Level'],
    ['➕ Add-ons', '🔢 Quantity'],
    ['✅ Add to Cart', '❌ Cancel']
  ];

  await ctx.reply(message, Markup.keyboard(buttons).resize());
}

async function showAddOnsMenu(ctx, product, session) {
  if (!product.addOns || product.addOns.length === 0) {
    await ctx.reply('No add-ons available for this item.');
    await showCustomizationOptions(ctx, product);
    return;
  }

  let message = 'Available add-ons:\n\n';
  const buttons = [];

  product.addOns.forEach(addOn => {
    const isSelected = session.customization.addOns.some(selected => selected.name === addOn.name);
    const prefix = isSelected ? '✅' : '➕';
    message += `${prefix} ${addOn.name} - ${formatPrice(addOn.price)}\n`;
    buttons.push([`${prefix} ${addOn.name}`]);
  });

  buttons.push(['⬅️ Back to Customization']);
  await ctx.reply(message, Markup.keyboard(buttons).resize());
}

bot.hears('🍯 Sugar Level', async (ctx) => {
  const session = getUserSession(ctx.from.id);
  session.currentState = 'selecting_sugar'; // Set state for context

  const buttons = [
    ['None', 'Low'],
    ['Medium', 'High'],
    ['⬅️ Back to Customization']
  ];

  await ctx.reply('Choose your sugar level:', Markup.keyboard(buttons).resize());
});

bot.hears(['None', 'Low', 'Medium', 'High'], async (ctx) => {
  const session = getUserSession(ctx.from.id);
  const level = ctx.message.text.toLowerCase();

  if (session.currentProduct && session.customization) {
    // Determine if this is for sugar or ice based on current state
    if (session.currentState === 'selecting_sugar') {
      session.customization.sugarLevel = level;
      await ctx.reply(`Sugar level set to: ${level}`);
    } else if (session.currentState === 'selecting_ice') {
      session.customization.iceLevel = level;
      await ctx.reply(`Ice level set to: ${level}`);
    } else {
      // Default to sugar if no state is set
      session.customization.sugarLevel = level;
      await ctx.reply(`Sugar level set to: ${level}`);
    }

    // Clear state and return to customization
    session.currentState = null;
    await showCustomizationOptions(ctx, session.currentProduct);
  }
});

bot.hears('🧊 Ice Level', async (ctx) => {
  const session = getUserSession(ctx.from.id);

  if (session.currentProduct && (session.currentProduct.category === 'iced' || session.currentProduct.category === 'frappe')) {
    session.currentState = 'selecting_ice'; // Set state for context

    const buttons = [
      ['None', 'Low'],
      ['Medium', 'High'],
      ['⬅️ Back to Customization']
    ];

    await ctx.reply('Choose your ice level:', Markup.keyboard(buttons).resize());
  } else {
    await ctx.reply('Ice level is only available for iced drinks and frappes.');
    await showCustomizationOptions(ctx, session.currentProduct);
  }
});

bot.hears('➕ Add-ons', async (ctx) => {
  const session = getUserSession(ctx.from.id);
  const product = session.currentProduct;

  if (!product) {
    await ctx.reply('Please select a product first.');
    return;
  }

  await showAddOnsMenu(ctx, product, session);
});

// Handle add-on selection (but exclude "Add to Cart")
bot.hears(/^[✅➕]\s(?!Add to Cart)/, async (ctx) => {
  const session = getUserSession(ctx.from.id);
  const addOnName = ctx.message.text.replace(/^[✅➕]\s/, '');
  const product = session.currentProduct;

  console.log('🔍 Add-on selection debug:');
  console.log('   Button text:', ctx.message.text);
  console.log('   Extracted name:', addOnName);
  console.log('   Product:', product?.name);
  console.log('   Product has addOns:', !!product?.addOns);
  console.log('   AddOns count:', product?.addOns?.length || 0);

  if (!product || !product.addOns) {
    console.log('❌ Product or addOns not available');
    await ctx.reply('Error: Product information not available.');
    return;
  }

  const addOn = product.addOns.find(a => a.name === addOnName);
  if (!addOn) {
    console.log('❌ Add-on not found. Available add-ons:');
    product.addOns.forEach((ao, index) => {
      console.log(`   ${index + 1}. "${ao.name}"`);
    });
    await ctx.reply(`Invalid add-on selection. Available add-ons: ${product.addOns.map(a => a.name).join(', ')}`);
    return;
  }

  console.log('✅ Add-on found:', addOn.name);

  const isSelected = session.customization.addOns.some(selected => selected.name === addOn.name);

  if (isSelected) {
    // Remove add-on
    session.customization.addOns = session.customization.addOns.filter(selected => selected.name !== addOn.name);
    await ctx.reply(`Removed: ${addOn.name}`);
  } else {
    // Add add-on
    session.customization.addOns.push(addOn);
    await ctx.reply(`Added: ${addOn.name} (+${formatPrice(addOn.price)})`);
  }

  // Show updated add-ons menu immediately (no setTimeout!)
  await showAddOnsMenu(ctx, product, session);
});

bot.hears('🔢 Quantity', async (ctx) => {
  const buttons = [
    ['1', '2', '3'],
    ['4', '5', '6'],
    ['⬅️ Back to Customization']
  ];

  await ctx.reply('How many would you like?', Markup.keyboard(buttons).resize());
});

bot.hears(/^[1-6]$/, async (ctx) => {
  const session = getUserSession(ctx.from.id);
  const quantity = parseInt(ctx.message.text);
  
  if (session.currentProduct && session.customization) {
    session.customization.quantity = quantity;
    await showCustomizationOptions(ctx, session.currentProduct);
  }
});

bot.hears('✅ Add to Cart', async (ctx) => {
  const session = getUserSession(ctx.from.id);
  
  if (!session.currentProduct || !session.customization) {
    await ctx.reply('No item selected for customization.');
    return;
  }

  const cartItem = {
    id: Date.now(),
    productId: session.currentProduct.id || session.currentProduct._id,
    name: session.currentProduct.name,
    ...session.customization,
    totalPrice: calculateItemPrice(session.currentProduct, session.customization)
  };

  session.cart.push(cartItem);
  
  await ctx.reply(`✅ ${cartItem.name} added to cart!\n\nTotal price: ${formatPrice(cartItem.totalPrice)}`, 
    Markup.keyboard([
      ['🍵 Browse Menu', '🛒 View Cart'],
      ['📋 My Orders', '🏠 Main Menu']
    ]).resize());

  // Clear current selection
  session.currentProduct = null;
  session.customization = {};
});

bot.hears('🛒 View Cart', async (ctx) => {
  const session = getUserSession(ctx.from.id);
  
  if (session.cart.length === 0) {
    await ctx.reply('Your cart is empty. Browse the menu to add items!', 
      Markup.keyboard([
        ['🍵 Browse Menu', '🏠 Main Menu']
      ]).resize());
    return;
  }

  let message = '🛒 Your Cart:\n\n';
  let total = 0;

  session.cart.forEach((item, index) => {
    message += `${index + 1}. ${item.name}\n`;
    message += `   Size: ${item.size}, Sugar: ${item.sugarLevel}\n`;
    if (item.iceLevel !== 'medium') {
      message += `   Ice: ${item.iceLevel}\n`;
    }
    if (item.addOns.length > 0) {
      message += `   Add-ons: ${item.addOns.map(a => a.name).join(', ')}\n`;
    }
    message += `   Quantity: ${item.quantity}\n`;
    message += `   Price: ${formatPrice(item.totalPrice)}\n\n`;
    total += item.totalPrice;
  });

  message += `Total: ${formatPrice(total)}`;

  const buttons = [
    ['🚀 Place Order', '🗑️ Clear Cart'],
    ['🍵 Browse Menu', '🏠 Main Menu']
  ];

  await ctx.reply(message, Markup.keyboard(buttons).resize());
});

bot.hears('🚀 Place Order', async (ctx) => {
  const session = getUserSession(ctx.from.id);
  
  if (!session.user) {
    await ctx.reply('Please start the bot first with /start');
    return;
  }

  if (session.cart.length === 0) {
    await ctx.reply('Your cart is empty!');
    return;
  }

  try {
    const orderData = {
      userId: session.user.id,
      items: session.cart.map(item => ({
        productId: item.productId,
        size: item.size,
        sugarLevel: item.sugarLevel,
        iceLevel: item.iceLevel,
        addOns: item.addOns,
        quantity: item.quantity
      })),
      orderSource: 'telegram',
      customerInfo: {
        name: ctx.from.first_name || session.user.username,
        telegramUsername: ctx.from.username
      }
    };

    const response = await api.createOrder(orderData);
    const order = response.order;

    // Generate QR code
    const qrBuffer = qr.imageSync(order.qrToken, { type: 'png', size: 10 });
    
    // Clear cart
    session.cart = [];

    let message = `🎉 Order Confirmed!\n\n`;
    message += `Order ID: ${order.id}\n`;
    message += `Total: ${formatPrice(order.total)}\n`;
    message += `Status: ${order.status}\n\n`;
    message += `⚠️ Important:\n`;
    message += `• Your order expires in 30 minutes\n`;
    message += `• Show the QR code below when picking up\n`;
    message += `• Please arrive on time to avoid penalties\n\n`;
    message += `Thank you for your order! ☕`;

    await ctx.reply(message);
    await ctx.replyWithPhoto({ source: qrBuffer }, {
      caption: 'Show this QR code when picking up your order'
    });

  } catch (error) {
    console.error('Error placing order:', error);
    await ctx.reply('Sorry, there was an error placing your order. Please try again.');
  }
});

bot.hears('📋 My Orders', async (ctx) => {
  const session = getUserSession(ctx.from.id);
  
  if (!session.user) {
    await ctx.reply('Please start the bot first with /start');
    return;
  }

  try {
    const response = await api.getUserOrders(session.user.id);
    const orders = response.orders;

    if (orders.length === 0) {
      await ctx.reply('You have no orders yet. Start by browsing the menu!');
      return;
    }

    let message = '📋 Your Recent Orders:\n\n';

    orders.slice(0, 5).forEach((order, index) => {
      const date = new Date(order.createdAt).toLocaleDateString();
      const status = order.status === 'pending' ? '⏳' : 
                   order.status === 'completed' ? '✅' : 
                   order.status === 'no-show' ? '❌' : '🚫';
      
      message += `${index + 1}. Order #${order._id.slice(-8)}\n`;
      message += `   Date: ${date}\n`;
      message += `   Status: ${status} ${order.status}\n`;
      message += `   Total: ${formatPrice(order.total)}\n`;
      message += `   Items: ${order.items.length}\n\n`;
    });

    await ctx.reply(message, Markup.keyboard([
      ['🍵 Browse Menu', '🛒 View Cart'],
      ['🏠 Main Menu']
    ]).resize());

  } catch (error) {
    console.error('Error fetching orders:', error);
    await ctx.reply('Sorry, I couldn\'t load your orders right now.');
  }
});

bot.hears(['🗑️ Clear Cart', '❌ Cancel', '⬅️ Back to Customization', '🏠 Main Menu'], async (ctx) => {
  const session = getUserSession(ctx.from.id);

  if (ctx.message.text === '🗑️ Clear Cart') {
    session.cart = [];
    await ctx.reply('Cart cleared!');
  } else if (ctx.message.text === '❌ Cancel') {
    session.currentProduct = null;
    session.customization = {};
    session.currentState = null; // Clear state
    await ctx.reply('Customization cancelled.');
  } else if (ctx.message.text === '⬅️ Back to Customization') {
    session.currentState = null; // Clear state
    if (session.currentProduct) {
      await showCustomizationOptions(ctx, session.currentProduct);
      return;
    }
  }

  // Return to main menu
  await ctx.reply('What would you like to do?', Markup.keyboard([
    ['🍵 Browse Menu', '🛒 View Cart'],
    ['📋 My Orders', '❓ Help']
  ]).resize());
});

bot.hears('❓ Help', async (ctx) => {
  const helpMessage = `
❓ Help & Instructions

🍵 Browse Menu - View our coffee categories
🛒 View Cart - See items you've added
📋 My Orders - Check your order history
🚀 Place Order - Complete your purchase

📱 How to order:
1. Browse the menu and select items
2. Customize size, sugar, ice, and add-ons
3. Add items to your cart
4. Place your order
5. Show the QR code when picking up

⚠️ Important Notes:
• Orders expire in 30 minutes
• Please arrive on time for pickup
• Multiple no-shows may result in restrictions

Need more help? Contact our support team!
  `;

  await ctx.reply(helpMessage, Markup.keyboard([
    ['🍵 Browse Menu', '🛒 View Cart'],
    ['📋 My Orders', '🏠 Main Menu']
  ]).resize());
});

// Error handling
bot.catch((err, ctx) => {
  console.error('Bot error:', err);
  ctx.reply('Sorry, something went wrong. Please try again.');
});

// Start the bot
console.log('🚀 Initializing Coffee Telegram Bot...');
console.log('📋 Environment check:');
console.log(`   NODE_ENV: ${process.env.NODE_ENV || 'development'}`);
console.log(`   BOT_TOKEN: ${process.env.BOT_TOKEN ? 'Set ✅' : 'Missing ❌'}`);
console.log(`   API_BASE_URL: ${process.env.API_BASE_URL}`);

if (process.env.NODE_ENV === 'production') {
  // Use webhook for production (Render.com)
  console.log('🌐 Starting bot in PRODUCTION mode (webhook)...');
  const PORT = process.env.PORT || 3000;
  bot.launch({
    webhook: {
      domain: process.env.WEBHOOK_URL,
      port: PORT
    }
  });
  console.log(`🔗 Webhook URL: ${process.env.WEBHOOK_URL}`);
  console.log(`📡 Port: ${PORT}`);
} else {
  // Use polling for development
  console.log('🔄 Starting bot in DEVELOPMENT mode (polling)...');
  bot.launch()
    .then(() => {
      console.log(`✅ Bot successfully launched!`);
      console.log(`🤖 Bot @${bot.botInfo?.username || 'Unknown'} is running...`);
      console.log(`📱 You can now interact with the bot on Telegram`);
      console.log(`🔍 Debug mode: Enabled`);
    })
    .catch(error => {
      console.error('❌ Failed to launch bot:', error.message);
      console.error('💡 Check your BOT_TOKEN and internet connection');
    });
}

// console.log('Coffee Telegram Bot is running...');

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
