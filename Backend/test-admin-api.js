import axios from 'axios';

const API_BASE = 'http://localhost:5000/api';

async function testAdminAPIs() {
  try {
    console.log('🧪 Testing Admin Dashboard APIs...\n');

    // Test 1: Dashboard Stats
    console.log('1. Testing Dashboard Stats API...');
    try {
      const dashboardResponse = await axios.get(`${API_BASE}/admin/dashboard/2`);
      console.log('✅ Dashboard Stats:', JSON.stringify(dashboardResponse.data, null, 2));
    } catch (error) {
      console.log('❌ Dashboard Stats Error:', error.response?.data || error.message);
    }

    // Test 2: Analytics
    console.log('\n2. Testing Analytics API...');
    try {
      const analyticsResponse = await axios.get(`${API_BASE}/admin/analytics/2?period=all`);
      console.log('✅ Analytics:', JSON.stringify(analyticsResponse.data, null, 2));
    } catch (error) {
      console.log('❌ Analytics Error:', error.response?.data || error.message);
    }

    // Test 3: Seller Orders
    console.log('\n3. Testing Seller Orders API...');
    try {
      const ordersResponse = await axios.get(`${API_BASE}/admin/orders/2`);
      console.log('✅ Seller Orders:', JSON.stringify(ordersResponse.data, null, 2));
    } catch (error) {
      console.log('❌ Seller Orders Error:', error.response?.data || error.message);
    }

    // Test 4: CSV Export (just check if endpoint exists)
    console.log('\n4. Testing CSV Export endpoints...');
    try {
      const exportResponse = await axios.get(`${API_BASE}/admin/export/orders/2`, {
        responseType: 'text'
      });
      console.log('✅ CSV Export Orders: Response received (length:', exportResponse.data.length, 'chars)');
    } catch (error) {
      console.log('❌ CSV Export Orders Error:', error.response?.data || error.message);
    }

    try {
      const exportAnalyticsResponse = await axios.get(`${API_BASE}/admin/export/analytics/2?period=all`, {
        responseType: 'text'
      });
      console.log('✅ CSV Export Analytics: Response received (length:', exportAnalyticsResponse.data.length, 'chars)');
    } catch (error) {
      console.log('❌ CSV Export Analytics Error:', error.response?.data || error.message);
    }

    console.log('\n🎯 Admin API Testing Complete!');
    process.exit(0);

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

testAdminAPIs();
