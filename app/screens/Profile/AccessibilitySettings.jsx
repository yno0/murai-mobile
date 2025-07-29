import { Feather } from '@expo/vector-icons';
import { useNavigation } from "@react-navigation/native";
import { useEffect, useState } from "react";
import { Alert, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from "react-native";
import { useAccessibility } from '../../context/AccessibilityContext';

export default function AccessibilitySettings() {
  const navigation = useNavigation();
  const {
    accessibilitySettings,
    updateSettings,
    loading,
    isScreenReaderEnabled,
    isSystemHighContrastEnabled,
    isSystemReduceMotionEnabled,
    announceToScreenReader,
    getAccessibleTextStyle,
    getAccessibleTouchableStyle,
  } = useAccessibility();

  const [hasChanges, setHasChanges] = useState(false);
  const [initialSettings, setInitialSettings] = useState(null);

  useEffect(() => {
    if (!loading && !initialSettings) {
      setInitialSettings({ ...accessibilitySettings });
    }
  }, [loading, accessibilitySettings, initialSettings]);

  useEffect(() => {
    if (initialSettings) {
      const changed = JSON.stringify(accessibilitySettings) !== JSON.stringify(initialSettings);
      setHasChanges(changed);
    }
  }, [accessibilitySettings, initialSettings]);

  const toggleSetting = async (key) => {
    try {
      const newValue = !accessibilitySettings[key];
      await updateSettings({ [key]: newValue });

      // Announce change to screen reader
      const settingNames = {
        largeText: 'Large Text',
        reduceMotion: 'Reduce Motion',
        largeTouchTargets: 'Large Touch Targets',
        highContrast: 'High Contrast',
      };

      announceToScreenReader(
        `${settingNames[key]} ${newValue ? 'enabled' : 'disabled'}`
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to update accessibility setting');
    }
  };

  const handleFontScaleChange = async (scale) => {
    try {
      await updateSettings({ fontScale: scale });
      announceToScreenReader(`Font size changed to ${scale === 0.8 ? 'small' : scale === 1.0 ? 'normal' : scale === 1.2 ? 'large' : 'extra large'}`);
    } catch (error) {
      Alert.alert('Error', 'Failed to update font size');
    }
  };



  const handleResetSettings = () => {
    Alert.alert(
      "Reset Settings",
      "Are you sure you want to reset all accessibility settings to default?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Reset", onPress: async () => {
          try {
            const defaultSettings = {
              largeText: false,
              reduceMotion: false,
              largeTouchTargets: false,
              fontScale: 1.0,
              highContrast: false,
            };
            await updateSettings(defaultSettings);
            setInitialSettings({ ...defaultSettings });
            announceToScreenReader("Accessibility settings reset to default");
          } catch (error) {
            Alert.alert('Error', 'Failed to reset accessibility settings');
          }
        }}
      ]
    );
  };

  const handleSaveSettings = async () => {
    try {
      // Settings are already saved via updateSettings, just update initial state
      setInitialSettings({ ...accessibilitySettings });
      setHasChanges(false);
      announceToScreenReader("Accessibility settings saved");
      Alert.alert('Success', 'Accessibility settings saved successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to save accessibility settings');
    }
  };

  const accessibilityOptions = [
    {
      key: 'largeText',
      title: 'Large Text',
      description: 'Increase text size throughout the app',
      icon: 'type',
      systemOverride: false,
    },
    {
      key: 'reduceMotion',
      title: 'Reduce Motion',
      description: 'Minimize animations and transitions',
      icon: 'pause-circle',
      systemOverride: isSystemReduceMotionEnabled,
      systemNote: isSystemReduceMotionEnabled ? 'Enabled by system settings' : null,
    },
    {
      key: 'largeTouchTargets',
      title: 'Large Touch Targets',
      description: 'Increase button and link sizes',
      icon: 'target',
      systemOverride: false,
    },
    {
      key: 'highContrast',
      title: 'High Contrast',
      description: 'Use high contrast colors for better visibility',
      icon: 'eye',
      systemOverride: isSystemHighContrastEnabled,
      systemNote: isSystemHighContrastEnabled ? 'Enabled by system settings' : null,
    },
  ];

  const fontSizes = [
    { label: 'Small', scale: 0.8 },
    { label: 'Normal', scale: 1.0 },
    { label: 'Large', scale: 1.2 },
    { label: 'Extra Large', scale: 1.5 },
  ];

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={getAccessibleTextStyle(styles.loadingText)}>Loading accessibility settings...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.headerContainer}>
          <TouchableOpacity
            style={getAccessibleTouchableStyle(styles.backButton)}
            onPress={() => navigation.goBack()}
            accessibilityLabel="Go back"
          >
            <Feather name="arrow-left" size={24} color="#1D1D1F" />
          </TouchableOpacity>
          <Text style={getAccessibleTextStyle(styles.headerTitle)}>Accessibility Settings</Text>
          {hasChanges && (
            <TouchableOpacity
              style={getAccessibleTouchableStyle(styles.saveButton)}
              onPress={handleSaveSettings}
              accessibilityLabel="Save accessibility settings"
            >
              <Feather name="check" size={18} color="#ffffff" />
              <Text style={styles.saveButtonText}>Save</Text>
            </TouchableOpacity>
          )}
          {!hasChanges && <View style={styles.placeholderButton} />}
        </View>

        {/* Font Size Control Card */}
        <View style={styles.fontSizeCard}>
          <View style={styles.cardHeader}>
            <Feather name="type" size={20} color="#01B97F" />
            <Text style={getAccessibleTextStyle(styles.cardTitle)}>Text Size</Text>
          </View>

          <Text style={getAccessibleTextStyle(styles.fontSizeLabel)}>Choose your preferred text size</Text>
          <View style={styles.fontSizeOptions}>
            {fontSizes.map((size) => (
              <TouchableOpacity
                key={size.scale}
                style={[
                  getAccessibleTouchableStyle(styles.fontSizeOption),
                  accessibilitySettings.fontScale === size.scale && styles.fontSizeOptionActive
                ]}
                onPress={() => handleFontScaleChange(size.scale)}
                accessibilityLabel={`Set text size to ${size.label}`}
              >
                <Text style={[
                  styles.fontSizeOptionText,
                  accessibilitySettings.fontScale === size.scale && styles.fontSizeOptionTextActive,
                  { fontSize: 14 * size.scale }
                ]}>
                  {size.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Accessibility Features Card */}
        <View style={styles.settingsCard}>
          <View style={styles.cardHeader}>
            <Feather name="accessibility" size={20} color="#01B97F" />
            <Text style={getAccessibleTextStyle(styles.cardTitle)}>Accessibility Features</Text>
          </View>

          {accessibilityOptions.map((option) => (
            <View key={option.key} style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <Feather
                  name={option.icon}
                  size={20}
                  color="#01B97F"
                />
                <View style={styles.settingContent}>
                  <Text style={getAccessibleTextStyle(styles.settingTitle)}>{option.title}</Text>
                  <Text style={getAccessibleTextStyle(styles.settingDescription)}>
                    {option.description}
                    {option.systemNote && (
                      <Text style={styles.systemNote}> • {option.systemNote}</Text>
                    )}
                  </Text>
                </View>
              </View>
              <Switch
                value={accessibilitySettings[option.key] || option.systemOverride}
                onValueChange={() => toggleSetting(option.key)}
                disabled={option.systemOverride}
                trackColor={{ false: '#E5E7EB', true: '#01B97F' }}
                thumbColor="#FFFFFF"
                ios_backgroundColor="#E5E7EB"
                accessibilityLabel={`Toggle ${option.title}`}
                style={getAccessibleTouchableStyle({})}
              />
            </View>
          ))}
        </View>

        {/* Quick Actions Card */}
        <View style={styles.actionsCard}>
          <View style={styles.cardHeader}>
            <Feather name="settings" size={20} color="#01B97F" />
            <Text style={getAccessibleTextStyle(styles.cardTitle)}>Quick Actions</Text>
          </View>

          <TouchableOpacity
            style={getAccessibleTouchableStyle(styles.actionItem)}
            onPress={handleResetSettings}
            accessibilityLabel="Reset all accessibility settings"
          >
            <View style={styles.actionLeft}>
              <Feather name="refresh-cw" size={20} color="#01B97F" />
              <View style={styles.actionContent}>
                <Text style={getAccessibleTextStyle(styles.actionTitle)}>Reset Settings</Text>
                <Text style={getAccessibleTextStyle(styles.actionDescription)}>Reset to default accessibility options</Text>
              </View>
            </View>
            <Feather name="chevron-right" size={20} color="#A8AAB0" />
          </TouchableOpacity>
        </View>

        {/* System Status Info */}
        {(isScreenReaderEnabled || isSystemHighContrastEnabled || isSystemReduceMotionEnabled) && (
          <View style={styles.systemStatusCard}>
            <View style={styles.cardHeader}>
              <Feather name="smartphone" size={20} color="#01B97F" />
              <Text style={getAccessibleTextStyle(styles.cardTitle)}>System Settings</Text>
            </View>
            <Text style={getAccessibleTextStyle(styles.systemStatusText)}>
              Some accessibility features are enabled by your device's system settings and will override app settings.
            </Text>
            {isScreenReaderEnabled && (
              <Text style={getAccessibleTextStyle(styles.systemFeature)}>• Screen Reader Active</Text>
            )}
            {isSystemHighContrastEnabled && (
              <Text style={getAccessibleTextStyle(styles.systemFeature)}>• System High Contrast Active</Text>
            )}
            {isSystemReduceMotionEnabled && (
              <Text style={getAccessibleTextStyle(styles.systemFeature)}>• System Reduce Motion Active</Text>
            )}
          </View>
        )}

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
  fontSizeCard: {
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
  fontSizeLabel: {
    fontSize: 16,
    fontFamily: 'Poppins-Medium',
    color: '#6C6C6C',
    marginBottom: 16,
    textAlign: 'center',
  },
  fontSizeOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  fontSizeOption: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
  },
  fontSizeOptionActive: {
    backgroundColor: '#01B97F',
    borderColor: '#01B97F',
  },
  fontSizeOptionText: {
    fontFamily: 'Poppins-Medium',
    color: '#1D1D1F',
  },
  fontSizeOptionTextActive: {
    color: '#FFFFFF',
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
  bottomSpacing: {
    height: 40,
  },
  loadingText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
    color: '#6b7280',
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#01B97F',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  systemNote: {
    fontStyle: 'italic',
    color: '#6B7280',
    fontSize: 12,
  },
  systemStatusCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  systemStatusText: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
    lineHeight: 20,
  },
  systemFeature: {
    fontSize: 14,
    color: '#01B97F',
    marginBottom: 4,
    fontWeight: '500',
  },
});