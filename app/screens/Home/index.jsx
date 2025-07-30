import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import React from 'react';
import {
  Animated,
  Dimensions,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import LoadingDots from '../../components/common/LoadingDots';
import NotificationDetailModal from '../../components/notifications/NotificationDetailModal';
import { useAccessibility } from '../../context/AccessibilityContext';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const { width } = Dimensions.get('window');

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

function HomeScreen({ navigation }) {
  const { user } = useAuth(); // Get user from auth context
  const { getAccessibleTextStyle, getAccessibleTouchableStyle } = useAccessibility();
  const [loading, setLoading] = React.useState(true);
  const [stats, setStats] = React.useState(null);
  const [chartData, setChartData] = React.useState(null);
  const [recentActivity, setRecentActivity] = React.useState([]);
  const [error, setError] = React.useState('');
  const [notifications, setNotifications] = React.useState([]);
  const [notifModalVisible, setNotifModalVisible] = React.useState(false);
  const [notifLoading, setNotifLoading] = React.useState(false);
  const [selectedNotification, setSelectedNotification] = React.useState(null);
  const [notifDetailModalVisible, setNotifDetailModalVisible] = React.useState(false);
  const [markingAllAsRead, setMarkingAllAsRead] = React.useState(false);
  const [homeStats, setHomeStats] = React.useState({
    overall: { threatsBlocked: 0, sitesMonitored: 0, averageAccuracy: 0 },
    today: { inappropriateWordsFlagged: 0 }
  });
  const [protectionStatus, setProtectionStatus] = React.useState({
    isActive: true,
    isLoading: true
  });

  // Sync-related state
  const [lastSyncTime, setLastSyncTime] = React.useState(null);
  const [isSyncing, setIsSyncing] = React.useState(false);
  const [syncStatus, setSyncStatus] = React.useState('Not synced');

  const timeRange = 'today';
  const unreadCount = Array.isArray(notifications) ? notifications.filter(n => !n.isRead).length : 0;

  // Animation values
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const slideAnim = React.useRef(new Animated.Value(50)).current;
  const scaleAnim = React.useRef(new Animated.Value(0.8)).current;
  const loadingAnim = React.useRef(new Animated.Value(0)).current;

  // Quick action animations
  const quickAction1Anim = React.useRef(new Animated.Value(0)).current;
  const quickAction2Anim = React.useRef(new Animated.Value(0)).current;
  const quickAction3Anim = React.useRef(new Animated.Value(0)).current;
  const quickAction4Anim = React.useRef(new Animated.Value(0)).current;

  // Initialize animations
  const startAnimations = React.useCallback(() => {
    // Only start animations when data is loaded
    if (loading) return;

    // Reset animations first
    fadeAnim.setValue(0);
    slideAnim.setValue(50);
    scaleAnim.setValue(0.8);
    quickAction1Anim.setValue(0);
    quickAction2Anim.setValue(0);
    quickAction3Anim.setValue(0);
    quickAction4Anim.setValue(0);

    // Start main content animations with a small delay
    setTimeout(() => {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 550,
          useNativeDriver: true,
        }),
      ]).start();

      // Staggered quick action animations
      setTimeout(() => {
        Animated.stagger(150, [
          Animated.timing(quickAction1Anim, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(quickAction2Anim, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(quickAction3Anim, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(quickAction4Anim, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
        ]).start();
      }, 300);
    }, 200);
  }, [fadeAnim, slideAnim, scaleAnim, quickAction1Anim, quickAction2Anim, quickAction3Anim, quickAction4Anim, loading]);

  // Get user's first name for greeting
  const getUserFirstName = () => {
    if (!user?.name) return 'User';
    return user.name.split(' ')[0];
  };

  const formatNotificationTime = (dateString) => {
    if (!dateString) return 'Just now';
    
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Just now';
    
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;

    return date.toLocaleDateString();
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

  const fetchNotifications = async () => {
    setNotifLoading(true);
    try {
      const res = await api.get('/notifications');
      // The API returns { notifications: [...], pagination: {...}, unreadCount: ... }
      // So we need to access res.data.notifications
      const notificationsData = res.data?.notifications || res.data;
      setNotifications(Array.isArray(notificationsData) ? notificationsData : []);
    } catch (_err) {
      // Set empty array on error
      setNotifications([]);
    } finally {
      setNotifLoading(false);
    }
  };

  const openNotifModal = async () => {
    await fetchNotifications();
    setNotifModalVisible(true);
  };

  const markAsRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      // Update the notifications state to mark as read
      setNotifications((prev) => Array.isArray(prev) ? prev.map(n => n._id === id ? { ...n, isRead: true } : n) : []);
    } catch (_err) {}
  };

  const openNotificationDetail = async (notification) => {
    setSelectedNotification(notification);
    setNotifDetailModalVisible(true);
    setNotifModalVisible(false); // Close the list modal

    // Automatically mark as read when opened (if not already read)
    if (!notification.isRead) {
      await markAsRead(notification._id);
    }
  };

  const closeNotificationDetail = () => {
    setNotifDetailModalVisible(false);
    setSelectedNotification(null);
  };

  const markAllAsRead = async () => {
    if (markingAllAsRead) return; // Prevent multiple calls

    setMarkingAllAsRead(true);
    try {
      const unreadNotifications = Array.isArray(notifications) ? notifications.filter(n => !n.isRead) : [];

      // Mark all unread notifications as read on the server
      await Promise.all(
        unreadNotifications.map(notification =>
          api.put(`/notifications/${notification._id}/read`)
        )
      );

      // Update local state to mark all as read
      setNotifications(prev => Array.isArray(prev) ? prev.map(n => ({ ...n, isRead: true })) : []);
    } catch (_err) {
      console.error('Failed to mark all notifications as read');
    } finally {
      setMarkingAllAsRead(false);
    }
  };

  const fetchProtectionStatus = React.useCallback(async () => {
    try {
      const response = await api.get('/users/extension-status');
      setProtectionStatus({
        isActive: response.data.extensionEnabled,
        isLoading: false
      });
    } catch (err) {
      console.error('Failed to fetch protection status:', err);
      setProtectionStatus({
        isActive: true, // Default to active on error
        isLoading: false
      });
    }
  }, []);

  // Sync protection status and preferences
  const syncProtectionStatus = React.useCallback(async () => {
    if (!user) return;

    setIsSyncing(true);
    setSyncStatus('Syncing...');

    try {
      console.log('🔄 Auto-syncing protection status...');

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
        // Update protection status from synced preferences
        setProtectionStatus({
          isActive: syncResult.preferences.extensionEnabled !== false,
          isLoading: false
        });

        // Update last sync time
        const now = new Date();
        setLastSyncTime(now);
        setSyncStatus('Synced');

        console.log('✅ Protection status synced successfully');
        console.log('📱 Synced preferences:', {
          extensionEnabled: syncResult.preferences.extensionEnabled,
          language: syncResult.preferences.language,
          sensitivity: syncResult.preferences.sensitivity,
          whitelistTerms: syncResult.preferences.whitelistTerms?.length || 0,
          whitelistSites: syncResult.preferences.whitelistSite?.length || 0,
          flagStyle: syncResult.preferences.flagStyle,
          color: syncResult.preferences.color
        });
      } else {
        // Fallback to getting protection status directly
        await fetchProtectionStatus();

        const now = new Date();
        setLastSyncTime(now);
        setSyncStatus('Synced (local)');
      }
    } catch (error) {
      console.error('❌ Protection sync failed:', error);
      setSyncStatus('Sync failed');
      setTimeout(() => setSyncStatus('Not synced'), 3000);
    } finally {
      setIsSyncing(false);
    }
  }, [user, fetchProtectionStatus]);

  // Auto-sync when tab is focused
  useFocusEffect(
    React.useCallback(() => {
      console.log('📱 Home tab focused - triggering auto-sync');
      syncProtectionStatus();
    }, [syncProtectionStatus])
  );

  const toggleProtection = async () => {
    try {
      const newStatus = !protectionStatus.isActive;
      await api.put('/users/extension-toggle', { enabled: newStatus });
      
      setProtectionStatus(prev => ({
        ...prev,
        isActive: newStatus
      }));
    } catch (err) {
      console.error('Failed to toggle protection:', err);
    }
  };

  const fetchHomeStats = React.useCallback(async () => {
    try {
      const response = await api.get('/api/home-stats');
      if (response.data.success) {
        setHomeStats(response.data.data);
      }
    } catch (err) {
      console.error('Home Stats API Error:', err);
    }
  }, []);

  const fetchData = React.useCallback(async (selectedTimeRange = timeRange) => {
    setLoading(true);
    setError('');
    try {
      // Fetch home stats, dashboard data, and protection status in parallel
      const [statsRes, chartRes, activityRes] = await Promise.all([
        api.get(`/user-dashboard/overview?timeRange=${selectedTimeRange}`),
        api.get(`/user-dashboard/activity-chart?timeRange=${selectedTimeRange}`),
        api.get(`/user-dashboard/user-activity?timeRange=${selectedTimeRange}`),
        fetchHomeStats(), // Fetch real home stats
        fetchProtectionStatus() // Fetch protection status
      ]);
      setStats(statsRes.data);
      setChartData(chartRes.data);
      setRecentActivity(activityRes.data.recentActivity || []);
    } catch (err) {
      console.error('Dashboard API Error:', err);
      setError('Failed to load dashboard data. Please check server connection.');
    } finally {
      setLoading(false);
    }
  }, [timeRange, fetchHomeStats, fetchProtectionStatus]);

  React.useEffect(() => {
    fetchData();
  }, [fetchData]);

  React.useEffect(() => {
    if (loading) {
      // Show loading state immediately
      Animated.timing(loadingAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      // Data is loaded, start main animations
      startAnimations();
    }
  }, [loading, startAnimations, loadingAnim]);

  // Prepare chart data for LineChart
  const preparedChartData = chartData ? {
    labels: chartData.labels || ['', '', '', '', '', '', ''],
    datasets: [
      {
        data: chartData.datasets?.[0]?.data || [0, 0, 0, 0, 0, 0, 0],
        strokeWidth: 3,
        color: () => '#01B97F',
        fillShadowGradient: 'rgba(1, 185, 127, 1)',
        fillShadowGradientOpacity: 0.7,
      },
    ],
  } : {
    labels: ['', '', '', '', '', '', ''],
    datasets: [
      {
        data: [0, 0, 0, 0, 0, 0, 0],
        strokeWidth: 3,
        color: () => '#01B97F',
        fillShadowGradient: 'rgba(1, 185, 127, 0.3)',
        fillShadowGradientOpacity: 1,
      },
    ],
  };

  const chartConfig = {
    backgroundColor: 'transparent',
    backgroundGradientFrom: '#f8fafc',
    backgroundGradientTo: '#f8fafc',
    decimalPlaces: 0,
    color: () => '#01B97F',
    labelColor: (opacity = 1) => `rgba(156, 163, 175, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '0',
    },
    propsForBackgroundLines: {
      strokeWidth: 0,
    },
    withHorizontalLabels: false,
    withVerticalLabels: false,
    withInnerLines: false,
    withOuterLines: false,
  };

  // Get protection status colors and text
  const getProtectionStatusConfig = () => {
    if (protectionStatus.isLoading) {
      return {
        backgroundColor: '#f3f4f6',
        iconColor: '#9ca3af',
        title: 'Checking Protection Status...',
        subtitle: 'Verifying your digital safety settings',
        badgeText: '...',
        badgeColor: '#9ca3af'
      };
    }

    if (protectionStatus.isActive) {
      return {
        backgroundColor: '#02B97F',
        iconColor: '#ffffff',
        title: 'Protection Active',
        subtitle: 'Your digital safety is being monitored 24/7',
        badgeText: 'ON',
        badgeColor: '#ffffff'
      };
    } else {
      return {
        backgroundColor: '#6b7280',
        iconColor: '#ffffff',
        title: 'Protection Inactive',
        subtitle: 'Your digital safety is currently disabled',
        badgeText: 'OFF',
        badgeColor: '#ffffff'
      };
    }
  };

  const protectionConfig = getProtectionStatusConfig();

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header with Notification */}
      <Animated.View
        style={[
          styles.topHeader,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }
        ]}
      >
        <View style={styles.header}>
          <View style={styles.greetingContainer}>
            <Text style={getAccessibleTextStyle(styles.greeting)}>Hello {getUserFirstName()}</Text>
            <View style={styles.waveContainer}>
              <Text style={getAccessibleTextStyle(styles.waveEmoji)}>👋</Text>
            </View>
          </View>
          <Text style={getAccessibleTextStyle(styles.subtitle)}>Here&apos;s your digital safety overview</Text>
        </View>
        <TouchableOpacity
          style={getAccessibleTouchableStyle(styles.notificationButton)}
          onPress={openNotifModal}
          accessibilityLabel={`Notifications. ${unreadCount > 0 ? `${unreadCount} unread` : 'No unread notifications'}`}
        >
          <MaterialCommunityIcons name="bell-outline" size={24} color="#02B97F" />
          {unreadCount > 0 && (
            <View style={styles.notifBadge}>
              <Text style={styles.notifBadgeText}>{unreadCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </Animated.View>

      {/* Loading State */}
      {loading && (
        <View style={styles.loadingContainer}>
          <LoadingDots
            text="Loading your security overview"
            dotColor="#02B97F"
            textColor="#6b7280"
            size={10}
            textSize={16}
          />
        </View>
      )}

      {/* Hero Protection Status Card */}
      {!loading && stats && (
        <Animated.View
          style={[
            styles.heroCard,
            {
              opacity: loadingAnim,
              transform: [{ scale: scaleAnim }]
            }
          ]}
        >
          <View style={[styles.heroBackground, { backgroundColor: protectionConfig.backgroundColor }]}>
            <View style={styles.heroContent}>
              <View style={styles.heroIconContainer}>
                <MaterialCommunityIcons 
                  name={protectionStatus.isActive ? "shield-check" : "shield-alert"} 
                  size={40} 
                  color={protectionConfig.iconColor} 
                />
              </View>
              <View style={styles.heroTextContainer}>
                <Text style={getAccessibleTextStyle(styles.heroTitle)}>{protectionConfig.title}</Text>
                <Text style={getAccessibleTextStyle(styles.heroSubtitle)}>{protectionConfig.subtitle}</Text>
              </View>
            </View>
            <View style={styles.heroStats}>
              <View style={styles.heroStatItem}>
                <Text style={getAccessibleTextStyle(styles.heroStatNumber)}>
                  {loading ? '...' : (homeStats.overall?.threatsBlocked || 0)}
                </Text>
                <Text style={getAccessibleTextStyle(styles.heroStatLabel)}>Threats Blocked</Text>
              </View>
              <View style={styles.heroStatDivider} />
              <View style={styles.heroStatItem}>
                <Text style={getAccessibleTextStyle(styles.heroStatNumber)}>
                  {loading ? '...' : (homeStats.overall?.sitesMonitored || 0)}
                </Text>
                <Text style={getAccessibleTextStyle(styles.heroStatLabel)}>Sites Monitored</Text>
              </View>
            </View>

            {/* Sync Status Indicator */}
            {isSyncing && (
              <View style={styles.syncIndicator}>
                <MaterialCommunityIcons
                  name="sync"
                  size={16}
                  color="#ffffff"
                  style={{ transform: [{ rotate: '360deg' }] }}
                />
                <Text style={getAccessibleTextStyle(styles.syncIndicatorText)}>Auto-syncing settings...</Text>
              </View>
            )}

            {/* Protection Toggle Button */}
            <TouchableOpacity
              style={getAccessibleTouchableStyle([styles.protectionToggleButton, { backgroundColor: 'rgba(255, 255, 255, 0.2)' }])}
              onPress={toggleProtection}
              disabled={protectionStatus.isLoading}
              accessibilityLabel={protectionStatus.isActive ? 'Disable Protection' : 'Enable Protection'}
              accessibilityState={{ disabled: protectionStatus.isLoading }}
            >
              <MaterialCommunityIcons
                name={protectionStatus.isActive ? "power-off" : "power"}
                size={20}
                color="#ffffff"
              />
              <Text style={getAccessibleTextStyle(styles.protectionToggleText)}>
                {protectionStatus.isActive ? 'Disable Protection' : 'Enable Protection'}
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      )}

      {/* Notification Modal */}
      <Modal
        visible={notifModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setNotifModalVisible(false)}
      >
        <View style={styles.notifModalOverlay}>
          <View style={styles.notifModalContent}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <Text style={getAccessibleTextStyle({ fontSize: 18, fontWeight: 'bold', color: '#374151' })}>Notifications</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                {unreadCount > 0 && (
                  <TouchableOpacity
                    onPress={markAllAsRead}
                    disabled={markingAllAsRead}
                    style={{
                      paddingHorizontal: 12,
                      paddingVertical: 6,
                      backgroundColor: markingAllAsRead ? 'rgba(2, 185, 127, 0.05)' : 'rgba(2, 185, 127, 0.1)',
                      borderRadius: 16,
                      borderWidth: 1,
                      borderColor: markingAllAsRead ? 'rgba(2, 185, 127, 0.1)' : 'rgba(2, 185, 127, 0.2)',
                      opacity: markingAllAsRead ? 0.6 : 1
                    }}
                  >
                    <Text style={{
                      fontSize: 12,
                      fontWeight: '600',
                      color: markingAllAsRead ? 'rgba(2, 185, 127, 0.6)' : '#02B97F'
                    }}>
                      {markingAllAsRead ? 'Marking...' : 'Mark All Read'}
                    </Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity onPress={() => setNotifModalVisible(false)}>
                  <MaterialCommunityIcons name="close" size={24} color="#02B97F" />
                </TouchableOpacity>
              </View>
            </View>
            {notifLoading ? (
              <Text style={{ textAlign: 'center', color: '#6b7280' }}>Loading...</Text>
            ) : !Array.isArray(notifications) || notifications.length === 0 ? (
              <Text style={{ textAlign: 'center', color: '#6b7280' }}>No notifications</Text>
            ) : (
              <ScrollView style={{ maxHeight: 350 }} showsVerticalScrollIndicator={false}>
                {(Array.isArray(notifications) ? notifications : []).slice(0, 10).map((item) => (
                  <TouchableOpacity
                    key={item._id}
                    style={[styles.notifItem, !item.isRead && styles.notifItemUnread]}
                    onPress={() => openNotificationDetail(item)}
                  >
                    <View style={styles.notifIconWrap}>
                      <MaterialCommunityIcons
                        name={
                          item.type === 'alert' ? 'alert-circle' :
                          item.type === 'warning' ? 'alert' :
                          item.type === 'success' ? 'check-circle' :
                          'information'
                        }
                        size={22}
                        color={
                          item.type === 'alert' ? '#ef4444' :
                          item.type === 'warning' ? '#f59e0b' :
                          item.type === 'success' ? '#02B97F' :
                          '#02B97F'
                        }
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.notifTitle}>{item.title || 'Notification'}</Text>
                      <Text style={styles.notifMessage}>{item.message || 'No message'}</Text>
                      <Text style={styles.notifTime}>{formatNotificationTime(item.createdAt)}</Text>
                    </View>
                    <View style={{ alignItems: 'center', justifyContent: 'center', paddingLeft: 8 }}>
                      <MaterialCommunityIcons
                        name="chevron-right"
                        size={20}
                        color="rgba(2, 185, 127, 0.4)"
                      />
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

      {/* Notification Detail Modal */}
      <NotificationDetailModal
        visible={notifDetailModalVisible}
        notification={selectedNotification}
        onClose={closeNotificationDetail}
        onMarkAsRead={markAsRead}
      />

      {/* Stats Card */}
      {!loading && (
        <Animated.View
          style={[
            styles.statsCardContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
        <View style={styles.statsCard}>
          <View style={styles.statsHeader}>
            <View style={styles.statsLeft}>
              <Text style={styles.statsNumber}>
                {loading ? '...' : (homeStats.today?.inappropriateWordsFlagged || 0)}
              </Text>
              <Text style={styles.statsLabel}>
                {loading ? 'Loading data...' : 'inappropriate words\nwere flagged today'}
              </Text>
            </View>
            <View style={styles.statsRight}>
              <Text style={[styles.percentage, { color: '#01B97F' }]}>
                {loading ? '...' : `+${homeStats.today?.inappropriateWordsFlagged || 0} ↗`}
              </Text>
            </View>
          </View>
          {/* Chart */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <LineChart
              data={preparedChartData}
              width={Math.max((preparedChartData.labels.length * 60), width - 80)}
              height={80}
              chartConfig={chartConfig}
              bezier
              style={styles.chart}
              withDots={false}
              withShadow={false}
              withFill={true}
            />
          </ScrollView>
        </View>
        <TouchableOpacity
          style={styles.viewDetailedButton}
          onPress={() => navigation.navigate('Dashboard')}
        >
          <Text style={styles.viewDetailedText}>View Detailed →</Text>
        </TouchableOpacity>
      </Animated.View>
      )}

      {/* Quick Actions Section */}
      {!loading && (
        <Animated.View
          style={[
            styles.quickActionsSection,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <Text style={styles.sectionSubtitle}>Manage your digital safety</Text>
        </View>
        <View style={styles.quickActionsGrid}>
          <AnimatedTouchableOpacity
            style={[
              styles.quickActionCard,
              {
                opacity: quickAction1Anim,
                transform: [{
                  translateY: quickAction1Anim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [30, 0]
                  })
                }]
              }
            ]}
            onPress={() => navigation.navigate('Group')}
          >
            <View style={[
              styles.quickActionIconBg, 
              { 
                backgroundColor: protectionStatus.isActive ? '#e8f5f0' : '#fef2f2',
                opacity: protectionStatus.isActive ? 1 : 0.6
              }
            ]}>
              <MaterialCommunityIcons 
                name="account-group" 
                size={28} 
                color={protectionStatus.isActive ? "#02B97F" : "#6b7280"} 
              />
            </View>
            <Text style={[
              styles.quickActionTitle,
              { color: protectionStatus.isActive ? '#1f2937' : '#9ca3af' }
            ]}>Groups</Text>
            <Text style={[
              styles.quickActionSubtitle,
              { color: protectionStatus.isActive ? '#6b7280' : '#9ca3af' }
            ]}>Manage safety groups</Text>
          </AnimatedTouchableOpacity>

          <AnimatedTouchableOpacity
            style={[
              styles.quickActionCard,
              {
                opacity: quickAction2Anim,
                transform: [{
                  translateY: quickAction2Anim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [30, 0]
                  })
                }]
              }
            ]}
            onPress={() => navigation.navigate('Dashboard')}
          >
            <View style={[
              styles.quickActionIconBg, 
              { 
                backgroundColor: protectionStatus.isActive ? '#e8f5f0' : '#fef2f2',
                opacity: protectionStatus.isActive ? 1 : 0.6
              }
            ]}>
              <MaterialCommunityIcons 
                name="chart-line" 
                size={28} 
                color={protectionStatus.isActive ? "#02B97F" : "#6b7280"} 
              />
            </View>
            <Text style={[
              styles.quickActionTitle,
              { color: protectionStatus.isActive ? '#1f2937' : '#9ca3af' }
            ]}>Analytics</Text>
            <Text style={[
              styles.quickActionSubtitle,
              { color: protectionStatus.isActive ? '#6b7280' : '#9ca3af' }
            ]}>View detailed reports</Text>
          </AnimatedTouchableOpacity>

          <AnimatedTouchableOpacity
            style={[
              styles.quickActionCard,
              {
                opacity: quickAction3Anim,
                transform: [{
                  translateY: quickAction3Anim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [30, 0]
                  })
                }]
              }
            ]}
            onPress={() => navigation.navigate('Profile')}
          >
            <View style={[
              styles.quickActionIconBg, 
              { 
                backgroundColor: protectionStatus.isActive ? '#e8f5f0' : '#fef2f2',
                opacity: protectionStatus.isActive ? 1 : 0.6
              }
            ]}>
              <MaterialCommunityIcons 
                name="cog" 
                size={28} 
                color={protectionStatus.isActive ? "#02B97F" : "#6b7280"} 
              />
            </View>
            <Text style={[
              styles.quickActionTitle,
              { color: protectionStatus.isActive ? '#1f2937' : '#9ca3af' }
            ]}>Settings</Text>
            <Text style={[
              styles.quickActionSubtitle,
              { color: protectionStatus.isActive ? '#6b7280' : '#9ca3af' }
            ]}>Configure preferences</Text>
          </AnimatedTouchableOpacity>

          <AnimatedTouchableOpacity
            style={[
              styles.quickActionCard,
              {
                opacity: quickAction4Anim,
                transform: [{
                  translateY: quickAction4Anim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [30, 0]
                  })
                }]
              }
            ]}
            onPress={() => navigation.navigate('Extension')}
          >
            <View style={[
              styles.quickActionIconBg, 
              { 
                backgroundColor: protectionStatus.isActive ? '#e8f5f0' : '#fef2f2',
                opacity: protectionStatus.isActive ? 1 : 0.6
              }
            ]}>
              <MaterialCommunityIcons 
                name="puzzle" 
                size={28} 
                color={protectionStatus.isActive ? "#02B97F" : "#6b7280"} 
              />
            </View>
            <Text style={[
              styles.quickActionTitle,
              { color: protectionStatus.isActive ? '#1f2937' : '#9ca3af' }
            ]}>Extension</Text>
            <Text style={[
              styles.quickActionSubtitle,
              { color: protectionStatus.isActive ? '#6b7280' : '#9ca3af' }
            ]}>Configure extension</Text>
          </AnimatedTouchableOpacity>
        </View>
      </Animated.View>
      )}

      {/* Recent Activity */}
      {!loading && (
        <Animated.View
          style={[
            styles.recentActivity,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
        <View style={styles.recentActivityHeader}>
          <View>
            <Text style={styles.recentActivityTitle}>Recent Activity</Text>
            <Text style={styles.recentActivityCount}>
              {loading ? 'Loading...' : `${recentActivity.length} items`}
            </Text>
          </View>
          <TouchableOpacity style={styles.viewAllButton}>
            <Text style={styles.viewAllText}>View All</Text>
            <MaterialCommunityIcons name="chevron-right" size={20} color="#02B97F" />
          </TouchableOpacity>
        </View>
          
          {/* Activity List Container */}
          <View style={styles.activityListContainer}>
          {loading ? (
              <View style={styles.emptyStateContainer}>
                <LoadingDots
                  text="Loading activities"
                  dotColor="#02B97F"
                  textColor="#9ca3af"
                  size={8}
                  textSize={14}
                />
              </View>
          ) : error ? (
              <View style={styles.emptyStateContainer}>
                <MaterialCommunityIcons name="alert-circle-outline" size={24} color="#ef4444" />
            <Text style={styles.emptyStateText}>{error}</Text>
              </View>
          ) : recentActivity.length === 0 ? (
              <View style={styles.emptyStateContainer}>
                <MaterialCommunityIcons name="clock-outline" size={24} color="#9ca3af" />
            <Text style={styles.emptyStateText}>No recent activity</Text>
                <Text style={styles.emptyStateSubtext}>Your activity will appear here</Text>
              </View>
          ) : (
            <View style={styles.activityList}>
              {recentActivity.slice(0, 5).map((item, idx) => (
                  <TouchableOpacity 
                    key={item.id ? String(item.id) : String(idx)} 
                    style={[
                      styles.activityItem,
                      idx === recentActivity.slice(0, 5).length - 1 && { borderBottomWidth: 0 }
                    ]}
                    activeOpacity={0.7}
                  >
                    <View style={[
                      styles.activityIcon, 
                      { 
                        backgroundColor: protectionStatus.isActive ? '#f3f4f6' : '#fef2f2',
                        opacity: protectionStatus.isActive ? 1 : 0.6
                      }
                    ]}>
                    <MaterialCommunityIcons
                      name={
                        item.type === 'flagged' ? 'alert-circle-outline' :
                        item.type === 'group_join' ? 'account-plus-outline' :
                        item.type === 'group_leave' ? 'account-minus-outline' :
                        item.type === 'login' ? 'login' :
                        item.type === 'logout' ? 'logout' :
                        item.type === 'update' ? 'cog-outline' :
                        item.type === 'report' ? 'file-document-outline' :
                        item.type === 'visit' ? 'web' :
                        'information-outline'
                      }
                      size={20}
                      color={
                        item.type === 'flagged' ? 'rgba(239, 68, 68, 1)' :
                        item.type === 'group_join' ? 'rgba(34, 197, 94, 1)' :
                        item.type === 'group_leave' ? 'rgba(245, 158, 11, 1)' :
                        item.type === 'login' ? 'rgba(59, 130, 246, 1)' :
                        item.type === 'logout' ? 'rgba(107, 114, 128, 1)' :
                        item.type === 'update' ? 'rgba(139, 92, 246, 1)' :
                        item.type === 'report' ? 'rgba(239, 68, 68, 1)' :
                        item.type === 'visit' ? 'rgba(16, 185, 129, 1)' :
                        'rgba(1, 82, 55, 1)'
                      }
                    />
                  </View>
                  <View style={styles.activityContent}>
                    <View style={styles.activityTopLine}>
                        <Text style={[
                          styles.activityText,
                          { color: protectionStatus.isActive ? '#1f2937' : '#9ca3af' }
                        ]}>
                          {item.details || item.type || 'Activity'}
                        </Text>
                      <Text style={styles.activityTime}>
                        {item.timestamp ? new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                      </Text>
                    </View>
                      <Text style={[
                        styles.activityDetails,
                        { color: protectionStatus.isActive ? '#6b7280' : '#9ca3af' }
                      ]}>
                      {item.user ? `By ${item.user}` : 'System'}
                    </Text>
                  </View>
                  </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </Animated.View>
      )}

      <View style={styles.bottomSpacing} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    paddingHorizontal: 20,
    paddingTop: 50,
  },
  topHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 30,
  },
  header: {
    flex: 1,
  },
  greetingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  greeting: {
    fontSize: 32,
    fontFamily: 'Poppins-Bold',
    color: '#1f2937',
    marginRight: 8,
  },
  waveContainer: {
    backgroundColor: '#fff7ed',
    borderRadius: 20,
    padding: 6,
  },
  waveEmoji: {
    fontSize: 20,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    color: '#6b7280',
    lineHeight: 22,
  },
  notificationButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 5,
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 6,
  },
  notifBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#ef4444',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  notifBadgeText: {
    color: '#ffffff',
    fontSize: 12,
    fontFamily: 'Poppins-SemiBold',
  },
  notifModalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  notifModalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 20,
    width: '90%',
    maxWidth: 400,
    maxHeight: '80%',
  },
  notifItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  notifItemUnread: {
    backgroundColor: '#f8fafc',
  },
  notifIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  notifTitle: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    color: '#1f2937',
    marginBottom: 4,
  },
  notifMessage: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#6b7280',
    marginBottom: 4,
  },
  notifTime: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: '#9ca3af',
  },
  statsCardContainer: {
    position: 'relative',
    marginBottom: 40,
    paddingBottom: 20,
  },
  statsCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 20,
    padding: 25,
    marginBottom: 10,
  },
  statsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  statsLeft: {
    flex: 1,
  },
  statsNumber: {
    fontSize: 48,
    fontFamily: 'Poppins-Bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  statsLabel: {
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    color: '#6b7280',
    lineHeight: 22,
  },
  statsRight: {
    alignItems: 'flex-end',
  },
  percentage: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    color: 'rgba(81, 7, 192, 1)',
  },
  chartContainer: {
    alignItems: 'center',
    marginVertical: 15,
    height: 80,
  },
  chart: {
    marginVertical: 0,
    paddingRight: 0,
  },
  viewDetailedButton: {
    position: 'absolute',
    bottom: 0,
    right: 20,
    backgroundColor: '#222020ff',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  viewDetailedText: {
    color: '#ffffff',
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
  },
  quickActionsContainer: {
    flexDirection: 'row',
    borderRadius: 16,
    padding: 20,
    marginBottom: 40,
    marginHorizontal: 5,
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e4e4e4ff',
  },
  quickActionButton: {
    flex: 1,
    alignItems: 'center',
  },
  quickActionIconBg: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#E8F5F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: 'transparent',
    elevation: 0,
  },
  quickActionText: {
    fontSize: 11,
    color: '#374151',
    fontFamily: 'Poppins-SemiBold',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  actionDivider: {
    width: 1,
    height: '60%',
    backgroundColor: '#e5e7eb',
    marginHorizontal: 16,
  },
  recentActivity: {
    marginBottom: 40,
  },
  recentActivityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  recentActivityTitle: {
    fontSize: 20,
    fontFamily: 'Poppins-Bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  recentActivityCount: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#6b7280',
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5F0',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  viewAllText: {
    fontSize: 14,
    color: '#02B97F',
    fontFamily: 'Poppins-SemiBold',
    marginRight: 4,
  },
  emptyStateContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#f3f4f6',
  },
  emptyStateText: {
    fontSize: 16,
    color: '#9ca3af',
    textAlign: 'center',
    marginTop: 12,
    fontFamily: 'Poppins-Medium',
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
    marginTop: 4,
    fontFamily: 'Poppins-Regular',
  },
  activityListContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    overflow: 'hidden',
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#f3f4f6',
  },
  activityList: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    overflow: 'hidden',
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
    backgroundColor: '#ffffff',
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  activityContent: {
    flex: 1,
  },
  activityTopLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  activityText: {
    fontSize: 14,
    fontFamily: 'Poppins-SemiBold',
    color: '#1f2937',
  },
  activityTime: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: '#6b7280',
  },
  activityDetails: {
    fontSize: 13,
    fontFamily: 'Poppins-Regular',
    color: '#6b7280',
  },
  timeFilterContainer: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 6,
    marginBottom: 25,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 6,
  },
  timeFilterButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  timeFilterButtonActive: {
    backgroundColor: '#02B97F',
    shadowColor: '#02B97F',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  timeFilterText: {
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    color: '#6b7280',
  },
  timeFilterTextActive: {
    color: '#ffffff',
    fontFamily: 'Poppins-SemiBold',
  },
  // Hero Card Styles
  heroCard: {
    marginBottom: 25,
  },
  heroBackground: {
    backgroundColor: '#02B97F',
    borderRadius: 20,
    padding: 24,
  },
  heroContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  heroIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  heroTextContainer: {
    flex: 1,
  },
  heroTitle: {
    fontSize: 16,
    fontFamily: 'Poppins-Bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  heroSubtitle: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: 'rgba(255, 255, 255, 0.9)',
  },
  heroBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  heroBadgeText: {
    fontSize: 16,
    fontFamily: 'Poppins-Bold',
    color: '#ffffff',
  },
  heroStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  heroStatItem: {
    alignItems: 'center',
    flex: 1,
  },
  heroStatNumber: {
    fontSize: 24,
    fontFamily: 'Poppins-Bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  heroStatLabel: {
    fontSize: 12,
    fontFamily: 'Poppins-Medium',
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },
  heroStatDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    marginHorizontal: 20,
  },
  // Section Styles
  sectionHeader: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontFamily: 'Poppins-Bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#6b7280',
  },
  // Quick Actions Styles
  quickActionsSection: {
    marginBottom: 30,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 16,
  },
  quickActionCard: {
    width: '47%',
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#f3f4f6',
  },
  quickActionTitle: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    color: '#1f2937',
    marginBottom: 4,
    textAlign: 'center',
  },
  quickActionSubtitle: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: '#6b7280',
    textAlign: 'center',
  },
  // Loading State Styles
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
    paddingHorizontal: 20,
  },

  protectionToggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    marginTop: 16,
    gap: 8,
  },
  protectionToggleText: {
    fontSize: 14,
    fontFamily: 'Poppins-SemiBold',
    color: '#ffffff',
  },
  syncIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 15,
  },
  syncIndicatorText: {
    fontSize: 12,
    fontFamily: 'Poppins-Medium',
    color: '#ffffff',
    marginLeft: 8,
  },
  bottomSpacing: {
    height: 100, // Adjust as needed for spacing at the bottom
  },
});

export default HomeScreen;