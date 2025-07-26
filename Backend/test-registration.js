import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const API_BASE_URL = 'http://localhost:5000/api';

console.log('🧪 Testing Registration and Login\n');

// Test data
const testUser = {
  username: 'testuser123',
  email: 'test@example.com',
  password: 'password123'
};

const testUserComplex = {
  username: 'testuser456',
  email: 'test2@example.com',
  password: 'Password123!'
};

// Test registration with simple password
async function testRegistration() {
  console.log('1️⃣ Testing Registration with Simple Password...');
  try {
    const response = await axios.post(`${API_BASE_URL}/auth/register`, testUser);
    console.log('   ✅ Registration successful:', response.data);
    return true;
  } catch (error) {
    console.log('   ❌ Registration failed:');
    if (error.response) {
      console.log('      Status:', error.response.status);
      console.log('      Data:', error.response.data);
    } else {
      console.log('      Error:', error.message);
    }
    return false;
  }
}

// Test registration with complex password
async function testRegistrationComplex() {
  console.log('\n2️⃣ Testing Registration with Complex Password...');
  try {
    const response = await axios.post(`${API_BASE_URL}/auth/register`, testUserComplex);
    console.log('   ✅ Registration successful:', response.data);
    return true;
  } catch (error) {
    console.log('   ❌ Registration failed:');
    if (error.response) {
      console.log('      Status:', error.response.status);
      console.log('      Data:', error.response.data);
    } else {
      console.log('      Error:', error.message);
    }
    return false;
  }
}

// Test login
async function testLogin(userData) {
  console.log('\n3️⃣ Testing Login...');
  try {
    const loginData = {
      emailOrUsername: userData.email,
      password: userData.password
    };
    const response = await axios.post(`${API_BASE_URL}/auth/login`, loginData);
    console.log('   ✅ Login successful:', response.data);
    return response.data.token;
  } catch (error) {
    console.log('   ❌ Login failed:');
    if (error.response) {
      console.log('      Status:', error.response.status);
      console.log('      Data:', error.response.data);
    } else {
      console.log('      Error:', error.message);
    }
    return null;
  }
}

// Test API health
async function testHealth() {
  console.log('🏥 Testing API Health...');
  try {
    const response = await axios.get(`${API_BASE_URL}/health`);
    console.log('   ✅ API is healthy:', response.data.status);
    return true;
  } catch (error) {
    console.log('   ❌ API health check failed:', error.message);
    return false;
  }
}

// Test validation errors
async function testValidationErrors() {
  console.log('\n4️⃣ Testing Validation Errors...');
  
  // Test missing fields
  try {
    await axios.post(`${API_BASE_URL}/auth/register`, {});
    console.log('   ❌ Should have failed with missing fields');
  } catch (error) {
    if (error.response && error.response.status === 400) {
      console.log('   ✅ Correctly rejected empty registration');
      console.log('      Validation errors:', error.response.data.errors);
    } else {
      console.log('   ❌ Unexpected error:', error.response?.data || error.message);
    }
  }
  
  // Test short password
  try {
    await axios.post(`${API_BASE_URL}/auth/register`, {
      username: 'test',
      email: 'test@test.com',
      password: '123'
    });
    console.log('   ❌ Should have failed with short password');
  } catch (error) {
    if (error.response && error.response.status === 400) {
      console.log('   ✅ Correctly rejected short password');
    } else {
      console.log('   ❌ Unexpected error:', error.response?.data || error.message);
    }
  }
}

// Run all tests
async function runTests() {
  console.log('🚀 Starting Registration and Login Tests\n');
  
  // Check if API is running
  const isHealthy = await testHealth();
  if (!isHealthy) {
    console.log('\n❌ API is not running. Please start the backend server first.');
    return;
  }
  
  // Test validation
  await testValidationErrors();
  
  // Test registration
  const simpleSuccess = await testRegistration();
  const complexSuccess = await testRegistrationComplex();
  
  // Test login with successful registration
  if (simpleSuccess) {
    await testLogin(testUser);
  } else if (complexSuccess) {
    await testLogin(testUserComplex);
  }
  
  console.log('\n📊 Test Summary:');
  console.log(`   API Health: ${isHealthy ? '✅' : '❌'}`);
  console.log(`   Simple Password Registration: ${simpleSuccess ? '✅' : '❌'}`);
  console.log(`   Complex Password Registration: ${complexSuccess ? '✅' : '❌'}`);
  
  if (!simpleSuccess && !complexSuccess) {
    console.log('\n🔧 Troubleshooting Tips:');
    console.log('   1. Make sure the backend server is running on port 5000');
    console.log('   2. Check if the database is connected');
    console.log('   3. Verify the validation middleware is working correctly');
    console.log('   4. Check backend logs for detailed error messages');
  }
}

runTests().catch(console.error);
