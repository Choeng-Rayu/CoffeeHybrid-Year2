import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../../context/UserContext';
import { useCart } from '../../../context/CartContext';
import { ordersAPI } from '../../../services/api';
import OrderConfirmation from '../../OrderConfirmation/OrderConfirmation';
import { motion, AnimatePresence } from 'framer-motion';
import { FaShoppingBag, FaCoffee, FaPlus, FaMinus, FaTrashAlt } from 'react-icons/fa';
import styles from './Cart.module.css';

const Cart = () => {
  const { user, isAuthenticated } = useUser();
  const { cartItems, removeFromCart, updateCartItem, clearCart, getCartTotal } = useCart();
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [orderConfirmation, setOrderConfirmation] = useState(null);

  if (!isAuthenticated) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={styles.cartContainer}
      >
        <div className={styles.authPrompt}>
          <div className={styles.authIcon}>
            <FaShoppingBag size={48} />
          </div>
          <h2>Please log in to view your cart</h2>
          <p>Sign in to access your saved items and checkout</p>
          <button 
            onClick={() => navigate('/login')} 
            className={styles.loginBtn}
          >
            Go to Login
          </button>
        </div>
      </motion.div>
    );
  }

  const formatPrice = (price) => `$${price.toFixed(2)}`;

  const handleQuantityChange = (cartItemId, newQuantity) => {
    if (newQuantity < 1) {
      removeFromCart(cartItemId);
    } else {
      const item = cartItems.find(item => item.id === cartItemId);
      const pricePerUnit = item.totalPrice / item.quantity;
      updateCartItem(cartItemId, {
        quantity: newQuantity,
        totalPrice: pricePerUnit * newQuantity
      });
    }
  };

  const handlePlaceOrder = async () => {
    if (cartItems.length === 0) return;

    setIsLoading(true);
    setError('');

    try {
      const orderData = {
        userId: user.id,
        items: cartItems.map(item => ({
          productId: item.productId,
          size: item.size,
          sugarLevel: item.sugarLevel,
          iceLevel: item.iceLevel,
          addOns: item.addOns,
          quantity: item.quantity
        })),
        orderSource: 'web',
        customerInfo: {
          name: user.username,
          email: user.email
        }
      };

      const response = await ordersAPI.createOrder(orderData);
      setOrderConfirmation(response.order);
      await clearCart(user?.id);
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to place order. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (orderConfirmation) {
    return (
      <OrderConfirmation
        order={orderConfirmation}
        onClose={() => setOrderConfirmation(null)}
      />
    );
  }

  if (cartItems.length === 0) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={styles.cartContainer}
      >
        <div className={styles.emptyCart}>
          <div className={styles.emptyCartIcon}>
            <FaCoffee size={64} />
          </div>
          <h2>Your cart is empty</h2>
          <p>Add some delicious coffee to get started!</p>
          <button 
            onClick={() => navigate('/menu')} 
            className={styles.browseBtn}
          >
            Browse Our Menu
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={styles.cartContainer}
    >
      <div className={styles.cartHeader}>
        <h1 className={styles.title}>Your Coffee Cart</h1>
        <p className={styles.itemCount}>
          {cartItems.length} item{cartItems.length !== 1 ? 's' : ''} · {formatPrice(getCartTotal())}
        </p>
      </div>

      {error && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className={styles.error}
        >
          {error}
        </motion.div>
      )}

      <div className={styles.cartContent}>
        <div className={styles.cartItems}>
          <AnimatePresence>
            {cartItems.map(item => (
              <motion.div 
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                className={styles.cartItem}
              >
                <div className={styles.itemInfo}>
                  <div className={styles.itemImagePlaceholder}>
                    {item.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className={styles.itemName}>{item.name}</h3>
                    <div className={styles.itemDetails}>
                      <span className={styles.detail}><strong>Size:</strong> {item.size}</span>
                      <span className={styles.detail}><strong>Sugar:</strong> {item.sugarLevel}</span>
                      {item.iceLevel !== 'medium' && (
                        <span className={styles.detail}><strong>Ice:</strong> {item.iceLevel}</span>
                      )}
                      {item.addOns.length > 0 && (
                        <span className={styles.detail}>
                          <strong>Add-ons:</strong> {item.addOns.map(addOn => addOn.name).join(', ')}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className={styles.itemControls}>
                  <div className={styles.quantityControls}>
                    <button
                      onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                      className={styles.quantityBtn}
                      aria-label="Decrease quantity"
                    >
                      <FaMinus size={12} />
                    </button>
                    <span className={styles.quantity}>{item.quantity}</span>
                    <button
                      onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                      className={styles.quantityBtn}
                      aria-label="Increase quantity"
                    >
                      <FaPlus size={12} />
                    </button>
                  </div>

                  <div className={styles.itemPrice}>
                    {formatPrice(item.totalPrice)}
                  </div>

                  <button
                    onClick={() => removeFromCart(item.id)}
                    className={styles.removeBtn}
                    aria-label="Remove item"
                  >
                    <FaTrashAlt size={16} />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        <div className={styles.cartSummary}>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className={styles.summaryContent}
          >
            <h3 className={styles.summaryTitle}>
              <FaShoppingBag /> Order Summary
            </h3>
            
            <div className={styles.summaryRow}>
              <span>Subtotal:</span>
              <span>{formatPrice(getCartTotal())}</span>
            </div>
            
            <div className={styles.summaryRow}>
              <span>Tax:</span>
              <span>$0.00</span>
            </div>
            
            <div className={styles.summaryRow}>
              <span>Delivery:</span>
              <span className={styles.freeDelivery}>FREE</span>
            </div>
            
            <div className={`${styles.summaryRow} ${styles.total}`}>
              <span>Total:</span>
              <span>{formatPrice(getCartTotal())}</span>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handlePlaceOrder}
              disabled={isLoading || cartItems.length === 0}
              className={styles.placeOrderBtn}
            >
              {isLoading ? (
                <span className={styles.spinner}></span>
              ) : (
                'Place Order'
              )}
            </motion.button>

            <button
              onClick={() => navigate('/menu')}
              className={styles.continueShoppingBtn}
            >
              Continue Shopping
            </button>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default Cart;