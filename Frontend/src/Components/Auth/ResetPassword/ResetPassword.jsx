import { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { authAPI } from '../../../services/api';
import styles from './ResetPassword.module.css';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [token, setToken] = useState('');

  useEffect(() => {
    const resetToken = searchParams.get('token');
    if (!resetToken) {
      setError('Invalid reset link. Please request a new password reset.');
    } else {
      setToken(resetToken);
    }
  }, [searchParams]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Validation
    if (formData.newPassword.length < 6) {
      setError('Password must be at least 6 characters long');
      setIsLoading(false);
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    try {
      await authAPI.resetPassword({
        token,
        newPassword: formData.newPassword
      });
      setSuccess(true);
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to reset password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className={styles.container}>
        <div className={styles.card}>
          <div className={styles.successIcon}>
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <h2 className={styles.title}>Password Reset Successful!</h2>
          <p className={styles.subtitle}>
            Your password has been successfully reset. You can now login with your new password.
          </p>
          <div className={styles.actions}>
            <Link to="/login" className={styles.loginBtn}>
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M15 3H19C20.1046 3 21 3.89543 21 5V19C21 20.1046 20.1046 21 19 21H15M10 17L15 12L10 7M15 12H3"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Continue to Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!token) {
    return (
      <div className={styles.container}>
        <div className={styles.card}>
          <div className={styles.errorIcon}>
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M12 9V13M12 17H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <h2 className={styles.title}>Invalid Reset Link</h2>
          <p className={styles.subtitle}>
            This password reset link is invalid or has expired. Please request a new password reset.
          </p>
          <div className={styles.actions}>
            <Link to="/forgot-password" className={styles.requestBtn}>
              Request New Reset
            </Link>
            <Link to="/login" className={styles.backBtn}>
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.header}>
          <div className={styles.icon}>
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M12 15V9M9 12L15 12M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <h2 className={styles.title}>Reset Your Password</h2>
          <p className={styles.subtitle}>
            Enter your new password below. Make sure it's strong and secure!
          </p>
        </div>

        {error && (
          <div className={styles.error}>
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M12 9V13M12 17H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.inputGroup}>
            <label htmlFor="newPassword" className={styles.label}>
              New Password
            </label>
            <div className={styles.inputWrapper}>
              <svg className={styles.inputIcon} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M5 11H19M5 11C3.89543 11 3 11.8954 3 13V18C3 19.1046 3.89543 20 5 20H19C20.1046 20 21 19.1046 21 18V13C21 11.8954 20.1046 11 19 11M5 11V7C5 5.93913 5.42143 4.92172 6.17157 4.17157C6.92172 3.42143 7.93913 3 9 3H15C16.0609 3 17.0783 3.42143 17.8284 4.17157C18.5786 4.92172 19 5.93913 19 7V11"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <input
                type="password"
                id="newPassword"
                name="newPassword"
                value={formData.newPassword}
                onChange={handleChange}
                className={styles.input}
                placeholder="Enter new password (min. 6 characters)"
                required
                disabled={isLoading}
                minLength={6}
              />
            </div>
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="confirmPassword" className={styles.label}>
              Confirm New Password
            </label>
            <div className={styles.inputWrapper}>
              <svg className={styles.inputIcon} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M5 11H19M5 11C3.89543 11 3 11.8954 3 13V18C3 19.1046 3.89543 20 5 20H19C20.1046 20 21 19.1046 21 18V13C21 11.8954 20.1046 11 19 11M5 11V7C5 5.93913 5.42143 4.92172 6.17157 4.17157C6.92172 3.42143 7.93913 3 9 3H15C16.0609 3 17.0783 3.42143 17.8284 4.17157C18.5786 4.92172 19 5.93913 19 7V11"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={styles.input}
                placeholder="Confirm your new password"
                required
                disabled={isLoading}
                minLength={6}
              />
            </div>
          </div>

          <div className={styles.passwordStrength}>
            <h4>Password Requirements:</h4>
            <ul>
              <li className={formData.newPassword.length >= 6 ? styles.valid : ''}>
                At least 6 characters long
              </li>
              <li className={formData.newPassword === formData.confirmPassword && formData.newPassword ? styles.valid : ''}>
                Passwords match
              </li>
            </ul>
          </div>

          <button
            type="submit"
            className={styles.submitBtn}
            disabled={isLoading || !formData.newPassword || !formData.confirmPassword}
          >
            {isLoading ? (
              <>
                <div className={styles.spinner}></div>
                Resetting Password...
              </>
            ) : (
              <>
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                Reset Password
              </>
            )}
          </button>
        </form>

        <div className={styles.footer}>
          <p>
            Remember your password?{' '}
            <Link to="/login" className={styles.link}>
              Back to Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
