import jwt from 'jsonwebtoken';
import User from '../models/userModel.js';

// Middleware to authenticate JWT token
export function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET_KEY, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
}

// Middleware to check if user has admin role
export async function requireAdmin(req, res, next) {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    // Attach full user object to request for logging purposes
    req.adminUser = user;
    next();
  } catch (error) {
    console.error('Admin authorization error:', error);
    return res.status(500).json({ message: 'Server error during authorization' });
  }
}

// Combined middleware for admin routes
export function adminAuth(req, res, next) {
  authenticateToken(req, res, (err) => {
    if (err) return;
    requireAdmin(req, res, next);
  });
}