import express from 'express';
import adminRoutes from './admin/index.js';
import userRoutes from './user/index.js';
import authRoutes from './authRoutes.js';
import notificationRoutes from './notificationRoutes.js';

const router = express.Router();

// Authentication routes (shared)
router.use('/auth', authRoutes);

// Notification routes (shared)
router.use('/notifications', notificationRoutes);

// User-specific routes
router.use('/', userRoutes);

// Admin-specific routes
router.use('/', adminRoutes);

export default router;
