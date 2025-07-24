import { Link, useNavigate } from 'react-router-dom';
import { useUser } from '../../context/UserContext';
import { useCart } from '../../context/CartContext';
import styles from './Navbar.module.css';
import { FaHome, FaCoffee, FaShoppingCart, FaClipboardList, FaUserShield, FaSignInAlt, FaUserPlus, FaStore } from 'react-icons/fa';
import { useState, useEffect } from 'react';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useUser();
  const { getCartItemCount } = useCart();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    document.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      document.removeEventListener('scroll', handleScroll);
    };
  }, [scrolled]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleMenuToggle = () => {
    setMenuOpen((prevState) => !prevState);
  };

  return (
    <nav className={`${styles.navbar} ${scrolled ? styles.scrolled : ''}`}>
      <div className={styles.navContainer}>
        <Link to="/" className={styles.logo}>
          <span className={styles.logoIcon}>☕</span>
          <span className={styles.logoText}>Brew Haven</span>
        </Link>
        
        <div className={`${styles.navLinks} ${menuOpen ? styles.open : ''}`}>
          <Link to="/" className={styles.navLink} onClick={() => setMenuOpen(false)}>
            <FaHome className={styles.navIcon} />
            <span className={styles.linkText}>Home</span>
          </Link>
          <Link to="/menu" className={styles.navLink} onClick={() => setMenuOpen(false)}>
            <FaCoffee className={styles.navIcon} />
            <span className={styles.linkText}>Menu</span>
          </Link>

          {isAuthenticated ? (
            <>
              {(user.role === 'seller' || user.role === 'admin') ? (
                <Link to="/admin/dashboard" className={styles.navLink} onClick={() => setMenuOpen(false)}>
                  <FaUserShield className={styles.navIcon} />
                  <span className={styles.linkText}>Dashboard</span>
                </Link>
              ) : (
                <>
                  <Link to="/cart" className={styles.navLink} onClick={() => setMenuOpen(false)}>
                    <div className={styles.cartWrapper}>
                      <FaShoppingCart className={styles.navIcon} />
                      {getCartItemCount() > 0 && (
                        <span className={styles.cartBadge}>{getCartItemCount()}</span>
                      )}
                    </div>
                    <span className={styles.linkText}>Cart</span>
                  </Link>
                  <Link to="/orders" className={styles.navLink} onClick={() => setMenuOpen(false)}>
                    <FaClipboardList className={styles.navIcon} />
                    <span className={styles.linkText}>Orders</span>
                  </Link>
                </>
              )}
              <div className={styles.userDropdown}>
                <button className={styles.userButton}>
                  <div className={styles.userAvatar}>
                    {user.username.charAt(0).toUpperCase()}
                  </div>
                  <span className={styles.username}>
                    {user.username}
                    {(user.role === 'seller' || user.role === 'admin') && (
                      <span className={styles.roleTag}>{user.role}</span>
                    )}
                  </span>
                </button>
                <div className={styles.dropdownMenu}>
                  <button onClick={handleLogout} className={styles.dropdownItem}>
                    Sign Out
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className={styles.authButtons}>
              <Link to="/login" className={`${styles.authButton} ${styles.loginButton}`} onClick={() => setMenuOpen(false)}>
                <FaSignInAlt className={styles.buttonIcon} />
                <span className={styles.buttonText}>Login</span>
              </Link>
              <Link to="/register" className={`${styles.authButton} ${styles.registerButton}`} onClick={() => setMenuOpen(false)}>
                <FaUserPlus className={styles.buttonIcon} />
                <span className={styles.buttonText}>Register</span>
              </Link>
              <Link to="/admin/login" className={`${styles.authButton} ${styles.sellerButton}`} onClick={() => setMenuOpen(false)}>
                <FaStore className={styles.buttonIcon} />
                <span className={styles.buttonText}>Seller Portal</span>
              </Link>
            </div>
          )}
        </div>

        <button 
          className={`${styles.hamburger} ${menuOpen ? styles.open : ''}`} 
          onClick={handleMenuToggle}
          aria-label="Toggle menu"
          aria-expanded={menuOpen}
        >
          <span className={styles.hamburgerLine}></span>
          <span className={styles.hamburgerLine}></span>
          <span className={styles.hamburgerLine}></span>
        </button>
      </div>
    </nav>
  );
};

export default Navbar;