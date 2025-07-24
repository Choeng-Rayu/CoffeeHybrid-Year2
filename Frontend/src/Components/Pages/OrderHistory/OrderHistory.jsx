import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../../context/UserContext';
import { ordersAPI } from '../../../services/api';
import QRCode from 'react-qr-code';
import { motion, AnimatePresence } from 'framer-motion';
import { FiCoffee, FiClock, FiCheckCircle, FiX, FiXCircle, FiShoppingBag } from 'react-icons/fi';
import styles from './OrderHistory.module.css';

const OrderHistory = () => {
  const { user, isAuthenticated } = useUser();
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showQRModal, setShowQRModal] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    fetchOrders();
  }, [isAuthenticated, navigate, user]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await ordersAPI.getUserOrders(user.id, { limit: 20 });
      setOrders(response.orders);
    } catch (error) {
      setError('Failed to load order history. Please try again.');
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => `$${price.toFixed(2)}`;

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return '#F59E0B';
      case 'completed': return '#10B981';
      case 'no-show': return '#EF4444';
      case 'cancelled': return '#6B7280';
      default: return '#666';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <FiClock className={styles.statusIcon} />;
      case 'completed': return <FiCheckCircle className={styles.statusIcon} />;
      case 'no-show': return <FiXCircle className={styles.statusIcon} />;
      case 'cancelled': return <FiX className={styles.statusIcon} />;
      default: return <FiShoppingBag className={styles.statusIcon} />;
    }
  };

  const handleShowQR = (order) => {
    if (order.status === 'pending') {
      setSelectedOrder(order);
      setShowQRModal(true);
    }
  };

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;

    try {
      await ordersAPI.cancelOrder(orderId);
      fetchOrders(); // Refresh the list
    } catch (error) {
      alert('Failed to cancel order. Please try again.');
    }
  };

  if (!isAuthenticated) {
    return null; // Will redirect to login
  }

  if (loading) {
    return (
      <motion.div 
        className={styles.ordersContainer}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Loading your orders...</p>
        </div>
      </motion.div>
    );
  }

  if (error) {
    return (
      <motion.div 
        className={styles.ordersContainer}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className={styles.error}>
          <p>{error}</p>
          <motion.button 
            onClick={fetchOrders} 
            className={styles.retryBtn}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
          >
            Try Again
          </motion.button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      className={styles.ordersContainer}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className={styles.header}>
        <h1 className={styles.title}>Your Coffee Journey</h1>
        <p className={styles.subtitle}>
          Track your orders and manage pickups
        </p>
      </div>

      {orders.length === 0 ? (
        <motion.div 
          className={styles.noOrders}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <FiCoffee className={styles.emptyIcon} />
          <h3>No orders yet</h3>
          <p>Your coffee adventure begins here</p>
          <motion.button 
            onClick={() => navigate('/menu')} 
            className={styles.browseBtn}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
          >
            Explore Our Menu
          </motion.button>
        </motion.div>
      ) : (
        <div className={styles.ordersList}>
          <AnimatePresence>
            {orders.map((order, index) => (
              <motion.div
                key={order.id || order._id}
                className={styles.orderCard}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ y: -2 }}
              >
                <div className={styles.orderHeader}>
                  <div className={styles.orderInfo}>
                    <h3 className={styles.orderId}>Order #{(order.id || order._id)?.toString().slice(-8) || 'N/A'}</h3>
                    <p className={styles.orderDate}>{formatDate(order.createdAt)}</p>
                  </div>
                  <div className={styles.orderStatus}>
                    <span 
                      className={styles.statusBadge}
                      style={{ backgroundColor: getStatusColor(order.status) }}
                    >
                      {getStatusIcon(order.status)} {order.status}
                    </span>
                    <span className={styles.orderTotal}>{formatPrice(order.total)}</span>
                  </div>
                </div>

                <div className={styles.orderItems}>
                  {(order.items || []).map((item, index) => (
                    <div key={index} className={styles.orderItem}>
                      <span className={styles.itemName}>
                        {item.quantity}× {item.name}
                      </span>
                      <span className={styles.itemDetails}>
                        {item.size} | {item.sugarLevel} sugar
                        {(item.addOns || []).length > 0 && ` | +${(item.addOns || []).length} add-ons`}
                      </span>
                    </div>
                  ))}
                </div>

                <div className={styles.orderActions}>
                  {order.status === 'pending' && (
                    <>
                      <motion.button
                        onClick={() => handleShowQR(order)}
                        className={styles.qrBtn}
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        Show QR Code
                      </motion.button>
                      <motion.button
                        onClick={() => handleCancelOrder(order._id)}
                        className={styles.cancelBtn}
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        Cancel Order
                      </motion.button>
                      <div className={styles.expiryInfo}>
                        <FiClock /> Expires: {formatDate(order.expiresAt)}
                      </div>
                    </>
                  )}
                  {order.status === 'completed' && order.pickupTime && (
                    <div className={styles.completedInfo}>
                      <FiCheckCircle /> Picked up: {formatDate(order.pickupTime)}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* QR Code Modal */}
      <AnimatePresence>
        {showQRModal && selectedOrder && (
          <motion.div 
            className={styles.modalOverlay} 
            onClick={() => setShowQRModal(false)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div 
              className={styles.qrModal} 
              onClick={(e) => e.stopPropagation()}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <div className={styles.modalHeader}>
                <h3>Pickup QR Code</h3>
                <button 
                  onClick={() => setShowQRModal(false)}
                  className={styles.closeBtn}
                >
                  <FiX />
                </button>
              </div>
              <div className={styles.qrContainer}>
                <QRCode
                  value={selectedOrder.qrToken}
                  size={250}
                  level="M"
                  includeMargin={true}
                />
              </div>
              <div className={styles.qrInstructions}>
                <p>Show this QR code to staff when picking up your order</p>
                <p className={styles.expiryWarning}>
                  <FiClock /> Order expires: {formatDate(selectedOrder.expiresAt)}
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default OrderHistory;