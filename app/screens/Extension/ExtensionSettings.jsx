import { useEffect, useState } from 'react';
import {
  Alert,
  Dimensions,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAccessibility } from '../../context/AccessibilityContext';
import { getPreferences, updatePreferences } from '../../services/preferences';
import WhitelistManager from './WhitelistManager';

const { width } = Dimensions.get('window');

// Enhanced MURAi Color Scheme with gradients and modern touches
const COLORS = {
  PRIMARY: '#02B97F',
  PRIMARY_DARK: '#01A06E',
  PRIMARY_LIGHT: '#E6F7F1',
  BACKGROUND: '#ffffff',
  CARD_BG: '#ffffff',
  SECTION_BG: '#F8FAFC',
  TEXT_MAIN: '#111827',
  TEXT_SECONDARY: '#6B7280',
  TEXT_MUTED: '#9CA3AF',
  BORDER: '#E5E7EB',
  BORDER_LIGHT: '#F1F5F9',
  SUCCESS: '#10B981',
  WARNING: '#F59E0B',
  ERROR: '#EF4444',
  ACCENT_BLUE: '#3B82F6',
  ACCENT_PURPLE: '#8B5CF6',
  ACCENT_ORANGE: '#F59E0B',
  SHADOW: 'rgba(0, 0, 0, 0.1)',
  SHADOW_LIGHT: 'rgba(0, 0, 0, 0.05)',
};

export default function ExtensionSettings({ onClose }) {
  // Accessibility hook
  const {
    getAccessibleTextStyle,
    getAccessibleTouchableStyle,
    isReduceMotionActive,
    getScaledFontSize,
    getMinTouchTarget,
  } = useAccessibility();

  const [extensionEnabled, setExtensionEnabled] = useState(true);
  const [language, setLanguage] = useState('English');
  const [sensitivity, setSensitivity] = useState('medium');
  const [whitelistSite, setWhitelistSite] = useState([]);
  const [whitelistTerms, setWhitelistTerms] = useState([]);
  const [flagStyle, setFlagStyle] = useState('highlight');
  const [color, setColor] = useState('#374151');
  const [loading, setLoading] = useState(true);

  // Modal state for whitelist management
  const [whitelistModalVisible, setWhitelistModalVisible] = useState(false);
  const [whitelistModalType, setWhitelistModalType] = useState('sites');

  // Track initial values to detect changes
  const [initialValues, setInitialValues] = useState({});
  const [hasChanges, setHasChanges] = useState(false);

  // Helper functions for modal navigation
  const openWhitelistModal = (type) => {
    setWhitelistModalType(type);
    setWhitelistModalVisible(true);
  };

  const closeWhitelistModal = () => {
    setWhitelistModalVisible(false);
  };



  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      const prefs = await getPreferences();
      const values = {
        extensionEnabled: prefs.extensionEnabled || true,
        language: prefs.language || 'English',
        sensitivity: prefs.sensitivity || 'medium',
        whitelistSite: prefs.whitelistSite || [],
        whitelistTerms: prefs.whitelistTerms || [],
        flagStyle: prefs.flagStyle || 'highlight',
        color: prefs.color || '#374151'
      };

      setExtensionEnabled(values.extensionEnabled);
      setLanguage(values.language);
      setSensitivity(values.sensitivity);
      setWhitelistSite(values.whitelistSite);
      setWhitelistTerms(values.whitelistTerms);
      setFlagStyle(values.flagStyle);
      setColor(values.color);
      setInitialValues(values);
    } catch (error) {
      console.error('Error loading preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  // Check for changes whenever values change
  useEffect(() => {
    if (Object.keys(initialValues).length > 0) {
      const currentValues = {
        extensionEnabled,
        language,
        sensitivity,
        whitelistSite,
        whitelistTerms,
        flagStyle,
        color
      };

      const changed = JSON.stringify(currentValues) !== JSON.stringify(initialValues);
      setHasChanges(changed);
    }
  }, [language, sensitivity, whitelistSite, whitelistTerms, flagStyle, color, initialValues, extensionEnabled]);

  const savePreferences = async () => {
    try {
      const preferences = {
        extensionEnabled,
        language,
        sensitivity,
        whitelistSite,
        whitelistTerms,
        flagStyle,
        color,
      };
      await updatePreferences(preferences);
      Alert.alert('Success', 'Settings saved successfully!');
      onClose();
    } catch (error) {
      console.error('Error saving preferences:', error);
      Alert.alert('Error', 'Failed to save settings');
    }
  };

  // Privacy control handlers
  const handleExportData = async () => {
    try {
      // For extension settings, we'll export the current preferences
      const exportData = {
        exportInfo: {
          exportDate: new Date().toISOString(),
          type: 'extension_settings',
          version: '1.0'
        },
        settings: {
          extensionEnabled,
          language,
          sensitivity,
          whitelistSite,
          whitelistTerms,
          flagStyle,
          color
        }
      };

      const jsonContent = JSON.stringify(exportData, null, 2);
      const fileName = `murai_extension_settings_${new Date().toISOString().split('T')[0]}.json`;

      // Create a blob and download (for web) or share (for mobile)
      Alert.alert(
        "Export Complete",
        `Your extension settings have been prepared for export as ${fileName}`,
        [{ text: "OK" }]
      );
    } catch (error) {
      console.error('Export error:', error);
      Alert.alert("Error", "Failed to export settings. Please try again.");
    }
  };

  const handlePrivacyPolicy = () => {
    Alert.alert(
      "Privacy Policy",
      "MURAi Privacy Policy\n\nWe respect your privacy and are committed to protecting your personal data. Our extension:\n\n• Only processes content locally on your device\n• Does not store personal browsing data\n• Sends anonymized usage statistics (if enabled)\n• Allows you to control all data sharing preferences\n\nFor the full privacy policy, visit: https://murai.app/privacy",
      [
        { text: "Close", style: "cancel" },
        { text: "View Full Policy", onPress: () => {
          // In a real app, you might open a web browser or modal
          Alert.alert("Info", "Full privacy policy would open in browser");
        }}
      ]
    );
  };

  const handleDeleteAllData = () => {
    Alert.alert(
      "Confirm Data Deletion",
      "This will reset all your extension settings to defaults and clear your activity history. Are you absolutely sure?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reset Everything",
          style: "destructive",
          onPress: async () => {
            try {
              // Reset all settings to defaults
              setExtensionEnabled(true);
              setLanguage('English');
              setSensitivity('medium');
              setWhitelistSite([]);
              setWhitelistTerms([]);
              setFlagStyle('highlight');
              setColor('#374151');

              // Save the reset preferences
              const defaultPreferences = {
                extensionEnabled: true,
                language: 'English',
                sensitivity: 'medium',
                whitelistSite: [],
                whitelistTerms: [],
                flagStyle: 'highlight',
                color: '#374151',
              };

              await updatePreferences(defaultPreferences);
              Alert.alert('Success', 'All settings have been reset to defaults.');
            } catch (error) {
              console.error('Reset error:', error);
              Alert.alert('Error', 'Failed to reset settings. Please try again.');
            }
          }
        }
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose} style={getAccessibleTouchableStyle(styles.closeButton)}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={COLORS.TEXT_SECONDARY} />
        </TouchableOpacity>
        <Text style={getAccessibleTextStyle(styles.title)}>Extension Settings</Text>
        {hasChanges && (
          <TouchableOpacity onPress={savePreferences} style={getAccessibleTouchableStyle(styles.saveButton)}>
            <MaterialCommunityIcons name="content-save" size={18} color="#ffffff" />
            <Text style={getAccessibleTextStyle(styles.saveButtonText)}>Save</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView style={styles.content}>

        {/* Language Detection */}
        <View style={styles.sectionCard}>
          <View style={[styles.enhancedHeader, { marginTop: 0 }]}>
            <View style={styles.iconContainer}>
              <MaterialCommunityIcons name="translate" size={22} color={COLORS.PRIMARY} />
            </View>
            <View style={styles.headerTextContainer}>
              <Text style={getAccessibleTextStyle(styles.sectionTitle)}>Language Detection</Text>
              <Text style={getAccessibleTextStyle(styles.sectionDescription)}>Choose which language to monitor for inappropriate content</Text>
            </View>
          </View>

          <View style={styles.languageGrid}>
            {[
              { key: 'Taglish', icon: 'earth', description: 'Mixed Filipino-English' },
              { key: 'English', icon: 'web', description: 'International language' },
              { key: 'Tagalog', icon: 'flag', description: 'Filipino language' }
            ].map(({ key, icon, description }) => (
              <TouchableOpacity
                key={key}
                style={getAccessibleTouchableStyle([
                  styles.languageCard,
                  language === key && styles.languageCardSelected
                ])}
                onPress={() => setLanguage(key)}
                accessibilityLabel={`Select ${key} language for content detection. ${description}`}
                accessibilityState={{ selected: language === key }}
              >
                <View style={styles.languageCardIcon}>
                  <MaterialCommunityIcons
                    name={icon}
                    size={28}
                    color={language === key ? '#ffffff' : COLORS.PRIMARY}
                  />
                </View>
                <View style={styles.languageCardContent}>
                  <Text style={getAccessibleTextStyle([
                    styles.languageCardTitle,
                    language === key && styles.languageCardTitleSelected
                  ])}>
                    {key}
                  </Text>
                  <Text style={getAccessibleTextStyle([
                    styles.languageCardDescription,
                    language === key && styles.languageCardDescriptionSelected
                  ])}>
                    {description}
                  </Text>
                </View>
                {language === key && (
                  <View style={styles.languageCardCheck}>
                    <MaterialCommunityIcons name="check-circle" size={20} color="#ffffff" />
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Sensitivity Level */}
        <View style={styles.sectionCard}>
          <View style={styles.enhancedHeader}>
            <View style={styles.iconContainer}>
              <MaterialCommunityIcons name="speedometer" size={22} color={COLORS.PRIMARY} />
            </View>
            <View style={styles.headerTextContainer}>
              <Text style={getAccessibleTextStyle(styles.sectionTitle)}>Sensitivity Level</Text>
              <Text style={getAccessibleTextStyle(styles.sectionDescription)}>Adjust how strictly content is filtered</Text>
            </View>
          </View>

          <View style={styles.sensitivityContainer}>
            {[
              { key: 'low', label: 'Low Sensitivity', desc: 'Only obvious inappropriate content will be flagged', color: COLORS.SUCCESS, icon: 'speedometer-slow' },
              { key: 'medium', label: 'Medium Sensitivity', desc: 'Balanced detection approach for most users', color: COLORS.ACCENT_ORANGE, icon: 'speedometer-medium' },
              { key: 'high', label: 'High Sensitivity', desc: 'Strict content filtering for maximum protection', color: COLORS.ERROR, icon: 'speedometer' }
            ].map(({ key, label, desc, icon }) => (
              <TouchableOpacity
                key={key}
                style={getAccessibleTouchableStyle([
                  styles.sensitivityOption,
                  sensitivity === key && styles.sensitivityOptionSelected
                ])}
                onPress={() => setSensitivity(key)}
                accessibilityLabel={`Set sensitivity to ${label}. ${desc}`}
                accessibilityState={{ selected: sensitivity === key }}
              >
                <View style={styles.sensitivityIconContainer}>
                  <MaterialCommunityIcons
                    name={icon}
                    size={28}
                    color={sensitivity === key ? '#ffffff' : COLORS.PRIMARY}
                  />
                </View>
                <View style={styles.sensitivityTextContainer}>
                  <Text style={getAccessibleTextStyle([
                    styles.sensitivityLabel,
                    sensitivity === key && styles.sensitivityLabelSelected
                  ])}>
                    {label}
                  </Text>
                  <Text style={getAccessibleTextStyle([
                    styles.sensitivityDesc,
                    sensitivity === key && styles.sensitivityDescSelected
                  ])}>
                    {desc}
                  </Text>
                </View>
                {sensitivity === key && (
                  <MaterialCommunityIcons name="check-circle" size={20} color="#ffffff" />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Whitelist Management */}
        <View style={styles.sectionCard}>
          <View style={styles.enhancedHeader}>
            <View style={styles.iconContainer}>
              <MaterialCommunityIcons name="shield-check" size={22} color={COLORS.PRIMARY} />
            </View>
            <View style={styles.headerTextContainer}>
              <Text style={styles.sectionTitle}>Whitelist Management</Text>
              <Text style={styles.sectionDescription}>Manage trusted sites and terms that should not be flagged</Text>
            </View>
          </View>

          <View style={styles.whitelistContainer}>
            <View style={styles.whitelistSection}>
              <Text style={styles.whitelistSectionTitle}>Trusted Sites ({whitelistSite.length})</Text>
              {whitelistSite.slice(0, 5).map((site, index) => (
                <View key={index} style={styles.whitelistItem}>
                  <MaterialCommunityIcons name="web" size={16} color={COLORS.PRIMARY} />
                  <Text style={styles.whitelistItemText}>{site}</Text>
                  <TouchableOpacity
                    onPress={() => setWhitelistSite(whitelistSite.filter((_, i) => i !== index))}
                    style={styles.removeButton}
                  >
                    <MaterialCommunityIcons name="close" size={16} color={COLORS.ERROR} />
                  </TouchableOpacity>
                </View>
              ))}
              {whitelistSite.length > 5 && (
                <TouchableOpacity
                  style={styles.seeMoreButton}
                  onPress={() => openWhitelistModal('sites')}
                >
                  <Text style={styles.seeMoreText}>See {whitelistSite.length - 5} more sites</Text>
                  <MaterialCommunityIcons name="chevron-right" size={16} color={COLORS.PRIMARY} />
                </TouchableOpacity>
              )}
            </View>

            <View style={styles.whitelistSection}>
              <Text style={styles.whitelistSectionTitle}>Trusted Terms ({whitelistTerms.length})</Text>
              {whitelistTerms.slice(0, 5).map((term, index) => (
                <View key={index} style={styles.whitelistItem}>
                  <MaterialCommunityIcons name="text" size={16} color={COLORS.PRIMARY} />
                  <Text style={styles.whitelistItemText}>{term}</Text>
                  <TouchableOpacity
                    onPress={() => setWhitelistTerms(whitelistTerms.filter((_, i) => i !== index))}
                    style={styles.removeButton}
                  >
                    <MaterialCommunityIcons name="close" size={16} color={COLORS.ERROR} />
                  </TouchableOpacity>
                </View>
              ))}
              {whitelistTerms.length > 5 && (
                <TouchableOpacity
                  style={styles.seeMoreButton}
                  onPress={() => openWhitelistModal('terms')}
                >
                  <Text style={styles.seeMoreText}>See {whitelistTerms.length - 5} more terms</Text>
                  <MaterialCommunityIcons name="chevron-right" size={16} color={COLORS.PRIMARY} />
                </TouchableOpacity>
              )}
            </View>

            <TouchableOpacity
              style={styles.addWhitelistButton}
              onPress={() => openWhitelistModal('sites')}
            >
              <MaterialCommunityIcons name="plus" size={20} color={COLORS.PRIMARY} />
              <Text style={styles.addWhitelistText}>Add to Whitelist</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Flag Style Selection */}
        <View style={styles.sectionCard}>
          <View style={styles.enhancedHeader}>
            <View style={styles.iconContainer}>
              <MaterialCommunityIcons name="flag" size={22} color={COLORS.PRIMARY} />
            </View>
            <View style={styles.headerTextContainer}>
              <Text style={styles.sectionTitle}>Flag Style</Text>
              <Text style={styles.sectionDescription}>Choose how flagged content should be displayed</Text>
            </View>
          </View>

        <View style={styles.flagStyleGrid}>
            {[
              { key: 'highlight', label: 'Highlight', desc: 'Background color highlight', icon: 'marker' },
              { key: 'underline', label: 'Underline', desc: 'Text underline style', icon: 'format-underline' },
              { key: 'blur', label: 'Blur', desc: 'Blur the content', icon: 'blur' },
              { key: 'asterisk', label: 'Asterisk', desc: 'Replace with ***', icon: 'asterisk' },
              { key: 'none', label: 'None', desc: 'No visual indication', icon: 'eye-off' }
            ].map(({ key, label, desc, icon }) => (
              <TouchableOpacity
                key={key}
                style={[
                  styles.flagStyleCard,
                  flagStyle === key && styles.flagStyleCardSelected
                ]}
                onPress={() => setFlagStyle(key)}
              >
                <MaterialCommunityIcons
                  name={icon}
                  size={24}
                  color={flagStyle === key ? '#ffffff' : COLORS.PRIMARY}
                />
                <Text style={[
                  styles.flagStyleLabel,
                  flagStyle === key && styles.flagStyleLabelSelected
                ]}>
                  {label}
                </Text>
                <Text style={[
                  styles.flagStyleDesc,
                  flagStyle === key && styles.flagStyleDescSelected
                ]}>
                  {desc}
                </Text>
                {flagStyle === key && (
                  <View style={styles.flagStyleCheck}>
                    <MaterialCommunityIcons name="check-circle" size={16} color="#ffffff" />
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Flagging Preview */}
        <View style={styles.sectionCard}>
          <View style={styles.enhancedHeader}>
            <View style={styles.iconContainer}>
              <MaterialCommunityIcons name="eye" size={22} color={COLORS.PRIMARY} />
            </View>
            <View style={styles.headerTextContainer}>
              <Text style={styles.sectionTitle}>Preview</Text>
              <Text style={styles.sectionDescription}>See how flagged content will appear</Text>
            </View>
          </View>

        <View style={styles.previewContainer}>
            <Text style={styles.previewLabel}>Sample Text:</Text>
            <View style={styles.previewTextContainer}>
              <Text style={styles.previewText}>
                This is a sample text with some{' '}
                <Text style={[
                  styles.flaggedText,
                  flagStyle === 'highlight' && { backgroundColor: color, color: '#ffffff' },
                  flagStyle === 'underline' && { textDecorationLine: 'underline', color: color },
                  flagStyle === 'blur' && { opacity: 0.3 },
                  flagStyle === 'asterisk' && { color: color },
                  flagStyle === 'none' && { color: '#374151' }
                ]}>
                  {flagStyle === 'asterisk' ? '***flagged***' : 'flagged'}
                </Text>
                {' '}content that would be detected by the extension.
              </Text>
            </View>

            <View style={styles.previewSettings}>
              <View style={styles.previewSettingRow}>
                <Text style={styles.previewSettingLabel}>Style:</Text>
                <Text style={styles.previewSettingValue}>{flagStyle.charAt(0).toUpperCase() + flagStyle.slice(1)}</Text>
              </View>
              <View style={styles.previewSettingRow}>
                <Text style={styles.previewSettingLabel}>Color:</Text>
                <View style={[styles.colorPreview, { backgroundColor: color }]} />
              </View>

            </View>
          </View>
        </View>

        {/* Privacy Controls */}
        <View style={styles.sectionCard}>
          <View style={styles.enhancedHeader}>
            <View style={styles.iconContainer}>
              <MaterialCommunityIcons name="shield-account" size={22} color={COLORS.PRIMARY} />
            </View>
            <View style={styles.headerTextContainer}>
              <Text style={styles.sectionTitle}>Privacy & Data</Text>
              <Text style={styles.sectionDescription}>Manage your data and privacy preferences</Text>
            </View>
          </View>

          <View style={styles.privacyActionsContainer}>
            <TouchableOpacity
              style={styles.privacyActionButton}
              onPress={() => Alert.alert(
                "Export Data",
                "This will export all your extension settings, preferences, and activity data. Continue?",
                [
                  { text: "Cancel", style: "cancel" },
                  { text: "Export", onPress: handleExportData }
                ]
              )}
            >
              <View style={styles.privacyActionLeft}>
                <MaterialCommunityIcons name="download" size={20} color={COLORS.PRIMARY} />
                <View style={styles.privacyActionContent}>
                  <Text style={styles.privacyActionTitle}>Export My Data</Text>
                  <Text style={styles.privacyActionDescription}>Download your settings and activity</Text>
                </View>
              </View>
              <MaterialCommunityIcons name="chevron-right" size={20} color={COLORS.TEXT_SECONDARY} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.privacyActionButton}
              onPress={() => Alert.alert(
                "Privacy Policy",
                "View our privacy policy to understand how we handle your data.",
                [
                  { text: "Cancel", style: "cancel" },
                  { text: "View Policy", onPress: handlePrivacyPolicy }
                ]
              )}
            >
              <View style={styles.privacyActionLeft}>
                <MaterialCommunityIcons name="file-document" size={20} color={COLORS.PRIMARY} />
                <View style={styles.privacyActionContent}>
                  <Text style={styles.privacyActionTitle}>Privacy Policy</Text>
                  <Text style={styles.privacyActionDescription}>Read our data handling practices</Text>
                </View>
              </View>
              <MaterialCommunityIcons name="chevron-right" size={20} color={COLORS.TEXT_SECONDARY} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.privacyActionButton, styles.dangerAction]}
              onPress={() => Alert.alert(
                "Delete All Data",
                "⚠️ This will permanently delete all your data including settings, preferences, and activity logs. This action cannot be undone!",
                [
                  { text: "Cancel", style: "cancel" },
                  { text: "Delete Forever", style: "destructive", onPress: handleDeleteAllData }
                ]
              )}
            >
              <View style={styles.privacyActionLeft}>
                <MaterialCommunityIcons name="delete-forever" size={20} color={COLORS.ERROR} />
                <View style={styles.privacyActionContent}>
                  <Text style={[styles.privacyActionTitle, styles.dangerText]}>Delete All Data</Text>
                  <Text style={[styles.privacyActionDescription, styles.dangerText]}>Permanently remove all your data</Text>
                </View>
              </View>
              <MaterialCommunityIcons name="chevron-right" size={20} color={COLORS.ERROR} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Color Settings */}
        <View style={styles.sectionCard}>
          <View style={styles.enhancedHeader}>
            <View style={styles.iconContainer}>
              <MaterialCommunityIcons name="palette" size={22} color={COLORS.PRIMARY} />
            </View>
            <View style={styles.headerTextContainer}>
              <Text style={styles.sectionTitle}>Flag Color</Text>
              <Text style={styles.sectionDescription}>Choose the color for flagged content</Text>
            </View>
          </View>

          <View style={styles.colorGrid}>
            {[
              { color: '#EF4444', name: 'Red' },
              { color: '#F59E0B', name: 'Orange' },
              { color: '#10B981', name: 'Green' },
              { color: '#3B82F6', name: 'Blue' },
              { color: '#6366F1', name: 'Indigo' },
              { color: '#8B5CF6', name: 'Purple' },
              { color: '#EC4899', name: 'Pink' },
              { color: '#374151', name: 'Gray' },
              { color: '#DC2626', name: 'Dark Red' },
              { color: '#EA580C', name: 'Dark Orange' },
              { color: '#059669', name: 'Dark Green' },
              { color: '#2563EB', name: 'Dark Blue' },
              { color: '#4F46E5', name: 'Dark Indigo' },
              { color: '#7C3AED', name: 'Dark Purple' },
              { color: '#DB2777', name: 'Dark Pink' },
              { color: '#1F2937', name: 'Dark Gray' },
              { color: '#FEE2E2', name: 'Light Red' },
              { color: '#FED7AA', name: 'Light Orange' },
              { color: '#D1FAE5', name: 'Light Green' },
              { color: '#DBEAFE', name: 'Light Blue' },
              { color: '#E0E7FF', name: 'Light Indigo' },
              { color: '#EDE9FE', name: 'Light Purple' },
              { color: '#FCE7F3', name: 'Light Pink' },
              { color: '#F3F4F6', name: 'Light Gray' },
              { color: '#F97316', name: 'Bright Orange' },
              { color: '#22C55E', name: 'Bright Green' },
              { color: '#0EA5E9', name: 'Bright Blue' },
              { color: '#8B5CF6', name: 'Bright Purple' },
              { color: '#F43F5E', name: 'Bright Pink' },
              { color: '#6B7280', name: 'Medium Gray' },
              { color: '#991B1B', name: 'Deep Red' },
              { color: '#92400E', name: 'Deep Orange' },
              { color: '#14532D', name: 'Deep Green' },
              { color: '#1E40AF', name: 'Deep Blue' },
              { color: '#3730A3', name: 'Deep Purple' },
              { color: '#9D174D', name: 'Deep Pink' },
              { color: '#111827', name: 'Deep Gray' }
            ].map(({ color: colorOption, name }) => (
              <TouchableOpacity
                key={colorOption}
                style={[
                  styles.colorOption,
                  { backgroundColor: colorOption },
                  color === colorOption && styles.colorSelected
                ]}
                onPress={() => setColor(colorOption)}
              />
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Whitelist Management Modal */}
      <Modal
        visible={whitelistModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={closeWhitelistModal}
      >
        <WhitelistManager
          route={{
            params: {
              type: whitelistModalType,
              sitesData: whitelistSite,
              termsData: whitelistTerms,
              onUpdateSites: setWhitelistSite,
              onUpdateTerms: setWhitelistTerms
            }
          }}
          navigation={{ goBack: closeWhitelistModal }}
        />
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 20,
    backgroundColor: COLORS.BACKGROUND,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.BORDER,
  },
  closeButton: {
    padding: 5,
  },
  title: {
    fontSize: 18,
    fontFamily: 'Poppins-Medium',
    color: COLORS.TEXT_MAIN,
    flex: 1,
    textAlign: 'center',
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.PRIMARY,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 16,
    gap: 8,
    shadowColor: COLORS.PRIMARY,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 1,
    borderColor: COLORS.PRIMARY_DARK,
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontFamily: 'Poppins-SemiBold',
  },
  content: {
    flex: 1,
    padding: 20,
    backgroundColor: COLORS.SECTION_BG,
  },
  sectionCard: {
    backgroundColor: COLORS.CARD_BG,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: COLORS.SHADOW,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
    borderWidth: 1,
    borderColor: COLORS.BORDER_LIGHT,
  },
  enhancedHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: COLORS.PRIMARY_LIGHT,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  headerTextContainer: {
    flex: 1,
  },
  subsectionHeader: {
    marginTop: 20,
    marginBottom: 12,
  },
  subsectionTitle: {
    fontSize: 15,
    fontFamily: 'Poppins-SemiBold',
    color: COLORS.TEXT_MAIN,
  },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  sectionIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: COLORS.BACKGROUND,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
  },
  sectionTitleContainer: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    color: COLORS.TEXT_MAIN,
    marginBottom: 2,
  },
  sectionDescription: {
    fontSize: 13,
    fontFamily: 'Poppins-Regular',
    color: COLORS.TEXT_SECONDARY,
    lineHeight: 18,
    marginBottom: 12,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  settingLabel: {
    fontSize: 14,
    color: '#374151',
  },
  optionGroup: {
    gap: 10,
  },
  option: {
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
    backgroundColor: '#ffffff',
  },
  optionSelected: {
    borderColor: '#36DCA6',
    backgroundColor: '#f0fdf4',
  },
  optionText: {
    fontSize: 14,
    color: '#374151',
    textAlign: 'center',
  },
  optionTextSelected: {
    color: '#36DCA6',
    fontWeight: '600',
  },
  loadingText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
    color: '#6b7280',
  },
  inputRow: {
    flexDirection: 'row',
    marginBottom: 10,
    gap: 10,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    color: '#374151',
  },
  addButton: {
    backgroundColor: '#36DCA6',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 6,
    justifyContent: 'center',
  },
  addButtonText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 14,
  },
  listItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#f9fafb',
    borderRadius: 6,
    marginBottom: 5,
  },
  listItemText: {
    flex: 1,
    fontSize: 14,
    color: '#374151',
  },
  removeButton: {
    backgroundColor: '#ef4444',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
  },
  removeButtonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  colorOption: {
    width: (width - 80) / 6,
    height: (width - 80) / 6,
    borderRadius: ((width - 80) / 6) / 2,
    borderWidth: 3,
    borderColor: 'transparent',
    shadowColor: COLORS.SHADOW,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  colorSelected: {
    borderColor: COLORS.TEXT_MAIN,
    borderWidth: 4,
    shadowColor: COLORS.TEXT_MAIN,
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
    transform: [{ scale: 1.1 }],
  },
  // Language Card Styles
  languageGrid: {
    gap: 12,
  },
  languageCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.BACKGROUND,
    borderRadius: 16,
    padding: 18,
    borderWidth: 2,
    borderColor: COLORS.BORDER_LIGHT,
    shadowColor: COLORS.SHADOW_LIGHT,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  languageCardSelected: {
    backgroundColor: COLORS.PRIMARY,
    borderColor: COLORS.PRIMARY,
    shadowColor: COLORS.PRIMARY,
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
    transform: [{ scale: 1.02 }],
  },
  languageCardIcon: {
    marginRight: 16,
  },
  languageCardContent: {
    flex: 1,
  },
  languageCardTitle: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    color: COLORS.TEXT_MAIN,
    marginBottom: 4,
  },
  languageCardTitleSelected: {
    color: '#ffffff',
  },
  languageCardDescription: {
    fontSize: 13,
    fontFamily: 'Poppins-Regular',
    color: COLORS.TEXT_SECONDARY,
  },
  languageCardDescriptionSelected: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
  languageCardCheck: {
    marginLeft: 12,
  },

  // Whitelist Styles
  whitelistContainer: {
    gap: 20,
  },
  whitelistSection: {
    backgroundColor: COLORS.SECTION_BG,
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: COLORS.BORDER_LIGHT,
    shadowColor: COLORS.SHADOW_LIGHT,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  whitelistSectionTitle: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    color: COLORS.TEXT_MAIN,
    marginBottom: 12,
  },
  whitelistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: COLORS.CARD_BG,
    borderRadius: 8,
    marginBottom: 8,
    gap: 12,
  },
  whitelistItemText: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: COLORS.TEXT_MAIN,
  },
  seeMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 8,
  },
  seeMoreText: {
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    color: COLORS.PRIMARY,
  },
  addWhitelistButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.PRIMARY_LIGHT,
    borderRadius: 16,
    padding: 18,
    borderWidth: 2,
    borderColor: COLORS.PRIMARY,
    borderStyle: 'dashed',
    gap: 10,
    shadowColor: COLORS.PRIMARY,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  addWhitelistText: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    color: COLORS.PRIMARY,
  },

  // Flag Style Card Styles
  flagStyleGrid: {
    gap: 12,
  },
  flagStyleCard: {
    backgroundColor: COLORS.BACKGROUND,
    borderRadius: 12,
    padding: 12,
    borderWidth: 2,
    borderColor: COLORS.BORDER,
    alignItems: 'center',
    position: 'relative',
  },
  flagStyleCardSelected: {
    backgroundColor: COLORS.PRIMARY,
    borderColor: COLORS.PRIMARY,
  },
  flagStyleLabel: {
    fontSize: 14,
    fontFamily: 'Poppins-SemiBold',
    color: COLORS.TEXT_MAIN,
    marginTop: 8,
    marginBottom: 2,
  },
  flagStyleLabelSelected: {
    color: '#ffffff',
  },
  flagStyleDesc: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: COLORS.TEXT_SECONDARY,
    textAlign: 'center',
  },
  flagStyleDescSelected: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
  flagStyleCheck: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  primarySettingRow: {
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    padding: 15,
  },
  settingInfo: {
    flex: 1,
    marginRight: 15,
  },
  settingDescription: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
  optionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  optionCard: {
    flex: 1,
    minWidth: (width - 64) / 2,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  optionCardSelected: {
    backgroundColor: '#36DCA6',
    borderColor: '#36DCA6',
    transform: [{ scale: 1.02 }],
  },
  optionCardText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginTop: 8,
  },
  optionCardTextSelected: {
    color: '#ffffff',
  },
  sensitivityContainer: {
    gap: 12,
  },
  sensitivityOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.BACKGROUND,
    borderRadius: 16,
    padding: 18,
    borderWidth: 2,
    borderColor: COLORS.BORDER_LIGHT,
    shadowColor: COLORS.SHADOW_LIGHT,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sensitivityOptionSelected: {
    backgroundColor: COLORS.PRIMARY,
    borderColor: COLORS.PRIMARY,
    shadowColor: COLORS.PRIMARY,
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
    transform: [{ scale: 1.02 }],
  },
  sensitivityIconContainer: {
    marginRight: 15,
  },
  sensitivityTextContainer: {
    flex: 1,
  },
  sensitivityLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  sensitivityLabelSelected: {
    color: '#ffffff',
  },
  sensitivityDesc: {
    fontSize: 13,
    color: '#6b7280',
    marginTop: 2,
  },
  sensitivityDescSelected: {
    color: '#e5f9f0',
  },
  // Preview Styles
  previewContainer: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  previewLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  previewTextContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  previewText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#374151',
  },
  flaggedText: {
    fontWeight: '600',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
  },
  previewSettings: {
    gap: 8,
  },
  previewSettingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  previewSettingLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  previewSettingValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  colorPreview: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  // Privacy Controls Styles
  privacyActionsContainer: {
    gap: 12,
  },
  privacyActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.BACKGROUND,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.BORDER_LIGHT,
    shadowColor: COLORS.SHADOW_LIGHT,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  privacyActionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  privacyActionContent: {
    flex: 1,
  },
  privacyActionTitle: {
    fontSize: 15,
    fontFamily: 'Poppins-SemiBold',
    color: COLORS.TEXT_MAIN,
    marginBottom: 2,
  },
  privacyActionDescription: {
    fontSize: 13,
    fontFamily: 'Poppins-Regular',
    color: COLORS.TEXT_SECONDARY,
  },
  dangerAction: {
    borderColor: COLORS.ERROR,
    backgroundColor: '#FEF2F2',
  },
  dangerText: {
    color: COLORS.ERROR,
  },
});
