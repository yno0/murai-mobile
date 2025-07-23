import express from 'express';
import jwt from 'jsonwebtoken';
import Notification from '../models/notificationModel.js';

const router = express.Router();

// Middleware to authenticate JWT (reuse from userRoutes if needed)
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

// Get all notifications for the logged-in user
router.get('/', /* authenticateToken, */ async (req, res) => {
  try {
    // For demo purposes, return all notifications (in production, filter by user)
    const notifications = await Notification.find({}).sort({ createdAt: -1 }).limit(20);
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Mark a notification as read
router.put('/:id/read', /* authenticateToken, */ async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id },
      { isRead: true },
      { new: true }
    );
    if (!notification) return res.status(404).json({ message: 'Notification not found' });
    res.json(notification);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Create a notification (for testing/admin)
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { title, message, type = 'info' } = req.body;
    const notification = new Notification({
      userId: req.user.id,
      title,
      message,
      type,
    });
    await notification.save();
    res.status(201).json(notification);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Test endpoint to get notifications without authentication (for development)
router.get('/test', async (req, res) => {
  try {
    const notifications = await Notification.find({}).sort({ createdAt: -1 }).limit(10);
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;