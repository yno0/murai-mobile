import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

const API_BASE_URL = 'http://localhost:3000/api';

async function testLogin() {
  try {
    console.log('🧪 Testing login...');

    // Try logging in with Bob's account
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        email: 'bob@example.com', 
        password: 'password123' // Common test password
      })
    });

    console.log('📡 Response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Login failed:', errorText);
      
      // Try with admin@example.com
      console.log('🔄 Trying admin@example.com...');
      const response2 = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: 'admin@example.com', 
          password: 'admin123' 
        })
      });

      console.log('📡 Response status (admin):', response2.status);
      
      if (!response2.ok) {
        const errorText2 = await response2.text();
        console.error('❌ Admin login failed:', errorText2);
        return;
      }

      const data2 = await response2.json();
      console.log('✅ Admin login successful:', data2);
      return;
    }

    const data = await response.json();
    console.log('✅ Login successful:', data);
    
    // Test the token with reports API
    console.log('🧪 Testing reports API with token...');
    const reportsResponse = await fetch(`${API_BASE_URL}/admin/reports`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${data.token}`,
      },
    });

    console.log('📡 Reports API status:', reportsResponse.status);
    
    if (reportsResponse.ok) {
      const reportsData = await reportsResponse.json();
      console.log('✅ Reports API successful, found', reportsData.reports.length, 'reports');
    } else {
      const errorText = await reportsResponse.text();
      console.error('❌ Reports API failed:', errorText);
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testLogin();
