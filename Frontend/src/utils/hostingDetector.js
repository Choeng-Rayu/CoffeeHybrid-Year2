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
    // Check for Digital Ocean hosting
    if (window.location.hostname.includes('ondigitalocean.app')) return 'digital-ocean';

    // Check for localhost variations
    if (window.location.hostname === 'localhost' ||
        window.location.hostname === '127.0.0.1' ||
        window.location.hostname.startsWith('192.168.')) {
      return 'local';
    }

    // Custom domain - assume Digital Ocean production
    return 'digital-ocean';
  }

  /**
   * Get configuration based on environment
   */
  getConfiguration() {
    const baseConfig = {
      environment: this.environment,
      frontendUrl: window.location.origin,
      isProduction: this.environment === 'digital-ocean',
      isDevelopment: this.environment === 'local',
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
    const envApiUrl = import.meta.env.VITE_API_BASE_URL;
    if (envApiUrl) {
      return envApiUrl.replace('/api', ''); // Remove /api suffix if present
    }

    // Legacy support for VITE_API_URL
    const legacyApiUrl = import.meta.env.VITE_API_URL;
    if (legacyApiUrl) {
      return legacyApiUrl.replace('/api', '');
    }

    // Auto-detect based on hosting environment
    switch (this.environment) {
      case 'digital-ocean':
        // Digital Ocean App Platform - use environment variable or auto-detect
        return import.meta.env.VITE_API_BASE_URL?.replace('/api', '') ||
               this.getDigitalOceanBackendUrl();

      case 'local':
        // Local development
        return 'http://localhost:5000';

      default:
        // Custom domain - assume Digital Ocean production
        return this.getDigitalOceanBackendUrl();
    }
  }

  /**
   * Auto-detect Digital Ocean backend URL
   * Digital Ocean App Platform typically follows predictable naming
   */
  getDigitalOceanBackendUrl() {
    const hostname = window.location.hostname;

    // For Digital Ocean, use the known backend URL
    if (hostname.includes('ondigitalocean.app')) {
      // Use the specific backend URL for your Digital Ocean deployment
      return 'https://hybridcoffee-za9sy.ondigitalocean.app';
    }

    // Fallback to localhost for development
    return 'http://localhost:5000';
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
