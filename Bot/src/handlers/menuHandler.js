import { Markup } from 'telegraf';
import apiService from '../services/apiService.js';
import sessionService from '../services/sessionService.js';
import { formatPrice, getCategoryIcon, logError } from '../utils/helpers.js';
import { getMainMenuKeyboard } from './startHandler.js';

export async function handleBrowseMenu(ctx) {
  const menuKeyboard = Markup.keyboard([
    ['☕ Hot Coffee', '🧊 Iced Coffee'],
    ['🥤 Frappes', '📋 All Items'],
    ['🛒 View Cart', '🏠 Main Menu']
  ]).resize();

  await ctx.reply('What type of coffee would you like to explore?', menuKeyboard);
  
  // Set user state
  sessionService.setState(ctx.from.id, 'browsing');
}

export async function handleCategorySelection(ctx, page = 1) {
  const categoryMap = {
    '☕ Hot Coffee': 'hot',
    '🧊 Iced Coffee': 'iced',
    '🥤 Frappes': 'frappe',
    '📋 All Items': null
  };

  const category = categoryMap[ctx.message.text] || categoryMap[ctx.session?.currentCategory];

  try {
    const menuData = await apiService.getMenu(category, page, 10);
    const products = menuData.products;
    const pagination = menuData.pagination;

    if (products.length === 0) {
      await ctx.reply('No items available in this category right now.');
      return;
    }

    // Group products by shop
    const productsByShop = products.reduce((acc, product) => {
      const shopName = product.shopName || 'Unknown Shop';
      if (!acc[shopName]) {
        acc[shopName] = [];
      }
      acc[shopName].push(product);
      return acc;
    }, {});

    let message = `${ctx.message.text || ctx.session?.currentCategoryName}\n\n`;

    // Add pagination info
    if (pagination) {
      message += `📄 Page ${pagination.currentPage} of ${pagination.totalPages} (${pagination.totalProducts} items)\n\n`;
    }

    const buttons = [];
    let productIndex = ((page - 1) * 10) + 1;

    // Display products grouped by shop
    for (const [shopName, shopProducts] of Object.entries(productsByShop)) {
      message += `🏪 **${shopName}**\n`;
      message += '─'.repeat(20) + '\n';

      for (const product of shopProducts) {
        const priceRange = getPriceRange(product);

        message += `${productIndex}. ${product.name}\n`;
        message += `   ${product.description}\n`;
        message += `   Price: ${priceRange}\n`;
        message += `   Prep time: ${product.preparationTime || 5} min\n\n`;

        buttons.push([`${productIndex}. ${product.name}`]);
        productIndex++;
      }
      message += '\n';
    }

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
    sessionService.updateSession(ctx.from.id, {
      currentProducts: products,
      currentCategory: category,
      currentCategoryName: ctx.message.text || ctx.session?.currentCategoryName,
      currentPage: page,
      pagination: pagination,
      state: 'selecting_product'
    });

    await ctx.reply(message, Markup.keyboard(buttons).resize());

  } catch (error) {
    logError('CATEGORY_SELECTION', error, {
      userId: ctx.from.id,
      category: category,
      page: page
    });
    await ctx.reply('Sorry, I couldn\'t load the menu right now. Please try again later.');
  }
}

export async function handleProductSelection(ctx) {
  const session = sessionService.getUserSession(ctx.from.id);
  
  if (!session.currentProducts) {
    await ctx.reply('Please browse the menu first.');
    return;
  }

  // Extract product index from message
  const match = ctx.message.text.match(/^(\d+)\./);
  if (!match) {
    await ctx.reply('Invalid selection. Please choose from the menu.');
    return;
  }

  const productIndex = parseInt(match[1]) - 1;
  const product = session.currentProducts[productIndex];

  if (!product) {
    await ctx.reply('Invalid selection. Please choose from the menu.');
    return;
  }

  // Initialize customization
  const defaultCustomization = {
    size: product.sizes?.[0]?.name || 'medium',
    sugarLevel: 'medium',
    iceLevel: product.category === 'hot' ? 'none' : 'medium',
    addOns: [],
    quantity: 1
  };

  sessionService.updateSession(ctx.from.id, {
    currentProduct: product,
    customization: defaultCustomization,
    state: 'customizing'
  });

  let message = `${product.name}\n`;
  message += `🏪 ${product.shopName}\n\n`;
  message += `${product.description}\n\n`;

  // Show size options if available
  if (product.sizes && product.sizes.length > 0) {
    message += 'Available sizes:\n';
    
    product.sizes.forEach(size => {
      const price = product.basePrice + size.priceModifier;
      message += `• ${size.name.charAt(0).toUpperCase() + size.name.slice(1)} - ${formatPrice(price)}\n`;
    });

    const sizeButtons = product.sizes.map(size => [`Size: ${size.name}`]);
    sizeButtons.push(['Continue with Medium']);
    
    await ctx.reply(message, Markup.keyboard(sizeButtons).resize());
  } else {
    await showCustomizationOptions(ctx, product);
  }
}

export async function handleSizeSelection(ctx) {
  const session = sessionService.getUserSession(ctx.from.id);
  const size = ctx.message.text.replace('Size: ', '').toLowerCase();
  
  if (session.currentProduct && session.customization) {
    session.customization.size = size;
    await showCustomizationOptions(ctx, session.currentProduct);
  }
}

async function showCustomizationOptions(ctx, product) {
  const session = sessionService.getUserSession(ctx.from.id);
  
  let message = `Customizing: ${product.name}\n`;
  message += `🏪 ${product.shopName}\n\n`;
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

export async function handlePaginationNavigation(ctx) {
  const session = sessionService.getSession(ctx.from.id);

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

  // Update session with current category name for the next call
  sessionService.updateSession(ctx.from.id, {
    currentCategoryName: session.currentCategoryName
  });

  // Call category selection with new page
  await handleCategorySelection(ctx, newPage);
}

function getPriceRange(product) {
  if (!product.sizes || product.sizes.length === 0) {
    return formatPrice(product.basePrice);
  }

  const prices = product.sizes.map(size => product.basePrice + size.priceModifier);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);

  if (minPrice === maxPrice) {
    return formatPrice(minPrice);
  }

  return `${formatPrice(minPrice)} - ${formatPrice(maxPrice)}`;
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

export { showCustomizationOptions };
