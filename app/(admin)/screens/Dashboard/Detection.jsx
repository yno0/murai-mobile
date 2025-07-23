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
import { LineChart, PieChart } from 'react-native-chart-kit';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import MainHeader from '../../../components/common/MainHeader';

const API_BASE_URL = 'http://localhost:3000/api';

const detectionService = {
  getFlaggedWords: async (timeRange) => {
    try {
      const response = await fetch(`${API_BASE_URL}/dashboard/flagged-words?timeRange=${encodeURIComponent(timeRange)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      throw error;
    }
  },
  getActivityChart: async (timeRange) => {
    try {
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
      return data;
    } catch (error) {
      throw error;
    }
  },
};

export default function AdminDetectionScreen({ navigation }) {
  const [selectedTimeRange, setSelectedTimeRange] = useState('Today');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [detectionData, setDetectionData] = useState({
    flaggedWords: null,
    chartData: null,
  });

  const timeRanges = ['Today', 'Last 7 days', 'Last 30 days', 'All Time'];
  const { width } = Dimensions.get('window');

  const fetchDetectionData = async (timeRange) => {
    try {
      setIsLoading(true);
      setError(null);
      const [flaggedWords, chartData] = await Promise.all([
        detectionService.getFlaggedWords(timeRange),
        detectionService.getActivityChart(timeRange),
      ]);

      setDetectionData({
        flaggedWords,
        chartData,
      });
    } catch (error) {
      console.error("Failed to fetch detection data:", error);
      setError("Failed to load detection data. Please try again later.");
      setDetectionData({
        flaggedWords: {
          topWords: [],
          recentDetections: [],
          totalCount: 0,
          summary: { avgAccuracy: 0, avgResponseTime: 0 }
        },
        chartData: {
          labels: ['', '', '', '', '', '', ''],
          datasets: [{ label: 'Detections', data: [0, 0, 0, 0, 0, 0, 0] }],
        },
      });
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const onRefresh = () => {
    setIsRefreshing(true);
    fetchDetectionData(selectedTimeRange);
  };

  useEffect(() => {
    fetchDetectionData(selectedTimeRange);
  }, [selectedTimeRange]);

  // Process data for charts and display
  const summaryStats = detectionData.flaggedWords ? [
    { label: 'Total Detections', value: detectionData.flaggedWords.totalCount || 0 },
    { label: 'Unique Words', value: detectionData.flaggedWords.topWords?.length || 0 },
    { label: 'Avg Accuracy', value: `${(detectionData.flaggedWords.summary?.avgAccuracy || 0).toFixed(1)}%` },
  ] : [
    { label: 'Total Detections', value: 0 },
    { label: 'Unique Words', value: 0 },
    { label: 'Avg Accuracy', value: '0%' },
  ];

  // Create trending patterns from top words
  const trendingPatterns = detectionData.flaggedWords?.topWords?.slice(0, 5).map((word, index) => ({
    pattern: word.word,
    count: word.count,
    change: '+' + Math.floor(Math.random() * 15 + 1) + '%', // Mock change data
    color: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966CC'][index] || '#FF6384',
    severity: word.severity
  })) || [];

  const detectedWords = detectionData.flaggedWords?.recentDetections?.slice(0, 8).map(detection => ({
    id: detection.id,
    word: detection.word,
    type: detection.severity || 'Unknown',
    timestamp: detection.timestamp,
    context: detection.context,
    user: detection.user
  })) || [];

  // Chart data processing
  const chartLabels = detectionData.chartData?.labels || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const chartDetections = detectionData.chartData?.datasets?.[0]?.data || [0, 0, 0, 0, 0, 0, 0];

  const lineChartData = {
    labels: chartLabels,
    datasets: [
      {
        data: chartDetections,
        strokeWidth: 2,
        color: (opacity = 1) => `rgba(79, 70, 229, ${opacity})`,
        fillShadowGradient: 'rgba(79, 70, 229, 0.1)',
        fillShadowGradientOpacity: 0.1,
      },
    ],
  };

  const lineChartConfig = {
    backgroundColor: 'transparent',
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(107, 114, 128, ${opacity})`, // Gray 500
    labelColor: (opacity = 1) => `rgba(156, 163, 175, ${opacity})`, // Gray 400
    style: { borderRadius: 16 },
    propsForDots: { r: '4', strokeWidth: '2', stroke: '#4F46E5' }, // Indigo 600
    propsForBackgroundLines: { strokeWidth: 0.5, stroke: '#e5e7eb' }, // Gray 200
    withHorizontalLabels: true,
    withVerticalLabels: true,
    withInnerLines: true,
    withOuterLines: false,
  };

  const pieChartData = trendingPatterns.map(item => ({
    name: item.pattern,
    population: item.count,
    color: item.color,
    legendFontColor: '#7F7F7F',
    legendFontSize: 12,
  }));

  const pieChartConfig = {
    backgroundColor: 'transparent',
    color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    paddingTop: 10,
  };



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
        title="Detection"
        subtitle="Detection analytics and details"
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
          <Text style={styles.loadingText}>Loading detection data...</Text>
        </View>
      ) : (
        <>
          {/* Summary Stats */}
          <View style={styles.overallStatsContainer}>
            {summaryStats.map((item, idx) => (
              <View key={idx} style={styles.statCard}>
                <Text style={styles.statValue}>{item.value}</Text>
                <Text style={styles.statLabel}>{item.label}</Text>
              </View>
            ))}
          </View>

          {/* Detection Trend Chart */}
          <View style={styles.chartContainer}>
            <View style={styles.chartHeader}>
              <Text style={styles.chartTitle}>Detection Trend ({selectedTimeRange})</Text>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <LineChart
                data={{
                  labels: chartLabels,
                  datasets: [
                    {
                      data: chartDetections,
                      color: (opacity = 1) => `rgba(1, 185, 127, ${opacity})`,
                      strokeWidth: 3,
                      withDots: true,
                      fillShadowGradient: 'rgba(1, 185, 127, 0.6)',
                      fillShadowGradientOpacity: 0.6,
                    },
                  ],
                }}
                width={Math.max((chartLabels.length * 80), width - 40)}
                height={220}
                chartConfig={{
                  backgroundColor: 'transparent',
                  backgroundGradientFrom: '#ffffff',
                  backgroundGradientTo: '#ffffff',
                  decimalPlaces: 0,
                  color: (opacity = 1) => '#01B97F',
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
                }}
                bezier
                style={styles.chart}
                withDots={true}
                withShadow={false}
                withInnerLines={true}
                withHorizontalLabels={true}
                withVerticalLabels={true}
                withVerticalLines={false}
                withFill={true}
                getDotColor={() => '#01B97F'}
                getDotProps={() => ({
                  r: '4',
                  strokeWidth: '2',
                  stroke: '#ffffff',
                  fill: '#01B97F'
                })}
              />
            </ScrollView>
            <View style={styles.chartLegend}>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: '#01B97F' }]} />
                <Text style={styles.legendText}>Detection Count</Text>
              </View>
            </View>
          </View>

          {/* Trending Patterns */}
          <View style={styles.analyticsSectionContainer}>
            <Text style={styles.analyticsSectionTitle}>Trending Patterns</Text>
            <View style={styles.analyticsList}>
              {trendingPatterns.map((item, idx) => (
                <View key={idx} style={styles.analyticsListItem}>
                  <View style={styles.trendingInfo}>
                    <Text style={styles.analyticsListItemText}>{item.pattern}</Text>
                    <Text style={styles.trendingCount}>{item.count} detections</Text>
                  </View>
                  <View style={[styles.changeBadge, { backgroundColor: item.change.startsWith('+') ? '#e8f5f0' : '#fee2e2' }]}>
                    <Text style={[styles.changeText, { color: item.change.startsWith('+') ? '#01B97F' : '#dc2626' }]}>{item.change}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>

          {/* Detection Types Distribution Pie Chart */}
          {trendingPatterns.length > 0 && (
            <View style={styles.chartContainer}>
              <View style={styles.chartHeader}>
                <Text style={styles.chartTitle}>Detection Types Distribution</Text>
              </View>
              <PieChart
                data={trendingPatterns.map(item => ({
                  name: item.pattern,
                  population: item.count,
                  color: item.color,
                  legendFontColor: '#7F7F7F',
                  legendFontSize: 12,
                }))}
                width={width - 40}
                height={200}
                chartConfig={pieChartConfig}
                accessor="population"
                backgroundColor="transparent"
                paddingLeft="15"
                absolute
              />
            </View>
          )}

          {/* Recently Detected Words */}
          <View style={styles.analyticsSectionContainer}>
            <Text style={styles.analyticsSectionTitle}>Recently Detected Words</Text>
            <View style={styles.analyticsList}>
              {detectedWords.map((item) => (
                <View key={item.id} style={styles.analyticsListItem}>
                  <View style={styles.wordInfo}>
                    <Text style={styles.analyticsListItemText}>{item.word}</Text>
                    <Text style={styles.wordType}>{item.type}</Text>
                    {item.user && <Text style={styles.wordUser}>by {item.user}</Text>}
                  </View>
                  <View style={styles.wordDetails}>
                    <Text style={styles.wordTimestamp}>{new Date(item.timestamp).toLocaleString()}</Text>
                    <Text style={styles.wordContext}>{item.context}</Text>
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
    marginBottom: 15,
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
    fontFamily: 'Poppins-Regular',
    color: '#374151',
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
  trendingInfo: {
    flex: 1,
  },
  trendingCount: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: '#6b7280',
    marginTop: 2,
  },
  changeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  changeText: {
    fontSize: 12,
    fontFamily: 'Poppins-Medium',
  },
  wordInfo: {
    flex: 1,
  },
  wordType: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: '#6b7280',
    marginTop: 2,
  },
  wordDetails: {
    alignItems: 'flex-end',
    maxWidth: '40%',
  },
  wordTimestamp: {
    fontSize: 11,
    fontFamily: 'Poppins-Regular',
    color: '#9ca3af',
  },
  wordContext: {
    fontSize: 11,
    fontFamily: 'Poppins-Regular',
    color: '#6b7280',
    textAlign: 'right',
    marginTop: 2,
  },
  wordUser: {
    fontSize: 11,
    fontFamily: 'Poppins-Regular',
    color: '#9ca3af',
    marginTop: 1,
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