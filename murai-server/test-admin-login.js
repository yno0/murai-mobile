// Quick test script to verify admin login and user fetching works
import fetch from 'node-fetch';

const API_BASE_URL = 'http://localhost:3000/api';

async function testAdminFlow() {
  try {
    console.log('🔄 Testing admin login...');
    
    // Step 1: Login as admin
    const loginResponse = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@murai.com',
        password: 'admin123'
      })
    });

    if (!loginResponse.ok) {
      throw new Error(`Login failed: ${loginResponse.status}`);
    }

    const loginData = await loginResponse.json();
    console.log('✅ Login successful');
    console.log('👤 User:', loginData.user);
    console.log('🔑 Token:', loginData.token.substring(0, 20) + '...');

    // Step 2: Test admin users endpoint
    console.log('\n🔄 Testing admin users endpoint...');
    const usersResponse = await fetch(`${API_BASE_URL}/admin/users`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${loginData.token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!usersResponse.ok) {
      const errorData = await usersResponse.json();
      throw new Error(`Users fetch failed: ${usersResponse.status} - ${errorData.message}`);
    }

    const usersData = await usersResponse.json();
    console.log('✅ Users fetch successful');
    console.log('📊 Total users:', usersData.users.length);
    console.log('👥 Users:', usersData.users.map(u => ({ name: u.name, email: u.email, role: u.role, status: u.status })));

    // Step 3: Test user update
    if (usersData.users.length > 0) {
      const testUser = usersData.users.find(u => u.role !== 'admin');
      if (testUser) {
        console.log('\n🔄 Testing user update...');
        const updateResponse = await fetch(`${API_BASE_URL}/admin/users/${testUser._id}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${loginData.token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            status: testUser.status === 'active' ? 'inactive' : 'active'
          })
        });

        if (!updateResponse.ok) {
          const errorData = await updateResponse.json();
          throw new Error(`User update failed: ${updateResponse.status} - ${errorData.message}`);
        }

        const updateData = await updateResponse.json();
        console.log('✅ User update successful');
        console.log('📝 Updated user:', updateData.user.name, 'status:', updateData.user.status);
      }
    }

    console.log('\n🎉 All tests passed! Admin functionality is working.');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testAdminFlow();
