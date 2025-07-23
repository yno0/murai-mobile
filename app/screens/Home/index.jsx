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
import api from '../../services/api';

const { width } = Dimensions.get('window');

function HomeScreen({ navigation }) {
  const [loading, setLoading] = React.useState(true);
  const [stats, setStats] = React.useState(null);
  const [chartData, setChartData] = React.useState(null);
  const [recentActivity, setRecentActivity] = React.useState([]);
  const [error, setError] = React.useState('');
  const [notifications, setNotifications] = React.useState([]);
  const [notifModalVisible, setNotifModalVisible] = React.useState(false);
  const [notifLoading, setNotifLoading] = React.useState(false);
  const [timeRange, setTimeRange] = React.useState('today');

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const fetchNotifications = async () => {
    setNotifLoading(true);
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data);
    } catch (err) {
      // Optionally handle error
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
    } catch (err) {}
  };

  const fetchData = React.useCallback(async (selectedTimeRange = timeRange) => {
    setLoading(true);
    setError('');
    try {
      // Map time range to API format
      const apiTimeRange = selectedTimeRange === 'week' ? 'last 7 days' :
                          selectedTimeRange === 'month' ? 'last 30 days' :
                          selectedTimeRange === 'year' ? 'all time' :
                          'today';

      const [statsRes, chartRes, activityRes] = await Promise.all([
        api.get(`/dashboard/overview?timeRange=${apiTimeRange}`),
        api.get(`/dashboard/activity-chart?timeRange=${apiTimeRange}`),
        api.get(`/dashboard/user-activity?timeRange=${apiTimeRange}`),
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
  }, [timeRange]);

  React.useEffect(() => {
    fetchData();
  }, [fetchData]);

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

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header with Notification */}
      <View style={styles.topHeader}>
        <View style={styles.header}>
          <Text style={styles.greeting}>Hello Mhark,</Text>
          <Text style={styles.subtitle}>Here&apos;s a quick look at your digital safety today.</Text>
        </View>
        <TouchableOpacity style={styles.notificationButton} onPress={openNotifModal}>
          <MaterialCommunityIcons name="bell-outline" size={24} color="rgba(1, 82, 55, 1)" />
          {unreadCount > 0 && (
            <View style={styles.notifBadge}>
              <Text style={styles.notifBadgeText}>{unreadCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Time Filter Options */}
      <View style={styles.timeFilterContainer}>
        {['today', 'week', 'month', 'year'].map((filter) => (
          <TouchableOpacity
            key={filter}
            style={[
              styles.timeFilterButton,
              timeRange === filter && styles.timeFilterButtonActive
            ]}
            onPress={() => {
              setTimeRange(filter);
              fetchData(filter);
            }}
          >
            <Text style={[
              styles.timeFilterText,
              timeRange === filter && styles.timeFilterTextActive
            ]}>
              {filter === 'today' ? 'Today' :
               filter === 'week' ? 'Week' :
               filter === 'month' ? 'Month' : 'Year'}
            </Text>
          </TouchableOpacity>
        ))}
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
              <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#374151' }}>Notifications</Text>
              <TouchableOpacity onPress={() => setNotifModalVisible(false)}>
                <MaterialCommunityIcons name="close" size={24} color="rgba(81, 7, 192, 1)" />
              </TouchableOpacity>
            </View>
            {notifLoading ? (
              <Text style={{ textAlign: 'center', color: '#6b7280' }}>Loading...</Text>
            ) : notifications.length === 0 ? (
              <Text style={{ textAlign: 'center', color: '#6b7280' }}>No notifications</Text>
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
                          item.type === 'alert' ? 'rgba(81, 7, 192, 1)' :
                          item.type === 'warning' ? 'rgba(81, 7, 192, 0.7)' :
                          item.type === 'success' ? 'rgba(81, 7, 192, 0.5)' :
                          'rgba(81, 7, 192, 0.3)'
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

      {/* Stats Card */}
      <View style={styles.statsCardContainer}>
        <View style={styles.statsCard}>
          <View style={styles.statsHeader}>
            <View style={styles.statsLeft}>
              <Text style={styles.statsNumber}>{loading || !stats ? '...' : stats.harmfulContentDetected.value}</Text>
              <Text style={styles.statsLabel}>{`inappropriate words\nwere flagged today`}</Text>
            </View>
            <View style={styles.statsRight}>
              <Text style={[styles.percentage, { color: '#01B97F' }]}>{loading || !stats ? '' : stats.harmfulContentDetected.change + ' ↗'}</Text>
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
        <TouchableOpacity style={styles.viewDetailedButton}>
          <Text style={styles.viewDetailedText}>View Detailed →</Text>
        </TouchableOpacity>
      </View>

      {/* Quick Actions */}
      <View style={styles.quickActionsContainer}>
        <TouchableOpacity style={styles.quickActionButton} onPress={() => navigation.navigate('Groups')}>
          <View style={styles.quickActionIconBg}>
            <MaterialCommunityIcons name="account-group-outline" size={20} color="#02B97F" />
          </View>
          <Text style={styles.quickActionText}>Create Group</Text>
        </TouchableOpacity>
        <View className="actionDivider" style={styles.actionDivider} />
        <TouchableOpacity style={styles.quickActionButton} onPress={() => navigation.navigate('Analytics')}>
          <View style={styles.quickActionIconBg}>
            <MaterialCommunityIcons name="chart-box-outline" size={20} color="#02B97F" />
          </View>
          <Text style={styles.quickActionText}>View Analytics</Text>
        </TouchableOpacity>
        <View className="actionDivider" style={styles.actionDivider} />
        <TouchableOpacity style={styles.quickActionButton} onPress={() => navigation.navigate('Settings')}>
          <View style={styles.quickActionIconBg}>
            <MaterialCommunityIcons name="cog-outline" size={20} color="#02B97F"  />
          </View>
          <Text style={styles.quickActionText}>Configure</Text>
        </TouchableOpacity>
      </View>

      {/* Recent Activity */}
      <View style={styles.recentActivity}>
        <View style={styles.recentActivityHeader}>
          <View>
            <Text style={styles.recentActivityTitle}>Recent Activity</Text>
            <Text style={styles.recentActivityCount}>{loading ? '' : (recentActivity.length + ' items')}</Text>
          </View>
          <TouchableOpacity style={styles.viewAllButton}>
            <Text style={styles.viewAllText}>View All</Text>
            <MaterialCommunityIcons name="chevron-right" size={20} color="#02B97F" />
          </TouchableOpacity>
        </View>
        {/* Activity List */}
        <View style={{ maxHeight: 320 }}>
          {loading ? (
            <Text style={styles.emptyStateText}>Loading...</Text>
          ) : error ? (
            <Text style={styles.emptyStateText}>{error}</Text>
          ) : recentActivity.length === 0 ? (
            <Text style={styles.emptyStateText}>No recent activity</Text>
          ) : (
            <FlatList
              data={recentActivity}
              keyExtractor={(item, idx) => item.id ? String(item.id) : String(idx)}
              style={styles.activityList}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => (
                <View style={styles.activityItem}>
                  <View style={[styles.activityIcon, { backgroundColor: '#f3f4f6' }]}> {/* You can color by type if you want */}
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
                      <Text style={styles.activityText}>{item.details || item.type}</Text>
                      <Text style={styles.activityTime}>{new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
                    </View>
                    <Text style={styles.activityDetails}>{item.user ? `By ${item.user}` : ''}</Text>
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
  greeting: {
    fontSize: 28,
    fontFamily: 'Poppins-Bold',
    color: '#1f2937',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    color: '#6b7280',
    lineHeight: 22,
  },
  notificationButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f8fafc',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 5,
    position: 'relative',
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
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    color: '#9ca3af',
    textAlign: 'center',
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
    borderBottomColor: '#f3f4f6',
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
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 4,
    marginBottom: 30,
    marginHorizontal: 5,
  },
  timeFilterButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  timeFilterButtonActive: {
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  timeFilterText: {
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    color: '#6b7280',
  },
  timeFilterTextActive: {
    color: '#1f2937',
    fontFamily: 'Poppins-SemiBold',
  },
});

export default HomeScreen;