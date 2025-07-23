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

async function testConfirmationFlow() {
  try {
    console.log('🧪 Testing confirmation flow...');

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

    console.log('\n📊 Current status distribution:');
    Object.entries(statusCounts).forEach(([status, count]) => {
      console.log(`   ${status}: ${count}`);
    });

    // Find a pending report to test with
    const pendingReport = reportsData.reports.find(r => r.status === 'pending');
    if (pendingReport) {
      console.log(`\n🎯 Found pending report for testing:`);
      console.log(`   ID: ${pendingReport._id}`);
      console.log(`   Content: "${pendingReport.reportedText?.substring(0, 80)}..."`);
      console.log(`   Type: ${pendingReport.type}`);
      console.log(`   Category: ${pendingReport.category}`);
      console.log(`   Status: ${pendingReport.status}`);
      
      console.log('\n✅ Ready for manual testing in the mobile app!');
      console.log('📱 Steps to test:');
      console.log('   1. Login as admin@example.com / admin123');
      console.log('   2. Navigate to Reports Management');
      console.log('   3. Click on the pending report above');
      console.log('   4. Try clicking Approve or Decline');
      console.log('   5. Verify the confirmation modal appears');
      console.log('   6. Check the detailed message and action buttons');
      console.log('   7. Test both Cancel and Confirm actions');
    } else {
      console.log('\n❌ No pending reports found for testing');
      console.log('💡 You can reopen a resolved/rejected report to test');
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testConfirmationFlow();
