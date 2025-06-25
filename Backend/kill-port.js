#!/usr/bin/env node

/**
 * Kill process running on port 5000
 * Usage: node kill-port.js
 */

import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

async function killPort5000() {
  try {
    console.log('🔍 Checking for processes on port 5000...');
    
    // Find process using port 5000
    const { stdout } = await execAsync('netstat -ano | findstr :5000');
    
    if (!stdout.trim()) {
      console.log('✅ Port 5000 is free!');
      return;
    }
    
    console.log('📋 Processes found on port 5000:');
    console.log(stdout);
    
    // Extract PID from netstat output
    const lines = stdout.trim().split('\n');
    const pids = new Set();
    
    lines.forEach(line => {
      const parts = line.trim().split(/\s+/);
      if (parts.length >= 5 && parts[1].includes(':5000')) {
        const pid = parts[4];
        if (pid && pid !== '0' && !isNaN(pid)) {
          pids.add(pid);
        }
      }
    });
    
    if (pids.size === 0) {
      console.log('❌ No valid PIDs found');
      return;
    }
    
    // Kill each process
    for (const pid of pids) {
      try {
        console.log(`🔪 Killing process ${pid}...`);
        await execAsync(`taskkill /F /PID ${pid}`);
        console.log(`✅ Process ${pid} terminated`);
      } catch (error) {
        console.log(`❌ Failed to kill process ${pid}:`, error.message);
      }
    }
    
    // Verify port is free
    setTimeout(async () => {
      try {
        const { stdout: checkOutput } = await execAsync('netstat -ano | findstr :5000');
        if (!checkOutput.trim()) {
          console.log('🎉 Port 5000 is now free!');
        } else {
          console.log('⚠️  Some processes may still be running on port 5000');
        }
      } catch (error) {
        console.log('🎉 Port 5000 is now free!');
      }
    }, 1000);
    
  } catch (error) {
    if (error.message.includes('No matching processes')) {
      console.log('✅ Port 5000 is free!');
    } else {
      console.error('❌ Error:', error.message);
    }
  }
}

// Run the function
killPort5000();
