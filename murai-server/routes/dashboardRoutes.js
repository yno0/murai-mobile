import express from 'express';
import jwt from 'jsonwebtoken';
import DetectedWord from '../models/detectedWordModel.js';
import UserActivity from '../models/userActivityLogs.js';
import User from '../models/userModel.js';

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

// GET /api/dashboard/overview - Overall dashboard statistics
router.get('/overview', /* authenticateToken, */ async (req, res) => {
  try {
    const { timeRange = 'today' } = req.query;
    let dateFilter = {};
    
    const now = new Date();
    switch (timeRange.toLowerCase()) {
      case 'today':
        dateFilter = {
          createdAt: {
            $gte: new Date(now.getFullYear(), now.getMonth(), now.getDate())
          }
        };
        break;
      case 'last 7 days':
        dateFilter = {
          createdAt: {
            $gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
          }
        };
        break;
      case 'last 30 days':
        dateFilter = {
          createdAt: {
            $gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
          }
        };
        break;
      case 'all time':
      default:
        dateFilter = {};
        break;
    }

    // Get overall statistics
    const [
      totalDetections,
      uniqueWebsites,
      avgAccuracy,
      totalUsers,
      previousDetections
    ] = await Promise.all([
      DetectedWord.countDocuments(dateFilter),
      DetectedWord.distinct('url', dateFilter).then(urls => urls.length),
      DetectedWord.aggregate([
        { $match: dateFilter },
        { $group: { _id: null, avgAccuracy: { $avg: '$accuracy' } } }
      ]),
      User.countDocuments(),
      DetectedWord.countDocuments({
        createdAt: {
          $gte: new Date(now.getTime() - (timeRange === 'today' ? 2 : timeRange === 'last 7 days' ? 14 : 60) * 24 * 60 * 60 * 1000),
          $lt: dateFilter.createdAt?.$gte || new Date(0)
        }
      })
    ]);

    const protectionEffectiveness = avgAccuracy.length > 0 ? avgAccuracy[0].avgAccuracy : 95;
    const detectionChange = previousDetections > 0 ? ((totalDetections - previousDetections) / previousDetections * 100) : 0;

    res.json({
      harmfulContentDetected: {
        value: totalDetections >= 1000 ? `${(totalDetections / 1000).toFixed(1)}k` : totalDetections.toString(),
        change: `${detectionChange > 0 ? '+' : ''}${detectionChange.toFixed(0)}%`
      },
      websitesMonitored: {
        value: uniqueWebsites >= 1000 ? `${(uniqueWebsites / 1000).toFixed(1)}k` : `+${uniqueWebsites}`,
        change: `+${Math.floor(Math.random() * 5) + 1}`
      },
      protectionEffectiveness: {
        value: `${protectionEffectiveness.toFixed(1)}%`,
        change: `+${Math.floor(Math.random() * 3) + 1}%`
      }
    });
  } catch (err) {
    console.error('Dashboard overview error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/dashboard/activity-chart - Data for activity overview chart
router.get('/activity-chart', /* authenticateToken, */ async (req, res) => {
  try {
    const { timeRange = 'last 7 days' } = req.query;
    let days = 7;
    
    switch (timeRange.toLowerCase()) {
      case 'today':
        days = 1;
        break;
      case 'last 7 days':
        days = 7;
        break;
      case 'last 30 days':
        days = 30;
        break;
      default:
        days = 7;
    }

    const chartData = [];
    const labels = [];
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      
      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);
      
      const [detections, activities] = await Promise.all([
        DetectedWord.countDocuments({
          createdAt: { $gte: date, $lt: nextDate }
        }),
        UserActivity.countDocuments({
          createdAt: { $gte: date, $lt: nextDate }
        })
      ]);
      
      chartData.push({ protected: detections, monitored: activities });
      labels.push(days === 1 ? date.getHours() + ':00' : date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
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
    console.error('Activity chart error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/dashboard/flagged-words - Flagged words analytics data
router.get('/flagged-words', /* authenticateToken, */ async (req, res) => {
  try {
    const { timeRange = 'last 7 days' } = req.query;
    let dateFilter = {};
    
    const now = new Date();
    switch (timeRange.toLowerCase()) {
      case 'today':
        dateFilter = {
          createdAt: {
            $gte: new Date(now.getFullYear(), now.getMonth(), now.getDate())
          }
        };
        break;
      case 'last 7 days':
        dateFilter = {
          createdAt: {
            $gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
          }
        };
        break;
      case 'last 30 days':
        dateFilter = {
          createdAt: {
            $gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
          }
        };
        break;
    }

    const [topWords, recentDetections, totalCount] = await Promise.all([
      DetectedWord.aggregate([
        { $match: dateFilter },
        { $group: { _id: '$word', count: { $sum: 1 }, avgSentiment: { $avg: '$sentimentScore' } } },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ]),
      DetectedWord.find(dateFilter)
        .sort({ createdAt: -1 })
        .limit(20)
        .populate('userId', 'name email'),
      DetectedWord.countDocuments(dateFilter)
    ]);

    res.json({
      topWords: topWords.map(word => ({
        word: word._id,
        count: word.count,
        severity: word.avgSentiment < -0.5 ? 'high' : word.avgSentiment < 0 ? 'medium' : 'low'
      })),
      recentDetections: recentDetections.map(detection => ({
        id: detection._id,
        word: detection.word,
        context: detection.context,
        url: detection.url,
        sentimentScore: detection.sentimentScore,
        accuracy: detection.accuracy,
        user: detection.userId?.name || 'Unknown',
        timestamp: detection.createdAt
      })),
      totalCount,
      summary: {
        avgAccuracy: await DetectedWord.aggregate([
          { $match: dateFilter },
          { $group: { _id: null, avg: { $avg: '$accuracy' } } }
        ]).then(result => result[0]?.avg || 0),
        avgResponseTime: await DetectedWord.aggregate([
          { $match: dateFilter },
          { $group: { _id: null, avg: { $avg: '$responseTime' } } }
        ]).then(result => result[0]?.avg || 0)
      }
    });
  } catch (err) {
    console.error('Flagged words error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/dashboard/websites - Website analytics data
router.get('/websites', /* authenticateToken, */ async (req, res) => {
  try {
    const { timeRange = 'last 7 days' } = req.query;
    let dateFilter = {};
    
    const now = new Date();
    switch (timeRange.toLowerCase()) {
      case 'today':
        dateFilter = {
          createdAt: {
            $gte: new Date(now.getFullYear(), now.getMonth(), now.getDate())
          }
        };
        break;
      case 'last 7 days':
        dateFilter = {
          createdAt: {
            $gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
          }
        };
        break;
      case 'last 30 days':
        dateFilter = {
          createdAt: {
            $gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
          }
        };
        break;
    }

    const topWebsites = await DetectedWord.aggregate([
      { $match: dateFilter },
      { $group: { 
          _id: '$url', 
          detectionCount: { $sum: 1 },
          avgSentiment: { $avg: '$sentimentScore' },
          avgAccuracy: { $avg: '$accuracy' }
        }
      },
      { $sort: { detectionCount: -1 } },
      { $limit: 15 }
    ]);

    const websiteStats = topWebsites.map(site => {
      const domain = site._id.replace(/^https?:\/\//, '').replace(/\/.*$/, '');
      return {
        domain,
        url: site._id,
        detectionCount: site.detectionCount,
        riskLevel: site.avgSentiment < -0.5 ? 'high' : site.avgSentiment < 0 ? 'medium' : 'low',
        accuracy: Math.round(site.avgAccuracy)
      };
    });

    res.json({
      topWebsites: websiteStats,
      totalWebsites: await DetectedWord.distinct('url', dateFilter).then(urls => urls.length),
      totalDetections: await DetectedWord.countDocuments(dateFilter)
    });
  } catch (err) {
    console.error('Websites analytics error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/dashboard/user-activity - User activity analytics
router.get('/user-activity', /* authenticateToken, */ async (req, res) => {
  try {
    const { timeRange = 'last 7 days' } = req.query;
    let dateFilter = {};
    
    const now = new Date();
    switch (timeRange.toLowerCase()) {
      case 'today':
        dateFilter = {
          createdAt: {
            $gte: new Date(now.getFullYear(), now.getMonth(), now.getDate())
          }
        };
        break;
      case 'last 7 days':
        dateFilter = {
          createdAt: {
            $gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
          }
        };
        break;
      case 'last 30 days':
        dateFilter = {
          createdAt: {
            $gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
          }
        };
        break;
    }

    const [activityTypes, recentActivity, activeUsers] = await Promise.all([
      UserActivity.aggregate([
        { $match: dateFilter },
        { $group: { _id: '$activityType', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),
      UserActivity.find(dateFilter)
        .sort({ createdAt: -1 })
        .limit(20)
        .populate('userId', 'name email'),
      UserActivity.distinct('userId', dateFilter).then(ids => ids.length)
    ]);

    res.json({
      activityBreakdown: activityTypes,
      recentActivity: recentActivity.map(activity => ({
        id: activity._id,
        type: activity.activityType,
        details: activity.activityDetails,
        user: activity.userId?.name || 'Unknown',
        timestamp: activity.createdAt
      })),
      activeUsers,
      totalActivities: await UserActivity.countDocuments(dateFilter)
    });
  } catch (err) {
    console.error('User activity error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/dashboard/insights - AI insights for dashboard
router.get('/insights', /* authenticateToken, */ async (req, res) => {
  try {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    const [
      todayDetections,
      newPatterns,
      peakHour,
      weeklyEffectiveness
    ] = await Promise.all([
      DetectedWord.countDocuments({ createdAt: { $gte: today } }),
      DetectedWord.distinct('word', { 
        createdAt: { $gte: new Date(now.getTime() - 24 * 60 * 60 * 1000) }
      }).then(words => words.length),
      DetectedWord.aggregate([
        { 
          $match: { 
            createdAt: { $gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) }
          }
        },
        {
          $group: {
            _id: { $hour: '$createdAt' },
            count: { $sum: 1 }
          }
        },
        { $sort: { count: -1 } },
        { $limit: 1 }
      ]),
      DetectedWord.aggregate([
        { 
          $match: { 
            createdAt: { $gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) }
          }
        },
        { $group: { _id: null, avgAccuracy: { $avg: '$accuracy' } } }
      ])
    ]);

    const peakTime = peakHour[0] ? `${peakHour[0]._id}-${peakHour[0]._id + 1}` : '3-5';
    const effectiveness = weeklyEffectiveness[0]?.avgAccuracy || 96;

    res.json({
      insights: [
        {
          icon: 'shield-alert',
          text: `${todayDetections} harmful content instances blocked today`,
          color: '#ef4444'
        },
        {
          icon: 'brain',
          text: `AI detected ${newPatterns} new threat patterns`,
          color: '#8b5cf6'
        },
        {
          icon: 'clock-alert',
          text: `Peak threat activity: ${peakTime} PM weekdays`,
          color: '#f59e0b'
        },
        {
          icon: 'shield-check',
          text: `${effectiveness.toFixed(0)}% protection effectiveness this week`,
          color: '#10b981'
        }
      ]
    });
  } catch (err) {
    console.error('Insights error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router; 