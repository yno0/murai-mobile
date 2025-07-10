import { ID, Permission, Query, Role } from 'react-native-appwrite';
import { DATABASE_ID, GROUPS_COLLECTION_ID, GROUP_MEMBERS_COLLECTION_ID, account, databases, teams } from '../lib/appwrite-config';

// --- Helper Function ---
function generateShortCode(length = 6) {
  const chars = 'ABCDEFGHIJKLMNPQRSTUVWXYZ123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

class GroupService {
  // Create a new group with a unique short code
  async createGroup(name) {
    let teamId = null;
    let groupId = null;
    
    try {
      const user = await account.get();
      const userId = user.$id;

      // 1. Create an Appwrite Team for the group
      const team = await teams.create(ID.unique(), name, ['owner']);
      teamId = team.$id;
      console.log('Created team with ID:', teamId);

      // 2. Create the group document with the new teamId
      const shortCode = generateShortCode();
      const groupData = {
        name,
        shortCode,
        createdBy: userId,
        teamId, // Store the team ID
        createdAt: new Date().toISOString(), // Add creation timestamp
      };

      // 3. Set permissions based on the team
      const groupPermissions = [
        Permission.read(Role.team(teamId)), // Any team member can read the group doc
        Permission.update(Role.team(teamId, 'owner')), // Only owners can update it
        Permission.delete(Role.team(teamId, 'owner')), // Only owners can delete it
      ];

      const groupDocument = await databases.createDocument(
        DATABASE_ID,
        GROUPS_COLLECTION_ID,
        ID.unique(), // Let Appwrite generate group ID
        groupData,
        groupPermissions
      );
      groupId = groupDocument.$id;
      console.log('Created group document with ID:', groupId);

      // 4. Add the creator to our custom group_members collection
      const membershipData = {
        groupId,
        userId,
        role: 'admin', // Creator is admin
        joinedAt: new Date().toISOString(),
      };

      const membershipPermissions = [
        Permission.read(Role.team(teamId)),
        Permission.delete(Role.team(teamId, 'owner')), // Team owner can remove member
      ];

      await databases.createDocument(
        DATABASE_ID,
        GROUP_MEMBERS_COLLECTION_ID,
        ID.unique(),
        membershipData,
        membershipPermissions
      );

      console.log('Successfully created group with team integration');
      return groupDocument;
    } catch (error) {
      console.error('Error creating group:', error);
      
      // Clean up if something went wrong
      try {
        if (groupId) {
          console.log('Cleaning up group document due to error');
          await databases.deleteDocument(DATABASE_ID, GROUPS_COLLECTION_ID, groupId);
        }
        if (teamId) {
          console.log('Cleaning up team due to error');
          await teams.delete(teamId);
        }
      } catch (cleanupError) {
        console.error('Error during cleanup:', cleanupError);
      }
      
      throw error;
    }
  }

  // Join a group using its short code
  async joinGroup(shortCode) {
    try {
      const user = await account.get();
      const userId = user.$id;

      // 1. Find group by shortCode to get its teamId
      const groupList = await databases.listDocuments(
        DATABASE_ID,
        GROUPS_COLLECTION_ID,
        [Query.equal('shortCode', shortCode), Query.limit(1)]
      );

      if (groupList.total === 0) {
        throw new Error('Group not found');
      }
      const group = groupList.documents[0];
      const { $id: groupId, teamId } = group;

      // Check if teamId exists
      if (!teamId) {
        throw new Error('This group is broken (missing team data). Please ask the group admin to recreate it.');
      }

      // Check if user is already a member
      const existingMembership = await databases.listDocuments(
        DATABASE_ID,
        GROUP_MEMBERS_COLLECTION_ID,
        [
          Query.equal('groupId', groupId),
          Query.equal('userId', userId)
        ]
      );

      if (existingMembership.total > 0) {
        throw new Error('You are already a member of this group.');
      }

      // 2. Add user to the actual Appwrite Team
      // For broken teams, we need to handle this more carefully
      // The parameter order for createMembership is: teamId, roles, email, userId, phone, url, name
      // NOTE: Client-side SDK requires a URL for email invitations, even when adding by userId.
      let teamMembershipSucceeded = false;
      
      // If team is broken, we can't create membership, but we still need permission to create the document
      // So we'll skip this step and handle permissions differently
      if (teamId) {
        try {
          await teams.createMembership(teamId, ['member'], undefined, userId, undefined, 'http://localhost:8082');
          teamMembershipSucceeded = true;
          console.log('Successfully added user to team');
        } catch (teamError) {
          console.error('Error adding user to team:', teamError);
          
          if (teamError.code === 404 && teamError.message.includes('Team with the requested ID could not be found')) {
            // Team is broken - we'll create membership with minimal permissions
            console.warn('Team not found, will create database membership with group creator permissions');
          } else {
            console.warn('Team membership failed:', teamError.message);
            // For other errors, we might still be able to create database membership
          }
        }
      }

      // 3. Create the document in our custom memberships collection
      const membershipData = {
        groupId,
        userId,
        role: 'member', // Default role for new members
        joinedAt: new Date().toISOString(),
      };

      // 3. Create the document with appropriate permissions
      let membershipDocument;
      
      if (teamMembershipSucceeded) {
        // Normal flow - user is in team, use team permissions
        const membershipPermissions = [
          Permission.read(Role.team(teamId)),
          Permission.delete(Role.user(userId)),
          Permission.delete(Role.team(teamId, 'owner'))
        ];

        membershipDocument = await databases.createDocument(
          DATABASE_ID,
          GROUP_MEMBERS_COLLECTION_ID,
          ID.unique(),
          membershipData,
          membershipPermissions
        );
      } else {
        // Fallback - create without explicit permissions, rely on collection defaults
        try {
          membershipDocument = await databases.createDocument(
            DATABASE_ID,
            GROUP_MEMBERS_COLLECTION_ID,
            ID.unique(),
            membershipData
            // No permissions array - let collection handle it
          );
        } catch (permissionError) {
          console.error('Failed to create membership with default permissions:', permissionError);
          
          // Last resort - try with minimal permissions
          const minimalPermissions = [Permission.read(Role.user(userId))];
          membershipDocument = await databases.createDocument(
            DATABASE_ID,
            GROUP_MEMBERS_COLLECTION_ID,
            ID.unique(),
            membershipData,
            minimalPermissions
          );
        }
      }

      // Return group with status info
      return {
        ...group,
        teamMembershipSucceeded,
        joinMethod: teamMembershipSucceeded ? 'team_and_database' : 'database_only'
      };
    } catch (error) {
      // Check for unique constraint violation (already a member)
      if (error.code === 409) {
        throw new Error("You are already a member of this group.");
      }
      console.error('Error joining group:', error);
      throw error;
    }
  }

  // Get all groups for the current user
  async getUserGroups() {
    try {
      const userId = (await account.get()).$id;
      
      // Get all group memberships for the user
      const memberships = await databases.listDocuments(
        DATABASE_ID,
        GROUP_MEMBERS_COLLECTION_ID,
        [Query.equal('userId', userId)]
      );

      if (memberships.total === 0) {
        return { documents: [] };
      }

      // Get all groups that the user is a member of
      const groupIds = memberships.documents.map(m => m.groupId);
      const groups = await databases.listDocuments(
        DATABASE_ID,
        GROUPS_COLLECTION_ID,
        [Query.equal('$id', groupIds)]
      );

      // Add member count and role to each group
      const enrichedGroups = await Promise.all(
        groups.documents.map(async (group) => {
          const memberCount = await this.getGroupMemberCount(group.$id);
          const userRole = memberships.documents.find(m => m.groupId === group.$id)?.role;
          return {
            ...group,
            memberCount,
            userRole,
          };
        })
      );

      return { documents: enrichedGroups };
    } catch (error) {
      console.error('Error getting user groups:', error);
      throw error;
    }
  }

  // Check if user is admin of a group
  async isGroupAdmin(groupId, userId) {
    try {
      // Validate parameters
      if (!groupId || !userId) {
        console.error('isGroupAdmin called with invalid parameters:', { groupId, userId });
        return false;
      }

      const membership = await databases.listDocuments(
        DATABASE_ID,
        GROUP_MEMBERS_COLLECTION_ID,
        [
          Query.equal('groupId', groupId),
          Query.equal('userId', userId),
          Query.equal('role', 'admin')
        ]
      );
      
      console.log('Admin check result:', {
        groupId,
        userId,
        isAdmin: membership.total > 0,
        totalMemberships: membership.total
      });
      
      return membership.total > 0;
    } catch (error) {
      console.error('Error checking admin status:', error);
      return false;
    }
  }

  // Remove a member from a group (admin only)
  async removeMember(groupId, memberUserId) {
    try {
      // 1. Get the group document to find its teamId
      const group = await databases.getDocument(DATABASE_ID, GROUPS_COLLECTION_ID, groupId);
      const { teamId } = group;

      if (!teamId) {
        throw new Error('This group is invalid because it is missing a Team ID. Please re-create it.');
      }

      // The real permission check happens here. If the user making this
      // call is not a team 'owner', Appwrite will reject the action.

      // 2. Get the Appwrite team membership to delete it
      const teamMemberships = await teams.listMemberships(teamId, [
        Query.equal('userId', memberUserId)
      ]);

      if (teamMemberships.total > 0) {
        const membershipId = teamMemberships.memberships[0].$id;
        await teams.deleteMembership(teamId, membershipId);
      } else {
        // Fallback in case team membership was already gone
        console.warn(`Could not find Appwrite team membership for user ${memberUserId} in team ${teamId}.`);
      }

      // 3. Remove from our custom group_members collection for UI consistency
      const docList = await databases.listDocuments(
        DATABASE_ID,
        GROUP_MEMBERS_COLLECTION_ID,
        [
          Query.equal('groupId', groupId),
          Query.equal('userId', memberUserId),
        ]
      );

      if (docList.total > 0) {
        const docId = docList.documents[0].$id;
        await databases.deleteDocument(
          DATABASE_ID,
          GROUP_MEMBERS_COLLECTION_ID,
          docId
        );
      }

      return true;
    } catch (error) {
      console.error('Error removing member:', error);
      if (error.code === 401) {
        throw new Error('Permission denied. Only admins can remove members.');
      }
      throw error;
    }
  }

  // Delete a group (admin only)
  async deleteGroup(groupId) {
    try {
      // 1. Get the group document to find its teamId
      const group = await databases.getDocument(DATABASE_ID, GROUPS_COLLECTION_ID, groupId);
      const { teamId } = group;

      if (!teamId) {
        console.warn('Group document missing teamId, skipping team deletion:', group);
        // Continue with deleting the group document and memberships even if teamId is missing
      } else {
        // 2. Delete the entire Appwrite Team. This is the main action.
        // Appwrite checks if the user has 'owner' role and rejects if not.
        try {
          await teams.delete(teamId);
        } catch (teamError) {
          console.error('Error deleting team:', teamError);
          if (teamError.message && teamError.message.includes('could not be found')) {
            console.warn('Team not found, continuing with group deletion');
            // Continue with deleting the group document even if team doesn't exist
          } else {
            throw teamError;
          }
        }
      }

      // 3. Delete the group document from the groups collection
      await databases.deleteDocument(
        DATABASE_ID,
        GROUPS_COLLECTION_ID,
        groupId
      );

      // 4. (Optional but good practice) Clean up our custom memberships collection
      const docList = await databases.listDocuments(
        DATABASE_ID,
        GROUP_MEMBERS_COLLECTION_ID,
        [Query.equal('groupId', groupId)]
      );

      for (const doc of docList.documents) {
        await databases.deleteDocument(
          DATABASE_ID,
          GROUP_MEMBERS_COLLECTION_ID,
          doc.$id
        );
      }

      return true;
    } catch (error) {
      console.error('Error deleting group:', error);
      if (error.code === 401) {
        throw new Error('Permission denied. Only admins can delete the group.');
      }
      throw error;
    }
  }

  // Update group name (admin only)
  async updateGroupName(groupId, newName) {
    try {
      if (!newName || !newName.trim()) {
        throw new Error('Group name cannot be empty');
      }

      // 1. Get the group document to find its teamId
      const group = await databases.getDocument(DATABASE_ID, GROUPS_COLLECTION_ID, groupId);
      console.log('Group document:', group);
      
      const { teamId } = group;

      if (!teamId) {
        console.error('Group document missing teamId:', group);
        throw new Error('This group is missing a Team ID. It may have been created with an older version of the app. Please try deleting and recreating the group.');
      }

      console.log('Attempting to update team name for teamId:', teamId);

      // 2. Update the group document in our collection first
      const updatedGroup = await databases.updateDocument(
        DATABASE_ID,
        GROUPS_COLLECTION_ID,
        groupId,
        { name: newName.trim() }
      );

      // 3. Try to update the Appwrite Team name (this might fail due to permissions)
      try {
        await teams.updateName(teamId, newName.trim());
        console.log('Successfully updated team name');
      } catch (teamError) {
        console.error('Error updating team name:', teamError);
        console.error('Team error details:', {
          message: teamError.message,
          code: teamError.code,
          type: teamError.type
        });
        
        // Don't throw the error - the group document update succeeded
        // The team name update is less critical
        console.warn('Team name update failed, but group document was updated successfully');
      }

      return updatedGroup;
    } catch (error) {
      console.error('Error updating group name:', error);
      if (error.code === 401) {
        throw new Error('Permission denied. Only admins can update the group name.');
      }
      throw error;
    }
  }

  // Recover a group by recreating its team (admin only)
  // This is useful for groups that were created before teamId was properly stored
  async recoverGroup(groupId) {
    try {
      const user = await account.get();
      const userId = user.$id;

      // 1. Get the group document
      const group = await databases.getDocument(DATABASE_ID, GROUPS_COLLECTION_ID, groupId);
      
      // Check if the team exists (for groups with teamId but broken teams)
      if (group.teamId) {
        try {
          await teams.get(group.teamId);
          throw new Error('This group already has a valid team and does not need recovery.');
        } catch (teamError) {
          if (teamError.code === 404) {
            console.log('Team not found, proceeding with recovery...');
            // Continue with recovery - the team is broken
          } else {
            throw teamError;
          }
        }
      }

      // 2. Check if user is admin of this group
      const isAdmin = await this.isGroupAdmin(groupId, userId);
      if (!isAdmin) {
        throw new Error('Permission denied. Only admins can recover a group.');
      }

      // 3. Create a new Appwrite Team for the group
      const team = await teams.create(ID.unique(), group.name, ['owner']);
      const teamId = team.$id;

      // 4. Update the group document with the new teamId
      await databases.updateDocument(
        DATABASE_ID,
        GROUPS_COLLECTION_ID,
        groupId,
        { teamId }
      );

      // 5. Add all existing members to the new team
      const members = await this.getGroupMembers(groupId);
      for (const member of members) {
        if (member.id !== userId) { // Skip the current user (already owner)
          try {
            await teams.createMembership(teamId, ['member'], undefined, member.id, undefined, 'http://localhost:8082');
          } catch (error) {
            console.warn(`Failed to add member ${member.name} to team:`, error);
          }
        }
      }

      return { success: true, teamId };
    } catch (error) {
      console.error('Error recovering group:', error);
      throw error;
    }
  }

  // Find groups with missing or null teamId (for debugging and cleanup)
  async findBrokenGroups() {
    try {
      const user = await account.get();
      const userId = user.$id;

      // Get all groups where user is a member
      const memberships = await databases.listDocuments(
        DATABASE_ID,
        GROUP_MEMBERS_COLLECTION_ID,
        [Query.equal('userId', userId)]
      );

      if (memberships.total === 0) {
        return [];
      }

      // Get all groups that the user is a member of
      const groupIds = memberships.documents.map(m => m.groupId);
      const groups = await databases.listDocuments(
        DATABASE_ID,
        GROUPS_COLLECTION_ID,
        [Query.equal('$id', groupIds)]
      );

      // Filter groups with missing or null teamId
      const brokenGroups = groups.documents.filter(group => !group.teamId);

      console.log('Found broken groups:', brokenGroups);
      return brokenGroups;
    } catch (error) {
      console.error('Error finding broken groups:', error);
      return [];
    }
  }

  // Clean up a broken group (delete it completely)
  async cleanupBrokenGroup(groupId) {
    try {
      console.log('Cleaning up broken group:', groupId);

      // 1. Delete the group document from the groups collection
      await databases.deleteDocument(
        DATABASE_ID,
        GROUPS_COLLECTION_ID,
        groupId
      );

      // 2. Clean up our custom memberships collection
      const docList = await databases.listDocuments(
        DATABASE_ID,
        GROUP_MEMBERS_COLLECTION_ID,
        [Query.equal('groupId', groupId)]
      );

      for (const doc of docList.documents) {
        await databases.deleteDocument(
          DATABASE_ID,
          GROUP_MEMBERS_COLLECTION_ID,
          doc.$id
        );
      }

      console.log('Successfully cleaned up broken group:', groupId);
      return true;
    } catch (error) {
      console.error('Error cleaning up broken group:', error);
      throw error;
    }
  }

  // Get group members with full user details
  async getGroupMembers(groupId) {
    try {
      const memberships = await databases.listDocuments(
        DATABASE_ID,
        GROUP_MEMBERS_COLLECTION_ID,
        [Query.equal('groupId', groupId)]
      );

      // Get user details for each member
      const members = await Promise.all(
        memberships.documents.map(async (membership) => {
          try {
            // Get user details from Appwrite
            const user = await account.get(membership.userId);
            
            return {
              id: membership.userId,
              name: user.name || 'Unknown User',
              email: user.email,
              role: membership.role,
              joinedAt: membership.joinedAt,
              membershipId: membership.$id // Add this for removal functionality
            };
          } catch (error) {
            console.error('Error getting user details:', error);
            // Return basic info if we can't get user details
            return {
              id: membership.userId,
              name: 'Unknown User',
              email: '',
              role: membership.role,
              joinedAt: membership.joinedAt,
              membershipId: membership.$id
            };
          }
        })
      );

      return members;
    } catch (error) {
      console.error('Error getting group members:', error);
      throw error;
    }
  }

  // Get member count for a group
  async getGroupMemberCount(groupId) {
    try {
      const memberships = await databases.listDocuments(
        DATABASE_ID,
        GROUP_MEMBERS_COLLECTION_ID,
        [Query.equal('groupId', groupId)]
      );
      return memberships.total;
    } catch (error) {
      console.error('Error getting group member count:', error);
      throw error;
    }
  }

  // Get a group by ID
  async getGroupById(groupId) {
    try {
      const group = await databases.getDocument(
        DATABASE_ID,
        GROUPS_COLLECTION_ID,
        groupId
      );

      const memberCount = await this.getGroupMemberCount(groupId);
      return { ...group, memberCount };
    } catch (error) {
      console.error('Error getting group:', error);
      throw error;
    }
  }

  // Find a group by its short code (for recovery purposes)
  async findGroupByShortCode(shortCode) {
    try {
      const groupList = await databases.listDocuments(
        DATABASE_ID,
        GROUPS_COLLECTION_ID,
        [Query.equal('shortCode', shortCode), Query.limit(1)]
      );

      if (groupList.total === 0) {
        return null;
      }
      
      return groupList.documents[0];
    } catch (error) {
      console.error('Error finding group by short code:', error);
      return null;
    }
  }

  // Clean up orphaned memberships (where group document no longer exists)
  async cleanupOrphanedMemberships() {
    try {
      const user = await account.get();
      const userId = user.$id;

      // Get all memberships for the user
      const memberships = await databases.listDocuments(
        DATABASE_ID,
        GROUP_MEMBERS_COLLECTION_ID,
        [Query.equal('userId', userId)]
      );

      const orphanedMembershipIds = [];

      // Check each membership to see if the group still exists
      for (const membership of memberships.documents) {
        try {
          await databases.getDocument(DATABASE_ID, GROUPS_COLLECTION_ID, membership.groupId);
          // Group exists, membership is valid
        } catch (error) {
          if (error.code === 404) {
            // Group doesn't exist, this is an orphaned membership
            orphanedMembershipIds.push(membership.$id);
            console.log('Found orphaned membership for missing group:', membership.groupId);
          }
        }
      }

      // Delete orphaned memberships
      for (const membershipId of orphanedMembershipIds) {
        try {
          await databases.deleteDocument(
            DATABASE_ID,
            GROUP_MEMBERS_COLLECTION_ID,
            membershipId
          );
          console.log('Deleted orphaned membership:', membershipId);
        } catch (error) {
          console.error('Error deleting orphaned membership:', membershipId, error);
        }
      }

      console.log(`Cleaned up ${orphanedMembershipIds.length} orphaned memberships`);
      return orphanedMembershipIds.length;
    } catch (error) {
      console.error('Error cleaning up orphaned memberships:', error);
      throw error;
    }
  }
}

export const groupService = new GroupService(); 