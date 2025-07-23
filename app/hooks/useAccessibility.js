import { useEffect, useState } from 'react';
import { AccessibilityInfo, Platform } from 'react-native';
import { ACCESSIBILITY, FONT } from '../constants/theme';

export const useAccessibility = () => {
  const [isScreenReaderEnabled, setIsScreenReaderEnabled] = useState(false);
  const [isHighContrastEnabled, setIsHighContrastEnabled] = useState(false);
  const [fontScale, setFontScale] = useState(1);
  const [isReduceMotionEnabled, setIsReduceMotionEnabled] = useState(false);

  useEffect(() => {
    // Check initial accessibility settings
    const checkAccessibilitySettings = async () => {
      try {
        const screenReaderEnabled = await AccessibilityInfo.isScreenReaderEnabled();
        setIsScreenReaderEnabled(screenReaderEnabled);

        // Listen for screen reader changes
        const screenReaderSubscription = AccessibilityInfo.addEventListener(
          'screenReaderChanged',
          setIsScreenReaderEnabled
        );

        // Check for high contrast mode (iOS only)
        if (Platform.OS === 'ios') {
          const highContrastEnabled = await AccessibilityInfo.isHighContrastEnabled();
          setIsHighContrastEnabled(highContrastEnabled);

          const highContrastSubscription = AccessibilityInfo.addEventListener(
            'highContrastChanged',
            setIsHighContrastEnabled
          );
        }

        // Check for reduce motion
        const reduceMotionEnabled = await AccessibilityInfo.isReduceMotionEnabled();
        setIsReduceMotionEnabled(reduceMotionEnabled);

        const reduceMotionSubscription = AccessibilityInfo.addEventListener(
          'reduceMotionChanged',
          setIsReduceMotionEnabled
        );

        return () => {
          screenReaderSubscription?.remove();
          if (Platform.OS === 'ios') {
            highContrastSubscription?.remove();
          }
          reduceMotionSubscription?.remove();
        };
      } catch (error) {
        console.warn('Error checking accessibility settings:', error);
      }
    };

    checkAccessibilitySettings();
  }, []);

  // Get scaled font size based on user preferences
  const getScaledFontSize = (baseSize) => {
    return FONT.getScaledFontSize(baseSize, fontScale);
  };

  // Get accessibility-friendly colors
  const getAccessibleColors = () => {
    if (isHighContrastEnabled) {
      return ACCESSIBILITY.highContrast;
    }
    return null; // Use default colors
  };

  // Get minimum touch target size
  const getMinTouchTarget = () => {
    return Platform.OS === 'ios' ? 44 : 48;
  };

  // Announce to screen reader
  const announceToScreenReader = (message) => {
    if (isScreenReaderEnabled) {
      AccessibilityInfo.announceForAccessibility(message);
    }
  };

  return {
    isScreenReaderEnabled,
    isHighContrastEnabled,
    fontScale,
    isReduceMotionEnabled,
    getScaledFontSize,
    getAccessibleColors,
    getMinTouchTarget,
    announceToScreenReader,
  };
}; 