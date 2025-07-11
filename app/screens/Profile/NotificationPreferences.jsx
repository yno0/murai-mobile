import { Feather } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import React, { useState } from "react";
import { ScrollView, StatusBar, Switch, Text, TouchableOpacity, View } from "react-native";

export default function NotificationPreferences() {
  const navigation = useNavigation();
  const [preferences, setPreferences] = useState({
    pushNotifications: true,
    emailNotifications: false,
    groupUpdates: true,
    detectionAlerts: true,
    weeklyReports: false,
    marketingEmails: false,
  });

  const togglePreference = (key) => {
    setPreferences(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const notificationOptions = [
    { key: "pushNotifications", title: "Push Notifications" },
    { key: "emailNotifications", title: "Email Notifications" },
    { key: "groupUpdates", title: "Group Updates" },
    { key: "detectionAlerts", title: "Detection Alerts" },
    { key: "weeklyReports", title: "Weekly Reports" },
    { key: "marketingEmails", title: "Marketing Emails" },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: '#0f0f0f' }}>
      <StatusBar barStyle="light-content" backgroundColor="#0f0f0f" />
      
      {/* Header */}
      <View style={{ paddingHorizontal: 24, paddingTop: 60, paddingBottom: 32 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity 
            onPress={() => navigation.goBack()} 
            style={{ marginRight: 16 }}
            activeOpacity={0.7}
          >
            <Feather name="arrow-left" size={24} color="#34d399" />
          </TouchableOpacity>
          <Text style={{ 
            color: 'white', 
            fontSize: 20, 
            fontWeight: '600',
          }}>
            Notifications
          </Text>
        </View>
      </View>

      <ScrollView style={{ flex: 1, paddingHorizontal: 24 }} showsVerticalScrollIndicator={false}>
        <View style={{
          backgroundColor: '#1a1a1a',
          borderRadius: 16,
          overflow: 'hidden',
          marginBottom: 40,
        }}>
          {notificationOptions.map((option, index) => (
            <View
              key={option.key}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingVertical: 16,
                paddingHorizontal: 20,
                borderBottomWidth: index < notificationOptions.length - 1 ? 1 : 0,
                borderBottomColor: '#262626',
              }}
            >
              <Text style={{ 
                color: 'white', 
                fontSize: 16, 
                flex: 1,
              }}>
                {option.title}
              </Text>
              <Switch
                value={preferences[option.key]}
                onValueChange={() => togglePreference(option.key)}
                trackColor={{ false: "#404040", true: "#34d399" }}
                thumbColor="#fff"
                ios_backgroundColor="#404040"
              />
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
