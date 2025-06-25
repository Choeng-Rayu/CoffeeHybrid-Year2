#!/usr/bin/env node

/**
 * Quick ngrok Setup Script for CoffeeHybrid
 * Sets up ngrok with your authentication token
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';

const execAsync = promisify(exec);

async function setupNgrok() {
  console.log('🔧 Setting up ngrok for CoffeeHybrid...\n');

  try {
    // Step 1: Check if ngrok is installed
    console.log('1️⃣ Checking ngrok installation...');
    try {
      const { stdout } = await execAsync('ngrok version');
      console.log('✅ ngrok is installed:', stdout.trim());
    } catch (error) {
      console.log('❌ ngrok not found. Installing...');
      await execAsync('npm install -g ngrok');
      console.log('✅ ngrok installed successfully');
    }

    // Step 2: Set up authentication
    console.log('\n2️⃣ Setting up ngrok authentication...');
    const authToken = '2v6m2l4cA9cQyJF9C43Ej2xlz2p_jD6LUj6xoaFJY1E3ES9g';
    
    try {
      await execAsync(`ngrok authtoken ${authToken}`);
      console.log('✅ ngrok authentication configured successfully');
    } catch (error) {
      console.log('⚠️ Authentication setup failed:', error.message);
    }

    // Step 3: Update environment file
    console.log('\n3️⃣ Updating environment configuration...');
    const envPath = path.join(process.cwd(), '.env');
    let envContent = fs.readFileSync(envPath, 'utf8');

    // Enable ngrok
    envContent = envContent.replace(/USE_NGROK=false/, 'USE_NGROK=true');
    envContent = envContent.replace(/NGROK_ENABLED=false/, 'NGROK_ENABLED=true');
    envContent = envContent.replace(/ENABLE_HTTPS=false/, 'ENABLE_HTTPS=true');

    fs.writeFileSync(envPath, envContent);
    console.log('✅ Environment configured for ngrok');

    // Step 4: Show next steps
    console.log('\n🎉 ngrok Setup Complete!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📋 Next Steps:');
    console.log('   1. Start your backend server: npm run dev');
    console.log('   2. In another terminal, start ngrok: ngrok http 5000');
    console.log('   3. Copy the HTTPS URL from ngrok');
    console.log('   4. Update your Google OAuth settings with the new URL');
    console.log('');
    console.log('🌐 Your API will be accessible globally via HTTPS!');
    console.log('🔧 ngrok Dashboard: http://localhost:4040');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    console.log('\n💡 Manual Setup Instructions:');
    console.log('1. Install ngrok: npm install -g ngrok');
    console.log('2. Authenticate: ngrok authtoken 2v6m2l4cA9cQyJF9C43Ej2xlz2p_jD6LUj6xoaFJY1E3ES9g');
    console.log('3. Start server: npm run dev');
    console.log('4. Start ngrok: ngrok http 5000');
  }
}

setupNgrok();
