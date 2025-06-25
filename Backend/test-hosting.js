#!/usr/bin/env node

/**
 * Test Hosting Configuration
 * Verifies that hosting setup is working correctly
 */

import HostingManager from './config/hosting.js';
import dotenv from 'dotenv';

dotenv.config();

async function testHostingSetup() {
  console.log('🧪 Testing CoffeeHybrid Hosting Configuration...\n');

  try {
    // Initialize hosting manager
    const hostingManager = new HostingManager();
    
    // Get configuration
    const config = hostingManager.getEnvironmentInfo();
    
    console.log('📋 Hosting Configuration:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`🏷️  Hosting Type: ${config.hostingType.toUpperCase()}`);
    console.log(`🌐 Protocol: ${config.protocol}`);
    console.log(`🔗 Domain: ${config.domain || 'Not set'}`);
    console.log(`📱 Port: ${config.port}`);
    console.log(`🌍 Environment: ${config.nodeEnv}`);
    console.log(`🔄 Is Production: ${config.isProduction}`);
    console.log(`🛠️  Is Development: ${config.isDevelopment}`);
    
    console.log('\n🌐 Server URLs:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    Object.entries(config.urls).forEach(([key, url]) => {
      console.log(`${key.padEnd(15)}: ${url}`);
    });
    
    console.log('\n🔗 CORS Origins:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    config.corsOrigins.forEach((origin, index) => {
      console.log(`${(index + 1).toString().padEnd(15)}: ${origin}`);
    });
    
    // Test ngrok configuration
    if (config.hostingType === 'ngrok') {
      console.log('\n🔧 ngrok Configuration:');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log(`🔑 Auth Token: ${process.env.NGROK_AUTH_TOKEN ? '✅ Configured' : '❌ Missing'}`);
      console.log(`🏷️  Subdomain: ${process.env.NGROK_SUBDOMAIN || 'Not set'}`);
      console.log(`🌍 Region: ${process.env.NGROK_REGION || 'us'}`);
      console.log(`🔧 Dashboard: http://localhost:4040`);
      
      if (hostingManager.config.requiresSetup) {
        console.log('\n⚠️  ngrok tunnel not active. To start:');
        console.log('   1. Run: npm run dev (in one terminal)');
        console.log('   2. Run: ngrok http 5000 --subdomain=coffeehybrid-api (in another terminal)');
      }
    }
    
    // Environment variables check
    console.log('\n🔍 Environment Variables Check:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    const envChecks = [
      { name: 'MONGODB_URI', value: process.env.MONGODB_URI, required: true },
      { name: 'GOOGLE_CLIENT_ID', value: process.env.GOOGLE_CLIENT_ID, required: true },
      { name: 'GOOGLE_CLIENT_SECRET', value: process.env.GOOGLE_CLIENT_SECRET, required: true },
      { name: 'JWT_SECRET', value: process.env.JWT_SECRET, required: true },
      { name: 'SESSION_SECRET', value: process.env.SESSION_SECRET, required: true },
      { name: 'NGROK_AUTH_TOKEN', value: process.env.NGROK_AUTH_TOKEN, required: false },
      { name: 'CLIENT_URL', value: process.env.CLIENT_URL, required: false },
    ];
    
    envChecks.forEach(check => {
      const status = check.value ? '✅' : (check.required ? '❌' : '⚠️');
      const value = check.value ? 
        (check.name.includes('SECRET') || check.name.includes('TOKEN') ? 
          `${check.value.substring(0, 10)}...` : check.value) : 
        'Not set';
      console.log(`${status} ${check.name.padEnd(20)}: ${value}`);
    });
    
    // Google OAuth configuration
    console.log('\n🔐 Google OAuth Configuration:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    const oauthConfig = hostingManager.getGoogleOAuthConfig();
    console.log(`📞 Callback URL: ${oauthConfig.callbackURL}`);
    console.log(`🌐 Client URL: ${oauthConfig.clientURL}`);
    
    // Recommendations
    console.log('\n💡 Recommendations:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    if (config.hostingType === 'local') {
      console.log('🔧 For HTTPS development, consider using ngrok:');
      console.log('   npm run hosting:ngrok && npm run dev:ngrok');
    }
    
    if (config.hostingType === 'ngrok' && !process.env.NGROK_AUTH_TOKEN) {
      console.log('⚠️  Add your ngrok auth token to .env for better features');
    }
    
    if (!process.env.GOOGLE_CLIENT_ID) {
      console.log('🔐 Set up Google OAuth credentials for authentication');
    }
    
    console.log('\n🎉 Hosting configuration test complete!');
    
    // Quick start commands
    console.log('\n🚀 Quick Start Commands:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Local development:     npm run dev');
    console.log('ngrok HTTPS:          npm run dev:ngrok');
    console.log('Configure hosting:    npm run hosting:config');
    console.log('Switch to ngrok:      npm run hosting:ngrok');
    console.log('Switch to local:      npm run hosting:local');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Check if .env file exists and has correct values');
    console.log('2. Verify ngrok installation: ngrok version');
    console.log('3. Check MongoDB connection string');
    console.log('4. Verify Google OAuth credentials');
  }
}

// Run test
testHostingSetup();
