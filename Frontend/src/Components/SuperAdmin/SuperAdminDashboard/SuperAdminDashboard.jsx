import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../../context/UserContext';
import { superAdminAPI } from '../../../services/api';
import {
  FiUsers,
  FiShoppingBag,
  FiDollarSign,
  FiTrendingUp,
  FiHome,
  FiShield,
  FiClock,
  FiCheckCircle,
  FiXCircle,
  FiX
} from 'react-icons/fi';
import styles from './SuperAdminDashboard.module.css';

const SuperAdminDashboard = () => {
  const { user, isAuthenticated } = useUser();
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'admin') {
      navigate('/login');
      return;
    }
    fetchDashboardData();
  }, [isAuthenticated, user, navigate]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError('');

      // Debug: Check user and token
      console.log('🔍 Debug - User:', user);
      console.log('🔍 Debug - Token:', localStorage.getItem('token'));
      console.log('🔍 Debug - User Role:', user?.role);
      console.log('🔍 Debug - Is Authenticated:', isAuthenticated);
      console.log('🔍 Debug - User from localStorage:', JSON.parse(localStorage.getItem('coffeeUser') || 'null'));

      // Decode the JWT token to see what's inside
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          console.log('🔍 Debug - JWT Payload:', payload);
        } catch (e) {
          console.log('🔍 Debug - Could not decode JWT:', e);
        }
      }

      const response = await superAdminAPI.getDashboard();
      setDashboardData(response.dashboard);
    } catch (error) {
      setError('Failed to load dashboard data. Please try again.');
      console.error('Error fetching dashboard:', error);

      // Debug: Log detailed error
      if (error.response?.status === 403) {
        console.error('🚫 Access denied - Check if user has admin role');
        console.error('🔍 Current user role:', user?.role);
        console.error('🔍 Token exists:', !!localStorage.getItem('token'));
      }
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => `$${amount.toFixed(2)}`;

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <FiClock className={styles.statusIcon} />;
      case 'completed': return <FiCheckCircle className={styles.statusIcon} />;
      case 'cancelled': return <FiX className={styles.statusIcon} />;
      case 'no-show': return <FiXCircle className={styles.statusIcon} />;
      default: return <FiShoppingBag className={styles.statusIcon} />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return '#F59E0B';
      case 'completed': return '#10B981';
      case 'cancelled': return '#6B7280';
      case 'no-show': return '#EF4444';
      default: return '#666';
    }
  };

  if (!isAuthenticated || user?.role !== 'admin') {
    return (
      <div className={styles.container}>
        <div className={styles.error}>
          <h2>Access Denied</h2>
          <p>
            {!isAuthenticated
              ? 'You must be logged in to access the Super Admin dashboard.'
              : `You need admin privileges to access this page. Current role: ${user?.role || 'unknown'}`
            }
          </p>
          <button onClick={() => navigate('/login')} className={styles.retryBtn}>
            {!isAuthenticated ? 'Login' : 'Login as Admin'}
          </button>
          {isAuthenticated && (
            <div style={{ marginTop: '1rem', fontSize: '0.875rem', color: '#6b7280' }}>
              <p>Admin credentials:</p>
              <p>Username: <code>superadmin</code></p>
              <p>Password: <code>admin123456</code></p>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>
          <p>{error}</p>
          <button onClick={fetchDashboardData} className={styles.retryBtn}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const { overview, ordersByStatus, recentOrders, topSellers } = dashboardData;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>
          <FiShield className={styles.titleIcon} />
          Super Admin Dashboard
        </h1>
        <p className={styles.subtitle}>
          Complete overview of your coffee ordering system
        </p>
      </div>

      {/* Overview Cards */}
      <div className={styles.overviewGrid}>
        <div className={styles.overviewCard}>
          <div className={styles.cardIcon}>
            <FiUsers />
          </div>
          <div className={styles.cardContent}>
            <h3>Total Users</h3>
            <p className={styles.cardNumber}>{overview.totalUsers}</p>
          </div>
        </div>

        <div className={styles.overviewCard}>
          <div className={styles.cardIcon}>
            <FiHome />
          </div>
          <div className={styles.cardContent}>
            <h3>Total Sellers</h3>
            <p className={styles.cardNumber}>{overview.totalSellers}</p>
          </div>
        </div>

        <div className={styles.overviewCard}>
          <div className={styles.cardIcon}>
            <FiShoppingBag />
          </div>
          <div className={styles.cardContent}>
            <h3>Total Orders</h3>
            <p className={styles.cardNumber}>{overview.totalOrders}</p>
          </div>
        </div>

        <div className={styles.overviewCard}>
          <div className={styles.cardIcon}>
            <FiDollarSign />
          </div>
          <div className={styles.cardContent}>
            <h3>Total Revenue</h3>
            <p className={styles.cardNumber}>{formatCurrency(overview.totalRevenue)}</p>
          </div>
        </div>

        <div className={styles.overviewCard}>
          <div className={styles.cardIcon}>
            <FiTrendingUp />
          </div>
          <div className={styles.cardContent}>
            <h3>Today's Revenue</h3>
            <p className={styles.cardNumber}>{formatCurrency(overview.todayRevenue)}</p>
          </div>
        </div>

        <div className={styles.overviewCard}>
          <div className={styles.cardIcon}>
            <FiShoppingBag />
          </div>
          <div className={styles.cardContent}>
            <h3>Total Products</h3>
            <p className={styles.cardNumber}>{overview.totalProducts}</p>
          </div>
        </div>
      </div>

      {/* Orders by Status */}
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Orders by Status</h2>
        <div className={styles.statusGrid}>
          {Object.entries(ordersByStatus).map(([status, count]) => (
            <div key={status} className={styles.statusCard}>
              <div 
                className={styles.statusIcon}
                style={{ color: getStatusColor(status) }}
              >
                {getStatusIcon(status)}
              </div>
              <div className={styles.statusContent}>
                <h4>{status.charAt(0).toUpperCase() + status.slice(1)}</h4>
                <p className={styles.statusCount}>{count}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Quick Actions</h2>
        <div className={styles.actionsGrid}>
          <button
            onClick={() => navigate('/super-admin/sellers')}
            className={styles.actionBtn}
          >
            <FiHome />
            Manage Sellers
          </button>
          <button 
            onClick={() => navigate('/super-admin/orders')}
            className={styles.actionBtn}
          >
            <FiShoppingBag />
            View All Orders
          </button>
          <button 
            onClick={() => navigate('/super-admin/create-seller')}
            className={styles.actionBtn}
          >
            <FiUsers />
            Create New Seller
          </button>
        </div>
      </div>

      {/* Recent Orders */}
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Recent Orders</h2>
        <div className={styles.ordersTable}>
          <div className={styles.tableHeader}>
            <span>Order ID</span>
            <span>Customer</span>
            <span>Total</span>
            <span>Status</span>
            <span>Date</span>
          </div>
          {recentOrders.map((order) => (
            <div key={order.id} className={styles.tableRow}>
              <span className={styles.orderId}>#{order.id.toString().slice(-8)}</span>
              <span>{order.user?.username || 'Unknown'}</span>
              <span className={styles.orderTotal}>{formatCurrency(order.total)}</span>
              <span 
                className={styles.orderStatus}
                style={{ color: getStatusColor(order.status) }}
              >
                {order.status}
              </span>
              <span className={styles.orderDate}>{formatDate(order.createdAt)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Top Sellers */}
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Top Sellers</h2>
        <div className={styles.sellersGrid}>
          {topSellers.map((seller, index) => (
            <div key={seller.id} className={styles.sellerCard}>
              <div className={styles.sellerRank}>#{index + 1}</div>
              <div className={styles.sellerInfo}>
                <h4>{seller.shopName || seller.username}</h4>
                <p>{seller.email}</p>
                <div className={styles.sellerStats}>
                  <span>Revenue: {formatCurrency(seller.totalRevenue)}</span>
                  <span>Products: {seller.productCount}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;
