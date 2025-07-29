import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useState } from 'react';
import {
  Animated,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import MainHeader from '../../components/common/MainHeader';
import { useAuth } from '../../context/AuthContext';
import { getPreferences, updatePreferences } from '../../services/preferences';
import ExtensionSettings from './ExtensionSettings';

// Import services directly

export default function ExtensionScreen() {
  const [extensionEnabled, setExtensionEnabled] = useState(false);
  const [settingsVisible, setSettingsVisible] = useState(false);
  
  // Multiple animations for different effects
  const [pulseAnim] = useState(new Animated.Value(1));
  const [glowAnim] = useState(new Animated.Value(0));
  const [rotateAnim] = useState(new Animated.Value(0));
  const [buttonScale] = useState(new Animated.Value(1));
  const [statusCardsAnim] = useState(new Animated.Value(0));
  const [statusCardsScale] = useState(new Animated.Value(0.8));
  const [shakeAnim] = useState(new Animated.Value(0));

  // Real sync data with auto-sync functionality
  const [lastSyncTime, setLastSyncTime] = useState(null);
  const [activeTime, setActiveTime] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState('Not synced');

  // Complex animation sequence
  React.useEffect(() => {
    if (extensionEnabled) {
      // Start tracking active time when enabled
      setActiveTime(0);
      // Keep sync time as null for now - will handle real sync later
      // setLastSyncTime(new Date()); // Set sync time when enabled

      // Button pop effect
      buttonScale.setValue(0.9);
      Animated.timing(buttonScale, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();

      // Pulse pop and settle into gentle pulse
      pulseAnim.setValue(0.95);
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        })
      ]).start(() => {
        Animated.loop(
          Animated.sequence([
            Animated.timing(pulseAnim, {
              toValue: 1.08,
              duration: 2000,
              useNativeDriver: true,
            }),
            Animated.timing(pulseAnim, {
              toValue: 1,
              duration: 2000,
              useNativeDriver: true,
            }),
          ])
        ).start();
      });

      // Glow pop and settle into gentle pulse
      glowAnim.setValue(0);
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0.6,
          duration: 600,
          useNativeDriver: true,
        })
      ]).start(() => {
        Animated.loop(
          Animated.sequence([
            Animated.timing(glowAnim, {
              toValue: 1,
              duration: 2500,
              useNativeDriver: true,
            }),
            Animated.timing(glowAnim, {
              toValue: 0.6,
              duration: 2500,
              useNativeDriver: true,
            }),
          ])
        ).start();
      });

      // Smooth rotation
      rotateAnim.setValue(0);
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 10000,
        useNativeDriver: true,
      }).start(() => {
        rotateAnim.setValue(0);
        Animated.loop(
          Animated.timing(rotateAnim, {
            toValue: 1,
            duration: 10000,
            useNativeDriver: true,
          })
        ).start();
      });

      // Animate status cards in with shorter delay - quick but smooth
      Animated.sequence([
        Animated.delay(300), // Shorter delay for quicker reveal
        Animated.parallel([
          Animated.timing(statusCardsAnim, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true, // Use native driver for better performance
          }),
          Animated.spring(statusCardsScale, {
            toValue: 1,
            friction: 8,
            tension: 100,
            useNativeDriver: true,
          })
        ])
      ]).start();
    } else {
      // Reset sync data when disabled
      setLastSyncTime(null);
      setActiveTime(0);

      // Smooth button scale animation for disabled state
      buttonScale.setValue(1);
      Animated.timing(buttonScale, {
        toValue: 0.95,
        duration: 200,
        useNativeDriver: true,
      }).start(() => {
        Animated.timing(buttonScale, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }).start();
      });

      // Add a subtle shake effect when deactivating
      Animated.sequence([
        Animated.timing(shakeAnim, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(shakeAnim, {
          toValue: -1,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(shakeAnim, {
          toValue: 0,
          duration: 100,
          useNativeDriver: true,
        })
      ]).start();

      // Smoothly fade out and reset animations
      Animated.parallel([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(rotateAnim, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.parallel([
          Animated.timing(statusCardsAnim, {
            toValue: 0,
            duration: 250,
            useNativeDriver: true,
          }),
          Animated.timing(statusCardsScale, {
            toValue: 0.8,
            duration: 250,
            useNativeDriver: true,
          })
        ]),
      ]).start();
    }
  }, [extensionEnabled]);

  // Track active time when extension is enabled
  React.useEffect(() => {
    let interval;
    if (extensionEnabled) {
      interval = setInterval(() => {
        setActiveTime(prev => prev + 1); // Increment by 1 minute
      }, 60000); // Update every minute
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [extensionEnabled]);

  // Auto-sync functionality when tab is focused
  const { user } = useAuth();

  const syncExtensionSettingsLocal = useCallback(async () => {
    if (!user) return;

    setIsSyncing(true);
    setSyncStatus('Syncing...');

    try {
      console.log('🔄 Auto-syncing extension settings...');

      let syncResult = null;

      // Try to sync with server using extension-sync endpoint
      try {
        const token = await AsyncStorage.getItem('token');
        if (!token) {
          throw new Error('No authentication token found');
        }

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

        const response = await fetch('https://murai-server.onrender.com/api/users/extension-sync', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            syncType: 'auto',
            timestamp: new Date().toISOString()
          }),
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        console.log('📡 Sync response status:', response.status);

        if (response.ok) {
          syncResult = await response.json();
          console.log('✅ Sync successful:', syncResult);

          if (syncResult && syncResult.preferences) {
            // Update local storage with synced preferences
            await AsyncStorage.setItem('user_preferences', JSON.stringify(syncResult.preferences));
            console.log('💾 Synced preferences saved to local storage');
          }
        } else {
          const errorText = await response.text();
          console.error('❌ Sync response error:', response.status, errorText);
          throw new Error(`Sync failed: ${response.status} - ${errorText}`);
        }
      } catch (syncError) {
        console.log('❌ Server sync failed, using local preferences:', syncError.message);
      }

      if (syncResult && syncResult.preferences) {
        // Update extension enabled state from synced preferences
        setExtensionEnabled(syncResult.preferences.extensionEnabled !== false);

        // Update last sync time
        const now = new Date();
        setLastSyncTime(now);
        setSyncStatus('Synced');

        console.log('✅ Extension settings synced successfully');
        console.log('📱 Synced preferences:', {
          extensionEnabled: syncResult.preferences.extensionEnabled,
          language: syncResult.preferences.language,
          sensitivity: syncResult.preferences.sensitivity,
          whitelistTerms: syncResult.preferences.whitelistTerms?.length || 0,
          whitelistSites: syncResult.preferences.whitelistSite?.length || 0,
          flagStyle: syncResult.preferences.flagStyle,
          isHighlighted: syncResult.preferences.isHighlighted,
          color: syncResult.preferences.color
        });
      } else {
        // Fallback to getting preferences directly
        const preferences = await getPreferences();
        setExtensionEnabled(preferences.extensionEnabled !== false);

        const now = new Date();
        setLastSyncTime(now);
        setSyncStatus('Synced (local)');
      }
    } catch (error) {
      console.error('❌ Extension sync failed:', error);
      setSyncStatus('Sync failed');
      setTimeout(() => setSyncStatus('Not synced'), 3000);
    } finally {
      setIsSyncing(false);
    }
  }, [user]);

  // Auto-sync when tab is focused
  useFocusEffect(
    useCallback(() => {
      console.log('📱 Extension tab focused - triggering auto-sync');
      syncExtensionSettingsLocal();
    }, [syncExtensionSettingsLocal])
  );

  const toggleExtensionLocal = async () => {
    const newState = !extensionEnabled;
    setExtensionEnabled(newState);

    try {
      console.log('🔄 Attempting to toggle extension to:', newState);

      const token = await AsyncStorage.getItem('token');
      if (!token) {
        console.log('❌ No authentication token found, using fallback');
        throw new Error('No authentication token found');
      }

      console.log('🔑 Token found, making server request...');

      // Try to update extension state on server first
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      const response = await fetch('https://murai-server.onrender.com/api/users/extension-toggle', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ enabled: newState }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      console.log('📡 Server response status:', response.status);
      console.log('📡 Server response headers:', response.headers);

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Extension state updated on server:', result);

        // Update local storage with the server response
        if (result.preferences) {
          await AsyncStorage.setItem('user_preferences', JSON.stringify(result.preferences));
          console.log('💾 Local preferences updated');
        }
        return; // Success, exit early
      } else {
        const errorText = await response.text();
        console.error('❌ Server response error:', response.status, errorText);
        throw new Error(`Server update failed: ${response.status} - ${errorText}`);
      }
    } catch (error) {
      console.error('❌ Failed to update extension state on server:', error.message);

      // Fallback to updating preferences directly
      try {
        console.log('🔄 Attempting fallback to local preferences...');
        const currentPrefs = await getPreferences();
        await updatePreferences({
          ...currentPrefs,
          extensionEnabled: newState
        });
        console.log('✅ Extension state updated via fallback:', newState);
      } catch (fallbackError) {
        console.error('❌ Fallback also failed:', fallbackError);
        // Revert the state if both methods failed
        setExtensionEnabled(!newState);
        console.log('🔄 Reverted extension state due to complete failure');
      }
    }
  };

  // Helper function to format time
  const formatTime = (minutes) => {
    if (!minutes || minutes < 0) {
      return '0m';
    }
    if (minutes < 60) {
      return `${minutes}m`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  };

  // Helper function to format last sync time
  const formatLastSync = (syncTime) => {
    if (!syncTime) return 'Not synced';

    try {
      const now = new Date();
      const diffMs = now - syncTime;
      const diffMinutes = Math.floor(diffMs / (1000 * 60));

      if (diffMinutes < 1) return 'Just now';
      if (diffMinutes < 60) return `${diffMinutes}m ago`;

      const diffHours = Math.floor(diffMinutes / 60);
      if (diffHours < 24) return `${diffHours}h ago`;

      const diffDays = Math.floor(diffHours / 24);
      return `${diffDays}d ago`;
    } catch (error) {
      return 'Not synced';
    }
  };

  // Interpolate rotation for the outer ring
  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg']
  });

  return (
    <View style={styles.container}>
      <MainHeader 
        title="Extension Control"
        subtitle="Manage your protection settings"
        rightActions={[
          {
            icon: isSyncing ? 'sync' : 'refresh',
            color: isSyncing ? '#3b82f6' : '#02B97F',
            onPress: syncExtensionSettingsLocal,
            disabled: isSyncing
          },
          {
            icon: 'cog',
            color: '#02B97F',
            onPress: () => setSettingsVisible(true)
          }
        ]}
      />

    

      {/* Enhanced Status Card */}
      <View style={styles.statusCard}>
        <View style={styles.statusHeader}>
          <View style={[
            styles.statusIndicator,
            { backgroundColor: extensionEnabled ? '#02B97F' : '#9CA3AF' }
          ]} />
          <Text style={[
            styles.statusTitle,
            { color: extensionEnabled ? '#02B97F' : '#9CA3AF' }
          ]}>
            {extensionEnabled ? 'PROTECTION ACTIVE' : 'PROTECTION INACTIVE'}
          </Text>
        </View>

        {/* Auto-Sync Status Indicator */}
        {isSyncing && (
          <View style={styles.syncIndicator}>
            <MaterialCommunityIcons
              name="sync"
              size={16}
              color="#3b82f6"
              style={{ transform: [{ rotate: '360deg' }] }}
            />
            <Text style={styles.syncIndicatorText}>Auto-syncing settings...</Text>
          </View>
        )}
      </View>

      {/* Enhanced Power Button */}
      <View style={styles.powerButtonContainer}>
        {/* Outer glow effect */}
        <Animated.View style={[
          styles.powerButtonGlow,
          {
            opacity: extensionEnabled ? glowAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0.1, 0.3]
            }) : 0,
            transform: [{ scale: pulseAnim }]
          }
        ]} />

        {/* Rotating outer ring */}
        <Animated.View style={[
          styles.powerButtonOuterRing,
          {
            opacity: extensionEnabled ? 0.2 : 0,
            transform: [{ scale: pulseAnim }, { rotate: spin }]
          }
        ]} />

        {/* Pulsing middle ring */}
        <Animated.View style={[
          styles.powerButtonRing,
          {
            opacity: extensionEnabled ? 0.15 : 0,
            transform: [{ scale: pulseAnim }]
          }
        ]} />

        {/* Inner glowing ring */}
        <Animated.View style={[
          styles.powerButtonInnerRing,
          {
            opacity: extensionEnabled ? glowAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0.2, 0.4]
            }) : 0,
            transform: [{ scale: pulseAnim }]
          }
        ]} />

        {/* Main button with enhanced styling */}
        <Animated.View style={{ 
          transform: [
            { scale: buttonScale },
            {
              translateX: shakeAnim.interpolate({
                inputRange: [-1, 0, 1],
                outputRange: [-3, 0, 3]
              })
            }
          ] 
        }}>
          <Pressable
            style={[
              styles.powerButton,
              extensionEnabled && styles.powerButtonActive,
              {
                backgroundColor: extensionEnabled ? '#02B97F' : '#1F2937',
                borderColor: extensionEnabled ? 'rgba(2, 185, 127, 0.7)' : 'rgba(107, 114, 128, 0.3)',
                shadowColor: extensionEnabled ? 'rgba(2, 185, 127, 0.4)' : '#000',
              }
            ]}
            onPress={toggleExtensionLocal}
            android_ripple={{
              color: extensionEnabled ? 'rgba(2, 185, 127, 0.2)' : 'rgba(107, 114, 128, 0.2)',
              borderless: true,
              radius: 55
            }}
          >
            <View style={[
              styles.powerButtonInner,
              {
                backgroundColor: extensionEnabled ? 'rgba(255, 255, 255, 0.15)' : 'rgba(31, 41, 55, 0.1)',
                borderWidth: extensionEnabled ? 1 : 0,
                borderColor: extensionEnabled ? 'rgba(255, 255, 255, 0.3)' : 'transparent'
              }
            ]}>
              <MaterialCommunityIcons
                name="power"
                size={42}
                color={extensionEnabled ? "#FFFFFF" : "#9CA3AF"}
              />
            </View>
          </Pressable>
        </Animated.View>
      </View>
      <Animated.Text style={[
        styles.powerButtonText,
        {
          color: extensionEnabled ? "#1f2937" : "#9CA3AF",
          opacity: buttonScale
        }
      ]}>
        {extensionEnabled ? 'Tap to disable protection' : 'Tap to enable protection'}
      </Animated.Text>

      {/* Enhanced Status Info Cards with Smooth Animation */}
      {extensionEnabled && (
        <Animated.View style={[
          styles.statusInfoContainer,
          {
            opacity: statusCardsAnim,
            transform: [
              {
                translateY: statusCardsAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [30, 0]
                })
              },
              {
                scale: statusCardsScale
              }
            ]
          }
        ]}>
          <Animated.View style={[
            styles.statusInfoCard,
            {
              borderColor: 'rgba(2, 185, 127, 0.2)',
              opacity: statusCardsAnim,
              transform: [{
                translateY: statusCardsAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [15, 0]
                })
              }]
            }
          ]}>
            <View style={styles.statusInfoHeader}>
              <MaterialCommunityIcons
                name={isSyncing ? "sync" : (lastSyncTime ? "sync" : "sync-off")}
                size={20}
                color={isSyncing ? "#3b82f6" : "#02B97F"}
                style={isSyncing ? { transform: [{ rotate: '360deg' }] } : {}}
              />
              <Text style={[
                styles.statusInfoTitle,
                { color: isSyncing ? "#3b82f6" : "#02B97F" }
              ]}>
                {isSyncing ? 'Syncing...' : 'Last Sync'}
              </Text>
            </View>
            <Text style={[
              styles.statusInfoValue,
              {
                color: isSyncing ? '#3b82f6' : (lastSyncTime ? '#1f2937' : '#ef4444'),
                fontSize: isSyncing ? 14 : (lastSyncTime ? 16 : 14)
              }
            ]}>
              {isSyncing ? syncStatus : formatLastSync(lastSyncTime)}
            </Text>
          </Animated.View>

          <Animated.View style={[
            styles.statusInfoCard,
            {
              borderColor: 'rgba(2, 185, 127, 0.2)',
              opacity: statusCardsAnim,
              transform: [{
                translateY: statusCardsAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [15, 0]
                })
              }]
            }
          ]}>
            <View style={styles.statusInfoHeader}>
              <MaterialCommunityIcons
                name="clock-outline"
                size={20}
                color="#02B97F"
              />
              <Text style={[
                styles.statusInfoTitle,
                { color: "#02B97F" }
              ]}>
                Active Time
              </Text>
            </View>
            <Text style={[
              styles.statusInfoValue,
              { color: '#1f2937' }
            ]}>
              {formatTime(activeTime)}
            </Text>
          </Animated.View>
        </Animated.View>
      )}
      {/* Settings Modal */}
      <Modal
        visible={settingsVisible}
        animationType="slide"
        onRequestClose={() => setSettingsVisible(false)}
      >
        <ExtensionSettings onClose={() => setSettingsVisible(false)} />
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF', // White background
    paddingHorizontal: 8,
    paddingTop: 0,
  },
  // Enhanced Status Card Styles
  statusCard: {
    backgroundColor: '#FFFFFF',
    marginTop: 24,
    marginBottom: 32,
    alignItems: 'center',
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#9CA3AF',
    marginRight: 12,
  },
  statusTitle: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    color: '#9CA3AF',
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  // Enhanced Status Info Container
  statusInfoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
    paddingHorizontal: 4,
  },
  statusInfoCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 6,
    borderWidth: 1,
    borderColor: 'rgba(107, 114, 128, 0.2)',
    shadowColor: 'transparent',
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  statusInfoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusInfoTitle: {
    fontSize: 12,
    fontFamily: 'Poppins-Medium',
    color: '#6B7280',
    marginLeft: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statusInfoValue: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    color: 'rgba(107, 114, 128, 0.9)',
  },
  // Enhanced Power Button Styles
  powerButtonContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
  powerButtonGlow: {
    position: 'absolute',
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: 'rgba(2, 185, 127, 0.15)',
  },
  powerButtonOuterRing: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    borderWidth: 1.5,
    borderColor: 'rgba(2, 185, 127, 0.4)',
    borderStyle: 'solid',
  },
  powerButtonRing: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(2, 185, 127, 0.1)',
  },
  powerButtonInnerRing: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(2, 185, 127, 0.15)',
  },
  powerButton: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: '#1F2937',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
    borderWidth: 2,
    borderColor: 'rgba(107, 114, 128, 0.3)',
  },
  powerButtonActive: {
    shadowOffset: {
      width: 0,
      height: 12,
    },
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 16,
    borderWidth: 3,
  },
  powerButtonInner: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
  powerButtonText: {
    textAlign: 'center',
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    color: 'rgba(107, 114, 128, 0.8)',
    marginTop: 28,
    marginBottom: 32,
    paddingHorizontal: 20,
  },

  // Sync indicator styles
  syncIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginTop: 12,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.2)',
  },
  syncIndicatorText: {
    fontSize: 12,
    fontFamily: 'Poppins-Medium',
    color: '#3b82f6',
    marginLeft: 6,
  },
});