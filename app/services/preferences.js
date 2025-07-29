import AsyncStorage from '@react-native-async-storage/async-storage';
import api from './api';

// Default preferences
const DEFAULT_PREFERENCES = {
  language: 'Both',
  sensitivity: 'medium',
  whitelistSite: [],
  whitelistTerms: [],
  flagStyle: 'highlight',
  isHighlighted: true,
  color: '#374151',
  extensionEnabled: true,
  // Accessibility settings
  accessibility: {
    largeText: false,
    reduceMotion: false,
    largeTouchTargets: false,
    fontScale: 1.0,
    highContrast: false,
  },
};

// Local storage keys
const PREFERENCES_KEY = 'user_preferences';

export const getPreferences = async () => {
  try {
    // Try to get preferences from server first
    const res = await api.get('/users/preferences');

    // Save to local storage as backup
    await AsyncStorage.setItem(PREFERENCES_KEY, JSON.stringify(res.data));

    return res.data;
  } catch (error) {
    console.log('Failed to fetch preferences from server, using local storage:', error.message);

    try {
      // Fallback to local storage
      const localPrefs = await AsyncStorage.getItem(PREFERENCES_KEY);

      if (localPrefs) {
        const parsedPrefs = JSON.parse(localPrefs);
        console.log('Loaded preferences from local storage');
        return parsedPrefs;
      }
    } catch (localError) {
      console.log('Failed to load from local storage:', localError.message);
    }

    // Final fallback to default preferences
    console.log('Using default preferences');
    await AsyncStorage.setItem(PREFERENCES_KEY, JSON.stringify(DEFAULT_PREFERENCES));
    return DEFAULT_PREFERENCES;
  }
};

export const updatePreferences = async (prefs) => {
  try {
    // Try to update on server first
    const res = await api.put('/users/preferences', prefs);

    // Update local storage
    await AsyncStorage.setItem(PREFERENCES_KEY, JSON.stringify(prefs));

    return res.data;
  } catch (error) {
    console.log('Failed to update preferences on server, saving locally:', error.message);

    // Fallback to local storage only
    await AsyncStorage.setItem(PREFERENCES_KEY, JSON.stringify(prefs));

    return prefs;
  }
};

// Clear preferences (for logout or reset)
export const clearPreferences = async () => {
  try {
    await AsyncStorage.removeItem(PREFERENCES_KEY);
    console.log('Preferences cleared successfully');
  } catch (error) {
    console.log('Failed to clear preferences:', error.message);
  }
};

// Reset preferences to default
export const resetPreferences = async () => {
  try {
    await AsyncStorage.setItem(PREFERENCES_KEY, JSON.stringify(DEFAULT_PREFERENCES));
    console.log('Preferences reset to default');
    return DEFAULT_PREFERENCES;
  } catch (error) {
    console.log('Failed to reset preferences:', error.message);
    throw error;
  }
};

// Extension-specific functions
export const toggleExtension = async (enabled) => {
  try {
    const res = await api.put('/users/extension-toggle', { enabled });
    console.log(`Extension ${enabled ? 'enabled' : 'disabled'} successfully`);
    return res.data;
  } catch (error) {
    console.log('Failed to toggle extension on server:', error.message);

    // Fallback to updating preferences locally
    const currentPrefs = await getPreferences();
    const updatedPrefs = { ...currentPrefs, extensionEnabled: enabled };
    await AsyncStorage.setItem(PREFERENCES_KEY, JSON.stringify(updatedPrefs));

    return { extensionEnabled: enabled, preferences: updatedPrefs };
  }
};

export const getExtensionStatus = async () => {
  try {
    const res = await api.get('/users/extension-status');
    return res.data;
  } catch (error) {
    console.log('Failed to get extension status from server:', error.message);

    // Fallback to local preferences
    const prefs = await getPreferences();
    return {
      extensionEnabled: prefs.extensionEnabled !== false,
      preferences: prefs
    };
  }
};

export const syncExtensionSettings = async (syncType = 'manual') => {
  try {
    const res = await api.post('/users/extension-sync', {
      syncType,
      timestamp: new Date().toISOString()
    });

    // Update local storage with synced preferences
    if (res.data.preferences) {
      await AsyncStorage.setItem(PREFERENCES_KEY, JSON.stringify(res.data.preferences));
    }

    return res.data;
  } catch (error) {
    console.log('Failed to sync extension settings:', error.message);
    throw error;
  }
};

// Check if preferences exist locally
export const hasLocalPreferences = async () => {
  try {
    const localPrefs = await AsyncStorage.getItem(PREFERENCES_KEY);
    return localPrefs !== null;
  } catch (error) {
    console.log('Failed to check local preferences:', error.message);
    return false;
  }
};

// Accessibility-specific functions
export const getAccessibilityPreferences = async () => {
  try {
    const prefs = await getPreferences();
    return prefs.accessibility || DEFAULT_PREFERENCES.accessibility;
  } catch (error) {
    console.log('Failed to get accessibility preferences:', error.message);
    return DEFAULT_PREFERENCES.accessibility;
  }
};

export const updateAccessibilityPreferences = async (accessibilitySettings) => {
  try {
    const currentPrefs = await getPreferences();
    const updatedPrefs = {
      ...currentPrefs,
      accessibility: {
        ...currentPrefs.accessibility,
        ...accessibilitySettings,
      },
    };
    return await updatePreferences(updatedPrefs);
  } catch (error) {
    console.log('Failed to update accessibility preferences:', error.message);
    throw error;
  }
};