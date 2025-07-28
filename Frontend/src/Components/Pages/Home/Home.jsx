import { Link } from 'react-router-dom';
import { useUser } from '../../../context/UserContext';
import styles from './Home.module.css';
import { useEffect, useState } from 'react';

const Home = () => {
  const { isAuthenticated, user } = useUser();
  const [isMobile, setIsMobile] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Premium coffee images
  const coffeeImages = [
    {
      url: 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
      title: 'Artisan Brews',
      subtitle: 'Handcrafted with precision'
    },
    {
      url: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2069&q=80',
      title: 'Rich Aromas',
      subtitle: 'Experience our signature blends'
    },
    {
      url: 'https://images.unsplash.com/photo-1511920170033-f8396924c348?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
      title: 'Perfect Crema',
      subtitle: 'Barista-quality every time'
    },
    {
      url: 'https://images.unsplash.com/photo-1515442261605-65987783cb6a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
      title: 'Sustainable Sourcing',
      subtitle: 'Ethically grown beans'
    }
  ];

  useEffect(() => {
    const userAgent = navigator.userAgent.toLowerCase();
    setIsMobile(/mobile|android|ios|iphone|ipad|ipod|windows phone/i.test(userAgent));
    
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => 
        prevIndex === coffeeImages.length - 1 ? 0 : prevIndex + 1
      );
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className={styles.container}>
      {/* Hero Carousel Section - Now the main visual element */}
      <section className={styles.heroCarousel}>
        <div className={styles.carouselTrack} style={{ transform: `translateX(-${currentImageIndex * 100}%)` }}>
          {coffeeImages.map((image, index) => (
            <div key={index} className={styles.carouselSlide}>
              <img src={image.url} alt={`Coffee ${index + 1}`} className={styles.carouselImage} />
              <div className={styles.heroContent}>
                <div className={styles.titleWrapper}>
                  <h1 className={styles.title}>
                    <span className={styles.titleMain}>COFFEE HYBRID</span>
                    <span className={styles.titleSub}>{image.title}</span>
                  </h1>
                  <p className={styles.subtitle}>{image.subtitle}</p>
                </div>
              </div>
              <div className={styles.imageOverlay}></div>
            </div>
          ))}
        </div>
        
        <div className={styles.carouselDots}>
          {coffeeImages.map((_, index) => (
            <button
              key={index}
              className={`${styles.dot} ${index === currentImageIndex ? styles.activeDot : ''}`}
              onClick={() => setCurrentImageIndex(index)}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className={styles.ctaSection}>
        <div className={styles.ctaContainer}>
          {isAuthenticated ? (
            <>
              <h2 className={styles.welcomeBack}>Welcome back, <span>{user.username}</span></h2>
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
          <a href="https://t.me/HybrideCoffeeBot" target="_blank" rel="noopener noreferrer" className={`${styles.button} ${styles.telegram}`}>
              <span className={styles.telegramIcon}>✈️</span> Order on Telegram
          </a>
        </div>
      </section>

      {/* Menu Categories */}
      <section className={styles.categories}>
        <h2 className={styles.sectionTitle}>OUR SPECIALTIES</h2>
        <div className={styles.categoryGrid}>
          <Link to="/menu?category=hot" className={styles.categoryCard}>
            <div className={styles.categoryContent}>
              <div className={styles.categoryIcon}>HOT</div>
              <h3>Classic Brews</h3>
              <p>Traditional warmth in every sip</p>
            </div>
          </Link>
          
          <Link to="/menu?category=iced" className={styles.categoryCard}>
            <div className={styles.categoryContent}>
              <div className={styles.categoryIcon}>ICE</div>
              <h3>Iced Delights</h3>
              <p>Refreshment perfected</p>
            </div>
          </Link>
          
          <Link to="/menu?category=frappe" className={styles.categoryCard}>
            <div className={styles.categoryContent}>
              <div className={styles.categoryIcon}>BLEND</div>
              <h3>Creamy Indulgence</h3>
              <p>Velvety smooth textures</p>
            </div>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;