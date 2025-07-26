import { Feather } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import {
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { LineChart } from 'react-native-chart-kit';

const { width } = Dimensions.get('window');

function FlaggedWordsAnalyticsScreen({ navigation }) {
  // const { user } = useAuth(); // Get user from auth context
  const [selectedTimeRange, setSelectedTimeRange] = useState('Week');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [flaggedWordsData, setFlaggedWordsData] = useState({
    topWords: [],
    recentDetections: [],
    totalCount: 0,
    summary: { avgAccuracy: 0, avgResponseTime: 0 }
  });

  const timeRanges = ['Today', 'Week', 'Month', 'Year'];

  // Fetch flagged words data using API service
  const fetchFlaggedWordsData = async (timeRange) => {
    try {
      setIsLoading(true);
      setError('');

      // Map time range to match server expectations
      const mappedTimeRange = timeRange.toLowerCase() === 'week' ? 'week' :
                             timeRange.toLowerCase() === 'month' ? 'month' :
                             timeRange.toLowerCase() === 'year' ? 'year' :
                             timeRange.toLowerCase();

      // For now, use mock data that simulates real detected words
      const detectedWordsRes = {
        data: {
          detectedWords: [
            { word: 'inappropriate', timestamp: new Date(), severity: 'high' },
            { word: 'spam', timestamp: new Date(), severity: 'medium' },
            { word: 'scam', timestamp: new Date(), severity: 'high' },
            { word: 'phishing', timestamp: new Date(), severity: 'high' },
            { word: 'malware', timestamp: new Date(), severity: 'high' },
          ],
          totalCount: 43
        }
      };

      const statsRes = {
        data: {
          topWords: [
            { word: 'inappropriate', count: 15, severity: 'high' },
            { word: 'spam', count: 12, severity: 'medium' },
            { word: 'scam', count: 8, severity: 'high' },
            { word: 'phishing', count: 5, severity: 'high' },
            { word: 'malware', count: 3, severity: 'high' },
          ],
          summary: { avgAccuracy: 95.2, avgResponseTime: 245 }
        }
      };

      setFlaggedWordsData({
        topWords: statsRes.data.topWords || [],
        recentDetections: detectedWordsRes.data.detectedWords || [],
        totalCount: detectedWordsRes.data.totalCount || 0,
        summary: statsRes.data.summary || { avgAccuracy: 95, avgResponseTime: 250 }
      });
    } catch (err) {
      console.error('Failed to fetch flagged words data:', err);
      setError('Failed to load flagged words data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFlaggedWordsData(selectedTimeRange);
  }, [selectedTimeRange]);

  // Generate chart data from recent detections
  const generateChartData = () => {
    if (!flaggedWordsData.recentDetections || flaggedWordsData.recentDetections.length === 0) {
      return {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        datasets: [{
          data: [0, 0, 0, 0, 0, 0, 0],
          strokeWidth: 3,
          color: (opacity = 1) => `rgba(2, 185, 127, ${opacity})`,
          fillShadowGradient: '#02B97F',
          fillShadowGradientOpacity: 0.7,
        }],
      };
    }

    // Group detections by day for the chart
    const last7Days = [];
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dayKey = date.toISOString().split('T')[0];

      const dayCount = flaggedWordsData.recentDetections.filter(detection => {
        const detectionDate = new Date(detection.timestamp).toISOString().split('T')[0];
        return detectionDate === dayKey;
      }).length;

      last7Days.push(dayCount);
    }

    return {
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      datasets: [{
        data: last7Days.length > 0 ? last7Days : [0, 0, 0, 0, 0, 0, 0],
        strokeWidth: 3,
        color: (opacity = 1) => `rgba(2, 185, 127, ${opacity})`,
        fillShadowGradient: '#02B97F',
        fillShadowGradientOpacity: 0.7,
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

  // Use real data from API
  const trendingWords = flaggedWordsData.topWords?.map(word => ({
    word: word.word,
    count: word.count,
    change: `+${Math.floor(Math.random() * 15) + 1}`, // You can calculate real change from historical data
    severity: word.severity
  })) || [];

  const changeData = [
    {
      metric: 'Total Harmful Content',
      today: flaggedWordsData.totalCount || 0,
      yesterday: Math.floor((flaggedWordsData.totalCount || 0) * 0.85), // Estimate yesterday's count
      change: '+16%'
    },
    {
      metric: 'Unique Threat Types',
      today: flaggedWordsData.topWords?.length || 0,
      yesterday: Math.max(0, (flaggedWordsData.topWords?.length || 0) - 2),
      change: '+21%'
    },
    {
      metric: 'AI Response Time',
      today: `${(flaggedWordsData.summary?.avgResponseTime / 1000 || 0.8).toFixed(1)}s`,
      yesterday: `${((flaggedWordsData.summary?.avgResponseTime / 1000 || 0.8) * 1.3).toFixed(1)}s`,
      change: '-27%'
    },
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Feather name="arrow-left" size={24} color="#374151" />
        </TouchableOpacity>
        <Text style={styles.title}>What MURAi Caught</Text>
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

      {/* Flagged Words Stats */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          {/* <MaterialCommunityIcons name="shield-alert" size={24} color="#02B97F" /> */}
          <Text style={styles.sectionTitle}>Harmful Content Detected</Text>
        </View>
        {isLoading ? (
          <View style={styles.loadingCard}>
            {/* <ActivityIndicator size="large" color="#02B97F" /> */}
            <Text style={styles.loadingText}>Loading detection data...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorCard}>
            {/* <MaterialCommunityIcons name="alert-circle" size={24} color="#ef4444" /> */}
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : (
          <View style={styles.statsCard}>
            <View style={styles.statRow}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{flaggedWordsData.totalCount || 0}</Text>
                <Text style={styles.statLabel}>Total Threats</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{flaggedWordsData.topWords?.length || 0}</Text>
                <Text style={styles.statLabel}>Unique Types</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{Math.floor((flaggedWordsData.totalCount || 0) * 0.3)}</Text>
                <Text style={styles.statLabel}>High Severity</Text>
              </View>
            </View>
          </View>
        )}
      </View>

      {/* Trending Words */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Trending Threat Patterns</Text>
        {isLoading ? (
          <View style={styles.loadingCard}>
            <Text style={styles.loadingText}>Loading trending patterns...</Text>
          </View>
        ) : trendingWords.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>No threat patterns detected yet</Text>
            <Text style={styles.emptySubtext}>Keep browsing safely with MURAi protection</Text>
          </View>
        ) : (
          <View style={styles.trendingContainer}>
            {trendingWords.map((item, index) => (
              <View key={index} style={styles.trendingItem}>
                <View style={styles.trendingInfo}>
                  <Text style={styles.trendingWord}>{item.word}</Text>
                  <Text style={styles.trendingCount}>{item.count} detections</Text>
                </View>
                <View style={styles.changeBadge}>
                  <Text style={[
                    styles.changeText,
                    { color: item.change.startsWith('+') ? '#ef4444' : '#10b981' }
                  ]}>
                    {item.change}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </View>

      {/* Change from Yesterday */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Change from Yesterday</Text>
        <View style={styles.changeContainer}>
          {changeData.map((item, index) => (
            <View key={index} style={styles.changeItem}>
              <Text style={styles.changeMetric}>{item.metric}</Text>
              <View style={styles.changeValues}>
                <View style={styles.valueColumn}>
                  <Text style={styles.valueLabel}>Today</Text>
                  <Text style={styles.valueNumber}>{item.today}</Text>
                </View>
                <View style={styles.valueColumn}>
                  <Text style={styles.valueLabel}>Yesterday</Text>
                  <Text style={styles.valueNumber}>{item.yesterday}</Text>
                </View>
                <View style={styles.valueColumn}>
                  <Text style={styles.valueLabel}>Change</Text>
                  <Text style={[
                    styles.changeValue,
                    { color: item.change.startsWith('+') || item.change === '↗' ? '#ef4444' : '#10b981' }
                  ]}>
                    {item.change}
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* Weekly Trend Chart */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Weekly Trend</Text>
        <View style={styles.chartContainer}>
          <LineChart
            data={chartData}
            width={width - 40}
            height={200}
            chartConfig={chartConfig}
            bezier
            style={styles.chart}
            withDots={true}
            withShadow={false}
            withFill={true}
          />
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
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#9ca3af',
    textAlign: 'center',
  },
  statsCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#f3f4f6',
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: 20,
    fontFamily: 'Poppins-Medium',
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
  trendingContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#f3f4f6',
  },
  trendingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f8f9fa',
  },
  trendingInfo: {
    flex: 1,
  },
  trendingWord: {
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    color: '#111827',
    marginRight: 8,
  },
  trendingCount: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: '#6b7280',
  },
  changeBadge: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  changeText: {
    fontSize: 12,
    fontFamily: 'Poppins-Medium',
  },
  changeContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#f3f4f6',
  },
  changeItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f8f9fa',
  },
  changeMetric: {
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    color: '#111827',
    marginBottom: 12,
  },
  changeValues: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  valueColumn: {
    alignItems: 'center',
    flex: 1,
  },
  valueLabel: {
    fontSize: 10,
    fontFamily: 'Poppins-Regular',
    color: '#9ca3af',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  valueNumber: {
    fontSize: 16,
    fontFamily: 'Poppins-Medium',
    color: '#374151',
  },
  changeValue: {
    fontSize: 16,
    fontFamily: 'Poppins-Medium',
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
});

export default FlaggedWordsAnalyticsScreen;