import { Feather } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import React from "react";
import { ScrollView, StatusBar, Text, TouchableOpacity, View } from "react-native";

export default function PersonalInfo() {
  const navigation = useNavigation();

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
          John Doe
        </Text>
        <Text style={{ 
          color: '#9ca3af', 
          fontSize: 16, 
        }}>
          john.doe@example.com
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
        <TouchableOpacity
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingVertical: 16,
            paddingHorizontal: 20,
            backgroundColor: '#1a1a1a',
            borderRadius: 16,
            marginBottom: 40,
          }}
          activeOpacity={0.7}
        >
          <Feather name="log-out" size={20} color="#ef4444" style={{ marginRight: 16 }} />
          <Text style={{ 
            color: '#ef4444', 
            fontSize: 16, 
            flex: 1,
          }}>
            Sign Out
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
