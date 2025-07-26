import dotenv from 'dotenv';
import fetch from 'node-fetch';

dotenv.config();

const API_BASE_URL = 'http://localhost:3000/api';

// Test user credentials (you can change these to test with different users)
const TEST_USER_EMAIL = 'testuser@example.com';
const TEST_USER_PASSWORD = 'password123';

async function loginUser(email, password) {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Login failed');
    }
    
    return data.token;
  } catch (error) {
    console.error('Login error:', error.message);
    return null;
  }
}

async function testUserDashboardEndpoint(endpoint, token, timeRange = 'today') {
  try {
    const url = `${API_BASE_URL}/user-dashboard/${endpoint}?timeRange=${timeRange}`;
    console.log(`\n🔍 Testing: ${url}`);
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      console.error(`❌ Error ${response.status}:`, data.message || 'Unknown error');
      return null;
    }
    
    console.log(`✅ Success! Response:`, JSON.stringify(data, null, 2));
    return data;
  } catch (error) {
    console.error(`❌ Request failed:`, error.message);
    return null;
  }
}

async function testUserSpecificFunctionality() {
  console.log('🚀 Testing User-Specific Dashboard Functionality\n');
  
  // Step 1: Login
  console.log('📝 Step 1: Logging in user...');
  const token = await loginUser(TEST_USER_EMAIL, TEST_USER_PASSWORD);
  
  if (!token) {
    console.error('❌ Failed to login. Please check credentials or create a test user.');
    return;
  }
  
  console.log('✅ Login successful! Token received.');
  
  // Step 2: Test user-specific endpoints
  console.log('\n📊 Step 2: Testing user-specific dashboard endpoints...');
  
  const timeRanges = ['today', 'week', 'month', 'year'];
  
  for (const timeRange of timeRanges) {
    console.log(`\n📅 Testing with time range: ${timeRange}`);
    
    // Test overview endpoint
    const overview = await testUserDashboardEndpoint('overview', token, timeRange);
    
    // Test activity chart endpoint
    const activityChart = await testUserDashboardEndpoint('activity-chart', token, timeRange);
    
    // Test user activity endpoint
    const userActivity = await testUserDashboardEndpoint('user-activity', token, timeRange);
    
    if (overview && activityChart && userActivity) {
      console.log(`✅ All endpoints working for time range: ${timeRange}`);
    } else {
      console.log(`❌ Some endpoints failed for time range: ${timeRange}`);
    }
  }
  
  // Step 3: Test notifications endpoint
  console.log('\n📬 Step 3: Testing notifications endpoint...');
  await testNotificationsEndpoint(token);
  
  console.log('\n🎉 User-specific functionality testing completed!');
}

async function testNotificationsEndpoint(token) {
  try {
    const url = `${API_BASE_URL}/notifications`;
    console.log(`\n🔍 Testing: ${url}`);
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      console.error(`❌ Error ${response.status}:`, data.message || 'Unknown error');
      return null;
    }
    
    console.log(`✅ Notifications endpoint working! Found ${data.length} notifications.`);
    if (data.length > 0) {
      console.log('📋 Sample notification:', JSON.stringify(data[0], null, 2));
    }
    
    return data;
  } catch (error) {
    console.error(`❌ Notifications request failed:`, error.message);
    return null;
  }
}

// Run the test
testUserSpecificFunctionality().catch(console.error);
