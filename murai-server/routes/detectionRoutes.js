import express from 'express';
import mysql from 'mysql2/promise';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// Database connection (you may want to move this to a separate config file)
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'murai_db'
};

const db = mysql.createPool(dbConfig);

// Report detection endpoint
router.post('/report', authenticateToken, async (req, res) => {
  try {
    const {
      type,
      content,
      reason,
      comment,
      context,
      termsCount,
      language,
      sensitivity,
      url,
      userAgent,
      domain,
      timestamp
    } = req.body;

    const userId = req.user.id;
    const userEmail = req.user.email;

    // Insert detection report into database
    const query = `
      INSERT INTO detection_reports (
        user_id,
        user_email,
        type,
        content,
        reason,
        comment,
        context,
        terms_count,
        language,
        sensitivity,
        url,
        user_agent,
        domain,
        timestamp,
        created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
    `;

    const values = [
      userId,
      userEmail,
      type,
      content,
      reason || null,
      comment || null,
      context || null,
      termsCount || null,
      language || null,
      sensitivity || null,
      url,
      userAgent || null,
      domain || null,
      timestamp
    ];

    const [result] = await db.execute(query, values);

    console.log('Detection report saved:', {
      reportId: result.insertId,
      userId,
      type,
      content: content?.substring(0, 50) + '...',
      url: domain
    });

    res.status(201).json({
      success: true,
      message: 'Detection report saved successfully',
      reportId: result.insertId
    });

  } catch (error) {
    console.error('Error saving detection report:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to save detection report',
      error: error.message
    });
  }
});

// Get detection reports for admin
router.get('/reports', authenticateToken, async (req, res) => {
  try {
    // Check if user is admin (you may want to add admin middleware)
    const { page = 1, limit = 50, type, userId } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT 
        dr.*,
        u.name as user_name
      FROM detection_reports dr
      LEFT JOIN users u ON dr.user_id = u.id
      WHERE 1=1
    `;
    
    const values = [];

    if (type) {
      query += ' AND dr.type = ?';
      values.push(type);
    }

    if (userId) {
      query += ' AND dr.user_id = ?';
      values.push(userId);
    }

    query += ' ORDER BY dr.created_at DESC LIMIT ? OFFSET ?';
    values.push(parseInt(limit), parseInt(offset));

    const [reports] = await db.execute(query, values);

    // Get total count
    let countQuery = 'SELECT COUNT(*) as total FROM detection_reports WHERE 1=1';
    const countValues = [];

    if (type) {
      countQuery += ' AND type = ?';
      countValues.push(type);
    }

    if (userId) {
      countQuery += ' AND user_id = ?';
      countValues.push(userId);
    }

    const [countResult] = await db.execute(countQuery, countValues);
    const total = countResult[0].total;

    res.json({
      success: true,
      data: {
        reports,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error('Error fetching detection reports:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch detection reports',
      error: error.message
    });
  }
});

// Get detection statistics
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const { timeframe = '7d' } = req.query;
    
    let dateFilter = '';
    switch (timeframe) {
      case '24h':
        dateFilter = 'AND created_at >= DATE_SUB(NOW(), INTERVAL 1 DAY)';
        break;
      case '7d':
        dateFilter = 'AND created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)';
        break;
      case '30d':
        dateFilter = 'AND created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)';
        break;
      default:
        dateFilter = 'AND created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)';
    }

    // Total detections
    const [totalResult] = await db.execute(`
      SELECT COUNT(*) as total FROM detection_reports WHERE 1=1 ${dateFilter}
    `);

    // Detections by type
    const [typeResult] = await db.execute(`
      SELECT type, COUNT(*) as count 
      FROM detection_reports 
      WHERE 1=1 ${dateFilter}
      GROUP BY type
    `);

    // Top domains
    const [domainResult] = await db.execute(`
      SELECT domain, COUNT(*) as count 
      FROM detection_reports 
      WHERE domain IS NOT NULL ${dateFilter}
      GROUP BY domain 
      ORDER BY count DESC 
      LIMIT 10
    `);

    // Daily trend
    const [trendResult] = await db.execute(`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as count
      FROM detection_reports 
      WHERE 1=1 ${dateFilter}
      GROUP BY DATE(created_at)
      ORDER BY date DESC
    `);

    res.json({
      success: true,
      data: {
        total: totalResult[0].total,
        byType: typeResult,
        topDomains: domainResult,
        dailyTrend: trendResult,
        timeframe
      }
    });

  } catch (error) {
    console.error('Error fetching detection stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch detection statistics',
      error: error.message
    });
  }
});

export default router;
