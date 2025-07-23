import fetch from 'node-fetch';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

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

async function testProfileAPI() {
  try {
    console.log('🧪 Testing Profile API...');

    // Test GET profile
    console.log('\n📡 Testing GET /admin/profile...');
    const getResponse = await fetch(`${API_BASE_URL}/admin/profile`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${testAdminToken}`,
      },
    });

    console.log('📡 GET Response status:', getResponse.status);

    if (getResponse.ok) {
      const profileData = await getResponse.json();
      console.log('✅ Profile data retrieved:', {
        name: profileData.name,
        email: profileData.email,
        department: profileData.department,
        position: profileData.position,
        phone: profileData.phone || 'Not set'
      });

      // Test PUT profile update
      console.log('\n📡 Testing PUT /admin/profile...');
      const updateData = {
        name: profileData.name,
        email: profileData.email,
        phone: '09123456789',
        address: '123 Test Street, Manila, Philippines',
        emergencyContact: 'Jane Doe',
        emergencyPhone: '09987654321',
        department: profileData.department,
        position: profileData.position
      };

      const putResponse = await fetch(`${API_BASE_URL}/admin/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${testAdminToken}`,
        },
        body: JSON.stringify(updateData)
      });

      console.log('📡 PUT Response status:', putResponse.status);

      if (putResponse.ok) {
        const updateResult = await putResponse.json();
        console.log('✅ Profile updated successfully:', {
          message: updateResult.message,
          phone: updateResult.profile.phone,
          address: updateResult.profile.address ? 'Updated' : 'Not set',
          emergencyContact: updateResult.profile.emergencyContact
        });
      } else {
        const errorText = await putResponse.text();
        console.error('❌ PUT failed:', errorText);
      }

    } else {
      const errorText = await getResponse.text();
      console.error('❌ GET failed:', errorText);
    }

    // Test activity logs
    console.log('\n📡 Testing GET /admin/profile/activity...');
    const activityResponse = await fetch(`${API_BASE_URL}/admin/profile/activity?page=1&limit=5`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${testAdminToken}`,
      },
    });

    console.log('📡 Activity Response status:', activityResponse.status);

    if (activityResponse.ok) {
      const activityData = await activityResponse.json();
      console.log('✅ Activity logs retrieved:', {
        totalActivities: activityData.pagination.totalActivities,
        currentPage: activityData.pagination.currentPage,
        recentActivities: activityData.activities.slice(0, 3).map(a => ({
          action: a.action,
          timestamp: new Date(a.timestamp).toLocaleString()
        }))
      });
    } else {
      const errorText = await activityResponse.text();
      console.error('❌ Activity logs failed:', errorText);
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testProfileAPI();
