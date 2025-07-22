import { useState } from 'react';
import { Link } from 'react-router-dom';
import { authAPI } from '../../../services/api';
import styles from './ForgotPassword.module.css';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await authAPI.forgotPassword({ email });
      setMessage(response.message);
      setEmailSent(true);
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to send reset email. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (emailSent) {
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
          <h2 className={styles.title}>Check Your Email</h2>
          <p className={styles.subtitle}>
            We've sent a password reset link to <strong>{email}</strong>
          </p>
          <div className={styles.infoBox}>
            <div className={styles.infoIcon}>⏰</div>
            <div>
              <h3>Important:</h3>
              <p>The reset link will expire in <strong>60 seconds</strong> for security reasons.</p>
              <p>Please check your spam folder if you don't see the email in your inbox.</p>
            </div>
          </div>
          <div className={styles.actions}>
            <Link to="/login" className={styles.backBtn}>
              Back to Login
            </Link>
            <button 
              onClick={() => {
                setEmailSent(false);
                setEmail('');
                setMessage('');
              }}
              className={styles.resendBtn}
            >
              Send Another Email
            </button>
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
                d="M12 14L12 10M12 6H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <h2 className={styles.title}>Forgot Password?</h2>
          <p className={styles.subtitle}>
            No worries! Enter your email address and we'll send you a link to reset your password.
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

        {message && (
          <div className={styles.success}>
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.inputGroup}>
            <label htmlFor="email" className={styles.label}>
              Email Address
            </label>
            <div className={styles.inputWrapper}>
              <svg className={styles.inputIcon} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M3 8L10.89 13.26C11.2187 13.4793 11.6049 13.5963 12 13.5963C12.3951 13.5963 12.7813 13.4793 13.11 13.26L21 8M5 19H19C20.1046 19 21 18.1046 21 17V7C21 5.89543 20.1046 5 19 5H5C3.89543 5 3 5.89543 3 7V17C3 18.1046 3.89543 19 5 19Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError('');
                }}
                className={styles.input}
                placeholder="Enter your email address"
                required
                disabled={isLoading}
              />
            </div>
          </div>

          <button
            type="submit"
            className={styles.submitBtn}
            disabled={isLoading || !email}
          >
            {isLoading ? (
              <>
                <div className={styles.spinner}></div>
                Sending Email...
              </>
            ) : (
              <>
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M3 8L10.89 13.26C11.2187 13.4793 11.6049 13.5963 12 13.5963C12.3951 13.5963 12.7813 13.4793 13.11 13.26L21 8M5 19H19C20.1046 19 21 18.1046 21 17V7C21 5.89543 20.1046 5 19 5H5C3.89543 5 3 5.89543 3 7V17C3 18.1046 3.89543 19 5 19Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                Send Reset Email
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

export default ForgotPassword;
