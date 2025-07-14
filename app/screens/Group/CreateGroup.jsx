import { Feather } from "@expo/vector-icons";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import React, { useState } from "react";
import { Alert, FlatList, Modal, SafeAreaView, Text, TouchableOpacity, View } from "react-native";
import AppButton from "../../components/common/AppButton";
import AppInput from "../../components/common/AppInput";
import Header from "../../components/common/Header";
import { COLORS } from "../../constants/theme";

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
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Not authenticated');
      const response = await fetch('http://localhost:3000/api/users/groups', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to load groups');
      }
      const groups = await response.json();
      setGroups(groups);
    } catch (error) {
      console.error('Error loading groups:', error);
      Alert.alert('Error', error.message || 'Failed to load groups');
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
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Not authenticated');
      const response = await fetch('http://localhost:3000/api/users/groups', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: groupName.trim() })
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to create group');
      }
      const newGroup = await response.json();
      setGroups(prev => [newGroup, ...prev]);
      setGroupName("");
      setModalVisible(false);
      Alert.alert('Success', 'Group created successfully!');
    } catch (error) {
      console.error('Error creating group:', error);
      Alert.alert('Creation Failed', error.message || 'Failed to create group');
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
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Not authenticated');
      const response = await fetch('http://localhost:3000/api/users/groups/join', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code: groupCode.trim() })
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to join group');
      }
      const joinedGroup = await response.json();
      setGroups(prev => [joinedGroup, ...prev]);
      setGroupCode("");
      setModalVisible(false);
      Alert.alert('Success', `Joined group "${joinedGroup.name}" successfully!`);
    } catch (error) {
      console.error('Error joining group:', error);
      Alert.alert('Error', error.message || 'Failed to join group. Please check the code and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGroupPress = (group) => {
    navigation.navigate("GroupDetails", { groupId: group._id || group.id, groupName: group.name });
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.BG }}>
      <Header
        title="Groups"
        showBack
        onBack={() => navigation.goBack()}
      />

      {/* Section Header */}
      <View style={{ paddingHorizontal: 20, paddingTop: 18, paddingBottom: 8 }}>
        <Text style={{ color: COLORS.TEXT_MAIN, fontSize: 22, fontWeight: 'bold' }}>My Groups</Text>
      </View>

      {/* Groups List */}
      <View style={{ flex: 1, paddingHorizontal: 8, backgroundColor: COLORS.BG }}>
        {loading ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text style={{ color: COLORS.TEXT_MAIN, fontSize: 16 }}>Loading...</Text>
          </View>
        ) : groups.length === 0 ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 16 }}>
            <Feather name="users" size={60} color={COLORS.ACCENT} style={{ marginBottom: 18 }} />
            <Text style={{ color: COLORS.TEXT_SECONDARY, fontSize: 17, textAlign: 'center', marginBottom: 18 }}>
              You haven&apos;t joined any groups yet
            </Text>
            <AppButton
              title="Create or Join a Group"
              onPress={() => setModalVisible(true)}
              style={{ width: 220 }}
            />
          </View>
        ) : (
          <FlatList
            data={groups}
            keyExtractor={(item) => item.$id}
            contentContainerStyle={{ paddingBottom: 100, paddingTop: 4 }}
            showsVerticalScrollIndicator={false}
            renderItem={({ item, index }) => (
              <TouchableOpacity
                onPress={() => handleGroupPress(item)}
                activeOpacity={0.85}
                style={{
                  backgroundColor: COLORS.CARD_BG,
                  borderRadius: 16,
                  marginHorizontal: 6,
                  marginBottom: 18,
                  padding: 0,
                  shadowColor: '#000',
                  shadowOpacity: 0.10,
                  shadowRadius: 8,
                  shadowOffset: { width: 0, height: 4 },
                  elevation: 3,
                  overflow: 'hidden',
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', padding: 16 }}>
                  {/* Avatar removed */}
                  <View style={{ flex: 1, justifyContent: 'center' }}>
                    <Text style={{ color: COLORS.TEXT_MAIN, fontWeight: 'bold', fontSize: 17, marginBottom: 2 }}>
                      {item.name}
                    </Text>
                    <View style={{ height: 1, backgroundColor: 'rgba(255,255,255,0.07)', marginVertical: 6 }} />
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Text style={{ color: COLORS.TEXT_SECONDARY, fontSize: 13 }}>
                        Code: <Text style={{ color: COLORS.ACCENT, fontWeight: 'bold' }}>{item.shortCode || 'N/A'}</Text>
                      </Text>
                      <Text style={{ color: COLORS.TEXT_SECONDARY, fontSize: 13 }}>
                        {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'N/A'}
                      </Text>
                    </View>
                  </View>
                  <Feather name="chevron-right" size={22} color={COLORS.TEXT_SECONDARY} style={{ marginLeft: 10 }} />
                </View>
              </TouchableOpacity>
            )}
          />
        )}
      </View>

      {/* Floating Action Button */}
      <TouchableOpacity
        onPress={() => setModalVisible(true)}
        style={{
          position: 'absolute',
          right: 24,
          bottom: 32,
          backgroundColor: COLORS.ACCENT,
          width: 56,
          height: 56,
          borderRadius: 28,
          alignItems: 'center',
          justifyContent: 'center',
          shadowColor: '#000',
          shadowOpacity: 0.18,
          shadowRadius: 8,
          shadowOffset: { width: 0, height: 4 },
          elevation: 6,
          zIndex: 100
        }}
      >
        <Feather name="plus" size={28} color={COLORS.BG} />
      </TouchableOpacity>

      {/* Create/Join Modal as Bottom Sheet */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={{
          flex: 1,
          justifyContent: 'flex-end',
          backgroundColor: 'rgba(0,0,0,0.5)'
        }}>
          <View style={{
            backgroundColor: COLORS.CARD_BG,
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            paddingHorizontal: 22,
            paddingTop: 18,
            paddingBottom: 32,
            width: '100%',
            borderWidth: 1,
            borderColor: 'rgba(255,255,255,0.07)',
            shadowColor: '#000',
            shadowOpacity: 0.12,
            shadowRadius: 12,
            shadowOffset: { width: 0, height: -4 },
            elevation: 12
          }}>
            {/* Tab Buttons */}
            <View style={{
              flexDirection: 'row',
              backgroundColor: COLORS.INPUT_BG,
              borderRadius: 10,
              padding: 3,
              marginBottom: 18
            }}>
              <TouchableOpacity
                onPress={() => setTab("create")}
                style={{
                  flex: 1,
                  backgroundColor: tab === "create" ? COLORS.ACCENT : 'transparent',
                  borderRadius: 8,
                  paddingVertical: 10,
                  alignItems: 'center',
                  marginRight: 2
                }}
              >
                <Text style={{
                  color: tab === "create" ? COLORS.BG : COLORS.TEXT_MAIN,
                  fontWeight: 'bold',
                  fontSize: 15
                }}>
                  Create Group
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setTab("join")}
                style={{
                  flex: 1,
                  backgroundColor: tab === "join" ? COLORS.ACCENT : 'transparent',
                  borderRadius: 8,
                  paddingVertical: 10,
                  alignItems: 'center',
                  marginLeft: 2
                }}
              >
                <Text style={{
                  color: tab === "join" ? COLORS.BG : COLORS.TEXT_MAIN,
                  fontWeight: 'bold',
                  fontSize: 15
                }}>
                  Join Group
                </Text>
              </TouchableOpacity>
            </View>
            {/* Divider */}
            <View style={{ height: 1, backgroundColor: 'rgba(255,255,255,0.08)', marginBottom: 16 }} />
            {tab === "create" ? (
              <>
                <Text style={{ fontWeight: 'bold', fontSize: 17, color: COLORS.TEXT_MAIN, marginBottom: 10 }}>
                  Create New Group
                </Text>
                <Text style={{ color: COLORS.TEXT_SECONDARY, fontSize: 13, marginBottom: 16, lineHeight: 18 }}>
                  Create a new group and invite others to join using the generated code.
                </Text>
                <AppInput
                  value={groupName}
                  onChangeText={setGroupName}
                  placeholder="Group Name"
                  style={{ marginBottom: 14 }}
                />
                <AppButton
                  title={loading ? "Creating..." : "Create Group"}
                  onPress={handleCreate}
                  loading={loading}
                  style={{ marginBottom: 10 }}
                />
              </>
            ) : (
              <>
                <Text style={{ fontWeight: 'bold', fontSize: 17, color: COLORS.TEXT_MAIN, marginBottom: 10 }}>
                  Join Existing Group
                </Text>
                <Text style={{ color: COLORS.TEXT_SECONDARY, fontSize: 13, marginBottom: 16, lineHeight: 18 }}>
                  Enter the group code provided by the group admin to join.
                </Text>
                <AppInput
                  value={groupCode}
                  onChangeText={setGroupCode}
                  placeholder="Group Code"
                  style={{ marginBottom: 14 }}
                />
                <AppButton
                  title={loading ? "Joining..." : "Join Group"}
                  onPress={handleJoin}
                  loading={loading}
                  style={{ marginBottom: 10 }}
                />
              </>
            )}
            <TouchableOpacity
              onPress={() => {
                setModalVisible(false);
                setGroupName("");
                setGroupCode("");
              }}
              disabled={loading}
              style={{ alignItems: 'center', padding: 10, opacity: loading ? 0.5 : 1 }}
            >
              <Text style={{ color: COLORS.TEXT_SECONDARY, fontWeight: 'bold', fontSize: 15 }}>
                {loading ? 'Please wait...' : 'Cancel'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

