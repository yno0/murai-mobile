import fetch from 'node-fetch';

async function testConnection() {
  try {
    console.log('Testing local server connection...');
    
    // Test basic server health
    const healthResponse = await fetch('http://localhost:3000/api/dashboard/overview?timeRange=today');
    console.log('Health check status:', healthResponse.status);
    
    if (healthResponse.ok) {
      const healthData = await healthResponse.json();
      console.log('Health check data:', healthData);
    }
    
    // Test chart endpoint specifically
    const chartResponse = await fetch('http://localhost:3000/api/dashboard/activity-chart?timeRange=today');
    console.log('Chart endpoint status:', chartResponse.status);
    
    if (chartResponse.ok) {
      const chartData = await chartResponse.json();
      console.log('Chart endpoint data:');
      console.log('- Labels:', chartData.labels);
      console.log('- Detections:', chartData.datasets[0].data);
      console.log('- Reports:', chartData.datasets[1].data);
      console.log('- Total Detections:', chartData.datasets[0].data.reduce((a, b) => a + b, 0));
      console.log('- Total Reports:', chartData.datasets[1].data.reduce((a, b) => a + b, 0));
    }
    
  } catch (error) {
    console.error('Connection test failed:', error);
  }
}

testConnection();
