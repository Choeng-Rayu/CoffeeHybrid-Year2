import { Link, useNavigate } from 'react-router-dom';
import { useUser } from '../../context/UserContext';
import { useCart } from '../../context/CartContext';
import styles from './Navbar.module.css';
import { FaHome, FaCoffee, FaShoppingCart, FaClipboardList, FaUserShield, FaSignInAlt, FaUserPlus, FaStore } from 'react-icons/fa';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useUser();
  const { getCartItemCount } = useCart();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className={styles.navbar}>
      <div className={styles.navContainer}>
        <div className={styles.logoRight}>
          <span className={styles.logoIcon}>☕</span>
        </div>
        <button className={styles.menuToggle} onClick={handleMenuToggle}>
          <span className={styles.dotsIcon}>⋯</span>
        </button>
        <div
          className={styles.leftMenu + ' ' + (menuOpen ? styles.open : '')}
        >
          <Link to="/" className={styles.navLink} onClick={() => setMenuOpen(false)}>
            Home
          </Link>
          <Link to="/menu" className={styles.navLink} onClick={() => setMenuOpen(false)}>
            Menu
          </Link>

          {isAuthenticated ? (
            <>
              {(user.role === 'seller' || user.role === 'admin') ? (
                <Link to="/admin/dashboard" className={styles.navLink} onClick={() => setMenuOpen(false)}>
                  Seller Dashboard
                </Link>
              ) : (
                <>
                  <Link to="/cart" className={styles.navLink} onClick={() => setMenuOpen(false)}>
                    Cart ({getCartItemCount()})
                  </Link>
                  <Link to="/orders" className={styles.navLink} onClick={() => setMenuOpen(false)}>
                    Orders
                  </Link>
                </>
              )}
              <div className={styles.userMenu}>
                <span className={styles.username}>
                  Hello, {user.username}
                  {(user.role === 'seller' || user.role === 'admin') && (
                    <span className={styles.roleTag}>({user.role})</span>
                  )}
                </span>
                <button
                  onClick={handleLogout}
                  className={styles.logoutBtn}
                >
                  Logout
                </button>
              </div>
            </>
          ) : (
            <div className={styles.authLinks}>
              <Link to="/login" className={styles.navLink} onClick={() => setMenuOpen(false)}>
                Login
              </Link>
              <Link to="/register" className={styles.navLink} onClick={() => setMenuOpen(false)}>
                Register
              </Link>
              <Link to="/admin/login" className={styles.navLink} onClick={() => setMenuOpen(false)}>
                Seller Portal
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
