import { Feather } from "@expo/vector-icons";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import React, { useState } from "react";
import { Alert, FlatList, Modal, SafeAreaView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { groupService } from "../../services/groupService";

// Theme colors
const BG = "#0f0f0f";
const CARD_BG = "#1a1a1a";
const ACCENT = "#34d399";
const TEXT_MAIN = "#fff";
const TEXT_SECONDARY = "#a0a0a0";
const GRAY_BTN = "#2a2a2a";
const INPUT_BG = "#222";

function getInitials(name) {
  return name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);
}

export default function CreateGroup() {
  const navigation = useNavigation();
  const [modalVisible, setModalVisible] = useState(false);
  const [tab, setTab] = useState("create");
  const [groupName, setGroupName] = useState("");
  const [groupCode, setGroupCode] = useState("");
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      loadGroups();
    }, [])
  );

  const loadGroups = async () => {
    try {
      setLoading(true);
      const response = await groupService.getUserGroups();
      
      // Filter out broken groups (those with null teamId or undefined)
      const validGroups = response.documents.filter(group => group && group.teamId);
      const brokenGroups = response.documents.filter(group => group && !group.teamId);
      
      // Check for orphaned memberships (where group document doesn't exist)
      const orphanedMemberships = response.documents.filter(group => !group);
      
      if (brokenGroups.length > 0) {
        console.warn('Found broken groups (missing teamId):', brokenGroups);
        
        // Show alert about broken groups
        Alert.alert(
          'Broken Groups Detected',
          `Found ${brokenGroups.length} group(s) with missing team data. These groups may not work properly. Would you like to clean them up?`,
          [
            { text: 'Keep Them', style: 'cancel' },
            {
              text: 'Clean Up',
              onPress: async () => {
                try {
                  for (const brokenGroup of brokenGroups) {
                    await groupService.cleanupBrokenGroup(brokenGroup.$id);
                  }
                  Alert.alert('Success', 'Broken groups have been cleaned up.');
                  await loadGroups(); // Reload after cleanup
                } catch (error) {
                  console.error('Error cleaning up broken groups:', error);
                  Alert.alert('Error', 'Failed to clean up some broken groups.');
                }
              }
            }
          ]
        );
      }
      
      if (orphanedMemberships.length > 0) {
        console.warn('Found orphaned memberships (group document missing):', orphanedMemberships.length);
        // Automatically clean up orphaned memberships
        try {
          await groupService.cleanupOrphanedMemberships();
          console.log('Cleaned up orphaned memberships');
        } catch (error) {
          console.error('Error cleaning up orphaned memberships:', error);
        }
      }
      
      setGroups(validGroups);
    } catch (error) {
      console.error('Error loading groups:', error);
      Alert.alert('Error', 'Failed to load groups');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!groupName.trim()) {
      Alert.alert('Error', 'Please enter a group name');
      return;
    }

    setLoading(true);
    try {
      await groupService.createGroup(groupName.trim());
      setGroupName("");
      setModalVisible(false);
      Alert.alert('Success', 'Group created successfully!');
      await loadGroups(); // Reload the groups list
    } catch (error) {
      console.error('Detailed error creating group:', JSON.stringify(error, null, 2));
      Alert.alert(
        'Creation Failed',
        `Message: ${error.message}\n\nType: ${error.type}\nCode: ${error.code}`,
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
    }
  };
  
  const handleJoin = async () => {
    if (!groupCode.trim()) {
      Alert.alert('Error', 'Please enter a group code');
      return;
    }

    setLoading(true);
    try {
      console.log('Attempting to join group with code:', groupCode.trim());
      const joinedGroup = await groupService.joinGroup(groupCode.trim());
      setGroupCode("");
      setModalVisible(false);
      
      // Show different success messages based on join method
      const successMessage = joinedGroup.joinMethod === 'database_only' 
        ? `Joined group "${joinedGroup.name}" successfully!\n\nNote: Team permissions may be limited due to technical issues.`
        : `Joined group "${joinedGroup.name}" successfully!`;
      
      Alert.alert('Success', successMessage);
      await loadGroups(); // Reload the groups list
    } catch (error) {
      console.error('Error joining group:', error);
      console.error('Error details:', {
        message: error.message,
        code: error.code,
        type: error.type
      });
      
      // Provide more specific error messages
      let errorMessage = error.message || 'Failed to join group. Please check the code and try again.';
      
      if (error.message && error.message.includes('Group not found')) {
        errorMessage = 'Group not found. Please check the group code and try again.';
      } else if (error.message && error.message.includes('already a member')) {
        errorMessage = 'You are already a member of this group.';
      } else if (error.message && error.message.includes('broken')) {
        // Show an alert with recovery options for broken groups
        Alert.alert(
          'Broken Group Detected',
          error.message + '\n\nWhat would you like to do?',
          [
            {
              text: 'Delete Broken Group',
              style: 'destructive',
              onPress: async () => {
                try {
                  setLoading(true);
                  // Find the group by code
                  const allGroupsResponse = await groupService.findGroupByShortCode(groupCode.trim());
                  if (allGroupsResponse) {
                    await groupService.cleanupBrokenGroup(allGroupsResponse.$id);
                    Alert.alert('Deleted', 'Broken group has been deleted.');
                    await loadGroups();
                  } else {
                    Alert.alert('Error', 'Could not find the group to delete.');
                  }
                } catch (cleanupError) {
                  console.error('Cleanup failed:', cleanupError);
                  Alert.alert('Cleanup Failed', cleanupError.message || 'Failed to delete the broken group.');
                } finally {
                  setLoading(false);
                }
              }
            },
            {
              text: 'Recover Group (Admin Only)',
              onPress: async () => {
                try {
                  setLoading(true);
                  // Find the group by code
                  const allGroupsResponse = await groupService.findGroupByShortCode(groupCode.trim());
                  if (allGroupsResponse) {
                    await groupService.recoverGroup(allGroupsResponse.$id);
                    Alert.alert('Success', 'Group recovered successfully! You can now try joining again.');
                  } else {
                    Alert.alert('Error', 'Could not find the group to recover.');
                  }
                } catch (recoveryError) {
                  console.error('Recovery failed:', recoveryError);
                  Alert.alert(
                    'Recovery Failed',
                    recoveryError.message || 'Failed to recover the group. You may not be an admin of this group.'
                  );
                } finally {
                  setLoading(false);
                }
              }
            },
            { text: 'Cancel', style: 'cancel' }
          ]
        );
        return; // Exit early to avoid showing the generic error
      } else if (error.message && error.message.includes('URL')) {
        errorMessage = 'There was a technical issue joining the group. Please try again or contact support.';
      }
      
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleGroupPress = (group) => {
    navigation.navigate("GroupDetails", { groupId: group.$id, groupName: group.name });
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: BG }}>
      <View style={{ 
        flexDirection: 'row', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        padding: 20,
        paddingTop: 24,
        backgroundColor: CARD_BG,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.1)'
      }}>
        <Text style={{ fontWeight: 'bold', fontSize: 24, color: TEXT_MAIN }}>Groups</Text>
        <TouchableOpacity 
          onPress={() => setModalVisible(true)} 
          style={{ 
            backgroundColor: GRAY_BTN,
            borderRadius: 12,
            padding: 12
          }}
        >
          <Feather name="plus" size={22} color={ACCENT} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={groups}
        keyExtractor={item => item.$id}
        contentContainerStyle={{ padding: 20 }}
        renderItem={({ item }) => (
          <TouchableOpacity 
            onPress={() => handleGroupPress(item)}
            style={{ 
              backgroundColor: CARD_BG, 
              borderRadius: 16, 
              marginBottom: 16,
              borderWidth: 1,
              borderColor: 'rgba(255,255,255,0.05)'
            }}
          >
            {/* Header bar */}
            <View style={{ 
              flexDirection: 'row', 
              alignItems: 'center', 
              padding: 16,
              borderBottomWidth: 1,
              borderBottomColor: 'rgba(255,255,255,0.05)'
            }}>
              <View style={{ 
                backgroundColor: GRAY_BTN, 
                borderRadius: 12, 
                width: 40, 
                height: 40, 
                alignItems: 'center', 
                justifyContent: 'center', 
                marginRight: 12 
              }}>
                <Text style={{ color: ACCENT, fontWeight: 'bold', fontSize: 16 }}>{getInitials(item.name)}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: TEXT_MAIN, fontWeight: 'bold', fontSize: 16 }}>{item.name}</Text>
                <Text style={{ color: TEXT_SECONDARY, fontSize: 14, marginTop: 4 }}>
                  {item.memberCount} {item.memberCount === 1 ? 'member' : 'members'}
                </Text>
              </View>
              <Feather name="chevron-right" size={20} color={TEXT_SECONDARY} />
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <Text style={{ color: TEXT_SECONDARY, textAlign: 'center', marginTop: 40 }}>
            No groups yet.
          </Text>
        }
      />

      {/* Modal for Create/Join */}
      <Modal visible={modalVisible} transparent animationType="slide">
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
            <View style={{ flexDirection: 'row', marginBottom: 24 }}>
              <TouchableOpacity 
                onPress={() => setTab("create")}
                style={{ 
                  flex: 1, 
                  alignItems: 'center', 
                  paddingVertical: 12,
                  borderBottomWidth: tab === "create" ? 2 : 0, 
                  borderColor: ACCENT 
                }}
              >
                <Text style={{ 
                  fontWeight: tab === "create" ? 'bold' : 'normal', 
                  color: tab === "create" ? ACCENT : TEXT_SECONDARY,
                  fontSize: 16 
                }}>
                  Create Group
                </Text>
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={() => setTab("join")}
                style={{ 
                  flex: 1, 
                  alignItems: 'center', 
                  paddingVertical: 12,
                  borderBottomWidth: tab === "join" ? 2 : 0, 
                  borderColor: ACCENT 
                }}
              >
                <Text style={{ 
                  fontWeight: tab === "join" ? 'bold' : 'normal', 
                  color: tab === "join" ? ACCENT : TEXT_SECONDARY,
                  fontSize: 16 
                }}>
                  Join Group
                </Text>
              </TouchableOpacity>
            </View>

            {tab === "create" ? (
              <>
                <Text style={{ fontWeight: 'bold', fontSize: 15, color: TEXT_MAIN, marginBottom: 12 }}>
                  Group Name
                </Text>
                <TextInput
                  value={groupName}
                  onChangeText={setGroupName}
                  placeholder="Enter group name"
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
                  onPress={handleCreate}
                  disabled={loading} 
                  style={{ 
                    backgroundColor: loading ? TEXT_SECONDARY : ACCENT,
                    borderRadius: 12,
                    paddingVertical: 16,
                    alignItems: 'center'
                  }}
                >
                  <Text style={{ color: BG, fontWeight: 'bold', fontSize: 16 }}>
                    {loading ? 'Creating...' : 'Create'}
                  </Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <Text style={{ fontWeight: 'bold', fontSize: 15, color: TEXT_MAIN, marginBottom: 12 }}>
                  Group Code
                </Text>
                <TextInput
                  value={groupCode}
                  onChangeText={setGroupCode}
                  placeholder="Enter group code"
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
                  autoCapitalize="characters"
                />
                <TouchableOpacity 
                  onPress={handleJoin}
                  disabled={loading} 
                  style={{ 
                    backgroundColor: loading ? TEXT_SECONDARY : ACCENT,
                    borderRadius: 12,
                    paddingVertical: 16,
                    alignItems: 'center'
                  }}
                >
                  <Text style={{ color: BG, fontWeight: 'bold', fontSize: 16 }}>
                    {loading ? 'Joining...' : 'Join'}
                  </Text>
                </TouchableOpacity>
              </>
            )}

            <TouchableOpacity 
              onPress={() => setModalVisible(false)} 
              style={{ 
                marginTop: 20,
                alignItems: 'center',
                padding: 12
              }}
            >
              <Text style={{ color: TEXT_SECONDARY, fontWeight: 'bold' }}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
