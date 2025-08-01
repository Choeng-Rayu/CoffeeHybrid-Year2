import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../../context/UserContext';
import { adminAPI } from '../../../services/api';
import ProductForm from '../ProductForm/ProductForm';
import ProductList from '../ProductList/ProductList';
import QRScanner from '../../Seller/QRScanner/QRScanner';
import SalesAnalytics from '../../Seller/SalesAnalytics/SalesAnalytics';
import styles from './AdminDashboard.module.css';

const AdminDashboard = () => {
  const { user, isAuthenticated } = useUser();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('dashboard');
  const [products, setProducts] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const [loadingProducts, setLoadingProducts] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || (user.role !== 'seller' && user.role !== 'admin')) {
      navigate('/admin/login');
      return;
    }

    fetchDashboardData();
  }, [isAuthenticated, user, navigate]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError('');

      // Fetch seller's products with pagination
      await fetchProducts(1);

      // Fetch dashboard stats
      const statsResponse = await adminAPI.getDashboardStats(user.id);
      setStats(statsResponse.stats);

    } catch (error) {
      setError('Failed to load dashboard data');
      console.error('Dashboard error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async (page = currentPage) => {
    try {
      if (page === 1) {
        setLoadingProducts(true);
      }

      const productsResponse = await adminAPI.getSellerProducts(user.id, page, 10);
      setProducts(productsResponse.products);
      setPagination(productsResponse.pagination);
      setCurrentPage(page);
    } catch (error) {
      setError('Failed to load products');
      console.error('Products error:', error);
    } finally {
      setLoadingProducts(false);
    }
  };

  const handleProductAdded = () => {
    fetchProducts(1); // Reset to first page when new product is added
    setActiveTab('products');
  };

  const handleProductUpdated = () => {
    fetchProducts(currentPage); // Stay on current page when product is updated
  };

  const handlePageChange = (page) => {
    fetchProducts(page);
  };

  const handleExportOrders = async () => {
    try {
      const blob = await adminAPI.exportOrdersCSV(user.id);

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `orders_${user.shopName}_${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting orders:', error);
      setError('Failed to export orders data');
    }
  };

  const handleExportAnalytics = async () => {
    try {
      const blob = await adminAPI.exportAnalyticsCSV(user.id, { period: 'all' });

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `analytics_${user.shopName}_${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting analytics:', error);
      setError('Failed to export analytics data');
    }
  };

  if (!isAuthenticated || (user.role !== 'seller' && user.role !== 'admin')) {
    return null;
  }

  if (loading) {
    return (
      <div className={styles.dashboardContainer}>
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.dashboardContainer}>
      <div className={styles.header}>
        <h1 className={styles.title}>Seller Dashboard</h1>
        <div className={styles.shopInfo}>
          <h2>{user.shopName}</h2>
          <p>Welcome back, {user.username}!</p>
        </div>
      </div>

      {error && (
        <div className={styles.error}>
          {error}
        </div>
      )}

      <div className={styles.tabs}>
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`${styles.tab} ${activeTab === 'dashboard' ? styles.active : ''}`}
        >
          📊 Dashboard
        </button>
        <button
          onClick={() => setActiveTab('qr-scanner')}
          className={`${styles.tab} ${activeTab === 'qr-scanner' ? styles.active : ''}`}
        >
          📱 QR Scanner
        </button>
        <button
          onClick={() => setActiveTab('products')}
          className={`${styles.tab} ${activeTab === 'products' ? styles.active : ''}`}
        >
          ☕ My Products
        </button>
        <button
          onClick={() => setActiveTab('add-product')}
          className={`${styles.tab} ${activeTab === 'add-product' ? styles.active : ''}`}
        >
          ➕ Add Product
        </button>
        <button
          onClick={() => setActiveTab('orders')}
          className={`${styles.tab} ${activeTab === 'orders' ? styles.active : ''}`}
        >
          📋 Orders
        </button>
        <button
          onClick={() => setActiveTab('analytics')}
          className={`${styles.tab} ${activeTab === 'analytics' ? styles.active : ''}`}
        >
          📊 Sales Analytics
        </button>
      </div>

      <div className={styles.content}>
        {activeTab === 'dashboard' && (
          <div className={styles.dashboardStats}>
            <div className={styles.statsGrid}>
              <div className={styles.statCard}>
                <h3>Total Products</h3>
                <div className={styles.statNumber}>{stats?.productCount || 0}</div>
              </div>

              <div className={styles.statCard}>
                <h3>Today's Orders</h3>
                <div className={styles.statNumber}>{stats?.todayOrders || 0}</div>
              </div>

              <div className={styles.statCard}>
                <h3>Total Revenue</h3>
                <div className={styles.statNumber}>
                  ${stats?.orderStats?.reduce((total, stat) => total + (stat.totalRevenue || 0), 0)?.toFixed(2) || '0.00'}
                </div>
              </div>

              <div className={styles.statCard}>
                <h3>Completed Orders</h3>
                <div className={styles.statNumber}>
                  {stats?.orderStats?.find(s => s._id === 'completed')?.count || 0}
                </div>
              </div>
            </div>

            <div className={styles.quickActions}>
              <h3>Quick Actions</h3>
              <div className={styles.actionButtons}>
                <button
                  onClick={() => setActiveTab('qr-scanner')}
                  className={styles.actionBtn}
                >
                  📱 Scan QR Codes
                </button>
                <button
                  onClick={() => setActiveTab('add-product')}
                  className={styles.actionBtn}
                >
                  ➕ Add New Product
                </button>
                <button
                  onClick={() => setActiveTab('products')}
                  className={styles.actionBtn}
                >
                  📝 Manage Products
                </button>
                <button
                  onClick={() => setActiveTab('orders')}
                  className={styles.actionBtn}
                >
                  📋 View Orders
                </button>
                <button
                  onClick={() => setActiveTab('analytics')}
                  className={styles.actionBtn}
                >
                  📊 Sales Analytics
                </button>
                <button
                  onClick={handleExportOrders}
                  className={styles.actionBtn}
                >
                  📋 Export Orders CSV
                </button>
                <button
                  onClick={handleExportAnalytics}
                  className={styles.actionBtn}
                >
                  📊 Export Analytics CSV
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'qr-scanner' && (
          <QRScanner />
        )}

        {activeTab === 'products' && (
          <ProductList
            products={products}
            onProductUpdated={handleProductUpdated}
            pagination={pagination}
            onPageChange={handlePageChange}
            loadingProducts={loadingProducts}
          />
        )}

        {activeTab === 'add-product' && (
          <ProductForm
            onProductAdded={handleProductAdded}
          />
        )}

        {activeTab === 'orders' && (
          <div className={styles.ordersSection}>
            <h3>Recent Orders</h3>
            <p>Order management coming soon...</p>
          </div>
        )}

        {activeTab === 'analytics' && (
          <SalesAnalytics />
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
