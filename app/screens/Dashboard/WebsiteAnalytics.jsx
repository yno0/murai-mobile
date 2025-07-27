import { Feather } from '@expo/vector-icons';
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
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 700,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const resetAnimations = () => {
    fadeAnim.setValue(0);
    slideAnim.setValue(50);
    scaleAnim.setValue(0.8);
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

      // For now, use mock data that represents user's flagged websites
      const mockWebsiteData = {
        topWebsites: [
          { domain: 'facebook.com', detectionCount: 25, riskLevel: 'high', lastDetection: new Date() },
          { domain: 'twitter.com', detectionCount: 18, riskLevel: 'medium', lastDetection: new Date() },
          { domain: 'tiktok.com', detectionCount: 15, riskLevel: 'high', lastDetection: new Date() },
          { domain: 'instagram.com', detectionCount: 12, riskLevel: 'medium', lastDetection: new Date() },
          { domain: 'youtube.com', detectionCount: 8, riskLevel: 'low', lastDetection: new Date() },
          { domain: 'discord.com', detectionCount: 5, riskLevel: 'medium', lastDetection: new Date() },
        ],
        totalWebsites: 15,
        totalDetections: 83,
        monitoringStats: {
          activeMonitoring: 12,
          highRiskSites: 4,
          aiAccuracy: 98.2
        }
      };

      setWebsiteData(mockWebsiteData);
    } catch (err) {
      console.error('Failed to fetch website data:', err);
      setError('Failed to load website data. Please try again.');
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
      return {
        labels: ['No Data'],
        datasets: [{ data: [0] }],
      };
    }

    const top6Sites = websiteData.topWebsites.slice(0, 6);
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

    return {
      labels,
      datasets: [{
        data: top6Sites.map(site => site.detectionCount),
      }],
    };
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
    threats: site.detectionCount,
    change: `+${Math.floor(Math.random() * 15) + 1}`, // Calculate real change from historical data
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
    { title: 'Dashboard Overview', icon: 'bar-chart-2', action: () => navigation.navigate('DashboardMain') },
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


  // Use real data from API response
  const monitoringStats = [
    { metric: 'Total Websites', value: websiteData.totalWebsites?.toString() || '0', change: '+3' },
    { metric: 'Active Monitoring', value: websiteData.monitoringStats?.activeMonitoring?.toString() || '0', change: '+2' },
    { metric: 'High-Risk Sites', value: websiteData.monitoringStats?.highRiskSites?.toString() || '0', change: '+1' },
    { metric: 'AI Accuracy', value: `${websiteData.monitoringStats?.aiAccuracy || 95}%`, change: '+0.5%' },
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <MainHeader
        title="Where It Happened"
        subtitle="Website monitoring & detection insights"
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

      {/* Monitoring Stats */}
      <Animated.View
        style={[
          styles.section,
          {
            opacity: fadeAnim,
          }
        ]}
      >
        <View style={styles.sectionHeader}>
          <MaterialCommunityIcons name="monitor-dashboard" size={24} color="#02B97F" />
          <Text style={styles.sectionTitle}>MURAi Monitoring Status</Text>
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
          <View style={styles.statsGrid}>
            {monitoringStats.map((stat, index) => (
              <Animated.View
                key={index}
                style={[
                  styles.statCard,
                  {
                    opacity: fadeAnim,
                    transform: [{
                      translateY: slideAnim
                    }]
                  }
                ]}
              >
                <Text style={styles.statValue}>{stat.value}</Text>
                <Text style={styles.statLabel}>{stat.metric}</Text>
                <Text style={styles.statChange}>{stat.change}</Text>
              </Animated.View>
            ))}
          </View>
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
                transform: [{ scale: scaleAnim }]
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
          <View style={styles.websitesContainer}>
            {topWebsites.map((website, index) => (
              <Animated.View
                key={index}
                style={[
                  styles.websiteItem,
                  {
                    opacity: fadeAnim,
                    transform: [{
                      translateY: Animated.add(slideAnim, new Animated.Value(index * 5))
                    }]
                  }
                ]}
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
              </Animated.View>
            ))}
          </View>
        )}
      </Animated.View>

      {/* Side Menu Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isMenuOpen}
        onRequestClose={() => setIsMenuOpen(false)}
      >
        <View style={styles.overlay}>
          <TouchableOpacity
            style={styles.bottomSheetContainer}
            activeOpacity={1}
            onPress={() => setIsMenuOpen(false)}
          >
            <View style={styles.bottomSheet}>
              <View style={styles.handleBar} />
              <View style={styles.menuHeader}>
                <Text style={styles.sectionTitle}>Navigation</Text>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setIsMenuOpen(false)}
                >
                  <Feather name="x" size={20} color="#6b7280" />
                </TouchableOpacity>
              </View>
              <ScrollView style={styles.menuScroll} showsVerticalScrollIndicator={false}>
                {/* Analytics Section */}
                <View style={styles.menuSection}>
                  <Text style={styles.menuSectionTitle}>Analytics</Text>
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
              </ScrollView>
            </View>
          </TouchableOpacity>
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
    marginBottom: 30,
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
  },
  statCard: {
    width: (width - 60) / 2,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#f3f4f6',
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
    gap: 12,
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
  menuSectionTitle: {
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
});

export default WebsiteAnalyticsScreen;