import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Notification from './models/notificationModel.js';
import User from './models/userModel.js';

dotenv.config();

async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    process.exit(1);
  }
}

function getRandomElement(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function getRandomDate(daysBack) {
  const now = new Date();
  const randomDays = Math.floor(Math.random() * daysBack);
  const randomHours = Math.floor(Math.random() * 24);
  const randomMinutes = Math.floor(Math.random() * 60);
  
  const date = new Date(now);
  date.setDate(date.getDate() - randomDays);
  date.setHours(randomHours, randomMinutes, 0, 0);
  
  return date;
}

async function generateNotifications() {
  try {
    await connectDB();
    
    // Get existing users
    const users = await User.find({});
    if (users.length === 0) {
      console.log('No users found. Please run the sample data generation first.');
      return;
    }
    
    console.log(`Found ${users.length} users. Generating notifications...`);
    
    // Clear existing notifications
    await Notification.deleteMany({});
    
    const notifications = [];
    
    // Create notifications for each user
    for (const user of users) {
      // Create 3-5 notifications per user
      const notificationCount = Math.floor(Math.random() * 3) + 3;
      
      for (let i = 0; i < notificationCount; i++) {
        const notificationTypes = ['info', 'warning', 'alert', 'success'];
        const titles = [
          'Security Alert',
          'Content Detected',
          'System Update',
          'Weekly Report',
          'New Feature Available',
          'Account Activity',
          'Protection Status'
        ];
        const messages = [
          'Harmful content was detected and blocked on your monitored websites.',
          'Your weekly protection report is now available.',
          'A new security feature has been added to your account.',
          'Unusual activity detected on your account.',
          'Your content filtering settings have been updated.',
          'Monthly security scan completed successfully.',
          'New threats detected in your monitoring group.'
        ];
        
        notifications.push({
          userId: user._id,
          title: getRandomElement(titles),
          message: getRandomElement(messages),
          type: getRandomElement(notificationTypes),
          isRead: Math.random() > 0.6, // 40% chance of being read
          isGlobal: false,
          createdAt: getRandomDate(7)
        });
      }
    }
    
    // Add some global notifications
    const globalNotifications = [
      {
        userId: users[0]._id,
        title: 'System Maintenance',
        message: 'Scheduled maintenance will occur tonight from 2-4 AM EST.',
        type: 'info',
        isRead: false,
        isGlobal: true,
        createdAt: getRandomDate(2)
      },
      {
        userId: users[0]._id,
        title: 'Security Update',
        message: 'New security protocols have been implemented across the platform.',
        type: 'success',
        isRead: false,
        isGlobal: true,
        createdAt: getRandomDate(1)
      },
      {
        userId: users[0]._id,
        title: 'New Threat Detected',
        message: 'Our AI has identified new harmful content patterns. Protection updated.',
        type: 'alert',
        isRead: false,
        isGlobal: true,
        createdAt: getRandomDate(3)
      }
    ];
    
    notifications.push(...globalNotifications);
    
    // Insert all notifications
    await Notification.insertMany(notifications);
    
    console.log(`Successfully generated ${notifications.length} notifications!`);
    console.log(`- User notifications: ${notifications.length - globalNotifications.length}`);
    console.log(`- Global notifications: ${globalNotifications.length}`);
    
  } catch (error) {
    console.error('Error generating notifications:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed.');
  }
}

generateNotifications();
