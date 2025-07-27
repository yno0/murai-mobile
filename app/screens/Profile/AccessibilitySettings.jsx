import { Feather } from '@expo/vector-icons';
import { useNavigation } from "@react-navigation/native";
import { useState } from "react";
import { Alert, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from "react-native";

export default function AccessibilitySettings() {
  const navigation = useNavigation();

  const [accessibilitySettings, setAccessibilitySettings] = useState({
    largeText: true,
    reduceMotion: false,
    largeTouchTargets: true,
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



  const handleResetSettings = () => {
    Alert.alert(
      "Reset Settings",
      "Are you sure you want to reset all accessibility settings to default?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Reset", onPress: () => {
          setAccessibilitySettings({
            largeText: true,
            reduceMotion: false,
            largeTouchTargets: true,
          });
          setFontScale(1.0);
        }}
      ]
    );
  };

  const accessibilityOptions = [
    {
      key: 'largeText',
      title: 'Large Text',
      description: 'Increase text size throughout the app',
      icon: 'type',
    },
    {
      key: 'reduceMotion',
      title: 'Reduce Motion',
      description: 'Minimize animations and transitions',
      icon: 'pause-circle',
    },
    {
      key: 'largeTouchTargets',
      title: 'Large Touch Targets',
      description: 'Increase button and link sizes',
      icon: 'target',
    },
  ];

  const fontSizes = [
    { label: 'Small', scale: 0.8 },
    { label: 'Normal', scale: 1.0 },
    { label: 'Large', scale: 1.2 },
    { label: 'Extra Large', scale: 1.5 },
  ];

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.headerContainer}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            accessibilityLabel="Go back"
          >
            <Feather name="arrow-left" size={24} color="#1D1D1F" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Accessibility Settings</Text>
          <View style={styles.placeholderButton} />
        </View>

        {/* Font Size Control Card */}
        <View style={styles.fontSizeCard}>
          <View style={styles.cardHeader}>
            <Feather name="type" size={20} color="#01B97F" />
            <Text style={styles.cardTitle}>Text Size</Text>
          </View>

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

        {/* Accessibility Features Card */}
        <View style={styles.settingsCard}>
          <View style={styles.cardHeader}>
            <Feather name="accessibility" size={20} color="#01B97F" />
            <Text style={styles.cardTitle}>Accessibility Features</Text>
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
                  <Text style={styles.settingTitle}>{option.title}</Text>
                  <Text style={styles.settingDescription}>{option.description}</Text>
                </View>
              </View>
              <Switch
                value={accessibilitySettings[option.key]}
                onValueChange={() => toggleSetting(option.key)}
                trackColor={{ false: '#E5E7EB', true: '#01B97F' }}
                thumbColor="#FFFFFF"
                ios_backgroundColor="#E5E7EB"
                accessibilityLabel={`Toggle ${option.title}`}
              />
            </View>
          ))}
        </View>

        {/* Quick Actions Card */}
        <View style={styles.actionsCard}>
          <View style={styles.cardHeader}>
            <Feather name="settings" size={20} color="#01B97F" />
            <Text style={styles.cardTitle}>Quick Actions</Text>
          </View>

          <TouchableOpacity
            style={styles.actionItem}
            onPress={handleResetSettings}
            accessibilityLabel="Reset all accessibility settings"
          >
            <View style={styles.actionLeft}>
              <Feather name="refresh-cw" size={20} color="#01B97F" />
              <View style={styles.actionContent}>
                <Text style={styles.actionTitle}>Reset Settings</Text>
                <Text style={styles.actionDescription}>Reset to default accessibility options</Text>
              </View>
            </View>
            <Feather name="chevron-right" size={20} color="#A8AAB0" />
          </TouchableOpacity>
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
});