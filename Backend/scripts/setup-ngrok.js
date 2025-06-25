#!/usr/bin/env node

/**
 * ngrok Setup and Management Script
 * Handles ngrok installation, configuration, and tunnel management
 */

import { exec, spawn } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();
const execAsync = promisify(exec);

class NgrokSetup {
  constructor() {
    this.ngrokProcess = null;
    this.tunnelUrl = null;
    this.config = {
      port: process.env.PORT || 5000,
      authToken: process.env.NGROK_AUTH_TOKEN,
      subdomain: process.env.NGROK_SUBDOMAIN,
      region: process.env.NGROK_REGION || 'us',
      configPath: path.join(process.cwd(), 'ngrok.yml'),
    };
  }

  /**
   * Check if ngrok is installed
   */
  async checkNgrokInstallation() {
    try {
      const { stdout } = await execAsync('ngrok version');
      console.log('✅ ngrok is installed:', stdout.trim());
      return true;
    } catch (error) {
      console.log('❌ ngrok is not installed');
      return false;
    }
  }

  /**
   * Install ngrok globally
   */
  async installNgrok() {
    try {
      console.log('📦 Installing ngrok globally...');
      await execAsync('npm install -g ngrok');
      console.log('✅ ngrok installed successfully');
      return true;
    } catch (error) {
      console.error('❌ Failed to install ngrok:', error.message);
      console.log('💡 Please install manually: npm install -g ngrok');
      return false;
    }
  }

  /**
   * Setup ngrok authentication
   */
  async setupAuth() {
    if (!this.config.authToken) {
      console.log('⚠️  No NGROK_AUTH_TOKEN provided. Using free tier (limited features)');
      console.log('💡 Get your auth token from: https://dashboard.ngrok.com/get-started/your-authtoken');
      return false;
    }

    try {
      console.log('🔐 Setting up ngrok authentication...');
      await execAsync(`ngrok authtoken ${this.config.authToken}`);
      console.log('✅ ngrok authentication configured');
      return true;
    } catch (error) {
      console.error('❌ Failed to setup ngrok auth:', error.message);
      return false;
    }
  }

  /**
   * Create ngrok configuration file
   */
  async createNgrokConfig() {
    const config = {
      version: '2',
      authtoken: this.config.authToken || '',
      tunnels: {
        backend: {
          proto: 'http',
          addr: this.config.port,
          subdomain: this.config.subdomain || undefined,
          region: this.config.region,
          inspect: true,
        },
        frontend: {
          proto: 'http',
          addr: process.env.FRONTEND_PORT || 5173,
          subdomain: process.env.NGROK_FRONTEND_SUBDOMAIN || undefined,
          region: this.config.region,
          inspect: false,
        }
      }
    };

    // Remove undefined values
    Object.keys(config.tunnels).forEach(key => {
      Object.keys(config.tunnels[key]).forEach(prop => {
        if (config.tunnels[key][prop] === undefined) {
          delete config.tunnels[key][prop];
        }
      });
    });

    try {
      const yamlContent = this.objectToYaml(config);
      fs.writeFileSync(this.config.configPath, yamlContent);
      console.log('✅ ngrok configuration file created:', this.config.configPath);
      return true;
    } catch (error) {
      console.error('❌ Failed to create ngrok config:', error.message);
      return false;
    }
  }

  /**
   * Convert object to YAML (simple implementation)
   */
  objectToYaml(obj, indent = 0) {
    let yaml = '';
    const spaces = '  '.repeat(indent);
    
    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        yaml += `${spaces}${key}:\n`;
        yaml += this.objectToYaml(value, indent + 1);
      } else {
        yaml += `${spaces}${key}: ${value}\n`;
      }
    }
    
    return yaml;
  }

  /**
   * Start ngrok tunnel
   */
  async startTunnel() {
    try {
      console.log('🚀 Starting ngrok tunnel...');
      
      let command = ['ngrok', 'http', this.config.port.toString()];
      
      if (this.config.subdomain) {
        command.push('--subdomain', this.config.subdomain);
      }
      
      if (this.config.region) {
        command.push('--region', this.config.region);
      }

      // Add log level for better output
      command.push('--log', 'stdout');

      console.log('🔧 Command:', command.join(' '));

      this.ngrokProcess = spawn(command[0], command.slice(1), {
        stdio: ['pipe', 'pipe', 'pipe'],
        detached: false,
      });

      // Handle ngrok output
      this.ngrokProcess.stdout.on('data', (data) => {
        const output = data.toString();
        console.log('ngrok:', output.trim());
        
        // Extract tunnel URL
        const urlMatch = output.match(/https:\/\/[a-zA-Z0-9-]+\.ngrok\.io/);
        if (urlMatch) {
          this.tunnelUrl = urlMatch[0];
          console.log(`🌐 Tunnel URL: ${this.tunnelUrl}`);
          this.updateEnvironmentFile();
        }
      });

      this.ngrokProcess.stderr.on('data', (data) => {
        console.error('ngrok error:', data.toString().trim());
      });

      this.ngrokProcess.on('close', (code) => {
        console.log(`ngrok process exited with code ${code}`);
        this.ngrokProcess = null;
        this.tunnelUrl = null;
      });

      // Wait for tunnel to be established
      await this.waitForTunnel();
      
      return this.tunnelUrl;
    } catch (error) {
      console.error('❌ Failed to start ngrok tunnel:', error.message);
      throw error;
    }
  }

  /**
   * Wait for ngrok tunnel to be established
   */
  async waitForTunnel(maxWait = 30000) {
    const startTime = Date.now();
    
    while (Date.now() - startTime < maxWait) {
      try {
        const response = await fetch('http://localhost:4040/api/tunnels');
        const data = await response.json();
        
        const tunnel = data.tunnels.find(t => 
          t.proto === 'https' && t.config.addr.includes(this.config.port)
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
    
    throw new Error('Timeout waiting for ngrok tunnel');
  }

  /**
   * Update environment file with ngrok URL
   */
  updateEnvironmentFile() {
    if (!this.tunnelUrl) return;

    const envPath = path.join(process.cwd(), '.env');
    let envContent = '';
    
    try {
      envContent = fs.readFileSync(envPath, 'utf8');
    } catch (error) {
      console.log('Creating new .env file');
    }

    // Update or add ngrok URL
    const ngrokUrlLine = `NGROK_URL=${this.tunnelUrl}`;
    const ngrokDomainLine = `NGROK_DOMAIN=${this.tunnelUrl}`;
    
    if (envContent.includes('NGROK_URL=')) {
      envContent = envContent.replace(/NGROK_URL=.*/, ngrokUrlLine);
    } else {
      envContent += `\n${ngrokUrlLine}`;
    }
    
    if (envContent.includes('NGROK_DOMAIN=')) {
      envContent = envContent.replace(/NGROK_DOMAIN=.*/, ngrokDomainLine);
    } else {
      envContent += `\n${ngrokDomainLine}`;
    }

    fs.writeFileSync(envPath, envContent);
    console.log('✅ Environment file updated with ngrok URL');
  }

  /**
   * Stop ngrok tunnel
   */
  stopTunnel() {
    if (this.ngrokProcess) {
      console.log('🛑 Stopping ngrok tunnel...');
      this.ngrokProcess.kill('SIGTERM');
      this.ngrokProcess = null;
      this.tunnelUrl = null;
      console.log('✅ ngrok tunnel stopped');
    }
  }

  /**
   * Get tunnel information
   */
  async getTunnelInfo() {
    try {
      const response = await fetch('http://localhost:4040/api/tunnels');
      const data = await response.json();
      return data.tunnels;
    } catch (error) {
      console.error('Failed to get tunnel info:', error.message);
      return [];
    }
  }

  /**
   * Complete setup process
   */
  async setup() {
    console.log('🔧 Setting up ngrok for CoffeeHybrid...\n');

    // Check installation
    const isInstalled = await this.checkNgrokInstallation();
    if (!isInstalled) {
      const installed = await this.installNgrok();
      if (!installed) {
        throw new Error('Failed to install ngrok');
      }
    }

    // Setup authentication
    await this.setupAuth();

    // Create config file
    await this.createNgrokConfig();

    // Start tunnel
    const tunnelUrl = await this.startTunnel();

    console.log('\n🎉 ngrok setup complete!');
    console.log(`🌐 Backend URL: ${tunnelUrl}`);
    console.log(`🔧 ngrok Dashboard: http://localhost:4040`);
    console.log('\n💡 Your backend is now accessible globally via HTTPS!');
    
    return tunnelUrl;
  }
}

// CLI usage
if (import.meta.url === `file://${process.argv[1]}`) {
  const ngrok = new NgrokSetup();
  
  const command = process.argv[2];
  
  switch (command) {
    case 'setup':
      ngrok.setup().catch(console.error);
      break;
    case 'start':
      ngrok.startTunnel().catch(console.error);
      break;
    case 'stop':
      ngrok.stopTunnel();
      break;
    case 'info':
      ngrok.getTunnelInfo().then(console.log).catch(console.error);
      break;
    default:
      console.log('Usage: node setup-ngrok.js [setup|start|stop|info]');
  }
}

export default NgrokSetup;
