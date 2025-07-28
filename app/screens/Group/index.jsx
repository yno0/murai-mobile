import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import {
    Animated,
    Dimensions,
    FlatList,
    Modal,
    RefreshControl,
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
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [addBtnPressed, setAddBtnPressed] = useState(false);
  const [duplicateModalVisible, setDuplicateModalVisible] = useState(false);
  const [successModalVisible, setSuccessModalVisible] = useState(false);
  const [failedModalVisible, setFailedModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [modalTitle, setModalTitle] = useState('');

  // Animation values for enhanced UI
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));

  // Real-time refresh when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      fetchGroups();
      startAnimations();
    }, [])
  );

  // Start entrance animations
  const startAnimations = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const fetchGroups = async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError('');
    try {
      const res = await api.get('/users/groups');
      setGroups(res.data);
    } catch (err) {
      setError('Failed to load groups');
    } finally {
      if (isRefresh) {
        setRefreshing(false);
      } else {
        setLoading(false);
      }
    }
  };

  // Pull to refresh handler
  const onRefresh = useCallback(() => {
    fetchGroups(true);
  }, []);

  const handleCreateGroup = async () => {
    if (!groupName.trim()) {
      setModalTitle('Invalid Input');
      setModalMessage('Please enter a group name');
      setFailedModalVisible(true);
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
      setModalTitle('Success!');
      setModalMessage(`Group "${res.data.name}" has been created successfully`);
      setSuccessModalVisible(true);
    } catch (err) {
      setModalTitle('Creation Failed');
      setModalMessage('Failed to create group. Please try again.');
      setFailedModalVisible(true);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinGroup = async () => {
    if (!groupCode.trim()) {
      setModalTitle('Invalid Input');
      setModalMessage('Please enter a group code');
      setFailedModalVisible(true);
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/users/groups/join', { code: groupCode.trim().toUpperCase() });
      // Optionally, refetch all groups or just add the joined group
      fetchGroups();
      setGroupCode('');
      setModalVisible(false);
      setModalTitle('Welcome!');
      setModalMessage(`Successfully joined "${res.data.name}"`);
      setSuccessModalVisible(true);
    } catch (err) {
      setModalTitle('Join Failed');
      setModalMessage('Failed to join group. Please check the code and try again.');
      setFailedModalVisible(true);
    } finally {
      setLoading(false);
    }
  };

  const handleGroupPress = (group) => {
    navigation.navigate('GroupDetails', { groupId: group._id, groupName: group.name });
  };

  const renderGroupItem = ({ item, index }) => (
    <Animated.View
      style={[
        styles.groupCardContainer,
        {
          opacity: fadeAnim,
          transform: [
            {
              translateY: slideAnim.interpolate({
                inputRange: [0, 50],
                outputRange: [0, 50],
              }),
            },
          ],
        },
      ]}
    >
      <TouchableOpacity
        style={styles.groupCard}
        onPress={() => handleGroupPress(item)}
        activeOpacity={0.7}
      >
        <View style={styles.groupRow}>
          <View style={styles.groupIconContainer}>
            <MaterialCommunityIcons name="account-group" size={28} color="#02B97F" />
          </View>
          <View style={styles.groupInfo}>
            <Text style={styles.groupName}>{item.name}</Text>
            <View style={styles.groupMeta}>
              <MaterialCommunityIcons name="account-multiple" size={16} color="#6b7280" />
              <Text style={styles.memberCount}>
                {(typeof item.memberCount === 'number' ? item.memberCount : (item.members ? item.members.length : 0))} members
              </Text>
            </View>
          </View>
          <View style={styles.groupActions}>
            <MaterialCommunityIcons name="chevron-right" size={24} color="#9ca3af" />
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
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
            color: '#02B97F',
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
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#02B97F']}
              tintColor="#02B97F"
              title="Pull to refresh"
              titleColor="#6b7280"
            />
          }
          ItemSeparatorComponent={() => <View style={styles.separator} />}
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

      {/* Success Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={successModalVisible}
        onRequestClose={() => setSuccessModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.statusModalContent}>
            <View style={styles.successIconContainer}>
              <MaterialCommunityIcons name="check-circle" size={48} color="#02B97F" />
            </View>
            <Text style={styles.statusModalTitle}>{modalTitle}</Text>
            <Text style={styles.statusModalText}>{modalMessage}</Text>
            <TouchableOpacity style={styles.successModalButton} onPress={() => setSuccessModalVisible(false)}>
              <Text style={styles.statusModalButtonText}>Great!</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Failed Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={failedModalVisible}
        onRequestClose={() => setFailedModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.statusModalContent}>
            <View style={styles.failedIconContainer}>
              <MaterialCommunityIcons name="close-circle" size={48} color="#EF4444" />
            </View>
            <Text style={styles.statusModalTitle}>{modalTitle}</Text>
            <Text style={styles.statusModalText}>{modalMessage}</Text>
            <TouchableOpacity style={styles.failedModalButton} onPress={() => setFailedModalVisible(false)}>
              <Text style={styles.statusModalButtonText}>Try Again</Text>
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
    backgroundColor: '#ffffff',
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
    fontWeight: '500',
    color: '#111827',
  },
  list: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    paddingTop: 8,
  },
  separator: {
    height: 8,
  },
  groupCardContainer: {
    marginBottom: 4,
  },
  groupCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 2,
    borderWidth: 1,
    borderColor: '#e5e7eb',
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
    backgroundColor: '#f0fdf4',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  groupInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  groupName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 4,
  },
  groupMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  groupActions: {
    padding: 8,
  },
  adminBadge: {
    fontSize: 12,
    fontWeight: '400',
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
    fontWeight: '400',
    color: '#6b7280',
    marginLeft: 6,
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
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#111827',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 16,
    fontWeight: '400',
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 22,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 24,
    paddingBottom: 40,
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
    fontWeight: '500',
    color: '#111827',
  },
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: 24,
    marginBottom: 24,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    padding: 4,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 6,
  },
  activeTab: {
    backgroundColor: '#ffffff',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '400',
    color: '#6b7280',
  },
  activeTabText: {
    color: '#02B97F',
    fontWeight: '500',
  },
  formContainer: {
    paddingHorizontal: 24,
  },
  input: {
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#111827',
    fontWeight: '400',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  button: {
    backgroundColor: '#02B97F',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '500',
  },
  addBtn: {
    padding: 10,
    borderRadius: 20,
    backgroundColor: '#f9fafb',
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
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    marginHorizontal: 20,
    marginBottom: 16,
    marginTop: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: '400',
    color: '#111827',
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
    borderRadius: 16,
    padding: 32,
    marginHorizontal: 24,
    alignItems: 'center',
  },
  duplicateModalTitle: {
    fontSize: 18,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 12,
    textAlign: 'center',
  },
  duplicateModalText: {
    fontSize: 16,
    fontWeight: '400',
    color: '#6b7280',
    marginBottom: 24,
    textAlign: 'center',
    lineHeight: 22,
  },
  duplicateModalButton: {
    backgroundColor: '#02B97F',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 32,
    alignItems: 'center',
  },
  duplicateModalButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '500',
  },
  statusModalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 32,
    marginHorizontal: 24,
    alignItems: 'center',
  },
  successIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f0fdf4',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  failedIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#fef2f2',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  statusModalTitle: {
    fontSize: 20,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 12,
    textAlign: 'center',
  },
  statusModalText: {
    fontSize: 16,
    fontWeight: '400',
    color: '#6b7280',
    marginBottom: 24,
    textAlign: 'center',
    lineHeight: 22,
  },
  successModalButton: {
    backgroundColor: '#02B97F',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 32,
    alignItems: 'center',
    minWidth: 120,
  },
  failedModalButton: {
    backgroundColor: '#EF4444',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 32,
    alignItems: 'center',
    minWidth: 120,
  },
  statusModalButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default GroupsScreen;