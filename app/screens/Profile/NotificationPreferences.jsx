import { Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from "@react-navigation/native";
import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from "react-native";

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
      icon: 'bell',
      category: 'general'
    },
    {
      key: 'emailAlerts',
      title: 'Email Alerts',
      description: 'Get important updates via email',
      icon: 'mail',
      category: 'general'
    },
    {
      key: 'detectionAlerts',
      title: 'Detection Alerts',
      description: 'Immediate alerts for content detection',
      icon: 'alert-circle',
      category: 'security'
    },
    {
      key: 'groupActivity',
      title: 'Group Activity',
      description: 'Updates about group member activity',
      icon: 'users',
      category: 'social'
    },
    {
      key: 'weeklyReports',
      title: 'Weekly Reports',
      description: 'Summary of weekly activity',
      icon: 'trending-up',
      category: 'reports'
    },
    {
      key: 'securityAlerts',
      title: 'Security Alerts',
      description: 'Important security notifications',
      icon: 'shield',
      category: 'security'
    },
  ];

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={styles.loadingText}>Loading preferences...</Text>
      </View>
    );
  }

  // Group settings by category
  const groupedSettings = notificationSettings.reduce((acc, setting) => {
    if (!acc[setting.category]) acc[setting.category] = [];
    acc[setting.category].push(setting);
    return acc;
  }, {});

  const categoryInfo = {
    general: { title: 'General Notifications', icon: 'bell' },
    security: { title: 'Security & Alerts', icon: 'shield' },
    social: { title: 'Social Activity', icon: 'users' },
    reports: { title: 'Reports & Analytics', icon: 'trending-up' }
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.headerContainer}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Feather name="arrow-left" size={24} color="#1D1D1F" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Notification Preferences</Text>
          <View style={styles.placeholderButton} />
        </View>

        {/* Notification Settings */}
        <View style={styles.settingsCard}>
          <View style={styles.cardHeader}>
            <Feather name="bell" size={20} color="#01B97F" />
            <Text style={styles.cardTitle}>Notification Settings</Text>
          </View>

          {notificationSettings.map((setting) => (
            <View key={setting.key} style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <Feather
                  name={setting.icon}
                  size={20}
                  color="#01B97F"
                />
                <View style={styles.settingContent}>
                  <Text style={styles.settingTitle}>{setting.title}</Text>
                  <Text style={styles.settingDescription}>{setting.description}</Text>
                </View>
              </View>
              <Switch
                value={notifications[setting.key]}
                onValueChange={() => toggleNotification(setting.key)}
                trackColor={{ false: '#E5E7EB', true: '#01B97F' }}
                thumbColor="#FFFFFF"
                ios_backgroundColor="#E5E7EB"
              />
            </View>
          ))}
        </View>

        {/* Quick Actions Card */}
        <View style={styles.actionsCard}>
          <View style={styles.cardHeader}>
            <Feather name="settings" size={20} color="#01B97F" />
            <Text style={styles.cardTitle}>Quick Actions</Text>
          </View>

          <TouchableOpacity style={styles.actionItem} onPress={handleDisableAll}>
            <View style={styles.actionLeft}>
              <Feather name="bell-off" size={20} color="#01B97F" />
              <Text style={styles.actionText}>Disable All Notifications</Text>
            </View>
            <Feather name="chevron-right" size={20} color="#A8AAB0" />
          </TouchableOpacity>
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>


    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F7F7',
  },
  scrollContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 60,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  headerTitle: {
    fontSize: 24,
    fontFamily: 'Poppins-Bold',
    color: '#1D1D1F',
    flex: 1,
    textAlign: 'center',
  },
  placeholderButton: {
    width: 40,
    height: 40,
  },
  loadingText: {
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    color: '#A8AAB0',
    textAlign: 'center',
  },

  settingsCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  actionsCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontFamily: 'Poppins-SemiBold',
    color: '#1D1D1F',
  },

  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 0,
    marginBottom: 16,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 16,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontFamily: 'Poppins-Medium',
    color: '#1D1D1F',
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#A8AAB0',
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 0,
    marginBottom: 16,
  },
  actionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 16,
  },
  actionText: {
    fontSize: 16,
    fontFamily: 'Poppins-Medium',
    color: '#1D1D1F',
  },
  bottomSpacing: {
    height: 40,
  },
});
