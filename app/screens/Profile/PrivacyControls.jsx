import { useNavigation } from "@react-navigation/native";
import React, { useState } from "react";
import { Alert, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from "react-native";
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Header from '../../components/common/Header';

export default function PrivacyControls() {
  const navigation = useNavigation();
  
  const [privacySettings, setPrivacySettings] = useState({
    dataSharing: false,
    analyticsTracking: true,
  });

  const toggleSetting = (key) => {
    setPrivacySettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleExportData = () => {
    Alert.alert("Export Data", "Data export functionality would be implemented here");
  };

  const handleDeleteData = () => {
    Alert.alert(
      "Delete Data", 
      "Are you sure you want to delete all your data? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", style: "destructive", onPress: () => console.log("Data deleted") }
      ]
    );
  };

  const handlePrivacyPolicy = () => {
    Alert.alert("Privacy Policy", "Privacy policy would be displayed here");
  };

  const privacyOptions = [
    {
      key: 'dataSharing',
      title: 'Data Sharing',
      description: 'Share anonymized data for improvements',
      icon: 'share-variant-outline',
    },
    {
      key: 'analyticsTracking',
      title: 'Analytics Tracking',
      description: 'Help us improve the app with usage data',
      icon: 'chart-line',
    },
  ];

  const privacyActions = [
    {
      title: 'Export My Data',
      description: 'Download a copy of your data',
      icon: 'download-outline',
      onPress: handleExportData,
    },
    {
      title: 'Delete All Data',
      description: 'Permanently remove all your data',
      icon: 'delete-outline',
      onPress: handleDeleteData,
      isDanger: true,
    },
    {
      title: 'Privacy Policy',
      description: 'Read our privacy policy',
      icon: 'file-document-outline',
      onPress: handlePrivacyPolicy,
    },
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Header 
        title="Privacy Controls"
        showBackButton={true}
        onBackPress={() => navigation.goBack()}
        style={{ paddingHorizontal: 0 }}
      />

      {/* Privacy Settings */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Privacy Settings</Text>
        
        {privacyOptions.map((option) => (
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
              value={privacySettings[option.key]}
              onValueChange={() => toggleSetting(option.key)}
              trackColor={{ false: '#E5E7EB', true: '#374151' }}
              thumbColor={privacySettings[option.key] ? '#FFFFFF' : '#FFFFFF'}
            />
          </View>
        ))}
      </View>

      {/* Data Management */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Data Management</Text>
        
        {privacyActions.map((action, index) => (
          <TouchableOpacity 
            key={index}
            style={[
              styles.actionItem,
              action.isDanger && styles.dangerActionItem
            ]}
            onPress={action.onPress}
          >
            <View style={styles.actionLeft}>
              <MaterialCommunityIcons 
                name={action.icon} 
                size={20} 
                color={action.isDanger ? "#EF4444" : "#6B7280"} 
              />
              <View style={styles.actionContent}>
                <Text style={[
                  styles.actionTitle,
                  action.isDanger && styles.dangerActionTitle
                ]}>
                  {action.title}
                </Text>
                <Text style={[
                  styles.actionDescription,
                  action.isDanger && styles.dangerActionDescription
                ]}>
                  {action.description}
                </Text>
              </View>
            </View>
            <MaterialCommunityIcons 
              name="chevron-right" 
              size={20} 
              color={action.isDanger ? "#EF4444" : "#9CA3AF"} 
            />
          </TouchableOpacity>
        ))}
      </View>

      {/* Privacy Summary */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Privacy Summary</Text>
        
        <View style={styles.summaryCard}>
          <View style={styles.summaryHeader}>
            <MaterialCommunityIcons name="shield-account" size={24} color="#374151" />
            <Text style={styles.summaryTitle}>Your Privacy Matters</Text>
          </View>
          <Text style={styles.summaryDescription}>
            We respect your privacy and give you control over your data. Review and adjust your settings above to customize your privacy preferences.
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
  dangerActionItem: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
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
  dangerActionTitle: {
    color: '#EF4444',
  },
  actionDescription: {
    fontSize: 14,
    color: '#6B7280',
  },
  dangerActionDescription: {
    color: '#B91C1C',
  },
  summaryCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginLeft: 12,
  },
  summaryDescription: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 20,
  },
});
