#!/usr/bin/env node

/**
 * Quick setup script to copy your actual credentials to working .env files
 * Run this after cloning the repository to set up your local environment
 */

import fs from 'fs';
import path from 'path';

const setupCredentials = () => {
  console.log('🔧 Setting up local environment credentials...\n');

  try {
    // Copy backend credentials
    if (fs.existsSync('Backend/.env.local')) {
      fs.copyFileSync('Backend/.env.local', 'Backend/.env');
      console.log('✅ Backend credentials copied from .env.local to .env');
    } else {
      console.log('⚠️  Backend/.env.local not found. Using template.');
      if (fs.existsSync('Backend/.env.example')) {
        fs.copyFileSync('Backend/.env.example', 'Backend/.env');
        console.log('📋 Backend/.env created from template. Please add your credentials.');
      }
    }

    // Copy frontend credentials
    if (fs.existsSync('.env.local')) {
      fs.copyFileSync('.env.local', '.env');
      console.log('✅ Frontend credentials copied from .env.local to .env');
    } else {
      console.log('⚠️  .env.local not found. Using template.');
      if (fs.existsSync('.env.example')) {
        fs.copyFileSync('.env.example', '.env');
        console.log('📋 .env created from template. Please add your credentials.');
      }
    }

    console.log('\n🎉 Environment setup complete!');
    console.log('\n📋 Next steps:');
    console.log('1. If using templates, edit Backend/.env and .env with your actual credentials');
    console.log('2. Start backend: cd Backend && npm run restart');
    console.log('3. Start frontend: npm run dev');
    console.log('4. Test Google OAuth at http://localhost:5173/login');

  } catch (error) {
    console.error('❌ Error setting up credentials:', error.message);
    console.log('\n🔧 Manual setup:');
    console.log('1. Copy Backend/.env.example to Backend/.env');
    console.log('2. Copy .env.example to .env');
    console.log('3. Add your actual credentials to both files');
  }
};

setupCredentials();
