import { Feather } from "@expo/vector-icons";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import React, { useState } from "react";
import { Alert, FlatList, Modal, SafeAreaView, Text, TextInput, TouchableOpacity, View } from "react-native";

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
      
      // Mock groups data
      const mockGroups = [
        {
          $id: 'mock-group-1',
          name: 'Mock Group 1',
          shortCode: 'MOCK1',
          createdBy: 'mock-user-id',
          createdAt: new Date().toISOString(),
          teamId: 'mock-team-1'
        },
        {
          $id: 'mock-group-2',
          name: 'Mock Group 2',
          shortCode: 'MOCK2',
          createdBy: 'mock-user-id',
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          teamId: 'mock-team-2'
        }
      ];
      
      setGroups(mockGroups);
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
      // Mock group creation
      const newGroup = {
        $id: `mock-group-${Date.now()}`,
        name: groupName.trim(),
        shortCode: `MOCK${Math.random().toString(36).substr(2, 4).toUpperCase()}`,
        createdBy: 'mock-user-id',
        createdAt: new Date().toISOString(),
        teamId: `mock-team-${Date.now()}`
      };
      
      setGroups(prev => [newGroup, ...prev]);
      setGroupName("");
      setModalVisible(false);
      Alert.alert('Success', 'Group created successfully! (Mock implementation)');
    } catch (error) {
      console.error('Error creating group:', error);
      Alert.alert('Creation Failed', 'Failed to create group');
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
      console.log('Mock attempting to join group with code:', groupCode.trim());
      
      // Mock join logic
      const mockJoinedGroup = {
        $id: `mock-joined-group-${Date.now()}`,
        name: 'Mock Joined Group',
        shortCode: groupCode.trim(),
        createdBy: 'mock-user-id',
        createdAt: new Date().toISOString(),
        teamId: `mock-team-${Date.now()}`,
        joinMethod: 'mock_join'
      };
      
      setGroups(prev => [mockJoinedGroup, ...prev]);
      setGroupCode("");
      setModalVisible(false);
      
      Alert.alert('Success', `Joined group "${mockJoinedGroup.name}" successfully! (Mock implementation)`);
    } catch (error) {
      console.error('Error joining group:', error);
      Alert.alert('Error', 'Failed to join group. Please check the code and try again.');
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

      {/* Groups List */}
      <View style={{ flex: 1, padding: 20 }}>
        {loading ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text style={{ color: TEXT_MAIN, fontSize: 16 }}>Loading...</Text>
          </View>
        ) : groups.length === 0 ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text style={{ color: TEXT_SECONDARY, fontSize: 16, textAlign: 'center', marginBottom: 20 }}>
              You haven't joined any groups yet
            </Text>
            <TouchableOpacity 
              onPress={() => setModalVisible(true)}
              style={{ 
                backgroundColor: ACCENT,
                paddingHorizontal: 24,
                paddingVertical: 12,
                borderRadius: 8
              }}
            >
              <Text style={{ color: BG, fontWeight: 'bold' }}>Create or Join a Group</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={groups}
            keyExtractor={(item) => item.$id}
            renderItem={({ item }) => (
              <TouchableOpacity 
                onPress={() => handleGroupPress(item)}
                style={{ 
                  backgroundColor: CARD_BG,
                  borderRadius: 12,
                  padding: 16,
                  marginBottom: 12,
                  borderWidth: 1,
                  borderColor: 'rgba(255,255,255,0.05)'
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <View style={{ 
                    backgroundColor: GRAY_BTN,
                    width: 50, 
                    height: 50, 
                    borderRadius: 25, 
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: 16
                  }}>
                    <Text style={{ color: ACCENT, fontWeight: 'bold', fontSize: 18 }}>
                      {getInitials(item.name)}
                    </Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: TEXT_MAIN, fontWeight: 'bold', fontSize: 16, marginBottom: 4 }}>
                      {item.name}
                    </Text>
                    <Text style={{ color: TEXT_SECONDARY, fontSize: 14 }}>
                      Code: {item.shortCode} • Created {new Date(item.createdAt).toLocaleDateString()}
                    </Text>
                  </View>
                  <Feather name="chevron-right" size={20} color={TEXT_SECONDARY} />
                </View>
              </TouchableOpacity>
            )}
          />
        )}
      </View>

      {/* Create/Join Modal */}
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
            width: '90%',
            maxWidth: 400,
            borderWidth: 1,
            borderColor: 'rgba(255,255,255,0.05)'
          }}>
            {/* Tab Buttons */}
            <View style={{ 
              flexDirection: 'row', 
              backgroundColor: INPUT_BG, 
              borderRadius: 12, 
              padding: 4, 
              marginBottom: 24 
            }}>
              <TouchableOpacity 
                onPress={() => setTab("create")}
                style={{ 
                  flex: 1, 
                  backgroundColor: tab === "create" ? ACCENT : 'transparent',
                  borderRadius: 8,
                  paddingVertical: 12,
                  alignItems: 'center'
                }}
              >
                <Text style={{ 
                  color: tab === "create" ? BG : TEXT_MAIN, 
                  fontWeight: 'bold' 
                }}>
                  Create Group
                </Text>
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={() => setTab("join")}
                style={{ 
                  flex: 1, 
                  backgroundColor: tab === "join" ? ACCENT : 'transparent',
                  borderRadius: 8,
                  paddingVertical: 12,
                  alignItems: 'center'
                }}
              >
                <Text style={{ 
                  color: tab === "join" ? BG : TEXT_MAIN, 
                  fontWeight: 'bold' 
                }}>
                  Join Group
                </Text>
              </TouchableOpacity>
            </View>

            {tab === "create" ? (
              <>
                <Text style={{ 
                  fontWeight: 'bold', 
                  fontSize: 18, 
                  color: TEXT_MAIN, 
                  marginBottom: 16 
                }}>
                  Create New Group
                </Text>
                <Text style={{ 
                  color: TEXT_SECONDARY, 
                  fontSize: 14, 
                  marginBottom: 20,
                  lineHeight: 20
                }}>
                  Create a new group and invite others to join using the generated code.
                </Text>
                <Text style={{ 
                  color: TEXT_MAIN, 
                  fontSize: 14, 
                  marginBottom: 8 
                }}>
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
                    fontSize: 16,
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
                    alignItems: 'center',
                    marginBottom: 12,
                    opacity: loading ? 0.7 : 1
                  }}
                >
                  <Text style={{ color: BG, fontWeight: 'bold', fontSize: 16 }}>
                    {loading ? 'Creating...' : 'Create Group'}
                  </Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <Text style={{ 
                  fontWeight: 'bold', 
                  fontSize: 18, 
                  color: TEXT_MAIN, 
                  marginBottom: 16 
                }}>
                  Join Existing Group
                </Text>
                <Text style={{ 
                  color: TEXT_SECONDARY, 
                  fontSize: 14, 
                  marginBottom: 20,
                  lineHeight: 20
                }}>
                  Enter the group code provided by the group admin to join.
                </Text>
                <Text style={{ 
                  color: TEXT_MAIN, 
                  fontSize: 14, 
                  marginBottom: 8 
                }}>
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
                    fontSize: 16,
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
                    alignItems: 'center',
                    marginBottom: 12,
                    opacity: loading ? 0.7 : 1
                  }}
                >
                  <Text style={{ color: BG, fontWeight: 'bold', fontSize: 16 }}>
                    {loading ? 'Joining...' : 'Join Group'}
                  </Text>
                </TouchableOpacity>
              </>
            )}

            <TouchableOpacity 
              onPress={() => {
                setModalVisible(false);
                setGroupName("");
                setGroupCode("");
              }} 
              disabled={loading}
              style={{ 
                alignItems: 'center',
                padding: 12,
                opacity: loading ? 0.5 : 1
              }}
            >
              <Text style={{ color: TEXT_SECONDARY, fontWeight: 'bold' }}>
                {loading ? 'Please wait...' : 'Cancel'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
