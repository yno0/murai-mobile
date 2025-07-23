import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import { Modal, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from "react-native";
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Header from '../../components/common/Header';

export default function NotificationPreferences() {
  const navigation = useNavigation();
  
  const defaultPrefs = {
    pushNotifications: true,
    emailAlerts: false,
    detectionAlerts: true,
    groupActivity: true,
    weeklyReports: false,
    securityAlerts: true,
  };
  const [notifications, setNotifications] = useState(defaultPrefs);
  const [loading, setLoading] = useState(true);
  const [scheduleModalVisible, setScheduleModalVisible] = useState(false);

  // Load preferences from AsyncStorage on mount
  useEffect(() => {
    (async () => {
      try {
        const saved = await AsyncStorage.getItem('@notificationPrefs');
        if (saved) setNotifications(JSON.parse(saved));
      } catch {}
      setLoading(false);
    })();
  }, []);

  const toggleNotification = async (key) => {
    const updated = { ...notifications, [key]: !notifications[key] };
    setNotifications(updated);
    try {
      await AsyncStorage.setItem('@notificationPrefs', JSON.stringify(updated));
    } catch {}
  };

  const handleDisableAll = async () => {
    const allOff = Object.fromEntries(Object.keys(notifications).map(k => [k, false]));
    setNotifications(allOff);
    try {
      await AsyncStorage.setItem('@notificationPrefs', JSON.stringify(allOff));
    } catch {}
  };

  const notificationSettings = [
    {
      key: 'pushNotifications',
      title: 'Push Notifications',
      description: 'Receive notifications on your device',
      icon: 'bell-outline',
    },
    {
      key: 'emailAlerts',
      title: 'Email Alerts',
      description: 'Get important updates via email',
      icon: 'email-outline',
    },
    {
      key: 'detectionAlerts',
      title: 'Detection Alerts',
      description: 'Immediate alerts for content detection',
      icon: 'alert-circle-outline',
    },
    {
      key: 'groupActivity',
      title: 'Group Activity',
      description: 'Updates about group member activity',
      icon: 'account-group-outline',
    },
    {
      key: 'weeklyReports',
      title: 'Weekly Reports',
      description: 'Summary of weekly activity',
      icon: 'chart-line',
    },
    {
      key: 'securityAlerts',
      title: 'Security Alerts',
      description: 'Important security notifications',
      icon: 'shield-outline',
    },
  ];

  if (loading) {
    return <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}><Text>Loading...</Text></View>;
  }
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Header 
        title="Notification Preferences"
        showBackButton={true}
        onBackPress={() => navigation.goBack()}
        style={{ paddingHorizontal: 0 }}
      />

      {/* Notification Settings */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Notification Settings</Text>
        
        {notificationSettings.map((setting) => (
          <View key={setting.key} style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <MaterialCommunityIcons 
                name={setting.icon} 
                size={20} 
                color="#6B7280" 
              />
              <View style={styles.settingContent}>
                <Text style={styles.settingTitle}>{setting.title}</Text>
                <Text style={styles.settingDescription}>{setting.description}</Text>
              </View>
            </View>
            <Switch
              value={notifications[setting.key]}
              onValueChange={() => toggleNotification(setting.key)}
              trackColor={{ false: '#E5E7EB', true: '#374151' }}
              thumbColor={notifications[setting.key] ? '#FFFFFF' : '#FFFFFF'}
            />
          </View>
        ))}
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        
        <TouchableOpacity style={styles.actionItem} onPress={handleDisableAll}>
          <View style={styles.actionLeft}>
            <MaterialCommunityIcons name="bell-off-outline" size={20} color="#6B7280" />
            <Text style={styles.actionText}>Disable All Notifications</Text>
          </View>
          <MaterialCommunityIcons name="chevron-right" size={20} color="#9CA3AF" />
        </TouchableOpacity>

      </View>
      {/* Notification Schedule Modal */}
      <Modal
        visible={scheduleModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setScheduleModalVisible(false)}
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center', alignItems: 'center' }}>
          <View style={{ backgroundColor: '#fff', borderRadius: 16, padding: 24, width: '85%', maxWidth: 400, alignItems: 'center' }}>
            <Text style={{ fontSize: 18, fontWeight: '600', color: '#111827', marginBottom: 16 }}>Notification Schedule</Text>
            <Text style={{ color: '#6B7280', fontSize: 15, textAlign: 'center', marginBottom: 20 }}>
              This feature will allow you to set a custom schedule for when notifications are delivered. Coming soon!
            </Text>
            <TouchableOpacity style={{ backgroundColor: '#3B82F6', borderRadius: 8, paddingVertical: 12, paddingHorizontal: 32, alignItems: 'center' }} onPress={() => setScheduleModalVisible(false)}>
              <Text style={{ color: '#fff', fontSize: 16, fontWeight: '500' }}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  section: {
    marginHorizontal: 24,
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingContent: {
    marginLeft: 12,
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    color: '#111827',
    fontWeight: '500',
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 14,
    color: '#6B7280',
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  actionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  actionText: {
    fontSize: 16,
    color: '#111827',
    marginLeft: 12,
    fontWeight: '500',
  },
});
