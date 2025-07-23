import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Report from './models/reportModel.js';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI;

async function connectDB() {
  try {
    await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    process.exit(1);
  }
}

async function migrateInProgressReports() {
  try {
    console.log('🔄 Migrating in_progress reports...');

    // Find all reports with in_progress status
    const inProgressReports = await Report.find({ status: 'in_progress' });
    console.log(`📊 Found ${inProgressReports.length} in_progress reports`);

    if (inProgressReports.length === 0) {
      console.log('✅ No in_progress reports to migrate');
      return;
    }

    // Update all in_progress reports to pending
    const result = await Report.updateMany(
      { status: 'in_progress' },
      { 
        $set: { 
          status: 'pending',
          updatedAt: new Date()
        }
      }
    );

    console.log(`✅ Successfully migrated ${result.modifiedCount} reports from in_progress to pending`);

    // Verify the migration
    const remainingInProgress = await Report.countDocuments({ status: 'in_progress' });
    const newPendingCount = await Report.countDocuments({ status: 'pending' });
    
    console.log('📊 Migration verification:');
    console.log(`   Remaining in_progress: ${remainingInProgress}`);
    console.log(`   Total pending: ${newPendingCount}`);

    // Show current status distribution
    const statusCounts = await Report.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    
    console.log('\n📊 Current status distribution:');
    statusCounts.forEach(item => {
      console.log(`   ${item._id}: ${item.count}`);
    });

  } catch (error) {
    console.error('❌ Migration failed:', error);
  }
}

async function main() {
  await connectDB();
  await migrateInProgressReports();
  await mongoose.disconnect();
  console.log('\n✅ Migration completed');
}

main().catch(console.error);
