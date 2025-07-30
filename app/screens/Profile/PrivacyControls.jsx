import { Feather } from '@expo/vector-icons';
import { useNavigation } from "@react-navigation/native";
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { useEffect, useState } from "react";
import { Alert, Modal, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from "react-native";
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

export default function PrivacyControls() {
  const navigation = useNavigation();
  const { user, logout } = useAuth();

  const [privacySettings, setPrivacySettings] = useState({
    dataSharing: false,
    analyticsTracking: true,
  });
  const [loading, setLoading] = useState(false);
  const [privacyPolicyVisible, setPrivacyPolicyVisible] = useState(false);

  // Load privacy settings from backend
  useEffect(() => {
    loadPrivacySettings();
  }, []);

  const loadPrivacySettings = async () => {
    try {
      const response = await api.get('/users/preferences');
      const prefs = response.data;

      setPrivacySettings({
        dataSharing: prefs.privacy?.shareData || false,
        analyticsTracking: prefs.privacy?.allowAnalytics || true,
      });
    } catch (error) {
      console.error('Error loading privacy settings:', error);
      // Keep default values if loading fails
    }
  };

  const toggleSetting = async (key) => {
    const newValue = !privacySettings[key];

    setPrivacySettings(prev => ({
      ...prev,
      [key]: newValue
    }));

    // Save to backend
    try {
      const updateData = {
        privacy: {
          shareData: key === 'dataSharing' ? newValue : privacySettings.dataSharing,
          allowAnalytics: key === 'analyticsTracking' ? newValue : privacySettings.analyticsTracking,
        }
      };

      await api.put('/users/preferences', updateData);
    } catch (error) {
      console.error('Error saving privacy setting:', error);
      // Revert the change if save fails
      setPrivacySettings(prev => ({
        ...prev,
        [key]: !newValue
      }));
      Alert.alert('Error', 'Failed to save privacy setting. Please try again.');
    }
  };

  const handleExportData = async () => {
    try {
      setLoading(true);

      // Fetch user data from API
      const response = await api.get('/users/export-data');
      const userData = response.data;

      // Create JSON file content
      const jsonContent = JSON.stringify(userData, null, 2);
      const fileName = `murai_data_export_${user?.name?.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.json`;

      // For React Native, we'll use a different approach
      Alert.alert(
        "Data Export",
        `Your data has been prepared for export. This includes:\n\n• Profile information\n• Privacy settings\n• Activity logs\n• Detected content history\n\nWould you like to share this data?`,
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Share",
            onPress: async () => {
              try {
                // Create temporary file
                const fileUri = FileSystem.documentDirectory + fileName;
                await FileSystem.writeAsStringAsync(fileUri, jsonContent);

                // Share the file
                if (await Sharing.isAvailableAsync()) {
                  await Sharing.shareAsync(fileUri);
                } else {
                  Alert.alert("Export Complete", "Data exported successfully to device storage.");
                }
              } catch (error) {
                console.error('Export error:', error);
                Alert.alert("Error", "Failed to export data. Please try again.");
              }
            }
          }
        ]
      );
    } catch (error) {
      console.error('Export data error:', error);
      Alert.alert("Error", "Failed to prepare data for export. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteData = () => {
    Alert.alert(
      "Delete All Data",
      "⚠️ This will permanently delete:\n\n• Your profile information\n• All activity logs\n• Detected content history\n• Privacy settings\n• Extension preferences\n\nThis action cannot be undone. Are you absolutely sure?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete Forever",
          style: "destructive",
          onPress: () => confirmDeleteData()
        }
      ]
    );
  };

  const confirmDeleteData = async () => {
    try {
      setLoading(true);

      // Call API to delete user data
      await api.delete('/users/delete-all-data');

      Alert.alert(
        "Data Deleted",
        "All your data has been permanently deleted. You will be logged out.",
        [
          {
            text: "OK",
            onPress: async () => {
              // Properly logout user using AuthContext
              if (logout) {
                await logout();
              } else {
                navigation.navigate('Login');
              }
            }
          }
        ]
      );
    } catch (error) {
      console.error('Delete data error:', error);
      Alert.alert("Error", "Failed to delete data. Please try again or contact support.");
    } finally {
      setLoading(false);
    }
  };

  const handlePrivacyPolicy = () => {
    setPrivacyPolicyVisible(true);
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

      {/* Privacy Policy Modal */}
      <Modal
        visible={privacyPolicyVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setPrivacyPolicyVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setPrivacyPolicyVisible(false)}
            >
              <Feather name="x" size={24} color="#1D1D1F" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Privacy Policy</Text>
            <View style={styles.modalPlaceholder} />
          </View>

          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            <Text style={styles.privacyPolicyText}>
              <Text style={styles.privacyPolicyHeader}>MURAi Privacy Policy{'\n\n'}</Text>

              <Text style={styles.privacyPolicySubheader}>Last Updated: {new Date().toLocaleDateString()}{'\n\n'}</Text>

              <Text style={styles.privacyPolicySubheader}>1. Information We Collect{'\n'}</Text>
              We collect information you provide directly to us, such as when you create an account, use our services, or contact us for support. This includes:{'\n\n'}
              • Personal information (name, email address){'\n'}
              • Usage data and activity logs{'\n'}
              • Content detection and filtering preferences{'\n'}
              • Device and browser information{'\n\n'}

              <Text style={styles.privacyPolicySubheader}>2. How We Use Your Information{'\n'}</Text>
              We use the information we collect to:{'\n\n'}
              • Provide and improve our content filtering services{'\n'}
              • Personalize your experience{'\n'}
              • Communicate with you about our services{'\n'}
              • Ensure the security of our platform{'\n\n'}

              <Text style={styles.privacyPolicySubheader}>3. Information Sharing{'\n'}</Text>
              We do not sell, trade, or otherwise transfer your personal information to third parties without your consent, except as described in this policy. We may share information:{'\n\n'}
              • With your explicit consent{'\n'}
              • To comply with legal obligations{'\n'}
              • To protect our rights and safety{'\n\n'}

              <Text style={styles.privacyPolicySubheader}>4. Data Security{'\n'}</Text>
              We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.{'\n\n'}

              <Text style={styles.privacyPolicySubheader}>5. Your Rights{'\n'}</Text>
              You have the right to:{'\n\n'}
              • Access your personal data{'\n'}
              • Correct inaccurate data{'\n'}
              • Delete your data{'\n'}
              • Export your data{'\n'}
              • Opt-out of certain data processing{'\n\n'}

              <Text style={styles.privacyPolicySubheader}>6. Contact Us{'\n'}</Text>
              If you have any questions about this Privacy Policy, please contact us at privacy@murai.app{'\n\n'}

              <Text style={styles.privacyPolicySubheader}>7. Changes to This Policy{'\n'}</Text>
              We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page.
            </Text>
          </ScrollView>
        </View>
      </Modal>
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
  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: '#F7F7F7',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalCloseButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: 'Poppins-SemiBold',
    color: '#1D1D1F',
    flex: 1,
    textAlign: 'center',
  },
  modalPlaceholder: {
    width: 40,
    height: 40,
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  privacyPolicyText: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#374151',
    lineHeight: 22,
    marginBottom: 40,
  },
  privacyPolicyHeader: {
    fontSize: 24,
    fontFamily: 'Poppins-Bold',
    color: '#1D1D1F',
  },
  privacyPolicySubheader: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    color: '#1D1D1F',
  },
});
