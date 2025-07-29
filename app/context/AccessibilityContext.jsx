import React, { createContext, useContext, useEffect, useState } from 'react';
import { AccessibilityInfo, Platform } from 'react-native';
import { ACCESSIBILITY, FONT } from '../constants/theme';
import { getAccessibilityPreferences, updateAccessibilityPreferences } from '../services/preferences';

const AccessibilityContext = createContext({});

export function AccessibilityProvider({ children }) {
  // User-defined accessibility settings
  const [accessibilitySettings, setAccessibilitySettings] = useState({
    largeText: false,
    reduceMotion: false,
    largeTouchTargets: false,
    fontScale: 1.0,
    highContrast: false,
  });

  // System accessibility settings
  const [isScreenReaderEnabled, setIsScreenReaderEnabled] = useState(false);
  const [isSystemHighContrastEnabled, setIsSystemHighContrastEnabled] = useState(false);
  const [isSystemReduceMotionEnabled, setIsSystemReduceMotionEnabled] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load accessibility preferences on mount
  useEffect(() => {
    loadAccessibilitySettings();
    setupSystemAccessibilityListeners();
  }, []);

  const loadAccessibilitySettings = async () => {
    try {
      const settings = await getAccessibilityPreferences();
      setAccessibilitySettings(settings);
    } catch (error) {
      console.error('Error loading accessibility settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const setupSystemAccessibilityListeners = async () => {
    try {
      // Check initial system accessibility settings
      const screenReaderEnabled = await AccessibilityInfo.isScreenReaderEnabled();
      setIsScreenReaderEnabled(screenReaderEnabled);

      const reduceMotionEnabled = await AccessibilityInfo.isReduceMotionEnabled();
      setIsSystemReduceMotionEnabled(reduceMotionEnabled);

      // Set up listeners for system changes
      const screenReaderSubscription = AccessibilityInfo.addEventListener(
        'screenReaderChanged',
        setIsScreenReaderEnabled
      );

      const reduceMotionSubscription = AccessibilityInfo.addEventListener(
        'reduceMotionChanged',
        setIsSystemReduceMotionEnabled
      );

      // iOS-specific high contrast detection
      let highContrastSubscription;
      if (Platform.OS === 'ios') {
        const highContrastEnabled = await AccessibilityInfo.isHighContrastEnabled();
        setIsSystemHighContrastEnabled(highContrastEnabled);

        highContrastSubscription = AccessibilityInfo.addEventListener(
          'highContrastChanged',
          setIsSystemHighContrastEnabled
        );
      }

      // Cleanup function
      return () => {
        screenReaderSubscription?.remove();
        reduceMotionSubscription?.remove();
        if (Platform.OS === 'ios') {
          highContrastSubscription?.remove();
        }
      };
    } catch (error) {
      console.warn('Error setting up accessibility listeners:', error);
    }
  };

  const updateSettings = async (newSettings) => {
    try {
      const updatedSettings = { ...accessibilitySettings, ...newSettings };
      setAccessibilitySettings(updatedSettings);
      await updateAccessibilityPreferences(updatedSettings);
    } catch (error) {
      console.error('Error updating accessibility settings:', error);
      throw error;
    }
  };

  // Computed values based on user settings and system settings
  const isHighContrastActive = accessibilitySettings.highContrast || isSystemHighContrastEnabled;
  const isReduceMotionActive = accessibilitySettings.reduceMotion || isSystemReduceMotionEnabled;
  const effectiveFontScale = accessibilitySettings.largeText ? 
    Math.max(accessibilitySettings.fontScale, 1.2) : accessibilitySettings.fontScale;

  // Utility functions
  const getScaledFontSize = (baseSize) => {
    return FONT.getScaledFontSize(baseSize, effectiveFontScale);
  };

  const getAccessibleColors = () => {
    if (isHighContrastActive) {
      return ACCESSIBILITY.highContrast;
    }
    return null; // Use default colors
  };

  const getMinTouchTarget = () => {
    const systemMinimum = Platform.OS === 'ios' ? 44 : 48;
    return accessibilitySettings.largeTouchTargets ? 
      Math.max(systemMinimum, ACCESSIBILITY.minTouchTarget) : systemMinimum;
  };

  const announceToScreenReader = (message) => {
    if (isScreenReaderEnabled) {
      AccessibilityInfo.announceForAccessibility(message);
    }
  };

  const getAccessibleTextStyle = (baseStyle = {}) => {
    const scaledFontSize = baseStyle.fontSize ? 
      getScaledFontSize(baseStyle.fontSize) : getScaledFontSize(FONT.regular);
    
    const accessibleColors = getAccessibleColors();
    
    return {
      ...baseStyle,
      fontSize: scaledFontSize,
      ...(accessibleColors && {
        color: accessibleColors.TEXT,
        backgroundColor: accessibleColors.BG,
      }),
    };
  };

  const getAccessibleTouchableStyle = (baseStyle = {}) => {
    const minTouchTarget = getMinTouchTarget();

    // Handle array of styles
    if (Array.isArray(baseStyle)) {
      return baseStyle.map(style => getAccessibleTouchableStyle(style));
    }

    // Handle null/undefined styles
    if (!baseStyle) {
      return {
        minHeight: minTouchTarget,
        minWidth: minTouchTarget,
      };
    }

    return {
      ...baseStyle,
      minHeight: Math.max(baseStyle.minHeight || 0, minTouchTarget),
      minWidth: Math.max(baseStyle.minWidth || 0, minTouchTarget),
    };
  };

  const value = {
    // Settings
    accessibilitySettings,
    updateSettings,
    loading,
    
    // System state
    isScreenReaderEnabled,
    isSystemHighContrastEnabled,
    isSystemReduceMotionEnabled,
    
    // Computed values
    isHighContrastActive,
    isReduceMotionActive,
    effectiveFontScale,
    
    // Utility functions
    getScaledFontSize,
    getAccessibleColors,
    getMinTouchTarget,
    announceToScreenReader,
    getAccessibleTextStyle,
    getAccessibleTouchableStyle,
  };

  return (
    <AccessibilityContext.Provider value={value}>
      {children}
    </AccessibilityContext.Provider>
  );
}

export const useAccessibility = () => {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider');
  }
  return context;
};

export default AccessibilityContext;
