const mongoose = require('mongoose');
const DetectedWord = require('./models/detectedWordModel.js').default;

mongoose.connect('mongodb://localhost:27017/murai-db')
  .then(async () => {
    console.log('Connected to database');
    
    const totalCount = await DetectedWord.countDocuments();
    console.log('Total detected words in database:', totalCount);
    
    // Get count by user
    const userCounts = await DetectedWord.aggregate([
      { $group: { _id: '$userId', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    console.log('\nDetected words by user:');
    userCounts.forEach(user => {
      console.log(`User ${user._id}: ${user.count} words`);
    });
    
    // Get recent samples
    const recentWords = await DetectedWord.find().sort({ createdAt: -1 }).limit(5);
    console.log('\nRecent detected words:');
    recentWords.forEach(word => {
      console.log(`- "${word.word}" by user ${word.userId} on ${word.createdAt}`);
    });
    
    process.exit(0);
  })
  .catch(err => {
    console.error('Database connection error:', err);
    process.exit(1);
  });
