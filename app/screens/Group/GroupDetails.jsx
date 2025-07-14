import { Feather } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import { Alert, Clipboard, FlatList, Modal, SafeAreaView, Text, TextInput, TouchableOpacity, View } from "react-native";

// Theme colors
const BG = "#0f0f0f";
const CARD_BG = "#1a1a1a";
const ACCENT = "#34d399";
const TEXT_MAIN = "#fff";
const TEXT_SECONDARY = "#a0a0a0";
const GRAY_BTN = "#2a2a2a";
const INPUT_BG = "#222";
const DANGER = "#ef4444";


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

  useEffect(() => {
    if (groupId) {
      loadGroupDetails();
      checkCurrentUser();
    }
  }, [groupId]);

  const checkCurrentUser = async () => {
    try {
      // Mock user check
      const mockUserId = 'mock-user-id';
      setCurrentUserId(mockUserId);
      console.log('Current user ID:', mockUserId);
      
      // Mock admin check - assume user is admin for demo
      setIsAdmin(true);
    } catch (error) {
      console.error('Error checking current user:', error);
    }
  };

  const loadGroupDetails = async () => {
    try {
      setLoading(true);
      
      // Mock group data
      const mockGroup = {
        $id: groupId,
        name: groupName || 'Mock Group',
        shortCode: 'MOCK123',
        createdBy: 'mock-user-id',
        createdAt: new Date().toISOString(),
      };
      
      // Mock members data
      const mockMembers = [
        {
          id: 'mock-user-id',
          name: 'Mock User',
          role: 'admin',
          joinedAt: new Date().toISOString(),
        },
        {
          id: 'mock-user-2',
          name: 'John Doe',
          role: 'member',
          joinedAt: new Date(Date.now() - 86400000).toISOString(),
        },
      ];
      
      setGroup(mockGroup);
      setMembers(mockMembers);
    } catch (error) {
      console.error('Error loading group details:', error);
      Alert.alert('Error', 'Failed to load group details');
    } finally {
      setLoading(false);
    }
  };

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
      // Mock update
      console.log('Mock updating group name from:', group?.name, 'to:', editGroupName.trim());
      
      // Update local state
      setGroup(prev => ({ ...prev, name: editGroupName.trim() }));
      
      // Close modal and reset form
      setEditModalVisible(false);
      setEditGroupName("");
      
      Alert.alert('Success', 'Group name updated successfully! (Mock implementation)');
      
    } catch (error) {
      console.error('Error updating group name:', error);
      Alert.alert('Update Failed', 'Failed to update group name.');
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
      console.log('Mock deleting group:', groupId);
      
      // Close modal
      setDeleteModalVisible(false);
      
      // Navigate back
      navigation.navigate('CreateGroup');
      
      // Show success message after navigation
      setTimeout(() => {
        Alert.alert('Success', 'Group deleted successfully! (Mock implementation)');
      }, 100);
      
    } catch (error) {
      console.error('Error deleting group:', error);
      setDeleteModalVisible(false);
      Alert.alert('Delete Failed', 'Failed to delete group.');
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
              // Mock remove member
              console.log('Mock removing member:', memberId);
              setMembers(prev => prev.filter(member => member.id !== memberId));
              Alert.alert('Success', `${memberName} has been removed from the group. (Mock implementation)`);
            } catch (error) {
              console.error('Error removing member:', error);
              Alert.alert('Error', 'Failed to remove member from group.');
            }
          }
        }
      ]
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: BG }}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ color: TEXT_MAIN, fontSize: 16 }}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!group) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: BG }}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ color: TEXT_MAIN, fontSize: 16 }}>Group not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: BG }}>
      {/* Header */}
      <View style={{ 
        flexDirection: 'row', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: CARD_BG
      }}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          style={{ padding: 8 }}
        >
          <Feather name="arrow-left" size={24} color={TEXT_MAIN} />
        </TouchableOpacity>
        
        <Text style={{ 
          color: TEXT_MAIN, 
          fontSize: 18, 
          fontWeight: 'bold',
          flex: 1,
          textAlign: 'center',
          marginHorizontal: 16
        }}>
          {group.name}
        </Text>
        
        {isAdmin && (
          <TouchableOpacity 
            onPress={handleEditGroup}
            style={{ padding: 8 }}
          >
            <Feather name="edit-3" size={20} color={ACCENT} />
          </TouchableOpacity>
        )}
      </View>

      {/* Group Info Card */}
      <View style={{ 
        backgroundColor: CARD_BG, 
        margin: 20, 
        borderRadius: 16, 
        padding: 20 
      }}>
        <Text style={{ 
          color: TEXT_MAIN, 
          fontSize: 20, 
          fontWeight: 'bold', 
          marginBottom: 16 
        }}>
          Group Information
        </Text>
        
        <View style={{ marginBottom: 16 }}>
          <Text style={{ color: TEXT_SECONDARY, fontSize: 14, marginBottom: 4 }}>
            Group Code
          </Text>
          <View style={{ 
            flexDirection: 'row', 
            alignItems: 'center',
            backgroundColor: INPUT_BG,
            borderRadius: 8,
            padding: 12
          }}>
            <Text style={{ 
              color: TEXT_MAIN, 
              fontSize: 16, 
              fontWeight: 'bold',
              flex: 1
            }}>
              {group.shortCode}
            </Text>
            <TouchableOpacity onPress={handleCopyCode}>
              <Feather name="copy" size={20} color={ACCENT} />
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={{ marginBottom: 16 }}>
          <Text style={{ color: TEXT_SECONDARY, fontSize: 14, marginBottom: 4 }}>
            Created
          </Text>
          <Text style={{ color: TEXT_MAIN, fontSize: 16 }}>
            {new Date(group.createdAt).toLocaleDateString()}
          </Text>
        </View>
        
        <View style={{ marginBottom: 16 }}>
          <Text style={{ color: TEXT_SECONDARY, fontSize: 14, marginBottom: 4 }}>
            Members
          </Text>
          <Text style={{ color: TEXT_MAIN, fontSize: 16 }}>
            {members.length} member{members.length !== 1 ? 's' : ''}
          </Text>
        </View>
        
        {isAdmin && (
          <TouchableOpacity 
            onPress={handleDeleteGroup}
            style={{ 
              backgroundColor: DANGER + '20',
              padding: 12,
              borderRadius: 8,
              alignItems: 'center',
              marginTop: 8
            }}
          >
            <Text style={{ color: DANGER, fontWeight: 'bold' }}>
              Delete Group
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Members List */}
      <View style={{ flex: 1, paddingHorizontal: 20 }}>
        <Text style={{ 
          color: TEXT_MAIN, 
          fontSize: 18, 
          fontWeight: 'bold', 
          marginBottom: 16 
        }}>
          Members
        </Text>
        
        <FlatList
          data={members}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={{ 
              flexDirection: 'row', 
              alignItems: 'center',
              backgroundColor: CARD_BG,
              padding: 16,
              borderRadius: 12,
              marginBottom: 8
            }}>
              <View style={{ 
                width: 40, 
                height: 40, 
                borderRadius: 20, 
                backgroundColor: ACCENT + '20',
                justifyContent: 'center',
                alignItems: 'center',
                marginRight: 12
              }}>
                <Text style={{ color: ACCENT, fontWeight: 'bold', fontSize: 16 }}>
                  {item.name.charAt(0).toUpperCase()}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: TEXT_MAIN, fontWeight: 'bold', fontSize: 16 }}>
                  {item.name}
                  {item.id === currentUserId && ' (You)'}
                </Text>
                <Text style={{ color: TEXT_SECONDARY, fontSize: 14 }}>
                  {item.role.charAt(0).toUpperCase() + item.role.slice(1)} • Joined {new Date(item.joinedAt).toLocaleDateString()}
                </Text>
              </View>
              {isAdmin && item.id !== currentUserId && (
                <TouchableOpacity 
                  onPress={() => handleRemoveMember(item.id, item.name)}
                  style={{ 
                    backgroundColor: DANGER + '20',
                    borderRadius: 8,
                    padding: 8
                  }}
                >
                  <Feather name="user-x" size={18} color={DANGER} />
                </TouchableOpacity>
              )}
              {item.role === 'admin' && (
                <View style={{ 
                  backgroundColor: ACCENT + '20',
                  paddingHorizontal: 8,
                  paddingVertical: 4,
                  borderRadius: 8,
                  marginLeft: 8
                }}>
                  <Text style={{ color: ACCENT, fontSize: 12, fontWeight: 'bold' }}>Admin</Text>
                </View>
              )}
            </View>
          )}
          ListEmptyComponent={
            <Text style={{ color: TEXT_SECONDARY, textAlign: 'center', marginTop: 20 }}>
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
            backgroundColor: CARD_BG, 
            borderRadius: 20, 
            padding: 24, 
            width: '85%',
            borderWidth: 1,
            borderColor: 'rgba(255,255,255,0.05)'
          }}>
            <Text style={{ 
              fontWeight: 'bold', 
              fontSize: 20, 
              color: TEXT_MAIN, 
              textAlign: 'center',
              marginBottom: 24 
            }}>
              Edit Group Name
            </Text>

            <Text style={{ fontWeight: 'bold', fontSize: 15, color: TEXT_MAIN, marginBottom: 12 }}>
              Group Name
            </Text>
            <TextInput
              value={editGroupName}
              onChangeText={setEditGroupName}
              placeholder="Enter new group name"
              placeholderTextColor={TEXT_SECONDARY}
              style={{ 
                backgroundColor: INPUT_BG,
                borderRadius: 12,
                padding: 16,
                fontSize: 15,
                marginBottom: 24,
                color: TEXT_MAIN,
                borderWidth: 1,
                borderColor: 'rgba(255,255,255,0.05)'
              }}
              autoFocus
            />

            <TouchableOpacity 
              onPress={handleUpdateGroupName}
              disabled={actionLoading} 
              style={{ 
                backgroundColor: actionLoading ? TEXT_SECONDARY : ACCENT,
                borderRadius: 12,
                paddingVertical: 16,
                alignItems: 'center',
                marginBottom: 12,
                opacity: actionLoading ? 0.7 : 1
              }}
            >
              <Text style={{ color: BG, fontWeight: 'bold', fontSize: 16 }}>
                {actionLoading ? 'Updating...' : 'Update Group Name'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={() => {
                setEditModalVisible(false);
                setEditGroupName("");
              }} 
              disabled={actionLoading}
              style={{ 
                alignItems: 'center',
                padding: 12,
                opacity: actionLoading ? 0.5 : 1
              }}
            >
              <Text style={{ color: TEXT_SECONDARY, fontWeight: 'bold' }}>
                {actionLoading ? 'Please wait...' : 'Cancel'}
              </Text>
            </TouchableOpacity>
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
            backgroundColor: CARD_BG, 
            borderRadius: 20, 
            padding: 24, 
            width: '85%',
            borderWidth: 1,
            borderColor: 'rgba(255,255,255,0.05)'
          }}>
            <Text style={{ 
              fontWeight: 'bold', 
              fontSize: 20, 
              color: TEXT_MAIN, 
              textAlign: 'center',
              marginBottom: 16 
            }}>
              Delete Group
            </Text>

            <Text style={{ 
              fontSize: 16, 
              color: TEXT_SECONDARY, 
              textAlign: 'center',
              marginBottom: 24,
              lineHeight: 22
            }}>
              Are you sure you want to delete "{group?.name}"? This action cannot be undone and will remove all members from the group.
            </Text>

            <TouchableOpacity 
              onPress={confirmDeleteGroup}
              disabled={actionLoading} 
              style={{ 
                backgroundColor: actionLoading ? 'rgba(239, 68, 68, 0.5)' : DANGER,
                borderRadius: 12,
                paddingVertical: 16,
                alignItems: 'center',
                marginBottom: 12,
                opacity: actionLoading ? 0.7 : 1
              }}
            >
              <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>
                {actionLoading ? 'Deleting...' : 'Delete Group'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={() => setDeleteModalVisible(false)} 
              disabled={actionLoading}
              style={{ 
                alignItems: 'center',
                padding: 12,
                opacity: actionLoading ? 0.5 : 1
              }}
            >
              <Text style={{ color: TEXT_SECONDARY, fontWeight: 'bold' }}>
                {actionLoading ? 'Please wait...' : 'Cancel'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
} 