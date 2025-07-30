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

// Enhanced MURAi Color Scheme with better contrast
const COLORS = {
  PRIMARY: '#02B97F',
  PRIMARY_DARK: '#01A06E',
  PRIMARY_LIGHT: '#E6F7F1',
  BACKGROUND: '#ffffff',
  CARD_BG: '#ffffff',
  SECTION_BG: '#F8FAFC',
  TEXT_MAIN: '#1F2937', // Darker for better contrast
  TEXT_SECONDARY: '#4B5563', // Darker for better contrast
  TEXT_MUTED: '#6B7280',
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



  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={[styles.loadingText, getAccessibleTextStyle({})]}>Loading...</Text>
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
        <Text style={[styles.title, getAccessibleTextStyle({})]}>Extension Settings</Text>
        {hasChanges && (
          <TouchableOpacity onPress={savePreferences} style={getAccessibleTouchableStyle(styles.saveButton)}>
            <MaterialCommunityIcons name="content-save" size={18} color="#ffffff" />
            <Text style={[styles.saveButtonText, getAccessibleTextStyle({})]}>Save</Text>
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
              <Text style={[styles.sectionTitle, getAccessibleTextStyle({})]}>Language Detection</Text>
              <Text style={[styles.sectionDescription, getAccessibleTextStyle({})]}>Choose which language to monitor for inappropriate content</Text>
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
                  <Text style={[
                    styles.languageCardTitle,
                    language === key && styles.languageCardTitleSelected,
                    getAccessibleTextStyle({})
                  ]}>
                    {key}
                  </Text>
                  <Text style={[
                    styles.languageCardDescription,
                    language === key && styles.languageCardDescriptionSelected,
                    getAccessibleTextStyle({})
                  ]}>
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
              <Text style={[styles.sectionTitle, getAccessibleTextStyle({})]}>Sensitivity Level</Text>
              <Text style={[styles.sectionDescription, getAccessibleTextStyle({})]}>Adjust how strictly content is filtered</Text>
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
                  <Text style={[
                    styles.sensitivityLabel,
                    sensitivity === key && styles.sensitivityLabelSelected,
                    getAccessibleTextStyle({})
                  ]}>
                    {label}
                  </Text>
                  <Text style={[
                    styles.sensitivityDesc,
                    sensitivity === key && styles.sensitivityDescSelected,
                    getAccessibleTextStyle({})
                  ]}>
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
              <Text style={[styles.sectionTitle, getAccessibleTextStyle({})]}>Whitelist Management</Text>
              <Text style={[styles.sectionDescription, getAccessibleTextStyle({})]}>Manage trusted sites and terms that should not be flagged</Text>
            </View>
          </View>

          <View style={styles.whitelistContainer}>
            <View style={styles.whitelistSection}>
              <Text style={[styles.whitelistSectionTitle, getAccessibleTextStyle({})]}>Trusted Sites ({whitelistSite.length})</Text>
              {whitelistSite.slice(0, 5).map((site, index) => (
                <View key={index} style={styles.whitelistItem}>
                  <MaterialCommunityIcons name="web" size={16} color={COLORS.PRIMARY} />
                  <Text style={[styles.whitelistItemText, getAccessibleTextStyle({})]}>{site}</Text>
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
                  <Text style={[styles.seeMoreText, getAccessibleTextStyle({})]}>See {whitelistSite.length - 5} more sites</Text>
                  <MaterialCommunityIcons name="chevron-right" size={16} color={COLORS.PRIMARY} />
                </TouchableOpacity>
              )}
            </View>

            <View style={styles.whitelistSection}>
              <Text style={[styles.whitelistSectionTitle, getAccessibleTextStyle({})]}>Trusted Terms ({whitelistTerms.length})</Text>
              {whitelistTerms.slice(0, 5).map((term, index) => (
                <View key={index} style={styles.whitelistItem}>
                  <MaterialCommunityIcons name="text" size={16} color={COLORS.PRIMARY} />
                  <Text style={[styles.whitelistItemText, getAccessibleTextStyle({})]}>{term}</Text>
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
                  <Text style={[styles.seeMoreText, getAccessibleTextStyle({})]}>See {whitelistTerms.length - 5} more terms</Text>
                  <MaterialCommunityIcons name="chevron-right" size={16} color={COLORS.PRIMARY} />
                </TouchableOpacity>
              )}
            </View>

            <TouchableOpacity
              style={styles.addWhitelistButton}
              onPress={() => openWhitelistModal('sites')}
            >
              <MaterialCommunityIcons name="plus" size={20} color={COLORS.PRIMARY} />
              <Text style={[styles.addWhitelistText, getAccessibleTextStyle({})]}>Add to Whitelist</Text>
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
              <Text style={[styles.sectionTitle, getAccessibleTextStyle({})]}>Flag Style</Text>
              <Text style={[styles.sectionDescription, getAccessibleTextStyle({})]}>Choose how flagged content should be displayed</Text>
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
                  flagStyle === key && styles.flagStyleLabelSelected,
                  getAccessibleTextStyle({})
                ]}>
                  {label}
                </Text>
                <Text style={[
                  styles.flagStyleDesc,
                  flagStyle === key && styles.flagStyleDescSelected,
                  getAccessibleTextStyle({})
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
              <Text style={[styles.sectionTitle, getAccessibleTextStyle({})]}>Preview</Text>
              <Text style={[styles.sectionDescription, getAccessibleTextStyle({})]}>See how flagged content will appear</Text>
            </View>
          </View>

        <View style={styles.previewContainer}>
            <Text style={[styles.previewLabel, getAccessibleTextStyle({})]}>Sample Text:</Text>
            <View style={styles.previewTextContainer}>
              <Text style={[styles.previewText, getAccessibleTextStyle({})]}>
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
                <Text style={[styles.previewSettingLabel, getAccessibleTextStyle({})]}>Style:</Text>
                <Text style={[styles.previewSettingValue, getAccessibleTextStyle({})]}>{flagStyle.charAt(0).toUpperCase() + flagStyle.slice(1)}</Text>
              </View>
              <View style={styles.previewSettingRow}>
                <Text style={[styles.previewSettingLabel, getAccessibleTextStyle({})]}>Color:</Text>
                <View style={[styles.colorPreview, { backgroundColor: color }]} />
              </View>

            </View>
          </View>
        </View>



        {/* Color Settings */}
        <View style={styles.sectionCard}>
          <View style={styles.enhancedHeader}>
            <View style={styles.iconContainer}>
              <MaterialCommunityIcons name="palette" size={22} color={COLORS.PRIMARY} />
            </View>
            <View style={styles.headerTextContainer}>
              <Text style={[styles.sectionTitle, getAccessibleTextStyle({})]}>Flag Color</Text>
              <Text style={[styles.sectionDescription, getAccessibleTextStyle({})]}>Choose the color for flagged content</Text>
            </View>
          </View>

          <View style={styles.colorGrid}>
            {[
              { color: '#EF4444', name: 'Red' },
              { color: '#F59E0B', name: 'Orange' },
              { color: '#10B981', name: 'Green' },
              { color: '#3B82F6', name: 'Blue' },
              { color: '#8B5CF6', name: 'Purple' },
              { color: '#EC4899', name: 'Pink' },
              { color: '#374151', name: 'Gray' },
              { color: '#1F2937', name: 'Dark Gray' }
            ].map(({ color: colorOption, name }) => (
              <TouchableOpacity
                key={colorOption}
                style={[
                  styles.colorOption,
                  { backgroundColor: colorOption },
                  color === colorOption && styles.colorSelected
                ]}
                onPress={() => setColor(colorOption)}
                accessibilityLabel={`Select ${name} color for flagged content`}
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
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: COLORS.TEXT_SECONDARY,
    lineHeight: 16,
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
    fontFamily: 'Poppins-Medium',
    color: COLORS.TEXT_MAIN,
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
    borderColor: COLORS.PRIMARY,
    backgroundColor: COLORS.PRIMARY,
  },
  optionText: {
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    color: COLORS.TEXT_MAIN,
    textAlign: 'center',
  },
  optionTextSelected: {
    color: '#ffffff',
    fontFamily: 'Poppins-SemiBold',
  },
  loadingText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
    fontFamily: 'Poppins-Medium',
    color: COLORS.TEXT_SECONDARY,
  },
  inputRow: {
    flexDirection: 'row',
    marginBottom: 10,
    gap: 10,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: COLORS.TEXT_MAIN,
  },
  addButton: {
    backgroundColor: COLORS.PRIMARY,
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 6,
    justifyContent: 'center',
  },
  addButtonText: {
    color: '#ffffff',
    fontFamily: 'Poppins-SemiBold',
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
    fontFamily: 'Poppins-Regular',
    color: COLORS.TEXT_MAIN,
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
    fontFamily: 'Poppins-SemiBold',
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  colorOption: {
    width: (width - 80) / 4,
    height: (width - 80) / 4,
    borderRadius: ((width - 80) / 4) / 2,
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
    fontFamily: 'Poppins-SemiBold',
  },
  languageCardDescription: {
    fontSize: 11,
    fontFamily: 'Poppins-Regular',
    color: COLORS.TEXT_SECONDARY,
  },
  languageCardDescriptionSelected: {
    color: 'rgba(255, 255, 255, 0.9)',
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
    fontFamily: 'Poppins-SemiBold',
  },
  flagStyleDesc: {
    fontSize: 10,
    fontFamily: 'Poppins-Regular',
    color: COLORS.TEXT_SECONDARY,
    textAlign: 'center',
  },
  flagStyleDescSelected: {
    color: 'rgba(255, 255, 255, 0.9)',
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
    fontSize: 11,
    fontFamily: 'Poppins-Regular',
    color: COLORS.TEXT_SECONDARY,
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
    backgroundColor: COLORS.PRIMARY,
    borderColor: COLORS.PRIMARY,
    transform: [{ scale: 1.02 }],
  },
  optionCardText: {
    fontSize: 14,
    fontFamily: 'Poppins-SemiBold',
    color: COLORS.TEXT_MAIN,
    marginTop: 8,
  },
  optionCardTextSelected: {
    color: '#ffffff',
    fontFamily: 'Poppins-SemiBold',
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
    fontFamily: 'Poppins-SemiBold',
    color: COLORS.TEXT_MAIN,
  },
  sensitivityLabelSelected: {
    color: '#ffffff',
    fontFamily: 'Poppins-SemiBold',
  },
  sensitivityDesc: {
    fontSize: 11,
    fontFamily: 'Poppins-Regular',
    color: COLORS.TEXT_SECONDARY,
    marginTop: 2,
  },
  sensitivityDescSelected: {
    color: 'rgba(255, 255, 255, 0.9)',
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
    fontFamily: 'Poppins-SemiBold',
    color: COLORS.TEXT_MAIN,
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
    fontFamily: 'Poppins-Regular',
    lineHeight: 24,
    color: COLORS.TEXT_MAIN,
  },
  flaggedText: {
    fontFamily: 'Poppins-SemiBold',
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
    fontFamily: 'Poppins-Regular',
    color: COLORS.TEXT_SECONDARY,
  },
  previewSettingValue: {
    fontSize: 14,
    fontFamily: 'Poppins-SemiBold',
    color: COLORS.TEXT_MAIN,
  },
  colorPreview: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },

});
