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

  // Complex animation sequence
  React.useEffect(() => {
    if (extensionEnabled) {
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
    } else {
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
      ]).start();
    }
  }, [extensionEnabled]);

  const toggleExtension = () => {
    setExtensionEnabled(!extensionEnabled);
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
            color: 'rgba(1, 82, 55, 1)',
            onPress: () => setSettingsVisible(true)
          }
        ]}
      />

    

      <View style={styles.statusMessageContainer}>
        <View style={styles.statusMessageNoBox}>
          <Text style={[styles.statusMessageTitle, { color: extensionEnabled ? "rgba(1, 82, 55, 1)" : "#6B7280" }]}>Extension is {extensionEnabled ? 'Active' : 'Inactive'}</Text>
          <Text style={[styles.statusMessageSubtitle, { color: extensionEnabled ? "rgba(1, 82, 55, 1)" : "#6B7280" }]}>Protection {extensionEnabled ? 'enabled' : 'disabled'}</Text>
        </View>
      </View>

      {/* Power Button */}
      <View style={styles.powerButtonContainer}>
        {/* Rotating outer ring */}
        <Animated.View style={[
          styles.powerButtonOuterRing,
          { 
            opacity: extensionEnabled ? 0.15 : 0,
            transform: [{ scale: pulseAnim }, { rotate: spin }]
          }
        ]} />
        
        {/* Pulsing middle ring */}
        <Animated.View style={[
          styles.powerButtonRing,
          { 
            opacity: extensionEnabled ? 0.2 : 0,
            transform: [{ scale: pulseAnim }]
          }
        ]} />
        
        {/* Inner glowing ring */}
        <Animated.View style={[
          styles.powerButtonInnerRing,
          { 
            opacity: glowAnim,
            transform: [{ scale: pulseAnim }]
          }
        ]} />
        
        {/* Main button */}
        <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
          <Pressable
            style={[
              styles.powerButton,
              extensionEnabled && styles.powerButtonActive
            ]}
            onPress={toggleExtension}
          >
            <MaterialCommunityIcons 
              name="power" 
              size={40} 
              color={extensionEnabled ? "#01B97F" : "#6B7280"} 
            />
          </Pressable>
        </Animated.View>
      </View>
      <Text style={[styles.powerButtonText, { color: extensionEnabled ? "rgba(1, 82, 55, 1)" : "#6B7280" }]}>
        Tap to {extensionEnabled ? 'disable' : 'enable'} extension protection
      </Text>
 {/* Status Info Row */}
 <View style={styles.statusInfoRow}>
        <View style={styles.statusInfoItem}>
          <MaterialCommunityIcons name="sync" size={18} color="rgba(1, 82, 55, 1)" style={{ marginRight: 6 }} />
          <Text style={[styles.statusInfoLabel, { color: "#374151" }]}>Last Synced:</Text>
          <Text style={[styles.statusInfoValue, { color: "#374151" }]}>2m ago</Text>
        </View>
        <View style={styles.statusInfoDivider} />
        <View style={styles.statusInfoItem}>
          <MaterialCommunityIcons name="clock" size={18} color="rgba(1, 82, 55, 1)" style={{ marginRight: 6 }} />
          <Text style={[styles.statusInfoLabel, { color: "#374151" }]}>Active Time:</Text>
          <Text style={[styles.statusInfoValue, { color: "#374151" }]}>2h 15m</Text>
        </View>
      </View>
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
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
  },
  statusInfoRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 28,
    paddingHorizontal: 8,
  },
  statusInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
    borderRadius: 12,
    paddingVertical: 0,
    paddingHorizontal: 0,
    marginHorizontal: 8,
  },
  statusInfoDivider: {
    width: 1,
    height: 22,
    backgroundColor: '#e5e7eb',
    marginHorizontal: 12,
    borderRadius: 1,
  },
  statusInfoLabel: {
    fontSize: 13,
    fontFamily: 'Poppins-Medium',
    color: 'rgba(81, 7, 192, 0.7)',
    marginRight: 4,
  },
  statusInfoValue: {
    fontSize: 15,
    fontFamily: 'Poppins-Medium',
    color: 'rgba(81, 7, 192, 1)',
    marginLeft: 2,
  },
  statusMessageNoBox: {
    alignItems: 'center',
    marginBottom: 2,
  },
  statusMessageTitle: {
    fontSize: 16,
    fontFamily: 'Poppins-Medium',
    marginBottom: 2,
  },
  statusMessageSubtitle: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: 'rgba(81, 7, 192, 0.7)',
  },
  statusMessageContainer: {
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#f3f4f6',
    alignItems: 'center',
  },
  powerButtonContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  powerButtonOuterRing: {
    position: 'absolute',
    width: 280,
    height: 280,
    borderRadius: 140,
    borderWidth: 30,
    borderColor: 'rgba(1, 185, 127, 0.25)',
    borderStyle: 'dashed',
  },
  powerButtonRing: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(1, 185, 127, 0.15)',
  },
  powerButtonInnerRing: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(1, 185, 127, 0.25)',
  },
  powerButton: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: 'rgba(1, 185, 127, 0.25)',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 4,
    borderColor: 'rgba(1, 185, 127, 0.15)',
  },
  powerButtonActive: {
    backgroundColor: '#FFFFFF',
    borderColor: '#01B97F',
  },
  powerButtonText: {
    textAlign: 'center',
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: 'rgba(81, 7, 192, 1)',
    marginTop: 24,
    marginBottom: 40,
  },
}); 