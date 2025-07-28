// Test script for threat distribution endpoint
const axios = require('axios');

async function testThreatDistribution() {
  try {
    // Test the new threat distribution endpoint
    const response = await axios.get('http://localhost:3000/api/user-dashboard/threat-distribution', {
      headers: {
        'Authorization': 'Bearer test-token' // Replace with actual token
      },
      params: {
        timeRange: 'week'
      }
    });

    console.log('Threat Distribution Response:');
    console.log(JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.error('Error testing threat distribution:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

// Run the test
testThreatDistribution();
