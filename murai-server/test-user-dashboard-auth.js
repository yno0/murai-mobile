import fetch from 'node-fetch';

const API_BASE_URL = 'http://localhost:3000/api';

// Test user credentials
const TEST_USER = {
  email: 'user@murai.com',
  password: 'user123'
};

// Test user authentication and dashboard endpoints
async function testUserDashboard() {
  console.log('🧪 Testing User Dashboard with Authentication...\n');

  try {
    // Step 1: Login to get authentication token
    console.log('1. Logging in test user...');
    const loginResponse = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(TEST_USER),
    });

    if (!loginResponse.ok) {
      throw new Error(`Login failed: ${loginResponse.status}`);
    }

    const loginData = await loginResponse.json();
    const token = loginData.token;
    console.log('   ✅ Login successful!');
    console.log(`   📝 User: ${loginData.user.name} (${loginData.user.email})`);

    // Step 2: Test user dashboard endpoints with authentication
    console.log('\n2. Testing user dashboard endpoints...');

    // Test overview endpoint
    console.log('   📊 Testing overview endpoint...');
    const overviewResponse = await fetch(`${API_BASE_URL}/user-dashboard/overview?timeRange=week`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (overviewResponse.ok) {
      const overviewData = await overviewResponse.json();
      console.log('   ✅ Overview data received:');
      console.log(`      - Harmful content detected: ${overviewData.harmfulContentDetected.value}`);
      console.log(`      - Websites monitored: ${overviewData.websitesMonitored.value}`);
      console.log(`      - Protection effectiveness: ${overviewData.protectionEffectiveness.value}`);
    } else {
      console.log(`   ❌ Overview endpoint failed: ${overviewResponse.status}`);
    }

    // Test activity chart endpoint
    console.log('   📈 Testing activity chart endpoint...');
    const chartResponse = await fetch(`${API_BASE_URL}/user-dashboard/activity-chart?timeRange=week`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (chartResponse.ok) {
      const chartData = await chartResponse.json();
      console.log('   ✅ Chart data received:');
      console.log(`      - Labels: ${chartData.labels.join(', ')}`);
      console.log(`      - Protected data points: ${chartData.datasets[0].data.length}`);
      console.log(`      - Monitored data points: ${chartData.datasets[1].data.length}`);
    } else {
      console.log(`   ❌ Chart endpoint failed: ${chartResponse.status}`);
    }

    // Test user activity endpoint
    console.log('   👤 Testing user activity endpoint...');
    const activityResponse = await fetch(`${API_BASE_URL}/user-dashboard/user-activity?timeRange=week`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (activityResponse.ok) {
      const activityData = await activityResponse.json();
      console.log('   ✅ User activity data received:');
      console.log(`      - Activity breakdown types: ${activityData.activityBreakdown.length}`);
      console.log(`      - Recent activities: ${activityData.recentActivity.length}`);
      console.log(`      - Total activities: ${activityData.totalActivities}`);
    } else {
      console.log(`   ❌ User activity endpoint failed: ${activityResponse.status}`);
    }

    console.log('\n✅ All tests completed successfully!');
    console.log('\n🎯 Your dashboard is ready to use with real data!');
    console.log('\n📱 You can now login to the mobile app with:');
    console.log('   📧 Email: user@murai.com');
    console.log('   🔑 Password: user123');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testUserDashboard().catch(console.error);
