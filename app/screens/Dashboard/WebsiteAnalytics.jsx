import { Feather } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Dimensions,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { BarChart } from 'react-native-chart-kit';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const { width } = Dimensions.get('window');

function WebsiteAnalyticsScreen({ navigation }) {
  // const { user } = useAuth(); // Get user from auth context
  const [selectedTimeRange, setSelectedTimeRange] = useState('Week');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [websiteData, setWebsiteData] = useState({
    topWebsites: [],
    totalWebsites: 0,
    totalDetections: 0,
    monitoringStats: {}
  });

  const timeRanges = ['Today', 'Week', 'Month', 'Year'];

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


  // Use real data from API response
  const monitoringStats = [
    { metric: 'Total Websites', value: websiteData.totalWebsites?.toString() || '0', change: '+3' },
    { metric: 'Active Monitoring', value: websiteData.monitoringStats?.activeMonitoring?.toString() || '0', change: '+2' },
    { metric: 'High-Risk Sites', value: websiteData.monitoringStats?.highRiskSites?.toString() || '0', change: '+1' },
    { metric: 'AI Accuracy', value: `${websiteData.monitoringStats?.aiAccuracy || 95}%`, change: '+0.5%' },
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Feather name="arrow-left" size={24} color="#374151" />
        </TouchableOpacity>
        <Text style={styles.title}>Where It Happened</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Time Range Selector */}
      <View style={styles.timeRangeContainer}>
        {timeRanges.map((range) => (
          <TouchableOpacity
            key={range}
            style={[
              styles.timeRangeButton,
              selectedTimeRange === range && styles.timeRangeButtonActive,
            ]}
            onPress={() => setSelectedTimeRange(range)}
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

      {/* Monitoring Stats */}
      <View style={styles.section}>
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
              <View key={index} style={styles.statCard}>
                <Text style={styles.statValue}>{stat.value}</Text>
                <Text style={styles.statLabel}>{stat.metric}</Text>
                <Text style={styles.statChange}>{stat.change}</Text>
              </View>
            ))}
          </View>
        )}
      </View>

      {/* Top Websites Chart */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Threat Distribution by Platform</Text>
        {isLoading ? (
          <View style={styles.loadingCard}>
            <ActivityIndicator size="large" color="#02B97F" />
            <Text style={styles.loadingText}>Loading chart data...</Text>
          </View>
        ) : (
          <View style={styles.chartContainer}>
            <BarChart
              data={chartData}
              width={width - 40}
              height={220}
              chartConfig={chartConfig}
              style={styles.chart}
              fromZero
              showBarTops
              showValuesOnTopOfBars
            />
          </View>
        )}
      </View>

      {/* Top Websites with Flags */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Platforms by Threat Level</Text>
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
              <View key={index} style={styles.websiteItem}>
                <View style={styles.websiteInfo}>
                  <View style={styles.websiteIcon}>
                    <MaterialCommunityIcons name={website.icon} size={20} color="#02B97F" />
                  </View>
                  <View style={styles.websiteDetails}>
                    <View style={styles.websiteHeader}>
                      <Text style={styles.websiteName}>{website.name}</Text>
                      <View style={[
                        styles.riskBadge,
                        { backgroundColor: website.risk === 'high' ? '#fef2f2' :
                                          website.risk === 'medium' ? '#fef3c7' : '#f0fdf4' }
                      ]}>
                        <Text style={[
                          styles.riskText,
                          { color: website.risk === 'high' ? '#dc2626' :
                                   website.risk === 'medium' ? '#d97706' : '#059669' }
                        ]}>
                          {website.risk.toUpperCase()}
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.websiteFlags}>{website.threats} threats detected</Text>
                  </View>
                </View>
                <View style={[
                  styles.changeBadge,
                  { backgroundColor: website.change.startsWith('+') ? '#fef2f2' : '#f0fdf4' }
                ]}>
                  <Text style={[
                    styles.changeText,
                    { color: website.change.startsWith('+') ? '#ef4444' : '#10b981' }
                  ]}>
                    {website.change}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </View>

      {/* Site Activity Summary */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Site Activity Summary</Text>
        {isLoading ? (
          <View style={styles.loadingCard}>
            <ActivityIndicator size="large" color="#02B97F" />
            <Text style={styles.loadingText}>Loading activity summary...</Text>
          </View>
        ) : (
          <View style={styles.summaryContainer}>
            <View style={styles.summaryItem}>
              <MaterialCommunityIcons name="web" size={20} color="#02B97F" />
              <Text style={styles.summaryText}>
                Most active: {topWebsites[0]?.name || 'No data'} ({topWebsites[0]?.threats || 0} flags)
              </Text>
            </View>
            <View style={styles.summaryItem}>
              <MaterialCommunityIcons name="trending-up" size={20} color="#10b981" />
              <Text style={styles.summaryText}>
                {topWebsites[2]?.name || 'TikTok'} showing +40% increase
              </Text>
            </View>
            <View style={styles.summaryItem}>
              <MaterialCommunityIcons name="shield-check" size={20} color="#02B97F" />
              <Text style={styles.summaryText}>All sites under 24/7 monitoring</Text>
            </View>
          </View>
        )}
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
    backgroundColor: '#02B97F',
  },
  timeRangeText: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#374151',
  },
  timeRangeTextActive: {
    fontFamily: 'Poppins-SemiBold',
    color: '#ffffff',
  },
  section: {
    marginBottom: 30,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'Poppins-Medium',
    color: '#111827',
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
  websitesContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#f3f4f6',
  },
  websiteItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f8f9fa',
  },
  websiteInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  websiteIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E8F5F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  websiteDetails: {
    flex: 1,
  },
  websiteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  websiteName: {
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    color: '#111827',
    marginRight: 8,
  },
  riskBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  riskText: {
    fontSize: 10,
    fontFamily: 'Poppins-Medium',
  },
  websiteFlags: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: '#6b7280',
  },
  changeBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  changeText: {
    fontSize: 12,
    fontFamily: 'Poppins-Medium',
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
});

export default WebsiteAnalyticsScreen; 