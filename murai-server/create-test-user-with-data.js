import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import DetectedWord from './models/detectedWordModel.js';
import UserActivity from './models/userActivityLogs.js';
import User from './models/userModel.js';

// Load environment variables
dotenv.config();

// Connect to MongoDB
async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
}

// Create test user
async function createTestUser() {
  try {
    // Check if user already exists
    const existingUser = await User.findOne({ email: 'user@murai.com' });
    if (existingUser) {
      console.log('Test user already exists, updating...');
      return existingUser;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash('user123', 10);

    // Create user
    const testUser = new User({
      name: 'Test User',
      email: 'user@murai.com',
      password: hashedPassword,
      isVerified: true,
      role: 'user',
      createdAt: new Date(),
    });

    await testUser.save();
    console.log('✅ Test user created successfully');
    return testUser;
  } catch (error) {
    console.error('Error creating test user:', error);
    throw error;
  }
}

// Generate dummy detected words data
async function generateDetectedWordsData(userId) {
  try {
    // Clear existing data for this user
    await DetectedWord.deleteMany({ userId });

    const sampleWords = [
      'inappropriate', 'harmful', 'offensive', 'toxic', 'spam', 'scam', 
      'phishing', 'malware', 'virus', 'threat', 'dangerous', 'suspicious'
    ];

    const sampleUrls = [
      'https://example.com',
      'https://social-media.com',
      'https://news-site.com',
      'https://shopping-site.com',
      'https://forum.com',
      'https://blog-site.com'
    ];

    const detectedWords = [];
    const now = new Date();

    // Generate data for the last 30 days
    for (let i = 0; i < 30; i++) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      
      // Generate 2-8 detections per day
      const detectionsPerDay = Math.floor(Math.random() * 7) + 2;
      
      for (let j = 0; j < detectionsPerDay; j++) {
        const randomHour = Math.floor(Math.random() * 24);
        const randomMinute = Math.floor(Math.random() * 60);
        const detectionDate = new Date(date);
        detectionDate.setHours(randomHour, randomMinute, 0, 0);

        detectedWords.push({
          userId,
          word: sampleWords[Math.floor(Math.random() * sampleWords.length)],
          context: `This is a sample context containing the detected word in a sentence.`,
          url: sampleUrls[Math.floor(Math.random() * sampleUrls.length)],
          sentimentScore: (Math.random() - 0.5) * 2, // Random between -1 and 1
          accuracy: Math.random() * 0.3 + 0.7, // Random between 0.7 and 1.0
          responseTime: Math.random() * 500 + 100, // Random between 100-600ms
          createdAt: detectionDate,
        });
      }
    }

    await DetectedWord.insertMany(detectedWords);
    console.log(`✅ Generated ${detectedWords.length} detected words entries`);
  } catch (error) {
    console.error('Error generating detected words data:', error);
    throw error;
  }
}

// Generate dummy user activity data
async function generateUserActivityData(userId) {
  try {
    // Clear existing data for this user
    await UserActivity.deleteMany({ userId });

    const activityTypes = [
      'login', 'logout', 'visit', 'flagged', 'group_join', 'group_leave',
      'update', 'report', 'other'
    ];

    const activityDetails = {
      login: 'User logged into the application',
      logout: 'User logged out of the application',
      visit: 'User visited a monitored website',
      flagged: 'Inappropriate content was flagged',
      group_join: 'User joined a safety group',
      group_leave: 'User left a safety group',
      update: 'User updated their preferences',
      report: 'User generated a safety report',
      other: 'User performed a general activity'
    };

    const activities = [];
    const now = new Date();

    // Generate data for the last 30 days
    for (let i = 0; i < 30; i++) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      
      // Generate 1-5 activities per day
      const activitiesPerDay = Math.floor(Math.random() * 5) + 1;
      
      for (let j = 0; j < activitiesPerDay; j++) {
        const randomHour = Math.floor(Math.random() * 24);
        const randomMinute = Math.floor(Math.random() * 60);
        const activityDate = new Date(date);
        activityDate.setHours(randomHour, randomMinute, 0, 0);

        const activityType = activityTypes[Math.floor(Math.random() * activityTypes.length)];

        activities.push({
          userId,
          activityType,
          activityDetails: activityDetails[activityType],
          ipAddress: '192.168.1.' + Math.floor(Math.random() * 255),
          userAgent: 'Mozilla/5.0 (Mobile; rv:1.0) Gecko/1.0 Firefox/1.0',
          createdAt: activityDate,
        });
      }
    }

    await UserActivity.insertMany(activities);
    console.log(`✅ Generated ${activities.length} user activity entries`);
  } catch (error) {
    console.error('Error generating user activity data:', error);
    throw error;
  }
}

// Main function
async function main() {
  console.log('🚀 Creating test user with dummy data...\n');

  try {
    await connectDB();

    // Create test user
    const testUser = await createTestUser();
    console.log(`User ID: ${testUser._id}`);

    // Generate dummy data
    await generateDetectedWordsData(testUser._id);
    await generateUserActivityData(testUser._id);

    console.log('\n✅ Test user setup completed successfully!');
    console.log('\n📋 Test User Credentials:');
    console.log('   Email: user@murai.com');
    console.log('   Password: user123');
    console.log('\n🎯 You can now test the dashboard with real data!');

  } catch (error) {
    console.error('❌ Error setting up test user:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
  }
}

// Run the script
main().catch(console.error);
