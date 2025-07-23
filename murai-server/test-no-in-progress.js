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

async function testReportsWithoutInProgress() {
  try {
    console.log('🧪 Testing Reports without in_progress status...');

    // Get all reports
    const reportsResponse = await fetch(`${API_BASE_URL}/admin/reports`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${testAdminToken}`,
      },
    });

    if (!reportsResponse.ok) {
      console.error('❌ Failed to get reports');
      return;
    }

    const reportsData = await reportsResponse.json();
    console.log(`📊 Found ${reportsData.reports.length} reports`);

    // Check status distribution
    const statusCounts = {};
    reportsData.reports.forEach(report => {
      statusCounts[report.status] = (statusCounts[report.status] || 0) + 1;
    });

    console.log('\n📊 Status distribution:');
    Object.entries(statusCounts).forEach(([status, count]) => {
      console.log(`   ${status}: ${count}`);
    });

    // Verify no in_progress reports exist
    const inProgressReports = reportsData.reports.filter(r => r.status === 'in_progress');
    if (inProgressReports.length === 0) {
      console.log('✅ No in_progress reports found - migration successful!');
    } else {
      console.log(`❌ Found ${inProgressReports.length} in_progress reports - migration incomplete`);
    }

    // Test that we can still approve and decline reports
    const pendingReport = reportsData.reports.find(r => r.status === 'pending');
    if (pendingReport) {
      console.log(`\n🎯 Testing approve action on report: ${pendingReport._id}`);
      
      const approveResponse = await fetch(`${API_BASE_URL}/admin/reports/${pendingReport._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${testAdminToken}`,
        },
        body: JSON.stringify({ status: 'resolved' })
      });

      if (approveResponse.ok) {
        const approveData = await approveResponse.json();
        console.log('✅ Approve action successful:', approveData.report.status);
      } else {
        console.log('❌ Approve action failed');
      }
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testReportsWithoutInProgress();
