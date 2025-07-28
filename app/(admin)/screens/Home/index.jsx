import React from 'react';
import {
    ActivityIndicator,
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
import { BORDER_RADIUS, COLORS, SPACING } from '../../../constants/theme';
import api from '../../../services/api'; // Adjusted path

const { width } = Dimensions.get('window');

function AdminHomeScreen({ navigation }) {
  const [loading, setLoading] = React.useState(true);
  const [stats, setStats] = React.useState(null);
  const [chartData, setChartData] = React.useState(null);
  const [recentReports, setRecentReports] = React.useState([]);
  const [totalUsers, setTotalUsers] = React.useState(0);
  const [notifications, setNotifications] = React.useState([]); // Admin notifications
  const [notifModalVisible, setNotifModalVisible] = React.useState(false);
  const [notifLoading, setNotifLoading] = React.useState(false);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const fetchNotifications = async () => {
    setNotifLoading(true);
    try {
      // Use the regular notifications endpoint
      const res = await api.get('/notifications');
      // The API returns { notifications: [...], pagination: {...}, unreadCount: ... }
      const notificationsData = res.data?.notifications || res.data;
      setNotifications(Array.isArray(notificationsData) ? notificationsData : []);
    } catch (err) {
      console.error("Failed to fetch admin notifications:", err);
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
      setNotifications((prev) => Array.isArray(prev) ? prev.map(n => n._id === id ? { ...n, isRead: true } : n) : []);
    } catch (err) {
      console.error("Failed to mark admin notification as read:", err);
    }
  };

  React.useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch dashboard data using admin endpoints
        const [statsRes, chartRes, reportsRes, usersRes] = await Promise.all([
          api.get('/dashboard/overview?timeRange=today'),
          api.get('/dashboard/activity-chart?timeRange=today'),
          api.get('/admin/reports?limit=5&sortBy=createdAt&sortOrder=desc'),
          api.get('/admin/users?limit=1'), // Just to get total count
        ]);

        setStats(statsRes.data);
        setChartData(chartRes.data);
        setRecentReports(reportsRes.data.reports || []);
        setTotalUsers(usersRes.data.pagination?.totalUsers || 0);
      } catch (err) {
        console.error("Failed to load admin dashboard data:", err);
        // Set fallback data
        setStats({
          harmfulContentDetected: { value: '0', change: '+0%' },
          websitesMonitored: { value: '0', change: '+0' },
          protectionEffectiveness: { value: '95.0%', change: '+0%' }
        });
        setRecentReports([]);
        setTotalUsers(0);
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
    totalUsers: {
      value: loading ? '...' : totalUsers.toLocaleString(),
      change: loading ? '...' : `+${Math.floor(totalUsers * 0.05)}` // 5% growth estimate
    },
    harmfulContent: {
      value: loading ? '...' : (stats?.harmfulContentDetected?.value || '0'),
      change: loading ? '...' : (stats?.harmfulContentDetected?.change || '+0%')
    },
    websitesMonitored: {
      value: loading ? '...' : (stats?.websitesMonitored?.value || '0'),
      change: loading ? '...' : (stats?.websitesMonitored?.change || '+0')
    },
    protectionEffectiveness: {
      value: loading ? '...' : (stats?.protectionEffectiveness?.value || '95.0%'),
      change: loading ? '...' : (stats?.protectionEffectiveness?.change || '+0%'),
      statusColor: COLORS.SUCCESS
    },
  };

  // Format recent reports for display
  const formatRecentReports = (reports) => {
    return reports.slice(0, 5).map(report => ({
      id: report._id,
      type: report.status === 'pending' ? 'warning' : report.status === 'resolved' ? 'success' : 'info',
      message: `${report.type?.replace('_', ' ') || 'Report'}: ${report.reportedText?.substring(0, 60) || 'No content'}${report.reportedText?.length > 60 ? '...' : ''}`,
      time: getTimeAgo(new Date(report.createdAt)),
      icon: report.status === 'pending' ? 'clock' : report.status === 'resolved' ? 'check-circle' : 'info',
      color: report.status === 'pending' ? COLORS.WARNING : report.status === 'resolved' ? COLORS.SUCCESS : COLORS.PRIMARY,
      category: report.category || 'general'
    }));
  };

  // Helper function to get time ago
  const getTimeAgo = (date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes} min${diffInMinutes > 1 ? 's' : ''} ago`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;

    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
  };

  const formattedReports = formatRecentReports(recentReports);

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
              <ScrollView style={{ maxHeight: 350 }} showsVerticalScrollIndicator={false}>
                {notifications.map((item) => (
                  <TouchableOpacity
                    key={item._id}
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
                ))}
              </ScrollView>
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

      {/* System Activity Chart */}
      <View style={styles.chartContainer}>
        <View style={styles.chartHeader}>
          <Text style={styles.chartTitle}>Today&apos;s System Activity</Text>
          <TouchableOpacity
            style={styles.viewAllButton}
            onPress={() => navigation.navigate('AdminDashboard')}
          >
            <Text style={styles.viewAllText}>View All</Text>
            <MaterialCommunityIcons name="chevron-right" size={16} color="#01B97F" />
          </TouchableOpacity>
        </View>
        {loading ? (
          <View style={styles.chartLoadingContainer}>
            <ActivityIndicator size="large" color="#01B97F" />
            <Text style={styles.chartLoadingText}>Loading today&apos;s activity...</Text>
          </View>
        ) : (
          <>
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
                <Text style={styles.legendText}>Detections</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: '#A8AAB0' }]} />
                <Text style={styles.legendText}>Reports</Text>
              </View>
            </View>
          </>
        )}
      </View>

      {/* Recent Reports */}
      <View style={styles.recentActivity}>
        <View style={styles.recentActivityHeader}>
          <View>
            <Text style={styles.recentActivityTitle}>Recent Reports</Text>
            <Text style={styles.recentActivityCount}>
              {loading ? 'Loading...' : `${formattedReports.length} recent reports`}
            </Text>
          </View>
          <TouchableOpacity style={styles.viewAllButton} onPress={() => navigation.navigate('AdminReports')}>
            <Text style={styles.viewAllText}>View All</Text>
            <MaterialCommunityIcons name="chevron-right" size={20} color="#01B97F" />
          </TouchableOpacity>
        </View>
        <View style={{ maxHeight: 320 }}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color="#01B97F" />
              <Text style={styles.loadingText}>Loading reports...</Text>
            </View>
          ) : formattedReports.length === 0 ? (
            <Text style={styles.emptyStateText}>No recent reports</Text>
          ) : (
            <ScrollView style={styles.activityList} showsVerticalScrollIndicator={false}>
              {formattedReports.map((item) => (
                <View key={item.id} style={styles.activityItem}>
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
                    <Text style={styles.activityDetails}>
                      {item.category} • {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
                    </Text>
                  </View>
                </View>
              ))}
            </ScrollView>
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
    fontSize: 28,
    fontFamily: 'Poppins-Bold',
    color: COLORS.TEXT_MAIN,
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
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
    fontSize: 10,
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
    fontFamily: 'Poppins-Regular',
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
  chartLoadingContainer: {
    height: 180,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
  },
  chartLoadingText: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#6C6C6C',
    marginTop: 8,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  loadingText: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#6C6C6C',
    marginLeft: 8,
  },
});

export default AdminHomeScreen;
