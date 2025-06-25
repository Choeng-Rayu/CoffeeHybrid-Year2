#!/usr/bin/env node

/**
 * Hosting Management Script
 * Manages different hosting configurations for CoffeeHybrid
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();
const execAsync = promisify(exec);

class HostingManagerCLI {
  constructor() {
    this.envPath = path.join(process.cwd(), '.env');
  }

  /**
   * Configure ngrok hosting
   */
  async configureNgrok(options = {}) {
    console.log('🔧 Configuring ngrok hosting...');
    
    const config = {
      USE_NGROK: 'true',
      NGROK_ENABLED: 'true',
      ENABLE_HTTPS: 'true',
      NODE_ENV: 'development',
      ...options
    };

    await this.updateEnvFile(config);
    
    console.log('✅ ngrok configuration updated');
    console.log('💡 Run "npm run dev:ngrok" to start with ngrok');
  }

  /**
   * Configure Render.com hosting
   */
  async configureRender(options = {}) {
    console.log('🔧 Configuring Render.com hosting...');
    
    const config = {
      NODE_ENV: 'production',
      USE_NGROK: 'false',
      NGROK_ENABLED: 'false',
      RENDER_SERVICE_NAME: options.serviceName || 'coffeehybrid-api',
      ...options
    };

    await this.updateEnvFile(config);
    
    console.log('✅ Render.com configuration updated');
    console.log('💡 Deploy to Render.com with these settings');
  }

  /**
   * Configure Railway hosting
   */
  async configureRailway(options = {}) {
    console.log('🔧 Configuring Railway hosting...');
    
    const config = {
      NODE_ENV: 'production',
      USE_NGROK: 'false',
      NGROK_ENABLED: 'false',
      RAILWAY_SERVICE_NAME: options.serviceName || 'coffeehybrid-api',
      ...options
    };

    await this.updateEnvFile(config);
    
    console.log('✅ Railway configuration updated');
    console.log('💡 Deploy to Railway with these settings');
  }

  /**
   * Configure Google Cloud hosting
   */
  async configureGoogleCloud(options = {}) {
    console.log('🔧 Configuring Google Cloud hosting...');
    
    const config = {
      NODE_ENV: 'production',
      USE_NGROK: 'false',
      NGROK_ENABLED: 'false',
      GOOGLE_CLOUD_PROJECT: options.projectId || 'coffeehybrid',
      GOOGLE_CLOUD_REGION: options.region || 'us-central1',
      ...options
    };

    await this.updateEnvFile(config);
    
    console.log('✅ Google Cloud configuration updated');
    console.log('💡 Deploy to Google Cloud Run with these settings');
  }

  /**
   * Configure local development
   */
  async configureLocal() {
    console.log('🔧 Configuring local development...');
    
    const config = {
      NODE_ENV: 'development',
      USE_NGROK: 'false',
      NGROK_ENABLED: 'false',
      ENABLE_HTTPS: 'false',
      CLIENT_URL: 'http://localhost:5173'
    };

    await this.updateEnvFile(config);
    
    console.log('✅ Local development configuration updated');
    console.log('💡 Run "npm run dev" to start locally');
  }

  /**
   * Update environment file
   */
  async updateEnvFile(updates) {
    let envContent = '';
    
    try {
      envContent = fs.readFileSync(this.envPath, 'utf8');
    } catch (error) {
      console.log('Creating new .env file');
    }

    // Update or add each configuration
    for (const [key, value] of Object.entries(updates)) {
      const line = `${key}=${value}`;
      const regex = new RegExp(`^${key}=.*`, 'm');
      
      if (envContent.match(regex)) {
        envContent = envContent.replace(regex, line);
      } else {
        envContent += `\n${line}`;
      }
    }

    fs.writeFileSync(this.envPath, envContent);
  }

  /**
   * Show current hosting configuration
   */
  showConfig() {
    console.log('📋 Current Hosting Configuration:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    const config = {
      'Node Environment': process.env.NODE_ENV || 'development',
      'Use ngrok': process.env.USE_NGROK || 'false',
      'Port': process.env.PORT || '5000',
      'Client URL': process.env.CLIENT_URL || 'http://localhost:5173',
      'MongoDB URI': process.env.MONGODB_URI ? '✅ Configured' : '❌ Not set',
      'Google OAuth': process.env.GOOGLE_CLIENT_ID ? '✅ Configured' : '❌ Not set',
    };

    for (const [key, value] of Object.entries(config)) {
      console.log(`${key.padEnd(20)}: ${value}`);
    }
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  }

  /**
   * Install ngrok if not present
   */
  async installNgrok() {
    try {
      await execAsync('ngrok version');
      console.log('✅ ngrok is already installed');
      return true;
    } catch (error) {
      console.log('📦 Installing ngrok...');
      try {
        await execAsync('npm install -g ngrok');
        console.log('✅ ngrok installed successfully');
        return true;
      } catch (installError) {
        console.error('❌ Failed to install ngrok:', installError.message);
        return false;
      }
    }
  }

  /**
   * Generate deployment configurations
   */
  generateDeploymentConfigs() {
    console.log('📝 Generating deployment configurations...');
    
    // Render.com configuration
    const renderConfig = {
      name: 'coffeehybrid-api',
      type: 'web_service',
      env: 'node',
      plan: 'free',
      buildCommand: 'npm install',
      startCommand: 'npm start',
      envVars: [
        { key: 'NODE_ENV', value: 'production' },
        { key: 'MONGODB_URI', value: 'your_mongodb_uri' },
        { key: 'GOOGLE_CLIENT_ID', value: 'your_google_client_id' },
        { key: 'GOOGLE_CLIENT_SECRET', value: 'your_google_client_secret' },
        { key: 'JWT_SECRET', value: 'your_jwt_secret' },
        { key: 'SESSION_SECRET', value: 'your_session_secret' }
      ]
    };

    // Railway configuration
    const railwayConfig = {
      name: 'coffeehybrid-api',
      source: {
        type: 'github',
        repo: 'your-username/CoffeeHybrid',
        branch: 'main'
      },
      variables: {
        NODE_ENV: 'production',
        MONGODB_URI: 'your_mongodb_uri',
        GOOGLE_CLIENT_ID: 'your_google_client_id',
        GOOGLE_CLIENT_SECRET: 'your_google_client_secret',
        JWT_SECRET: 'your_jwt_secret',
        SESSION_SECRET: 'your_session_secret'
      }
    };

    // Save configurations
    fs.writeFileSync('render.json', JSON.stringify(renderConfig, null, 2));
    fs.writeFileSync('railway.json', JSON.stringify(railwayConfig, null, 2));
    
    console.log('✅ Deployment configurations generated:');
    console.log('   - render.json (for Render.com)');
    console.log('   - railway.json (for Railway)');
  }

  /**
   * Show help
   */
  showHelp() {
    console.log(`
🌐 CoffeeHybrid Hosting Manager

Usage: node hosting-manager.js <command> [options]

Commands:
  ngrok              Configure ngrok hosting (development with HTTPS)
  render             Configure Render.com hosting
  railway            Configure Railway hosting
  google-cloud       Configure Google Cloud hosting
  local              Configure local development
  config             Show current configuration
  install-ngrok      Install ngrok globally
  generate-configs   Generate deployment configurations
  help               Show this help message

Examples:
  node hosting-manager.js ngrok
  node hosting-manager.js render --service-name my-coffee-api
  node hosting-manager.js config
  node hosting-manager.js install-ngrok

For ngrok setup:
  1. Get auth token from https://dashboard.ngrok.com/
  2. Set NGROK_AUTH_TOKEN in .env
  3. Run: node hosting-manager.js ngrok
  4. Start server: npm run dev:ngrok
`);
  }
}

// CLI execution
if (import.meta.url === `file://${process.argv[1]}`) {
  const manager = new HostingManagerCLI();
  const command = process.argv[2];
  const options = {};
  
  // Parse command line options
  for (let i = 3; i < process.argv.length; i += 2) {
    const key = process.argv[i]?.replace('--', '');
    const value = process.argv[i + 1];
    if (key && value) {
      options[key] = value;
    }
  }

  switch (command) {
    case 'ngrok':
      manager.configureNgrok(options).catch(console.error);
      break;
    case 'render':
      manager.configureRender(options).catch(console.error);
      break;
    case 'railway':
      manager.configureRailway(options).catch(console.error);
      break;
    case 'google-cloud':
      manager.configureGoogleCloud(options).catch(console.error);
      break;
    case 'local':
      manager.configureLocal().catch(console.error);
      break;
    case 'config':
      manager.showConfig();
      break;
    case 'install-ngrok':
      manager.installNgrok().catch(console.error);
      break;
    case 'generate-configs':
      manager.generateDeploymentConfigs();
      break;
    case 'help':
    default:
      manager.showHelp();
  }
}

export default HostingManagerCLI;
