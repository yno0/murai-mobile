import fetch from 'node-fetch';

const API_BASE_URL = 'http://localhost:3000/api';

// Test user dashboard endpoints
async function testUserDashboardEndpoints() {
  console.log('Testing User Dashboard Endpoints...\n');

  // Test endpoints without authentication first (should fail)
  console.log('1. Testing without authentication (should fail):');
  
  try {
    const response = await fetch(`${API_BASE_URL}/user-dashboard/overview?timeRange=week`);
    console.log(`   Overview endpoint status: ${response.status}`);
    if (response.status === 401) {
      console.log('   ✓ Correctly requires authentication');
    } else {
      console.log('   ⚠ Expected 401 but got:', response.status);
    }
  } catch (error) {
    console.log('   Error:', error.message);
  }

  // Test admin endpoints (should work without auth for testing)
  console.log('\n2. Testing admin endpoints (fallback):');
  
  try {
    const overviewResponse = await fetch(`${API_BASE_URL}/dashboard/overview?timeRange=week`);
    console.log(`   Admin overview status: ${overviewResponse.status}`);
    if (overviewResponse.ok) {
      const data = await overviewResponse.json();
      console.log('   ✓ Admin overview data:', JSON.stringify(data, null, 2));
    }
  } catch (error) {
    console.log('   Error:', error.message);
  }

  try {
    const chartResponse = await fetch(`${API_BASE_URL}/dashboard/activity-chart?timeRange=week`);
    console.log(`   Admin activity chart status: ${chartResponse.status}`);
    if (chartResponse.ok) {
      const data = await chartResponse.json();
      console.log('   ✓ Admin chart data labels:', data.labels);
    }
  } catch (error) {
    console.log('   Error:', error.message);
  }

  try {
    const insightsResponse = await fetch(`${API_BASE_URL}/dashboard/insights`);
    console.log(`   Admin insights status: ${insightsResponse.status}`);
    if (insightsResponse.ok) {
      const data = await insightsResponse.json();
      console.log('   ✓ Admin insights count:', data.insights?.length || 0);
    }
  } catch (error) {
    console.log('   Error:', error.message);
  }

  console.log('\n✅ Dashboard endpoints test completed!');
  console.log('\nNote: The mobile app will use these admin endpoints as fallback');
  console.log('when user-specific endpoints require authentication.');
}

// Run the test
testUserDashboardEndpoints().catch(console.error);
