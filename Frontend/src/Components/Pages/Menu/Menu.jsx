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

  const categories = [
    { id: 'all', name: 'All', icon: '☕', color: '#6F4E37' },
    { id: 'hot', name: 'Hot Coffee', icon: '🔥', color: '#E74C3C' },
    { id: 'iced', name: 'Iced Coffee', icon: '🧊', color: '#3498DB' },
    { id: 'frappe', name: 'Frappes', icon: '🥤', color: '#9B59B6' },
    { id: 'specialty', name: 'Specialty', icon: '🌟', color: '#F1C40F' }
  ];

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError('');
      
      const category = selectedCategory === 'all' ? null : selectedCategory;
      const response = await menuAPI.getMenu(category);
      setProducts(response.products);
    } catch (error) {
      setError('Failed to load menu. Please try again.');
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryChange = (categoryId) => {
    setSelectedCategory(categoryId);
    if (categoryId === 'all') {
      setSearchParams({});
    } else {
      setSearchParams({ category: categoryId });
    }
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
            <div className={styles.coffeeSteam}>
              <div></div>
              <div></div>
              <div></div>
            </div>
          </div>
          <p className={styles.loadingText}>Brewing your coffee experience...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.menuContainer}>
        <div className={styles.errorContainer}>
          <div className={styles.errorIcon}>☕❌</div>
          <h3 className={styles.errorTitle}>Oops! Something went wrong</h3>
          <p className={styles.errorMessage}>{error}</p>
          <button onClick={fetchProducts} className={styles.retryButton}>
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
          <h1 className={styles.heroTitle}>Artisan Coffee Menu</h1>
          <p className={styles.heroSubtitle}>
            Handcrafted with passion, served with perfection
          </p>
          <div className={styles.scrollIndicator}>
            <span></span>
          </div>
        </div>
      </div>

      <div className={styles.contentWrapper}>
        <div className={styles.categorySection}>
          <h2 className={styles.sectionTitle}>Our Categories</h2>
          <div className={styles.categoryFilter}>
            {categories.map(category => (
              <button
                key={category.id}
                onClick={() => handleCategoryChange(category.id)}
                className={`${styles.categoryBtn} ${
                  selectedCategory === category.id ? styles.active : ''
                }`}
                style={{
                  '--category-color': category.color,
                  '--category-hover': `${category.color}80`
                }}
              >
                <span className={styles.categoryIcon}>{category.icon}</span>
                <span className={styles.categoryName}>{category.name}</span>
              </button>
            ))}
          </div>
        </div>

        <div className={styles.productsSection}>
          <h2 className={styles.sectionTitle}>
            {selectedCategory === 'all' ? 'All Coffee Selection' : 
             `${categories.find(c => c.id === selectedCategory)?.name} Collection`}
          </h2>
          
          <div className={styles.productsGrid}>
            {products.length === 0 ? (
              <div className={styles.emptyState}>
                <div className={styles.emptyIcon}>☕</div>
                <h3 className={styles.emptyTitle}>No products found</h3>
                <p className={styles.emptyMessage}>
                  We couldn't find any products in this category. Try another selection!
                </p>
              </div>
            ) : (
              products.map(product => (
                <ProductCard
                  key={product.id || product._id}
                  product={product}
                  onClick={() => handleProductClick(product)}
                />
              ))
            )}
          </div>
        </div>
      </div>

      {showModal && selectedProduct && (
        <ProductModal
          product={selectedProduct}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
};

export default Menu;