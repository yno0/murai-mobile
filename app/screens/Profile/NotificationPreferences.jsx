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

  const notificationSections = [
    {
      title: "App Notifications",
      description: "Control how you receive notifications in the app",
      options: [
        {
          key: "pushNotifications",
          title: "Push Notifications",
          subtitle: "Receive notifications on your device",
          icon: "smartphone",
          color: "#3b82f6",
        },
        {
          key: "detectionAlerts",
          title: "Detection Alerts",
          subtitle: "Real-time detection notifications",
          icon: "radio",
          color: "#ef4444",
        },
      ]
    },
    {
      title: "Communication",
      description: "Manage how we communicate with you",
      options: [
        {
          key: "emailNotifications",
          title: "Email Notifications",
          subtitle: "Receive notifications via email",
          icon: "mail",
          color: "#f59e0b",
        },
        {
          key: "groupUpdates",
          title: "Group Updates",
          subtitle: "Get notified about group activities",
          icon: "users",
          color: "#8b5cf6",
        },
      ]
    },
    {
      title: "Reports & Marketing",
      description: "Optional notifications for updates and promotions",
      options: [
        {
          key: "weeklyReports",
          title: "Weekly Reports",
          subtitle: "Receive weekly activity summaries",
          icon: "bar-chart",
          color: "#10b981",
        },
        {
          key: "marketingEmails",
          title: "Marketing Emails",
          subtitle: "Promotional and feature updates",
          icon: "gift",
          color: "#f97316",
        },
      ]
    }
  ];

  return (
    <View style={{ flex: 1, backgroundColor: '#030712' }}>
      <StatusBar barStyle="light-content" backgroundColor="#030712" />
      
      {/* Header */}
      <View style={{
        backgroundColor: '#111827',
        paddingHorizontal: 16,
        paddingTop: 56,
        paddingBottom: 24,
        borderBottomWidth: 1,
        borderBottomColor: '#1f2937',
      }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity 
            onPress={() => navigation.goBack()} 
            style={{
              width: 40,
              height: 40,
              backgroundColor: '#1f2937',
              borderRadius: 20,
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: 16,
            }}
          >
            <Feather name="arrow-left" size={20} color="#34d399" />
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={{ color: 'white', fontSize: 24, fontWeight: 'bold' }}>
              Notifications
            </Text>
            <Text style={{ color: '#9ca3af', fontSize: 14, marginTop: 4 }}>
              Manage your notification preferences
            </Text>
          </View>
        </View>
      </View>

      <ScrollView style={{ flex: 1, paddingHorizontal: 16, paddingVertical: 24 }}>
        {/* Quick Toggle */}
        <View style={{
          backgroundColor: '#111827',
          borderRadius: 24,
          padding: 24,
          marginBottom: 24,
          borderWidth: 1,
          borderColor: '#1f2937',
        }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View style={{ flex: 1 }}>
              <Text style={{ color: 'white', fontSize: 18, fontWeight: 'bold', marginBottom: 4 }}>
                All Notifications
              </Text>
              <Text style={{ color: '#9ca3af', fontSize: 14 }}>
                Enable or disable all notifications at once
              </Text>
            </View>
            <View style={{
              width: 48,
              height: 48,
              backgroundColor: '#10b98120',
              borderRadius: 16,
              alignItems: 'center',
              justifyContent: 'center',
              marginLeft: 16,
            }}>
              <Feather name="bell" size={24} color="#10b981" />
            </View>
          </View>
        </View>

        {/* Notification Sections */}
        {notificationSections.map((section, sectionIndex) => (
          <View key={sectionIndex} style={{
            backgroundColor: '#111827',
            borderRadius: 24,
            padding: 24,
            marginBottom: 24,
            borderWidth: 1,
            borderColor: '#1f2937',
          }}>
            <View style={{ marginBottom: 24 }}>
              <Text style={{ color: 'white', fontSize: 18, fontWeight: 'bold', marginBottom: 8 }}>
                {section.title}
              </Text>
              <Text style={{ color: '#9ca3af', fontSize: 14, lineHeight: 20 }}>
                {section.description}
              </Text>
            </View>
            
            <View style={{ gap: 16 }}>
              {section.options.map((option) => (
                <View
                  key={option.key}
                  style={{
                    backgroundColor: '#1f2937',
                    borderRadius: 16,
                    padding: 16,
                    borderWidth: 1,
                    borderColor: '#374151',
                  }}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                      <View style={{
                        width: 48,
                        height: 48,
                        borderRadius: 12,
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: `${option.color}20`,
                        marginRight: 16,
                      }}>
                        <Feather name={option.icon} size={22} color={option.color} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={{ color: 'white', fontSize: 18, fontWeight: '600', marginBottom: 4 }}>
                          {option.title}
                        </Text>
                        <Text style={{ color: '#9ca3af', fontSize: 14, lineHeight: 20 }}>
                          {option.subtitle}
                        </Text>
                      </View>
                    </View>
                    <Switch
                      value={preferences[option.key]}
                      onValueChange={() => togglePreference(option.key)}
                      trackColor={{ false: "#374151", true: "#10b981" }}
                      thumbColor={preferences[option.key] ? "#fff" : "#9ca3af"}
                      ios_backgroundColor="#374151"
                    />
                  </View>
                </View>
              ))}
            </View>
          </View>
        ))}

        {/* Notification Schedule */}
        <View style={{
          backgroundColor: '#111827',
          borderRadius: 24,
          padding: 24,
          marginBottom: 32,
          borderWidth: 1,
          borderColor: '#1f2937',
        }}>
          <Text style={{ color: 'white', fontSize: 18, fontWeight: 'bold', marginBottom: 16 }}>
            Quiet Hours
          </Text>
          <Text style={{ color: '#9ca3af', fontSize: 14, marginBottom: 24, lineHeight: 20 }}>
            Set times when you don't want to receive notifications
          </Text>
          
          <TouchableOpacity style={{
            backgroundColor: '#1f2937',
            borderRadius: 16,
            padding: 16,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderWidth: 1,
            borderColor: '#374151',
          }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={{
                width: 48,
                height: 48,
                backgroundColor: '#8b5cf620',
                borderRadius: 12,
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 16,
              }}>
                <Feather name="moon" size={22} color="#8b5cf6" />
              </View>
              <View>
                <Text style={{ color: 'white', fontSize: 18, fontWeight: '600' }}>
                  10:00 PM - 8:00 AM
                </Text>
                <Text style={{ color: '#9ca3af', fontSize: 14 }}>
                  Quiet hours enabled
                </Text>
              </View>
            </View>
            <Feather name="chevron-right" size={20} color="#6b7280" />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}
