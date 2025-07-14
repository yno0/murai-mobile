import { Feather } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import React from "react";
import { ScrollView, StatusBar, Text, TouchableOpacity, View } from "react-native";
import AppButton from "../../components/common/AppButton";
import { COLORS } from "../../constants/theme";
import { useAuth } from "../../context/AuthContext";

export default function PersonalInfo() {
  const navigation = useNavigation();
  const { user, loading, logout } = useAuth();

  const profileOptions = [
    {
      title: "Account Management",
      icon: "settings",
      onPress: () => navigation.navigate("AccountManagement"),
    },
    {
      title: "Notification Preferences",
      icon: "bell",
      onPress: () => navigation.navigate("NotificationPreferences"),
    },
    {
      title: "Privacy Controls",
      icon: "shield",
      onPress: () => navigation.navigate("PrivacyControls"),
    },
    {
      title: "Security Settings",
      icon: "lock",
      onPress: () => navigation.navigate("SecuritySettings"),
    },
  ];

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: '#0f0f0f', justifyContent: 'center', alignItems: 'center' }}>
        <StatusBar barStyle="light-content" backgroundColor="#0f0f0f" />
        <Text style={{ color: 'white', fontSize: 16 }}>Loading...</Text>
      </View>
    );
  }

  const BG = COLORS.BG;
  const TEXT_MAIN = COLORS.TEXT_MAIN;

  return (
    <View style={{ flex: 1, backgroundColor: '#0f0f0f' }}>
      <StatusBar barStyle="light-content" backgroundColor="#0f0f0f" />
      
      {/* Profile Header */}
      <View style={{ paddingHorizontal: 24, paddingTop: 80, paddingBottom: 48, alignItems: 'center' }}>
        <View style={{
          width: 80,
          height: 80,
          backgroundColor: '#34d399',
          borderRadius: 40,
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 20,
        }}>
          <Feather name="user" size={36} color="#0f0f0f" />
        </View>
        
        <Text style={{ 
          color: 'white', 
          fontSize: 24, 
          fontWeight: '600', 
          marginBottom: 6,
        }}>
          {user?.name || 'User'}
        </Text>
        <Text style={{ 
          color: '#9ca3af', 
          fontSize: 16, 
        }}>
          {user?.email || 'No email'}
        </Text>
      </View>

      {/* Profile Options */}
      <ScrollView style={{ flex: 1, paddingHorizontal: 24 }} showsVerticalScrollIndicator={false}>
        <View style={{
          backgroundColor: '#1a1a1a',
          borderRadius: 16,
          overflow: 'hidden',
          marginBottom: 24,
        }}>
          {profileOptions.map((option, index) => (
            <TouchableOpacity
              key={index}
              onPress={option.onPress}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingVertical: 16,
                paddingHorizontal: 20,
                borderBottomWidth: index < profileOptions.length - 1 ? 1 : 0,
                borderBottomColor: '#262626',
              }}
              activeOpacity={0.7}
            >
              <Feather name={option.icon} size={20} color="#9ca3af" style={{ marginRight: 16 }} />
              <Text style={{ 
                color: 'white', 
                fontSize: 16, 
                flex: 1,
              }}>
                {option.title}
              </Text>
              <Feather name="chevron-right" size={16} color="#666" />
            </TouchableOpacity>
          ))}
        </View>
        
        {/* Sign Out */}
        <AppButton
          title="Logout"
          onPress={logout}
          style={{ marginTop: 32 }}
        />
      </ScrollView>
    </View>
  );
}
