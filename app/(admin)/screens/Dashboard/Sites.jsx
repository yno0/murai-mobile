import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Dimensions,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { BarChart, PieChart } from 'react-native-chart-kit';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import MainHeader from '../../../components/common/MainHeader';

const API_BASE_URL = 'http://localhost:3000/api';

const sitesService = {
  getWebsites: async (timeRange) => {
    try {
      console.log(`Fetching websites data for timeRange: ${timeRange}`);
      const response = await fetch(`${API_BASE_URL}/dashboard/websites?timeRange=${encodeURIComponent(timeRange)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log(`API Response status: ${response.status}`);

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`API Error: ${response.status} - ${errorText}`);
        throw new Error(`Failed to fetch websites data: ${response.status}`);
      }

      const data = await response.json();
      console.log('Raw API response:', data);

      // Validate the response structure
      if (!data || typeof data !== 'object') {
        throw new Error('Invalid response format from API');
      }

      return data;
    } catch (error) {
      console.error('Sites service error:', error);
      throw error;
    }
  },
};

export default function AdminSitesScreen({ navigation }) {
  const [selectedTimeRange, setSelectedTimeRange] = useState('Today');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [sitesData, setSitesData] = useState({
    websites: null,
  });

  const timeRanges = ['Today', 'Last 7 days', 'Last 30 days', 'All Time'];
  const { width } = Dimensions.get('window');

  const fetchSitesData = async (timeRange) => {
    try {
      setIsLoading(true);
      setError(null);
      const websites = await sitesService.getWebsites(timeRange);

      setSitesData({
        websites,
      });

      // Debug logging to help identify the issue
      console.log(`Sites data for ${timeRange}:`, {
        totalWebsites: websites.totalWebsites,
        totalDetections: websites.totalDetections,
        topWebsitesCount: websites.topWebsites?.length || 0,
        riskLevels: websites.topWebsites?.map(site => ({
          domain: site.domain,
          riskLevel: site.riskLevel,
          detectionCount: site.detectionCount,
          accuracy: site.accuracy
        })) || []
      });
    } catch (error) {
      console.error("Failed to fetch sites data:", error);
      setError("Failed to load sites data. Please try again later.");
      setSitesData({
        websites: {
          topWebsites: [],
          totalWebsites: 0,
          totalDetections: 0
        },
      });
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const onRefresh = () => {
    setIsRefreshing(true);
    fetchSitesData(selectedTimeRange);
  };

  useEffect(() => {
    fetchSitesData(selectedTimeRange);
  }, [selectedTimeRange]);

  // Process data for display
  const calculateHighRiskSites = () => {
    if (!sitesData.websites?.topWebsites) return 0;

    // Count high-risk sites using multiple criteria for better accuracy
    const highRiskSites = sitesData.websites.topWebsites.filter(site => {
      // Primary: Use riskLevel if available
      if (site.riskLevel === 'high') return true;

      // Fallback: High detection count (relative to average)
      const avgDetections = sitesData.websites.topWebsites.reduce((sum, s) => sum + s.detectionCount, 0) / sitesData.websites.topWebsites.length;
      const isHighActivity = site.detectionCount > avgDetections * 1.5;

      // Fallback: Low accuracy indicates potential issues
      const isLowAccuracy = site.accuracy && site.accuracy < 85;

      return isHighActivity || isLowAccuracy;
    });

    return highRiskSites.length;
  };

  const siteStats = sitesData.websites ? [
    { label: 'Total Sites', value: sitesData.websites.totalWebsites || 0 },
    { label: 'Total Detections', value: sitesData.websites.totalDetections || 0 },
    { label: 'High-Risk Sites', value: calculateHighRiskSites() },
  ] : [
    { label: 'Total Sites', value: 0 },
    { label: 'Total Detections', value: 0 },
    { label: 'High-Risk Sites', value: 0 },
  ];

  // Get top sites for charts
  const topSites = sitesData.websites?.topWebsites?.slice(0, 6) || [];

  // Clean domain names by removing common TLDs and www
  const cleanDomainName = (domain) => {
    let cleaned = domain.toLowerCase()
      .replace(/^www\./, '') // Remove www.
      .replace(/\.(com|net|org|edu|gov|co\.uk|co|io|app|dev)$/, '') // Remove common TLDs
      .replace(/\.(facebook|twitter|instagram|youtube|tiktok|reddit|linkedin)\..*/, '$1'); // Handle subdomains of major sites

    // Capitalize first letter
    cleaned = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);

    // Truncate if still too long
    return cleaned.length > 12 ? cleaned.substring(0, 12) + '...' : cleaned;
  };

  const siteLabels = topSites.map(site => cleanDomainName(site.domain));
  const siteDetections = topSites.map(site => site.detectionCount);

  // Create site type distribution from actual data
  const siteTypeMap = {};
  sitesData.websites?.topWebsites?.forEach(site => {
    // Extract site type from domain or use 'Other'
    let siteType = 'Other';
    const domain = site.domain.toLowerCase();
    if (domain.includes('facebook') || domain.includes('twitter') || domain.includes('instagram') || domain.includes('tiktok') || domain.includes('linkedin')) {
      siteType = 'Social Media';
    } else if (domain.includes('reddit') || domain.includes('forum')) {
      siteType = 'Forums';
    } else if (domain.includes('blog') || domain.includes('wordpress')) {
      siteType = 'Blogs';
    } else if (domain.includes('news') || domain.includes('cnn') || domain.includes('bbc')) {
      siteType = 'News Sites';
    }

    siteTypeMap[siteType] = (siteTypeMap[siteType] || 0) + site.detectionCount;
  });

  // Calculate total for percentages
  const totalSiteDetections = Object.values(siteTypeMap).reduce((sum, count) => sum + count, 0);

  const siteTypeData = Object.entries(siteTypeMap).map(([type, count], index) => {
    const percentage = totalSiteDetections > 0 ? ((count / totalSiteDetections) * 100).toFixed(1) : 0;
    const balancedColors = [
      '#34D399', // Medium emerald
      '#60A5FA', // Medium blue
      '#A78BFA', // Medium purple
      '#FBBF24', // Medium amber
      '#F87171', // Medium red
      '#22D3EE', // Medium cyan
      '#A3E635', // Medium lime
      '#FB923C', // Medium orange
      '#F472B6', // Medium pink
      '#818CF8', // Medium indigo
    ];

    return {
      name: `${type} (${percentage}%)`,
      population: count,
      color: balancedColors[index % balancedColors.length],
      legendFontColor: '#374151', // Darker gray for better readability
      legendFontSize: 11,
      legendFontFamily: 'Poppins-Medium',
    };
  });

  // Clean domain names for Most Active Sites
  const cleanSiteName = (domain) => {
    if (!domain) return 'Unknown Site';

    let cleaned = domain.toLowerCase()
      .replace(/^www\./, '') // Remove www.
      .replace(/\.(com|net|org|edu|gov|co\.uk|co|io|app|dev|ly|me|tv)$/, '') // Remove common TLDs
      .replace(/^(m\.|mobile\.|api\.|cdn\.)/, '') // Remove common subdomains
      .replace(/\.(facebook|twitter|instagram|youtube|tiktok|reddit|linkedin)\..*/, '$1'); // Handle major site subdomains

    // Capitalize first letter and handle special cases
    if (cleaned === 'facebook') return 'Facebook';
    if (cleaned === 'twitter') return 'Twitter';
    if (cleaned === 'instagram') return 'Instagram';
    if (cleaned === 'youtube') return 'YouTube';
    if (cleaned === 'tiktok') return 'TikTok';
    if (cleaned === 'reddit') return 'Reddit';
    if (cleaned === 'linkedin') return 'LinkedIn';

    // Capitalize first letter for other domains
    return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
  };

  const mostActiveSites = sitesData.websites?.topWebsites?.slice(0, 5).map(site => ({
    name: cleanSiteName(site.domain),
    originalDomain: site.domain, // Keep original for debugging
    detections: site.detectionCount || 0,
    riskLevel: site.riskLevel || 'unknown',
    accuracy: site.accuracy ? Math.round(site.accuracy) : 0
  })) || [];

  // Debug logging for Most Active Sites
  console.log('Most Active Sites processed:', mostActiveSites);

  // Removed unused barChartData - data is now inline in the component

  // Chart configurations are now inline to avoid unused variables

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={onRefresh}
          colors={['#3b82f6']}
          tintColor={'#3b82f6'}
        />
      }
    >
      <MainHeader
        title="Sites"
        subtitle="Sites analytics and details"
        rightActions={[
          {
            icon: 'arrow-left',
            iconType: 'feather',
            onPress: () => navigation.goBack()
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

      {error ? (
        <View style={styles.errorContainer}>
          <MaterialCommunityIcons name="alert-circle-outline" size={24} color="#ef4444" />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3b82f6" />
          <Text style={styles.loadingText}>Loading sites data...</Text>
        </View>
      ) : (
        <>
          {/* Site Stats */}
          <View style={styles.overallStatsContainer}>
            {siteStats.map((item, idx) => (
              <View key={idx} style={styles.statCard}>
                <Text style={styles.statValue}>{item.value}</Text>
                <Text style={styles.statLabel}>{item.label}</Text>
              </View>
            ))}
          </View>

          {/* Detections Per Site Bar Chart */}
          {topSites.length > 0 && (
            <View style={styles.chartContainer}>
              <View style={styles.chartHeader}>
                <Text style={styles.chartTitle}>Detections Per Site ({selectedTimeRange})</Text>
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <BarChart
                  data={{
                    labels: siteLabels,
                    datasets: [
                      {
                        data: siteDetections,
                        colors: siteDetections.map((_, index) => {
                          const colors = [
                            '#01B97F', // Primary theme
                            '#059669', // Emerald variant
                            '#10B981', // Emerald light
                            '#065F46', // Emerald dark
                            '#6B7280', // Gray
                            '#374151', // Dark gray
                            '#9CA3AF', // Light gray
                            '#D1D5DB', // Very light gray
                          ];
                          return (opacity = 1) => colors[index % colors.length] || '#01B97F';
                        }),
                      },
                    ],
                  }}
                  width={Math.max((siteLabels.length * 80), width - 40)}
                  height={220}
                  chartConfig={{
                    backgroundColor: 'transparent',
                    backgroundGradientFrom: '#ffffff',
                    backgroundGradientTo: '#ffffff',
                    decimalPlaces: 0,
                    color: (opacity = 1) => `rgba(107, 114, 128, ${opacity})`,
                    labelColor: (opacity = 1) => `rgba(75, 85, 99, ${opacity})`,
                    style: { borderRadius: 16 },
                    propsForBackgroundLines: {
                      strokeWidth: 1,
                      stroke: '#f3f4f6',
                      strokeDasharray: '5,5'
                    },
                    propsForLabels: {
                      fontSize: 11,
                      fontFamily: 'Poppins-Medium'
                    },
                    fillShadowGradient: '#4F46E5',
                    fillShadowGradientOpacity: 0.3,
                  }}
                  style={styles.chart}
                  fromZero
                  showBarTops={false}
                  showValuesOnTopOfBars
                  withCustomBarColorFromData
                  flatColor={false}
                  withInnerLines
                  withHorizontalLabels
                  withVerticalLabels
                />
              </ScrollView>
              <View style={styles.chartLegend}>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: '#01B97F' }]} />
                  <Text style={styles.legendText}>Detection Count</Text>
                </View>
              </View>
            </View>
          )}

          {/* Site Type Distribution Pie Chart */}
          {siteTypeData.length > 0 && (
            <View style={styles.chartContainer}>
              <View style={styles.chartHeader}>
                <Text style={styles.chartTitle}>Site Type Distribution</Text>
                <Text style={styles.chartSubtitle}>Based on detection activity</Text>
              </View>
              <View style={styles.pieChartWrapper}>
                <PieChart
                  data={siteTypeData}
                  width={width - 40}
                  height={280}
                  chartConfig={{
                    backgroundColor: 'transparent',
                    color: (opacity = 1) => `rgba(1, 185, 127, ${opacity})`,
                    labelColor: (opacity = 1) => `rgba(55, 65, 81, ${opacity})`,
                    style: {
                      borderRadius: 16,
                    },
                  }}
                  accessor="population"
                  backgroundColor="transparent"
                  paddingLeft="15"
                  center={[0, 10]}
                  absolute={false}
                  hasLegend={true}
                  avoidFalseZero={true}
                />
              </View>
              <View style={styles.pieChartSummary}>
                <Text style={styles.summaryText}>
                  Total Detections: <Text style={styles.summaryValue}>{totalSiteDetections}</Text>
                </Text>
                <Text style={styles.summarySubtext}>
                  Across {siteTypeData.length} site categories
                </Text>
              </View>
            </View>
          )}

          {/* Most Active Sites */}
          <View style={styles.analyticsSectionContainer}>
            <Text style={styles.analyticsSectionTitle}>Most Active Sites</Text>
            <View style={styles.analyticsList}>
              {mostActiveSites.map((site, idx) => (
                <View key={idx} style={styles.analyticsListItem}>
                  <View style={styles.siteInfo}>
                    <Text style={styles.analyticsListItemText}>{site.name}</Text>
                    <View style={styles.siteMetrics}>
                      <Text style={styles.siteDetections}>{site.detections} detections</Text>
                      <View style={[styles.riskBadge, { backgroundColor: getRiskColor(site.riskLevel) }]}>
                        <Text style={[styles.riskText, { color: getRiskTextColor(site.riskLevel) }]}>
                          {site.riskLevel?.toUpperCase() || 'UNKNOWN'}
                        </Text>
                      </View>
                    </View>
                  </View>
                  <View style={styles.siteStats}>
                    <Text style={styles.accuracyText}>{site.accuracy}% accuracy</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        </>
      )}
    </ScrollView>
  );
}

// Helper functions for risk level styling
const getRiskColor = (riskLevel) => {
  switch (riskLevel) {
    case 'high': return '#fee2e2';
    case 'medium': return '#fef3c7';
    case 'low': return '#e8f5f0';
    default: return '#f3f4f6';
  }
};

const getRiskTextColor = (riskLevel) => {
  switch (riskLevel) {
    case 'high': return '#dc2626';
    case 'medium': return '#d97706';
    case 'low': return '#01B97F';
    default: return '#6b7280';
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    paddingHorizontal: 10,
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
    marginBottom: 4,
  },
  chartSubtitle: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: '#6b7280',
    marginBottom: 15,
  },
  pieChartWrapper: {
    alignItems: 'center',
    marginVertical: 10,
  },
  pieChartSummary: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    alignItems: 'center',
  },
  summaryText: {
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    color: '#374151',
    textAlign: 'center',
  },
  summaryValue: {
    fontSize: 14,
    fontFamily: 'Poppins-SemiBold',
    color: '#01B97F',
  },
  summarySubtext: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 4,
  },
  analyticsSectionContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 30,
    borderWidth: 1,
    borderColor: '#f3f4f6',
  },
  analyticsSectionTitle: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    color: '#111827',
    marginBottom: 16,
  },
  analyticsList: {
    gap: 10,
  },
  analyticsListItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  analyticsListItemText: {
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    color: '#374151',
  },
  analyticsListItemValue: {
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    color: '#111827',
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
    backgroundColor: '#01B97F',
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
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  chartLegend: {
    flexDirection: 'row',
    justifyContent: 'center',
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
  siteInfo: {
    flex: 1,
  },
  siteMetrics: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 8,
  },
  siteDetections: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: '#6b7280',
  },
  riskBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  riskText: {
    fontSize: 10,
    fontFamily: 'Poppins-Medium',
    letterSpacing: 0.5,
  },
  siteStats: {
    alignItems: 'flex-end',
  },
  accuracyText: {
    fontSize: 12,
    fontFamily: 'Poppins-Medium',
    color: '#01B97F',
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
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: '#ef4444',
    marginBottom: 20,
  },
  errorText: {
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    color: '#ef4444',
    marginTop: 8,
    textAlign: 'center',
  },
});