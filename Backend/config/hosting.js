import dotenv from 'dotenv';
import { exec } from 'child_process';
import { promisify } from 'util';

dotenv.config();
const execAsync = promisify(exec);

/**
 * Hosting Configuration Manager
 * Automatically detects and configures hosting environment
 * Supports: ngrok (development), Render, Railway, Google Cloud, Heroku
 */

class HostingManager {
  constructor() {
    this.hostingType = this.detectHostingType();
    this.config = this.getHostingConfig();
  }

  /**
   * Detect current hosting environment
   */
  detectHostingType() {
    // Check for production hosting platforms
    if (process.env.RENDER || process.env.RENDER_SERVICE_ID || process.env.RENDER_EXTERNAL_URL) return 'render';
    if (process.env.RAILWAY_ENVIRONMENT) return 'railway';
    if (process.env.GOOGLE_CLOUD_PROJECT) return 'google-cloud';
    if (process.env.HEROKU_APP_NAME) return 'heroku';
    if (process.env.VERCEL) return 'vercel';

    // ngrok detection disabled - keeping for future use
    // if (process.env.USE_NGROK === 'true' || process.env.NGROK_ENABLED === 'true') {
    //   return 'ngrok';
    // }

    // Default to local development
    return 'local';
  }

  /**
   * Get hosting-specific configuration
   */
  getHostingConfig() {
    const baseConfig = {
      port: process.env.PORT || 5000,
      nodeEnv: process.env.NODE_ENV || 'development',
      corsOrigins: this.getCorsOrigins(),
    };

    switch (this.hostingType) {
      case 'ngrok':
        return {
          ...baseConfig,
          type: 'ngrok',
          protocol: 'https',
          domain: process.env.NGROK_DOMAIN || null,
          authToken: process.env.NGROK_AUTH_TOKEN || null,
          region: process.env.NGROK_REGION || 'us',
          subdomain: process.env.NGROK_SUBDOMAIN || null,
          requiresSetup: !process.env.NGROK_DOMAIN,
        };

      case 'render':
        return {
          ...baseConfig,
          type: 'render',
          protocol: 'https',
          domain: process.env.RENDER_EXTERNAL_URL || 'https://coffeehybrid.onrender.com',
          serviceId: process.env.RENDER_SERVICE_ID,
          region: process.env.RENDER_REGION || 'oregon',
        };

      case 'railway':
        return {
          ...baseConfig,
          type: 'railway',
          protocol: 'https',
          domain: process.env.RAILWAY_STATIC_URL || `https://${process.env.RAILWAY_SERVICE_NAME}.up.railway.app`,
          projectId: process.env.RAILWAY_PROJECT_ID,
          serviceId: process.env.RAILWAY_SERVICE_ID,
        };

      case 'google-cloud':
        return {
          ...baseConfig,
          type: 'google-cloud',
          protocol: 'https',
          domain: process.env.GOOGLE_CLOUD_RUN_URL || `https://${process.env.GOOGLE_CLOUD_PROJECT}.appspot.com`,
          projectId: process.env.GOOGLE_CLOUD_PROJECT,
          region: process.env.GOOGLE_CLOUD_REGION || 'us-central1',
        };

      case 'heroku':
        return {
          ...baseConfig,
          type: 'heroku',
          protocol: 'https',
          domain: `https://${process.env.HEROKU_APP_NAME}.herokuapp.com`,
          appName: process.env.HEROKU_APP_NAME,
          dynoType: process.env.DYNO || 'web.1',
        };

      case 'vercel':
        return {
          ...baseConfig,
          type: 'vercel',
          protocol: 'https',
          domain: process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null,
          projectId: process.env.VERCEL_PROJECT_ID,
          region: process.env.VERCEL_REGION,
        };

      default: // local
        return {
          ...baseConfig,
          type: 'local',
          protocol: 'http',
          domain: `http://localhost:${baseConfig.port}`,
        };
    }
  }

  /**
   * Get CORS origins based on hosting type
   */
  getCorsOrigins() {
    const origins = [
      'http://localhost:3000',
      'http://localhost:5173',
      'http://localhost:8080',
      'http://localhost:8081',
      'https://hybridcoffee.netlify.app',  // Your specific Netlify URL
      'https://coffeehybrid.onrender.com'  // Your Render URL
    ];

    if (this.hostingType === 'ngrok' && process.env.NGROK_FRONTEND_URL) {
      origins.push(process.env.NGROK_FRONTEND_URL);
    }

    if (process.env.FRONTEND_URL) {
      origins.push(process.env.FRONTEND_URL);
    }

    if (process.env.CLIENT_URL) {
      origins.push(process.env.CLIENT_URL);
    }

    if (process.env.NETLIFY_URL) {
      origins.push(process.env.NETLIFY_URL);
    }

    // Add common hosting patterns
    origins.push('https://*.netlify.app');
    origins.push('https://*.netlify.com');
    origins.push('https://*.onrender.com');

    return [...new Set(origins)]; // Remove duplicates
  }

  /**
   * Setup ngrok tunnel
   */
  async setupNgrok() {
    if (this.hostingType !== 'ngrok') {
      throw new Error('Not in ngrok mode');
    }

    try {
      console.log('🚀 Setting up ngrok tunnel...');
      
      // Check if ngrok is installed
      try {
        await execAsync('ngrok version');
      } catch (error) {
        throw new Error('ngrok is not installed. Please install it: npm install -g ngrok');
      }

      // Authenticate if token provided
      if (this.config.authToken) {
        console.log('🔐 Authenticating ngrok...');
        await execAsync(`ngrok authtoken ${this.config.authToken}`);
      }

      // Build ngrok command (free plan compatible)
      let ngrokCmd = `ngrok http ${this.config.port}`;

      // Only add subdomain if it's set and not empty (requires paid plan)
      if (this.config.subdomain && this.config.subdomain.trim()) {
        console.log('⚠️  Custom subdomain requires ngrok paid plan. Using random subdomain.');
        // ngrokCmd += ` --subdomain=${this.config.subdomain}`;
      }

      // Region is deprecated in newer ngrok versions
      if (this.config.region && this.config.region.trim()) {
        console.log('ℹ️  Region flag is deprecated. ngrok auto-selects optimal region.');
        // ngrokCmd += ` --region=${this.config.region}`;
      }

      console.log(`🌐 Starting ngrok tunnel: ${ngrokCmd}`);
      
      // Start ngrok in background
      const ngrokProcess = exec(ngrokCmd);
      
      // Wait for ngrok to start and get URL
      await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('ngrok startup timeout'));
        }, 10000);

        ngrokProcess.stdout.on('data', (data) => {
          console.log('ngrok:', data.toString());
          if (data.includes('started tunnel')) {
            clearTimeout(timeout);
            resolve();
          }
        });

        ngrokProcess.stderr.on('data', (data) => {
          console.error('ngrok error:', data.toString());
        });
      });

      // Get ngrok URL from API
      const ngrokUrl = await this.getNgrokUrl();
      if (ngrokUrl) {
        this.config.domain = ngrokUrl;
        console.log(`✅ ngrok tunnel active: ${ngrokUrl}`);
      }

      return ngrokUrl;
    } catch (error) {
      console.error('❌ ngrok setup failed:', error.message);
      throw error;
    }
  }

  /**
   * Get ngrok tunnel URL from local API
   */
  async getNgrokUrl() {
    try {
      const response = await fetch('http://localhost:4040/api/tunnels');
      const data = await response.json();
      
      const httpsTunnel = data.tunnels.find(tunnel => 
        tunnel.proto === 'https' && tunnel.config.addr.includes(this.config.port)
      );
      
      return httpsTunnel ? httpsTunnel.public_url : null;
    } catch (error) {
      console.warn('Could not get ngrok URL from API:', error.message);
      return null;
    }
  }

  /**
   * Get complete server URLs
   */
  getServerUrls() {
    const baseUrl = this.config.domain;
    return {
      base: baseUrl,
      api: `${baseUrl}/api`,
      health: `${baseUrl}/api/health`,
      auth: `${baseUrl}/api/auth`,
      googleAuth: `${baseUrl}/api/auth/google`,
      googleCallback: `${baseUrl}/api/auth/google/callback`,
    };
  }

  /**
   * Get environment info for logging
   */
  getEnvironmentInfo() {
    return {
      hostingType: this.hostingType,
      protocol: this.config.protocol,
      domain: this.config.domain,
      port: this.config.port,
      nodeEnv: this.config.nodeEnv,
      corsOrigins: this.config.corsOrigins,
      urls: this.getServerUrls(),
    };
  }

  /**
   * Update Google OAuth callback URL based on hosting
   */
  getGoogleOAuthConfig() {
    const baseUrl = this.config.domain;
    return {
      callbackURL: `${baseUrl}/api/auth/google/callback`,
      clientURL: process.env.CLIENT_URL || this.config.corsOrigins[0],
    };
  }
}

export default HostingManager;
