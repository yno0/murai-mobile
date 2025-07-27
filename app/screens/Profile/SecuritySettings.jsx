import { Feather } from '@expo/vector-icons';
import { useNavigation } from "@react-navigation/native";
import { useState } from "react";
import { Alert, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from "react-native";

export default function SecuritySettings() {
  const navigation = useNavigation();

  const [securitySettings, setSecuritySettings] = useState({
    sessionTimeout: true,
    loginAlerts: true,
  });

  const toggleSetting = (key) => {
    setSecuritySettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleChangePassword = () => {
    Alert.alert("Change Password", "Password change functionality would be implemented here");
  };

  const handleViewSessions = () => {
    Alert.alert("Active Sessions", "View active sessions functionality would be implemented here");
  };

  const handleSecurityAudit = () => {
    Alert.alert("Security Audit", "Security audit functionality would be implemented here");
  };

  const securityOptions = [
    {
      key: 'sessionTimeout',
      title: 'Auto Session Timeout',
      description: 'Automatically log out after inactivity',
      icon: 'clock',
    },
    {
      key: 'loginAlerts',
      title: 'Login Alerts',
      description: 'Get notified of new login attempts',
      icon: 'bell',
    },
  ];

  const securityActions = [
    {
      title: 'Change Password',
      description: 'Update your account password',
      icon: 'key',
      onPress: handleChangePassword,
    },
    {
      title: 'Active Sessions',
      description: 'View and manage active sessions',
      icon: 'monitor',
      onPress: handleViewSessions,
    },
    {
      title: 'Security Audit',
      description: 'Review your security settings',
      icon: 'search',
      onPress: handleSecurityAudit,
    },
  ];

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
          <Text style={styles.headerTitle}>Security Settings</Text>
          <View style={styles.placeholderButton} />
        </View>

        {/* Security Options Card */}
        <View style={styles.settingsCard}>
          <View style={styles.cardHeader}>
            <Feather name="shield" size={20} color="#01B97F" />
            <Text style={styles.cardTitle}>Security Options</Text>
          </View>

          {securityOptions.map((option) => (
            <View key={option.key} style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <Feather
                  name={option.icon}
                  size={20}
                  color="#01B97F"
                />
                <View style={styles.settingContent}>
                  <Text style={styles.settingTitle}>{option.title}</Text>
                  <Text style={styles.settingDescription}>{option.description}</Text>
                </View>
              </View>
              <Switch
                value={securitySettings[option.key]}
                onValueChange={() => toggleSetting(option.key)}
                trackColor={{ false: '#E5E7EB', true: '#01B97F' }}
                thumbColor="#FFFFFF"
                ios_backgroundColor="#E5E7EB"
              />
            </View>
          ))}
        </View>

        {/* Security Actions Card */}
        <View style={styles.actionsCard}>
          <View style={styles.cardHeader}>
            <Feather name="settings" size={20} color="#01B97F" />
            <Text style={styles.cardTitle}>Security Actions</Text>
          </View>

          {securityActions.map((action, index) => (
            <TouchableOpacity
              key={index}
              style={styles.actionItem}
              onPress={action.onPress}
            >
              <View style={styles.actionLeft}>
                <Feather
                  name={action.icon}
                  size={20}
                  color="#01B97F"
                />
                <View style={styles.actionContent}>
                  <Text style={styles.actionTitle}>{action.title}</Text>
                  <Text style={styles.actionDescription}>{action.description}</Text>
                </View>
              </View>
              <Feather name="chevron-right" size={20} color="#A8AAB0" />
            </TouchableOpacity>
          ))}
        </View>

        {/* Security Status Card */}
        <View style={styles.statusCard}>
          <View style={styles.cardHeader}>
            <Feather name="check-circle" size={20} color="#01B97F" />
            <Text style={styles.cardTitle}>Security Status</Text>
          </View>

          <View style={styles.statusContent}>
            <View style={styles.statusIcon}>
              <Feather name="shield" size={32} color="#01B97F" />
            </View>
            <Text style={styles.statusTitle}>Account Secure</Text>
            <Text style={styles.statusDescription}>
              Your account security is up to date. Keep your settings current to maintain protection.
            </Text>
          </View>
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
  statusCard: {
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
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontFamily: 'Poppins-Medium',
    color: '#1D1D1F',
    marginBottom: 2,
  },
  actionDescription: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#A8AAB0',
  },
  statusContent: {
    alignItems: 'center',
    textAlign: 'center',
  },
  statusIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F0FDF4',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  statusTitle: {
    fontSize: 20,
    fontFamily: 'Poppins-Bold',
    color: '#1D1D1F',
    marginBottom: 12,
    textAlign: 'center',
  },
  statusDescription: {
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    color: '#A8AAB0',
    lineHeight: 24,
    textAlign: 'center',
  },
  bottomSpacing: {
    height: 40,
  },
});
