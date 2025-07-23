import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useState } from 'react';
import {
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

const MainHeader = require('../../../components/common/MainHeader').default;

export default function AccountSettingsScreen() {
  const navigation = useNavigation();
  const [settings, setSettings] = useState({
    emailNotifications: true,
    pushNotifications: false,
    twoFactorAuth: false,
    sessionTimeout: true,
    darkMode: false,
    autoLogout: true,
    dataExportAlerts: true,
    systemMaintenanceAlerts: true,
  });

  const toggleSetting = (key) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleChangePassword = () => {
    navigation.navigate('ChangePassword');
  };



  const renderSettingItem = (title, description, key, icon) => (
    <View style={styles.settingItem}>
      <View style={styles.settingLeft}>
        <Feather name={icon} size={20} color="#6B7280" />
        <View style={styles.settingContent}>
          <Text style={styles.settingTitle}>{title}</Text>
          <Text style={styles.settingDescription}>{description}</Text>
        </View>
      </View>
      <Switch
        value={settings[key]}
        onValueChange={() => toggleSetting(key)}
        trackColor={{ false: '#E5E7EB', true: '#01B97F' }}
        thumbColor={settings[key] ? '#FFFFFF' : '#FFFFFF'}
      />
    </View>
  );

  const renderActionItem = (title, description, icon, onPress, danger = false) => (
    <TouchableOpacity style={styles.actionItem} onPress={onPress}>
      <View style={styles.actionLeft}>
        <Feather name={icon} size={20} color={danger ? '#EF4444' : '#6B7280'} />
        <View style={styles.actionContent}>
          <Text style={[styles.actionTitle, danger && styles.actionTitleDanger]}>
            {title}
          </Text>
          <Text style={styles.actionDescription}>{description}</Text>
        </View>
      </View>
      <Feather name="chevron-right" size={20} color="#9CA3AF" />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <MainHeader
        title="Account Settings"
        subtitle="Manage your account preferences and security"
        leftActions={[
          {
            icon: 'arrow-left',
            iconType: 'feather',
            onPress: () => navigation.goBack()
          }
        ]}
        style={{ paddingHorizontal: 0 }}
      />

      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Notification Settings */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Feather name="bell" size={20} color="#01B97F" />
            <Text style={styles.sectionTitle}>Notifications</Text>
          </View>
          <View style={styles.sectionContent}>
            {renderSettingItem(
              'Email Notifications',
              'Receive important updates via email',
              'emailNotifications',
              'mail'
            )}
            {renderSettingItem(
              'Push Notifications',
              'Get real-time alerts on your device',
              'pushNotifications',
              'smartphone'
            )}
            {renderSettingItem(
              'Data Export Alerts',
              'Notify when data exports are ready',
              'dataExportAlerts',
              'download'
            )}
            {renderSettingItem(
              'System Maintenance',
              'Alerts about system maintenance',
              'systemMaintenanceAlerts',
              'tool'
            )}
          </View>
        </View>

        {/* Security Settings */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Feather name="shield" size={20} color="#01B97F" />
            <Text style={styles.sectionTitle}>Security</Text>
          </View>
          <View style={styles.sectionContent}>
            {renderSettingItem(
              'Two-Factor Authentication',
              'Add an extra layer of security',
              'twoFactorAuth',
              'lock'
            )}
            {renderSettingItem(
              'Session Timeout',
              'Auto-logout after inactivity',
              'sessionTimeout',
              'clock'
            )}
            {renderSettingItem(
              'Auto Logout',
              'Logout when app is backgrounded',
              'autoLogout',
              'log-out'
            )}
          </View>
        </View>

        {/* Appearance Settings */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Feather name="eye" size={20} color="#01B97F" />
            <Text style={styles.sectionTitle}>Appearance</Text>
          </View>
          <View style={styles.sectionContent}>
            {renderSettingItem(
              'Dark Mode',
              'Use dark theme for the interface',
              'darkMode',
              'moon'
            )}
          </View>
        </View>

        {/* Account Actions */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Feather name="settings" size={20} color="#01B97F" />
            <Text style={styles.sectionTitle}>Account Actions</Text>
          </View>
          <View style={styles.sectionContent}>
            {renderActionItem(
              'Change Password',
              'Update your account password',
              'key',
              handleChangePassword
            )}
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
    backgroundColor: '#ffffff',
    paddingHorizontal: 10,
  },
  scrollContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Poppins-SemiBold',
    color: '#111827',
  },
  sectionContent: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontFamily: 'Poppins-Medium',
    color: '#111827',
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#6B7280',
  },
  actionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  actionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontFamily: 'Poppins-Medium',
    color: '#111827',
    marginBottom: 2,
  },
  actionTitleDanger: {
    color: '#EF4444',
  },
  actionDescription: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#6B7280',
  },
  bottomSpacing: {
    height: 40,
  },
});
