import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useUser } from '../../../context/UserContext';
import { authAPI } from '../../../services/api';
import styles from './Login.module.css';

const Login = () => {
  const [formData, setFormData] = useState({
    emailOrUsername: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [activeField, setActiveField] = useState(null);

  const { login } = useUser();
  const navigate = useNavigate();
  const location = useLocation();

  // Handle Google OAuth callback
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const token = urlParams.get('token');
    const userStr = urlParams.get('user');
    const error = urlParams.get('error');

    if (error) {
      if (error === 'oauth_not_configured') {
        setError('Google OAuth is not configured. Please use email/password login.');
      } else {
        setError('Google authentication failed. Please try again.');
      }
      return;
    }

    if (token && userStr) {
      try {
        const user = JSON.parse(decodeURIComponent(userStr));

        // Store token and user data
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));

        // Login user
        login(user);

        // Redirect based on role
        if (user.role === 'admin' || user.role === 'seller') {
          navigate('/seller-dashboard');
        } else {
          navigate('/menu');
        }
      } catch (error) {
        console.error('Error parsing user data:', error);
        setError('Authentication error. Please try again.');
      }
    }
  }, [location.search, login, navigate]);

  const handleGoogleLogin = () => {
    setIsGoogleLoading(true);
    setError('');

    // Redirect to Google OAuth - explicit URL for production
    const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    const googleOAuthUrl = `${API_BASE_URL}/auth/google`;

    console.log('🔍 Google OAuth URL:', googleOAuthUrl);
    console.log('🔍 VITE_API_URL:', import.meta.env.VITE_API_URL);
    console.log('🔍 Environment:', import.meta.env.MODE);

    window.location.href = googleOAuthUrl;
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError(''); // Clear error when user types
  };

  const handleFocus = (fieldName) => {
    setActiveField(fieldName);
  };

  const handleBlur = () => {
    setActiveField(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await authAPI.login(formData);
      login(response.user);
      navigate('/menu');
    } catch (error) {
      setError(error.response?.data?.error || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.loginContainer}>
      <div className={styles.backgroundAnimation}></div>
      <div className={styles.loginCard}>
        <div className={styles.logoContainer}>
          <div className={styles.logoCup}></div>
          <h1 className={styles.logoText}>CoffeeHybrid</h1>
        </div>
        
        <h2 className={styles.title}>Welcome Back</h2>
        <p className={styles.subtitle}>Sign in to your account</p>

        {error && (
          <div className={styles.error}>
            <svg className={styles.errorIcon} viewBox="0 0 24 24">
              <path fill="currentColor" d="M11,15H13V17H11V15M11,7H13V13H11V7M12,2C6.47,2 2,6.5 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20Z" />
            </svg>
            {error}
          </div>
        )}

        {/* Google OAuth Button */}
        <button
          type="button"
          onClick={handleGoogleLogin}
          className={styles.googleBtn}
          disabled={isGoogleLoading || isLoading}
        >
          <svg className={styles.googleIcon} viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          {isGoogleLoading ? 'Connecting to Google...' : 'Continue with Google'}
        </button>

        <div className={styles.divider}>
          <span>or</span>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={`${styles.inputGroup} ${activeField === 'emailOrUsername' ? styles.active : ''}`}>
            <label htmlFor="emailOrUsername" className={styles.label}>
              Email or Username
            </label>
            <input
              type="text"
              id="emailOrUsername"
              name="emailOrUsername"
              value={formData.emailOrUsername}
              onChange={handleChange}
              onFocus={() => handleFocus('emailOrUsername')}
              onBlur={handleBlur}
              className={styles.input}
              required
              placeholder="Enter your email or username"
            />
            <div className={styles.inputUnderline}></div>
          </div>

          <div className={`${styles.inputGroup} ${activeField === 'password' ? styles.active : ''}`}>
            <label htmlFor="password" className={styles.label}>
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              onFocus={() => handleFocus('password')}
              onBlur={handleBlur}
              className={styles.input}
              required
              placeholder="Enter your password"
            />
            <div className={styles.inputUnderline}></div>
          </div>

          <div className={styles.forgotPasswordLink}>
            <Link to="/forgot-password" className={styles.forgotLink}>
              Forgot your password?
            </Link>
          </div>

          <button
            type="submit"
            className={styles.submitBtn}
            disabled={isLoading}
          >
            {isLoading ? (
              <span className={styles.spinner}></span>
            ) : (
              <>
                Sign In
                <svg className={styles.arrowIcon} viewBox="0 0 24 24">
                  <path fill="currentColor" d="M4,11V13H16L10.5,18.5L11.92,19.92L19.84,12L11.92,4.08L10.5,5.5L16,11H4Z" />
                </svg>
              </>
            )}
          </button>
        </form>

        <div className={styles.footer}>
          <p>
            Don't have an account?{' '}
            <Link to="/register" className={styles.link}>
              Sign up here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;