import { Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useState } from 'react';
import {
    Alert,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

const UsersOverview = require('./UsersOverview').default;
const UsersList = require('./UsersList').default;
const MainHeader = require('../../../components/common/MainHeader').default;

// API configuration
const API_BASE_URL = 'https://murai-server.onrender.com/api';

export default function AdminUsersScreen() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [selectedUser, setSelectedUser] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentView, setCurrentView] = useState('overview'); // 'overview' or 'list'
  const [debugInfo, setDebugInfo] = useState('');
  // Pagination state removed for simplicity - can be added later if needed

  // Debug function to check auth state
  const checkAuthState = useCallback(async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const user = await AsyncStorage.getItem('user');
      const parsedUser = user ? JSON.parse(user) : null;

      const authState = {
        hasToken: !!token,
        tokenPreview: token ? token.substring(0, 20) + '...' : 'None',
        user: parsedUser,
        isAdmin: parsedUser?.role === 'admin'
      };

      console.log('🔍 Auth State Check:', authState);
      setDebugInfo(JSON.stringify(authState, null, 2));

      if (!token) {
        Alert.alert('Authentication Required', 'Please log in as admin first to access user management.');
      } else if (!parsedUser || parsedUser.role !== 'admin') {
        Alert.alert('Admin Access Required', 'You need admin privileges to access this feature.');
      }

      return authState;
    } catch (error) {
      console.error('Auth state check error:', error);
      return null;
    }
  }, []);

  // Helper function to get auth token
  const getAuthToken = async () => {
    try {
      const token = await AsyncStorage.getItem('token'); // Fixed: should be 'token' not 'authToken'
      return token;
    } catch (error) {
      console.error('Error getting auth token:', error);
      return null;
    }
  };

  // Helper function to make authenticated API calls
  const makeAuthenticatedRequest = useCallback(async (url, options = {}) => {
    const token = await getAuthToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${API_BASE_URL}${url}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }, []);

  const loadUsers = useCallback(async () => {
    console.log('🔄 Loading users...');
    setLoading(true);
    try {
      const token = await getAuthToken();
      console.log('🔑 Token exists:', !!token);

      if (!token) {
        console.error('❌ No token found');
        Alert.alert('Error', 'Please log in as admin first');
        return;
      }

      const params = new URLSearchParams({
        page: '1',
        limit: '50',
        search: searchQuery,
        status: selectedFilter === 'all' ? '' : selectedFilter,
        sortBy: 'createdAt',
        sortOrder: 'desc'
      });

      console.log('📡 Making API call to:', `${API_BASE_URL}/admin/users?${params}`);
      const data = await makeAuthenticatedRequest(`/admin/users?${params}`);
      console.log('✅ API response:', data);

      // Transform the data to match the expected format
      const transformedUsers = data.users.map(user => ({
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role.charAt(0).toUpperCase() + user.role.slice(1), // Capitalize first letter
        status: user.status.charAt(0).toUpperCase() + user.status.slice(1), // Capitalize first letter
        isPremium: user.isPremium || false,
        joinedAt: new Date(user.createdAt),
        lastActive: user.lastActive ? new Date(user.lastActive) : new Date(user.createdAt)
      }));

      console.log('📊 Transformed users:', transformedUsers.length, 'users');
      setUsers(transformedUsers);
      // setPagination(data.pagination); // Removed for simplicity
    } catch (error) {
      console.error('❌ Load users error:', error);
      Alert.alert('Error', error.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  }, [searchQuery, selectedFilter, makeAuthenticatedRequest]);

  // Remove filterUsers since we're now filtering on the server side

  useEffect(() => {
    checkAuthState(); // Check auth state first
    loadUsers();
  }, [loadUsers, checkAuthState]);

  // Debounce search to avoid too many API calls
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      loadUsers();
    }, 300); // 300ms debounce

    return () => clearTimeout(timeoutId);
  }, [searchQuery, loadUsers]);

  // Reload users immediately when filter changes (no debounce needed)
  useEffect(() => {
    loadUsers();
  }, [selectedFilter, loadUsers]);

  const handleUserAction = async (userId, action) => {
    try {
      let updateData = {};
      let successMessage = '';

      if (action === 'activate' || action === 'deactivate') {
        updateData.status = action === 'activate' ? 'active' : 'inactive';
        successMessage = `User ${action === 'activate' ? 'activated' : 'deactivated'} successfully`;
      } else if (action === 'addPremium' || action === 'removePremium') {
        updateData.isPremium = action === 'addPremium';
        successMessage = `User ${action === 'addPremium' ? 'upgraded to premium' : 'downgraded from premium'} successfully`;
      }

      await makeAuthenticatedRequest(`/admin/users/${userId}`, {
        method: 'PUT',
        body: JSON.stringify(updateData),
      });

      // Update local state
      const updatedUsers = users.map(user => {
        if (user.id === userId) {
          const updatedUser = { ...user };

          if (updateData.status) {
            updatedUser.status = updateData.status === 'active' ? 'Active' : 'Inactive';
            if (updateData.status === 'active') {
              updatedUser.lastActive = new Date();
            }
          }

          if (updateData.isPremium !== undefined) {
            updatedUser.isPremium = updateData.isPremium;
          }

          return updatedUser;
        }
        return user;
      });

      setUsers(updatedUsers);

      // Update selected user for modal
      if (selectedUser && selectedUser.id === userId) {
        const updatedSelectedUser = updatedUsers.find(u => u.id === userId);
        setSelectedUser(updatedSelectedUser);
      }

      Alert.alert('Success', successMessage);

    } catch (error) {
      console.error('User action error:', error);
      Alert.alert('Error', error.message || 'Failed to update user');
    }
  };

  const openUserModal = (user) => {
    setSelectedUser(user);
    setModalVisible(true);
  };

  // These render functions are now handled by the UsersList component

  const renderViewToggle = () => (
    <View style={styles.viewToggleContainer}>
      <TouchableOpacity
        style={[
          styles.viewToggleButton,
          currentView === 'overview' && styles.viewToggleButtonActive
        ]}
        onPress={() => setCurrentView('overview')}
      >
        <Feather
          name="pie-chart"
          size={16}
          color={currentView === 'overview' ? '#01B97F' : '#6B7280'}
        />
        <Text style={[
          styles.viewToggleText,
          currentView === 'overview' && styles.viewToggleTextActive
        ]}>
          Overview
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[
          styles.viewToggleButton,
          currentView === 'list' && styles.viewToggleButtonActive
        ]}
        onPress={() => setCurrentView('list')}
      >
        <Feather
          name="list"
          size={16}
          color={currentView === 'list' ? '#01B97F' : '#6B7280'}
        />
        <Text style={[
          styles.viewToggleText,
          currentView === 'list' && styles.viewToggleTextActive
        ]}>
          User List
        </Text>
      </TouchableOpacity>
    </View>
  );

  // Stats are calculated in the UsersOverview component

  const renderOverviewContent = () => (
    <UsersOverview
      users={users}
      loading={loading}
      onRefresh={loadUsers}
    />
  );

  const renderUserListContent = () => (
    <UsersList
      users={users}
      loading={loading}
      onRefresh={loadUsers}
      onUserPress={openUserModal}
      searchQuery={searchQuery}
      onSearchChange={setSearchQuery}
      selectedFilter={selectedFilter}
      onFilterChange={setSelectedFilter}
    />
  );
  return (
    <View style={styles.container}>
      {/* Header */}
      <MainHeader
        title="User Management"
        subtitle="Manage users and their permissions"
        rightActions={[
          {
            icon: 'info',
            iconType: 'feather',
            onPress: checkAuthState
          },
          {
            icon: 'refresh-cw',
            iconType: 'feather',
            onPress: loadUsers
          }
        ]}
        style={{ paddingHorizontal: 0 }}
      />

      {/* View Toggle */}
      {renderViewToggle()}

      {/* Content based on current view */}
      {currentView === 'overview' ? renderOverviewContent() : renderUserListContent()}

      {/* User Details Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          {/* Enhanced Header */}
          <View style={styles.modalHeader}>
            <View style={styles.modalHeaderLeft}>
              <View style={styles.modalHeaderIcon}>
                <Feather name="user" size={20} color="#01B97F" />
              </View>
              <View>
                <Text style={styles.modalTitle}>User Details</Text>
                <Text style={styles.modalSubtitle}>Manage user information and permissions</Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}
            >
              <Feather name="x" size={20} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            {selectedUser && (
              <>
                {/* User Profile Section */}
                <View style={styles.profileSection}>
                  <View style={styles.profileHeader}>
                    <View style={styles.avatarContainer}>
                      <Text style={styles.avatarText}>
                        {selectedUser.name.charAt(0).toUpperCase()}
                      </Text>
                    </View>
                    <View style={styles.profileInfo}>
                      <Text style={styles.profileName}>{selectedUser.name}</Text>
                      <Text style={styles.profileEmail}>{selectedUser.email}</Text>
                      <View style={styles.profileBadges}>
                        <View style={[styles.badge, styles.roleBadge, {
                          backgroundColor: selectedUser.role === 'Admin' ? '#e8f5f0' : '#f3f4f6'
                        }]}>
                          <Feather
                            name={selectedUser.role === 'Admin' ? 'shield' : 'user'}
                            size={12}
                            color={selectedUser.role === 'Admin' ? '#01B97F' : '#6b7280'}
                          />
                          <Text style={[styles.badgeText, {
                            color: selectedUser.role === 'Admin' ? '#01B97F' : '#6b7280'
                          }]}>
                            {selectedUser.role}
                          </Text>
                        </View>
                        <View style={[styles.badge, styles.statusBadge, {
                          backgroundColor: selectedUser.status === 'Active' ? '#e8f5f0' : '#fee2e2'
                        }]}>
                          <Feather
                            name={selectedUser.status === 'Active' ? 'check-circle' : 'x-circle'}
                            size={12}
                            color={selectedUser.status === 'Active' ? '#01B97F' : '#EF4444'}
                          />
                          <Text style={[styles.badgeText, {
                            color: selectedUser.status === 'Active' ? '#01B97F' : '#EF4444'
                          }]}>
                            {selectedUser.status}
                          </Text>
                        </View>
                        {selectedUser.isPremium && (
                          <View style={[styles.badge, styles.premiumBadge]}>
                            <Feather name="star" size={12} color="#d97706" />
                            <Text style={[styles.badgeText, { color: '#d97706' }]}>Premium</Text>
                          </View>
                        )}
                      </View>
                    </View>
                  </View>
                </View>

                {/* User Information */}
                <View style={styles.modalSection}>
                  <View style={styles.sectionHeader}>
                    <Feather name="info" size={16} color="#01B97F" />
                    <Text style={styles.sectionTitle}>Account Information</Text>
                  </View>
                  <View style={styles.infoCard}>
                    <View style={styles.infoRow}>
                      <View style={styles.infoRowLeft}>
                        <Feather name="calendar" size={16} color="#6B7280" />
                        <Text style={styles.infoLabel}>Joined Date</Text>
                      </View>
                      <Text style={styles.infoValue}>{selectedUser.joinedAt.toLocaleDateString()}</Text>
                    </View>
                    <View style={styles.infoRow}>
                      <View style={styles.infoRowLeft}>
                        <Feather name="clock" size={16} color="#6B7280" />
                        <Text style={styles.infoLabel}>Last Active</Text>
                      </View>
                      <Text style={styles.infoValue}>{selectedUser.lastActive.toLocaleDateString()}</Text>
                    </View>
                    <View style={styles.infoRow}>
                      <View style={styles.infoRowLeft}>
                        <Feather name="mail" size={16} color="#6B7280" />
                        <Text style={styles.infoLabel}>Email Status</Text>
                      </View>
                      <Text style={[styles.infoValue, { color: '#01B97F' }]}>Verified</Text>
                    </View>
                  </View>
                </View>

                {/* Action Buttons */}
                <View style={styles.modalSection}>
                  <View style={styles.sectionHeader}>
                    <Feather name="settings" size={16} color="#01B97F" />
                    <Text style={styles.sectionTitle}>Quick Actions</Text>
                  </View>
                  <View style={styles.actionGrid}>
                    {selectedUser.status === 'Active' ? (
                      <TouchableOpacity
                        style={[styles.actionCard, styles.deactivateCard]}
                        onPress={() => handleUserAction(selectedUser.id, 'deactivate')}
                      >
                        <View style={styles.actionIconContainer}>
                          <Feather name="user-x" size={24} color="#EF4444" />
                        </View>
                        <Text style={styles.actionTitle}>Deactivate</Text>
                        <Text style={styles.actionSubtitle}>Suspend user access</Text>
                      </TouchableOpacity>
                    ) : (
                      <TouchableOpacity
                        style={[styles.actionCard, styles.activateCard]}
                        onPress={() => handleUserAction(selectedUser.id, 'activate')}
                      >
                        <View style={styles.actionIconContainer}>
                          <Feather name="user-check" size={24} color="#01B97F" />
                        </View>
                        <Text style={styles.actionTitle}>Activate</Text>
                        <Text style={styles.actionSubtitle}>Restore user access</Text>
                      </TouchableOpacity>
                    )}

                    <TouchableOpacity
                      style={[styles.actionCard, selectedUser.isPremium ? styles.removePremiumCard : styles.addPremiumCard]}
                      onPress={() => handleUserAction(selectedUser.id, selectedUser.isPremium ? 'removePremium' : 'addPremium')}
                    >
                      <View style={styles.actionIconContainer}>
                        <Feather name="star" size={24} color="#d97706" />
                      </View>
                      <Text style={styles.actionTitle}>
                        {selectedUser.isPremium ? 'Remove Premium' : 'Add Premium'}
                      </Text>
                      <Text style={styles.actionSubtitle}>
                        {selectedUser.isPremium ? 'Downgrade to regular' : 'Upgrade to premium'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </>
            )}
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    paddingHorizontal: 10,
  },
  scrollContainer: {
    flex: 0,
    paddingHorizontal: 10,
  },
  flatListContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  viewToggleContainer: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 4,
    marginHorizontal: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#f3f4f6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  viewToggleButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 8,
  },
  viewToggleButtonActive: {
    backgroundColor: '#e8f5f0',
  },
  viewToggleText: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#6B7280',
  },
  viewToggleTextActive: {
    fontFamily: 'Poppins-SemiBold',
    color: '#01B97F',
  },
  userListContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  searchSection: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  filterSection: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  flatList: {
    flex: 1,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    color: '#111827',
    marginLeft: 8,
  },
  statsSection: {
    marginTop: 20,
    marginBottom: 24,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#f1f5f9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  statValue: {
    fontSize: 24,
    fontFamily: 'Poppins-Bold',
    color: '#111827',
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: 'Poppins-Medium',
    color: '#6b7280',
    textAlign: 'center',
  },
  userTypeItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f8fafc',
  },
  userTypeLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  userTypeInfo: {
    marginLeft: 12,
  },
  userTypeName: {
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    color: '#111827',
  },
  userTypeDesc: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: '#6b7280',
    marginTop: 2,
  },
  userTypeCount: {
    fontSize: 18,
    fontFamily: 'Poppins-Bold',
    color: '#111827',
  },
  filterContainer: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 4,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  filterButtonActive: {
    backgroundColor: '#e8f5f0',
  },
  filterButtonText: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#6b7280',
  },
  filterButtonTextActive: {
    fontFamily: 'Poppins-SemiBold',
    color: '#01B97F',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    color: '#111827',
  },
  userItem: {
    flexDirection: 'row',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f8fafc',
  },
  userItemLeft: {
    flexDirection: 'row',
    flex: 1,
    alignItems: 'flex-start',
  },
  userStatusIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f8fafc',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  userItemContent: {
    flex: 1,
  },
  userItemName: {
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    color: '#111827',
    lineHeight: 20,
    marginBottom: 4,
  },
  userItemEmail: {
    fontSize: 13,
    fontFamily: 'Poppins-Regular',
    color: '#6b7280',
    lineHeight: 18,
    marginBottom: 6,
  },
  userItemMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  roleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  roleText: {
    fontSize: 11,
    fontFamily: 'Poppins-SemiBold',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  userItemRight: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomSpacing: {
    height: 20,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    color: '#9CA3AF',
    marginTop: 12,
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#9CA3AF',
    textAlign: 'center',
  },
  // Modal Styles (matching overview/list patterns)
  modalContainer: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  modalHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  modalHeaderIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f8fafc',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: 'Poppins-SemiBold',
    color: '#111827',
  },
  modalSubtitle: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: '#6b7280',
    marginTop: 2,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f8fafc',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  modalSection: {
    marginBottom: 20,
  },
  // Profile Section (matching overview card style)
  profileSection: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#f3f4f6',
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#01B97F',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    color: '#ffffff',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    color: '#111827',
    marginBottom: 2,
  },
  profileEmail: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: '#6b7280',
    marginBottom: 8,
  },
  profileBadges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    gap: 3,
  },
  badgeText: {
    fontSize: 10,
    fontFamily: 'Poppins-Medium',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  premiumBadge: {
    backgroundColor: '#fef3c7',
  },
  // Info Card (matching overview card style)
  infoCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#f3f4f6',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f8fafc',
  },
  infoRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoLabel: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: '#6b7280',
  },
  infoValue: {
    fontSize: 12,
    fontFamily: 'Poppins-Medium',
    color: '#111827',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f8fafc',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 11,
    fontFamily: 'Poppins-SemiBold',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  // Action Grid (matching overview status cards)
  actionGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  actionCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#f3f4f6',
    minHeight: 100,
  },
  actionIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f8fafc',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  actionTitle: {
    fontSize: 12,
    fontFamily: 'Poppins-SemiBold',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 2,
  },
  actionSubtitle: {
    fontSize: 10,
    fontFamily: 'Poppins-Regular',
    color: '#6b7280',
    textAlign: 'center',
  },
  activateCard: {
    borderColor: '#f3f4f6',
  },
  deactivateCard: {
    borderColor: '#f3f4f6',
  },
  addPremiumCard: {
    borderColor: '#f3f4f6',
  },
  removePremiumCard: {
    borderColor: '#f3f4f6',
  },
  // Legacy styles (keeping for compatibility)
  actionButtonsContainer: {
    gap: 12,
  },
  detailLabel: {
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    color: '#6B7280',
  },
  detailValue: {
    fontSize: 14,
    fontFamily: 'Poppins-SemiBold',
    color: '#111827',
  },
  actionButton: {
    backgroundColor: '#111827',
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  activateButton: {
    backgroundColor: '#01B97F',
  },
  deactivateButton: {
    backgroundColor: '#EF4444',
  },
  addPremiumButton: {
    backgroundColor: '#d97706',
  },
  removePremiumButton: {
    backgroundColor: '#6b7280',
  },
  actionButtonText: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    color: '#FFFFFF',
    marginLeft: 8,
  },
});


