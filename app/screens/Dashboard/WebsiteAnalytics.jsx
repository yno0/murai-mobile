import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { BarChart } from 'react-native-chart-kit';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import MainHeader from '../../components/common/MainHeader';

const { width } = Dimensions.get('window');

function WebsiteAnalyticsScreen({ navigation }) {
  // const { user } = useAuth(); // Get user from auth context
  const [selectedTimeRange, setSelectedTimeRange] = useState('Week');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [websiteData, setWebsiteData] = useState({
    topWebsites: [],
    totalWebsites: 0,
    totalDetections: 0,
    monitoringStats: {}
  });

  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  const timeRanges = ['Today', 'Week', 'Month', 'Year'];

  // Animation functions
  const startEntranceAnimation = () => {
    // Reset animations first to ensure clean state
    fadeAnim.setValue(0);
    slideAnim.setValue(30);
    scaleAnim.setValue(0.95);

    // Staggered animation for better visual flow
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ])
    ]).start();
  };

  const resetAnimations = () => {
    fadeAnim.setValue(0);
    slideAnim.setValue(30);
    scaleAnim.setValue(0.95);
  };

  // Fetch user's flagged websites data
  const fetchWebsiteData = async (timeRange) => {
    try {
      setIsLoading(true);
      setError('');

      // Map time range to match server expectations
      const mappedTimeRange = timeRange.toLowerCase() === 'week' ? 'week' :
                             timeRange.toLowerCase() === 'month' ? 'month' :
                             timeRange.toLowerCase() === 'year' ? 'year' :
                             timeRange.toLowerCase();

      // Import API service
      const { default: api } = await import('../../services/api');

      // Fetch real website analytics data
      const response = await api.get(`/user-dashboard/websites?timeRange=${mappedTimeRange}`);

      console.log('Website Analytics API Response:', response.data);

      setWebsiteData(response.data);
    } catch (err) {
      console.error('Failed to fetch website data:', err);
      setError('Failed to load website data. Please try again.');

      // Fallback to empty data structure
      setWebsiteData({
        topWebsites: [],
        totalWebsites: 0,
        totalDetections: 0,
        monitoringStats: {
          activeMonitoring: 0,
          highRiskSites: 0,
          aiAccuracy: 0
        }
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWebsiteData(selectedTimeRange);
  }, [selectedTimeRange]);

  useEffect(() => {
    if (!isLoading && !error) {
      startEntranceAnimation();
    }
  }, [isLoading, error]);

  const handleTimeRangeChange = (range) => {
    if (range !== selectedTimeRange) {
      resetAnimations();
      setSelectedTimeRange(range);
    }
  };

  // Generate chart data from real website data
  const generateChartData = () => {
    if (!websiteData.topWebsites || websiteData.topWebsites.length === 0) {
      console.log('No website data available for chart');
      return {
        labels: ['No Data'],
        datasets: [{ data: [0] }],
      };
    }

    const top6Sites = websiteData.topWebsites.slice(0, 6);
    console.log('Top 6 sites for chart:', top6Sites);

    const labels = top6Sites.map(site => {
      // Create short labels for chart
      const domain = site.domain.toLowerCase();
      if (domain.includes('facebook')) return 'FB';
      if (domain.includes('twitter') || domain.includes('x.com')) return 'TW';
      if (domain.includes('instagram')) return 'IG';
      if (domain.includes('tiktok')) return 'TT';
      if (domain.includes('youtube')) return 'YT';
      if (domain.includes('discord')) return 'DC';
      return domain.substring(0, 3).toUpperCase();
    });

    const chartData = {
      labels,
      datasets: [{
        data: top6Sites.map(site => site.detectionCount),
      }],
    };

    console.log('Generated chart data:', chartData);
    return chartData;
  };

  const chartData = generateChartData();

  const chartConfig = {
    backgroundColor: 'transparent',
    backgroundGradientFrom: '#f8fafc',
    backgroundGradientTo: '#f8fafc',
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(2, 185, 127, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(107, 114, 128, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForBackgroundLines: {
      strokeWidth: 1,
      stroke: '#f1f5f9',
      strokeDasharray: '5,5',
    },
    fillShadowGradient: '#02B97F',
    fillShadowGradientOpacity: 0.3,
  };

  // Use real data from API
  const topWebsites = websiteData.topWebsites?.map(site => ({
    name: site.domain,
    threats: site.threats || site.detectionCount,
    change: site.change || '+0',
    risk: site.riskLevel,
    icon: getDomainIcon(site.domain)
  })) || [];

  function getDomainIcon(domain) {
    const d = domain.toLowerCase();
    if (d.includes('facebook')) return 'facebook';
    if (d.includes('twitter') || d.includes('x.com')) return 'twitter';
    if (d.includes('instagram')) return 'instagram';
    if (d.includes('tiktok')) return 'music-note';
    if (d.includes('youtube')) return 'youtube';
    if (d.includes('discord')) return 'discord';
    return 'web';
  }

  // Menu items
  const sideMenuItems = [
    { title: 'Dashboard Overview', icon: 'view-dashboard', action: () => navigation.navigate('DashboardMain') },
    { title: 'Detection Analytics', icon: 'shield-search', action: () => navigation.navigate('DetectionAnalytics') },
    { title: 'Where It Happened', icon: 'web', action: () => setIsMenuOpen(false) },
    { title: 'People & Activity', icon: 'account-group', action: () => navigation.navigate('UserActivityAnalytics') },
  ];

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleMenuAction = (action) => {
    setIsMenuOpen(false);
    action();
  };


  // Use real data from API response with accurate changes
  const monitoringStats = [
    {
      metric: 'Total Websites',
      value: websiteData.totalWebsites?.toString() || '0',
      change: websiteData.monitoringStats?.changes?.websites || '0'
    },
    {
      metric: 'Active Monitoring',
      value: websiteData.monitoringStats?.activeMonitoring?.toString() || '0',
      change: websiteData.monitoringStats?.changes?.websites || '0'
    },
    {
      metric: 'High-Risk Sites',
      value: websiteData.monitoringStats?.highRiskSites?.toString() || '0',
      change: '0' // High-risk sites don't have a direct comparison metric
    },
    {
      metric: 'AI Accuracy',
      value: `${websiteData.monitoringStats?.aiAccuracy || 0}%`,
      change: websiteData.monitoringStats?.changes?.accuracy || '0%'
    },
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <MainHeader
        title="Where It Happened"
        subtitle="Website monitoring & detection insights"
        rightActions={[
          {
            icon: 'list',
            iconType: 'feather',
            onPress: toggleMenu
          }
        ]}
        style={{ paddingHorizontal: 0 }}
      />

      {/* Enhanced Time Range Selector */}
      <Animated.View
        style={[
          styles.timeRangeContainer,
          {
            opacity: fadeAnim,
          }
        ]}
      >
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
              <MaterialCommunityIcons
                name={
                  range === 'Today' ? 'calendar-today' :
                  range === 'Week' ? 'calendar-week' :
                  range === 'Month' ? 'calendar-month' :
                  'calendar-range'
                }
                size={16}
                color={selectedTimeRange === range ? '#ffffff' : '#6b7280'}
              />
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
      </Animated.View>

      {/* MURAi Monitoring Status - Moved to left side */}
      <Animated.View
        style={[
          styles.section,
          {
            opacity: fadeAnim,
          }
        ]}
      >
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleContainer}>
            <MaterialCommunityIcons name="monitor-dashboard" size={24} color="#02B97F" />
            <Text style={styles.sectionTitle}>MURAi Monitoring Status</Text>
          </View>
        </View>
        {isLoading ? (
          <View style={styles.loadingCard}>
            <ActivityIndicator size="large" color="#02B97F" />
            <Text style={styles.loadingText}>Loading monitoring data...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorCard}>
            <MaterialCommunityIcons name="alert-circle" size={24} color="#ef4444" />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : (
          <Animated.View
            style={[
              styles.statsGrid,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }]
              }
            ]}
          >
            {monitoringStats.map((stat, index) => (
              <View
                key={index}
                style={styles.statCard}
              >
                <Text style={styles.statValue}>{stat.value}</Text>
                <Text style={styles.statLabel}>{stat.metric}</Text>
                <Text style={styles.statChange}>{stat.change}</Text>
              </View>
            ))}
          </Animated.View>
        )}
      </Animated.View>

      {/* Top Websites Chart */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Threat Distribution by Platform</Text>
        {isLoading ? (
          <View style={styles.loadingCard}>
            <ActivityIndicator size="large" color="#02B97F" />
            <Text style={styles.loadingText}>Loading chart data...</Text>
          </View>
        ) : (
          <Animated.View
            style={[
              styles.chartContainer,
              {
                opacity: fadeAnim,
              }
            ]}
          >
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.barChartScrollContent}
              style={styles.barChartScroll}
            >
              <BarChart
                data={chartData}
                width={Math.max(width - 20, (websiteData.topWebsites?.length || 1) * 100)}
                height={220}
                chartConfig={chartConfig}
                style={styles.chart}
                fromZero
                showBarTops
                showValuesOnTopOfBars
                verticalLabelRotation={0}
              />
            </ScrollView>
          </Animated.View>
        )}
      </View>

      {/* Top Websites with Flags */}
      <Animated.View
        style={[
          styles.section,
          {
            opacity: fadeAnim,
          }
        ]}
      >
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleContainer}>
            <MaterialCommunityIcons name="flag-variant" size={24} color="#ef4444" />
            <Text style={styles.sectionTitle}>Platforms by Threat Level</Text>
          </View>
          <View style={styles.sectionBadge}>
            <Text style={styles.sectionBadgeText}>Risk Analysis</Text>
          </View>
        </View>
        {isLoading ? (
          <View style={styles.loadingCard}>
            <ActivityIndicator size="large" color="#02B97F" />
            <Text style={styles.loadingText}>Loading flagged websites...</Text>
          </View>
        ) : topWebsites.length === 0 ? (
          <View style={styles.emptyCard}>
            <MaterialCommunityIcons name="shield-check" size={48} color="#10b981" />
            <Text style={styles.emptyText}>No flagged websites yet</Text>
            <Text style={styles.emptySubtext}>MURAi is protecting you from harmful content</Text>
          </View>
        ) : (
          <Animated.View
            style={[
              styles.websitesContainer,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }]
              }
            ]}
          >
            {topWebsites.map((website, index) => (
              <View
                key={index}
                style={styles.websiteItem}
              >
                <View style={styles.websiteCard}>
                  <View style={styles.websiteMainInfo}>
                    <View style={styles.websiteIconContainer}>
                      <MaterialCommunityIcons name={website.icon} size={24} color="#02B97F" />
                    </View>
                    <View style={styles.websiteContent}>
                      <View style={styles.websiteTopRow}>
                        <Text style={styles.websiteName}>{website.name}</Text>
                        <View style={[
                          styles.riskBadge,
                          { backgroundColor: website.risk === 'high' ? '#fef2f2' :
                                            website.risk === 'medium' ? '#fef3c7' : '#f0fdf4' }
                        ]}>
                          <View style={[
                            styles.riskDot,
                            { backgroundColor: website.risk === 'high' ? '#dc2626' :
                                             website.risk === 'medium' ? '#d97706' : '#059669' }
                          ]} />
                          <Text style={[
                            styles.riskText,
                            { color: website.risk === 'high' ? '#dc2626' :
                                     website.risk === 'medium' ? '#d97706' : '#059669' }
                          ]}>
                            {website.risk.toUpperCase()}
                          </Text>
                        </View>
                      </View>
                      <View style={styles.websiteBottomRow}>
                        <View style={styles.threatInfo}>
                          <MaterialCommunityIcons name="shield-alert" size={16} color="#ef4444" />
                          <Text style={styles.websiteFlags}>{website.threats} threats detected</Text>
                        </View>
                        <View style={[
                          styles.changeBadge,
                          { backgroundColor: website.change.startsWith('+') ? '#fef2f2' : '#f0fdf4' }
                        ]}>
                          <MaterialCommunityIcons
                            name={website.change.startsWith('+') ? 'trending-up' : 'trending-down'}
                            size={12}
                            color={website.change.startsWith('+') ? '#ef4444' : '#10b981'}
                          />
                          <Text style={[
                            styles.changeText,
                            { color: website.change.startsWith('+') ? '#ef4444' : '#10b981' }
                          ]}>
                            {website.change}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </View>
                </View>
              </View>
            ))}
          </Animated.View>
        )}
      </Animated.View>

      {/* Bottom Sheet Menu */}
      <Modal
        visible={isMenuOpen}
        transparent={true}
        animationType="slide"
        onRequestClose={toggleMenu}
        statusBarTranslucent={true}
      >
        <View style={styles.overlay}>
          <TouchableOpacity style={styles.overlayTouchable} onPress={toggleMenu} />
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
                           index === 1 ? 'Comprehensive detection insights' :
                           index === 2 ? 'Website monitoring & stats' :
                           'User activity & interactions'}
                        </Text>
                      </View>
                      <MaterialCommunityIcons name="chevron-right" size={20} color="#9ca3af" />
                    </TouchableOpacity>
                  ))}
                </View>
                
                {/* Debug: Show menu items count */}
                <View style={styles.debugSection}>
                  <Text style={styles.debugText}>Menu Items: {sideMenuItems.length}</Text>
                </View>
              </ScrollView>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    paddingHorizontal: 20,
    paddingBottom: 20,
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  backButton: {
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
  placeholder: {
    width: 40,
  },
  timeRangeContainer: {
    marginBottom: 24,
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    padding: 16,
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
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    color: '#374151',
  },
  sectionBadge: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  sectionBadgeText: {
    fontSize: 10,
    fontFamily: 'Poppins-SemiBold',
    color: '#6b7280',
    textTransform: 'uppercase',
  },
  loadingCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 40,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#f3f4f6',
  },
  loadingText: {
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    color: '#6b7280',
    marginTop: 12,
  },
  errorCard: {
    backgroundColor: '#fef2f2',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#fecaca',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
  },
  errorText: {
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    color: '#ef4444',
    textAlign: 'center',
  },
  emptyCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 40,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#f3f4f6',
  },
  emptyText: {
    fontSize: 16,
    fontFamily: 'Poppins-Medium',
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#9ca3af',
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  statCard: {
    width: (width - 60) / 2,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#f3f4f6',
    minHeight: 100,
    justifyContent: 'center',
  },
  statValue: {
    fontSize: 20,
    fontFamily: 'Poppins-Bold',
    color: '#111827',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 10,
    fontFamily: 'Poppins-Medium',
    color: '#9ca3af',
    textAlign: 'center',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statChange: {
    fontSize: 12,
    fontFamily: 'Poppins-SemiBold',
    color: '#6b7280',
  },
  chartContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#f3f4f6',
    overflow: 'hidden',
    minHeight: 260,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  barChartScroll: {
    width: '100%',
  },
  barChartScrollContent: {
    paddingHorizontal: 10,
    alignItems: 'center',
  },
  websitesContainer: {
    gap: 16,
    paddingBottom: 8,
  },
  websiteItem: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
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
  websiteCard: {
    padding: 16,
  },
  websiteMainInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  websiteIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E8F5F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  websiteContent: {
    flex: 1,
    gap: 8,
  },
  websiteTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  websiteBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  threatInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  websiteName: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    color: '#111827',
    flex: 1,
  },
  riskBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  riskDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  riskText: {
    fontSize: 10,
    fontFamily: 'Poppins-Bold',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  websiteFlags: {
    fontSize: 12,
    fontFamily: 'Poppins-Medium',
    color: '#6b7280',
  },
  changeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  changeText: {
    fontSize: 11,
    fontFamily: 'Poppins-SemiBold',
  },
  summaryContainer: {
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    padding: 20,
  },
  summaryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  summaryText: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#374151',
    marginLeft: 12,
  },
  statNumber: {
    fontSize: 20,
    fontFamily: 'Poppins-Medium',
    color: '#111827',
    marginBottom: 4,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  overlayTouchable: {
    flex: 1,
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
    paddingBottom: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 10,
    maxHeight: '90%',
    minHeight: 400,
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
  menuTitle: {
    fontSize: 18,
    fontFamily: 'Poppins-SemiBold',
    color: '#111827',
  },
  menuScroll: {
    flex: 1,
    paddingBottom: 20,
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
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  menuItemIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#f3f4f6',
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
    marginBottom: 2,
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
  debugSection: {
    padding: 16,
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    marginTop: 16,
  },
  debugText: {
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    color: '#6b7280',
    textAlign: 'center',
  },
});

export default WebsiteAnalyticsScreen;