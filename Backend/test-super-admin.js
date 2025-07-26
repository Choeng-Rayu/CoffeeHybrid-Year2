import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const API_BASE_URL = 'http://localhost:5000/api';

console.log('🧪 Testing Super Admin Functionality\n');

// Test data
const adminCredentials = {
  emailOrUsername: 'admin@example.com', // You'll need to create an admin user first
  password: 'admin123'
};

const testSellerData = {
  username: 'testseller123',
  email: 'testseller@example.com',
  password: 'password123',
  shopName: 'Test Coffee Shop',
  firstName: 'Test',
  lastName: 'Seller'
};

let authToken = '';

// Test admin login
async function testAdminLogin() {
  console.log('1️⃣ Testing Admin Login...');
  try {
    const response = await axios.post(`${API_BASE_URL}/auth/login`, adminCredentials);
    if (response.data.token) {
      authToken = response.data.token;
      console.log('   ✅ Admin login successful');
      console.log('   📝 Token received:', authToken.substring(0, 20) + '...');
      return true;
    } else {
      console.log('   ❌ No token received');
      return false;
    }
  } catch (error) {
    console.log('   ❌ Admin login failed:', error.response?.data?.error || error.message);
    return false;
  }
}

// Test super admin dashboard
async function testSuperAdminDashboard() {
  console.log('\n2️⃣ Testing Super Admin Dashboard...');
  try {
    const response = await axios.get(`${API_BASE_URL}/super-admin/dashboard`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log('   ✅ Dashboard data retrieved successfully');
    console.log('   📊 Overview:', response.data.dashboard.overview);
    return true;
  } catch (error) {
    console.log('   ❌ Dashboard failed:', error.response?.data?.message || error.message);
    return false;
  }
}

// Test create seller
async function testCreateSeller() {
  console.log('\n3️⃣ Testing Create Seller...');
  try {
    const response = await axios.post(`${API_BASE_URL}/super-admin/sellers`, testSellerData, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log('   ✅ Seller created successfully');
    console.log('   👤 Seller:', response.data.seller);
    return response.data.seller.id;
  } catch (error) {
    console.log('   ❌ Create seller failed:', error.response?.data?.error || error.message);
    if (error.response?.data?.errors) {
      console.log('   📝 Validation errors:', error.response.data.errors);
    }
    return null;
  }
}

// Test get all sellers
async function testGetAllSellers() {
  console.log('\n4️⃣ Testing Get All Sellers...');
  try {
    const response = await axios.get(`${API_BASE_URL}/super-admin/sellers`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log('   ✅ Sellers retrieved successfully');
    console.log('   📊 Total sellers:', response.data.pagination.total);
    return true;
  } catch (error) {
    console.log('   ❌ Get sellers failed:', error.response?.data?.message || error.message);
    return false;
  }
}

// Test get all orders
async function testGetAllOrders() {
  console.log('\n5️⃣ Testing Get All Orders...');
  try {
    const response = await axios.get(`${API_BASE_URL}/super-admin/orders`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log('   ✅ Orders retrieved successfully');
    console.log('   📊 Total orders:', response.data.pagination.total);
    return true;
  } catch (error) {
    console.log('   ❌ Get orders failed:', error.response?.data?.message || error.message);
    return false;
  }
}

// Test toggle seller status
async function testToggleSellerStatus(sellerId) {
  if (!sellerId) {
    console.log('\n6️⃣ Skipping Toggle Seller Status (no seller ID)');
    return false;
  }
  
  console.log('\n6️⃣ Testing Toggle Seller Status...');
  try {
    const response = await axios.patch(
      `${API_BASE_URL}/super-admin/sellers/${sellerId}/toggle-status`,
      { isBlocked: true },
      { headers: { Authorization: `Bearer ${authToken}` } }
    );
    console.log('   ✅ Seller status toggled successfully');
    console.log('   📝 Result:', response.data.message);
    return true;
  } catch (error) {
    console.log('   ❌ Toggle status failed:', error.response?.data?.message || error.message);
    return false;
  }
}

// Run all tests
async function runTests() {
  console.log('🚀 Starting Super Admin Tests\n');
  
  const loginSuccess = await testAdminLogin();
  if (!loginSuccess) {
    console.log('\n❌ Cannot proceed without admin authentication');
    console.log('\n💡 To fix this:');
    console.log('   1. Make sure you have an admin user in your database');
    console.log('   2. Update the adminCredentials in this test file');
    console.log('   3. Make sure the backend server is running');
    return;
  }
  
  const dashboardSuccess = await testSuperAdminDashboard();
  const sellerId = await testCreateSeller();
  const sellersSuccess = await testGetAllSellers();
  const ordersSuccess = await testGetAllOrders();
  const toggleSuccess = await testToggleSellerStatus(sellerId);
  
  console.log('\n📊 Test Summary:');
  console.log(`   Admin Login: ${loginSuccess ? '✅' : '❌'}`);
  console.log(`   Dashboard: ${dashboardSuccess ? '✅' : '❌'}`);
  console.log(`   Create Seller: ${sellerId ? '✅' : '❌'}`);
  console.log(`   Get Sellers: ${sellersSuccess ? '✅' : '❌'}`);
  console.log(`   Get Orders: ${ordersSuccess ? '✅' : '❌'}`);
  console.log(`   Toggle Status: ${toggleSuccess ? '✅' : '❌'}`);
  
  if (loginSuccess && dashboardSuccess && sellersSuccess && ordersSuccess) {
    console.log('\n🎉 Super Admin functionality is working correctly!');
    console.log('\n📝 Next steps:');
    console.log('   1. Access the Super Admin Dashboard at: http://localhost:8081/super-admin');
    console.log('   2. Make sure you\'re logged in as an admin user');
    console.log('   3. Test the frontend interface');
  } else {
    console.log('\n🔧 Some tests failed. Check the errors above and fix the issues.');
  }
}

runTests().catch(console.error);
