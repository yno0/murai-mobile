import { Feather } from "@expo/vector-icons";
import React, { useEffect, useRef, useState } from "react";
import {
    Animated,
    Dimensions,
    PanResponder,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native";
import { useAuth } from "../../context/AuthContext";

const BG = "#0f0f0f";
const CARD_BG = "#1a1a1a";
const ACCENT = "#34d399";
const TEXT_MAIN = "#fff";
const TEXT_SECONDARY = "#a0a0a0";
const CIRCLE_OUTER = "rgba(52,211,153,0.12)";
const CIRCLE_INNER = "rgba(52,211,153,0.22)";
const GRAY_OUTER = "rgba(120,120,120,0.12)";
const GRAY_INNER = "rgba(120,120,120,0.22)";
const GRAY_BTN = "#444";
const WIDTH = Dimensions.get('window').width;

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('window');
const CONTAINER_HEIGHT = 400;
const BOTTOM_NAV_HEIGHT = 60;
const HANDLE_HEIGHT = 24; // Height for handle area
const GREETING_HEIGHT = 140; // Increased from 100 to give more space
const STATUS_HEIGHT = 70;  // Height for status section
const STATS_HEIGHT = 100;  // Height for stats section
const TIP_HEIGHT = 80;     // Height for tip section

// Calculate available height for the power button section
const AVAILABLE_VERTICAL_SPACE = SCREEN_HEIGHT - GREETING_HEIGHT - CONTAINER_HEIGHT - BOTTOM_NAV_HEIGHT;
// Make button even larger, using 95% of available space
const POWER_BUTTON_SIZE = Math.min(520, AVAILABLE_VERTICAL_SPACE * 0.95); // Increased from 420
const INNER_CIRCLE_SIZE = POWER_BUTTON_SIZE * 0.85; // Increased from 0.8 for better proportion
const BUTTON_SIZE = POWER_BUTTON_SIZE * 0.65; // Increased from 0.6 for better proportion
const SNAP_POINTS = {
  TOP: 0,
  BOTTOM: CONTAINER_HEIGHT
};

// Add mock data for recent sites
const recentSites = [
  { id: '1', url: 'github.com/microsoft/vscode', time: '2h ago' },
  { id: '2', url: 'react-native.dev/docs', time: '3h ago' },
  { id: '3', url: 'developer.mozilla.org', time: '5h ago' },
];

// Add mock data for stats
const stats = {
  activeTime: '5h 23m',
  sitesProtected: 42,
  lastCheck: '2 min ago'
};

export default function Dashboard() {
  const { user } = useAuth();
  // Mock data
  const [extensionEnabled, setExtensionEnabled] = useState(true);
  const analytics = {
    detectedText: 12,
    detectedSites: 5,
    flaggedWords: 8,
  };

  // Animation values
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const translateY = useRef(new Animated.Value(CONTAINER_HEIGHT)).current;
  const lastGesture = useRef(CONTAINER_HEIGHT);
  const isAnimating = useRef(false);

  // Animation setup for pulse
  useEffect(() => {
    const pulsing = Animated.sequence([
      Animated.timing(pulseAnim, {
        toValue: 1.05,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(pulseAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
    ]);

    Animated.loop(pulsing).start();
  }, []);

  // Refined arrow rotation with smoother transition
  const arrowRotation = translateY.interpolate({
    inputRange: [0, CONTAINER_HEIGHT / 2, CONTAINER_HEIGHT],
    outputRange: ['180deg', '90deg', '0deg'],
    extrapolate: 'clamp'
  });

  // Add opacity animation for smoother transition
  const arrowOpacity = translateY.interpolate({
    inputRange: [0, CONTAINER_HEIGHT / 2, CONTAINER_HEIGHT],
    outputRange: [0.8, 0.4, 0.8],
    extrapolate: 'clamp'
  });

  // Container visibility
  const containerOpacity = translateY.interpolate({
    inputRange: [0, CONTAINER_HEIGHT / 2],
    outputRange: [1, 0],
    extrapolate: 'clamp'
  });

  const snapToPosition = (position) => {
    Animated.spring(translateY, {
      toValue: position,
      tension: 65,
      friction: 10,
      useNativeDriver: true,
    }).start(() => {
      lastGesture.current = position;
    });
  };

  const handlerpeGesture = (gestureState) => {
    const { dy, vy } = gestureState;
    
    // If velocity is high enough, snap based on direction
    if (Math.abs(vy) > 0.5) {
      snapToPosition(vy > 0 ? CONTAINER_HEIGHT : 0);
      return;
    }

    // Otherwise snap based on distance moved
    if (Math.abs(dy) > CONTAINER_HEIGHT / 3) {
      snapToPosition(dy > 0 ? CONTAINER_HEIGHT : 0);
    } else {
      // Snap back to previous position if movement wasn't significant
      snapToPosition(lastGesture.current);
    }
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        // Only respond to vertical gestures
        return Math.abs(gestureState.dy) > Math.abs(gestureState.dx);
      },
      onPanResponderGrant: () => {
        translateY.setOffset(lastGesture.current);
        translateY.setValue(0);
      },
      onPanResponderMove: (_, { dy }) => {
        const newValue = dy;
        // Constrain movement between 0 and CONTAINER_HEIGHT
        if (newValue >= 0 && newValue <= CONTAINER_HEIGHT) {
          translateY.setValue(newValue);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        translateY.flattenOffset();
        handlerpeGesture(gestureState);
      },
      onPanResponderTerminate: (_, gestureState) => {
        translateY.flattenOffset();
        handlerpeGesture(gestureState);
      },
    })
  ).current;

  const handleUpPress = () => {
    if (isAnimating.current) return;
    isAnimating.current = true;

    const toValue = lastGesture.current === CONTAINER_HEIGHT ? 0 : CONTAINER_HEIGHT;
    
    Animated.spring(translateY, {
      toValue,
      tension: 68,
      friction: 12,
      useNativeDriver: true,
    }).start(() => {
      lastGesture.current = toValue;
      isAnimating.current = false;
    });
  };

  // Colors for power button and circles based on state
  const outerCircleColor = extensionEnabled ? CIRCLE_OUTER : GRAY_OUTER;
  const innerCircleColor = extensionEnabled ? CIRCLE_INNER : GRAY_INNER;
  const powerBtnColor = extensionEnabled ? ACCENT : GRAY_BTN;
  const powerIconColor = TEXT_MAIN;

  // Handle power button press with animation
  const handlePowerPress = () => {
    Animated.sequence([
      Animated.timing(pulseAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(pulseAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    setExtensionEnabled(prev => !prev);
  };

  // Get time of day for greeting
  const getTimeOfDay = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'morning';
    if (hour < 17) return 'afternoon';
    return 'evening';
  };

  // Get greeting message
  const getGreeting = () => {
    const timeOfDay = getTimeOfDay();
    return `Good ${timeOfDay}`;
  };

  return (
    <View style={styles.container}>
      <View style={styles.mainContent}>
        {/* Top Bar */}
        <View style={styles.topBar}>
          <View style={styles.topBarLeft}>
            <Feather name="shield" size={18} color={extensionEnabled ? ACCENT : TEXT_SECONDARY} />
            <Text style={styles.topBarText}>{extensionEnabled ? 'Protection Active' : 'Protection Off'}</Text>
          </View>
          <TouchableOpacity style={styles.topBarButton}>
            <Feather name="bell" size={18} color={TEXT_SECONDARY} />
          </TouchableOpacity>
        </View>

        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Greeting Section */}
          <View style={styles.greetingContainer}>
            <Text style={styles.timeGreeting}>{getGreeting()}</Text>
            <Text style={styles.userName}>{user?.name || 'User'}</Text>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{stats.activeTime}</Text>
                <Text style={styles.statLabel}>Active Time</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{stats.sitesProtected}</Text>
                <Text style={styles.statLabel}>Sites Protected</Text>
              </View>
            </View>
          </View>

          <View style={styles.contentWrapper}>
            {/* Status Section */}
            <View style={styles.statusContainer}>
              <View style={styles.statusRow}>
                <View style={[styles.statusDot, { backgroundColor: extensionEnabled ? ACCENT : GRAY_BTN }]} />
                <Text style={styles.statusText}>
                  {extensionEnabled ? 'Protection Active' : 'Protection Inactive'}
                </Text>
              </View>
              <Text style={styles.lastCheckText}>Last check: {stats.lastCheck}</Text>
            </View>

            {/* Power Button Section */}
            <View style={styles.powerSection}>
              <TouchableOpacity
                onPress={handlePowerPress}
                style={styles.powerButtonWrapper}
              >
                <Animated.View
                  style={[
                    styles.outerCircle,
                    { backgroundColor: outerCircleColor, transform: [{ scale: pulseAnim }] },
                  ]}
                />
                <View style={[styles.innerCircle, { backgroundColor: innerCircleColor }]} />
                <View style={[styles.powerButton, { backgroundColor: powerBtnColor }]}>
                  <Feather name="power" size={BUTTON_SIZE * 0.5} color={powerIconColor} />
          </View>
          </TouchableOpacity>
        </View>           
                </View>
        </ScrollView>

        {/* Swipe Handle (always visible, except when container is open) */}
        <Animated.View
          style={[
            styles.handleContainer,
            {
              opacity: translateY.interpolate({
                inputRange: [0, CONTAINER_HEIGHT * 0.5, CONTAINER_HEIGHT],
                outputRange: [0, 0.5, 1],
                extrapolate: 'clamp',
              }),
              pointerEvents: translateY.__getValue() === 0 ? 'none' : 'auto',
            },
          ]}
          {...panResponder.panHandlers}
        >
          <View style={styles.handleWrapper}>
            <View style={styles.handleBar} />
          </View>
        </Animated.View>

        {/* Unified Container */}
        <Animated.View
          style={[
            styles.unifiedContainer,
            {
              opacity: containerOpacity,
              transform: [{ translateY: translateY }]
            }
          ]}
        >
          {/* Swipe Down Handle at Top of Container */}
          <View style={styles.handleTopContainer} {...panResponder.panHandlers}>
            <View style={styles.handleBar} />
              </View>
          <ScrollView 
            style={styles.containerContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Quick Actions Section with Handle */}
            <View style={styles.section}>
              
              <Text style={styles.sectionTitle}>Quick Actions</Text>
              <View style={styles.quickActionsGrid}>
                <TouchableOpacity style={styles.actionButton}>
                  <View style={styles.actionIcon}>
                    <Feather name="users" size={20} color={ACCENT} />
              </View>
                  <Text style={styles.actionText}>Create Group</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionButton}>
                  <View style={styles.actionIcon}>
                    <Feather name="user-plus" size={20} color={ACCENT} />
                    </View>
                  <Text style={styles.actionText}>Invite Member</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionButton}>
                  <View style={styles.actionIcon}>
                    <Feather name="settings" size={20} color={ACCENT} />
                  </View>
                  <Text style={styles.actionText}>Configure</Text>
                </TouchableOpacity>
              </View>
              </View>

            <View style={styles.divider} />

            {/* Key Metrics Section */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Key Metrics</Text>
              </View>
              <View style={styles.metricsGrid}>
                <View style={styles.metricItem}>
                  <Text style={styles.metricValue}>{analytics.detectedText}</Text>
                  <Text style={styles.metricLabel}>Detected Text</Text>
              </View>
                <View style={styles.metricItem}>
                  <Text style={styles.metricValue}>{analytics.detectedSites}</Text>
                  <Text style={styles.metricLabel}>Sites</Text>
                </View>
                <View style={styles.metricItem}>
                  <Text style={styles.metricValue}>{analytics.flaggedWords}</Text>
                  <Text style={styles.metricLabel}>Flagged</Text>
                </View>
              </View>
            </View>

            <View style={styles.divider} />

            {/* Recent Sites Section */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Recent Sites</Text>
                <TouchableOpacity style={styles.viewAllButton}>
                  <Text style={styles.viewAllText}>View All</Text>
                  <Feather name="chevron-right" size={14} color={TEXT_SECONDARY} />
                </TouchableOpacity>
              </View>
              <View style={styles.recentSitesList}>
                {recentSites.map(site => (
                  <View key={site.id} style={styles.recentSiteItem}>
                    <View style={styles.recentSiteIcon}>
                      <Feather name="globe" size={16} color={ACCENT} />
                    </View>
                    <View style={styles.recentSiteInfo}>
                      <Text style={styles.recentSiteUrl}>{site.url}</Text>
                      <Text style={styles.recentSiteTime}>{site.time}</Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          </ScrollView>
        </Animated.View>
        </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BG,
  },
  mainContent: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  contentWrapper: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: 'flex-start', // Changed from center to start from top
    paddingTop: 10, // Add small padding at top
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: BG,
  },
  topBarLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  topBarText: {
    color: TEXT_SECONDARY,
    fontSize: 14,
    marginLeft: 8,
    fontWeight: '500',
  },
  topBarButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  greetingContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20, // Reduced from 30
  },
  timeGreeting: {
    fontSize: 15,
    color: TEXT_SECONDARY,
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  userName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: TEXT_MAIN,
    letterSpacing: 0.5,
    marginBottom: 24,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: CARD_BG,
    borderRadius: 16,
    padding: 16,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    color: TEXT_MAIN,
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    color: TEXT_SECONDARY,
    fontSize: 13,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginHorizontal: 16,
  },
  handleContainer: {
    position: 'absolute',
    bottom: BOTTOM_NAV_HEIGHT + 4,
    left: 0,
    right: 0,
    height: HANDLE_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100,
  },
  handleWrapper: {
    width: 32,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(26,26,26,0.8)',
    borderRadius: 12,
    paddingTop: 1,
  },
  unifiedContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: CONTAINER_HEIGHT,
    backgroundColor: CARD_BG,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingTop: 12,
    zIndex: 90,
  },
  containerContent: {
    flex: 1,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingVertical: 8, // Add more touch area for swipe
  },
  headerHandle: {
    position: 'absolute',
    top: 0,
    left: '50%',
    width: 36,
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 2,
    marginLeft: -18, // Center the handle
  },
  sectionTitle: {
    color: TEXT_MAIN,
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 4,
  },
  actionButton: {
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 8,
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(52,211,153,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  actionText: {
    color: TEXT_MAIN,
    fontSize: 13,
    textAlign: 'center',
  },
  metricsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 4,
  },
  metricItem: {
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 8,
    backgroundColor: 'rgba(26,26,26,0.6)',
    borderRadius: 12,
    padding: 12,
  },
  metricValue: {
    color: TEXT_MAIN,
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  metricLabel: {
    color: TEXT_SECONDARY,
    fontSize: 13,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginVertical: 16,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewAllText: {
    color: TEXT_SECONDARY,
    fontSize: 14,
    marginRight: 4,
  },
  recentSitesList: {
    marginTop: 8,
  },
  recentSiteItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  recentSiteIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(52,211,153,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  recentSiteInfo: {
    flex: 1,
  },
  recentSiteUrl: {
    color: TEXT_MAIN,
    fontSize: 14,
    marginBottom: 2,
  },
  recentSiteTime: {
    color: TEXT_SECONDARY,
    fontSize: 12,
  },
  toggleHandle: {
    width: '100%',
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  handleBar: {
    width: 36,
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 2,
  },
  handleTopContainer: {
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  statusContainer: {
    height: STATUS_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40, // Increased from 30 to add more space
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  statusText: {
    color: TEXT_MAIN,
    fontSize: 16,
    fontWeight: 'bold',
  },
  lastCheckText: {
    color: TEXT_SECONDARY,
    fontSize: 13,
  },
  powerSection: {
    height: POWER_BUTTON_SIZE + 20,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    marginTop: 20, // Changed from -40 to positive margin to move down
    paddingBottom: 40, // Added padding at bottom
  },
  powerButtonWrapper: {
    width: POWER_BUTTON_SIZE,
    height: POWER_BUTTON_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  outerCircle: {
    position: 'absolute',
    width: POWER_BUTTON_SIZE,
    height: POWER_BUTTON_SIZE,
    borderRadius: POWER_BUTTON_SIZE / 2,
  },
  innerCircle: {
    position: 'absolute',
    width: INNER_CIRCLE_SIZE,
    height: INNER_CIRCLE_SIZE,
    borderRadius: INNER_CIRCLE_SIZE / 2,
  },
  powerButton: {
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
    borderRadius: BUTTON_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4, // Add subtle elevation for depth
    shadowColor: ACCENT,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  statsContainer: {
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  statIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(52,211,153,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  statTextContainer: {
    flex: 1,
  },
});
