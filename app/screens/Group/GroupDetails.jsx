import { useNavigation, useRoute } from '@react-navigation/native';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Clipboard,
    Dimensions,
    FlatList,
    Modal,
    Platform,
    ScrollView,
    Share,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Header from '../../components/common/Header';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const { width } = Dimensions.get('window');

// Mock data for group details
const MOCK_GROUP_DATA = {
  id: '1',
  name: 'Family Group',
  shortCode: 'FAM123',
  description: 'Family safety monitoring and content filtering',
  memberCount: 5,
  createdAt: 'March 15, 2024',
  isAdmin: true,
  members: [
    { id: '1', name: 'John Doe', role: 'admin', joinedAt: 'March 15, 2024', status: 'online' },
    { id: '2', name: 'Jane Smith', role: 'member', joinedAt: 'March 16, 2024', status: 'offline' },
    { id: '3', name: 'Mike Johnson', role: 'member', joinedAt: 'March 17, 2024', status: 'online' },
    { id: '4', name: 'Sarah Wilson', role: 'member', joinedAt: 'March 18, 2024', status: 'offline' },
    { id: '5', name: 'Tom Brown', role: 'member', joinedAt: 'March 19, 2024', status: 'online' },
  ],
  recentActivity: [
    { id: '1', type: 'detection', message: 'Profanity detected on Facebook', time: '2 hours ago' },
    { id: '2', type: 'member', message: 'Sarah joined the group', time: '1 day ago' },
    { id: '3', type: 'settings', message: 'Group settings updated', time: '3 days ago' },
  ]
};

export default function GroupDetailsScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { user } = useAuth();
  const { groupId, groupName } = route.params || {};
  const [groupData, setGroupData] = useState(null);
  const [activeTab, setActiveTab] = useState('members');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editGroupName, setEditGroupName] = useState('');
  const [editGroupDescription, setEditGroupDescription] = useState('');
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState('');
  const [infoModalVisible, setInfoModalVisible] = useState(false);
  const [copied, setCopied] = useState(false);
  const [inviteModalVisible, setInviteModalVisible] = useState(false);
  const [adminMenuVisible, setAdminMenuVisible] = useState(false);
  const [removeMemberModalVisible, setRemoveMemberModalVisible] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState(null);
  const [removeLoading, setRemoveLoading] = useState(false);
  const [activities, setActivities] = useState([]);
  const [activitiesLoading, setActivitiesLoading] = useState(false);

  // Helper to check if current user is admin (creator of the group)
  const isAdmin = groupData && user && (
    groupData.userId === user.id ||
    groupData.userId === user._id ||
    groupData.userId?.toString() === user.id?.toString() ||
    groupData.userId?.toString() === user._id?.toString()
  );

  console.log('user:', user);
  console.log('groupData:', groupData);
  console.log('groupData.userId:', groupData?.userId);
  console.log('user.id:', user?.id);
  console.log('user._id:', user?._id);
  console.log('isAdmin:', isAdmin);

  useEffect(() => {
    if (groupId) {
      fetchGroupDetails(groupId);
      fetchGroupActivities(groupId);
    }
  }, [groupId]);

  // Reset tab to members if non-admin tries to access activity
  useEffect(() => {
    if (!isAdmin && activeTab === 'activity') {
      setActiveTab('members');
    }
  }, [isAdmin, activeTab]);

  const fetchGroupDetails = async (id) => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get(`/users/groups/${id}`);
      console.log('Group Details Response:', res.data);
      console.log('Group userId (admin):', res.data.userId);
      console.log('Group members:', res.data.members);
      console.log('Admin info:', res.data.adminInfo);
      setGroupData(res.data);
    } catch (err) {
      setError('Failed to load group details');
      console.error('Failed to fetch group details:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchGroupActivities = async (id) => {
    setActivitiesLoading(true);
    try {
      const res = await api.get(`/users/groups/${id}/activities`);
      setActivities(res.data.activities || []);
    } catch (err) {
      console.error('Failed to fetch group activities:', err);
      // Fallback to empty array if API fails
      setActivities([]);
    } finally {
      setActivitiesLoading(false);
    }
  };

  const recordActivity = async (type, message, metadata = {}) => {
    try {
      // Only record activity if we have valid groupId and user
      if (!groupId || !user) {
        console.log('Skipping activity recording - missing groupId or user');
        return;
      }

      const activityData = {
        type,
        message,
        metadata,
        userId: user?.id || user?._id,
        userName: user?.name || user?.username || 'Unknown User'
      };

      console.log('Recording activity:', activityData);

      await api.post(`/users/groups/${groupId}/activities`, activityData);
      
      // Refresh activities after recording
      fetchGroupActivities(groupId);
    } catch (err) {
      console.error('Failed to record activity:', err);
      // Don't throw the error - just log it so it doesn't break the UI
      // The activity recording failure shouldn't prevent the main functionality
    }
  };



  const handleInviteMember = () => {
    if (!groupData) return;
    Alert.alert(
      'Invite Member',
      `Share this code with someone to invite them to "${groupData.name}":\n\n${groupData.shortCode}`,
      [
        { text: 'Copy Code', onPress: () => console.log('Copy code') },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

  const handleLeaveGroup = async () => {
    if (!groupData || !user) return;
    Alert.alert(
      'Leave Group',
      `Are you sure you want to leave "${groupData.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Leave',
          style: 'destructive',
          onPress: async () => {
            try {
              // Record activity before leaving
              await recordActivity(
                'member_left',
                `${user?.name || user?.username || 'Unknown User'} left the group`,
                { reason: 'left' }
              );

              await api.post(`/users/groups/${groupData.id}/leave`);
              setInfoModalVisible(false);
              navigation.goBack();
            } catch (err) {
              Alert.alert('Error', 'Failed to leave group');
            }
          }
        }
      ]
    );
  };

  const handleDeleteGroup = async () => {
    if (!groupData) return;
    Alert.alert(
      'Delete Group',
      `Are you sure you want to delete "${groupData.name}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              // Record activity before deletion
              await recordActivity(
                'group_deleted',
                `Group "${groupData.name}" was deleted`,
                { groupName: groupData.name }
              );

              await api.delete(`/users/groups/${groupData.id}`);
              navigation.goBack();
            } catch (err) {
              Alert.alert('Error', 'Failed to delete group');
            }
          }
        }
      ]
    );
  };

  // Activity logging helper
  const logActivity = async (action, details = '') => {
    try {
      // Only log activity if we have groupData
      if (!groupData) {
        console.log('Skipping activity logging - no groupData available');
        return;
      }

      const activityMessages = {
        'viewed_group_info': `Viewed group information for "${groupData?.name}"`,
        'settings_updated': `Opened rename dialog for group "${groupData?.name}"`,
        'code_regenerated': `Regenerated invite code for group "${groupData?.name}"`,
        'group_deleted': `Initiated deletion process for group "${groupData?.name}"`,
        'member_removed': `Removed member from group "${groupData?.name}"`,
        'member_joined': `New member joined group "${groupData?.name}"`,
        'member_left': `Member left group "${groupData?.name}"`,
        'group_updated': `Group settings updated for "${groupData?.name}"`
      };

      await recordActivity(
        action,
        details || activityMessages[action] || `Admin action: ${action}`,
        {
          groupId: groupData?.id,
          groupName: groupData?.name,
          action: action
        }
      );
    } catch (error) {
      console.log('Failed to log activity:', error);
      // Don't throw the error - just log it so it doesn't break the UI
    }
  };

  const openEditModal = () => {
    setEditGroupName(groupData?.name || '');
    setEditError('');
    setEditModalVisible(true);
  };

  const handleRemoveMember = (memberId, memberName) => {
    console.log('🚀 handleRemoveMember FUNCTION CALLED!');
    console.log('handleRemoveMember called with:', memberId, memberName);
    console.log('memberId type:', typeof memberId);
    console.log('memberId toString:', memberId?.toString());
    console.log('groupData.id:', groupData?.id);
    console.log('isAdmin:', isAdmin);

    if (!groupData || !memberId) {
      console.log('Missing groupData or memberId');
      return;
    }

    // Set member to remove and show modal
    setMemberToRemove({
      id: memberId,
      name: memberName
    });
    setRemoveMemberModalVisible(true);
  };

  const confirmRemoveMember = async () => {
    if (!memberToRemove) return;

    setRemoveLoading(true);
    try {
      console.log('Attempting to remove member...');
      const apiUrl = `/users/groups/${groupData.id}/members/${memberToRemove.id}`;
      console.log('API URL:', apiUrl);

      const response = await api.delete(apiUrl);
      console.log('Remove member response:', response.data);

      // Record activity
      await logActivity('member_removed', `Removed ${memberToRemove.name || 'Member'} from group "${groupData.name}"`);
      await recordActivity(
        'member_removed',
        `${memberToRemove.name || 'Member'} was removed from the group`,
        { removedMemberId: memberToRemove.id, removedMemberName: memberToRemove.name }
      );

      // Refresh group data to update member list
      fetchGroupDetails(groupData.id);

      // Close modal and reset state
      setRemoveMemberModalVisible(false);
      setMemberToRemove(null);

    } catch (err) {
      console.error('Remove member error:', err);
      // You could show an error modal here instead of Alert
    } finally {
      setRemoveLoading(false);
    }
  };

  const handleRegenerateCode = async () => {
    if (!groupData) return;

    Alert.alert(
      'Regenerate Group Code',
      'This will create a new group code and invalidate the old one. Members with the old code will no longer be able to join.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Regenerate',
          style: 'default',
          onPress: async () => {
            try {
              const response = await api.post(`/users/groups/${groupData.id}/regenerate-code`);
              console.log('Regenerate code response:', response.data);

              // Update group data with new code
              setGroupData(prev => ({
                ...prev,
                shortCode: response.data.shortCode
              }));

              // Record activity
              await recordActivity(
                'code_regenerated',
                `Group invite code was regenerated`,
                {
                  oldCode: groupData.shortCode,
                  newCode: response.data.shortCode
                }
              );

              Alert.alert('Success', 'New group code generated successfully');
            } catch (err) {
              console.error('Regenerate code error:', err);
              Alert.alert('Error', err.response?.data?.message || 'Failed to regenerate code');
            }
          }
        }
      ]
    );
  };

  const handleEditGroup = async () => {
    if (!editGroupName.trim()) {
      setEditError('Group name cannot be empty');
      return;
    }
    setEditLoading(true);
    setEditError('');
    try {
      const oldName = groupData.name;

      await api.put(`/users/groups/${groupData.id}`, {
        name: editGroupName.trim()
      });

      // Record activity
      if (oldName !== editGroupName.trim()) {
        await recordActivity(
          'group_updated',
          `Group name changed from "${oldName}" to "${editGroupName.trim()}"`,
          {
            oldName,
            newName: editGroupName.trim()
          }
        );
      }

      setEditModalVisible(false);
      fetchGroupDetails(groupData.id);
    } catch (err) {
      setEditError('Failed to update group');
    } finally {
      setEditLoading(false);
    }
  };

  const handleCopyCode = (code) => {
    if (!code) return;
    Clipboard.setString(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  const handleShare = async (code) => {
    if (!code) return;
    try {
      const result = await Share.share({
        message: `Join my group on Murai! Use code: ${code} or click this link: https://yourapp.com/join/${code}`,
        url: `https://yourapp.com/join/${code}`,
        title: 'Join my group on Murai',
      });
    } catch (error) {
      // Optionally handle error
    }
  };

  const handleMemberPress = (member) => {
    console.log('🔍 Member pressed:', member);
    const memberId = member.userId || member.id || member._id;
    console.log('🔍 Navigating to MemberAnalytics with:', { memberId, memberName: member.name, groupId });
    navigation.navigate('MemberAnalytics', {
      memberId: memberId,
      memberName: member.name || 'Unknown User',
      groupId: groupId,
    });
  };

  const renderMemberItem = ({ item, key }) => {
    // ALL items in groupData.members are just members (from GroupUserModel)
    // The admin is ONLY the user in groupData.userId (from Group model)
    // So this item is NEVER an admin, always a member

    return (
      <TouchableOpacity
        key={key}
        style={styles.memberItem}
        onPress={() => {
          console.log('🔍 TouchableOpacity pressed for member:', item.name);
          handleMemberPress(item);
        }}
        activeOpacity={0.7}
      >
        <View style={styles.memberInfo}>
          <View style={styles.memberAvatar}>
            <Text style={styles.memberInitial}>{item.name?.charAt(0).toUpperCase() || 'U'}</Text>
          </View>
          <View style={styles.memberDetails}>
            <Text style={styles.memberName}>{item.name || 'Unknown User'}</Text>
            <View style={styles.memberMetaRow}>
              <View style={styles.roleTag}>
                <MaterialCommunityIcons
                  name="account"
                  size={12}
                  color="#6b7280"
                />
                <Text style={styles.roleText}>
                  Member
                </Text>
              </View>
            </View>
          </View>
        </View>
        <View style={styles.memberActions}>
          {/* Admin can remove any member since all items here are members */}
          {isAdmin && (
            <TouchableOpacity
              style={styles.removeButton}
              onPress={(e) => {
                e.stopPropagation(); // Prevent triggering member press
                console.log('🔴 REMOVE BUTTON PRESSED!');
                const memberId = item.userId || item.id || item._id;
                console.log('Calling handleRemoveMember with:', memberId, item.name);
                handleRemoveMember(memberId, item.name);
              }}
            >
              <MaterialCommunityIcons name="account-minus" size={16} color="#ef4444" />
            </TouchableOpacity>
          )}
          <MaterialCommunityIcons name="chevron-right" size={20} color="#6b7280" style={styles.chevronIcon} />
        </View>
      </TouchableOpacity>
    );
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'member_joined':
        return 'account-plus';
      case 'member_left':
        return 'account-minus';
      case 'member_removed':
        return 'account-remove';
      case 'group_created':
        return 'account-group';
      case 'group_updated':
        return 'pencil';
      case 'group_deleted':
        return 'delete';
      case 'code_regenerated':
        return 'refresh';
      case 'detection':
        return 'alert-circle';
      case 'settings':
        return 'cog';
      default:
        return 'information';
    }
  };

  const formatActivityTime = (timestamp) => {
    if (!timestamp) return 'Unknown time';

    const now = new Date();
    const activityTime = new Date(timestamp);
    const diffInMs = now - activityTime;
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInDays < 7) return `${diffInDays}d ago`;

    return activityTime.toLocaleDateString();
  };

  const renderActivityItem = ({ item }) => (
    <View style={styles.activityItem}>
      <View style={styles.activityIcon}>
        <MaterialCommunityIcons
          name={getActivityIcon(item.type)}
          size={22}
          color="#6b7280"
        />
      </View>
      <View style={styles.activityContent}>
        <Text style={styles.activityMessage}>{item.message}</Text>
        <Text style={styles.activityTime}>{formatActivityTime(item.createdAt || item.timestamp)}</Text>
        {item.userName && (
          <Text style={styles.activityUser}>by {item.userName}</Text>
        )}
      </View>
    </View>
  );

  const renderTabContent = () => {
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading group details...</Text>
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      );
    }

    if (!groupData) {
      return null; // Should not happen if loading and error are handled
    }

    switch (activeTab) {
      case 'members':
        return (
          <ScrollView showsVerticalScrollIndicator={false} style={styles.membersContainer}>


            {/* Admin Section - Info from Group.userId joined with User */}
            <View style={styles.adminSection}>
              <Text style={styles.sectionTitle}>Group Admin</Text>
              <View style={styles.adminCard}>
                <View style={styles.memberInfo}>
                  <View style={[styles.memberAvatar, styles.adminAvatar]}>
                    <Text style={styles.memberInitial}>
                      {groupData.adminInfo?.name?.charAt(0).toUpperCase() ||
                       groupData.adminInfo?.username?.charAt(0).toUpperCase() ||
                       'A'}
                    </Text>
                  </View>
                  <View style={styles.memberDetails}>
                    <Text style={styles.memberName}>
                      {groupData.adminInfo?.name ||
                       groupData.adminInfo?.username ||
                       'Group Creator'}
                    </Text>
                    <View style={styles.memberMetaRow}>
                      <View style={[styles.roleTag, styles.adminRoleTag]}>
                        <MaterialCommunityIcons
                          name="crown"
                          size={12}
                          color="#02B97F"
                        />
                        <Text style={[styles.roleText, styles.adminRoleText]}>
                          Admin
                        </Text>
                      </View>

                    </View>
                  </View>
                </View>
              </View>
            </View>

            {/* Members Section */}
            <View style={styles.membersSection}>
              <Text style={styles.sectionTitle}>
                Members ({groupData.members?.length || 0})
              </Text>
              {groupData.members && groupData.members.length > 0 ? (
                groupData.members.map((item, index) =>
                  renderMemberItem({ item, key: item.id || index })
                )
              ) : (
                <View style={styles.emptyMembersContainer}>
                  <MaterialCommunityIcons name="account-group-outline" size={48} color="#9ca3af" />
                  <Text style={styles.emptyMembersText}>No members yet</Text>
                  <Text style={styles.emptyMembersSubtext}>Invite people to join this group</Text>
                </View>
              )}
            </View>
          </ScrollView>
        );
      case 'activity':
        // Only admins can view activity
        if (!isAdmin) {
          return (
            <View style={styles.accessDeniedContainer}>
              <MaterialCommunityIcons name="lock" size={48} color="#9ca3af" />
              <Text style={styles.accessDeniedText}>Access Restricted</Text>
              <Text style={styles.accessDeniedSubtext}>Only group admins can view activity logs</Text>
            </View>
          );
        }
        return (
          <View style={styles.activityTabContainer}>
            {activitiesLoading ? (
              <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>Loading activities...</Text>
              </View>
            ) : activities.length === 0 ? (
              <View style={styles.emptyActivityContainer}>
                <MaterialCommunityIcons name="history" size={48} color="#9ca3af" />
                <Text style={styles.emptyActivityText}>No recent activity</Text>
                <Text style={styles.emptyActivitySubtext}>Group activities will appear here</Text>
              </View>
            ) : (
              <FlatList
                data={activities}
                renderItem={renderActivityItem}
                keyExtractor={(item) => item._id || item.id}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.listContainer}
                refreshing={activitiesLoading}
                onRefresh={() => fetchGroupActivities(groupId)}
              />
            )}
          </View>
        );
      default:
        return (
          <FlatList
            data={groupData.members}
            renderItem={renderMemberItem}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContainer}
          />
        );
    }
  };

  // Add a helper function for date formatting
  const formatDateTime = (isoString) => {
    if (!isoString) return '-';
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return '-';
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: '2-digit',
    });
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      {/* Edit Group Modal */}
      <Modal
        visible={editModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.minimalModalContent}>
            <Text style={styles.minimalModalTitle}>Rename Group</Text>
            
            <TextInput
              style={styles.minimalInput}
              value={editGroupName}
              onChangeText={setEditGroupName}
              placeholder="Enter group name"
              placeholderTextColor="#9CA3AF"
              autoFocus
            />

            {editError ? (
              <View style={styles.minimalErrorContainer}>
                <MaterialCommunityIcons name="alert-circle" size={16} color="#dc2626" />
                <Text style={styles.minimalErrorText}>{editError}</Text>
              </View>
            ) : null}

            <View style={styles.minimalButtonContainer}>
              <TouchableOpacity
                style={styles.minimalCancelButton}
                onPress={() => setEditModalVisible(false)}
                disabled={editLoading}
              >
                <Text style={styles.minimalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.minimalSaveButton}
                onPress={handleEditGroup}
                disabled={editLoading}
              >
                {editLoading ? (
                  <ActivityIndicator color="#ffffff" size="small" />
                ) : (
                  <Text style={styles.minimalSaveText}>Save</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      {/* Info Modal */}
      <Modal
        visible={infoModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setInfoModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.minimalModalContent}>
            <Text style={styles.minimalModalTitle}>Group Information</Text>
            
            {/* Group Code */}
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Group Code</Text>
              <View style={styles.codeRow}>
                <Text style={styles.codeText}>{groupData?.shortCode || '-'}</Text>
                {groupData?.shortCode && (
                  <TouchableOpacity
                    style={styles.copyButton}
                    onPress={() => handleCopyCode(groupData.shortCode)}
                  >
                    <MaterialCommunityIcons name="content-copy" size={16} color="#02B97F" />
                  </TouchableOpacity>
                )}
              </View>
            </View>

            {/* Created Date */}
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Created</Text>
              <Text style={styles.infoValue}>{formatDateTime(groupData?.createdAt)}</Text>
            </View>

            {/* Your Role */}
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Your Role</Text>
              <Text style={[styles.infoValue, { color: isAdmin ? '#02B97F' : '#6b7280' }]}>
                {isAdmin ? 'Admin' : 'Member'}
              </Text>
            </View>

            {/* Copy Success Message */}
            {copied && (
              <View style={styles.successMessage}>
                <MaterialCommunityIcons name="check-circle" size={16} color="#10b981" />
                <Text style={styles.successText}>Code copied!</Text>
              </View>
            )}

            {/* Action Buttons */}
            <View style={styles.minimalButtonContainer}>
              <TouchableOpacity
                style={styles.minimalCancelButton}
                onPress={() => setInfoModalVisible(false)}
              >
                <Text style={styles.minimalCancelText}>Close</Text>
              </TouchableOpacity>
              {!isAdmin && (
                <TouchableOpacity
                  style={styles.minimalRemoveButton}
                  onPress={handleLeaveGroup}
                >
                  <Text style={styles.minimalRemoveText}>Leave Group</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </Modal>
      {/* Invite Modal */}
      <Modal
        visible={inviteModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setInviteModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.minimalModalContent}>
            <Text style={styles.minimalModalTitle}>Invite to Group</Text>
            
            <Text style={styles.minimalModalText}>
              Share this code with others to invite them to "{groupData?.name}"
            </Text>

            {/* Code Display */}
            <View style={styles.minimalCodeContainer}>
              <Text style={styles.minimalCodeText}>{groupData?.shortCode || '-'}</Text>
              {groupData?.shortCode && (
                <TouchableOpacity 
                  style={styles.minimalCopyButton}
                  onPress={() => handleCopyCode(groupData.shortCode)}
                >
                  <MaterialCommunityIcons name="content-copy" size={18} color="#02B97F" />
                </TouchableOpacity>
              )}
            </View>

            {/* Copy Success Message */}
            {copied && (
              <View style={styles.minimalSuccessMessage}>
                <MaterialCommunityIcons name="check-circle" size={16} color="#10b981" />
                <Text style={styles.minimalSuccessText}>Code copied!</Text>
              </View>
            )}

            <View style={styles.minimalButtonContainer}>
              <TouchableOpacity
                style={styles.minimalCancelButton}
                onPress={() => setInviteModalVisible(false)}
              >
                <Text style={styles.minimalCancelText}>Close</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.minimalShareButton}
                onPress={() => handleShare(groupData?.shortCode)}
              >
                <Text style={styles.minimalShareText}>Share</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Enhanced Menu Modal */}
      <Modal
        visible={adminMenuVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setAdminMenuVisible(false)}
      >
        <View style={styles.menuOverlay}>
          <View style={styles.menuContainer}>
            {/* Handle Bar */}
            <View style={styles.menuHandle} />

            {/* Header */}
            <View style={styles.menuHeader}>
              <View style={styles.menuTitleContainer}>
                <MaterialCommunityIcons name="cog" size={24} color="#02B97F" />
                <Text style={styles.menuTitle}>Group Settings</Text>
              </View>
              <TouchableOpacity
                style={styles.menuCloseBtn}
                onPress={() => setAdminMenuVisible(false)}
              >
                <MaterialCommunityIcons name="close" size={20} color="#6b7280" />
              </TouchableOpacity>
            </View>

            {/* Enhanced Menu Items */}
            <View style={styles.menuContent}>
              {/* Group Info */}
              <TouchableOpacity
                style={styles.enhancedMenuItem}
                onPress={() => {
                  setAdminMenuVisible(false);
                  setInfoModalVisible(true);
                  // Wrap in try-catch to prevent UI breaking if activity logging fails
                  try {
                    logActivity('settings_updated');
                  } catch (error) {
                    console.log('Activity logging failed but continuing with modal:', error);
                  }
                }}
                activeOpacity={0.7}
              >
                <View style={[styles.enhancedMenuItemIcon, { backgroundColor: '#E8F5F0' }]}>
                  <MaterialCommunityIcons name="information-outline" size={22} color="#02B97F" />
                </View>
                <View style={styles.enhancedMenuItemContent}>
                  <Text style={styles.enhancedMenuItemTitle}>Group Info</Text>
                  <Text style={styles.enhancedMenuItemSubtitle}>View group details and statistics</Text>
                </View>
                <MaterialCommunityIcons name="chevron-right" size={18} color="#9ca3af" />
              </TouchableOpacity>

              {/* Rename Group */}
              <TouchableOpacity
                style={styles.enhancedMenuItem}
                onPress={() => {
                  setAdminMenuVisible(false);
                  openEditModal();
                  // Wrap in try-catch to prevent UI breaking if activity logging fails
                  try {
                    logActivity('settings_updated');
                  } catch (error) {
                    console.log('Activity logging failed but continuing with modal:', error);
                  }
                }}
                activeOpacity={0.7}
              >
                <View style={[styles.enhancedMenuItemIcon, { backgroundColor: '#E8F5F0' }]}>
                  <MaterialCommunityIcons name="pencil-outline" size={22} color="#02B97F" />
                </View>
                <View style={styles.enhancedMenuItemContent}>
                  <Text style={styles.enhancedMenuItemTitle}>Rename Group</Text>
                  <Text style={styles.enhancedMenuItemSubtitle}>Change the group name</Text>
                </View>
                <MaterialCommunityIcons name="chevron-right" size={18} color="#9ca3af" />
              </TouchableOpacity>

              {/* Regenerate Code */}
              <TouchableOpacity
                style={styles.enhancedMenuItem}
                onPress={() => {
                  setAdminMenuVisible(false);
                  handleRegenerateCode();
                  // Wrap in try-catch to prevent UI breaking if activity logging fails
                  try {
                    logActivity('code_regenerated');
                  } catch (error) {
                    console.log('Activity logging failed but continuing with action:', error);
                  }
                }}
                activeOpacity={0.7}
              >
                <View style={[styles.enhancedMenuItemIcon, { backgroundColor: '#E8F5F0' }]}>
                  <MaterialCommunityIcons name="refresh" size={22} color="#02B97F" />
                </View>
                <View style={styles.enhancedMenuItemContent}>
                  <Text style={styles.enhancedMenuItemTitle}>Regenerate Code</Text>
                  <Text style={styles.enhancedMenuItemSubtitle}>Create a new invite code</Text>
                </View>
                <MaterialCommunityIcons name="chevron-right" size={18} color="#9ca3af" />
              </TouchableOpacity>

              {/* Enhanced Divider */}
              <View style={styles.enhancedMenuDivider} />

              {/* Delete Group */}
              <TouchableOpacity
                style={[styles.enhancedMenuItem, styles.enhancedDangerMenuItem]}
                onPress={() => {
                  setAdminMenuVisible(false);
                  handleDeleteGroup();
                  // Wrap in try-catch to prevent UI breaking if activity logging fails
                  try {
                    logActivity('group_deleted');
                  } catch (error) {
                    console.log('Activity logging failed but continuing with action:', error);
                  }
                }}
                activeOpacity={0.7}
              >
                <View style={[styles.enhancedMenuItemIcon, { backgroundColor: '#FEE2E2' }]}>
                  <MaterialCommunityIcons name="delete-outline" size={22} color="#ef4444" />
                </View>
                <View style={styles.enhancedMenuItemContent}>
                  <Text style={[styles.enhancedMenuItemTitle, styles.enhancedDangerText]}>Delete Group</Text>
                  <Text style={[styles.enhancedMenuItemSubtitle, styles.enhancedDangerSubtext]}>Permanently remove this group</Text>
                </View>
                <MaterialCommunityIcons name="chevron-right" size={18} color="#ef4444" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Remove Member Modal */}
      <Modal
        visible={removeMemberModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setRemoveMemberModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.minimalModalContent}>
            <Text style={styles.minimalModalTitle}>Remove Member</Text>
            <Text style={styles.minimalModalText}>
              Remove "{memberToRemove?.name || 'this member'}" from the group?
            </Text>
            <View style={styles.minimalButtonContainer}>
              <TouchableOpacity
                style={styles.minimalCancelButton}
                onPress={() => {
                  setRemoveMemberModalVisible(false);
                  setMemberToRemove(null);
                }}
                disabled={removeLoading}
              >
                <Text style={styles.minimalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.minimalRemoveButton}
                onPress={confirmRemoveMember}
                disabled={removeLoading}
              >
                {removeLoading ? (
                  <ActivityIndicator color="#ffffff" size="small" />
                ) : (
                  <Text style={styles.minimalRemoveText}>Remove</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Enhanced Header without Icon */}
      <Header
        title={
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>{groupData?.name || 'Group Details'}</Text>
          </View>
        }
        showBackButton={true}
        onBackPress={() => navigation.goBack()}
        rightContent={
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.headerBtn} onPress={() => setInviteModalVisible(true)}>
              <MaterialCommunityIcons name="account-plus" size={20} color="#02B97F" />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.headerBtn, styles.menuBtn]}
              onPress={() => {
                console.log('Menu button pressed');
                setAdminMenuVisible(true);
              }}
            >
              <MaterialCommunityIcons name="dots-vertical" size={20} color="#02B97F" />
            </TouchableOpacity>
          </View>
        }
        style={{ paddingHorizontal: 0 }}
      />




      {/* Enhanced Tab Navigation with Green Theme */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'members' && styles.activeTab,
            !isAdmin && styles.singleTab // Full width for members when no activity tab
          ]}
          onPress={() => setActiveTab('members')}
        >
          <MaterialCommunityIcons
            name="account-group"
            size={18}
            color={activeTab === 'members' ? '#02B97F' : '#6b7280'}
            style={styles.tabIcon}
          />
          <Text style={[styles.tabText, activeTab === 'members' && styles.activeTabText]}>
            Members ({groupData?.memberCount || (groupData?.members?.length || 0)})
          </Text>

        </TouchableOpacity>

        {/* Only show Activity tab for admins */}
        {isAdmin && (
          <TouchableOpacity
            style={[styles.tab, activeTab === 'activity' && styles.activeTab]}
            onPress={() => setActiveTab('activity')}
          >
            <MaterialCommunityIcons
              name="history"
              size={18}
              color={activeTab === 'activity' ? '#02B97F' : '#6b7280'}
              style={styles.tabIcon}
            />
            <Text style={[styles.tabText, activeTab === 'activity' && styles.activeTabText]}>
              Activity
            </Text>

          </TouchableOpacity>
        )}
      </View>

      {/* Content */}
      <View style={styles.content}>
        {renderTabContent()}
      </View>


      

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    marginLeft: 16,
    marginRight: 16,
    marginTop: 8,
  },
  // Enhanced Header Styles
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerBtn: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(2, 185, 127, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(2, 185, 127, 0.2)',
  },
  menuBtn: {
    backgroundColor: 'rgba(2, 185, 127, 0.15)',
  },

  // Enhanced Menu Styles
  menuOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  menuContainer: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 34, // Safe area padding
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 15,
  },
  menuHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#d1d5db',
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 8,
  },
  menuHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  menuTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuTitle: {
    fontSize: 20,
    fontFamily: 'Poppins-SemiBold',
    color: '#1f2937',
    marginLeft: 12,
  },
  menuCloseBtn: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
  },
  menuContent: {
    paddingHorizontal: 24,
    paddingTop: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 16,
    marginBottom: 8,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#f3f4f6',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  menuItemIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuItemContent: {
    flex: 1,
    marginLeft: 16,
  },
  menuItemTitle: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    color: '#1f2937',
    marginBottom: 2,
  },
  menuItemSubtitle: {
    fontSize: 13,
    fontFamily: 'Poppins-Regular',
    color: '#6b7280',
  },
  dangerMenuItem: {
    backgroundColor: '#fef2f2',
    borderColor: '#fecaca',
  },
  dangerText: {
    color: '#ef4444',
  },
  dangerSubtext: {
    color: '#ef4444',
    opacity: 0.7,
  },
  menuDivider: {
    height: 1,
    backgroundColor: '#e5e7eb',
    marginVertical: 16,
    marginHorizontal: 16,
  },

  // Enhanced Menu Item Styles
  enhancedMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderRadius: 20,
    backgroundColor: '#ffffff',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    shadowColor: '#64748b',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  enhancedMenuItemIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 18,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.8)',
  },
  enhancedMenuItemContent: {
    flex: 1,
  },
  enhancedMenuItemTitle: {
    fontSize: 17,
    fontFamily: 'Poppins-SemiBold',
    color: '#1e293b',
    marginBottom: 4,
  },
  enhancedMenuItemSubtitle: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#64748b',
    lineHeight: 20,
  },
  enhancedMenuDivider: {
    height: 1,
    backgroundColor: '#e2e8f0',
    marginVertical: 16,
    marginHorizontal: 20,
  },
  enhancedDangerMenuItem: {
    borderColor: 'rgba(239, 68, 68, 0.15)',
    backgroundColor: 'rgba(254, 242, 242, 0.8)',
  },
  enhancedDangerText: {
    color: '#dc2626',
  },
  enhancedDangerSubtext: {
    color: '#ef4444',
  },

  // Clean Modal Styles for Group Info
  cleanModalContent: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  cleanGroupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    marginBottom: 24,
  },
  cleanGroupIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#E8F5F0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  cleanGroupInfo: {
    flex: 1,
  },
  cleanGroupName: {
    fontSize: 20,
    fontFamily: 'Poppins-SemiBold',
    color: '#1e293b',
    marginBottom: 4,
  },
  cleanMemberCount: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#64748b',
  },
  cleanDetailsSection: {
    gap: 20,
  },
  cleanInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  cleanInfoLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  cleanInfoLabel: {
    fontSize: 16,
    fontFamily: 'Poppins-Medium',
    color: '#374151',
    marginLeft: 12,
  },
  cleanCodeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  cleanCodeText: {
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: 16,
    fontWeight: '600',
    color: '#02B97F',
    letterSpacing: 2,
    marginRight: 8,
  },
  cleanCopyBtn: {
    padding: 4,
  },
  cleanInfoValue: {
    fontSize: 15,
    fontFamily: 'Poppins-Regular',
    color: '#64748b',
  },
  cleanRoleBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#f1f5f9',
  },
  cleanRoleText: {
    fontSize: 14,
    fontFamily: 'Poppins-SemiBold',
  },
  cleanSuccessMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0fdf4',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#bbf7d0',
  },
  cleanSuccessText: {
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    color: '#15803d',
    marginLeft: 8,
  },
  cleanActionSection: {
    marginTop: 24,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  cleanLeaveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fef2f2',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  cleanLeaveButtonText: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    color: '#dc2626',
    marginLeft: 8,
  },

  // Clean Edit Modal Styles
  cleanEditContent: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  cleanInputContainer: {
    marginBottom: 20,
  },
  cleanInputLabel: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    color: '#374151',
    marginBottom: 8,
  },
  cleanInput: {
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    color: '#1f2937',
    backgroundColor: '#ffffff',
  },
  cleanErrorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef2f2',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  cleanErrorText: {
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    color: '#dc2626',
    marginLeft: 6,
  },
  cleanButtonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  cleanCancelButton: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cleanCancelButtonText: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    color: '#64748b',
  },
  cleanSaveButton: {
    flex: 1,
    flexDirection: 'row',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: '#02B97F',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    shadowColor: '#02B97F',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  cleanSaveButtonText: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    color: '#ffffff',
  },

  // Remove Member Modal Styles
  confirmationText: {
    fontSize: 16,
    color: '#374151',
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 24,
  },
  warningText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  warningIconContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  enhancedConfirmationText: {
    fontSize: 18,
    fontFamily: 'Poppins-SemiBold',
    color: '#1f2937',
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 26,
  },
  enhancedWarningText: {
    fontSize: 15,
    fontFamily: 'Poppins-Regular',
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 22,
  },
  enhancedButtonContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  enhancedCancelButton: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  enhancedCancelButtonText: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    color: '#64748b',
  },
  enhancedRemoveButton: {
    flex: 1,
    flexDirection: 'row',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: '#ef4444',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    shadowColor: '#ef4444',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  enhancedRemoveButtonText: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    color: '#ffffff',
  },
  minimalModalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 24,
    width: '80%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  minimalModalTitle: {
    fontSize: 18,
    fontFamily: 'Poppins-SemiBold',
    color: '#1f2937',
    marginBottom: 16,
  },
  minimalModalText: {
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  minimalButtonContainer: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  minimalCancelButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
  },
  minimalCancelText: {
    fontSize: 16,
    fontFamily: 'Poppins-Medium',
    color: '#6b7280',
  },
  minimalRemoveButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#ef4444',
    alignItems: 'center',
  },
  minimalRemoveText: {
    fontSize: 16,
    fontFamily: 'Poppins-Medium',
    color: '#ffffff',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    width: '100%',
  },
  infoLabel: {
    fontSize: 16,
    fontFamily: 'Poppins-Medium',
    color: '#6b7280',
  },
  infoValue: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    color: '#1f2937',
  },
  codeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  codeText: {
    fontSize: 16,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    color: '#02B97F',
  },
  copyButton: {
    padding: 4,
  },
  minimalInput: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    color: '#1f2937',
    backgroundColor: '#ffffff',
    width: '100%',
    marginBottom: 16,
  },
  minimalErrorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef2f2',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  minimalErrorText: {
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    color: '#dc2626',
    marginLeft: 6,
  },
  minimalSaveButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#02B97F',
    alignItems: 'center',
  },
  minimalSaveText: {
    fontSize: 16,
    fontFamily: 'Poppins-Medium',
    color: '#ffffff',
  },
  minimalCodeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8fafc',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    gap: 12,
  },
  minimalCodeText: {
    fontSize: 20,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontWeight: '700',
    color: '#02B97F',
    letterSpacing: 2,
  },
  minimalCopyButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#E8F5F0',
  },
  minimalSuccessMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f0fdf4',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 16,
    gap: 6,
    borderWidth: 1,
    borderColor: '#bbf7d0',
  },
  minimalSuccessText: {
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    color: '#16a34a',
  },
  minimalShareButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#02B97F',
    alignItems: 'center',
  },
  minimalShareText: {
    fontSize: 16,
    fontFamily: 'Poppins-Medium',
    color: '#ffffff',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  cancelButtonText: {
    color: '#374151',
    fontWeight: '500',
  },
  removeButtonText: {
    color: '#ffffff',
    fontWeight: '600',
  },


  // Enhanced Tab Styles
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: 4,
    marginTop: 20,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 4,
    borderWidth: 2,
    borderColor: '#e5e7eb',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: 'center',
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  singleTab: {
    flex: 1, // Takes full width when it's the only tab
  },
  activeTab: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#02B97F',
    shadowColor: 'rgba(2, 185, 127, 0.4)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  tabIcon: {
    marginRight: 6,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#6b7280',
  },
  activeTabText: {
    color: '#02B97F',
    fontWeight: '600',
  },

  content: {
    flex: 1,
    paddingHorizontal: 4,
    backgroundColor: '#ffffff',
    paddingTop: 8,
  },

  infoCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 24,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#f3f4f6',
  },
  infoTitle: {
    fontSize: 20,
    fontFamily: 'Poppins-SemiBold',
    color: '#1f2937',
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 15,
    fontFamily: 'Poppins-Medium',
    color: '#6b7280',
    flex: 1,
  },
  infoValue: {
    fontSize: 15,
    fontFamily: 'Poppins-Regular',
    color: '#1f2937',
    flex: 2,
    textAlign: 'right',
  },
  statsCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#f3f4f6',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 28,
    fontFamily: 'Poppins-Bold',
    color: '#1f2937',
  },
  statLabel: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#6b7280',
    marginTop: 4,
  },
  listContainer: {
    paddingTop: 24,
  },

  // Members Tab Styles
  membersContainer: {
    flex: 1,
    paddingTop: 16,
  },
  adminSection: {
    marginBottom: 24,
  },
  membersSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  adminCard: {
    backgroundColor: 'rgba(2, 185, 127, 0.05)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(2, 185, 127, 0.2)',
  },
  adminAvatar: {
    backgroundColor: 'rgba(2, 185, 127, 0.1)',
    borderColor: 'rgba(2, 185, 127, 0.3)',
  },
  emptyMembersContainer: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyMembersText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#6b7280',
    marginTop: 12,
    marginBottom: 4,
  },
  emptyMembersSubtext: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
  },
  memberItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 20,
    paddingHorizontal: 20,
    marginBottom: 16,
    borderRadius: 16,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  memberInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  memberAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  memberInitial: {
    fontSize: 20,
    fontFamily: 'Poppins-Bold',
    color: '#374151',
  },
  memberDetails: {
    flex: 1,
  },
  memberName: {
    fontSize: 17,
    fontFamily: 'Poppins-SemiBold',
    color: '#1f2937',
    marginBottom: 4,
  },
  memberMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  roleTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  adminRoleTag: {
    backgroundColor: 'rgba(2, 185, 127, 0.1)',
  },
  roleText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6b7280',
    marginLeft: 4,
    textTransform: 'capitalize',
  },
  adminRoleText: {
    color: '#02B97F',
  },

  memberActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  chevronIcon: {
    marginLeft: 8,
  },

  removeButton: {
    padding: 6,
    borderRadius: 6,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },

  activityItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 20,
    paddingHorizontal: 20,
    marginBottom: 16,
    borderRadius: 16,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  activityIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  activityContent: {
    flex: 1,
    paddingTop: 2,
  },
  activityMessage: {
    fontSize: 15,
    fontFamily: 'Poppins-Medium',
    color: '#1f2937',
    marginBottom: 8,
    lineHeight: 22,
  },
  activityTime: {
    fontSize: 13,
    fontFamily: 'Poppins-Regular',
    color: '#9ca3af',
  },
  activityUser: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: '#6b7280',
    marginTop: 2,
    fontStyle: 'italic',
  },
  activityTabContainer: {
    flex: 1,
  },
  emptyActivityContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyActivityText: {
    fontSize: 18,
    fontFamily: 'Poppins-SemiBold',
    color: '#374151',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyActivitySubtext: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#9ca3af',
    textAlign: 'center',
  },
  accessDeniedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  accessDeniedText: {
    fontSize: 18,
    fontFamily: 'Poppins-SemiBold',
    color: '#374151',
    marginTop: 16,
    marginBottom: 8,
  },
  accessDeniedSubtext: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#9ca3af',
    textAlign: 'center',
  },

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingVertical: 60,
  },
  loadingText: {
    fontSize: 18,
    fontFamily: 'Poppins-Medium',
    color: '#6b7280',
    marginTop: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingVertical: 60,
  },
  errorText: {
    fontSize: 18,
    fontFamily: 'Poppins-Medium',
    color: '#ef4444',
    marginTop: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 28,
    width: '85%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1f2937',
    marginLeft: 12,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#1f2937',
    fontFamily: 'Poppins-Regular',
    width: '100%',
    marginBottom: 12,
    backgroundColor: '#f8fafc',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  button: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
  },
  // Add improved styles for info/statistics cards
  infoRowBetter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  infoLabelBetter: {
    fontSize: 16,
    fontFamily: 'Poppins-Medium',
    color: '#6b7280',
    flex: 1.2,
  },
  infoValueBetter: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    color: '#1f2937',
    flex: 2,
    textAlign: 'right',
  },
  statsCardBetter: {
    backgroundColor: '#f8fafc',
    borderRadius: 20,
    padding: 28,
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  statsGridBetter: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
  },
  statItemBetter: {
    alignItems: 'center',
    flex: 1,
    paddingVertical: 8,
  },
  statNumberBetter: {
    fontSize: 32,
    fontFamily: 'Poppins-Bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  statLabelBetter: {
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    color: '#6b7280',
    textAlign: 'center',
  },
  infoBtn: {
    padding: 10,
    marginLeft: 4,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  bottomSheetModalContent: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 32,
    width: '100%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  infoCardBetter: {
    backgroundColor: '#f8fafc',
    borderRadius: 20,
    padding: 28,
    width: '100%',
    marginTop: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  infoRowBetterClean: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  codeCopyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  codeBox: {
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    backgroundColor: '#f3f4f6',
    color: '#374151',
    fontSize: 18,
    fontWeight: '600',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginRight: 4,
    minWidth: 80,
    textAlign: 'center',
    letterSpacing: 2,
  },
  copyBtn: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
    marginLeft: 4,
  },
  copiedText: {
    marginLeft: 12,
    color: '#374151',
    fontSize: 14,
    fontFamily: 'Poppins-SemiBold',
  },
  inviteBtn: {
    padding: 10,
    marginLeft: 4,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  shareBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#02B97F',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 28,
    marginTop: 16,
    width: '100%',
    gap: 8,
    shadowColor: '#02B97F',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  shareBtnText: {
    color: '#ffffff',
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    marginLeft: 8,
  },

  // Enhanced Modal Styles
  enhancedModalContent: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingTop: 8,
    paddingBottom: 32,
    paddingHorizontal: 24,
    width: '100%',
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 12,
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#d1d5db',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  modalTitle: {
    fontSize: 22,
    fontFamily: 'Poppins-SemiBold',
    color: '#1f2937',
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalContentContainer: {
    flex: 1,
  },
  groupDetailsCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  groupIconHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  groupIconLarge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#E8F5F0',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 3,
    borderColor: '#ffffff',
    shadowColor: '#02B97F',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  groupNameLarge: {
    fontSize: 24,
    fontFamily: 'Poppins-Bold',
    color: '#1f2937',
    textAlign: 'center',
    marginBottom: 4,
  },
  groupMemberCount: {
    fontSize: 16,
    fontFamily: 'Poppins-Medium',
    color: '#6b7280',
    textAlign: 'center',
  },
  infoSection: {
    gap: 16,
  },
  infoRowEnhanced: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#f3f4f6',
    gap: 12,
  },
  infoIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoLabelEnhanced: {
    fontSize: 16,
    fontFamily: 'Poppins-Medium',
    color: '#374151',
    flex: 1,
  },
  infoValueEnhanced: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    color: '#1f2937',
  },
  codeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  codeBoxEnhanced: {
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    backgroundColor: '#E8F5F0',
    color: '#02B97F',
    fontSize: 16,
    fontWeight: '700',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    letterSpacing: 2,
    minWidth: 80,
    textAlign: 'center',
  },
  copyBtnEnhanced: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E8F5F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  successMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f0fdf4',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 20,
    gap: 8,
    borderWidth: 1,
    borderColor: '#bbf7d0',
  },
  successText: {
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    color: '#16a34a',
  },
  modalActions: {
    gap: 12,
  },
  leaveGroupButtonEnhanced: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fef2f2',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#fecaca',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  leaveGroupButtonTextEnhanced: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    color: '#dc2626',
  },
  // Invite Modal Styles
  inviteInstructions: {
    backgroundColor: '#f0f9ff',
    padding: 20,
    borderRadius: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#e0f2fe',
  },
  instructionTitle: {
    fontSize: 18,
    fontFamily: 'Poppins-SemiBold',
    color: '#1f2937',
    marginBottom: 8,
  },
  instructionText: {
    fontSize: 15,
    fontFamily: 'Poppins-Regular',
    color: '#6b7280',
    lineHeight: 22,
  },
  codeDisplayCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  codeDisplayHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  codeDisplayLabel: {
    fontSize: 16,
    fontFamily: 'Poppins-Medium',
    color: '#374151',
  },
  codeDisplayContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#f3f4f6',
  },
  codeDisplayText: {
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: 24,
    fontWeight: '700',
    color: '#02B97F',
    letterSpacing: 4,
    backgroundColor: '#E8F5F0',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    textAlign: 'center',
    minWidth: 120,
  },
  copyBtnLarge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E8F5F0',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#02B97F',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  inviteActions: {
    gap: 12,
  },
  shareBtnEnhanced: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#02B97F',
    paddingVertical: 18,
    paddingHorizontal: 24,
    borderRadius: 16,
    gap: 8,
    shadowColor: '#02B97F',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  shareBtnTextEnhanced: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    color: '#ffffff',
  },
}); 