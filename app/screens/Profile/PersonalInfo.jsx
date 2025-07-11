import { Feather } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from 'expo-linear-gradient';
import React from "react";
import { ScrollView, StatusBar, Text, TouchableOpacity, View } from "react-native";

export default function PersonalInfo() {
  const navigation = useNavigation();

  const profileOptions = [
    {
      title: "Account Management",
      subtitle: "Update your account details",
      icon: "settings",
      color: "#3b82f6",
      onPress: () => navigation.navigate("AccountManagement"),
    },
    {
      title: "Notification Preferences",
      subtitle: "Manage your notifications",
      icon: "bell",
      color: "#f59e0b",
      onPress: () => navigation.navigate("NotificationPreferences"),
    },
    {
      title: "Privacy Controls",
      subtitle: "Control your privacy settings",
      icon: "shield",
      color: "#8b5cf6",
      onPress: () => navigation.navigate("PrivacyControls"),
    },
    {
      title: "Security Settings",
      subtitle: "Manage your security preferences",
      icon: "lock",
      color: "#ef4444",
      onPress: () => navigation.navigate("SecuritySettings"),
    },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: '#030712' }}>
      <StatusBar barStyle="light-content" backgroundColor="#030712" />
      
      {/* Profile Header with Gradient */}
      <LinearGradient
        colors={['#059669', '#10b981', '#14b8a6']}
        style={{ paddingHorizontal: 24, paddingTop: 64, paddingBottom: 32 }}
      >
        {/* Avatar with Shadow */}
        <View style={{ alignItems: 'center', marginBottom: 24 }}>
          <View style={{ position: 'relative' }}>
            <View style={{
              width: 112,
              height: 112,
              backgroundColor: 'white',
              borderRadius: 56,
              alignItems: 'center',
              justifyContent: 'center',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.3,
              shadowRadius: 16,
              elevation: 8,
            }}>
              <Feather name="user" size={52} color="#059669" />
            </View>
            {/* Online Status Indicator */}
            <View style={{
              position: 'absolute',
              bottom: -4,
              right: -4,
              width: 32,
              height: 32,
              backgroundColor: '#22c55e',
              borderRadius: 16,
              borderWidth: 4,
              borderColor: 'white',
            }} />
          </View>
        </View>
        
        {/* User Info */}
        <View style={{ alignItems: 'center' }}>
          <Text style={{ color: 'white', fontSize: 28, fontWeight: 'bold', marginBottom: 8, textAlign: 'center' }}>
            John Doe
          </Text>
          <Text style={{ color: '#d1fae5', fontSize: 18, opacity: 0.9, marginBottom: 4 }}>
            john.doe@example.com
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
            <View style={{ width: 8, height: 8, backgroundColor: '#22c55e', borderRadius: 4, marginRight: 8 }} />
            <Text style={{ color: '#bbf7d0', fontSize: 14 }}>Active now</Text>
          </View>
        </View>
      </LinearGradient>

      {/* Profile Options */}
      <ScrollView style={{ flex: 1, paddingHorizontal: 16, marginTop: -16 }}>
        {/* Card Container */}
        <View style={{
          backgroundColor: '#111827',
          borderRadius: 24,
          padding: 24,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.1,
          shadowRadius: 12,
          elevation: 5,
        }}>
          {profileOptions.map((option, index) => (
            <TouchableOpacity
              key={index}
              onPress={option.onPress}
              style={{
                backgroundColor: '#1f2937',
                borderRadius: 16,
                padding: 20,
                flexDirection: 'row',
                alignItems: 'center',
                marginBottom: index < profileOptions.length - 1 ? 16 : 0,
                borderWidth: 1,
                borderColor: '#374151',
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                {/* Icon Container with Color */}
                <View style={{
                  width: 56,
                  height: 56,
                  borderRadius: 16,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: `${option.color}20`,
                  marginRight: 16,
                }}>
                  <Feather name={option.icon} size={26} color={option.color} />
                </View>
                
                {/* Text Content */}
                <View style={{ flex: 1 }}>
                  <Text style={{ color: 'white', fontSize: 18, fontWeight: 'bold', marginBottom: 4 }}>
                    {option.title}
                  </Text>
                  <Text style={{ color: '#9ca3af', fontSize: 14, lineHeight: 20 }}>
                    {option.subtitle}
                  </Text>
                </View>
              </View>
              
              {/* Arrow */}
              <View style={{
                width: 32,
                height: 32,
                backgroundColor: '#374151',
                borderRadius: 16,
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <Feather name="chevron-right" size={18} color="#9ca3af" />
              </View>
            </TouchableOpacity>
          ))}
        </View>
        
        {/* Quick Actions */}
        <View style={{ marginTop: 24, marginBottom: 32 }}>
          <Text style={{ color: '#9ca3af', fontSize: 14, fontWeight: '600', marginBottom: 16, paddingHorizontal: 8 }}>
            Quick Actions
          </Text>
          <View style={{ flexDirection: 'row', gap: 16 }}>
            <TouchableOpacity style={{
              flex: 1,
              backgroundColor: '#1f2937',
              borderRadius: 16,
              padding: 16,
              alignItems: 'center',
              borderWidth: 1,
              borderColor: '#374151',
            }}>
              <View style={{
                width: 48,
                height: 48,
                backgroundColor: '#3b82f620',
                borderRadius: 12,
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 12,
              }}>
                <Feather name="edit" size={22} color="#3b82f6" />
              </View>
              <Text style={{ color: 'white', fontWeight: '600', fontSize: 14 }}>Edit Profile</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={{
              flex: 1,
              backgroundColor: '#1f2937',
              borderRadius: 16,
              padding: 16,
              alignItems: 'center',
              borderWidth: 1,
              borderColor: '#374151',
            }}>
              <View style={{
                width: 48,
                height: 48,
                backgroundColor: '#8b5cf620',
                borderRadius: 12,
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 12,
              }}>
                <Feather name="share" size={22} color="#8b5cf6" />
              </View>
              <Text style={{ color: 'white', fontWeight: '600', fontSize: 14 }}>Share Profile</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={{
              flex: 1,
              backgroundColor: '#1f2937',
              borderRadius: 16,
              padding: 16,
              alignItems: 'center',
              borderWidth: 1,
              borderColor: '#374151',
            }}>
              <View style={{
                width: 48,
                height: 48,
                backgroundColor: '#6b728020',
                borderRadius: 12,
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 12,
              }}>
                <Feather name="log-out" size={22} color="#6b7280" />
              </View>
              <Text style={{ color: 'white', fontWeight: '600', fontSize: 14 }}>Sign Out</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
