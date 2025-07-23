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

// Real dashboard service that fetches from your API
const API_BASE_URL = 'http://localhost:3000/api';

const dashboardService = {
  getOverview: async (timeRange) => {
    try {
      console.log(`Fetching overview data for timeRange: ${timeRange}`);
      const response = await fetch(`${API_BASE_URL}/dashboard/overview?timeRange=${encodeURIComponent(timeRange)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          // For now, we'll skip auth to test - you can add back later
          // 'Authorization': `Bearer ${authToken}`
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Overview data received:', data);
      return data;
    } catch (error) {
      console.error('Error fetching overview:', error);
      // Return fallback data if API fails
      return {
        harmfulContentDetected: { value: 'Error', change: 'N/A' },
        websitesMonitored: { value: 'Error', change: 'N/A' },
        protectionEffectiveness: { value: 'Error', change: 'N/A' },
      };
    }
  },

  getActivityChart: async (timeRange) => {
    try {
      console.log(`Fetching activity chart data for timeRange: ${timeRange}`);
      const response = await fetch(`${API_BASE_URL}/dashboard/activity-chart?timeRange=${encodeURIComponent(timeRange)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Activity chart data received:', data);
      return data;
    } catch (error) {
      console.error('Error fetching activity chart:', error);
      return {
        labels: ['Error'],
        datasets: [
          { label: 'Protected', data: [0] },
          { label: 'Monitored', data: [0] },
        ],
      };
    }
  },

  getInsights: async () => {
    try {
      console.log('Fetching insights data');
      const response = await fetch(`${API_BASE_URL}/dashboard/insights`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Insights data received:', data);
      return data;
    } catch (error) {
      console.error('Error fetching insights:', error);
      return {
        insights: [
          { icon: 'shield-alert', text: 'Unable to load insights - check server connection', color: '#ef4444' },
        ],
      };
    }
  },
};

const { width } = Dimensions.get('window');

function DashboardScreen({ navigation }) {
  const [selectedTimeRange, setSelectedTimeRange] = useState('Today');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    overview: null,
    chartData: null,
    insights: null,
  });

  // Default chart data structure
  const defaultChartData = {
    labels: ['', '', '', '', '', '', ''],
    datasets: [
      {
        data: [0, 0, 0, 0, 0, 0, 0],
        strokeWidth: 2,
        color: (opacity = 1) => `rgba(34, 197, 94, ${opacity})`,
        fillShadowGradient: 'rgba(34, 197, 94, 0.1)',
        fillShadowGradientOpacity: 0.1,
      },
      {
        data: [0, 0, 0, 0, 0, 0, 0],
        strokeWidth: 2,
        color: (opacity = 1) => `rgba(107, 114, 128, ${opacity})`,
        fillShadowGradient: 'rgba(107, 114, 128, 0.1)',
        fillShadowGradientOpacity: 0.1,
      },
    ],
  };

  const chartConfig ={
    backgroundColor: 'transparent',
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(107, 114, 128, ${opacity})`,
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

  const timeRanges = ['Today', 'Last 7 days', 'Last 30 days', 'All Time'];
  
  // Fetch dashboard data
  const fetchDashboardData = async (timeRange) => {
    try {
      setIsLoading(true);
      const [overview, chartData, insights] = await Promise.all([
        dashboardService.getOverview(timeRange),
        dashboardService.getActivityChart(timeRange),
        dashboardService.getInsights(),
      ]);

      setDashboardData({
        overview,
        chartData,
        insights,
      });
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      // Set default data on error
      setDashboardData({
        overview: {
          harmfulContentDetected: { value: '0', change: '+0%' },
          websitesMonitored: { value: '0', change: '+0' },
          protectionEffectiveness: { value: '95%', change: '+0%' },
        },
        chartData: {
          labels: ['', '', '', '', '', '', ''],
          datasets: [
            { label: 'Protected', data: [0, 0, 0, 0, 0, 0, 0] },
            { label: 'Monitored', data: [0, 0, 0, 0, 0, 0, 0] },
          ],
        },
        insights: {
          insights: [
            { icon: 'shield-alert', text: 'Unable to load insights', color: '#ef4444' },
          ],
        },
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Effect to load data on component mount and time range change
  useEffect(() => {
    fetchDashboardData(selectedTimeRange);
  }, [selectedTimeRange]);

  // Prepare chart data for display
  const chartData = dashboardData.chartData ? {
    labels: dashboardData.chartData.labels || defaultChartData.labels,
    datasets: [
      {
        data: dashboardData.chartData.datasets?.[0]?.data || [0, 0, 0, 0, 0, 0, 0],
        strokeWidth: 2,
        color: (opacity = 1) => `rgba(34, 197, 94, ${opacity})`,
        fillShadowGradient: 'rgba(34, 197, 94, 0.1)',
        fillShadowGradientOpacity: 0.1,
      },
      {
        data: dashboardData.chartData.datasets?.[1]?.data || [0, 0, 0, 0, 0, 0, 0],
        strokeWidth: 2,
        color: (opacity = 1) => `rgba(107, 114, 128, ${opacity})`,
        fillShadowGradient: 'rgba(107, 114, 128, 0.1)',
        fillShadowGradientOpacity: 0.1,
      },
    ],
  } : defaultChartData;

  // Prepare overview stats for display
  const overallStats = dashboardData.overview ? [
    { 
      value: dashboardData.overview.harmfulContentDetected?.value || '0', 
      label: 'HARMFUL CONTENT\nDETECTED', 
      change: dashboardData.overview.harmfulContentDetected?.change || '+0%',
      color: 'rgba(1, 82, 55, 1)',
      icon: 'shield-alert'
    },
    { 
      value: dashboardData.overview.websitesMonitored?.value || '0', 
      label: 'WEBSITES\nMONITORED', 
      change: dashboardData.overview.websitesMonitored?.change || '+0',
      color: 'rgba(1, 82, 55, 1)',
      icon: 'web'
    },
    { 
      value: dashboardData.overview.protectionEffectiveness?.value || '95%', 
      label: 'PROTECTION\nEFFECTIVENESS', 
      change: dashboardData.overview.protectionEffectiveness?.change || '+0%',
      color: 'rgba(1, 82, 55, 1)',
      icon: 'shield-check'
    },
  ] : [];

  // Prepare insights for display
  const insightsData = dashboardData.insights?.insights || [
    { icon: 'shield-alert', text: 'Loading insights...', color: 'rgba(81, 7, 192, 1)' },
  ];

  const menuOptions = [
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
      icon: '💬',
      title: 'Language & Tone',
      subtitle: 'Mood analysis & safety scores',
      color: '#f0fdf4',
      iconColor: '#10b981',
      screen: 'LanguageAnalytics',
    },
    {
      icon: '👨‍👩‍👧‍👦',
      title: 'People & Activity',
      subtitle: 'User activity & alert interactions',
      color: '#fef3c7',
      iconColor: '#f59e0b',
      screen: 'UserActivityAnalytics',
    },
    {
      icon: '📆',
      title: 'Patterns Over Time',
      subtitle: 'Historical data & time patterns',
      color: '#f3e8ff',
      iconColor: '#8b5cf6',
      screen: 'TimePatternAnalytics',
    },
  ];

  const sideMenuItems = [
    { title: 'Dashboard Overview', icon: 'bar-chart-2', action: () => setIsMenuOpen(false) },
    { title: 'What MURAi Caught', icon: 'alert-circle', action: () => navigation.navigate('FlaggedWordsAnalytics') },
    { title: 'Where It Happened', icon: 'web', action: () => navigation.navigate('WebsiteAnalytics') },
    { title: 'Language & Tone', icon: 'translate', action: () => navigation.navigate('LanguageAnalytics') },
    { title: 'People & Activity', icon: 'account-group', action: () => navigation.navigate('UserActivityAnalytics') },
    { title: 'Patterns Over Time', icon: 'trending-up', action: () => navigation.navigate('TimePatternAnalytics') },
  ];

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleMenuAction = (action) => {
    setIsMenuOpen(false);
    action();
  };

  const handleTimeRangeChange = (range) => {
    setSelectedTimeRange(range);
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

   
      {/* Time Range Selector */}
      <View style={styles.timeRangeContainer}>
        {timeRanges.map((range) => (
          <TouchableOpacity
            key={range}
            style={[
              styles.timeRangeButton,
              selectedTimeRange === range && styles.timeRangeButtonActive,
            ]}
            onPress={() => handleTimeRangeChange(range)}
          >
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

      {/* Overall Stats */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3b82f6" />
          <Text style={styles.loadingText}>Loading dashboard data...</Text>
        </View>
      ) : (
        <View style={styles.overallStatsContainer}>
          {overallStats.map((stat, index) => (
            <View key={index} style={styles.statCard}>
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
              <Text style={[styles.statChange, { color: stat.color }]}>
                {stat.change}
              </Text>
            </View>
          ))}
        </View>
      )}

      {/* Weekly Flagged Words Chart */}
      <View style={styles.chartContainer}>
        <View style={styles.chartHeader}>
          <Text style={styles.chartTitle}>Activity Overview</Text>
        </View>
        <LineChart
          data={chartData}
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
            <View style={[styles.legendDot, { backgroundColor: '#22c55e' }]} />
            <Text style={styles.legendText}>Protected</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#6b7280' }]} />
            <Text style={styles.legendText}>Monitored</Text>
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

              {/* MURAi Insights Summary */}
        <View style={styles.summaryContainer}>
          <Text style={styles.summaryTitle}>MURAi AI Insights</Text>
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color="#3b82f6" />
              <Text style={styles.loadingText}>Loading insights...</Text>
            </View>
          ) : (
            <View style={styles.summaryItems}>
              {insightsData.map((insight, index) => (
                <View key={index} style={styles.summaryItem}>
                  <MaterialCommunityIcons name={insight.icon} size={20} color={insight.color} />
                  <Text style={styles.summaryText}>{insight.text}</Text>
                </View>
              ))}
            </View>
          )}
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
                           index === 3 ? 'Language analysis & safety scores' :
                           index === 4 ? 'User activity & interactions' :
                           'Time patterns & historical data'}
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
    flexDirection: 'row',
    marginBottom: 20,
    gap: 8,
  },
  timeRangeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  timeRangeButtonActive: {
    backgroundColor: '#f3f4f6',
  },
  timeRangeText: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#374151',
  },
  timeRangeTextActive: {
    fontFamily: 'Poppins-SemiBold',
  },
  overallStatsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: '#f3f4f6',
  },
  statHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    marginRight: 8,
  },
  statValue: {
    fontSize: 20,
    fontFamily: 'Poppins-Bold',
    color: '#111827',
    marginBottom: 4,
  },
  statChange: {
    fontSize: 12,
    fontFamily: 'Poppins-Medium',
    marginTop: 4,
    color: 'rgba(81, 7, 192, 1)',
  },
  statLabel: {
    fontSize: 10,
    fontFamily: 'Poppins-Medium',
    color: '#9ca3af',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  chartContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 30,
    borderWidth: 1,
    borderColor: '#f3f4f6',
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
    color: '#111827',
    marginBottom: 15,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  viewAllText: {
    fontSize: 14,
    color: '#3b82f6',
    fontFamily: 'Poppins-SemiBold',
  },
  menuContainer: {
    marginBottom: 30,
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
    borderRadius: 8,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#f3f4f6',
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  menuEmoji: {
    fontSize: 20,
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
  summaryContainer: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 20,
    marginBottom: 40,
    borderWidth: 1,
    borderColor: '#f3f4f6',
  },
  summaryTitle: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    color: '#111827',
    marginBottom: 16,
  },
  summaryItems: {
    gap: 12,
  },
  summaryItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  summaryText: {
    fontSize: 13,
    fontFamily: 'Poppins-Regular',
    color: '#6b7280',
    marginLeft: 12,
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
    color: '#6b7280',
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