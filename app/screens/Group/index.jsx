import React, { useState } from 'react';
import {
    Dimensions,
    FlatList,
    Modal,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import MainHeader from '../../components/common/MainHeader';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const { width } = Dimensions.get('window');

function GroupsScreen({ navigation }) {
  const { user } = useAuth();
  const [groups, setGroups] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [activeTab, setActiveTab] = useState('create');
  const [groupName, setGroupName] = useState('');
  const [groupCode, setGroupCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [addBtnPressed, setAddBtnPressed] = useState(false);
  const [duplicateModalVisible, setDuplicateModalVisible] = useState(false);

  // Fetch groups on mount
  React.useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/users/groups');
      setGroups(res.data);
    } catch (err) {
      setError('Failed to load groups');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGroup = async () => {
    if (!groupName.trim()) {
      alert('Please enter a group name');
      return;
    }
    // Prevent duplicate group name (case and diacritic insensitive)
    const normalizedNew = normalize(groupName.trim());
    const duplicate = groups.some(g => normalize(g.name) === normalizedNew);
    if (duplicate) {
      setDuplicateModalVisible(true);
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/users/groups', { name: groupName.trim() });
      setGroups(prev => [res.data, ...prev]);
      setGroupName('');
      setModalVisible(false);
    } catch (err) {
      setError('Failed to create group');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinGroup = async () => {
    if (!groupCode.trim()) {
      alert('Please enter a group code');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/users/groups/join', { code: groupCode.trim().toUpperCase() });
      // Optionally, refetch all groups or just add the joined group
      fetchGroups();
      alert(`Successfully joined "${res.data.name}"`);
      setGroupCode('');
      setModalVisible(false);
    } catch (err) {
      setError('Failed to join group');
    } finally {
      setLoading(false);
    }
  };

  const handleGroupPress = (group) => {
    navigation.navigate('GroupDetails', { groupId: group._id, groupName: group.name });
  };

  const renderGroupItem = ({ item }) => (
    <TouchableOpacity
      style={styles.groupCard}
      onPress={() => handleGroupPress(item)}
      activeOpacity={0.8}
    >
      <View style={styles.groupRow}>
        <View style={styles.groupIconContainer}>
          <MaterialCommunityIcons name="account-group" size={28} color="#02B97F" />
        </View>
        <View style={styles.groupInfo}>
          <Text style={styles.groupName}>{item.name}</Text>
          <Text style={styles.memberCount}>
            {(typeof item.memberCount === 'number' ? item.memberCount : (item.members ? item.members.length : 0))} members
          </Text>
        </View>
        <MaterialCommunityIcons name="chevron-right" size={20} color="#9ca3af" />
      </View>
    </TouchableOpacity>
  );

  // Helper to normalize strings for diacritic-insensitive search
  const normalize = (str) =>
    (str || '').normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();

  // Filter groups by search (case and diacritic insensitive)
  const filteredGroups = groups.filter(g =>
    g.name && normalize(g.name).includes(normalize(search))
  );

  return (
    <View style={styles.container}>
      <MainHeader 
        title="Groups"
        subtitle="Connect and collaborate"
        rightActions={[
          {
            icon: 'plus',
            color: '#01B97F',
            onPress: () => setModalVisible(true)
          }
        ]}
      />
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <MaterialCommunityIcons name="magnify" size={20} color="#6b7280" style={{ marginRight: 8 }} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search groups..."
          placeholderTextColor="#9CA3AF"
          value={search}
          onChangeText={setSearch}
          autoCorrect={false}
          returnKeyType="search"
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')} style={styles.clearBtn} hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}>
            <MaterialCommunityIcons name="close-circle" size={20} color="#6b7280" />
          </TouchableOpacity>
        )}
      </View>
      {/* Groups List */}
      {loading ? (
        <View style={styles.emptyState}>
          <MaterialCommunityIcons name="account-group-outline" size={64} color="#D1D5DB" />
          <Text style={styles.emptyText}>Loading...</Text>
        </View>
      ) : filteredGroups.length === 0 ? (
        <View style={styles.emptyState}>
          <MaterialCommunityIcons name="account-group-outline" size={64} color="#D1D5DB" />
          <Text style={styles.emptyText}>No groups found</Text>
          <Text style={styles.emptySubtext}>Create or join a group to get started</Text>
        </View>
      ) : (
        <FlatList
          data={filteredGroups}
          renderItem={renderGroupItem}
          keyExtractor={(item) => item._id || item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.list}
        />
      )}
      {/* Error message */}
      {!!error && (
        <View style={{ padding: 16 }}>
          <Text style={{ color: 'red', textAlign: 'center' }}>{error}</Text>
        </View>
      )}

      {/* Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {activeTab === 'create' ? 'Create Group' : 'Join Group'}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <MaterialCommunityIcons name="close" size={24} color="#111827" />
              </TouchableOpacity>
            </View>

            <View style={styles.tabContainer}>
              <TouchableOpacity
                style={[styles.tab, activeTab === 'create' && styles.activeTab]}
                onPress={() => setActiveTab('create')}
              >
                <Text style={[styles.tabText, activeTab === 'create' && styles.activeTabText]}>
                  Create
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.tab, activeTab === 'join' && styles.activeTab]}
                onPress={() => setActiveTab('join')}
              >
                <Text style={[styles.tabText, activeTab === 'join' && styles.activeTabText]}>
                  Join
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.formContainer}>
              {activeTab === 'create' ? (
                <>
                  <TextInput
                    style={styles.input}
                    placeholder="Group name"
                    value={groupName}
                    onChangeText={setGroupName}
                    placeholderTextColor="#9CA3AF"
                  />
                  <TouchableOpacity
                    style={styles.button}
                    onPress={handleCreateGroup}
                    disabled={loading}
                  >
                    <Text style={styles.buttonText}>
                      {loading ? 'Creating...' : 'Create Group'}
                    </Text>
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  <TextInput
                    style={styles.input}
                    placeholder="Group code"
                    value={groupCode}
                    onChangeText={setGroupCode}
                    placeholderTextColor="#9CA3AF"
                    autoCapitalize="characters"
                    maxLength={6}
                  />
                  <TouchableOpacity
                    style={styles.button}
                    onPress={handleJoinGroup}
                    disabled={loading}
                  >
                    <Text style={styles.buttonText}>
                      {loading ? 'Joining...' : 'Join Group'}
                    </Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          </View>
        </View>
      </Modal>

      {/* Duplicate Group Name Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={duplicateModalVisible}
        onRequestClose={() => setDuplicateModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.duplicateModalContent}>
            <MaterialCommunityIcons name="alert-circle" size={36} color="#F59E42" style={{ alignSelf: 'center', marginBottom: 12 }} />
            <Text style={styles.duplicateModalTitle}>Duplicate Group Name</Text>
            <Text style={styles.duplicateModalText}>A group with this name already exists. Please choose a different name.</Text>
            <TouchableOpacity style={styles.duplicateModalButton} onPress={() => setDuplicateModalVisible(false)}>
              <Text style={styles.duplicateModalButtonText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f1f5f9',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: '600',
    color: '#111827',
  },
  list: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  groupCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#f3f4f6',
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  groupRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  groupIconContainer: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#E8F5F0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  groupInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  groupName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    fontFamily: 'Poppins-SemiBold',
    marginBottom: 4,
  },
  adminBadge: {
    fontSize: 12,
    fontWeight: '500',
    color: '#3B82F6',
    backgroundColor: '#EBF4FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  groupCode: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
    fontFamily: 'monospace',
  },
  memberCount: {
    fontSize: 14,
    color: '#6b7280',
    fontFamily: 'Poppins-Regular',
  },
  chevron: {
    position: 'absolute',
    right: 20,
    top: '50%',
    marginTop: -10,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 60,
    backgroundColor: '#ffffff',
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#f3f4f6',
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1f2937',
    fontFamily: 'Poppins-SemiBold',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 16,
    color: '#6b7280',
    fontFamily: 'Poppins-Regular',
    textAlign: 'center',
    lineHeight: 22,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 24,
    paddingBottom: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: '#1f2937',
    fontFamily: 'Poppins-SemiBold',
  },
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: 24,
    marginBottom: 24,
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
    padding: 4,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280',
    fontFamily: 'Poppins-Medium',
  },
  activeTabText: {
    color: '#02B97F',
    fontWeight: '600',
  },
  formContainer: {
    paddingHorizontal: 24,
  },
  input: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#1f2937',
    fontFamily: 'Poppins-Regular',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  button: {
    backgroundColor: '#02B97F',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#02B97F',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Poppins-SemiBold',
    letterSpacing: 0.5,
  },
  addBtn: {
    padding: 10,
    borderRadius: 24,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  addBtnPressed: {
    opacity: 0.7,
    backgroundColor: '#e5e7eb',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    marginHorizontal: 20,
    marginBottom: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#f3f4f6',
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1f2937',
    fontFamily: 'Poppins-Regular',
    padding: 0,
  },
  clearBtn: {
    marginLeft: 8,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 4,
  },
  duplicateModalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 32,
    marginHorizontal: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  duplicateModalTitle: {
    fontSize: 20,
    fontFamily: 'Poppins-SemiBold',
    color: '#1f2937',
    marginBottom: 12,
    textAlign: 'center',
  },
  duplicateModalText: {
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    color: '#6b7280',
    marginBottom: 24,
    textAlign: 'center',
    lineHeight: 22,
  },
  duplicateModalButton: {
    backgroundColor: '#02B97F',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 40,
    alignItems: 'center',
    shadowColor: '#02B97F',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  duplicateModalButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
  },
});

export default GroupsScreen; 