import { useNavigation } from "@react-navigation/native";
import React, { useState } from "react";
import { Alert, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from "react-native";
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

export default function AccessibilitySettings() {
  const navigation = useNavigation();
  
  const [accessibilitySettings, setAccessibilitySettings] = useState({
    screenReader: false,
    highContrast: false,
    largeText: true,
    reduceMotion: false,
    largeTouchTargets: true,
    voiceControl: false,
  });

  const [fontScale, setFontScale] = useState(1.0);

  const toggleSetting = (key) => {
    setAccessibilitySettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleFontScaleChange = (scale) => {
    setFontScale(scale);
  };

  const handleAccessibilityTest = () => {
    Alert.alert("Accessibility Test", "Testing accessibility features...");
  };

  const handleResetSettings = () => {
    Alert.alert(
      "Reset Settings",
      "Are you sure you want to reset all accessibility settings to default?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Reset", onPress: () => {
          setAccessibilitySettings({
            screenReader: false,
            highContrast: false,
            largeText: true,
            reduceMotion: false,
            largeTouchTargets: true,
            voiceControl: false,
          });
          setFontScale(1.0);
        }}
      ]
    );
  };

  const accessibilityOptions = [
    {
      key: 'screenReader',
      title: 'Screen Reader Support',
      description: 'Enable screen reader compatibility',
      icon: 'text-to-speech',
    },
    {
      key: 'highContrast',
      title: 'High Contrast Mode',
      description: 'Increase contrast for better visibility',
      icon: 'contrast-box',
    },
    {
      key: 'largeText',
      title: 'Large Text',
      description: 'Increase text size throughout the app',
      icon: 'format-size',
    },
    {
      key: 'reduceMotion',
      title: 'Reduce Motion',
      description: 'Minimize animations and transitions',
      icon: 'motion-pause',
    },
    {
      key: 'largeTouchTargets',
      title: 'Large Touch Targets',
      description: 'Increase button and link sizes',
      icon: 'gesture-tap',
    },
  ];

  const fontSizes = [
    { label: 'Small', scale: 0.8 },
    { label: 'Normal', scale: 1.0 },
    { label: 'Large', scale: 1.2 },
    { label: 'Extra Large', scale: 1.5 },
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          accessibilityLabel="Go back"
        >
          <MaterialCommunityIcons name="arrow-left" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.title}>Accessibility Settings</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Font Size Control */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Text Size</Text>
        
        <View style={styles.fontSizeContainer}>
          <Text style={styles.fontSizeLabel}>Choose your preferred text size</Text>
          <View style={styles.fontSizeOptions}>
            {fontSizes.map((size) => (
              <TouchableOpacity
                key={size.scale}
                style={[
                  styles.fontSizeOption,
                  fontScale === size.scale && styles.fontSizeOptionActive
                ]}
                onPress={() => handleFontScaleChange(size.scale)}
                accessibilityLabel={`Set text size to ${size.label}`}
              >
                <Text style={[
                  styles.fontSizeOptionText,
                  fontScale === size.scale && styles.fontSizeOptionTextActive,
                  { fontSize: 14 * size.scale }
                ]}>
                  {size.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>

      {/* Accessibility Options */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Accessibility Features</Text>
        
        {accessibilityOptions.map((option) => (
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
              value={accessibilitySettings[option.key]}
              onValueChange={() => toggleSetting(option.key)}
              trackColor={{ false: '#E5E7EB', true: '#374151' }}
              thumbColor={accessibilitySettings[option.key] ? '#FFFFFF' : '#FFFFFF'}
              accessibilityLabel={`Toggle ${option.title}`}
            />
          </View>
        ))}
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        
        <TouchableOpacity 
          style={styles.actionItem}
          onPress={handleAccessibilityTest}
          accessibilityLabel="Test accessibility features"
        >
          <View style={styles.actionLeft}>
            <MaterialCommunityIcons name="test-tube" size={20} color="#6B7280" />
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>Test Accessibility</Text>
              <Text style={styles.actionDescription}>Test current accessibility settings</Text>
            </View>
          </View>
          <MaterialCommunityIcons name="chevron-right" size={20} color="#9CA3AF" />
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.actionItem}
          onPress={handleResetSettings}
          accessibilityLabel="Reset all accessibility settings"
        >
          <View style={styles.actionLeft}>
            <MaterialCommunityIcons name="restore" size={20} color="#6B7280" />
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>Reset Settings</Text>
              <Text style={styles.actionDescription}>Reset to default accessibility options</Text>
            </View>
          </View>
          <MaterialCommunityIcons name="chevron-right" size={20} color="#9CA3AF" />
        </TouchableOpacity>
      </View>

      {/* Accessibility Info */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About Accessibility</Text>
        
        <View style={styles.infoCard}>
          <View style={styles.infoHeader}>
            <MaterialCommunityIcons name="information" size={24} color="#374151" />
            <Text style={styles.infoTitle}>Making Apps Accessible</Text>
          </View>
          <Text style={styles.infoDescription}>
            We're committed to making our app accessible to everyone. These settings help customize your experience based on your individual needs and preferences.
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
  fontSizeContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  fontSizeLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16,
  },
  fontSizeOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  fontSizeOption: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 4,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  fontSizeOptionActive: {
    backgroundColor: '#374151',
    borderColor: '#374151',
  },
  fontSizeOptionText: {
    fontWeight: '500',
    color: '#6B7280',
  },
  fontSizeOptionTextActive: {
    color: '#FFFFFF',
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
  infoCard: {
    backgroundColor: '#F0F9FF',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#BAE6FD',
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0C4A6E',
    marginLeft: 12,
  },
  infoDescription: {
    fontSize: 14,
    color: '#0369A1',
    lineHeight: 20,
  },
}); 