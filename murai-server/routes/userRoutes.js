import bcrypt from 'bcryptjs';
import express from 'express';
import jwt from 'jsonwebtoken';
import GroupCode from '../models/groupCode.js';
import Group from '../models/groupModel.js';
import GroupMember from '../models/groupUserModel.js';
import Preference from '../models/preferenceModel.js';
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

// GET /api/users/me
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('name email');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ id: user._id, name: user.name, email: user.email });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/users/preferences
router.get('/preferences', authenticateToken, async (req, res) => {
  try {
    const pref = await Preference.findOne({ userId: req.user.id });
    if (!pref) return res.status(404).json({ message: 'Preferences not found' });
    res.json(pref);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/users/preferences
router.put('/preferences', authenticateToken, async (req, res) => {
  try {
    const update = req.body;
    let pref = await Preference.findOne({ userId: req.user.id });
    if (!pref) {
      pref = new Preference({ userId: req.user.id, ...update });
    } else {
      Object.assign(pref, update);
      pref.updatedAt = new Date();
    }
    await pref.save();
    res.json(pref);
  } catch (err) {
    console.error('Preference save error:', err); // Log the real error
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// GET /api/users/active-time
router.get('/active-time', authenticateToken, async (req, res) => {
  try {
    const pref = await Preference.findOne({ userId: req.user.id });
    if (!pref) return res.status(404).json({ message: 'Preferences not found' });
    
    // Calculate current session time
    const now = new Date();
    const sessionStart = new Date(pref.sessionStartTime);
    const sessionMinutes = Math.floor((now - sessionStart) / (1000 * 60));
    
    // Total active time including current session
    const totalActiveMinutes = pref.totalActiveTime + sessionMinutes;
    
    // Format time for display
    const hours = Math.floor(totalActiveMinutes / 60);
    const minutes = totalActiveMinutes % 60;
    const formattedTime = `${hours}h ${minutes}m`;
    
    res.json({
      totalActiveTime: formattedTime,
      totalMinutes: totalActiveMinutes,
      sessionStartTime: pref.sessionStartTime,
      lastActiveStart: pref.lastActiveStart
    });
  } catch (err) {
    console.error('Active time error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/users/start-session
router.post('/start-session', authenticateToken, async (req, res) => {
  try {
    let pref = await Preference.findOne({ userId: req.user.id });
    if (!pref) {
      pref = new Preference({ userId: req.user.id });
    }
    
    pref.sessionStartTime = new Date();
    pref.lastActiveStart = new Date();
    await pref.save();
    
    res.json({ message: 'Session started', sessionStartTime: pref.sessionStartTime });
  } catch (err) {
    console.error('Start session error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/users/stop-session
router.post('/stop-session', authenticateToken, async (req, res) => {
  try {
    const pref = await Preference.findOne({ userId: req.user.id });
    if (!pref) return res.status(404).json({ message: 'Preferences not found' });
    
    const now = new Date();
    const sessionStart = new Date(pref.sessionStartTime);
    const sessionMinutes = Math.floor((now - sessionStart) / (1000 * 60));
    
    // Add session time to total
    pref.totalActiveTime += sessionMinutes;
    pref.sessionStartTime = now; // Reset session start
    await pref.save();
    
    res.json({ 
      message: 'Session stopped', 
      sessionMinutes,
      totalActiveTime: pref.totalActiveTime
    });
  } catch (err) {
    console.error('Stop session error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/users/groups - create a new group
router.post('/groups', authenticateToken, async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name) return res.status(400).json({ message: 'Group name is required' });
    const group = new Group({
      name,
      description,
      userId: req.user.id,
    });
    await group.save();
    // Generate a unique group code
    const code = Math.random().toString(36).substr(2, 6).toUpperCase();
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days from now
    const groupCode = new GroupCode({ groupId: group._id, code, expiresAt });
    await groupCode.save();
    // Attach code to group object for response
    const groupObj = group.toObject();
    groupObj.shortCode = code;
    groupObj.createdAt = groupObj.createAt; // Alias for frontend compatibility
    res.status(201).json(groupObj);
  } catch (err) {
    console.error('Create group error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// GET /api/users/groups - list groups the user is a member of or created
router.get('/groups', authenticateToken, async (req, res) => {
  try {
    // Find groups where user is creator
    const createdGroups = await Group.find({ userId: req.user.id });
    // Find groups where user is a member
    const memberLinks = await GroupMember.find({ userId: req.user.id });
    const memberGroupIds = memberLinks.map(link => link.groupId);
    const memberGroups = await Group.find({ _id: { $in: memberGroupIds } });
    // Merge and deduplicate
    const allGroups = [...createdGroups, ...memberGroups].filter((group, idx, arr) =>
      arr.findIndex(g => g._id.toString() === group._id.toString()) === idx
    );
    // Attach code and createdAt alias for each group
    const groupsWithCode = await Promise.all(allGroups.map(async (group) => {
      const groupObj = group.toObject();
      groupObj.createdAt = groupObj.createAt;
      const groupCode = await GroupCode.findOne({ groupId: group._id });
      groupObj.shortCode = groupCode ? groupCode.code : '';
      return groupObj;
    }));
    res.json(groupsWithCode);
  } catch (err) {
    console.error('List groups error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// GET /api/users/groups/:id - get group details
router.get('/groups/:id', authenticateToken, async (req, res) => {
  try {
    const groupId = req.params.id;
    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ message: 'Group not found' });
    // Get group code
    const groupCode = await GroupCode.findOne({ groupId: group._id });
    // Get members
    const memberLinks = await GroupMember.find({ groupId: group._id });
    const userIds = memberLinks.map(link => link.userId);
    const users = await User.find({ _id: { $in: userIds } });
    // Build members array
    const members = users.map(user => {
      const link = memberLinks.find(l => l.userId.toString() === user._id.toString());
      return {
        id: user._id,
        name: user.name,
        role: group.userId.toString() === user._id.toString() ? 'admin' : 'member',
        joinedAt: link ? link.joinedAt : group.createAt,
      };
    });
    // Add admin (creator) if not in members
    if (!members.find(m => m.id.toString() === group.userId.toString())) {
      const adminUser = await User.findById(group.userId);
      if (adminUser) {
        members.unshift({
          id: adminUser._id,
          name: adminUser.name,
          role: 'admin',
          joinedAt: group.createAt,
        });
      }
    }
    res.json({
      id: group._id,
      name: group.name,
      shortCode: groupCode ? groupCode.code : '',
      createdAt: group.createAt,
      members,
      adminId: group.userId // Add this line
    });
  } catch (err) {
    console.error('Get group details error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// PUT /api/users/groups/:id - update group name (admin only)
router.put('/groups/:id', authenticateToken, async (req, res) => {
  try {
    const groupId = req.params.id;
    const { name } = req.body;
    if (!name) return res.status(400).json({ message: 'Group name is required' });
    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ message: 'Group not found' });
    if (group.userId.toString() !== req.user.id) return res.status(403).json({ message: 'Only the group admin can update the group' });
    group.name = name;
    await group.save();
    res.json({ message: 'Group name updated', group });
  } catch (err) {
    console.error('Update group error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// DELETE /api/users/groups/:id - delete group (admin only)
router.delete('/groups/:id', authenticateToken, async (req, res) => {
  try {
    const groupId = req.params.id;
    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ message: 'Group not found' });
    if (group.userId.toString() !== req.user.id) return res.status(403).json({ message: 'Only the group admin can delete the group' });
    await GroupMember.deleteMany({ groupId });
    await GroupCode.deleteMany({ groupId });
    await group.deleteOne();
    res.json({ message: 'Group deleted' });
  } catch (err) {
    console.error('Delete group error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// DELETE /api/users/groups/:id/members/:userId - remove member (admin only)
router.delete('/groups/:id/members/:userId', authenticateToken, async (req, res) => {
  try {
    const groupId = req.params.id;
    const userId = req.params.userId;
    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ message: 'Group not found' });
    if (group.userId.toString() !== req.user.id) return res.status(403).json({ message: 'Only the group admin can remove members' });
    await GroupMember.deleteOne({ groupId, userId });
    res.json({ message: 'Member removed' });
  } catch (err) {
    console.error('Remove member error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// POST /api/users/groups/join - join a group by code
router.post('/groups/join', authenticateToken, async (req, res) => {
  try {
    const { code } = req.body;
    if (!code) return res.status(400).json({ message: 'Group code is required' });
    // Find group by code
    const groupCode = await GroupCode.findOne({ code });
    if (!groupCode) return res.status(404).json({ message: 'Invalid group code' });
    const groupId = groupCode.groupId;
    // Check if already a member
    const existing = await GroupMember.findOne({ userId: req.user.id, groupId });
    if (existing) return res.status(400).json({ message: 'Already a member of this group' });
    // Add membership
    const member = new GroupMember({ userId: req.user.id, groupId });
    await member.save();
    // Return group info
    const group = await Group.findById(groupId);
    res.json(group);
  } catch (err) {
    console.error('Join group error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Change password endpoint
router.post('/change-password', authenticateToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Current and new password required' });
    }
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) return res.status(401).json({ message: 'Current password is incorrect' });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

export default router; 