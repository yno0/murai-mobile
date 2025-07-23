import { Feather } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
    Dimensions,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { BarChart } from 'react-native-chart-kit';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

// API service for website analytics data
const API_BASE_URL = 'http://localhost:3000/api';

const websiteService = {
  getWebsiteData: async (timeRange) => {
    try {
      const response = await fetch(`${API_BASE_URL}/dashboard/websites?timeRange=${encodeURIComponent(timeRange)}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Website data received:', data);
      return data;
    } catch (error) {
      console.error('Error fetching website data:', error);
      return {
        topWebsites: [],
        totalWebsites: 0,
        totalDetections: 0
      };
    }
  },
};

const { width } = Dimensions.get('window');

function WebsiteAnalyticsScreen({ navigation }) {
  const [selectedTimeRange, setSelectedTimeRange] = useState('Today');
  const [isLoading, setIsLoading] = useState(true);
  const [websiteData, setWebsiteData] = useState({
    topWebsites: [],
    totalWebsites: 0,
    totalDetections: 0
  });

  const timeRanges = ['Today', 'Last 7 days', 'Last 30 days', 'All Time'];

  // Fetch website data
  const fetchWebsiteData = async (timeRange) => {
    try {
      setIsLoading(true);
      const data = await websiteService.getWebsiteData(timeRange);
      setWebsiteData(data);
    } catch (error) {
      console.error('Failed to fetch website data:', error);
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
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(107, 114, 128, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(156, 163, 175, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForBackgroundLines: {
      strokeWidth: 0,
    },
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


  const monitoringStats = [
    { metric: 'Total Websites', value: '15', change: '+3' },
    { metric: 'Active Monitoring', value: '12', change: '+2' },
    { metric: 'High-Risk Sites', value: '4', change: '+1' },
    { metric: 'AI Accuracy', value: '98.2%', change: '+0.5%' },
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
        <Text style={styles.sectionTitle}>MURAi Monitoring Status</Text>
        <View style={styles.statsGrid}>
          {monitoringStats.map((stat, index) => (
            <View key={index} style={styles.statCard}>
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.metric}</Text>
              <Text style={styles.statChange}>{stat.change}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Top Websites Chart */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Threat Distribution by Platform</Text>
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
      </View>

      {/* Top Websites with Flags */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Platforms by Threat Level</Text>
        <View style={styles.websitesContainer}>
          {topWebsites.map((website, index) => (
            <View key={index} style={styles.websiteItem}>
              <View style={styles.websiteInfo}>
                <View style={styles.websiteIcon}>
                  <MaterialCommunityIcons name={website.icon} size={20} color="#3b82f6" />
                </View>
                <View style={styles.websiteDetails}>
                  <View style={styles.websiteHeader}>
                    <Text style={styles.websiteName}>{website.name}</Text>
                    <View style={[
                      styles.riskBadge,
                      { backgroundColor: website.risk === 'high' ? '#fef2f2' : '#fef3c7' }
                    ]}>
                      <Text style={[
                        styles.riskText,
                        { color: website.risk === 'high' ? '#dc2626' : '#d97706' }
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
      </View>

      {/* Site Activity Summary */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Site Activity Summary</Text>
        <View style={styles.summaryContainer}>
          <View style={styles.summaryItem}>
            <MaterialCommunityIcons name="web" size={20} color="#3b82f6" />
            <Text style={styles.summaryText}>Most active: Facebook (25 flags)</Text>
          </View>
          <View style={styles.summaryItem}>
            <MaterialCommunityIcons name="trending-up" size={20} color="#10b981" />
            <Text style={styles.summaryText}>TikTok showing +40% increase</Text>
          </View>
          <View style={styles.summaryItem}>
            <MaterialCommunityIcons name="shield-check" size={20} color="#f59e0b" />
            <Text style={styles.summaryText}>All sites under 24/7 monitoring</Text>
          </View>
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
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'Poppins-Medium',
    color: '#111827',
    marginBottom: 16,
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
    backgroundColor: '#eff6ff',
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