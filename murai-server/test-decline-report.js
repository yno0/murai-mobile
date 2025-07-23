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

async function testDeclineReport() {
  try {
    console.log('🧪 Testing decline report functionality...');

    // First, get all reports to find one to decline
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

    // Find a pending report to decline
    const pendingReport = reportsData.reports.find(r => r.status === 'pending');
    if (!pendingReport) {
      console.log('❌ No pending reports found to decline');
      return;
    }

    console.log(`🎯 Declining report: ${pendingReport._id}`);
    console.log(`   Content: "${pendingReport.reportedText?.substring(0, 50)}..."`);
    console.log(`   Current status: ${pendingReport.status}`);

    // Decline the report
    const declineResponse = await fetch(`${API_BASE_URL}/admin/reports/${pendingReport._id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${testAdminToken}`,
      },
      body: JSON.stringify({
        status: 'rejected'
      })
    });

    console.log('📡 Decline response status:', declineResponse.status);

    if (!declineResponse.ok) {
      const errorText = await declineResponse.text();
      console.error('❌ Decline failed:', errorText);
      return;
    }

    const declineData = await declineResponse.json();
    console.log('✅ Report declined successfully!');
    console.log('📋 Updated report:', {
      id: declineData.report._id,
      status: declineData.report.status,
      reviewedBy: declineData.report.reviewedBy?.name || 'Unknown',
      reviewedAt: declineData.report.reviewedAt
    });

    // Verify the change by getting the report again
    const verifyResponse = await fetch(`${API_BASE_URL}/admin/reports/${pendingReport._id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${testAdminToken}`,
      },
    });

    if (verifyResponse.ok) {
      const verifyData = await verifyResponse.json();
      console.log('🔍 Verification - Report status is now:', verifyData.status);
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testDeclineReport();
