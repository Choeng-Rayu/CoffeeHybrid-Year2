import axios from 'axios';
import hostingDetector from '../utils/hostingDetector.js';

// Use hosting detector to get the correct API URL
const API_BASE_URL = hostingDetector.config.apiBaseUrl;

console.log('🌐 API Configuration:', {
  environment: hostingDetector.environment,
  apiBaseUrl: API_BASE_URL,
  isProduction: hostingDetector.config.isProduction,
});

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API calls
export const authAPI = {
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  registerTelegram: async (telegramData) => {
    const response = await api.post('/auth/register-telegram', telegramData);
    return response.data;
  },

  // Google OAuth functions
  googleOAuthStatus: async () => {
    const response = await api.get('/auth/google/status');
    return response.data;
  },

  verifyGoogleToken: async (googleToken) => {
    const response = await api.post('/auth/google/verify', { googleToken });
    return response.data;
  },

  forgotPassword: async (emailData) => {
    const response = await api.post('/auth/forgot-password', emailData);
    return response.data;
  },

  resetPassword: async (resetData) => {
    const response = await api.post('/auth/reset-password', resetData);
    return response.data;
  }
};

// Menu API calls
export const menuAPI = {
  getMenu: async (category = null) => {
    const url = category ? `/menu/category/${category}` : '/menu';
    const response = await api.get(url);
    return response.data;
  },

  getProduct: async (productId) => {
    const response = await api.get(`/menu/product/${productId}`);
    return response.data;
  },

  initializeMenu: async () => {
    const response = await api.post('/menu/initialize');
    return response.data;
  }
};

// Orders API calls
export const ordersAPI = {
  createOrder: async (orderData) => {
    const response = await api.post('/orders', orderData);
    return response.data;
  },

  getOrderQR: async (orderId) => {
    const response = await api.get(`/orders/${orderId}/qr`, {
      responseType: 'blob'
    });
    return response.data;
  },

  verifyQR: async (qrToken) => {
    const response = await api.post('/orders/verify-qr', { qrToken });
    return response.data;
  },

  getUserOrders: async (userId, params = {}) => {
    const response = await api.get(`/orders/user/${userId}`, { params });
    return response.data;
  },

  getOrder: async (orderId) => {
    const response = await api.get(`/orders/${orderId}`);
    return response.data;
  },

  cancelOrder: async (orderId) => {
    const response = await api.patch(`/orders/${orderId}/cancel`);
    return response.data;
  }
};

// Cart API calls
export const cartAPI = {
  addToCart: async (cartItemData) => {
    const response = await api.post('/cart', cartItemData);
    return response.data;
  },

  getCart: async (sessionId, userId = null) => {
    const params = userId ? { userId } : {};
    const response = await api.get(`/cart/${sessionId}`, { params });
    return response.data;
  },

  updateCartItem: async (cartItemId, updateData) => {
    const response = await api.put(`/cart/${cartItemId}`, updateData);
    return response.data;
  },

  removeFromCart: async (cartItemId) => {
    const response = await api.delete(`/cart/${cartItemId}`);
    return response.data;
  },

  clearCart: async (sessionId, userId = null) => {
    const params = userId ? { userId } : {};
    const response = await api.delete(`/cart/clear/${sessionId}`, { params });
    return response.data;
  },

  syncCart: async (syncData) => {
    const response = await api.post('/cart/sync', syncData);
    return response.data;
  }
};

// Admin/Seller API calls
export const adminAPI = {
  registerSeller: async (sellerData) => {
    const response = await api.post('/admin/register-seller', sellerData);
    return response.data;
  },

  addProduct: async (productData) => {
    const response = await api.post('/admin/products', productData);
    return response.data;
  },

  getSellerProducts: async (sellerId) => {
    const response = await api.get(`/admin/products/${sellerId}`);
    return response.data;
  },

  updateProduct: async (productId, productData) => {
    const response = await api.put(`/admin/products/${productId}`, productData);
    return response.data;
  },

  deleteProduct: async (productId, userId) => {
    const response = await api.delete(`/admin/products/${productId}`, {
      data: { userId }
    });
    return response.data;
  },

  getSellerOrders: async (sellerId, params = {}) => {
    const response = await api.get(`/admin/orders/${sellerId}`, { params });
    return response.data;
  },

  getDashboardStats: async (sellerId) => {
    const response = await api.get(`/admin/dashboard/${sellerId}`);
    return response.data;
  },

  // Get comprehensive analytics
  getAnalytics: async (sellerId, params = {}) => {
    const response = await api.get(`/admin/analytics/${sellerId}`, { params });
    return response.data;
  }
};

// Health check
export const healthCheck = async () => {
  const response = await api.get('/health');
  return response.data;
};

// Hosting API calls
export const hostingAPI = {
  getHostingInfo: async () => {
    const response = await api.get('/hosting/info');
    return response.data;
  },

  testConnection: async () => {
    return await hostingDetector.testConnection();
  },

  getDebugInfo: () => {
    return hostingDetector.getDebugInfo();
  },

  updateApiUrl: (newUrl) => {
    hostingDetector.updateApiUrl(newUrl);
    // Update axios instance
    api.defaults.baseURL = hostingDetector.config.apiBaseUrl;
  }
};

export default api;
