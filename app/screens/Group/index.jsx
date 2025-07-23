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
      activeOpacity={0.7}
    >
      <View style={styles.groupRow}>
        <View style={styles.groupIconContainer}>
          <MaterialCommunityIcons name="account-group" size={36} color="#02B97F" />
        </View>
        <View style={styles.groupInfo}>
          <Text style={styles.groupName}>{item.name}</Text>
          <Text style={styles.memberCount}>
            {(typeof item.memberCount === 'number' ? item.memberCount : (item.members ? item.members.length : 0))} members
          </Text>
        </View>
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
        <MaterialCommunityIcons name="magnify" size={20} color="#9CA3AF" style={{ marginRight: 8 }} />
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
            <MaterialCommunityIcons name="close-circle" size={20} color="#9CA3AF" />
          </TouchableOpacity>
        )}
      </View>
      {/* Groups List */}
      {loading ? (
        <View style={styles.emptyState}>
          <MaterialCommunityIcons name="account-group-outline" size={48} color="#D1D5DB" />
          <Text style={styles.emptyText}>Loading...</Text>
        </View>
      ) : filteredGroups.length === 0 ? (
        <View style={styles.emptyState}>
          <MaterialCommunityIcons name="account-group-outline" size={48} color="#D1D5DB" />
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
    backgroundColor: '#fff',
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
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
  groupCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 0,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  groupRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  groupIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
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
    fontWeight: '500',
    color: '#374151',
    fontFamily: 'Poppins-Medium',
    marginBottom: 2,
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
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#374151',
    fontFamily: 'Poppins-Medium',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#6b7280',
    fontFamily: 'Poppins-Regular',
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
    paddingBottom: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#374151',
    fontFamily: 'Poppins-SemiBold',
  },
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: 24,
    marginBottom: 24,
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    padding: 4,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 6,
  },
  activeTab: {
    backgroundColor: '#E8F5F0',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280',
    fontFamily: 'Poppins-Medium',
  },
  activeTabText: {
    color: '#02B97F',
  },
  formContainer: {
    paddingHorizontal: 24,
  },
  input: {
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#374151',
    fontFamily: 'Poppins-Regular',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  button: {
    backgroundColor: '#E8F5F0',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    shadowColor: '#36DCA6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 3,
  },
  buttonText: {
    color: '#02B97F',
    fontSize: 16,
    fontWeight: '500',
    fontFamily: 'Poppins-SemiBold',
    letterSpacing: 0.5,
  },
  addBtn: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  addBtnPressed: {
    opacity: 0.5,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    marginHorizontal: 24,
    marginBottom: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#374151',
    fontFamily: 'Poppins-Regular',
    padding: 0,
  },
  clearBtn: {
    marginLeft: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  duplicateModalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 28,
    marginHorizontal: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  duplicateModalTitle: {
    fontSize: 18,
    fontFamily: 'Poppins-Medium',
    color: '#374151',
    marginBottom: 8,
    textAlign: 'center',
  },
  duplicateModalText: {
    fontSize: 15,
    fontFamily: 'Poppins-Regular',
    color: '#6b7280',
    marginBottom: 20,
    textAlign: 'center',
  },
  duplicateModalButton: {
    backgroundColor: '#36DCA6',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 32,
    alignItems: 'center',
  },
  duplicateModalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Poppins-Medium',
  },
});

export default GroupsScreen; 