import { Feather } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import { Alert, Clipboard, FlatList, Modal, SafeAreaView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { account } from "../../lib/appwrite-config";
import { groupService } from "../../services/groupService";

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
      // Ensure groupId is available before proceeding
      if (!groupId) {
        console.log('groupId not available yet, skipping admin check');
        return;
      }

      const user = await account.get();
      setCurrentUserId(user.$id);
      console.log('Current user ID:', user.$id);
      
      // Ensure we have both groupId and userId before checking admin status
      if (groupId && user.$id) {
        console.log('Checking admin status for groupId:', groupId, 'userId:', user.$id);
        const adminStatus = await groupService.isGroupAdmin(groupId, user.$id);
        console.log('Admin status result:', adminStatus);
        setIsAdmin(adminStatus);
      }
    } catch (error) {
      console.error('Error checking current user:', error);
    }
  };

  const loadGroupDetails = async () => {
    try {
      // Ensure groupId is available before proceeding
      if (!groupId) {
        console.log('groupId not available yet, skipping group details load');
        return;
      }

      setLoading(true);
      const [groupData, membersData] = await Promise.all([
        groupService.getGroupById(groupId),
        groupService.getGroupMembers(groupId)
      ]);
      
      setGroup(groupData);
      setMembers(membersData);
    } catch (error) {
      console.error('Error loading group details:', error);
      
      if (error.code === 404 || error.message.includes('Document with the requested ID could not be found')) {
        // Group document doesn't exist
        Alert.alert(
          'Group Not Found',
          'This group no longer exists. It may have been deleted.',
          [
            {
              text: 'Go Back',
              onPress: () => navigation.goBack()
            }
          ]
        );
      } else {
        Alert.alert('Error', 'Failed to load group details');
      }
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
      console.log('Updating group name from:', group?.name, 'to:', editGroupName.trim());
      await groupService.updateGroupName(groupId, editGroupName.trim());
      
      // Close modal and reset form
      setEditModalVisible(false);
      setEditGroupName("");
      
      // Reload group details first
      await loadGroupDetails();
      
      // Show success message
      Alert.alert('Success', 'Group name updated successfully!');
      
    } catch (error) {
      console.error('Error updating group name:', error);
      console.error('Error details:', {
        message: error.message,
        code: error.code,
        type: error.type
      });
      
      // Check if it's a team-related error
      if (error.message && (error.message.includes('missing a Team ID') || error.message.includes('no longer exists'))) {
        Alert.alert(
          'Group Recovery Needed',
          error.message + '\n\nWould you like to try recovering this group?',
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Recover Group',
              onPress: async () => {
                try {
                  await groupService.recoverGroup(groupId);
                  Alert.alert(
                    'Recovery Successful', 
                    'Group recovered successfully! You can now try updating the name again.',
                    [
                      {
                        text: 'OK',
                        onPress: async () => {
                          await loadGroupDetails();
                        }
                      }
                    ]
                  );
                } catch (recoveryError) {
                  console.error('Error recovering group:', recoveryError);
                  Alert.alert(
                    'Recovery Failed', 
                    recoveryError.message || 'Failed to recover the group. Please try deleting and recreating it.',
                    [
                      {
                        text: 'Try Delete',
                        onPress: () => setDeleteModalVisible(true)
                      },
                      {
                        text: 'Cancel',
                        style: 'cancel'
                      }
                    ]
                  );
                }
              }
            }
          ]
        );
      } else {
        Alert.alert(
          'Update Failed',
          error.message || 'Failed to update group name. You may not have permission to edit this group.',
          [
            {
              text: 'Try Again',
              onPress: () => {
                // Keep the modal open for retry
              }
            },
            {
              text: 'Cancel',
              style: 'cancel',
              onPress: () => {
                setEditModalVisible(false);
                setEditGroupName("");
              }
            }
          ]
        );
      }
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
      console.log('Deleting group:', groupId);
      await groupService.deleteGroup(groupId);
      
      // Close modal
      setDeleteModalVisible(false);
      
      // Navigate back first
      navigation.navigate('CreateGroup');
      
      // Show success message after navigation
      setTimeout(() => {
        Alert.alert('Success', 'Group deleted successfully!');
      }, 100);
      
    } catch (error) {
      console.error('Error deleting group:', error);
      console.error('Error details:', {
        message: error.message,
        code: error.code,
        type: error.type
      });
      
      // Close modal on error too
      setDeleteModalVisible(false);
      
      // Show error message with more details
      Alert.alert(
        'Delete Failed',
        error.message || 'Failed to delete group. You may not have permission to delete this group.',
        [
          {
            text: 'Try Again',
            onPress: () => setDeleteModalVisible(true)
          },
          {
            text: 'Cancel',
            style: 'cancel'
          }
        ]
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleRemoveMember = async (memberId, memberName) => {
    console.log('--- handleRemoveMember called ---');
    console.log('Attempting to remove member:', memberName, 'with ID:', memberId);
    console.log('Current admin status (isAdmin state):', isAdmin);

    if (!isAdmin) {
      Alert.alert('Permission Denied', 'You are not an admin for this group.');
      return;
    }

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
              await groupService.removeMember(groupId, memberId);
              Alert.alert('Success', 'Member removed successfully');
              loadGroupDetails(); // Reload the member list
            } catch (error) {
              console.error('Detailed error removing member:', JSON.stringify(error, null, 2));
              Alert.alert(
                'Removal Failed',
                error.message || 'Failed to remove member. Please try again.',
                [{ text: 'OK' }]
              );
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: BG, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ color: TEXT_MAIN }}>Loading...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: BG }}>
      {/* Header */}
      <View style={{ 
        flexDirection: 'row', 
        alignItems: 'center', 
        padding: 20,
        paddingTop: 24,
        backgroundColor: CARD_BG,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.1)'
      }}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          style={{ marginRight: 16 }}
        >
          <Feather name="arrow-left" size={24} color={TEXT_MAIN} />
        </TouchableOpacity>
        <Text style={{ flex: 1, fontWeight: 'bold', fontSize: 24, color: TEXT_MAIN }}>{groupName}</Text>
        {isAdmin && (
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <TouchableOpacity 
              onPress={handleEditGroup}
              style={{ 
                backgroundColor: GRAY_BTN,
                borderRadius: 8,
                padding: 8
              }}
            >
              <Feather name="edit-2" size={20} color={TEXT_SECONDARY} />
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={handleDeleteGroup}
              style={{ 
                backgroundColor: DANGER + '20',
                borderRadius: 8,
                padding: 8
              }}
            >
              <Feather name="trash-2" size={20} color={DANGER} />
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Group Info */}
      <View style={{ 
        backgroundColor: CARD_BG, 
        margin: 20, 
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)'
      }}>
        <Text style={{ color: TEXT_MAIN, fontWeight: 'bold', fontSize: 18, marginBottom: 8 }}>Group Code</Text>
        <TouchableOpacity 
          onPress={handleCopyCode}
          style={{ 
            flexDirection: 'row', 
            alignItems: 'center',
            backgroundColor: INPUT_BG,
            padding: 12,
            borderRadius: 8,
          }}
        >
          <Text style={{ color: ACCENT, fontSize: 20, fontWeight: 'bold', letterSpacing: 3, flex: 1 }}>
            {group?.shortCode}
          </Text>
          <Feather name="copy" size={20} color={TEXT_SECONDARY} />
        </TouchableOpacity>
        <Text style={{ color: TEXT_SECONDARY, fontSize: 14, marginTop: 12 }}>
          Created {group?.createdAt ? new Date(group.createdAt).toLocaleDateString() : '...'}
        </Text>
      </View>

      {/* Members List */}
      <View style={{ flex: 1, paddingHorizontal: 20 }}>
        <Text style={{ color: TEXT_MAIN, fontWeight: 'bold', fontSize: 18, marginBottom: 16 }}>
          Members ({members.length})
        </Text>
        <FlatList
          data={members}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <View style={{ 
              backgroundColor: CARD_BG,
              borderRadius: 12,
              padding: 16,
              marginBottom: 12,
              flexDirection: 'row',
              alignItems: 'center',
              borderWidth: 1,
              borderColor: 'rgba(255,255,255,0.05)'
            }}>
              <View style={{ 
                backgroundColor: GRAY_BTN,
                width: 40,
                height: 40,
                borderRadius: 20,
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 12
              }}>
                <Text style={{ color: ACCENT, fontWeight: 'bold' }}>
                  {item.name.split(' ').map(n => n[0]).join('')}
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
              Are you sure you want to delete &quot;{group?.name}&quot;? This action cannot be undone and will remove all members from the group.
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