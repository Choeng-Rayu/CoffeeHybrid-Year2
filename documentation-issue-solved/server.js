#!/usr/bin/env node

/**
 * Root Server File for Render.com Deployment
 * This file redirects to the actual server in Backend/server.js
 */

import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 Starting CoffeeHybrid Server...');
console.log('📁 Root directory:', __dirname);
console.log('🔄 Redirecting to Backend/server.js');

// Change to Backend directory and start the server
const backendPath = path.join(__dirname, 'Backend');
const serverPath = path.join(backendPath, 'server.js');

console.log('📂 Backend path:', backendPath);
console.log('🖥️  Server path:', serverPath);

// Check if Backend directory exists
import fs from 'fs';
if (!fs.existsSync(backendPath)) {
  console.error('❌ Backend directory not found:', backendPath);
  process.exit(1);
}

if (!fs.existsSync(serverPath)) {
  console.error('❌ Server file not found:', serverPath);
  process.exit(1);
}

console.log('✅ Backend directory found');
console.log('✅ Server file found');
console.log('🚀 Starting backend server...');

// Start the backend server
const serverProcess = spawn('node', ['server.js'], {
  cwd: backendPath,
  stdio: 'inherit',
  env: {
    ...process.env,
    NODE_ENV: process.env.NODE_ENV || 'production'
  }
});

// Handle process events
serverProcess.on('error', (error) => {
  console.error('❌ Failed to start server:', error);
  process.exit(1);
});

serverProcess.on('close', (code) => {
  console.log(`🛑 Server process exited with code ${code}`);
  process.exit(code);
});

// Handle termination signals
process.on('SIGTERM', () => {
  console.log('🛑 Received SIGTERM, shutting down gracefully');
  serverProcess.kill('SIGTERM');
});

process.on('SIGINT', () => {
  console.log('🛑 Received SIGINT, shutting down gracefully');
  serverProcess.kill('SIGINT');
});

console.log('✅ Root server started, backend server should be running...');
