import { Feather } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import { Alert, Clipboard, FlatList, Modal, Pressable, SafeAreaView, Text, View } from "react-native";
import AppButton from "../../components/common/AppButton";
import AppInput from "../../components/common/AppInput";
import Header from "../../components/common/Header";
import { COLORS } from "../../constants/theme";


export default function GroupDetails() {
  const navigation = useNavigation();
  const route = useRoute();
  const { groupId, groupName } = route.params || {};
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [group, setGroup] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editGroupName, setEditGroupName] = useState("");
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Fix: pass groupData to checkCurrentUser and update admin logic
  const checkCurrentUser = async (groupData) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const res = await fetch('http://localhost:3000/api/users/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setCurrentUserId(data.id || data._id || null);
        // Find admin in group members
        if (groupData && groupData.members) {
          const admin = groupData.members.find(m => m.role === 'admin');
          setIsAdmin(admin && (admin.id === (data.id || data._id)));
        }
      }
    } catch (error) {
      console.error('Error checking current user:', error);
    }
  };

  const loadGroupDetails = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Not authenticated');
      const response = await fetch(`http://localhost:3000/api/users/groups/${groupId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to load group details');
      }
      const groupData = await response.json();
      setGroup(groupData);
      setMembers(groupData.members || []);
      checkCurrentUser(groupData);
    } catch (error) {
      console.error('Error loading group details:', error);
      Alert.alert('Error', error.message || 'Failed to load group details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (groupId) {
      loadGroupDetails();
    }
  }, [groupId]);

  const handleCopyCode = () => {
    if (group?.shortCode) {
      Clipboard.setString(group.shortCode);
      Alert.alert('Copied!', 'Group code has been copied to clipboard.');
    }
  };

  const handleEditGroup = () => {
    setEditGroupName(group?.name || '');
    setEditModalVisible(true);
  };

  const handleUpdateGroupName = async () => {
    if (!editGroupName.trim()) {
      Alert.alert('Error', 'Please enter a group name');
      return;
    }

    setActionLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Not authenticated');
      const response = await fetch(`http://localhost:3000/api/users/groups/${groupId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: editGroupName.trim() })
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to update group name');
      }
      await loadGroupDetails();
      setEditModalVisible(false);
      setEditGroupName("");
      Alert.alert('Success', 'Group name updated successfully!');
    } catch (error) {
      console.error('Error updating group name:', error);
      Alert.alert('Update Failed', error.message || 'Failed to update group name.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteGroup = () => {
    setDeleteModalVisible(true);
  };

  const confirmDeleteGroup = async () => {
    setActionLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Not authenticated');
      const response = await fetch(`http://localhost:3000/api/users/groups/${groupId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to delete group');
      }
      setDeleteModalVisible(false);
      navigation.navigate('CreateGroup');
      setTimeout(() => {
        Alert.alert('Success', 'Group deleted successfully!');
      }, 100);
    } catch (error) {
      console.error('Error deleting group:', error);
      setDeleteModalVisible(false);
      Alert.alert('Delete Failed', error.message || 'Failed to delete group.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRemoveMember = async (memberId, memberName) => {
    Alert.alert(
      'Remove Member',
      `Are you sure you want to remove ${memberName} from the group?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              const token = localStorage.getItem('token');
              if (!token) throw new Error('Not authenticated');
              const response = await fetch(`http://localhost:3000/api/users/groups/${groupId}/members/${memberId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
              });
              if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || 'Failed to remove member');
              }
              setMembers(prev => prev.filter(member => member.id !== memberId));
              Alert.alert('Success', `${memberName} has been removed from the group.`);
            } catch (error) {
              console.error('Error removing member:', error);
              Alert.alert('Error', error.message || 'Failed to remove member from group.');
            }
          }
        }
      ]
    );
  };

  // Debug log for admin state
  console.log('isAdmin:', isAdmin, 'currentUserId:', currentUserId, 'group:', group);

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.BG }}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ color: COLORS.TEXT_MAIN, fontSize: 16 }}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!group) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.BG }}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ color: COLORS.TEXT_MAIN, fontSize: 16 }}>Group not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.BG }}>
      <Header
        title={group?.name || "Group"}
        showBack
        onBack={() => navigation.goBack()}
        rightIcon={isAdmin ? "edit-3" : undefined}
        onRightPress={isAdmin ? handleEditGroup : undefined}
      />

      {/* Group Info Row */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 28, marginHorizontal: 18, marginBottom: 4 }}>
        <Text style={{ color: COLORS.TEXT_MAIN, fontSize: 28, fontWeight: '900', flex: 1, letterSpacing: 0.2 }} numberOfLines={1}>
          {group?.name || 'Group'}
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 12 }}>
          <View style={{ backgroundColor: '#f3f3f3', borderRadius: 16, paddingHorizontal: 14, paddingVertical: 6, marginRight: 6, borderWidth: 1, borderColor: '#111' }}>
            <Text style={{ color: '#111', fontSize: 16, fontWeight: 'bold', letterSpacing: 1 }}>{group.shortCode}</Text>
          </View>
          <Pressable onPress={handleCopyCode} style={{ padding: 4 }}>
            <Feather name="copy" size={18} color={COLORS.ACCENT} />
          </Pressable>
        </View>
      </View>
      {/* Admin-only delete button for testing */}
      {isAdmin && (
        <AppButton
          title="Delete Group"
          onPress={handleDeleteGroup}
          style={{ backgroundColor: COLORS.ERROR, marginHorizontal: 18, marginBottom: 10 }}
          textStyle={{ color: COLORS.BG }}
        />
      )}
      <View style={{ flexDirection: 'row', alignItems: 'center', marginHorizontal: 18, marginBottom: 14 }}>
        <View style={{ backgroundColor: '#f3f3f3', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4, borderWidth: 1, borderColor: '#111' }}>
          <Text style={{ color: '#111', fontSize: 13 }}>
            Created: <Text style={{ color: '#111', fontWeight: 'bold' }}>{new Date(group.createdAt).toLocaleDateString()}</Text>
          </Text>
        </View>
      </View>
      <View style={{ height: 1, backgroundColor: 'rgba(255,255,255,0.08)', marginHorizontal: 18, marginBottom: 10 }} />

      {/* Members Section Header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 18, marginBottom: 10, paddingHorizontal: 22 }}>
        <Text style={{ color: COLORS.TEXT_MAIN, fontSize: 18, fontWeight: 'bold', flex: 1, letterSpacing: 0.2 }}>Members ({members.length})</Text>
      </View>

      {/* Members List */}
      <View style={{ flex: 1, paddingHorizontal: 8 }}>
        <FlatList
          data={members}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: 40 }}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => isAdmin && item.id !== currentUserId ? handleRemoveMember(item.id, item.name) : undefined}
              style={({ pressed }) => ([
                {
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: COLORS.CARD_BG,
                  paddingVertical: 16,
                  paddingHorizontal: 18,
                  borderRadius: 14,
                  marginBottom: 12,
                  shadowColor: '#000',
                  shadowOpacity: 0.06,
                  shadowRadius: 6,
                  shadowOffset: { width: 0, height: 2 },
                  elevation: 2,
                  opacity: pressed ? 0.85 : 1,
                }
              ])}
            >
              <View style={{ flex: 1 }}>
                <Text style={{ color: COLORS.TEXT_MAIN, fontWeight: 'bold', fontSize: 16, marginBottom: 2 }}>
                  {item.name}{item.id === currentUserId && ' (You)'}
                </Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2 }}>
                  <Text style={{ color: COLORS.TEXT_SECONDARY, fontSize: 12, marginRight: 10 }}>
                    Joined {new Date(item.joinedAt).toLocaleDateString()}
                  </Text>
                  {item.role === 'admin' && (
                    <View style={{ backgroundColor: '#f3f3f3', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 3, marginLeft: 2, borderWidth: 1, borderColor: COLORS.ACCENT }}>
                      <Text style={{ color: '#111', fontSize: 12, fontWeight: 'bold', letterSpacing: 0.5 }}>Admin</Text>
                    </View>
                  )}
                  {item.role === 'member' && (
                    <View style={{ backgroundColor: '#f3f3f3', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 3, marginLeft: 2, borderWidth: 1, borderColor: '#bbb' }}>
                      <Text style={{ color: '#111', fontSize: 12, fontWeight: 'bold', letterSpacing: 0.5 }}>Member</Text>
                    </View>
                  )}
                </View>
              </View>
              {isAdmin && item.id !== currentUserId && (
                <View style={{ marginLeft: 10 }}>
                  <Feather name="user-x" size={18} color={COLORS.ERROR} />
                </View>
              )}
            </Pressable>
          )}
          ListEmptyComponent={
            <Text style={{ color: COLORS.TEXT_SECONDARY, textAlign: 'center', marginTop: 20 }}>
              No members found
            </Text>
          }
        />
      </View>

      {/* Edit Group Modal */}
      <Modal visible={editModalVisible} transparent animationType="slide">
        <View style={{ 
          flex: 1, 
          backgroundColor: 'rgba(0,0,0,0.8)', 
          justifyContent: 'center', 
          alignItems: 'center' 
        }}>
          <View style={{ 
            backgroundColor: COLORS.CARD_BG, 
            borderRadius: 20, 
            padding: 24, 
            width: '85%',
            borderWidth: 1,
            borderColor: 'rgba(255,255,255,0.05)'
          }}>
            <Text style={{ 
              fontWeight: 'bold', 
              fontSize: 20, 
              color: COLORS.TEXT_MAIN, 
              textAlign: 'center',
              marginBottom: 24 
            }}>
              Edit Group Name
            </Text>

            <Text style={{ fontWeight: 'bold', fontSize: 15, color: COLORS.TEXT_MAIN, marginBottom: 12 }}>
              Group Name
            </Text>
            <AppInput
              value={editGroupName}
              onChangeText={setEditGroupName}
              placeholder="Edit Group Name"
              style={{ marginBottom: 16 }}
            />

            <AppButton
              title={actionLoading ? "Updating..." : "Update Name"}
              onPress={handleUpdateGroupName}
              loading={actionLoading}
              style={{ marginBottom: 16 }}
            />

            <Pressable
              onPress={() => {
                setEditModalVisible(false);
                setEditGroupName("");
              }}
              disabled={actionLoading}
              style={{ alignItems: 'center', padding: 12, opacity: actionLoading ? 0.5 : 1 }}
            >
              <Text style={{ color: COLORS.TEXT_SECONDARY, fontWeight: 'bold' }}>
                {actionLoading ? 'Please wait...' : 'Cancel'}
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal visible={deleteModalVisible} transparent animationType="slide">
        <View style={{ 
          flex: 1, 
          backgroundColor: 'rgba(0,0,0,0.8)', 
          justifyContent: 'center', 
          alignItems: 'center' 
        }}>
          <View style={{ 
            backgroundColor: COLORS.CARD_BG, 
            borderRadius: 20, 
            padding: 24, 
            width: '85%',
            borderWidth: 1,
            borderColor: 'rgba(255,255,255,0.05)'
          }}>
            <Text style={{ 
              fontWeight: 'bold', 
              fontSize: 20, 
              color: COLORS.TEXT_MAIN, 
              textAlign: 'center',
              marginBottom: 16 
            }}>
              Delete Group
            </Text>

            <Text style={{ 
              fontSize: 16, 
              color: COLORS.TEXT_SECONDARY, 
              textAlign: 'center',
              marginBottom: 24,
              lineHeight: 22
            }}>
              Are you sure you want to delete &quot;{group?.name}&quot;? This action cannot be undone and will remove all members from the group.
            </Text>

            <AppButton
              title={actionLoading ? "Deleting..." : "Delete Group"}
              onPress={confirmDeleteGroup}
              loading={actionLoading}
              style={{ backgroundColor: COLORS.ERROR, marginBottom: 16 }}
              textStyle={{ color: COLORS.BG }}
            />

            <Pressable
              onPress={() => setDeleteModalVisible(false)}
              disabled={actionLoading}
              style={{ alignItems: 'center', padding: 12, opacity: actionLoading ? 0.5 : 1 }}
            >
              <Text style={{ color: COLORS.TEXT_SECONDARY, fontWeight: 'bold' }}>
                {actionLoading ? 'Please wait...' : 'Cancel'}
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
} 