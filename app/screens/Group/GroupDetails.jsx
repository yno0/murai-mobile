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
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editGroupName, setEditGroupName] = useState('');
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState('');
  const [infoModalVisible, setInfoModalVisible] = useState(false);
  const [copied, setCopied] = useState(false);
  const [inviteModalVisible, setInviteModalVisible] = useState(false);
  const [activities, setActivities] = useState([]);
  const [activitiesLoading, setActivitiesLoading] = useState(false);

  // Helper to check if current user is admin
  const isAdmin = groupData && user && (
    (groupData.adminId && (groupData.adminId === user.id || groupData.adminId === user._id)) ||
    (groupData.members && groupData.members.find(m => m.role === 'admin' && (m.id === user.id || m.id === user._id)))
  );
  console.log('user:', user);
  console.log('groupData:', groupData);
  console.log('isAdmin:', isAdmin);

  useEffect(() => {
    if (groupId) {
      fetchGroupDetails(groupId);
      fetchGroupActivities(groupId);
    }
  }, [groupId]);

  const fetchGroupDetails = async (id) => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get(`/users/groups/${id}`);
      setGroupData(res.data);
    } catch (err) {
      setError('Failed to load group details');
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
      await api.post(`/users/groups/${groupId}/activities`, {
        type,
        message,
        metadata,
        userId: user?.id || user?._id,
        userName: user?.name || user?.username || 'Unknown User'
      });
      // Refresh activities after recording
      fetchGroupActivities(groupId);
    } catch (err) {
      console.error('Failed to record activity:', err);
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

  const openEditModal = () => {
    setEditGroupName(groupData?.name || '');
    setEditError('');
    setEditModalVisible(true);
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
      await api.put(`/users/groups/${groupData.id}`, { name: editGroupName.trim() });

      // Record activity
      await recordActivity(
        'group_updated',
        `Group name changed from "${oldName}" to "${editGroupName.trim()}"`,
        { oldName, newName: editGroupName.trim() }
      );

      setEditModalVisible(false);
      fetchGroupDetails(groupData.id);
    } catch (err) {
      setEditError('Failed to update group name');
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

  const renderMemberItem = ({ item }) => (
    <View style={styles.memberItem}>
      <View style={styles.memberInfo}>
        <View style={styles.memberAvatar}>
          <Text style={styles.memberInitial}>{item.name.charAt(0)}</Text>
        </View>
        <View style={styles.memberDetails}>
          <Text style={styles.memberName}>{item.name}</Text>
          <Text style={styles.memberRole}>{item.role}</Text>
        </View>
      </View>
      <View style={styles.memberStatus}>
        <View style={[styles.statusDot, { backgroundColor: item.status === 'online' ? '#10B981' : '#9CA3AF' }]} />
        <Text style={styles.memberJoined}>Joined {item.joinedAt}</Text>
      </View>
    </View>
  );

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
          <FlatList
            data={groupData.members}
            renderItem={renderMemberItem}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContainer}
          />
        );
      case 'activity':
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
          <ScrollView showsVerticalScrollIndicator={false} style={styles.overviewContainer}>
            <View style={styles.statsCardBetter}>
              <Text style={styles.infoTitle}>Statistics</Text>
              <View style={styles.statsGridBetter}>
                <View style={styles.statItemBetter}>
                  <Text style={styles.statNumberBetter}>{typeof groupData.memberCount === 'number' ? groupData.memberCount : (groupData.members ? groupData.members.length : 0)}</Text>
                  <Text style={styles.statLabelBetter}>Members</Text>
                </View>
                <View style={styles.statItemBetter}>
                  <Text style={styles.statNumberBetter}>3</Text>
                  <Text style={styles.statLabelBetter}>Online</Text>
                </View>
                <View style={styles.statItemBetter}>
                  <Text style={styles.statNumberBetter}>12</Text>
                  <Text style={styles.statLabelBetter}>Detections</Text>
                </View>
              </View>
            </View>
          </ScrollView>
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
        animationType="slide"
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Group Name</Text>
            <TextInput
              style={styles.input}
              value={editGroupName}
              onChangeText={setEditGroupName}
              placeholder="Group name"
              placeholderTextColor="#9CA3AF"
            />
            {editError ? <Text style={styles.errorText}>{editError}</Text> : null}
            <View style={{ flexDirection: 'row', gap: 12, marginTop: 16 }}>
              <TouchableOpacity
                style={[styles.button, { backgroundColor: '#F3F4F6' }]}
                onPress={() => setEditModalVisible(false)}
                disabled={editLoading}
              >
                <Text style={{ color: '#374151' }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, { backgroundColor: '#3B82F6' }]}
                onPress={handleEditGroup}
                disabled={editLoading}
              >
                {editLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={{ color: '#fff' }}>Save</Text>
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
        animationType="slide"
        onRequestClose={() => setInfoModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.enhancedModalContent}>
            {/* Modal Handle */}
            <View style={styles.modalHandle} />

            {/* Header */}
            <View style={styles.modalHeader}>
              <View style={styles.modalTitleContainer}>
                <MaterialCommunityIcons name="information" size={24} color="#02B97F" />
                <Text style={styles.modalTitle}>Group Information</Text>
              </View>
              <TouchableOpacity style={styles.closeButton} onPress={() => setInfoModalVisible(false)}>
                <MaterialCommunityIcons name="close" size={20} color="#6b7280" />
              </TouchableOpacity>
            </View>

            {/* Content */}
            <View style={styles.modalContentContainer}>
              {/* Group Details Card */}
              <View style={styles.groupDetailsCard}>
                <View style={styles.groupIconHeader}>
                  <View style={styles.groupIconLarge}>
                    <MaterialCommunityIcons name="account-group" size={32} color="#02B97F" />
                  </View>
                  <Text style={styles.groupNameLarge}>{groupData?.name}</Text>
                  <Text style={styles.groupMemberCount}>
                    {groupData?.memberCount || (groupData?.members?.length || 0)} members
                  </Text>
                </View>

                {/* Group Info Rows */}
                <View style={styles.infoSection}>
                  <View style={styles.infoRowEnhanced}>
                    <View style={styles.infoIconContainer}>
                      <MaterialCommunityIcons name="key-variant" size={18} color="#6b7280" />
                    </View>
                    <Text style={styles.infoLabelEnhanced}>Group Code</Text>
                    <View style={styles.codeContainer}>
                      <Text style={styles.codeBoxEnhanced}>{groupData?.shortCode || '-'}</Text>
                      {groupData?.shortCode && (
                        <TouchableOpacity style={styles.copyBtnEnhanced} onPress={() => handleCopyCode(groupData.shortCode)}>
                          <MaterialCommunityIcons name="content-copy" size={16} color="#02B97F" />
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>

                  <View style={styles.infoRowEnhanced}>
                    <View style={styles.infoIconContainer}>
                      <MaterialCommunityIcons name="calendar" size={18} color="#6b7280" />
                    </View>
                    <Text style={styles.infoLabelEnhanced}>Created</Text>
                    <Text style={styles.infoValueEnhanced}>{formatDateTime(groupData?.createdAt)}</Text>
                  </View>

                  <View style={styles.infoRowEnhanced}>
                    <View style={styles.infoIconContainer}>
                      <MaterialCommunityIcons name="crown" size={18} color="#6b7280" />
                    </View>
                    <Text style={styles.infoLabelEnhanced}>Your Role</Text>
                    <Text style={[styles.infoValueEnhanced, { color: isAdmin ? '#02B97F' : '#6b7280' }]}>
                      {isAdmin ? 'Admin' : 'Member'}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Copy Success Message */}
              {copied && (
                <View style={styles.successMessage}>
                  <MaterialCommunityIcons name="check-circle" size={16} color="#10b981" />
                  <Text style={styles.successText}>Code copied to clipboard!</Text>
                </View>
              )}

              {/* Action Buttons */}
              <View style={styles.modalActions}>
                {!isAdmin && (
                  <TouchableOpacity style={styles.leaveGroupButtonEnhanced} onPress={handleLeaveGroup}>
                    <MaterialCommunityIcons name="exit-to-app" size={20} color="#dc2626" />
                    <Text style={styles.leaveGroupButtonTextEnhanced}>Leave Group</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </View>
        </View>
      </Modal>
      {/* Invite Modal */}
      <Modal
        visible={inviteModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setInviteModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.enhancedModalContent}>
            {/* Modal Handle */}
            <View style={styles.modalHandle} />

            {/* Header */}
            <View style={styles.modalHeader}>
              <View style={styles.modalTitleContainer}>
                <MaterialCommunityIcons name="account-plus" size={24} color="#02B97F" />
                <Text style={styles.modalTitle}>Invite to Group</Text>
              </View>
              <TouchableOpacity style={styles.closeButton} onPress={() => setInviteModalVisible(false)}>
                <MaterialCommunityIcons name="close" size={20} color="#6b7280" />
              </TouchableOpacity>
            </View>

            {/* Content */}
            <View style={styles.modalContentContainer}>
              {/* Invite Instructions */}
              <View style={styles.inviteInstructions}>
                <Text style={styles.instructionTitle}>Share this code with others</Text>
                <Text style={styles.instructionText}>
                  Anyone with this code can join "{groupData?.name}"
                </Text>
              </View>

              {/* Code Display */}
              <View style={styles.codeDisplayCard}>
                <View style={styles.codeDisplayHeader}>
                  <MaterialCommunityIcons name="key-variant" size={20} color="#6b7280" />
                  <Text style={styles.codeDisplayLabel}>Group Code</Text>
                </View>
                <View style={styles.codeDisplayContainer}>
                  <Text style={styles.codeDisplayText}>{groupData?.shortCode || '-'}</Text>
                  {groupData?.shortCode && (
                    <TouchableOpacity style={styles.copyBtnLarge} onPress={() => handleCopyCode(groupData.shortCode)}>
                      <MaterialCommunityIcons name="content-copy" size={20} color="#02B97F" />
                    </TouchableOpacity>
                  )}
                </View>
              </View>

              {/* Copy Success Message */}
              {copied && (
                <View style={styles.successMessage}>
                  <MaterialCommunityIcons name="check-circle" size={16} color="#10b981" />
                  <Text style={styles.successText}>Code copied to clipboard!</Text>
                </View>
              )}

              {/* Action Buttons */}
              <View style={styles.inviteActions}>
                <TouchableOpacity style={styles.shareBtnEnhanced} onPress={() => handleShare(groupData?.shortCode)}>
                  <MaterialCommunityIcons name="share-variant" size={20} color="#ffffff" />
                  <Text style={styles.shareBtnTextEnhanced}>Share Invite</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>
      {/* Header */}
      <Header
        title={groupData?.name || 'Group Details'}
        showBackButton={true}
        onBackPress={() => navigation.goBack()}
        rightContent={
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            {isAdmin && (
              <TouchableOpacity style={styles.headerBtn} onPress={openEditModal}>
                <MaterialCommunityIcons name="pencil" size={20} color="#374151" />
              </TouchableOpacity>
            )}
            <TouchableOpacity style={styles.headerBtn} onPress={() => setInviteModalVisible(true)}>
              <MaterialCommunityIcons name="account-plus" size={20} color="#10B981" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerBtn} onPress={() => setInfoModalVisible(true)}>
              <MaterialCommunityIcons name="information-outline" size={20} color="#3B82F6" />
            </TouchableOpacity>
          </View>
        }
        style={{ paddingHorizontal: 0 }}
      />




      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'overview' && styles.activeTab]}
          onPress={() => setActiveTab('overview')}
        >
          <Text style={[styles.tabText, activeTab === 'overview' && styles.activeTabText]}>
            Overview
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'members' && styles.activeTab]}
          onPress={() => setActiveTab('members')}
        >
          <Text style={[styles.tabText, activeTab === 'members' && styles.activeTabText]}>
            Members ({groupData?.memberCount || (groupData?.members?.length || 0)})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'activity' && styles.activeTab]}
          onPress={() => setActiveTab('activity')}
        >
          <Text style={[styles.tabText, activeTab === 'activity' && styles.activeTabText]}>
            Activity
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {renderTabContent()}
      </View>

      {/* Action Buttons */}
      {isAdmin && (
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.inviteButton} onPress={handleInviteMember}>
            <MaterialCommunityIcons name="account-plus" size={20} color="#FFFFFF" />
            <Text style={styles.inviteButtonText}>Invite Member</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.deleteButton} onPress={handleDeleteGroup}>
            <MaterialCommunityIcons name="delete" size={20} color="#EF4444" />
            <Text style={styles.deleteButtonText}>Delete Group</Text>
          </TouchableOpacity>
        </View>
      )}
      

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  headerBtn: {
    padding: 10,
    marginLeft: 4,
    borderRadius: 12,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },


  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginTop: 20,
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    padding: 6,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  tab: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    borderRadius: 12,
  },
  activeTab: {
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  tabText: {
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    color: '#6b7280',
  },
  activeTabText: {
    color: '#1f2937',
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    backgroundColor: '#ffffff',
    paddingTop: 8,
  },
  overviewContainer: {
    paddingTop: 20,
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
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
  memberRole: {
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    color: '#6b7280',
    textTransform: 'capitalize',
  },
  memberStatus: {
    alignItems: 'flex-end',
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  memberJoined: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: '#9ca3af',
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
  actionButtons: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 24,
    gap: 16,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    marginBottom: 0,
  },
  inviteButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#02B97F',
    paddingVertical: 18,
    borderRadius: 16,
    gap: 8,
    shadowColor: '#02B97F',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  inviteButtonText: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    color: '#ffffff',
  },
  deleteButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fef2f2',
    paddingVertical: 18,
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
  deleteButtonText: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    color: '#dc2626',
  },
  leaveButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fef2f2',
    paddingVertical: 18,
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
  leaveButtonText: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    color: '#dc2626',
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
  modalTitle: {
    fontSize: 20,
    fontFamily: 'Poppins-SemiBold',
    color: '#1f2937',
    marginBottom: 20,
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
  leaveGroupButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fef2f2',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginTop: 20,
    borderWidth: 1,
    borderColor: '#fecaca',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  leaveGroupButtonText: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    color: '#dc2626',
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