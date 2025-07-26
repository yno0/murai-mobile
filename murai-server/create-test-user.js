import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from './models/userModel.js';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI;

async function createTestUser() {
  try {
    await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('Connected to MongoDB');

    const testEmail = 'testuser@example.com';
    const testPassword = 'password123';
    
    // Check if user already exists
    const existingUser = await User.findOne({ email: testEmail });
    if (existingUser) {
      console.log('Test user already exists. Updating password...');
      const hashedPassword = await bcrypt.hash(testPassword, 10);
      existingUser.password = hashedPassword;
      existingUser.isVerified = true;
      await existingUser.save();
      console.log('✅ Test user password updated!');
    } else {
      // Create new test user
      const hashedPassword = await bcrypt.hash(testPassword, 10);
      
      const testUser = new User({
        name: 'Test User',
        email: testEmail,
        password: hashedPassword,
        isVerified: true,
        role: 'user',
        status: 'active',
        isPremium: false
      });
      
      await testUser.save();
      console.log('✅ Test user created successfully!');
    }
    
    console.log('\n📋 Test User Credentials:');
    console.log('Email: testuser@example.com');
    console.log('Password: password123');
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

createTestUser();
