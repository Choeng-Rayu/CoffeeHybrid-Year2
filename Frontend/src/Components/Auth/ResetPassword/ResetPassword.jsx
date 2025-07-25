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
  const [showPassword, setShowPassword] = useState(false);

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

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Validation
    if (formData.newPassword.length < 8) {
      setError('Password must be at least 8 characters long');
      setIsLoading(false);
      return;
    }

    if (!/[A-Z]/.test(formData.newPassword)) {
      setError('Password must contain at least one uppercase letter');
      setIsLoading(false);
      return;
    }

    if (!/[0-9]/.test(formData.newPassword)) {
      setError('Password must contain at least one number');
      setIsLoading(false);
      return;
    }

    if (!/[^A-Za-z0-9]/.test(formData.newPassword)) {
      setError('Password must contain at least one special character');
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
        <div className={styles.successParticles}></div>
        <div className={styles.card}>
          <div className={styles.successAnimation}>
            <svg className={styles.checkmark} viewBox="0 0 52 52">
              <circle className={styles.checkmarkCircle} cx="26" cy="26" r="25" fill="none"/>
              <path className={styles.checkmarkCheck} fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8"/>
            </svg>
          </div>
          <h2 className={styles.title}>Password Reset Successful!</h2>
          <p className={styles.subtitle}>
            Your password has been successfully updated. You can now login with your new password.
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
        <div className={styles.errorParticles}></div>
        <div className={styles.card}>
          <div className={styles.errorAnimation}>
            <svg className={styles.errorIcon} viewBox="0 0 52 52">
              <circle className={styles.errorCircle} cx="26" cy="26" r="25" fill="none"/>
              <path className={styles.errorLine1} d="M16 16 36 36" fill="none"/>
              <path className={styles.errorLine2} d="M16 36 36 16" fill="none"/>
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
      <div className={styles.particles}></div>
      <div className={styles.card}>
        <div className={styles.header}>
          <div className={styles.logoAnimation}>
            <svg className={styles.logo} viewBox="0 0 100 100">
              <path className={styles.key} d="M50,30 L50,10 L70,10 L70,30 L50,30 Z M30,50 L10,50 L10,70 L30,70 L30,50 Z M50,50 L30,50 L30,70 L50,70 L50,90 L70,90 L70,70 L90,70 L90,50 L70,50 L70,30 L50,30 L50,50 Z"/>
              <circle className={styles.keyhole} cx="60" cy="60" r="10"/>
            </svg>
          </div>
          <h2 className={styles.title}>Reset Your Password</h2>
          <p className={styles.subtitle}>
            Create a strong, secure password to protect your account
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
                type={showPassword ? "text" : "password"}
                id="newPassword"
                name="newPassword"
                value={formData.newPassword}
                onChange={handleChange}
                className={styles.input}
                placeholder="Enter new password (min. 8 characters)"
                required
                disabled={isLoading}
                minLength={8}
              />
              <button 
                type="button" 
                className={styles.showPasswordBtn}
                onClick={togglePasswordVisibility}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 5C5 5 2 12 2 12s3 7 10 7 10-7 10-7-3-7-10-7z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 5C5 5 2 12 2 12s3 7 10 7 10-7 10-7-3-7-10-7z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M2 2l20 20" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                )}
              </button>
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
                type={showPassword ? "text" : "password"}
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={styles.input}
                placeholder="Confirm your new password"
                required
                disabled={isLoading}
                minLength={8}
              />
            </div>
          </div>

          <div className={styles.passwordStrength}>
            <h4>Password Requirements:</h4>
            <ul>
              <li className={formData.newPassword.length >= 8 ? styles.valid : ''}>
                At least 8 characters long
              </li>
              <li className={/[A-Z]/.test(formData.newPassword) ? styles.valid : ''}>
                Contains at least one uppercase letter
              </li>
              <li className={/[0-9]/.test(formData.newPassword) ? styles.valid : ''}>
                Contains at least one number
              </li>
              <li className={/[^A-Za-z0-9]/.test(formData.newPassword) ? styles.valid : ''}>
                Contains at least one special character
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