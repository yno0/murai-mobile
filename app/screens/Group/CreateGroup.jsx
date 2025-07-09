import { Feather } from "@expo/vector-icons";
import React, { useState } from "react";
import { FlatList, Modal, SafeAreaView, Text, TextInput, TouchableOpacity, View } from "react-native";

const ACCENT = "#2563eb";

function getInitials(name) {
  return name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);
}

export default function CreateGroup() {
  const [modalVisible, setModalVisible] = useState(false);
  const [tab, setTab] = useState("create");
  const [groupName, setGroupName] = useState("");
  const [groupCode, setGroupCode] = useState("");
  const [groups, setGroups] = useState([
    { name: "My Study Group", code: "123ABC" }
  ]);

  const handleCreate = () => {
    if (groupName.trim()) {
      setGroups([...groups, { name: groupName, code: Math.random().toString(36).substr(2, 6).toUpperCase() }]);
      setGroupName("");
      setModalVisible(false);
    }
  };
  const handleJoin = () => {
    if (groupCode.trim()) {
      setGroups([...groups, { name: `Joined Group (${groupCode})`, code: groupCode }]);
      setGroupCode("");
      setModalVisible(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fafbfc' }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 18 }}>
        <Text style={{ fontWeight: 'bold', fontSize: 20, color: ACCENT }}>Groups</Text>
        <TouchableOpacity onPress={() => setModalVisible(true)} style={{ backgroundColor: ACCENT, borderRadius: 8, padding: 10 }}>
          <Feather name="plus" size={22} color="#fff" />
        </TouchableOpacity>
      </View>
      <FlatList
        data={groups}
        keyExtractor={item => item.code}
        contentContainerStyle={{ padding: 18 }}
        renderItem={({ item }) => (
          <View style={{ backgroundColor: '#fff', borderRadius: 12, marginBottom: 16, overflow: 'hidden', shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 8, elevation: 2 }}>
            {/* Header bar */}
            <View style={{ backgroundColor: '#f1f3f4', height: 40, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16 }}>
              <View style={{ backgroundColor: '#fff', borderRadius: 16, width: 32, height: 32, alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
                <Text style={{ color: '#666', fontWeight: 'bold', fontSize: 14 }}>{getInitials(item.name)}</Text>
              </View>
              <Text style={{ color: '#333', fontWeight: 'bold', fontSize: 16 }}>{item.name}</Text>
            </View>
            {/* Card body */}
            <View style={{ padding: 16 }}>
              <Text style={{ color: '#666', fontSize: 14 }}>Code: {item.code}</Text>
            </View>
          </View>
        )}
        ListEmptyComponent={<Text style={{ color: '#888', textAlign: 'center', marginTop: 40 }}>No groups yet.</Text>}
      />
      {/* Modal for Create/Join */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.18)', justifyContent: 'center', alignItems: 'center' }}>
          <View style={{ backgroundColor: '#fff', borderRadius: 14, padding: 24, width: '85%' }}>
            <View style={{ flexDirection: 'row', marginBottom: 18 }}>
              <TouchableOpacity onPress={() => setTab("create")}
                style={{ flex: 1, alignItems: 'center', paddingVertical: 10, borderBottomWidth: tab === "create" ? 2 : 0, borderColor: ACCENT }}>
                <Text style={{ fontWeight: tab === "create" ? 'bold' : 'normal', color: tab === "create" ? ACCENT : '#888', fontSize: 16 }}>Create Group</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setTab("join")}
                style={{ flex: 1, alignItems: 'center', paddingVertical: 10, borderBottomWidth: tab === "join" ? 2 : 0, borderColor: ACCENT }}>
                <Text style={{ fontWeight: tab === "join" ? 'bold' : 'normal', color: tab === "join" ? ACCENT : '#888', fontSize: 16 }}>Join Group</Text>
              </TouchableOpacity>
            </View>
            {tab === "create" ? (
              <>
                <Text style={{ fontWeight: 'bold', fontSize: 15, marginBottom: 8 }}>Group Name</Text>
                <TextInput
                  value={groupName}
                  onChangeText={setGroupName}
                  placeholder="Enter group name"
                  style={{ backgroundColor: '#f4f5f7', borderRadius: 8, padding: 12, fontSize: 15, marginBottom: 18 }}
                  autoFocus
                />
                <TouchableOpacity onPress={handleCreate} style={{ backgroundColor: ACCENT, borderRadius: 8, paddingVertical: 12, alignItems: 'center' }}>
                  <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>Create</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <Text style={{ fontWeight: 'bold', fontSize: 15, marginBottom: 8 }}>Group Code</Text>
                <TextInput
                  value={groupCode}
                  onChangeText={setGroupCode}
                  placeholder="Enter group code"
                  style={{ backgroundColor: '#f4f5f7', borderRadius: 8, padding: 12, fontSize: 15, marginBottom: 18 }}
                  autoFocus
                />
                <TouchableOpacity onPress={handleJoin} style={{ backgroundColor: ACCENT, borderRadius: 8, paddingVertical: 12, alignItems: 'center' }}>
                  <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>Join</Text>
                </TouchableOpacity>
              </>
            )}
            <TouchableOpacity onPress={() => setModalVisible(false)} style={{ marginTop: 18, alignItems: 'center' }}>
              <Text style={{ color: '#888', fontWeight: 'bold' }}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
