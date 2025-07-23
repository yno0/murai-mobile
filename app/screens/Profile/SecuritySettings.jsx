import { useNavigation } from "@react-navigation/native";
import React, { useState } from "react";
import { Alert, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from "react-native";
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

export default function SecuritySettings() {
  const navigation = useNavigation();
  
  const [securitySettings, setSecuritySettings] = useState({
    twoFactorAuth: false,
    biometricAuth: true,
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
      key: 'twoFactorAuth',
      title: 'Two-Factor Authentication',
      description: 'Add an extra layer of security',
      icon: 'shield-check-outline',
    },
    {
      key: 'biometricAuth',
      title: 'Biometric Authentication',
      description: 'Use fingerprint or face recognition',
      icon: 'fingerprint',
    },
    {
      key: 'sessionTimeout',
      title: 'Auto Session Timeout',
      description: 'Automatically log out after inactivity',
      icon: 'clock-outline',
    },
    {
      key: 'loginAlerts',
      title: 'Login Alerts',
      description: 'Get notified of new login attempts',
      icon: 'bell-outline',
    },
  ];

  const securityActions = [
    {
      title: 'Change Password',
      description: 'Update your account password',
      icon: 'key-outline',
      onPress: handleChangePassword,
    },
    {
      title: 'Active Sessions',
      description: 'View and manage active sessions',
      icon: 'monitor-multiple',
      onPress: handleViewSessions,
    },
    {
      title: 'Security Audit',
      description: 'Review your security settings',
      icon: 'security',
      onPress: handleSecurityAudit,
    },
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <MaterialCommunityIcons name="arrow-left" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.title}>Security Settings</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Security Options */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Security Options</Text>
        
        {securityOptions.map((option) => (
          <View key={option.key} style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <MaterialCommunityIcons 
                name={option.icon} 
                size={20} 
                color="#6B7280" 
              />
              <View style={styles.settingContent}>
                <Text style={styles.settingTitle}>{option.title}</Text>
                <Text style={styles.settingDescription}>{option.description}</Text>
              </View>
            </View>
            <Switch
              value={securitySettings[option.key]}
              onValueChange={() => toggleSetting(option.key)}
              trackColor={{ false: '#E5E7EB', true: '#374151' }}
              thumbColor={securitySettings[option.key] ? '#FFFFFF' : '#FFFFFF'}
            />
          </View>
        ))}
      </View>

      {/* Security Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Security Actions</Text>
        
        {securityActions.map((action, index) => (
          <TouchableOpacity 
            key={index}
            style={styles.actionItem}
            onPress={action.onPress}
          >
            <View style={styles.actionLeft}>
              <MaterialCommunityIcons 
                name={action.icon} 
                size={20} 
                color="#6B7280" 
              />
              <View style={styles.actionContent}>
                <Text style={styles.actionTitle}>{action.title}</Text>
                <Text style={styles.actionDescription}>{action.description}</Text>
              </View>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={20} color="#9CA3AF" />
          </TouchableOpacity>
        ))}
      </View>

      {/* Security Status */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Security Status</Text>
        
        <View style={styles.statusCard}>
          <View style={styles.statusHeader}>
            <MaterialCommunityIcons name="shield-check" size={24} color="#10B981" />
            <Text style={styles.statusTitle}>Account Secure</Text>
          </View>
          <Text style={styles.statusDescription}>
            Your account security is up to date. Keep your settings current to maintain protection.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingTop: 60,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 16,
  },
  placeholder: {
    width: 40,
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
  actionContent: {
    marginLeft: 12,
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    color: '#111827',
    fontWeight: '500',
    marginBottom: 2,
  },
  actionDescription: {
    fontSize: 14,
    color: '#6B7280',
  },
  statusCard: {
    backgroundColor: '#F0FDF4',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#065F46',
    marginLeft: 12,
  },
  statusDescription: {
    fontSize: 14,
    color: '#047857',
    lineHeight: 20,
  },
});
