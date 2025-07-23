import React from 'react';
import {
    Dimensions,
    FlatList,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { BORDER_RADIUS, COLORS, FONT, SPACING } from '../../../constants/theme';
import api from '../../../services/api'; // Adjusted path

const { width } = Dimensions.get('window');

function AdminHomeScreen({ navigation }) {
  const [loading, setLoading] = React.useState(true);
  const [stats, setStats] = React.useState(null);
  const [chartData, setChartData] = React.useState(null);
  const [recentActivity, setRecentActivity] = React.useState([]);
  const [error, setError] = React.useState('');
  const [notifications, setNotifications] = React.useState([]); // Admin notifications
  const [notifModalVisible, setNotifModalVisible] = React.useState(false);
  const [notifLoading, setNotifLoading] = React.useState(false);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const fetchNotifications = async () => {
    setNotifLoading(true);
    try {
      // Use the regular notifications endpoint
      const res = await api.get('/notifications');
      setNotifications(res.data);
    } catch (err) {
      console.error("Failed to fetch admin notifications:", err);
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
      setNotifications((prev) => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
    } catch (err) {
      console.error("Failed to mark admin notification as read:", err);
    }
  };

  React.useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError('');
      try {
        // Fetch dashboard data using working endpoints
        const [statsRes, chartRes, activityRes] = await Promise.all([
          api.get('/dashboard/overview?timeRange=today'),
          api.get('/dashboard/activity-chart?timeRange=last 7 days'),
          api.get('/dashboard/user-activity?timeRange=last 7 days'),
        ]);
        setStats(statsRes.data);
        setChartData(chartRes.data);
        setRecentActivity(activityRes.data.recentActivity || []);
      } catch (err) {
        console.error("Failed to load admin dashboard data:", err);
        setError('Failed to load admin dashboard data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Prepare chart data for LineChart
  const preparedChartData = chartData ? {
    labels: chartData.labels || ['', '', '', '', '', '', ''],
    datasets: [
      {
        data: chartData.datasets?.[0]?.data || [0, 0, 0, 0, 0, 0, 0],
        strokeWidth: 3,
        color: (opacity = 1) => `rgba(16, 185, 129, ${opacity})`, // Using COLORS.SUCCESS
      },
    ],
  } : {
    labels: ['', '', '', '', '', '', ''],
    datasets: [
      {
        data: [0, 0, 0, 0, 0, 0, 0],
        strokeWidth: 3,
        color: (opacity = 1) => `rgba(16, 185, 129, ${opacity})`, // Using COLORS.SUCCESS
      },
    ],
  };

  const chartConfig = {
    backgroundColor: 'transparent',
    backgroundGradientFrom: COLORS.BG,
    backgroundGradientTo: COLORS.BG,
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(16, 185, 129, ${opacity})`, // Using COLORS.SUCCESS
    labelColor: (opacity = 1) => `rgba(107, 114, 128, ${opacity})`, // Using COLORS.TEXT_SECONDARY
    style: {
      borderRadius: BORDER_RADIUS.lg,
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

  // KPI data from API response
  const kpiData = {
    totalUsers: { value: '2,450', change: '+12%' }, // Static for now since not in API
    harmfulContent: { value: stats?.harmfulContentDetected?.value || '...', change: stats?.harmfulContentDetected?.change || '...' },
    websitesMonitored: { value: stats?.websitesMonitored?.value || '...', change: stats?.websitesMonitored?.change || '...' },
    protectionEffectiveness: { value: stats?.protectionEffectiveness?.value || '...', change: stats?.protectionEffectiveness?.change || '...', statusColor: COLORS.SUCCESS },
  };

  const criticalEvents = [
    { id: '1', type: 'alert', message: 'High volume of profanity detected in Group A', time: '5 mins ago', icon: 'alert-circle', color: COLORS.ERROR },
    { id: '2', type: 'warning', message: 'User authentication service experiencing delays', time: '30 mins ago', icon: 'alert', color: COLORS.WARNING },
    { id: '3', type: 'info', message: 'New software update deployed successfully', time: '1 hour ago', icon: 'information', color: COLORS.SUCCESS },
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header with Notification */}
      <View style={styles.topHeader}>
        <View style={styles.header}>
          <Text style={styles.greeting}>Hello Admin,</Text>
          <Text style={styles.subtitle}>Here&apos;s a quick overview of the system.</Text>
        </View>
        <TouchableOpacity style={styles.notificationButton} onPress={openNotifModal}>
          <MaterialCommunityIcons name="bell-outline" size={24} color="#A8AAB0" />
          {unreadCount > 0 && (
            <View style={styles.notifBadge}>
              <Text style={styles.notifBadgeText}>{unreadCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

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
              <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#1D1D1F' }}>Admin Notifications</Text>
              <TouchableOpacity onPress={() => setNotifModalVisible(false)}>
                <MaterialCommunityIcons name="close" size={24} color="#1D1D1F" />
              </TouchableOpacity>
            </View>
            {notifLoading ? (
              <Text style={{ textAlign: 'center', color: '#6b7280' }}>Loading...</Text>
            ) : notifications.length === 0 ? (
              <Text style={{ textAlign: 'center', color: '#6C6C6C' }}>No admin notifications</Text>
            ) : (
              <FlatList
                data={notifications}
                keyExtractor={item => item._id}
                style={{ maxHeight: 350 }}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[styles.notifItem, !item.isRead && styles.notifItemUnread]}
                    onPress={() => { markAsRead(item._id); }}
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
                          item.type === 'warning' ? '#f59e42' :
                          item.type === 'success' ? '#01B97F' :
                          '#01B97F'
                        }
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.notifTitle}>{item.title}</Text>
                      <Text style={styles.notifMessage}>{item.message}</Text>
                      <Text style={styles.notifTime}>{new Date(item.createdAt).toLocaleString()}</Text>
                    </View>
                  </TouchableOpacity>
                )}
              />
            )}
          </View>
        </View>
      </Modal>

      {/* KPI Section */}
      <View style={styles.kpiContainer}>
        <View style={styles.kpiCard}>
          <Text style={styles.kpiValue}>{kpiData.totalUsers.value}</Text>
          <Text style={styles.kpiLabel}>Total Users</Text>
          <Text style={styles.kpiChange}>{kpiData.totalUsers.change}</Text>
        </View>
        <View style={styles.kpiCard}>
          <Text style={styles.kpiValue}>{kpiData.harmfulContent.value}</Text>
          <Text style={styles.kpiLabel}>Harmful Content Detected</Text>
          <Text style={styles.kpiChange}>{kpiData.harmfulContent.change}</Text>
        </View>
        <View style={styles.kpiCard}>
          <Text style={styles.kpiValue}>{kpiData.websitesMonitored.value}</Text>
          <Text style={styles.kpiLabel}>Websites Monitored</Text>
          <Text style={styles.kpiChange}>{kpiData.websitesMonitored.change}</Text>
        </View>
        <View style={[styles.kpiCard, { backgroundColor: kpiData.protectionEffectiveness.statusColor + '10', borderColor: kpiData.protectionEffectiveness.statusColor + '30' }]}>
          <Text style={[styles.kpiValue, { color: kpiData.protectionEffectiveness.statusColor }]}>{kpiData.protectionEffectiveness.value}</Text>
          <Text style={styles.kpiLabel}>Protection Effectiveness</Text>
          <Text style={styles.kpiChange}>{kpiData.protectionEffectiveness.change}</Text>
        </View>
      </View>

      {/* System Overview Chart */}
      <View style={styles.chartContainer}>
        <View style={styles.chartHeader}>
          <Text style={styles.chartTitle}>System Activity Trend</Text>
        </View>
        <LineChart
          data={preparedChartData}
          width={width - 40}
          height={180}
          chartConfig={chartConfig}
          bezier
          style={styles.chart}
          withDots={false}
          withShadow={false}
          withFill={true}
        />
        <View style={styles.chartLegend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#01B97F' }]} />
            <Text style={styles.legendText}>New Users</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#A8AAB0' }]} />
            <Text style={styles.legendText}>Flagged Events</Text>
          </View>
        </View>
      </View>

      {/* Critical Events / System Alerts */}
      <View style={styles.recentActivity}>
        <View style={styles.recentActivityHeader}>
          <View>
            <Text style={styles.recentActivityTitle}>Critical Events</Text>
            <Text style={styles.recentActivityCount}>{criticalEvents.length} recent events</Text>
          </View>
          <TouchableOpacity style={styles.viewAllButton} onPress={() => navigation.navigate('AdminReports')}>
            <Text style={styles.viewAllText}>View All</Text>
            <MaterialCommunityIcons name="chevron-right" size={20} color="#01B97F" />
          </TouchableOpacity>
        </View>
        <View style={{ maxHeight: 320 }}>
          {criticalEvents.length === 0 ? (
            <Text style={styles.emptyStateText}>No critical events</Text>
          ) : (
            <FlatList
              data={criticalEvents}
              keyExtractor={(item) => item.id}
              style={styles.activityList}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => (
                <View style={styles.activityItem}>
                  <View style={[styles.activityIcon, { backgroundColor: item.color + '10' }]}> 
                    <MaterialCommunityIcons 
                      name={item.icon}
                      size={20}
                      color={item.color}
                    />
                  </View>
                  <View style={styles.activityContent}>
                    <View style={styles.activityTopLine}>
                      <Text style={styles.activityText}>{item.message}</Text>
                      <Text style={styles.activityTime}>{item.time}</Text>
                    </View>
                    <Text style={styles.activityDetails}>{item.type.charAt(0).toUpperCase() + item.type.slice(1)}</Text>
                  </View>
                </View>
              )}
            />
          )}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BG,
    paddingHorizontal: SPACING.lg,
    paddingTop: 50,
  },
  topHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.xl,
  },
  header: {
    flex: 1,
  },
  greeting: {
    fontSize: FONT.xxxlarge,
    fontFamily: FONT.bold,
    color: COLORS.TEXT_MAIN,
    marginBottom: 5,
  },
  subtitle: {
    fontSize: FONT.regular,
    fontFamily: FONT.weightRegular,
    color: COLORS.TEXT_SECONDARY,
    lineHeight: 22,
  },
  notificationButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.PRIMARY_LIGHT,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 5,
    position: 'relative',
  },
  notifBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: COLORS.SUCCESS,
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  notifBadgeText: {
    color: COLORS.TEXT_WHITE,
    fontSize: FONT.xs,
    fontFamily: FONT.semibold,
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
    backgroundColor: '#F7F7F7', // Container light color
  },
  notifIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#F7F7F7', // Container light color
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  notifTitle: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    color: '#1D1D1F', // Font bold color
    marginBottom: 4,
  },
  notifMessage: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#6C6C6C', // Font subhead color
    marginBottom: 4,
  },
  notifTime: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: '#A8AAB0', // Icon inactive color
  },
  kpiContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  kpiCard: {
    width: '48%', // Roughly half width for two columns
    backgroundColor: '#F7F7F7', // Container light color
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#F7F7F7', // Container light color
  },
  kpiValue: {
    fontSize: 28,
    fontFamily: 'Poppins-Bold',
    color: '#1D1D1F', // Font bold color
    marginBottom: 5,
  },
  kpiLabel: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#6C6C6C', // Font subhead color
    marginBottom: 5,
  },
  kpiChange: {
    fontSize: 14,
    fontFamily: 'Poppins-SemiBold',
    color: '#01B97F', // Primary color
  },
  chartContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 30,
    borderWidth: 1,
    borderColor: '#F7F7F7', // Container light color
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  chartTitle: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    color: '#1D1D1F', // Font bold color
    marginBottom: 15,
  },
  chart: {
    marginVertical: 0,
    paddingRight: 0,
  },
  chartLegend: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 15,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  legendText: {
    fontSize: 12,
    fontFamily: 'Poppins-Medium',
    color: '#6C6C6C', // Font subhead color
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
    color: '#1D1D1F', // Font bold color
    marginBottom: 4,
  },
  recentActivityCount: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#6C6C6C', // Font subhead color
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F7F7F7', // Container light color
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  viewAllText: {
    fontSize: 14,
    color: '#01B97F', // Primary color
    fontFamily: 'Poppins-SemiBold',
    marginRight: 4,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#A8AAB0', // Icon inactive color
    textAlign: 'center',
    paddingVertical: 20,
  },
  activityList: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    overflow: 'hidden',
    marginTop: 10,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F7F7F7', // Container light color
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
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
    color: '#1D1D1F', // Font bold color
  },
  activityTime: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: '#6C6C6C', // Font subhead color
  },
  activityDetails: {
    fontSize: 13,
    fontFamily: 'Poppins-Regular',
    color: '#6C6C6C', // Font subhead color
  },
});

export default AdminHomeScreen;
