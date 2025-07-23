import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/userModel.js';

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

async function checkAdminUsers() {
  try {
    const adminUsers = await User.find({ role: 'admin' }).select('_id name email role');
    console.log('👑 Admin users found:');
    adminUsers.forEach((user, index) => {
      console.log(`  ${index + 1}. ID: ${user._id}`);
      console.log(`     Name: ${user.name}`);
      console.log(`     Email: ${user.email}`);
      console.log(`     Role: ${user.role}`);
      console.log('');
    });

    if (adminUsers.length === 0) {
      console.log('❌ No admin users found. Creating one...');
      
      const bcrypt = await import('bcryptjs');
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('admin123', salt);

      const adminUser = new User({
        name: 'Test Admin',
        email: 'admin@test.com',
        password: hashedPassword,
        role: 'admin',
        status: 'active',
        isVerified: true,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      await adminUser.save();
      console.log('✅ Created admin user:', adminUser._id);
    }

  } catch (error) {
    console.error('Error checking admin users:', error);
  }
}

async function main() {
  await connectDB();
  await checkAdminUsers();
  await mongoose.disconnect();
  console.log('✅ Check completed');
}

main().catch(console.error);
