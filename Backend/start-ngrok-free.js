#!/usr/bin/env node

/**
 * Start ngrok with Free Plan
 * Compatible with ngrok free tier (no custom subdomains)
 */

import { exec, spawn } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';

const execAsync = promisify(exec);

class NgrokFreePlan {
  constructor() {
    this.ngrokProcess = null;
    this.tunnelUrl = null;
    this.port = process.env.PORT || 5000;
  }

  async startNgrok() {
    console.log('🚀 Starting ngrok (Free Plan Compatible)...\n');

    try {
      // Step 1: Check ngrok installation
      console.log('1️⃣ Checking ngrok installation...');
      try {
        const { stdout } = await execAsync('ngrok version');
        console.log('✅ ngrok installed:', stdout.trim());
      } catch (error) {
        throw new Error('ngrok not installed. Run: npm install -g ngrok');
      }

      // Step 2: Authenticate (if token provided)
      const authToken = process.env.NGROK_AUTH_TOKEN;
      if (authToken) {
        console.log('2️⃣ Authenticating ngrok...');
        try {
          await execAsync(`ngrok authtoken ${authToken}`);
          console.log('✅ Authentication successful');
        } catch (error) {
          console.log('⚠️  Authentication failed, continuing with free features');
        }
      } else {
        console.log('2️⃣ No auth token provided, using free tier');
      }

      // Step 3: Start tunnel (free plan compatible)
      console.log('3️⃣ Starting ngrok tunnel...');
      console.log(`🌐 Creating HTTPS tunnel for localhost:${this.port}`);
      
      // Simple command without paid features
      const ngrokCmd = ['ngrok', 'http', this.port.toString()];
      
      console.log(`🔧 Command: ${ngrokCmd.join(' ')}`);

      // Start ngrok process
      this.ngrokProcess = spawn(ngrokCmd[0], ngrokCmd.slice(1), {
        stdio: ['pipe', 'pipe', 'pipe'],
        detached: false,
      });

      // Handle output
      this.ngrokProcess.stdout.on('data', (data) => {
        const output = data.toString();
        console.log('ngrok:', output.trim());
        
        // Extract tunnel URL
        const urlMatch = output.match(/https:\/\/[a-zA-Z0-9-]+\.ngrok-free\.app/);
        if (urlMatch) {
          this.tunnelUrl = urlMatch[0];
          console.log(`\n🎉 Tunnel URL: ${this.tunnelUrl}`);
          this.updateEnvironment();
          this.showSuccessInfo();
        }
      });

      this.ngrokProcess.stderr.on('data', (data) => {
        const error = data.toString();
        if (!error.includes('WARN') && !error.includes('INFO')) {
          console.error('ngrok error:', error.trim());
        }
      });

      this.ngrokProcess.on('close', (code) => {
        console.log(`\nngrok process exited with code ${code}`);
        this.ngrokProcess = null;
        this.tunnelUrl = null;
      });

      // Wait for tunnel to be established
      await this.waitForTunnel();
      
      return this.tunnelUrl;

    } catch (error) {
      console.error('❌ Failed to start ngrok:', error.message);
      console.log('\n💡 Troubleshooting:');
      console.log('1. Install ngrok: npm install -g ngrok');
      console.log('2. Check if port 5000 is available');
      console.log('3. Try manual start: ngrok http 5000');
      throw error;
    }
  }

  async waitForTunnel(maxWait = 30000) {
    console.log('⏳ Waiting for tunnel to be established...');
    const startTime = Date.now();
    
    while (Date.now() - startTime < maxWait) {
      try {
        const response = await fetch('http://localhost:4040/api/tunnels');
        const data = await response.json();
        
        const tunnel = data.tunnels.find(t => 
          t.proto === 'https' && t.config.addr.includes(this.port)
        );
        
        if (tunnel) {
          this.tunnelUrl = tunnel.public_url;
          console.log(`✅ Tunnel established: ${this.tunnelUrl}`);
          return this.tunnelUrl;
        }
      } catch (error) {
        // ngrok API not ready yet, continue waiting
      }
      
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    console.log('⚠️  Tunnel URL not detected via API, but ngrok may still be working');
    return null;
  }

  updateEnvironment() {
    if (!this.tunnelUrl) return;

    try {
      const envPath = path.join(process.cwd(), '.env');
      let envContent = fs.readFileSync(envPath, 'utf8');

      // Update ngrok domain
      if (envContent.includes('NGROK_DOMAIN=')) {
        envContent = envContent.replace(/NGROK_DOMAIN=.*/, `NGROK_DOMAIN=${this.tunnelUrl}`);
      } else {
        envContent += `\nNGROK_DOMAIN=${this.tunnelUrl}`;
      }

      fs.writeFileSync(envPath, envContent);
      console.log('✅ Environment updated with ngrok URL');
    } catch (error) {
      console.log('⚠️  Could not update environment file:', error.message);
    }
  }

  showSuccessInfo() {
    if (!this.tunnelUrl) return;

    console.log('\n🎉 ngrok Setup Complete!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`🌐 Your API is now globally accessible!`);
    console.log(`📍 HTTPS URL: ${this.tunnelUrl}`);
    console.log(`❤️  Health Check: ${this.tunnelUrl}/api/health`);
    console.log(`🔐 Google OAuth: ${this.tunnelUrl}/api/auth/google`);
    console.log(`📋 Menu API: ${this.tunnelUrl}/api/menu`);
    console.log(`🔧 ngrok Dashboard: http://localhost:4040`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n💡 Next Steps:');
    console.log('1. Test the health check URL above');
    console.log('2. Update Google OAuth settings with the new URL');
    console.log('3. Share your global API with team members!');
    console.log('\n⚠️  Note: Free plan URLs change each restart');
    console.log('💰 Upgrade to paid plan for consistent subdomains');
  }

  stop() {
    if (this.ngrokProcess) {
      console.log('🛑 Stopping ngrok tunnel...');
      this.ngrokProcess.kill('SIGTERM');
      this.ngrokProcess = null;
      this.tunnelUrl = null;
      console.log('✅ ngrok tunnel stopped');
    }
  }
}

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down ngrok...');
  if (global.ngrokInstance) {
    global.ngrokInstance.stop();
  }
  process.exit(0);
});

// CLI usage
if (import.meta.url === `file://${process.argv[1]}`) {
  const ngrok = new NgrokFreePlan();
  global.ngrokInstance = ngrok;
  
  ngrok.startNgrok().catch(error => {
    console.error('Failed to start ngrok:', error.message);
    process.exit(1);
  });
}

export default NgrokFreePlan;
