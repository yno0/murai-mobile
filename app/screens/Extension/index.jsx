import React, { useState } from 'react';
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
import ExtensionSettings from './ExtensionSettings';

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

  // Mock sync data - replace with real data from your service
  const [lastSyncTime, setLastSyncTime] = useState(null); // null means not synced
  const [activeTime, setActiveTime] = useState(0); // in minutes

  // Complex animation sequence
  React.useEffect(() => {
    if (extensionEnabled) {
      // Start tracking active time when enabled
      setActiveTime(0);
      setLastSyncTime(new Date()); // Set sync time when enabled

      // Button pop effect
      buttonScale.setValue(0.8);
      Animated.spring(buttonScale, {
        toValue: 1,
        friction: 4,
        tension: 120,
        useNativeDriver: true,
      }).start();

      // Pulse pop and settle into gentle pulse
      pulseAnim.setValue(0.7);
      Animated.sequence([
        Animated.spring(pulseAnim, {
          toValue: 1.2,
          friction: 3,
          tension: 120,
          useNativeDriver: true,
        }),
        Animated.spring(pulseAnim, {
          toValue: 1,
          friction: 4,
          tension: 80,
          useNativeDriver: true,
        })
      ]).start(() => {
        Animated.loop(
          Animated.sequence([
            Animated.timing(pulseAnim, {
              toValue: 1.15,
              duration: 1800,
              useNativeDriver: true,
            }),
            Animated.timing(pulseAnim, {
              toValue: 1,
              duration: 1800,
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
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0.5,
          duration: 400,
          useNativeDriver: true,
        })
      ]).start(() => {
        Animated.loop(
          Animated.sequence([
            Animated.timing(glowAnim, {
              toValue: 1,
              duration: 1500,
              useNativeDriver: true,
            }),
            Animated.timing(glowAnim, {
              toValue: 0.5,
              duration: 1500,
              useNativeDriver: true,
            }),
          ])
        ).start();
      });

      // Quick spin, then slow loop
      rotateAnim.setValue(0);
      Animated.sequence([
        Animated.timing(rotateAnim, {
          toValue: 0.5,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 7400,
          useNativeDriver: true,
        })
      ]).start(() => {
        rotateAnim.setValue(0);
        Animated.loop(
          Animated.timing(rotateAnim, {
            toValue: 1,
            duration: 8000,
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
        Animated.timing(buttonScale, {
          toValue: 1,
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

  const toggleExtension = () => {
    setExtensionEnabled(!extensionEnabled);
  };

  // Helper function to format time
  const formatTime = (minutes) => {
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

    const now = new Date();
    const diffMs = now - syncTime;
    const diffMinutes = Math.floor(diffMs / (1000 * 60));

    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;

    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours}h ago`;

    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
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
            { backgroundColor: extensionEnabled ? '#02B97F' : '#6B7280' }
          ]} />
          <Text style={[
            styles.statusTitle,
            { color: extensionEnabled ? '#02B97F' : '#6B7280' }
          ]}>
            {extensionEnabled ? 'PROTECTION ACTIVE' : 'PROTECTION INACTIVE'}
          </Text>
        </View>
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
        <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
          <Pressable
            style={[
              styles.powerButton,
              extensionEnabled && styles.powerButtonActive
            ]}
            onPress={toggleExtension}
            android_ripple={{
              color: extensionEnabled ? 'rgba(1, 185, 127, 0.3)' : 'rgba(107, 114, 128, 0.3)',
              borderless: true,
              radius: 60
            }}
          >
            <View style={[
              styles.powerButtonInner,
              { backgroundColor: extensionEnabled ? 'rgba(1, 185, 127, 0.1)' : 'rgba(107, 114, 128, 0.05)' }
            ]}>
              <MaterialCommunityIcons
                name="power"
                size={42}
                color={extensionEnabled ? "#02B97F" : "#6B7280"}
              />
            </View>
          </Pressable>
        </Animated.View>
      </View>
      <Animated.Text style={[
        styles.powerButtonText,
        {
          color: extensionEnabled ? "#1f2937" : "#6b7280",
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
                name={lastSyncTime ? "sync" : "sync-off"}
                size={20}
                color="#02B97F"
              />
              <Text style={[
                styles.statusInfoTitle,
                { color: "#02B97F" }
              ]}>
                Last Sync
              </Text>
            </View>
            <Text style={[
              styles.statusInfoValue,
              {
                color: lastSyncTime ? '#1f2937' : '#ef4444',
                fontSize: lastSyncTime ? 16 : 14
              }
            ]}>
              {formatLastSync(lastSyncTime)}
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
    paddingHorizontal: 20,
  },
  // Enhanced Status Card Styles
  statusCard: {
    backgroundColor: '#FFFFFF',
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
    backgroundColor: '#6B7280',
    marginRight: 12,
  },
  statusTitle: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    color: '#6B7280',
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
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
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
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: 'rgba(2, 185, 127, 0.1)',
  },
  powerButtonOuterRing: {
    position: 'absolute',
    width: 260,
    height: 260,
    borderRadius: 130,
    borderWidth: 2,
    borderColor: 'rgba(2, 185, 127, 0.3)',
    borderStyle: 'dashed',
  },
  powerButtonRing: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(2, 185, 127, 0.08)',
  },
  powerButtonInnerRing: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(2, 185, 127, 0.15)',
  },
  powerButton: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 12,
    borderWidth: 3,
    borderColor: 'rgba(107, 114, 128, 0.2)',
  },
  powerButtonActive: {
    backgroundColor: '#FFFFFF',
    borderColor: 'rgba(2, 185, 127, 0.4)',
    shadowColor: 'rgba(2, 185, 127, 0.3)',
  },
  powerButtonInner: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: 'rgba(107, 114, 128, 0.05)',
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
});