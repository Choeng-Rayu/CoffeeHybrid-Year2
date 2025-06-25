import { Markup } from 'telegraf';
import sessionService from '../services/sessionService.js';
import { formatPrice, logError } from '../utils/helpers.js';
import { showCustomizationOptions } from './menuHandler.js';

export async function handleSugarLevel(ctx) {
  const buttons = [
    ['None', 'Low'],
    ['Medium', 'High'],
    ['⬅️ Back to Customization']
  ];

  sessionService.setState(ctx.from.id, 'selecting_sugar');
  await ctx.reply('Choose your sugar level:', Markup.keyboard(buttons).resize());
}

export async function handleIceLevel(ctx) {
  const session = sessionService.getUserSession(ctx.from.id);

  if (!session.currentProduct) {
    await ctx.reply('Please select a product first.');
    return;
  }

  if (session.currentProduct.category === 'iced' || session.currentProduct.category === 'frappe') {
    const buttons = [
      ['None', 'Low'],
      ['Medium', 'High'],
      ['⬅️ Back to Customization']
    ];

    sessionService.setState(ctx.from.id, 'selecting_ice');
    await ctx.reply('Choose your ice level:', Markup.keyboard(buttons).resize());
  } else {
    await ctx.reply('Ice level is only available for iced drinks and frappes.');
    await showCustomizationOptions(ctx, session.currentProduct);
  }
}

export async function handleLevelSelection(ctx) {
  const session = sessionService.getUserSession(ctx.from.id);
  const level = ctx.message.text.toLowerCase();
  const state = sessionService.getState(ctx.from.id);

  if (!session.currentProduct || !session.customization) {
    await ctx.reply('Please select a product first.');
    return;
  }

  const validLevels = ['none', 'low', 'medium', 'high'];
  if (!validLevels.includes(level)) {
    await ctx.reply('Invalid level. Please choose from the options.');
    return;
  }

  try {
    // Update the appropriate level based on current state
    if (state.state === 'selecting_sugar') {
      session.customization.sugarLevel = level;
      await ctx.reply(`Sugar level set to: ${level}`);
    } else if (state.state === 'selecting_ice') {
      session.customization.iceLevel = level;
      await ctx.reply(`Ice level set to: ${level}`);
    }

    // Return to customization menu
    sessionService.setState(ctx.from.id, 'customizing');
    await showCustomizationOptions(ctx, session.currentProduct);

  } catch (error) {
    logError('LEVEL_SELECTION', error, {
      userId: ctx.from.id,
      level: level,
      state: state.state
    });
    await ctx.reply('Error updating selection. Please try again.');
  }
}

export async function handleAddOns(ctx) {
  const session = sessionService.getUserSession(ctx.from.id);
  const product = session.currentProduct;

  if (!product) {
    await ctx.reply('Please select a product first.');
    return;
  }

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

  sessionService.setState(ctx.from.id, 'selecting_addons');
  await ctx.reply(message, Markup.keyboard(buttons).resize());
}

export async function handleAddOnToggle(ctx) {
  console.log('🔍 Add-on toggle handler called with:', ctx.message.text);

  // Skip if this is "Add to Cart" - let the cart handler deal with it
  if (ctx.message.text === '✅ Add to Cart') {
    console.log('⏭️ Skipping "Add to Cart" - letting cart handler process');
    return;
  }

  const session = sessionService.getUserSession(ctx.from.id);
  const addOnName = ctx.message.text.replace(/^[✅➕]\s/, '');
  const product = session.currentProduct;

  console.log('📝 Extracted add-on name:', addOnName);
  console.log('🛍️ Current product:', product?.name);
  console.log('🔢 Product add-ons count:', product?.addOns?.length || 0);

  if (!product || !product.addOns) {
    await ctx.reply('Error processing add-on selection.');
    return;
  }

  const addOn = product.addOns.find(a => a.name === addOnName);
  if (!addOn) {
    await ctx.reply('Invalid add-on selection.');
    return;
  }

  try {
    const isSelected = session.customization.addOns.some(selected => selected.name === addOn.name);

    if (isSelected) {
      // Remove add-on
      session.customization.addOns = session.customization.addOns.filter(
        selected => selected.name !== addOn.name
      );
      await ctx.reply(`Removed: ${addOn.name}`);
    } else {
      // Add add-on
      session.customization.addOns.push(addOn);
      await ctx.reply(`Added: ${addOn.name} (+${formatPrice(addOn.price)})`);
    }

    // Set state to show updated add-ons menu immediately
    sessionService.setState(ctx.from.id, 'selecting_addons');

    // Show updated add-ons menu immediately (no setTimeout!)
    await handleAddOns(ctx);

  } catch (error) {
    logError('ADDON_TOGGLE', error, {
      userId: ctx.from.id,
      addOnName: addOnName
    });
    await ctx.reply('Error updating add-on. Please try again.');
  }
}

export async function handleQuantity(ctx) {
  const buttons = [
    ['1', '2', '3'],
    ['4', '5', '6'],
    ['7+', '⬅️ Back to Customization']
  ];

  sessionService.setState(ctx.from.id, 'selecting_quantity');
  await ctx.reply('How many would you like?\n\n• Choose 1-6 from buttons below\n• Click "7+" for custom quantity (up to 20)', Markup.keyboard(buttons).resize());
}

export async function handleQuantitySelection(ctx) {
  const session = sessionService.getUserSession(ctx.from.id);
  const text = ctx.message.text;

  if (!session.currentProduct || !session.customization) {
    await ctx.reply('Please select a product first.');
    return;
  }

  // Handle "7+" button - ask for custom input
  if (text === '7+') {
    sessionService.setState(ctx.from.id, 'entering_custom_quantity');
    await ctx.reply('Please enter the quantity you want (7-20):\n\n• Must be a whole number\n• Maximum 20 items per order',
      Markup.keyboard([['⬅️ Back to Quantity Selection']]).resize());
    return;
  }

  // Handle regular quantity selection (1-6)
  const quantity = parseInt(text);

  if (isNaN(quantity) || quantity < 1 || quantity > 6) {
    await ctx.reply('Please select a valid quantity (1-6) or click "7+" for custom quantity.');
    return;
  }

  try {
    session.customization.quantity = quantity;
    await ctx.reply(`Quantity set to: ${quantity}`);

    sessionService.setState(ctx.from.id, 'customizing');
    await showCustomizationOptions(ctx, session.currentProduct);

  } catch (error) {
    logError('QUANTITY_SELECTION', error, {
      userId: ctx.from.id,
      quantity: quantity
    });
    await ctx.reply('Error updating quantity. Please try again.');
  }
}

// Handle custom quantity input (7-20)
export async function handleCustomQuantityInput(ctx) {
  const session = sessionService.getUserSession(ctx.from.id);
  const text = ctx.message.text;

  // Check if user is in custom quantity input state
  const currentState = sessionService.getState(ctx.from.id);
  if (!currentState || currentState.state !== 'entering_custom_quantity') {
    return; // Not in custom quantity mode, let other handlers process
  }

  if (!session.currentProduct || !session.customization) {
    await ctx.reply('Please select a product first.');
    return;
  }

  // Validate the input
  const quantity = parseInt(text);

  if (isNaN(quantity)) {
    await ctx.reply('❌ Please enter a valid number (7-20).');
    return;
  }

  if (quantity < 7) {
    await ctx.reply('❌ For quantities 1-6, please use the quick buttons. Enter 7 or higher.');
    return;
  }

  if (quantity > 20) {
    await ctx.reply('❌ Maximum quantity is 20 items per order. Please enter a number between 7-20.');
    return;
  }

  if (!Number.isInteger(quantity) || quantity < 0) {
    await ctx.reply('❌ Please enter a positive whole number between 7-20.');
    return;
  }

  try {
    session.customization.quantity = quantity;
    await ctx.reply(`✅ Quantity set to: ${quantity}`);

    sessionService.setState(ctx.from.id, 'customizing');
    await showCustomizationOptions(ctx, session.currentProduct);

  } catch (error) {
    logError('CUSTOM_QUANTITY_INPUT', error, {
      userId: ctx.from.id,
      quantity: quantity
    });
    await ctx.reply('Error updating quantity. Please try again.');
  }
}

export async function handleBackToQuantitySelection(ctx) {
  sessionService.setState(ctx.from.id, 'selecting_quantity');
  await handleQuantity(ctx);
}

export async function handleBackToCustomization(ctx) {
  const session = sessionService.getUserSession(ctx.from.id);

  if (session.currentProduct) {
    sessionService.setState(ctx.from.id, 'customizing');
    await showCustomizationOptions(ctx, session.currentProduct);
  } else {
    await ctx.reply('No product being customized.');
  }
}
