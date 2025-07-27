const GroupActivity = require('../models/GroupActivity');

// Middleware to automatically log group activities
const activityLogger = {
  // Log when a user joins a group
  logMemberJoined: async (groupId, userId, userName, invitedBy = null) => {
    try {
      const message = invitedBy 
        ? `${userName} joined the group (invited by ${invitedBy})`
        : `${userName} joined the group`;
        
      await GroupActivity.recordActivity(
        groupId,
        'member_joined',
        message,
        userId,
        userName,
        { invitedBy }
      );
    } catch (error) {
      console.error('Error logging member joined activity:', error);
    }
  },

  // Log when a user leaves a group
  logMemberLeft: async (groupId, userId, userName, reason = 'left') => {
    try {
      const message = reason === 'removed' 
        ? `${userName} was removed from the group`
        : `${userName} left the group`;
        
      await GroupActivity.recordActivity(
        groupId,
        reason === 'removed' ? 'member_removed' : 'member_left',
        message,
        userId,
        userName,
        { reason }
      );
    } catch (error) {
      console.error('Error logging member left activity:', error);
    }
  },

  // Log when a group is created
  logGroupCreated: async (groupId, userId, userName, groupName) => {
    try {
      await GroupActivity.recordActivity(
        groupId,
        'group_created',
        `Group "${groupName}" was created`,
        userId,
        userName,
        { groupName }
      );
    } catch (error) {
      console.error('Error logging group created activity:', error);
    }
  },

  // Log when group settings are updated
  logGroupUpdated: async (groupId, userId, userName, changes) => {
    try {
      const changeDescriptions = [];
      
      if (changes.name) {
        changeDescriptions.push(`name changed to "${changes.name}"`);
      }
      if (changes.description) {
        changeDescriptions.push('description updated');
      }
      if (changes.settings) {
        changeDescriptions.push('settings updated');
      }
      
      const message = changeDescriptions.length > 0 
        ? `Group ${changeDescriptions.join(', ')}`
        : 'Group was updated';
        
      await GroupActivity.recordActivity(
        groupId,
        'group_updated',
        message,
        userId,
        userName,
        changes
      );
    } catch (error) {
      console.error('Error logging group updated activity:', error);
    }
  },

  // Log when a member is promoted/demoted
  logMemberRoleChanged: async (groupId, targetUserId, targetUserName, newRole, changedBy, changedByName) => {
    try {
      const message = newRole === 'admin' 
        ? `${targetUserName} was promoted to admin by ${changedByName}`
        : `${targetUserName} was demoted by ${changedByName}`;
        
      await GroupActivity.recordActivity(
        groupId,
        newRole === 'admin' ? 'member_promoted' : 'member_demoted',
        message,
        changedBy,
        changedByName,
        { targetUserId, targetUserName, newRole }
      );
    } catch (error) {
      console.error('Error logging member role change activity:', error);
    }
  },

  // Log content detection/flagging
  logContentFlagged: async (groupId, userId, userName, content, reason) => {
    try {
      await GroupActivity.recordActivity(
        groupId,
        'content_flagged',
        `Content flagged: ${reason}`,
        userId,
        userName,
        { content: content.substring(0, 100), reason }
      );
    } catch (error) {
      console.error('Error logging content flagged activity:', error);
    }
  },

  // Log warning issued
  logWarningIssued: async (groupId, targetUserId, targetUserName, issuedBy, issuedByName, reason) => {
    try {
      await GroupActivity.recordActivity(
        groupId,
        'warning_issued',
        `Warning issued to ${targetUserName} for ${reason}`,
        issuedBy,
        issuedByName,
        { targetUserId, targetUserName, reason }
      );
    } catch (error) {
      console.error('Error logging warning issued activity:', error);
    }
  },

  // Log report generation
  logReportGenerated: async (groupId, userId, userName, reportType) => {
    try {
      await GroupActivity.recordActivity(
        groupId,
        'report_generated',
        `${reportType} report was generated`,
        userId,
        userName,
        { reportType }
      );
    } catch (error) {
      console.error('Error logging report generated activity:', error);
    }
  },

  // Generic activity logger
  logActivity: async (groupId, type, message, userId, userName, metadata = {}) => {
    try {
      await GroupActivity.recordActivity(
        groupId,
        type,
        message,
        userId,
        userName,
        metadata
      );
    } catch (error) {
      console.error('Error logging activity:', error);
    }
  }
};

module.exports = activityLogger;
