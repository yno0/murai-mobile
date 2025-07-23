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
import { BarChart, LineChart } from 'react-native-chart-kit';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import MainHeader from '../../../components/common/MainHeader';

const API_BASE_URL = 'http://localhost:3000/api';

const patternsService = {
  getPatterns: async (timeRange) => {
    try {
      console.log(`Fetching patterns data for timeRange: ${timeRange}`);
      const response = await fetch(`${API_BASE_URL}/dashboard/patterns?timeRange=${encodeURIComponent(timeRange)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log(`API Response status: ${response.status}`);

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`API Error: ${response.status} - ${errorText}`);
        throw new Error(`Failed to fetch patterns data: ${response.status}`);
      }

      const data = await response.json();
      console.log('Raw API response:', data);

      return data;
    } catch (error) {
      console.error('Patterns service error:', error);
      throw error;
    }
  },
};

export default function AdminPatternsOverTimeScreen({ navigation }) {
  const [selectedTimeRange, setSelectedTimeRange] = useState('Today');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [patternsData, setPatternsData] = useState({
    patterns: null,
  });

  const timeRanges = ['Today', 'Last 7 days', 'Last 30 days', 'All Time'];
  const { width } = Dimensions.get('window');

  const fetchPatternsData = async (timeRange) => {
    try {
      setIsLoading(true);
      setError(null);
      const patterns = await patternsService.getPatterns(timeRange);

      setPatternsData({
        patterns,
      });
    } catch (error) {
      console.error("Failed to fetch patterns data:", error);
      setError("Failed to load patterns data. Please try again later.");
      setPatternsData({
        patterns: {
          totalPatterns: 0,
          peakActivity: '12:00',
          lowestActivity: '4:00',
          topPatterns: [],
          timeSeriesData: [],
          labels: [],
          summary: {}
        },
      });
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const onRefresh = () => {
    setIsRefreshing(true);
    fetchPatternsData(selectedTimeRange);
  };

  useEffect(() => {
    fetchPatternsData(selectedTimeRange);
  }, [selectedTimeRange]);

  // Process data for display
  const summaryStats = patternsData.patterns ? [
    { label: 'Total Patterns', value: patternsData.patterns.totalPatterns || 0 },
    { label: 'Peak Activity', value: patternsData.patterns.peakActivity || '12:00' },
    { label: 'Lowest Activity', value: patternsData.patterns.lowestActivity || '4:00' },
  ] : [
    { label: 'Total Patterns', value: 0 },
    { label: 'Peak Activity', value: '12:00' },
    { label: 'Lowest Activity', value: '4:00' },
  ];

  const chartData = {
    labels: patternsData.patterns?.labels || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        data: patternsData.patterns?.timeSeriesData?.length > 0 ? patternsData.patterns.timeSeriesData : [0, 0, 0, 0, 0, 0, 0],
        strokeWidth: 3,
        color: (opacity = 1) => `rgba(1, 185, 127, ${opacity})`,
        fillShadowGradient: 'rgba(1, 185, 127, 0.6)',
        fillShadowGradientOpacity: 0.6,
      },
    ],
  };
  const chartConfig = {
    backgroundColor: 'transparent',
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    decimalPlaces: 0,
    color: (opacity = 1) => '#01B97F',
    labelColor: (opacity = 1) => `rgba(75, 85, 99, ${opacity})`,
    style: { borderRadius: 16 },
    propsForDots: { r: '4', strokeWidth: '2', stroke: '#01B97F' },
    propsForBackgroundLines: {
      strokeWidth: 1,
      stroke: '#f3f4f6',
      strokeDasharray: '5,5'
    },
    propsForLabels: {
      fontSize: 11,
      fontFamily: 'Poppins-Medium'
    },
    withHorizontalLabels: true,
    withVerticalLabels: true,
    withInnerLines: true,
    withOuterLines: false,
  };

  // Process top patterns data
  const topPatterns = patternsData.patterns?.topPatterns || [];
  const topPatternsData = {
    labels: topPatterns.map(p => p.word.length > 8 ? p.word.substring(0, 8) + '...' : p.word),
    datasets: [
      {
        data: topPatterns.length > 0 ? topPatterns.map(p => p.count) : [0],
        colors: topPatterns.map((_, index) => {
          const colors = [
            '#EF4444', // Red for high severity
            '#F97316', // Orange for medium
            '#EAB308', // Yellow for medium-low
            '#22C55E', // Green for low
            '#3B82F6', // Blue for neutral
          ];
          return (opacity = 1) => colors[index % colors.length] || '#01B97F';
        }),
      },
    ],
  };

  const barChartConfig = {
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
      fontSize: 10,
      fontFamily: 'Poppins-Medium'
    },
  };

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={onRefresh}
          colors={['#01B97F']}
          tintColor={'#01B97F'}
        />
      }
    >
      <MainHeader
        title="Patterns Over Time"
        subtitle="Patterns over time analytics and details"
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
          <ActivityIndicator size="large" color="#01B97F" />
          <Text style={styles.loadingText}>Loading patterns data...</Text>
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

          {/* Patterns Over Time Chart */}
          <View style={styles.chartContainer}>
            <View style={styles.chartHeader}>
              <Text style={styles.chartTitle}>Patterns Over Time ({selectedTimeRange})</Text>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <LineChart
                data={chartData}
                width={Math.max((chartData.labels.length * 60), width - 40)}
                height={220}
                chartConfig={chartConfig}
                bezier
                style={styles.chart}
                withDots={true}
                withShadow={false}
                withInnerLines={true}
                withHorizontalLabels={true}
                withVerticalLabels={true}
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
          </View>

          {/* Top 5 Patterns Bar Chart */}
          {topPatterns.length > 0 && (
            <View style={styles.chartContainer}>
              <View style={styles.chartHeader}>
                <Text style={styles.chartTitle}>Top 5 Patterns ({selectedTimeRange})</Text>
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <BarChart
                  data={{
                    labels: topPatterns.map(p => p.word.length > 8 ? p.word.substring(0, 8) + '...' : p.word),
                    datasets: [
                      {
                        data: topPatterns.length > 0 ? topPatterns.map(p => p.count) : [0],
                        colors: topPatterns.map((pattern, index) => {
                          // No green colors - using red, orange, blue, purple, indigo
                          const colors = [
                            '#EF4444', // Red for high severity
                            '#F97316', // Orange for medium
                            '#6366F1', // Indigo for low
                            '#8B5CF6', // Purple
                            '#3B82F6', // Blue
                            '#01B97F', // Theme color as fallback
                          ];
                          return (opacity = 1) => colors[index % colors.length] || '#01B97F';
                        }),
                      },
                    ],
                  }}
                  width={Math.max((topPatterns.length * 80), width - 40)}
                  height={200}
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
                  style={styles.chart}
                  fromZero
                  showBarTops={false}
                  showValuesOnTopOfBars
                  withCustomBarColorFromData
                  flatColor={false}
                />
              </ScrollView>
              <View style={styles.chartLegend}>
                {topPatterns.map((pattern, index) => (
                  <View key={index} style={styles.legendItem}>
                    <View style={[styles.legendDot, {
                      backgroundColor: pattern.severity === 'high' ? '#EF4444' :
                                      pattern.severity === 'medium' ? '#F97316' :
                                      pattern.severity === 'low' ? '#6366F1' : '#8B5CF6'
                    }]} />
                    <Text style={styles.legendText}>
                      {pattern.word} ({pattern.count} detections)
                    </Text>
                    <Text style={styles.severityText}>
                      {pattern.severity} severity
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}
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
    marginBottom: 4,
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
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  analyticsListItemText: {
    fontSize: 14,
    fontFamily: 'Poppins-SemiBold',
    color: '#374151',
  },
  analyticsListItemValue: {
    fontSize: 16,
    fontFamily: 'Poppins-Bold',
    color: '#111827',
  },
  patternInfo: {
    flex: 1,
    marginRight: 16,
  },
  patternHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  patternCount: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: '#6b7280',
    marginBottom: 8,
  },
  severityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  severityBadgeText: {
    fontSize: 10,
    fontFamily: 'Poppins-SemiBold',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  progressBarContainer: {
    height: 6,
    backgroundColor: '#f3f4f6',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 3,
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
    flex: 1,
    alignItems: 'center',
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
  chartLegend: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
    alignSelf: 'center',
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
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  legendText: {
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    color: '#374151',
    flex: 1,
  },
  severityText: {
    fontSize: 12,
    fontFamily: 'Poppins-Medium',
    color: '#6b7280',
    textTransform: 'capitalize',
  },
});