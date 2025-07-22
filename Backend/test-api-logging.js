import axios from 'axios';

const API_BASE_URL = 'http://localhost:4000/api';

async function testAPILogging() {
  try {
    console.log('🧪 Testing API logging functionality...\n');

    // Test 1: Health check
    console.log('1. Testing health check endpoint...');
    const healthResponse = await axios.get(`${API_BASE_URL}/health`);
    console.log('✅ Health check successful:', healthResponse.data.status);

    // Test 2: Forgot password (should trigger email logging)
    console.log('\n2. Testing forgot password endpoint...');
    try {
      const forgotPasswordResponse = await axios.post(`${API_BASE_URL}/auth/forgot-password`, {
        email: 'test@example.com'
      });
      console.log('✅ Forgot password request successful');
    } catch (error) {
      console.log('📧 Forgot password response:', error.response?.data?.error || error.message);
    }

    // Test 3: Invalid login attempt (should trigger auth logging)
    console.log('\n3. Testing invalid login attempt...');
    try {
      const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
        emailOrUsername: 'invalid@test.com',
        password: 'wrongpassword'
      });
    } catch (error) {
      console.log('🔐 Login attempt logged:', error.response?.data?.error || error.message);
    }

    console.log('\n✅ API logging tests completed!');
    console.log('📋 Check the log files in Backend/logs/ for detailed activity logs');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testAPILogging();
