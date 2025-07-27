import { Feather } from '@expo/vector-icons';
import { useNavigation } from "@react-navigation/native";
import { useState } from "react";
import { Alert, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from "react-native";

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
      icon: 'share-2',
    },
    {
      key: 'analyticsTracking',
      title: 'Analytics Tracking',
      description: 'Help us improve the app with usage data',
      icon: 'trending-up',
    },
  ];

  const privacyActions = [
    {
      title: 'Export My Data',
      description: 'Download a copy of your data',
      icon: 'download',
      onPress: handleExportData,
    },
    {
      title: 'Delete All Data',
      description: 'Permanently remove all your data',
      icon: 'trash-2',
      onPress: handleDeleteData,
      isDanger: true,
    },
    {
      title: 'Privacy Policy',
      description: 'Read our privacy policy',
      icon: 'file-text',
      onPress: handlePrivacyPolicy,
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
          <Text style={styles.headerTitle}>Privacy Controls</Text>
          <View style={styles.placeholderButton} />
        </View>

        {/* Privacy Settings Card */}
        <View style={styles.settingsCard}>
          <View style={styles.cardHeader}>
            <Feather name="shield" size={20} color="#01B97F" />
            <Text style={styles.cardTitle}>Privacy Settings</Text>
          </View>

          {privacyOptions.map((option) => (
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
                value={privacySettings[option.key]}
                onValueChange={() => toggleSetting(option.key)}
                trackColor={{ false: '#E5E7EB', true: '#01B97F' }}
                thumbColor="#FFFFFF"
                ios_backgroundColor="#E5E7EB"
              />
            </View>
          ))}
        </View>

        {/* Data Management Card */}
        <View style={styles.actionsCard}>
          <View style={styles.cardHeader}>
            <Feather name="database" size={20} color="#01B97F" />
            <Text style={styles.cardTitle}>Data Management</Text>
          </View>

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
                <Feather
                  name={action.icon}
                  size={20}
                  color={action.isDanger ? "#EF4444" : "#01B97F"}
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
              <Feather
                name="chevron-right"
                size={20}
                color={action.isDanger ? "#EF4444" : "#A8AAB0"}
              />
            </TouchableOpacity>
          ))}
        </View>

        {/* Privacy Summary Card */}
        <View style={styles.summaryCard}>
          <View style={styles.cardHeader}>
            <Feather name="info" size={20} color="#01B97F" />
            <Text style={styles.cardTitle}>Privacy Summary</Text>
          </View>

          <View style={styles.summaryContent}>
            <View style={styles.summaryIcon}>
              <Feather name="shield" size={32} color="#01B97F" />
            </View>
            <Text style={styles.summaryTitle}>Your Privacy Matters</Text>
            <Text style={styles.summaryDescription}>
              We respect your privacy and give you control over your data. Review and adjust your settings above to customize your privacy preferences.
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
  summaryCard: {
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
  dangerActionItem: {
    backgroundColor: 'transparent',
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
  dangerActionTitle: {
    color: '#EF4444',
  },
  actionDescription: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#A8AAB0',
  },
  dangerActionDescription: {
    color: '#EF4444',
  },
  summaryContent: {
    alignItems: 'center',
    textAlign: 'center',
  },
  summaryIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F0FDF4',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  summaryTitle: {
    fontSize: 20,
    fontFamily: 'Poppins-Bold',
    color: '#1D1D1F',
    marginBottom: 12,
    textAlign: 'center',
  },
  summaryDescription: {
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
