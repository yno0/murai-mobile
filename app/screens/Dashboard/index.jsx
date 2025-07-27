import { Feather } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Dimensions,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import MainHeader from '../../components/common/MainHeader';
import api from '../../services/api';

const { width } = Dimensions.get('window');

function DashboardScreen({ navigation }) {
  // const { user } = useAuth(); // Get user from auth context
  const [selectedTimeRange, setSelectedTimeRange] = useState('Today');


  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [dashboardData, setDashboardData] = useState({
    overview: null,
    chartData: null,
    userActivity: null,
  });



  // Detection chart configuration matching home screen theme
  const detectionChartConfig = {
    backgroundColor: 'transparent',
    backgroundGradientFrom: '#f8fafc',
    backgroundGradientTo: '#f8fafc',
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(2, 185, 127, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(107, 114, 128, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '4',
      strokeWidth: '2',
      stroke: '#ffffff',
    },
    propsForBackgroundLines: {
      strokeWidth: 1,
      stroke: '#f1f5f9',
      strokeDasharray: '5,5',
    },
    withHorizontalLabels: true,
    withVerticalLabels: false,
    withInnerLines: true,
    withOuterLines: false,
    withShadow: true,
    fillShadowGradient: '#02B97F',
    fillShadowGradientOpacity: 0.3,
  };

  const timeRanges = ['Today', 'Last 7 Days', 'Last Month', 'Last Year'];

  // Fetch dashboard data using the same pattern as home screen
  const fetchDashboardData = async (timeRangeParam = selectedTimeRange) => {
    setIsLoading(true);
    setError('');
    try {
      // Map time range to match server expectations
      const mappedTimeRange = timeRangeParam === 'Today' ? 'today' :
                             timeRangeParam === 'Last 7 Days' ? 'week' :
                             timeRangeParam === 'Last Month' ? 'month' :
                             timeRangeParam === 'Last Year' ? 'year' :
                             timeRangeParam.toLowerCase();

      // Use detection-focused endpoints
      const yearParam = '';

      const [overviewRes, detectionChartRes, userActivityRes] = await Promise.all([
        // Get overview data with detection focus
        api.get(`/user-dashboard/overview?timeRange=${mappedTimeRange}${yearParam}`).catch(() =>
          api.get(`/dashboard/overview?timeRange=${mappedTimeRange}${yearParam}`)
        ),
        // Get detection chart data (using user dashboard activity chart)
        api.get(`/user-dashboard/activity-chart?timeRange=${mappedTimeRange}${yearParam}`).catch(() =>
          api.get(`/dashboard/activity-chart?timeRange=${mappedTimeRange}${yearParam}`)
        ),
        api.get(`/user-dashboard/user-activity?timeRange=${mappedTimeRange}${yearParam}`).catch(() =>
          api.get(`/dashboard/user-activity?timeRange=${mappedTimeRange}${yearParam}`)
        ),
      ]);

      setDashboardData({
        overview: overviewRes.data,
        chartData: detectionChartRes.data,
        userActivity: userActivityRes.data,
      });
    } catch (err) {
      console.error('Dashboard API Error:', err);
      setError('Failed to load dashboard data. Please check server connection.');
      // Set default data on error
      setDashboardData({
        overview: {
          harmfulContentDetected: { value: '0', change: '+0%' },
          websitesMonitored: { value: '0', change: '+0' },
          protectionEffectiveness: { value: '95.0%', change: '+0%' },
        },
        chartData: {
          labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
          datasets: [
            { label: 'Protected', data: [0, 0, 0, 0, 0, 0, 0] },
            { label: 'Monitored', data: [0, 0, 0, 0, 0, 0, 0] },
          ],
        },

        userActivity: {
          activityBreakdown: [],
          recentActivity: [],
          totalActivities: 0
        },
      });
    } finally {
      setIsLoading(false);
    }
  };



  // Effect to load data on component mount and time range change
  useEffect(() => {
    fetchDashboardData(selectedTimeRange);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTimeRange]);

  // Prepare detection chart data based on detected words data
  const detectionChartData = dashboardData.chartData ? {
    labels: dashboardData.chartData.labels || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        data: dashboardData.chartData.datasets?.[0]?.data || [0, 0, 0, 0, 0, 0, 0],
        strokeWidth: 3,
        color: (opacity = 1) => `rgba(2, 185, 127, ${opacity})`,
        fillShadowGradient: '#02B97F',
        fillShadowGradientOpacity: 0.7,
        withDots: true,
      },
    ],
  } : {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        data: [0, 0, 0, 0, 0, 0, 0],
        strokeWidth: 3,
        color: (opacity = 1) => `rgba(2, 185, 127, ${opacity})`,
        fillShadowGradient: '#02B97F',
        fillShadowGradientOpacity: 0.7,
      },
    ],
  };

  // Prepare overview stats for display
  const overallStats = dashboardData.overview ? [
    {
      value: dashboardData.overview.harmfulContentDetected?.value || '0',
      label: 'Harmful Content Detected',
      change: dashboardData.overview.harmfulContentDetected?.change || '+0%',
      color: 'rgba(1, 82, 55, 1)',
      icon: 'shield-alert'
    },
    {
      value: dashboardData.overview.websitesMonitored?.value || '0',
      label: 'Websites Monitored',
      change: dashboardData.overview.websitesMonitored?.change || '+0',
      color: 'rgba(1, 82, 55, 1)',
      icon: 'web'
    },
    {
      value: dashboardData.overview.protectionEffectiveness?.value || '95%',
      label: 'Protection Effectiveness',
      change: dashboardData.overview.protectionEffectiveness?.change || '+0%',
      color: 'rgba(1, 82, 55, 1)',
      icon: 'shield-check'
    },
  ] : [];



  const menuOptions = [
    {
      icon: '🔍',
      title: 'Detection Analytics',
      subtitle: 'Comprehensive detection insights & patterns',
      color: '#f0fdf4',
      iconColor: '#02B97F',
      screen: 'DetectionAnalytics',
    },
    {
      icon: '🧼',
      title: 'What MURAi Caught',
      subtitle: 'Flagged words, trending terms & changes',
      color: '#fef2f2',
      iconColor: '#ef4444',
      screen: 'FlaggedWordsAnalytics',
    },
    {
      icon: '🌍',
      title: 'Where It Happened',
      subtitle: 'Top websites & monitoring stats',
      color: '#eff6ff',
      iconColor: '#3b82f6',
      screen: 'WebsiteAnalytics',
    },
    {
      icon: '👨‍👩‍👧‍👦',
      title: 'People & Activity',
      subtitle: 'User activity & alert interactions',
      color: '#fef3c7',
      iconColor: '#f59e0b',
      screen: 'UserActivityAnalytics',
    },
  ];

  const sideMenuItems = [
    { title: 'Dashboard Overview', icon: 'bar-chart-2', action: () => setIsMenuOpen(false) },
    { title: 'Detection Analytics', icon: 'shield-search', action: () => navigation.navigate('DetectionAnalytics') },
    { title: 'Where It Happened', icon: 'web', action: () => navigation.navigate('WebsiteAnalytics') },
    { title: 'People & Activity', icon: 'account-group', action: () => navigation.navigate('UserActivityAnalytics') },
  ];

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleMenuAction = (action) => {
    setIsMenuOpen(false);
    action();
  };

  const handleTimeRangeChange = (range) => {
    if (range !== selectedTimeRange) {
      setSelectedTimeRange(range);
      // Show loading state immediately for better UX
      setIsLoading(true);
    }
  };



  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <MainHeader
        title="MURAi Dashboard"
        subtitle="Real-time protection insights"
        rightActions={[
          {
            icon: 'menu',
            iconType: 'feather',
            onPress: toggleMenu
          }
        ]}
        style={{ paddingHorizontal: 0 }}
      />

      {/* Enhanced Time Range Selector */}
      <View style={styles.timeRangeContainer}>
        <View style={styles.timeRangeSelectorHeader}>
          <MaterialCommunityIcons name="clock-outline" size={20} color="#6b7280" />
          <Text style={styles.timeRangeSelectorTitle}>Time Period</Text>
        </View>
        <View style={styles.timeRangeButtonsContainer}>
          {timeRanges.map((range) => (
            <TouchableOpacity
              key={range}
              style={[
                styles.timeRangeButton,
                selectedTimeRange === range && styles.timeRangeButtonActive,
              ]}
              onPress={() => handleTimeRangeChange(range)}
            >
              {isLoading && selectedTimeRange === range ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <MaterialCommunityIcons
                  name={
                    range === 'Today' ? 'calendar-today' :
                    range === 'Last 7 Days' ? 'calendar-week' :
                    range === 'Last Month' ? 'calendar-month' :
                    'calendar-range'
                  }
                  size={16}
                  color={selectedTimeRange === range ? '#ffffff' : '#6b7280'}
                />
              )}
              <Text
                style={[
                  styles.timeRangeText,
                  selectedTimeRange === range && styles.timeRangeTextActive,
                ]}
              >
                {range}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>



      {/* Overall Stats */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#02B97F" />
          <Text style={styles.loadingText}>Loading dashboard data...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <MaterialCommunityIcons name="alert-circle-outline" size={24} color="#ef4444" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => fetchDashboardData(selectedTimeRange)}
          >
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.overallStatsContainer}>
          {overallStats.map((stat, index) => (
            <View key={index} style={styles.statCard}>
              <View style={styles.statIconContainer}>
                <MaterialCommunityIcons
                  name={stat.icon}
                  size={24}
                  color="#02B97F"
                />
              </View>
              <View style={styles.statContent}>
                <Text style={styles.statValue}>{stat.value}</Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
                <View style={styles.statChangeContainer}>
                  <MaterialCommunityIcons
                    name={stat.change.includes('+') ? 'trending-up' : 'trending-down'}
                    size={14}
                    color={stat.change.includes('+') ? '#10b981' : '#ef4444'}
                  />
                  <Text style={[styles.statChange, {
                    color: stat.change.includes('+') ? '#10b981' : '#ef4444'
                  }]}>
                    {stat.change}
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Detection Trends Chart with Horizontal Scroll */}
      <View style={styles.chartContainer}>
        <View style={styles.chartHeader}>
          <View style={styles.chartTitleContainer}>
            <MaterialCommunityIcons name="shield-search" size={24} color="#02B97F" />
            <Text style={styles.chartTitle}>
              {selectedTimeRange === 'Today' ? 'Today\'s Activity' :
               selectedTimeRange === 'Last 7 Days' ? 'Weekly Overview' :
               selectedTimeRange === 'Last Month' ? 'Monthly Trends' :
               'Yearly Overview'}
            </Text>
          </View>
          <View style={styles.chartPeriodBadge}>
            <Text style={styles.chartPeriodText}>{selectedTimeRange}</Text>
          </View>
        </View>

        {/* Detection Stats Summary */}
        <View style={styles.chartStatsContainer}>
          <View style={styles.chartStatItem}>
            <MaterialCommunityIcons name="shield-alert" size={20} color="#ef4444" />
            <Text style={styles.chartStatValue}>
              {isLoading ? '...' : detectionChartData.datasets[0].data.reduce((a, b) => a + b, 0)}
            </Text>
            <Text style={styles.chartStatLabel}>Total Detections</Text>
          </View>
          <View style={styles.chartStatDivider} />
          <View style={styles.chartStatItem}>
            <MaterialCommunityIcons name="trending-up" size={20} color="#02B97F" />
            <Text style={styles.chartStatValue}>
              {isLoading ? '...' : Math.max(...detectionChartData.datasets[0].data)}
            </Text>
            <Text style={styles.chartStatLabel}>
              {selectedTimeRange === 'Today' ? 'Peak Hour' :
               selectedTimeRange === 'Last 7 Days' ? 'Peak Day' :
               selectedTimeRange === 'Last Month' ? 'Peak Month' :
               'Peak Year'}
            </Text>
          </View>
        </View>

        {/* Horizontally Scrollable Detection Chart */}
        {isLoading ? (
          <View style={styles.chartLoadingContainer}>
            <ActivityIndicator size="large" color="#02B97F" />
            <Text style={styles.chartLoadingText}>Loading {selectedTimeRange.toLowerCase()} data...</Text>
          </View>
        ) : (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.chartScrollContainer}
            contentContainerStyle={styles.chartScrollContent}
          >
            <LineChart
              data={detectionChartData}
              width={Math.max(width - 40, detectionChartData.labels.length * 80)}
              height={200}
              chartConfig={detectionChartConfig}
              bezier
              style={styles.chart}
              withDots={true}
              withShadow={true}
              withFill={true}
              withInnerLines={false}
              withOuterLines={false}
              withVerticalLines={false}
              withHorizontalLines={false}
            />
          </ScrollView>
        )}

        {/* Detection Legend */}
        <View style={styles.chartLegend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#02B97F' }]} />
            <Text style={styles.legendText}>Harmful Content Detected</Text>
            <View style={styles.legendBadge}>
              <Text style={styles.legendBadgeText}>
                {selectedTimeRange}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Analytics Menu */}
      <View style={styles.menuContainer}>
        <Text style={styles.menuTitle}>Analytics Sections</Text>
        {menuOptions.map((option, index) => (
          <TouchableOpacity
            key={index}
            style={styles.menuItem}
            onPress={() => navigation.navigate(option.screen)}
          >
            <View style={[styles.menuIcon, { backgroundColor: option.color }]}>
              <Text style={styles.menuEmoji}>{option.icon}</Text>
            </View>
            <View style={styles.menuContent}>
              <Text style={styles.menuItemTitle}>{option.title}</Text>
              <Text style={styles.menuItemSubtitle}>{option.subtitle}</Text>
            </View>
            <Feather name="chevron-right" size={20} color="#9ca3af" />
          </TouchableOpacity>
        ))}
      </View>



      {/* Bottom Sheet Menu */}
      <Modal
        visible={isMenuOpen}
        transparent={true}
        animationType="slide"
        onRequestClose={toggleMenu}
      >
        <TouchableOpacity style={styles.overlay} onPress={toggleMenu}>
          <View style={styles.bottomSheetContainer}>
            <View style={styles.bottomSheet}>
              {/* Handle Bar */}
              <View style={styles.handleBar} />

              {/* Header */}
              <View style={styles.menuHeader}>
                <Text style={styles.menuTitle}>MURAi Dashboard</Text>
                <TouchableOpacity style={styles.closeButton} onPress={toggleMenu}>
                  <MaterialCommunityIcons name="close" size={24} color="#374151" />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.menuScroll} showsVerticalScrollIndicator={false}>
                {/* Analytics Section */}
                <View style={styles.menuSection}>
                  <Text style={styles.sectionTitle}>Analytics</Text>
                  {sideMenuItems.map((item, index) => (
                    <TouchableOpacity
                      key={index}
                      style={styles.menuItem}
                      onPress={() => handleMenuAction(item.action)}
                    >
                      <View style={styles.menuItemIcon}>
                        <MaterialCommunityIcons name={item.icon} size={24} color="#374151" />
                      </View>
                      <View style={styles.menuItemContent}>
                        <Text style={styles.menuItemText}>{item.title}</Text>
                        <Text style={styles.menuItemSubtitle}>
                          {index === 0 ? 'Main dashboard overview' :
                           index === 1 ? 'Flagged words & trending terms' :
                           index === 2 ? 'Website monitoring & stats' :
                           'User activity & interactions'}
                        </Text>
                      </View>
                      <MaterialCommunityIcons name="chevron-right" size={20} color="#9ca3af" />
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  menuButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontFamily: 'Poppins-Medium',
    color: '#111827',
  },
  greeting: {
    fontSize: 16,
    fontFamily: 'Poppins-Medium',
    color: '#111827',
    marginBottom: 4,
  },
  statusBar: {
    alignItems: 'flex-end',
  },
  timeText: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#374151',
  },
  headerSection: {
    marginBottom: 20,
  },
  timeRangeContainer: {
    marginBottom: 24,
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    padding: 16,
  },
  timeRangeSelectorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  timeRangeSelectorTitle: {
    fontSize: 14,
    fontFamily: 'Poppins-SemiBold',
    color: '#374151',
  },
  timeRangeButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  timeRangeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    gap: 6,
  },
  timeRangeButtonActive: {
    backgroundColor: '#02B97F',
    borderColor: '#02B97F',
  },
  timeRangeText: {
    fontSize: 12,
    fontFamily: 'Poppins-SemiBold',
    color: '#6b7280',
  },
  timeRangeTextActive: {
    color: '#ffffff',
  },
  yearSelectorContainer: {
    marginBottom: 24,
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    padding: 16,
  },
  yearSelectorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  yearSelectorTitle: {
    fontSize: 14,
    fontFamily: 'Poppins-SemiBold',
    color: '#374151',
  },
  yearScrollContainer: {
    marginHorizontal: -4,
  },
  yearButtonsContainer: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 4,
  },
  yearButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    minWidth: 80,
    alignItems: 'center',
  },
  yearButtonActive: {
    backgroundColor: '#02B97F',
    borderColor: '#02B97F',
  },
  yearText: {
    fontSize: 12,
    fontFamily: 'Poppins-SemiBold',
    color: '#6b7280',
  },
  yearTextActive: {
    color: '#ffffff',
  },
  overallStatsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
    gap: 8,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#f3f4f6',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    minHeight: 120,
  },
  statIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#E8F5F0',
    marginBottom: 12,
  },
  statContent: {
    flex: 1,
  },
  statValue: {
    fontSize: 24,
    fontFamily: 'Poppins-Bold',
    color: '#111827',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 10,
    fontFamily: 'Poppins-Medium',
    color: '#9ca3af',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
    lineHeight: 12,
  },
  statChangeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statChange: {
    fontSize: 12,
    fontFamily: 'Poppins-SemiBold',
  },
  chartContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#f3f4f6',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  chartTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  chartTitle: {
    fontSize: 18,
    fontFamily: 'Poppins-SemiBold',
    color: '#111827',
  },
  chartPeriodBadge: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  chartPeriodText: {
    fontSize: 12,
    fontFamily: 'Poppins-Medium',
    color: '#6b7280',
  },
  chartStatsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  chartStatItem: {
    alignItems: 'center',
    flex: 1,
  },
  chartStatValue: {
    fontSize: 24,
    fontFamily: 'Poppins-Bold',
    color: '#111827',
    marginBottom: 4,
  },
  chartStatLabel: {
    fontSize: 12,
    fontFamily: 'Poppins-Medium',
    color: '#6b7280',
    textAlign: 'center',
  },
  chartStatDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#e5e7eb',
    marginHorizontal: 16,
  },
  chartScrollContainer: {
    marginBottom: 20,
  },
  chartScrollContent: {
    paddingRight: 20,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  chartLoadingContainer: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    marginBottom: 20,
  },
  chartLoadingText: {
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    color: '#6b7280',
    marginTop: 12,
  },
  viewAllText: {
    fontSize: 14,
    color: '#3b82f6',
    fontFamily: 'Poppins-SemiBold',
  },
  menuContainer: {
    marginBottom: 24,
  },
  menuTitle: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    color: '#111827',
    marginBottom: 16,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#f3f4f6',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 2,
  },
  menuIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  menuEmoji: {
    fontSize: 24,
  },
  menuContent: {
    flex: 1,
  },
  menuItemTitle: {
    fontSize: 14,
    fontFamily: 'Poppins-SemiBold',
    color: '#111827',
    marginBottom: 2,
  },

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    color: '#6b7280',
    marginTop: 12,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
    backgroundColor: '#fef2f2',
    borderRadius: 12,
    marginBottom: 20,
  },
  errorText: {
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    color: '#ef4444',
    marginTop: 12,
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#ef4444',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryText: {
    color: '#ffffff',
    fontSize: 14,
    fontFamily: 'Poppins-SemiBold',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  bottomSheetContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'transparent',
  },
  bottomSheet: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 10,
  },
  handleBar: {
    width: 40,
    height: 4,
    backgroundColor: '#e5e7eb',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 15,
  },
  menuHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  menuScroll: {
    flex: 1,
  },
  menuSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    color: '#374151',
    marginBottom: 12,
  },
  menuItemIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  menuItemContent: {
    flex: 1,
  },
  menuItemText: {
    fontSize: 16,
    fontFamily: 'Poppins-Medium',
    color: '#111827',
    marginLeft: 16,
  },
  menuItemSubtitle: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: '#9ca3af',
  },
  closeButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
  },
  chartLegend: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    paddingHorizontal: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    flex: 1,
    marginHorizontal: 4,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  legendText: {
    fontSize: 11,
    fontFamily: 'Poppins-Medium',
    color: '#6b7280',
    flex: 1,
  },
  legendBadge: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginLeft: 4,
  },
  legendBadgeText: {
    fontSize: 10,
    fontFamily: 'Poppins-Bold',
    color: '#374151',
  },
  insightsTitle: {
    fontSize: 16,
    fontFamily: 'Poppins-Medium',
    color: 'rgba(81, 7, 192, 1)',
    marginBottom: 8,
  },
  insightsSubtitle: {
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    color: 'rgba(81, 7, 192, 0.7)',
    marginBottom: 12,
  },
});

export default DashboardScreen;