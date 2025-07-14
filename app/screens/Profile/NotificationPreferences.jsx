import { useNavigation } from "@react-navigation/native";
import React, { useState } from "react";
import { ScrollView, StatusBar, Switch, Text, View } from "react-native";
import Header from "../../components/common/Header";
import { COLORS } from "../../constants/theme";

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

  const BG = COLORS.BG;
  const TEXT_MAIN = COLORS.TEXT_MAIN;
  const ACCENT = COLORS.ACCENT;

  return (
    <View style={{ flex: 1, backgroundColor: BG }}>
      <StatusBar barStyle="light-content" backgroundColor={BG} />
      <Header title="Notifications" showBack onBack={() => navigation.goBack()} />

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
                color: TEXT_MAIN, 
                fontSize: 16, 
                flex: 1,
              }}>
                {option.title}
              </Text>
              <Switch
                value={preferences[option.key]}
                onValueChange={() => togglePreference(option.key)}
                trackColor={{ false: "#404040", true: ACCENT }}
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
