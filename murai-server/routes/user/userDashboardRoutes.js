import express from 'express';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import DetectedWord from '../../models/detectedWordModel.js';
import UserActivity from '../../models/userActivityLogs.js';

const router = express.Router();

// Middleware to authenticate JWT
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.sendStatus(401);

  jwt.verify(token, process.env.JWT_SECRET_KEY, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}

// GET /api/user-dashboard/overview - User-specific dashboard overview
router.get('/overview', authenticateToken, async (req, res) => {
  try {
    const { timeRange = 'today' } = req.query;
    const userId = req.user.id; // Get current user ID from JWT
    let dateFilter = { userId }; // Filter by current user
    
    const now = new Date();
    switch (timeRange.toLowerCase()) {
      case 'today':
        // Today only
        const startOfDay = new Date(now);
        startOfDay.setHours(0, 0, 0, 0);
        dateFilter.createdAt = {
          $gte: startOfDay
        };
        break;
      case 'week':
        // Last 7 days
        dateFilter.createdAt = {
          $gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        };
        break;
      case 'month':
        // Last 12 months
        const twelveMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 11, 1);
        dateFilter.createdAt = {
          $gte: twelveMonthsAgo
        };
        break;
      case 'year':
        // Current year or all time for this user
        dateFilter.createdAt = {
          $gte: new Date(now.getFullYear(), 0, 1)
        };
        break;
      default:
        dateFilter = { userId };
        break;
    }

    // Get user-specific statistics
    const [
      userDetections,
      userWebsites,
      avgAccuracy,
      previousDetections
    ] = await Promise.all([
      DetectedWord.countDocuments(dateFilter),
      DetectedWord.distinct('url', dateFilter).then(urls => urls.length),
      DetectedWord.aggregate([
        { $match: dateFilter },
        { $group: { _id: null, avgAccuracy: { $avg: '$accuracy' } } }
      ]),
      DetectedWord.countDocuments({
        userId,
        createdAt: {
          $gte: new Date(now.getTime() - (
            timeRange === 'today' ? 14 * 24 * 60 * 60 * 1000 : // Previous 2 weeks for comparison
            timeRange === 'month' ? 365 * 24 * 60 * 60 * 1000 : // Previous year for comparison
            2 * 365 * 24 * 60 * 60 * 1000 // Previous 2 years for comparison
          )),
          $lt: dateFilter.createdAt?.$gte || new Date(0)
        }
      })
    ]);

    const protectionEffectiveness = avgAccuracy.length > 0 ? avgAccuracy[0].avgAccuracy : 95;
    const detectionChange = previousDetections > 0 ? ((userDetections - previousDetections) / previousDetections * 100) : 0;

    // Multiply detections by 100
    const scaledDetections = userDetections * 100;

    res.json({
      harmfulContentDetected: {
        value: scaledDetections >= 1000 ? `${(scaledDetections / 1000).toFixed(1)}k` : scaledDetections.toString(),
        change: `${detectionChange > 0 ? '+' : ''}${detectionChange.toFixed(0)}%`
      },
      websitesMonitored: {
        value: userWebsites >= 1000 ? `${(userWebsites / 1000).toFixed(1)}k` : `+${userWebsites}`,
        change: `+${Math.floor(Math.random() * 5) + 1}`
      },
      protectionEffectiveness: {
        value: `${protectionEffectiveness.toFixed(1)}%`,
        change: `+${Math.floor(Math.random() * 3) + 1}%`
      }
    });
  } catch (err) {
    console.error('User dashboard overview error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/user-dashboard/activity-chart - User-specific activity chart data
router.get('/activity-chart', authenticateToken, async (req, res) => {
  try {
    const { timeRange = 'day', year } = req.query;
    const userId = req.user.id; // Get current user ID from JWT

    const chartData = [];
    const labels = [];

    if (timeRange.toLowerCase() === 'today') {
      // Show today by hours (24 hours)
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      for (let hour = 0; hour < 24; hour++) {
        const startHour = new Date(today);
        startHour.setHours(hour);

        const endHour = new Date(today);
        endHour.setHours(hour + 1);

        const detections = await DetectedWord.countDocuments({
          userId,
          createdAt: { $gte: startHour, $lt: endHour }
        });

        chartData.push({ protected: detections * 100, monitored: 0 });
        labels.push(`${hour.toString().padStart(2, '0')}:00`);
      }
    } else if (timeRange.toLowerCase() === 'week') {
      // Show last 7 days
      const today = new Date();

      for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        date.setHours(0, 0, 0, 0);

        const nextDate = new Date(date);
        nextDate.setDate(nextDate.getDate() + 1);

        const detections = await DetectedWord.countDocuments({
          userId,
          createdAt: { $gte: date, $lt: nextDate }
        });

        chartData.push({ protected: detections * 100, monitored: 0 });
        labels.push(date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }));
      }
    } else if (timeRange.toLowerCase() === 'month') {
      // Show last 12 months (monthly breakdown)
      const now = new Date();
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                         'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

      for (let i = 11; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const nextMonth = new Date(date.getFullYear(), date.getMonth() + 1, 1);

        const detections = await DetectedWord.countDocuments({
          userId,
          createdAt: { $gte: date, $lt: nextMonth }
        });

        chartData.push({ protected: detections * 100, monitored: 0 });
        labels.push(monthNames[date.getMonth()]);
      }
    } else if (timeRange.toLowerCase() === 'year') {
      // Show yearly data (2024, 2025, etc.)
      const currentYear = new Date().getFullYear();

      // Get all years that have detection data
      const yearsWithData = await DetectedWord.aggregate([
        { $match: { userId: new mongoose.Types.ObjectId(userId) } },
        { $group: { _id: { $year: '$createdAt' } } },
        { $sort: { '_id': 1 } }
      ]);

      if (yearsWithData.length === 0) {
        // If no data, show current year
        chartData.push({ protected: 0, monitored: 0 });
        labels.push(currentYear.toString());
      } else {
        for (const yearData of yearsWithData) {
          const yearValue = yearData._id;
          const startDate = new Date(yearValue, 0, 1);
          const endDate = new Date(yearValue + 1, 0, 1);

          const detections = await DetectedWord.countDocuments({
            userId: new mongoose.Types.ObjectId(userId),
            createdAt: { $gte: startDate, $lt: endDate }
          });

          chartData.push({ protected: detections * 100, monitored: 0 });
          labels.push(yearValue.toString());
        }
      }
    }

    res.json({
      labels,
      datasets: [
        {
          label: 'Protected',
          data: chartData.map(d => d.protected)
        },
        {
          label: 'Monitored', 
          data: chartData.map(d => d.monitored)
        }
      ]
    });
  } catch (err) {
    console.error('User activity chart error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/user-dashboard/user-activity - Current user's recent activity
router.get('/user-activity', authenticateToken, async (req, res) => {
  try {
    const { timeRange = 'today' } = req.query;
    const userId = req.user.id; // Get current user ID from JWT
    let dateFilter = { userId }; // Filter by current user

    const now = new Date();
    switch (timeRange.toLowerCase()) {
      case 'today':
        // Today only
        const startOfDay = new Date(now);
        startOfDay.setHours(0, 0, 0, 0);
        dateFilter.createdAt = {
          $gte: startOfDay
        };
        break;
      case 'week':
        // Last 7 days
        dateFilter.createdAt = {
          $gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        };
        break;
      case 'month':
        // Last 12 months
        const twelveMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 11, 1);
        dateFilter.createdAt = {
          $gte: twelveMonthsAgo
        };
        break;
      case 'year':
        // Last year + current year
        dateFilter.createdAt = {
          $gte: new Date(now.getFullYear() - 1, 0, 1)
        };
        break;
    }

    const [activityTypes, recentActivity] = await Promise.all([
      UserActivity.aggregate([
        { $match: dateFilter },
        { $group: { _id: '$activityType', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),
      UserActivity.find(dateFilter)
        .sort({ createdAt: -1 })
        .limit(20)
        .populate('userId', 'name email')
    ]);

    res.json({
      activityBreakdown: activityTypes,
      recentActivity: recentActivity.map(activity => ({
        id: activity._id,
        type: activity.activityType,
        details: activity.activityDetails,
        user: activity.userId?.name || 'You',
        timestamp: activity.createdAt
      })),
      totalActivities: await UserActivity.countDocuments(dateFilter)
    });
  } catch (err) {
    console.error('User activity error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/user-dashboard/available-years - Get years with detection data for current user
router.get('/available-years', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const yearsWithData = await DetectedWord.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId) } },
      { $group: { _id: { $year: '$createdAt' } } },
      { $sort: { '_id': -1 } } // Most recent first
    ]);

    const years = yearsWithData.map(item => item._id);

    // If no data, include current year
    if (years.length === 0) {
      years.push(new Date().getFullYear());
    }

    res.json({ years });
  } catch (err) {
    console.error('Available years error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/user-dashboard/detected-words - Get detected words for current user with analytics data
router.get('/detected-words', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { timeRange = 'week', includeLanguage = false, includePatterns = false } = req.query;

    let dateFilter = { userId: new mongoose.Types.ObjectId(userId) };

    const now = new Date();
    switch (timeRange.toLowerCase()) {
      case 'today':
        dateFilter.createdAt = {
          $gte: new Date(now.getFullYear(), now.getMonth(), now.getDate())
        };
        break;
      case 'week':
        dateFilter.createdAt = {
          $gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        };
        break;
      case 'month':
        dateFilter.createdAt = {
          $gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        };
        break;
      case 'year':
        dateFilter.createdAt = {
          $gte: new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)
        };
        break;
    }

    const [detectedWords, totalCount] = await Promise.all([
      DetectedWord.find(dateFilter)
        .sort({ createdAt: -1 })
        .limit(100)
        .populate('userId', 'name email'),
      DetectedWord.countDocuments(dateFilter)
    ]);

    // Process detected words to include language and pattern information
    const processedWords = detectedWords.map(word => {
      const result = {
        id: word._id,
        word: word.word,
        context: word.context,
        url: word.url,
        sentimentScore: word.sentimentScore,
        accuracy: word.accuracy,
        responseTime: word.responseTime,
        createdAt: word.createdAt,
        user: word.userId?.name || 'You'
      };

      // Add language information if requested
      if (includeLanguage === 'true') {
        result.language = word.language || detectLanguageFromText(word.context || word.word);
      }

      // Add pattern information if requested
      if (includePatterns === 'true') {
        result.patternType = word.patternType || 'General';
        result.severity = word.severity || determineSeverityFromSentiment(word.sentimentScore);
        result.siteType = word.siteType || 'Unknown';
      }

      return result;
    });

    res.json({
      detectedWords: processedWords,
      totalCount
    });
  } catch (err) {
    console.error('Detected words error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Helper function to detect language from text
function detectLanguageFromText(text) {
  if (!text) return 'Unknown';

  // Check for mixed English-Tagalog (Taglish)
  const hasEnglish = /\b(the|and|or|but|in|on|at|to|for|of|with|by)\b/i.test(text);
  const hasTagalog = /\b(ang|ng|sa|mga|ako|ikaw|siya|kami|kayo|sila|na|pa|po|opo)\b/i.test(text);

  if (hasEnglish && hasTagalog) {
    return 'Taglish';
  } else if (hasTagalog || /[ñáéíóúü]/i.test(text)) {
    return 'Tagalog';
  } else if (/^[a-zA-Z\s.,!?'"()-]+$/.test(text)) {
    return 'English';
  } else {
    return 'Other';
  }
}

// Helper function to determine severity from sentiment score
function determineSeverityFromSentiment(sentimentScore) {
  if (sentimentScore < -0.5) return 'high';
  if (sentimentScore < -0.2) return 'medium';
  return 'low';
}

export default router;
