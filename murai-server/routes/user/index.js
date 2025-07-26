import express from 'express';
import userRoutes from './userRoutes.js';
import userDashboardRoutes from './userDashboardRoutes.js';

const router = express.Router();

// User-specific routes
router.use('/users', userRoutes);
router.use('/user-dashboard', userDashboardRoutes);

export default router;
