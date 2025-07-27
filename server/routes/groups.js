const express = require('express');
const router = express.Router();
const Group = require('../models/Group');
const User = require('../models/User');
const auth = require('../middleware/auth');
const activityLogger = require('../middleware/activityLogger');

// Create a new group
router.post('/', auth, async (req, res) => {
  try {
    const { name, description } = req.body;
    
    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Group name is required' });
    }

    // Generate a unique 6-character code
    const generateCode = () => {
      return Math.random().toString(36).substring(2, 8).toUpperCase();
    };

    let shortCode;
    let isUnique = false;
    
    // Ensure the code is unique
    while (!isUnique) {
      shortCode = generateCode();
      const existingGroup = await Group.findOne({ shortCode });
      if (!existingGroup) {
        isUnique = true;
      }
    }

    const group = new Group({
      name: name.trim(),
      description: description?.trim() || '',
      adminId: req.user.id,
      shortCode,
      members: [{
        userId: req.user.id,
        role: 'admin',
        joinedAt: new Date()
      }]
    });

    await group.save();

    // Log group creation activity
    await activityLogger.logGroupCreated(
      group._id,
      req.user.id,
      req.user.name || req.user.username || 'Unknown User',
      group.name
    );

    res.status(201).json({
      success: true,
      group,
      message: 'Group created successfully'
    });

  } catch (error) {
    console.error('Error creating group:', error);
    res.status(500).json({ 
      message: 'Failed to create group',
      error: error.message 
    });
  }
});

// Join a group using code
router.post('/join', auth, async (req, res) => {
  try {
    const { code } = req.body;
    
    if (!code || !code.trim()) {
      return res.status(400).json({ message: 'Group code is required' });
    }

    const group = await Group.findOne({ shortCode: code.trim().toUpperCase() });
    
    if (!group) {
      return res.status(404).json({ message: 'Invalid group code' });
    }

    // Check if user is already a member
    const existingMember = group.members.find(
      member => member.userId.toString() === req.user.id.toString()
    );

    if (existingMember) {
      return res.status(400).json({ message: 'You are already a member of this group' });
    }

    // Add user to group
    group.members.push({
      userId: req.user.id,
      role: 'member',
      joinedAt: new Date()
    });

    await group.save();

    // Log member joined activity
    await activityLogger.logMemberJoined(
      group._id,
      req.user.id,
      req.user.name || req.user.username || 'Unknown User'
    );

    res.json({
      success: true,
      group: {
        id: group._id,
        name: group.name,
        description: group.description,
        memberCount: group.members.length
      },
      message: 'Successfully joined group'
    });

  } catch (error) {
    console.error('Error joining group:', error);
    res.status(500).json({ 
      message: 'Failed to join group',
      error: error.message 
    });
  }
});

// Get user's groups
router.get('/', auth, async (req, res) => {
  try {
    const groups = await Group.find({
      'members.userId': req.user.id
    }).populate('members.userId', 'name username email');

    const formattedGroups = groups.map(group => ({
      _id: group._id,
      id: group._id,
      name: group.name,
      description: group.description,
      shortCode: group.shortCode,
      adminId: group.adminId,
      memberCount: group.members.length,
      members: group.members,
      createdAt: group.createdAt,
      isAdmin: group.adminId.toString() === req.user.id.toString()
    }));

    res.json({
      success: true,
      groups: formattedGroups
    });

  } catch (error) {
    console.error('Error fetching groups:', error);
    res.status(500).json({ 
      message: 'Failed to fetch groups',
      error: error.message 
    });
  }
});

// Get specific group details
router.get('/:id', auth, async (req, res) => {
  try {
    const group = await Group.findById(req.params.id)
      .populate('members.userId', 'name username email');

    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    // Check if user is a member
    const isMember = group.members.some(
      member => member.userId._id.toString() === req.user.id.toString()
    );

    if (!isMember) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const formattedGroup = {
      _id: group._id,
      id: group._id,
      name: group.name,
      description: group.description,
      shortCode: group.shortCode,
      adminId: group.adminId,
      memberCount: group.members.length,
      members: group.members.map(member => ({
        id: member.userId._id,
        name: member.userId.name || member.userId.username,
        email: member.userId.email,
        role: member.role,
        joinedAt: member.joinedAt,
        status: 'offline' // You can implement real-time status later
      })),
      createdAt: group.createdAt,
      isAdmin: group.adminId.toString() === req.user.id.toString()
    };

    res.json({
      success: true,
      ...formattedGroup
    });

  } catch (error) {
    console.error('Error fetching group details:', error);
    res.status(500).json({ 
      message: 'Failed to fetch group details',
      error: error.message 
    });
  }
});

// Update group
router.put('/:id', auth, async (req, res) => {
  try {
    const { name, description } = req.body;
    
    const group = await Group.findById(req.params.id);
    
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    // Check if user is admin
    if (group.adminId.toString() !== req.user.id.toString()) {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const changes = {};
    if (name && name.trim() !== group.name) {
      changes.name = name.trim();
      group.name = name.trim();
    }
    
    if (description !== undefined && description.trim() !== group.description) {
      changes.description = description.trim();
      group.description = description.trim();
    }

    await group.save();

    // Log group update activity if there were changes
    if (Object.keys(changes).length > 0) {
      await activityLogger.logGroupUpdated(
        group._id,
        req.user.id,
        req.user.name || req.user.username || 'Unknown User',
        changes
      );
    }

    res.json({
      success: true,
      group,
      message: 'Group updated successfully'
    });

  } catch (error) {
    console.error('Error updating group:', error);
    res.status(500).json({ 
      message: 'Failed to update group',
      error: error.message 
    });
  }
});

// Leave group
router.post('/:id/leave', auth, async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    // Check if user is a member
    const memberIndex = group.members.findIndex(
      member => member.userId.toString() === req.user.id.toString()
    );

    if (memberIndex === -1) {
      return res.status(400).json({ message: 'You are not a member of this group' });
    }

    // Admin cannot leave if there are other members
    if (group.adminId.toString() === req.user.id.toString() && group.members.length > 1) {
      return res.status(400).json({ 
        message: 'Admin cannot leave group with other members. Transfer admin rights first or delete the group.' 
      });
    }

    // Remove user from group
    group.members.splice(memberIndex, 1);
    await group.save();

    // Log member left activity
    await activityLogger.logMemberLeft(
      group._id,
      req.user.id,
      req.user.name || req.user.username || 'Unknown User',
      'left'
    );

    res.json({
      success: true,
      message: 'Successfully left group'
    });

  } catch (error) {
    console.error('Error leaving group:', error);
    res.status(500).json({ 
      message: 'Failed to leave group',
      error: error.message 
    });
  }
});

// Delete group (admin only)
router.delete('/:id', auth, async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    // Check if user is admin
    if (group.adminId.toString() !== req.user.id.toString()) {
      return res.status(403).json({ message: 'Admin access required' });
    }

    await Group.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Group deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting group:', error);
    res.status(500).json({ 
      message: 'Failed to delete group',
      error: error.message 
    });
  }
});

module.exports = router;
