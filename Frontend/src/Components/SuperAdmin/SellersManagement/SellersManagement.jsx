import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../../context/UserContext';
import { superAdminAPI } from '../../../services/api';
import {
  FiHome,
  FiSearch,
  FiPlus,
  FiShoppingBag,
  FiDollarSign,
  FiUsers,
  FiShield,
  FiShieldOff,
  FiArrowLeft
} from 'react-icons/fi';
import styles from './SellersManagement.module.css';

const SellersManagement = () => {
  const { user, isAuthenticated } = useUser();
  const navigate = useNavigate();
  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({});

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'admin') {
      navigate('/login');
      return;
    }
    fetchSellers();
  }, [isAuthenticated, user, navigate, currentPage, searchTerm]);

  const fetchSellers = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await superAdminAPI.getAllSellers({
        page: currentPage,
        limit: 10,
        search: searchTerm
      });
      setSellers(response.sellers);
      setPagination(response.pagination);
    } catch (error) {
      setError('Failed to load sellers. Please try again.');
      console.error('Error fetching sellers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleToggleStatus = async (sellerId, currentStatus) => {
    try {
      await superAdminAPI.toggleSellerStatus(sellerId, !currentStatus);
      fetchSellers(); // Refresh the list
    } catch (error) {
      alert('Failed to update seller status. Please try again.');
    }
  };

  const formatCurrency = (amount) => `$${amount.toFixed(2)}`;

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (!isAuthenticated || user?.role !== 'admin') {
    return null;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <button 
          onClick={() => navigate('/super-admin')}
          className={styles.backBtn}
        >
          <FiArrowLeft />
          Back to Dashboard
        </button>
        
        <div className={styles.titleSection}>
          <h1 className={styles.title}>
            <FiHome className={styles.titleIcon} />
            Sellers Management
          </h1>
          <p className={styles.subtitle}>
            Manage all sellers and their performance
          </p>
        </div>

        <button 
          onClick={() => navigate('/super-admin/create-seller')}
          className={styles.createBtn}
        >
          <FiPlus />
          Create New Seller
        </button>
      </div>

      {/* Search Bar */}
      <div className={styles.searchSection}>
        <div className={styles.searchBox}>
          <FiSearch className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search sellers by name, email, or shop name..."
            value={searchTerm}
            onChange={handleSearch}
            className={styles.searchInput}
          />
        </div>
      </div>

      {loading ? (
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Loading sellers...</p>
        </div>
      ) : error ? (
        <div className={styles.error}>
          <p>{error}</p>
          <button onClick={fetchSellers} className={styles.retryBtn}>
            Try Again
          </button>
        </div>
      ) : sellers.length === 0 ? (
        <div className={styles.noSellers}>
          <FiHome className={styles.emptyIcon} />
          <h3>No sellers found</h3>
          <p>
            {searchTerm 
              ? `No sellers match "${searchTerm}"`
              : 'No sellers have been created yet'
            }
          </p>
          <button 
            onClick={() => navigate('/super-admin/create-seller')}
            className={styles.createBtn}
          >
            <FiPlus />
            Create First Seller
          </button>
        </div>
      ) : (
        <>
          {/* Sellers Grid */}
          <div className={styles.sellersGrid}>
            {sellers.map((seller) => (
              <div key={seller.id} className={styles.sellerCard}>
                <div className={styles.sellerHeader}>
                  <div className={styles.sellerInfo}>
                    <h3 className={styles.sellerName}>
                      {seller.shopName || seller.username}
                    </h3>
                    <p className={styles.sellerEmail}>{seller.email}</p>
                    <p className={styles.sellerUsername}>@{seller.username}</p>
                  </div>
                  <div className={styles.sellerStatus}>
                    <button
                      onClick={() => handleToggleStatus(seller.id, seller.isBlocked)}
                      className={`${styles.statusBtn} ${
                        seller.isBlocked ? styles.blocked : styles.active
                      }`}
                    >
                      {seller.isBlocked ? (
                        <>
                          <FiShieldOff />
                          Blocked
                        </>
                      ) : (
                        <>
                          <FiShield />
                          Active
                        </>
                      )}
                    </button>
                  </div>
                </div>

                <div className={styles.sellerStats}>
                  <div className={styles.statItem}>
                    <div className={styles.statIcon}>
                      <FiShoppingBag />
                    </div>
                    <div className={styles.statContent}>
                      <span className={styles.statLabel}>Products</span>
                      <span className={styles.statValue}>
                        {seller.stats.activeProducts}/{seller.stats.totalProducts}
                      </span>
                    </div>
                  </div>

                  <div className={styles.statItem}>
                    <div className={styles.statIcon}>
                      <FiUsers />
                    </div>
                    <div className={styles.statContent}>
                      <span className={styles.statLabel}>Orders</span>
                      <span className={styles.statValue}>{seller.stats.totalOrders}</span>
                    </div>
                  </div>

                  <div className={styles.statItem}>
                    <div className={styles.statIcon}>
                      <FiDollarSign />
                    </div>
                    <div className={styles.statContent}>
                      <span className={styles.statLabel}>Revenue</span>
                      <span className={styles.statValue}>
                        {formatCurrency(seller.stats.totalRevenue)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className={styles.sellerFooter}>
                  <span className={styles.joinDate}>
                    Joined {formatDate(seller.createdAt)}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className={styles.pagination}>
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className={styles.pageBtn}
              >
                Previous
              </button>
              
              <span className={styles.pageInfo}>
                Page {currentPage} of {pagination.totalPages}
              </span>
              
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, pagination.totalPages))}
                disabled={currentPage === pagination.totalPages}
                className={styles.pageBtn}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default SellersManagement;
