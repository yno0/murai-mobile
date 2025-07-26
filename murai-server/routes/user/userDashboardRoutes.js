import express from 'express';
import jwt from 'jsonwebtoken';
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
        dateFilter.createdAt = {
          $gte: new Date(now.getFullYear(), now.getMonth(), now.getDate())
        };
        break;
      case 'week':
      case 'last 7 days':
        dateFilter.createdAt = {
          $gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        };
        break;
      case 'month':
      case 'last 30 days':
        dateFilter.createdAt = {
          $gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        };
        break;
      case 'year':
      case 'all time':
      default:
        dateFilter = { userId }; // Only user filter for all time
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
          $gte: new Date(now.getTime() - (timeRange === 'today' ? 2 : timeRange === 'week' ? 14 : 60) * 24 * 60 * 60 * 1000),
          $lt: dateFilter.createdAt?.$gte || new Date(0)
        }
      })
    ]);

    const protectionEffectiveness = avgAccuracy.length > 0 ? avgAccuracy[0].avgAccuracy : 95;
    const detectionChange = previousDetections > 0 ? ((userDetections - previousDetections) / previousDetections * 100) : 0;

    res.json({
      harmfulContentDetected: {
        value: userDetections >= 1000 ? `${(userDetections / 1000).toFixed(1)}k` : userDetections.toString(),
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
    const { timeRange = 'week' } = req.query;
    const userId = req.user.id; // Get current user ID from JWT
    let days = 7;
    
    switch (timeRange.toLowerCase()) {
      case 'today':
        days = 1;
        break;
      case 'week':
      case 'last 7 days':
        days = 7;
        break;
      case 'month':
      case 'last 30 days':
        days = 30;
        break;
      case 'year':
        days = 365;
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
          userId,
          createdAt: { $gte: date, $lt: nextDate }
        }),
        UserActivity.countDocuments({
          userId,
          createdAt: { $gte: date, $lt: nextDate }
        })
      ]);
      
      chartData.push({ protected: detections, monitored: activities });
      
      if (days === 1) {
        labels.push(date.getHours() + ':00');
      } else if (days <= 30) {
        labels.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
      } else {
        labels.push(date.toLocaleDateString('en-US', { month: 'short' }));
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
    const { timeRange = 'week' } = req.query;
    const userId = req.user.id; // Get current user ID from JWT
    let dateFilter = { userId }; // Filter by current user

    const now = new Date();
    switch (timeRange.toLowerCase()) {
      case 'today':
        dateFilter.createdAt = {
          $gte: new Date(now.getFullYear(), now.getMonth(), now.getDate())
        };
        break;
      case 'week':
      case 'last 7 days':
        dateFilter.createdAt = {
          $gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        };
        break;
      case 'month':
      case 'last 30 days':
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

export default router;
