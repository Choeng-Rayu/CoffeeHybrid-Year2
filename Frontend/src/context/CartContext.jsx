import { createContext, useContext, useState, useEffect } from 'react';
import { cartAPI } from '../services/api';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

// Generate or get session ID
const getSessionId = () => {
  let sessionId = localStorage.getItem('coffeeSessionId');
  if (!sessionId) {
    sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('coffeeSessionId', sessionId);
  }
  return sessionId;
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [sessionId] = useState(getSessionId());
  const [isLoading, setIsLoading] = useState(false);

  // Load cart from localStorage on app start, then sync with database
  useEffect(() => {
    const loadCart = async () => {
      setIsLoading(true);
      try {
        // First load from localStorage for immediate display
        const savedCart = localStorage.getItem('coffeeCart');
        if (savedCart) {
          try {
            const localCart = JSON.parse(savedCart);
            setCartItems(localCart);

            // Sync with database
            if (localCart.length > 0) {
              await cartAPI.syncCart({
                sessionId,
                cartItems: localCart
              });
            }
          } catch (error) {
            console.error('Error parsing saved cart:', error);
            localStorage.removeItem('coffeeCart');
          }
        }

        // Then load from database (this will be the source of truth)
        const response = await cartAPI.getCart(sessionId);
        if (response.success && response.cartItems) {
          setCartItems(response.cartItems);
          localStorage.setItem('coffeeCart', JSON.stringify(response.cartItems));
        }
      } catch (error) {
        console.error('Error loading cart:', error);
        // Fallback to localStorage only
      } finally {
        setIsLoading(false);
      }
    };

    loadCart();
  }, [sessionId]);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('coffeeCart', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = async (product, customizations, userId = null) => {
    const cartItemData = {
      userId,
      sessionId,
      productId: product.id || product._id, // Support both MySQL (id) and MongoDB (_id)
      size: customizations.size || 'medium',
      sugarLevel: customizations.sugarLevel || 'medium',
      iceLevel: customizations.iceLevel || 'medium',
      addOns: customizations.addOns || [],
      quantity: customizations.quantity || 1
    };

    try {
      // Add to database first
      const response = await cartAPI.addToCart(cartItemData);
      if (response.success) {
        // Update local state
        setCartItems(prev => [...prev, response.cartItem]);
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      // Fallback to localStorage only
      const cartItem = {
        id: Date.now(),
        productId: product.id || product._id,
        name: product.name,
        basePrice: product.basePrice,
        size: customizations.size || 'medium',
        sugarLevel: customizations.sugarLevel || 'medium',
        iceLevel: customizations.iceLevel || 'medium',
        addOns: customizations.addOns || [],
        quantity: customizations.quantity || 1,
        totalPrice: calculateItemPrice(product, customizations)
      };
      setCartItems(prev => [...prev, cartItem]);
    }
  };

  const removeFromCart = async (cartItemId) => {
    try {
      // Remove from database first
      await cartAPI.removeFromCart(cartItemId);
      // Update local state
      setCartItems(prev => prev.filter(item => item.id !== cartItemId));
    } catch (error) {
      console.error('Error removing from cart:', error);
      // Fallback to localStorage only
      setCartItems(prev => prev.filter(item => item.id !== cartItemId));
    }
  };

  const updateCartItem = (cartItemId, updates) => {
    setCartItems(prev => 
      prev.map(item => 
        item.id === cartItemId 
          ? { ...item, ...updates }
          : item
      )
    );
  };

  const clearCart = async (userId = null) => {
    try {
      // Clear from database first
      await cartAPI.clearCart(sessionId, userId);
      // Update local state
      setCartItems([]);
    } catch (error) {
      console.error('Error clearing cart:', error);
      // Fallback to localStorage only
      setCartItems([]);
    }
  };

  const calculateItemPrice = (product, customizations) => {
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
  };

  const getCartTotal = () => {
    return cartItems.reduce((total, item) => total + item.totalPrice, 0);
  };

  const getCartItemCount = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  const value = {
    cartItems,
    addToCart,
    removeFromCart,
    updateCartItem,
    clearCart,
    getCartTotal,
    getCartItemCount,
    calculateItemPrice
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};
