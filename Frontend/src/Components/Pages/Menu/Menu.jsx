import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { menuAPI } from '../../../services/api';
import ProductCard from '../../ProductCard/ProductCard';
import ProductModal from '../../ProductModal/ProductModal';
import styles from './Menu.module.css';

const Menu = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'all');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const [loadingPage, setLoadingPage] = useState(false);

  const categories = [
    { id: 'hot', name: 'Hot Coffee', icon: '☕', color: 'var(--cinnamon)' },
    { id: 'iced', name: 'Cold Brews', icon: '🧊', color: 'var(--accent-green)' },
    { id: 'frappe', name: 'Frappes', icon: '🥤', color: 'var(--accent-purple)' },
    { id: 'dessert', name: 'Pastries', icon: '🍰', color: 'var(--caramel)' },
    { id: 'specialty', name: 'Specialties', icon: '✨', color: 'var(--accent-red)' }
  ];

  useEffect(() => {
    setCurrentPage(1); // Reset to first page when category changes
    fetchProducts(1);
  }, [selectedCategory]);

  const fetchProducts = async (page = currentPage) => {
    try {
      if (page === 1) {
        setLoading(true);
      } else {
        setLoadingPage(true);
      }
      setError('');

      const category = selectedCategory === 'all' ? null : selectedCategory;
      const response = await menuAPI.getMenu(category, page, 10);
      setProducts(response.products);
      setPagination(response.pagination);
      setCurrentPage(page);
    } catch (error) {
      setError('We encountered an issue loading our menu. Please try again.');
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
      setLoadingPage(false);
    }
  };

  const handleCategoryChange = (categoryId) => {
    setSelectedCategory(categoryId);
    setCurrentPage(1); // Reset to first page
    if (categoryId === 'all') {
      setSearchParams({});
    } else {
      setSearchParams({ category: categoryId });
    }
  };

  const handlePageChange = (page) => {
    fetchProducts(page);
  };

  const handleProductClick = (product) => {
    setSelectedProduct(product);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedProduct(null);
  };

  if (loading) {
    return (
      <div className={styles.menuContainer}>
        <div className={styles.loadingContainer}>
          <div className={styles.coffeeLoader}>
            <div className={styles.coffeeCup}></div>
            <div className={styles.steam}>
              <div></div>
              <div></div>
              <div></div>
            </div>
          </div>
          <p className={styles.loadingText}>Brewing our fresh menu...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.menuContainer}>
        <div className={styles.errorContainer}>
          <div className={styles.errorIcon}>☕</div>
          <h3 className={styles.errorTitle}>Something went wrong</h3>
          <p className={styles.errorMessage}>{error}</p>
          <button 
            onClick={fetchProducts} 
            className={styles.retryButton}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.menuContainer}>
      <div className={styles.heroSection}>
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>Coffee <span>Hybrid</span></h1>
          <p className={styles.heroSubtitle}>
            Where tradition meets innovation in every cup
          </p>
        </div>
      </div>

      <div className={styles.contentWrapper}>
        <div className={styles.divider}></div>
        
        <h2 className={styles.sectionTitle}>Our Menu</h2>
        <p className={styles.sectionSubtitle}>
          Carefully crafted beverages and desserts made with premium ingredients
        </p>

        <div className={styles.categoryFilter}>
          <button
            onClick={() => handleCategoryChange('all')}
            className={`${styles.categoryBtn} ${
              selectedCategory === 'all' ? styles.active : ''
            }`}
          >
            <span>☕</span>
            <span>All Items</span>
          </button>
          
          {categories.map(category => (
            <button
              key={category.id}
              onClick={() => handleCategoryChange(category.id)}
              className={`${styles.categoryBtn} ${
                selectedCategory === category.id ? styles.active : ''
              }`}
              data-category={category.id}
            >
              <span>{category.icon}</span>
              <span>{category.name}</span>
            </button>
          ))}
        </div>

        <div className={styles.productsGrid}>
          {products.length === 0 ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>☕</div>
              <h3 className={styles.emptyTitle}>No items found</h3>
              <p className={styles.emptyMessage}>
                We couldn't find any items in this category. Try another selection!
              </p>
            </div>
          ) : (
            products.map(product => (
              <ProductCard
                key={product.id || product._id}
                product={product}
                onClick={() => handleProductClick(product)}
                accentColor={categories.find(c => c.id === product.category)?.color || 'var(--cinnamon)'}
              />
            ))
          )}
        </div>

        {/* Pagination Controls */}
        {pagination && pagination.totalPages > 1 && (
          <div className={styles.pagination}>
            <div className={styles.paginationInfo}>
              Showing {products.length} of {pagination.totalProducts} products
            </div>
            <div className={styles.paginationControls}>
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={!pagination.hasPrevPage || loadingPage}
                className={styles.paginationBtn}
              >
                ← Previous
              </button>

              <div className={styles.pageNumbers}>
                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                  .filter(page =>
                    page === 1 ||
                    page === pagination.totalPages ||
                    Math.abs(page - currentPage) <= 2
                  )
                  .map((page, index, array) => (
                    <div key={page}>
                      {index > 0 && array[index - 1] !== page - 1 && (
                        <span className={styles.ellipsis}>...</span>
                      )}
                      <button
                        onClick={() => handlePageChange(page)}
                        disabled={loadingPage}
                        className={`${styles.pageBtn} ${
                          page === currentPage ? styles.active : ''
                        }`}
                      >
                        {page}
                      </button>
                    </div>
                  ))}
              </div>

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={!pagination.hasNextPage || loadingPage}
                className={styles.paginationBtn}
              >
                Next →
              </button>
            </div>
          </div>
        )}
      </div>

      {showModal && selectedProduct && (
        <ProductModal
          product={selectedProduct}
          onClose={handleCloseModal}
          accentColor={categories.find(c => c.id === selectedProduct.category)?.color || 'var(--cinnamon)'}
        />
      )}
    </div>
  );
};

export default Menu;