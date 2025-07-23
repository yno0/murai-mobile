import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import fetch from 'node-fetch';

dotenv.config();

const API_BASE_URL = 'http://localhost:3000/api';
const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;

// Create a test admin token using a real admin user ID
const testAdminToken = jwt.sign(
  {
    id: '686772e909ff03fda9a6ce17', // Real admin user ID (Bob)
    role: 'admin',
    email: 'bob@example.com'
  },
  JWT_SECRET_KEY,
  { expiresIn: '1h' }
);

async function testReportsAPI() {
  try {
    console.log('🧪 Testing Reports API...');
    console.log('🔑 Using test token:', testAdminToken.substring(0, 20) + '...');

    const response = await fetch(`${API_BASE_URL}/admin/reports`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${testAdminToken}`,
      },
    });

    console.log('📡 Response status:', response.status);
    console.log('📡 Response headers:', Object.fromEntries(response.headers));

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ API Error:', errorText);
      return;
    }

    const data = await response.json();
    console.log('✅ API Response:', JSON.stringify(data, null, 2));
    
    if (data.reports) {
      console.log(`📊 Found ${data.reports.length} reports`);
      data.reports.forEach((report, index) => {
        console.log(`  ${index + 1}. ${report.type} - ${report.status} - "${report.reportedText?.substring(0, 50)}..."`);
      });
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testReportsAPI();
