import { Link } from 'react-router-dom';
import { useUser } from '../../../context/UserContext';
import styles from './Home.module.css';

const Home = () => {
  const { isAuthenticated, user } = useUser();

  return (
    <div className={styles.container}>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <h1 className={styles.title}>
            Welcome to <span>CoffeeHybrid</span>
          </h1>
          <p className={styles.subtitle}>
            Order your perfect coffee through our web app or Telegram bot
            with secure QR code pickup verification.
          </p>
          
          <div className={styles.ctaContainer}>
            {isAuthenticated ? (
              <>
                <h2>Welcome back, {user.username}!</h2>
                <div className={styles.buttonGroup}>
                  <Link to="/menu" className={`${styles.button} ${styles.primary}`}>
                    Browse Menu
                  </Link>
                  <Link to="/orders" className={`${styles.button} ${styles.secondary}`}>
                    My Orders
                  </Link>
                </div>
              </>
            ) : (
              <div className={styles.buttonGroup}>
                <Link to="/register" className={`${styles.button} ${styles.primary}`}>
                  Get Started
                </Link>
                <Link to="/login" className={`${styles.button} ${styles.secondary}`}>
                  Sign In
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className={styles.features}>
        <h2>Why Choose CoffeeHybrid?</h2>
        <div className={styles.featureGrid}>
          <div className={styles.featureCard}>
            <div className={styles.icon}>🌐</div>
            <h3>Dual Platform</h3>
            <p>Order via web or Telegram for maximum convenience</p>
          </div>
          
          <div className={styles.featureCard}>
            <div className={styles.icon}>📱</div>
            <h3>QR Verification</h3>
            <p>Secure pickup with unique QR codes for each order</p>
          </div>
          
          <div className={styles.featureCard}>
            <div className={styles.icon}>⚡</div>
            <h3>Fast Service</h3>
            <p>Reduced wait times and no order mix-ups</p>
          </div>
          
          <div className={styles.featureCard}>
            <div className={styles.icon}>🎨</div>
            <h3>Customization</h3>
            <p>Tailor your drink exactly how you like it</p>
          </div>
        </div>
      </section>

      {/* Menu Categories */}
      <section className={styles.categories}>
        <h2>Our Coffee Selection</h2>
        <div className={styles.categoryGrid}>
          <Link to="/menu?category=hot" className={styles.categoryCard}>
            <div className={styles.categoryIcon}>☕</div>
            <h3>Hot Coffee</h3>
            <p>Classic warm beverages</p>
          </Link>
          
          <Link to="/menu?category=iced" className={styles.categoryCard}>
            <div className={styles.categoryIcon}>🧊</div>
            <h3>Iced Coffee</h3>
            <p>Refreshing cold options</p>
          </Link>
          
          <Link to="/menu?category=frappe" className={styles.categoryCard}>
            <div className={styles.categoryIcon}>🥤</div>
            <h3>Frappes</h3>
            <p>Blended creamy delights</p>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;