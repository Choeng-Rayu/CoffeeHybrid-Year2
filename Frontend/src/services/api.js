import axios from 'axios';
import hostingDetector from '../utils/hostingDetector.js';

// Use hosting detector to get the correct API URL
let API_BASE_URL = hostingDetector.config.apiBaseUrl;

// Override for development if needed
if (window.location.hostname === 'localhost' && window.location.port === '8081') {
  API_BASE_URL = 'http://localhost:5000/api';
  console.log('🔧 Using development override for API URL:', API_BASE_URL);
}

console.log('🌐 API Configuration:', {
  environment: hostingDetector.environment,
  apiBaseUrl: API_BASE_URL,
  isProduction: hostingDetector.config.isProduction,
});

// Debug: Log the actual URLs being used
console.log('🔍 Debug API URLs:', {
  apiUrl: hostingDetector.config.apiUrl,
  apiBaseUrl: hostingDetector.config.apiBaseUrl,
  authUrl: hostingDetector.config.authUrl,
  registerUrl: `${API_BASE_URL}/auth/register`,
  loginUrl: `${API_BASE_URL}/auth/login`
});

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token and debug
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // Debug: Log all outgoing requests
  console.log('📤 Outgoing API request:', {
    method: config.method?.toUpperCase(),
    url: config.url,
    baseURL: config.baseURL,
    fullUrl: `${config.baseURL}${config.url}`,
    headers: config.headers,
    data: config.data
  });

  return config;
});

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    console.log('✅ API Response:', {
      status: response.status,
      url: response.config.url,
      data: response.data
    });
    return response;
  },
  (error) => {
    console.error('❌ API Error Details:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      url: error.config?.url,
      method: error.config?.method,
      data: error.response?.data,
      message: error.message
    });

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
    console.log('🔍 Register API call:', {
      baseURL: api.defaults.baseURL,
      url: '/auth/register',
      fullUrl: `${api.defaults.baseURL}/auth/register`,
      userData
    });
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
  },

  // Export data to CSV
  exportOrdersCSV: async (sellerId, params = {}) => {
    const response = await api.get(`/admin/export/orders/${sellerId}`, {
      params,
      responseType: 'blob'
    });
    return response.data;
  },

  exportAnalyticsCSV: async (sellerId, params = {}) => {
    const response = await api.get(`/admin/export/analytics/${sellerId}`, {
      params,
      responseType: 'blob'
    });
    return response.data;
  }
};

// Super Admin API calls
export const superAdminAPI = {
  getDashboard: async () => {
    const response = await api.get('/super-admin/dashboard');
    return response.data;
  },

  getAllSellers: async (params = {}) => {
    const response = await api.get('/super-admin/sellers', { params });
    return response.data;
  },

  createSeller: async (sellerData) => {
    const response = await api.post('/super-admin/sellers', sellerData);
    return response.data;
  },

  getAllOrders: async (params = {}) => {
    const response = await api.get('/super-admin/orders', { params });
    return response.data;
  },

  toggleSellerStatus: async (sellerId, isBlocked) => {
    const response = await api.patch(`/super-admin/sellers/${sellerId}/toggle-status`, {
      isBlocked
    });
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
