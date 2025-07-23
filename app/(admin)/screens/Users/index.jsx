import { Feather } from '@expo/vector-icons';
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

export default function AdminUsersScreen() {
  const [users, setUsers] = useState([
    { id: '1', name: 'Alice Johnson', email: 'alice@example.com', role: 'Admin', status: 'Active', joinedAt: new Date('2024-01-15'), lastActive: new Date('2024-01-20') },
    { id: '2', name: 'Bob Williams', email: 'bob@example.com', role: 'User', status: 'Inactive', joinedAt: new Date('2024-01-10'), lastActive: new Date('2024-01-18') },
    { id: '3', name: 'Charlie Brown', email: 'charlie@example.com', role: 'User', status: 'Active', joinedAt: new Date('2024-01-12'), lastActive: new Date('2024-01-21') },
    { id: '4', name: 'Diana Prince', email: 'diana@example.com', role: 'User', status: 'Active', joinedAt: new Date('2024-01-08'), lastActive: new Date('2024-01-19') },
    { id: '5', name: 'Eve Adams', email: 'eve@example.com', role: 'User', status: 'Inactive', joinedAt: new Date('2024-01-05'), lastActive: new Date('2024-01-16') },
    { id: '6', name: 'Frank White', email: 'frank@example.com', role: 'Admin', status: 'Active', joinedAt: new Date('2024-01-03'), lastActive: new Date('2024-01-21') },
    { id: '7', name: 'Grace Lee', email: 'grace@example.com', role: 'User', status: 'Active', joinedAt: new Date('2024-01-14'), lastActive: new Date('2024-01-20') },
    { id: '8', name: 'Henry King', email: 'henry@example.com', role: 'User', status: 'Inactive', joinedAt: new Date('2024-01-07'), lastActive: new Date('2024-01-17') },
    { id: '9', name: 'Ivy Green', email: 'ivy@example.com', role: 'Admin', status: 'Active', joinedAt: new Date('2024-01-11'), lastActive: new Date('2024-01-21') },
    { id: '10', name: 'Jack Black', email: 'jack@example.com', role: 'User', status: 'Active', joinedAt: new Date('2024-01-09'), lastActive: new Date('2024-01-20') },
  ]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [selectedUser, setSelectedUser] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentView, setCurrentView] = useState('overview'); // 'overview' or 'list'

  const loadUsers = useCallback(async () => {
    // Mock data loading - replace with actual API calls
    setLoading(true);
    try {
      // TODO: Replace with actual API call
      // const response = await fetch('/api/users');
      // const data = await response.json();
      setUsers(users);
    } catch (_error) {
      Alert.alert('Error', 'Failed to load users');
    } finally {
      setLoading(false);
    }
  }, []);

  const filterUsers = useCallback(() => {
    let filtered = users;

    // Filter by status
    if (selectedFilter !== 'all') {
      filtered = filtered.filter(user => user.status.toLowerCase() === selectedFilter);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      filtered = filtered.filter(user =>
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.role.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredUsers(filtered);
  }, [users, selectedFilter, searchQuery]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  useEffect(() => {
    filterUsers();
  }, [filterUsers]);

  const handleUserAction = async (userId, action) => {
    try {
      const updatedUsers = users.map(user => {
        if (user.id === userId) {
          return {
            ...user,
            status: action === 'activate' ? 'Active' : 'Inactive',
            lastActive: action === 'activate' ? new Date() : user.lastActive
          };
        }
        return user;
      });

      setUsers(updatedUsers);
      Alert.alert('Success', `User ${action === 'activate' ? 'activated' : 'deactivated'} successfully`);
      setModalVisible(false);
      setSelectedUser(null);

    } catch (_error) {
      Alert.alert('Error', 'Failed to update user');
    }
  };

  const openUserModal = (user) => {
    setSelectedUser(user);
    setModalVisible(true);
  };

  const renderUserItem = ({ item }) => (
    <TouchableOpacity
      style={styles.userItem}
      onPress={() => openUserModal(item)}
    >
      <View style={styles.userItemLeft}>
        <View style={[styles.userStatusIcon, { backgroundColor: item.status === 'Active' ? '#e8f5f0' : '#fee2e2' }]}>
          {item.status === 'Active' && <Feather name="user-check" size={16} color="#01B97F" />}
          {item.status === 'Inactive' && <Feather name="user-x" size={16} color="#EF4444" />}
        </View>
        <View style={styles.userItemContent}>
          <Text style={styles.userItemName}>{item.name}</Text>
          <Text style={styles.userItemEmail}>{item.email}</Text>
          <View style={styles.userItemMeta}>
            <View style={[styles.roleBadge, { backgroundColor: item.role === 'Admin' ? '#e8f5f0' : '#f3f4f6' }]}>
              <Text style={[styles.roleText, { color: item.role === 'Admin' ? '#01B97F' : '#6b7280' }]}>
                {item.role}
              </Text>
            </View>
          </View>
        </View>
      </View>
      <View style={styles.userItemRight}>
        <Feather name="chevron-right" size={16} color="#9CA3AF" />
      </View>
    </TouchableOpacity>
  );

  const renderFilterButton = (filter, label) => (
    <TouchableOpacity
      style={[
        styles.filterButton,
        selectedFilter === filter && styles.filterButtonActive
      ]}
      onPress={() => setSelectedFilter(filter)}
    >
      <Text style={[
        styles.filterButtonText,
        selectedFilter === filter && styles.filterButtonTextActive
      ]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

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

  const getStats = () => {
    const total = users.length;
    const active = users.filter(u => u.status === 'Active').length;
    const inactive = users.filter(u => u.status === 'Inactive').length;
    const admins = users.filter(u => u.role === 'Admin').length;
    const regularUsers = users.filter(u => u.role === 'User').length;

    return { total, active, inactive, admins, regularUsers };
  };

  const stats = getStats();

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
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>User Details</Text>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Feather name="x" size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            {selectedUser && (
              <>
                <View style={styles.modalSection}>
                  <Text style={styles.modalSectionTitle}>User Information</Text>
                  <View style={styles.detailsCard}>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Name</Text>
                      <Text style={styles.detailValue}>{selectedUser.name}</Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Email</Text>
                      <Text style={styles.detailValue}>{selectedUser.email}</Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Role</Text>
                      <View style={[styles.roleBadge, { backgroundColor: selectedUser.role === 'Admin' ? '#e8f5f0' : '#f3f4f6' }]}>
                        <Text style={[styles.roleText, { color: selectedUser.role === 'Admin' ? '#01B97F' : '#6b7280' }]}>
                          {selectedUser.role}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Status</Text>
                      <View style={[styles.statusBadge, { backgroundColor: selectedUser.status === 'Active' ? '#e8f5f0' : '#fee2e2' }]}>
                        <Text style={[styles.statusText, { color: selectedUser.status === 'Active' ? '#01B97F' : '#EF4444' }]}>
                          {selectedUser.status}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Joined</Text>
                      <Text style={styles.detailValue}>{selectedUser.joinedAt.toLocaleDateString()}</Text>
                    </View>
                  </View>
                </View>

                <View style={styles.modalSection}>
                  <Text style={styles.modalSectionTitle}>Actions</Text>
                  <View style={styles.actionButtonsContainer}>
                    {selectedUser.status === 'Active' ? (
                      <TouchableOpacity
                        style={[styles.actionButton, styles.deactivateButton]}
                        onPress={() => handleUserAction(selectedUser.id, 'deactivate')}
                      >
                        <Feather name="user-x" size={20} color="#FFFFFF" />
                        <Text style={styles.actionButtonText}>Deactivate User</Text>
                      </TouchableOpacity>
                    ) : (
                      <TouchableOpacity
                        style={[styles.actionButton, styles.activateButton]}
                        onPress={() => handleUserAction(selectedUser.id, 'activate')}
                      >
                        <Feather name="user-check" size={20} color="#FFFFFF" />
                        <Text style={styles.actionButtonText}>Activate User</Text>
                      </TouchableOpacity>
                    )}
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
  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
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
  modalTitle: {
    fontSize: 20,
    fontFamily: 'Poppins-Bold',
    color: '#111827',
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
  modalSection: {
    marginBottom: 30,
  },
  modalSectionTitle: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    color: '#111827',
    marginBottom: 16,
  },
  detailsCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#f1f5f9',
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
  actionButtonText: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    color: '#FFFFFF',
    marginLeft: 8,
  },
});


