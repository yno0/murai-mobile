import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { useAuth } from "../context/AuthContext";

const BG = "#0f0f0f";
const ACCENT = "#34d399";
const TEXT = "#ffffff";
const SUBTLE = "#666666";

export default function Home() {
  const { user, logout } = useAuth();

  return (
    <View style={{ flex: 1, backgroundColor: BG, padding: 20, alignItems: "center", justifyContent: "center" }}>
      <Text style={{ color: TEXT, fontSize: 24, marginBottom: 8 }}>
        Welcome, {user?.name || "User"}
      </Text>
      
      <Text style={{ color: SUBTLE, marginBottom: 32, textAlign: "center" }}>
        You're signed in with {user?.email}
      </Text>
      
      <TouchableOpacity
        onPress={logout}
        style={{
          backgroundColor: ACCENT,
          borderRadius: 8,
          padding: 16,
          minWidth: 120,
          alignItems: "center",
        }}
      >
        <Text style={{ color: BG, fontWeight: "bold" }}>
          Logout
        </Text>
      </TouchableOpacity>
    </View>
  );
} 