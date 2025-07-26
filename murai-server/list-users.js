import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/userModel.js';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI;

async function listUsers() {
  try {
    await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('Connected to MongoDB');

    const users = await User.find({ role: { $ne: 'admin' } }).select('name email role isPremium status');
    
    console.log('\n📋 Regular Users in Database:');
    console.log('=====================================');
    
    users.forEach((user, index) => {
      console.log(`${index + 1}. Name: ${user.name || 'N/A'}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Role: ${user.role}`);
      console.log(`   Premium: ${user.isPremium ? 'Yes' : 'No'}`);
      console.log(`   Status: ${user.status}`);
      console.log('   ---');
    });
    
    console.log(`\nTotal regular users: ${users.length}`);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

listUsers();
