/**
 * Frontend Hosting Detection Utility
 * Automatically detects hosting environment and configures API URLs
 */

class HostingDetector {
  constructor() {
    this.environment = this.detectEnvironment();
    this.config = this.getConfiguration();
  }

  /**
   * Detect current hosting environment
   */
  detectEnvironment() {
    // Check for production hosting platforms
    if (window.location.hostname.includes('vercel.app')) return 'vercel';
    if (window.location.hostname.includes('netlify.app')) return 'netlify';
    if (window.location.hostname.includes('onrender.com')) return 'render';
    if (window.location.hostname.includes('railway.app')) return 'railway';
    if (window.location.hostname.includes('herokuapp.com')) return 'heroku';
    if (window.location.hostname.includes('appspot.com')) return 'google-cloud';
    if (window.location.hostname.includes('ngrok.io')) return 'ngrok';
    
    // Check for localhost variations
    if (window.location.hostname === 'localhost' || 
        window.location.hostname === '127.0.0.1' ||
        window.location.hostname.startsWith('192.168.')) {
      return 'local';
    }
    
    // Custom domain
    return 'custom';
  }

  /**
   * Get configuration based on environment
   */
  getConfiguration() {
    const baseConfig = {
      environment: this.environment,
      frontendUrl: window.location.origin,
      isProduction: this.environment !== 'local' && this.environment !== 'ngrok',
      isDevelopment: this.environment === 'local' || this.environment === 'ngrok',
    };

    // Get API URL from environment variables or detect
    const apiUrl = this.getApiUrl();
    
    return {
      ...baseConfig,
      apiUrl,
      apiBaseUrl: `${apiUrl}/api`,
      healthUrl: `${apiUrl}/api/health`,
      authUrl: `${apiUrl}/api/auth`,
      googleAuthUrl: `${apiUrl}/api/auth/google`,
    };
  }

  /**
   * Get API URL based on environment
   */
  getApiUrl() {
    // Check environment variables first
    const envApiUrl = import.meta.env.VITE_API_URL;
    if (envApiUrl) {
      return envApiUrl.replace('/api', ''); // Remove /api suffix if present
    }

    // Auto-detect based on hosting environment
    switch (this.environment) {
      case 'vercel':
        // Vercel typically uses serverless functions
        return window.location.origin;
        
      case 'netlify':
        // Netlify hosting with external API
        return import.meta.env.VITE_API_URL?.replace('/api', '') ||
               'https://coffeehybrid.onrender.com';
        
      case 'render':
        // Render backend service (replace with your actual backend URL)
        return import.meta.env.VITE_RENDER_API_URL || 
               'https://coffeehybrid-api.onrender.com';
        
      case 'railway':
        // Railway backend service
        return import.meta.env.VITE_RAILWAY_API_URL || 
               'https://coffeehybrid-api.up.railway.app';
        
      case 'heroku':
        // Heroku backend app
        return import.meta.env.VITE_HEROKU_API_URL || 
               'https://coffeehybrid-api.herokuapp.com';
        
      case 'google-cloud':
        // Google Cloud Run service
        return import.meta.env.VITE_GOOGLE_CLOUD_API_URL || 
               'https://coffeehybrid-api-hash.a.run.app';
        
      case 'ngrok':
        // ngrok tunnel - disabled, fallback to local
        console.log('ℹ️ ngrok detection disabled, using local development');
        return 'http://localhost:4000';

      case 'local':
        // Local development
        return 'http://localhost:4000';
        
      default:
        // Custom domain - assume API is on same domain with /api path
        return window.location.origin;
    }
  }

  /**
   * Try to detect ngrok backend URL
   */
  detectNgrokBackend() {
    // Check if there's a backend ngrok URL in localStorage
    const storedBackendUrl = localStorage.getItem('ngrok_backend_url');
    if (storedBackendUrl) {
      return storedBackendUrl;
    }

    // Check environment variable
    const ngrokBackendUrl = import.meta.env.VITE_NGROK_BACKEND_URL;
    if (ngrokBackendUrl) {
      return ngrokBackendUrl;
    }

    // Try to guess based on current ngrok URL pattern
    const currentUrl = window.location.origin;
    if (currentUrl.includes('ngrok.io')) {
      // Replace frontend subdomain with backend subdomain
      const backendUrl = currentUrl.replace(/https:\/\/[^.]+/, 'https://api');
      return backendUrl;
    }

    return null;
  }

  /**
   * Test API connection
   */
  async testConnection() {
    try {
      const response = await fetch(this.config.healthUrl);
      const data = await response.json();
      
      return {
        success: true,
        status: response.status,
        data,
        url: this.config.healthUrl,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        url: this.config.healthUrl,
      };
    }
  }

  /**
   * Get hosting information for debugging
   */
  getDebugInfo() {
    return {
      environment: this.environment,
      config: this.config,
      userAgent: navigator.userAgent,
      location: {
        hostname: window.location.hostname,
        origin: window.location.origin,
        href: window.location.href,
      },
      environmentVariables: {
        VITE_API_URL: import.meta.env.VITE_API_URL,
        VITE_NODE_ENV: import.meta.env.VITE_NODE_ENV,
        VITE_GOOGLE_CLIENT_ID: import.meta.env.VITE_GOOGLE_CLIENT_ID,
        MODE: import.meta.env.MODE,
        DEV: import.meta.env.DEV,
        PROD: import.meta.env.PROD,
      },
    };
  }

  /**
   * Update API URL (useful for ngrok when backend URL changes)
   */
  updateApiUrl(newApiUrl) {
    this.config.apiUrl = newApiUrl;
    this.config.apiBaseUrl = `${newApiUrl}/api`;
    this.config.healthUrl = `${newApiUrl}/api/health`;
    this.config.authUrl = `${newApiUrl}/api/auth`;
    this.config.googleAuthUrl = `${newApiUrl}/api/auth/google`;
    
    // Store for future use
    localStorage.setItem('ngrok_backend_url', newApiUrl);
  }

  /**
   * Get CORS-safe headers for requests
   */
  getRequestHeaders() {
    const headers = {
      'Content-Type': 'application/json',
    };

    // Add auth token if available
    const token = localStorage.getItem('token');
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    return headers;
  }

  /**
   * Create configured axios instance
   */
  createApiClient() {
    // This would require axios to be imported
    // Return configuration object instead
    return {
      baseURL: this.config.apiBaseUrl,
      headers: this.getRequestHeaders(),
      withCredentials: true,
    };
  }
}

// Create singleton instance
const hostingDetector = new HostingDetector();

// Export for use in components
export default hostingDetector;

// Export class for testing
export { HostingDetector };

// Helper functions for common use cases
export const getApiUrl = () => hostingDetector.config.apiUrl;
export const getApiBaseUrl = () => hostingDetector.config.apiBaseUrl;
export const isProduction = () => hostingDetector.config.isProduction;
export const isDevelopment = () => hostingDetector.config.isDevelopment;
export const getEnvironment = () => hostingDetector.environment;

// Debug helper
export const debugHosting = () => {
  console.log('🌐 Hosting Debug Info:', hostingDetector.getDebugInfo());
  return hostingDetector.getDebugInfo();
};
