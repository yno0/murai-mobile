import bcrypt from 'bcryptjs';
import express from 'express';
import { adminAuth } from '../../middleware/authMiddleware.js';
import AdminLogs from '../../models/adminLogsMode.js';
import Report from '../../models/reportModel.js';
import UserInfo from '../../models/userInfoModel.js';
import User from '../../models/userModel.js';

const router = express.Router();

// Helper function to log admin actions
async function logAdminAction(adminId, action, activityType, targetType, targetId, details, status = 'success', errorMessage = null) {
  try {
    const adminLog = new AdminLogs({
      adminId,
      action,
      activityType,
      targetType,
      targetId,
      details,
      status,
      errorMessage
    });
    await adminLog.save();
  } catch (error) {
    console.error('Failed to log admin action:', error);
  }
}

// GET /api/admin/users - Get all users with pagination and filtering
router.get('/users', adminAuth, async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 50, 
      search = '', 
      status = '', 
      role = '',
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build filter object
    const filter = {};
    
    if (search) {
      // Handle role-specific search with @ prefix
      if (search.toLowerCase().startsWith('@admin')) {
        filter.role = 'admin';
      } else if (search.toLowerCase().startsWith('@user')) {
        filter.role = 'user';
      } else {
        // Regular search in name and email
        filter.$or = [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } }
        ];
      }
    }
    
    if (status && status !== 'all') {
      filter.status = status;
    }
    
    if (role && role !== 'all') {
      filter.role = role;
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Get users with pagination
    const users = await User.find(filter)
      .select('-password -otp') // Exclude sensitive fields
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    // Get total count for pagination
    const totalUsers = await User.countDocuments(filter);
    
    // Get user info for each user (optional additional data)
    const userIds = users.map(user => user._id);
    const userInfos = await UserInfo.find({ userId: { $in: userIds } }).lean();
    
    // Merge user info with users
    const usersWithInfo = users.map(user => {
      const userInfo = userInfos.find(info => info.userId.toString() === user._id.toString());
      return {
        ...user,
        userInfo: userInfo || null
      };
    });

    // Log admin action
    await logAdminAction(
      req.adminUser._id,
      'View Users List',
      'user',
      'system',
      null,
      `Viewed users list with filters: ${JSON.stringify({ search, status, role })}`
    );

    res.json({
      users: usersWithInfo,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalUsers / parseInt(limit)),
        totalUsers,
        hasNextPage: skip + users.length < totalUsers,
        hasPrevPage: parseInt(page) > 1
      }
    });

  } catch (error) {
    console.error('Get users error:', error);
    
    await logAdminAction(
      req.adminUser._id,
      'View Users List',
      'user',
      'system',
      null,
      'Failed to retrieve users list',
      'failed',
      error.message
    );
    
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// GET /api/admin/users/:id - Get specific user details
router.get('/users/:id', adminAuth, async (req, res) => {
  try {
    const userId = req.params.id;
    
    const user = await User.findById(userId).select('-password -otp').lean();
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get additional user info
    const userInfo = await UserInfo.findOne({ userId }).lean();
    
    const userWithInfo = {
      ...user,
      userInfo: userInfo || null
    };

    // Log admin action
    await logAdminAction(
      req.adminUser._id,
      'View User Details',
      'user',
      'user',
      userId,
      `Viewed details for user: ${user.email}`
    );

    res.json(userWithInfo);

  } catch (error) {
    console.error('Get user details error:', error);
    
    await logAdminAction(
      req.adminUser._id,
      'View User Details',
      'user',
      'user',
      req.params.id,
      'Failed to retrieve user details',
      'failed',
      error.message
    );
    
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// PUT /api/admin/users/:id - Update user (status, role, etc.)
router.put('/users/:id', adminAuth, async (req, res) => {
  try {
    const userId = req.params.id;
    const { status, role, name, email, isPremium } = req.body;
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Store original values for logging
    const originalValues = {
      status: user.status,
      role: user.role,
      name: user.name,
      email: user.email,
      isPremium: user.isPremium
    };

    // Update allowed fields
    const updates = {};
    if (status !== undefined) updates.status = status;
    if (role !== undefined) updates.role = role;
    if (name !== undefined) updates.name = name;
    if (email !== undefined) updates.email = email;
    if (isPremium !== undefined) updates.isPremium = isPremium;
    updates.updatedAt = new Date();

    // If status is being changed to active, update lastActive
    if (status === 'active' && originalValues.status !== 'active') {
      updates.lastActive = new Date();
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updates,
      { new: true, runValidators: true }
    ).select('-password -otp');

    // Log admin action
    const changes = Object.keys(updates)
      .filter(key => key !== 'updatedAt')
      .map(key => `${key}: ${originalValues[key]} → ${updates[key]}`)
      .join(', ');

    await logAdminAction(
      req.adminUser._id,
      'Update User',
      'update',
      'user',
      userId,
      `Updated user ${user.email}: ${changes}`
    );

    res.json({
      message: 'User updated successfully',
      user: updatedUser
    });

  } catch (error) {
    console.error('Update user error:', error);
    
    await logAdminAction(
      req.adminUser._id,
      'Update User',
      'update',
      'user',
      req.params.id,
      'Failed to update user',
      'failed',
      error.message
    );
    
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Email already exists' });
    }
    
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// POST /api/admin/users - Create new user
router.post('/users', adminAuth, async (req, res) => {
  try {
    const { name, email, password, role = 'user', status = 'active', isPremium = false } = req.body;
    
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = new User({
      name,
      email,
      password: hashedPassword,
      role,
      status,
      isPremium,
      isVerified: true, // Admin-created users are auto-verified
      createdAt: new Date(),
      updatedAt: new Date()
    });

    await user.save();

    // Remove password from response
    const userResponse = user.toObject();
    delete userResponse.password;
    delete userResponse.otp;

    // Log admin action
    await logAdminAction(
      req.adminUser._id,
      'Create User',
      'user',
      'user',
      user._id,
      `Created new user: ${email} with role: ${role}`
    );

    res.status(201).json({
      message: 'User created successfully',
      user: userResponse
    });

  } catch (error) {
    console.error('Create user error:', error);
    
    await logAdminAction(
      req.adminUser._id,
      'Create User',
      'user',
      'user',
      null,
      'Failed to create user',
      'failed',
      error.message
    );
    
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// DELETE /api/admin/users/:id - Delete user (soft delete by setting status to suspended)
router.delete('/users/:id', adminAuth, async (req, res) => {
  try {
    const userId = req.params.id;
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Prevent admin from deleting themselves
    if (userId === req.adminUser._id.toString()) {
      return res.status(400).json({ message: 'Cannot delete your own account' });
    }

    // Soft delete by setting status to suspended
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { 
        status: 'suspended',
        updatedAt: new Date()
      },
      { new: true }
    ).select('-password -otp');

    // Log admin action
    await logAdminAction(
      req.adminUser._id,
      'Delete User',
      'user',
      'user',
      userId,
      `Suspended user: ${user.email}`
    );

    res.json({
      message: 'User suspended successfully',
      user: updatedUser
    });

  } catch (error) {
    console.error('Delete user error:', error);
    
    await logAdminAction(
      req.adminUser._id,
      'Delete User',
      'user',
      'user',
      req.params.id,
      'Failed to suspend user',
      'failed',
      error.message
    );
    
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ===== REPORTS MANAGEMENT ROUTES =====

// GET /api/admin/reports - Get all reports with pagination and filtering
router.get('/reports', adminAuth, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 50,
      search = '',
      status = '',
      type = '',
      category = '',
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build filter object
    const filter = {};

    if (search) {
      filter.$or = [
        { reportedText: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } }
      ];
    }

    if (status && status !== 'all') {
      filter.status = status;
    }

    if (type && type !== 'all') {
      filter.type = type;
    }

    if (category && category !== 'all') {
      filter.category = category;
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Get reports with pagination and populate user data
    const reports = await Report.find(filter)
      .populate('userId', 'name email')
      .populate('reviewedBy', 'name email')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    // Get total count for pagination
    const totalReports = await Report.countDocuments(filter);

    // Log admin action
    await logAdminAction(
      req.adminUser._id,
      'View Reports List',
      'report',
      'system',
      null,
      `Viewed reports list with filters: ${JSON.stringify({ search, status, type, category })}`
    );

    res.json({
      reports,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalReports / parseInt(limit)),
        totalReports,
        hasNextPage: skip + reports.length < totalReports,
        hasPrevPage: parseInt(page) > 1
      }
    });

  } catch (error) {
    console.error('Get reports error:', error);

    await logAdminAction(
      req.adminUser._id,
      'View Reports List',
      'report',
      'system',
      null,
      'Failed to retrieve reports list',
      'failed',
      error.message
    );

    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// GET /api/admin/reports/:id - Get specific report details
router.get('/reports/:id', adminAuth, async (req, res) => {
  try {
    const reportId = req.params.id;

    const report = await Report.findById(reportId)
      .populate('userId', 'name email')
      .populate('reviewedBy', 'name email')
      .lean();

    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    // Log admin action
    await logAdminAction(
      req.adminUser._id,
      'View Report Details',
      'report',
      'report',
      reportId,
      `Viewed details for report: ${reportId}`
    );

    res.json(report);

  } catch (error) {
    console.error('Get report details error:', error);

    await logAdminAction(
      req.adminUser._id,
      'View Report Details',
      'report',
      'report',
      req.params.id,
      'Failed to retrieve report details',
      'failed',
      error.message
    );

    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// PUT /api/admin/reports/:id - Update report status and details
router.put('/reports/:id', adminAuth, async (req, res) => {
  try {
    const reportId = req.params.id;
    const { status, reviewedBy, description, category } = req.body;

    const report = await Report.findById(reportId);
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    // Store original values for logging
    const originalValues = {
      status: report.status,
      reviewedBy: report.reviewedBy,
      description: report.description,
      category: report.category
    };

    // Update allowed fields
    const updates = {};
    if (status !== undefined) {
      updates.status = status;
      if (status === 'resolved' || status === 'in_progress') {
        updates.reviewedBy = req.adminUser._id;
        updates.reviewedAt = new Date();
      }
    }
    if (description !== undefined) updates.description = description;
    if (category !== undefined) updates.category = category;
    updates.updatedAt = new Date();

    const updatedReport = await Report.findByIdAndUpdate(
      reportId,
      updates,
      { new: true, runValidators: true }
    ).populate('userId', 'name email').populate('reviewedBy', 'name email');

    // Log admin action
    const changes = Object.keys(updates)
      .filter(key => key !== 'updateAt')
      .map(key => `${key}: ${originalValues[key]} → ${updates[key]}`)
      .join(', ');

    await logAdminAction(
      req.adminUser._id,
      'Update Report',
      'update',
      'report',
      reportId,
      `Updated report ${reportId}: ${changes}`
    );

    res.json({
      message: 'Report updated successfully',
      report: updatedReport
    });

  } catch (error) {
    console.error('Update report error:', error);

    await logAdminAction(
      req.adminUser._id,
      'Update Report',
      'update',
      'report',
      req.params.id,
      'Failed to update report',
      'failed',
      error.message
    );

    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ===== PROFILE MANAGEMENT ROUTES =====

// GET /api/admin/profile - Get current admin profile
router.get('/profile', adminAuth, async (req, res) => {
  try {
    const adminId = req.adminUser._id;

    // Get admin user with additional profile information
    const adminProfile = await User.findById(adminId)
      .select('-password')
      .lean();

    if (!adminProfile) {
      return res.status(404).json({ message: 'Admin profile not found' });
    }

    // Get additional profile info if exists
    const profileInfo = await UserInfo.findOne({ userId: adminId }).lean();

    // Combine user and profile info
    const fullProfile = {
      ...adminProfile,
      ...profileInfo,
      // Ensure we have default values for admin-specific fields
      department: profileInfo?.department || 'Administration',
      position: profileInfo?.position || 'System Administrator',
      employeeId: profileInfo?.employeeId || `ADM${adminId.toString().slice(-3)}`,
    };

    // Log admin action
    await logAdminAction(
      adminId,
      'View Profile',
      'profile',
      'profile',
      adminId,
      'Viewed own profile information'
    );

    res.json(fullProfile);

  } catch (error) {
    console.error('Get admin profile error:', error);

    await logAdminAction(
      req.adminUser._id,
      'View Profile',
      'profile',
      'profile',
      req.adminUser._id,
      'Failed to retrieve profile information',
      'failed',
      error.message
    );

    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// PUT /api/admin/profile - Update admin profile
router.put('/profile', adminAuth, async (req, res) => {
  try {
    const adminId = req.adminUser._id;
    const {
      name,
      email,
      phone,
      address,
      emergencyContact,
      emergencyPhone,
      // Admin-specific fields (read-only from frontend but can be updated by super admin)
      department,
      position,
      employeeId
    } = req.body;

    // Validate required fields
    if (!name || !email) {
      return res.status(400).json({ message: 'Name and email are required' });
    }

    // Check if email is already taken by another user
    const existingUser = await User.findOne({
      email: email.toLowerCase(),
      _id: { $ne: adminId }
    });

    if (existingUser) {
      return res.status(400).json({ message: 'Email is already in use by another user' });
    }

    // Store original values for logging
    const originalUser = await User.findById(adminId).select('-password').lean();
    const originalInfo = await UserInfo.findOne({ userId: adminId }).lean();

    // Update user basic information
    const updatedUser = await User.findByIdAndUpdate(
      adminId,
      {
        name: name.trim(),
        email: email.toLowerCase().trim(),
        updatedAt: new Date()
      },
      { new: true, runValidators: true }
    ).select('-password');

    // Update or create extended profile information
    const profileUpdateData = {
      userId: adminId,
      phone: phone?.trim() || '',
      address: address?.trim() || '',
      emergencyContact: emergencyContact?.trim() || '',
      emergencyPhone: emergencyPhone?.trim() || '',
      department: department || 'Administration',
      position: position || 'System Administrator',
      employeeId: employeeId || `ADM${adminId.toString().slice(-3)}`,
      updatedAt: new Date()
    };

    const updatedInfo = await UserInfo.findOneAndUpdate(
      { userId: adminId },
      profileUpdateData,
      { new: true, upsert: true, runValidators: true }
    );

    // Combine updated data
    const fullProfile = {
      ...updatedUser.toObject(),
      ...updatedInfo.toObject()
    };

    // Log the changes
    const changes = [];
    if (originalUser.name !== name) changes.push(`name: ${originalUser.name} → ${name}`);
    if (originalUser.email !== email) changes.push(`email: ${originalUser.email} → ${email}`);
    if ((originalInfo?.phone || '') !== (phone || '')) changes.push(`phone: ${originalInfo?.phone || 'empty'} → ${phone || 'empty'}`);
    if ((originalInfo?.address || '') !== (address || '')) changes.push(`address updated`);
    if ((originalInfo?.emergencyContact || '') !== (emergencyContact || '')) changes.push(`emergency contact updated`);

    await logAdminAction(
      adminId,
      'Update Profile',
      'update',
      'profile',
      adminId,
      `Updated profile: ${changes.length > 0 ? changes.join(', ') : 'no changes detected'}`
    );

    res.json({
      message: 'Profile updated successfully',
      profile: fullProfile
    });

  } catch (error) {
    console.error('Update admin profile error:', error);

    await logAdminAction(
      req.adminUser._id,
      'Update Profile',
      'update',
      'profile',
      req.adminUser._id,
      'Failed to update profile',
      'failed',
      error.message
    );

    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// GET /api/admin/profile/activity - Get admin activity logs
router.get('/profile/activity', adminAuth, async (req, res) => {
  try {
    const adminId = req.adminUser._id;
    const { page = 1, limit = 20 } = req.query;

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get admin's activity logs
    const activities = await AdminLogs.find({ adminId })
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    // Get total count
    const totalActivities = await AdminLogs.countDocuments({ adminId });

    // Log this action
    await logAdminAction(
      adminId,
      'View Activity Logs',
      'profile',
      'logs',
      adminId,
      `Viewed activity logs (page ${page})`
    );

    res.json({
      activities,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalActivities / parseInt(limit)),
        totalActivities,
        hasNextPage: skip + activities.length < totalActivities,
        hasPrevPage: parseInt(page) > 1
      }
    });

  } catch (error) {
    console.error('Get admin activity error:', error);

    await logAdminAction(
      req.adminUser._id,
      'View Activity Logs',
      'profile',
      'logs',
      req.adminUser._id,
      'Failed to retrieve activity logs',
      'failed',
      error.message
    );

    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;
