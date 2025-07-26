import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../../context/UserContext';
import { superAdminAPI } from '../../../services/api';
import {
  FiUser,
  FiMail,
  FiLock,
  FiHome,
  FiArrowLeft,
  FiCheck,
  FiX
} from 'react-icons/fi';
import styles from './CreateSeller.module.css';

const CreateSeller = () => {
  const { user, isAuthenticated } = useUser();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    shopName: '',
    firstName: '',
    lastName: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!formData.shopName.trim()) {
      newErrors.shopName = 'Shop name is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const { confirmPassword, ...sellerData } = formData;
      await superAdminAPI.createSeller(sellerData);
      setSuccess(true);
      
      // Reset form
      setFormData({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        shopName: '',
        firstName: '',
        lastName: ''
      });
      
      // Redirect after success
      setTimeout(() => {
        navigate('/super-admin/sellers');
      }, 2000);
      
    } catch (error) {
      if (error.response?.data?.errors) {
        // Handle validation errors from backend
        const backendErrors = {};
        error.response.data.errors.forEach(err => {
          backendErrors[err.field] = err.message;
        });
        setErrors(backendErrors);
      } else {
        setErrors({
          general: error.response?.data?.error || 'Failed to create seller. Please try again.'
        });
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated || user?.role !== 'admin') {
    navigate('/login');
    return null;
  }

  if (success) {
    return (
      <div className={styles.container}>
        <div className={styles.successCard}>
          <div className={styles.successIcon}>
            <FiCheck />
          </div>
          <h2>Seller Created Successfully!</h2>
          <p>The new seller account has been created and can now start adding products.</p>
          <button 
            onClick={() => navigate('/super-admin/sellers')}
            className={styles.successBtn}
          >
            View All Sellers
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <button 
          onClick={() => navigate('/super-admin/sellers')}
          className={styles.backBtn}
        >
          <FiArrowLeft />
          Back to Sellers
        </button>
        
        <div className={styles.titleSection}>
          <h1 className={styles.title}>
            <FiHome className={styles.titleIcon} />
            Create New Seller
          </h1>
          <p className={styles.subtitle}>
            Add a new seller to the coffee ordering system
          </p>
        </div>
      </div>

      <div className={styles.formCard}>
        <form onSubmit={handleSubmit} className={styles.form}>
          {errors.general && (
            <div className={styles.errorAlert}>
              <FiX className={styles.errorIcon} />
              {errors.general}
            </div>
          )}

          <div className={styles.formGrid}>
            {/* Username */}
            <div className={styles.formGroup}>
              <label className={styles.label}>
                <FiUser className={styles.labelIcon} />
                Username *
              </label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className={`${styles.input} ${errors.username ? styles.inputError : ''}`}
                placeholder="Enter username"
              />
              {errors.username && (
                <span className={styles.errorText}>{errors.username}</span>
              )}
            </div>

            {/* Email */}
            <div className={styles.formGroup}>
              <label className={styles.label}>
                <FiMail className={styles.labelIcon} />
                Email *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`${styles.input} ${errors.email ? styles.inputError : ''}`}
                placeholder="Enter email address"
              />
              {errors.email && (
                <span className={styles.errorText}>{errors.email}</span>
              )}
            </div>

            {/* Shop Name */}
            <div className={styles.formGroup}>
              <label className={styles.label}>
                <FiHome className={styles.labelIcon} />
                Shop Name *
              </label>
              <input
                type="text"
                name="shopName"
                value={formData.shopName}
                onChange={handleChange}
                className={`${styles.input} ${errors.shopName ? styles.inputError : ''}`}
                placeholder="Enter shop name"
              />
              {errors.shopName && (
                <span className={styles.errorText}>{errors.shopName}</span>
              )}
            </div>

            {/* First Name */}
            <div className={styles.formGroup}>
              <label className={styles.label}>
                <FiUser className={styles.labelIcon} />
                First Name
              </label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                className={styles.input}
                placeholder="Enter first name (optional)"
              />
            </div>

            {/* Last Name */}
            <div className={styles.formGroup}>
              <label className={styles.label}>
                <FiUser className={styles.labelIcon} />
                Last Name
              </label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                className={styles.input}
                placeholder="Enter last name (optional)"
              />
            </div>

            {/* Password */}
            <div className={styles.formGroup}>
              <label className={styles.label}>
                <FiLock className={styles.labelIcon} />
                Password *
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={`${styles.input} ${errors.password ? styles.inputError : ''}`}
                placeholder="Enter password"
              />
              {errors.password && (
                <span className={styles.errorText}>{errors.password}</span>
              )}
            </div>

            {/* Confirm Password */}
            <div className={styles.formGroup}>
              <label className={styles.label}>
                <FiLock className={styles.labelIcon} />
                Confirm Password *
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={`${styles.input} ${errors.confirmPassword ? styles.inputError : ''}`}
                placeholder="Confirm password"
              />
              {errors.confirmPassword && (
                <span className={styles.errorText}>{errors.confirmPassword}</span>
              )}
            </div>
          </div>

          <div className={styles.formActions}>
            <button
              type="button"
              onClick={() => navigate('/super-admin/sellers')}
              className={styles.cancelBtn}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className={styles.submitBtn}
            >
              {loading ? (
                <>
                  <div className={styles.spinner}></div>
                  Creating...
                </>
              ) : (
                <>
                  <FiCheck />
                  Create Seller
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateSeller;
