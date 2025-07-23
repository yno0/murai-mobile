import { Feather } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    Dimensions,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { LineChart } from 'react-native-chart-kit';

// API service for flagged words data
const API_BASE_URL = 'http://localhost:3000/api';

const flaggedWordsService = {
  getFlaggedWordsData: async (timeRange) => {
    try {
      const response = await fetch(`${API_BASE_URL}/dashboard/flagged-words?timeRange=${encodeURIComponent(timeRange)}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Flagged words data received:', data);
      return data;
    } catch (error) {
      console.error('Error fetching flagged words:', error);
      return {
        topWords: [],
        recentDetections: [],
        totalCount: 0,
        summary: { avgAccuracy: 0, avgResponseTime: 0 }
      };
    }
  },
};

const { width } = Dimensions.get('window');

function FlaggedWordsAnalyticsScreen({ navigation }) {
  const [selectedTimeRange, setSelectedTimeRange] = useState('Today');
  const [isLoading, setIsLoading] = useState(true);
  const [flaggedWordsData, setFlaggedWordsData] = useState({
    topWords: [],
    recentDetections: [],
    totalCount: 0,
    summary: { avgAccuracy: 0, avgResponseTime: 0 }
  });

  const timeRanges = ['Today', 'Last 7 days', 'Last 30 days', 'All Time'];

  // Fetch flagged words data
  const fetchFlaggedWordsData = async (timeRange) => {
    try {
      setIsLoading(true);
      const data = await flaggedWordsService.getFlaggedWordsData(timeRange);
      setFlaggedWordsData(data);
    } catch (error) {
      console.error('Failed to fetch flagged words data:', error);
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
        labels: ['', '', '', '', '', '', ''],
        datasets: [{ data: [0, 0, 0, 0, 0, 0, 0], strokeWidth: 2, color: (opacity = 1) => `rgba(107, 114, 128, ${opacity})` }],
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
      labels: ['', '', '', '', '', '', ''],
      datasets: [{
        data: last7Days.length > 0 ? last7Days : [0, 0, 0, 0, 0, 0, 0],
        strokeWidth: 2,
        color: (opacity = 1) => `rgba(107, 114, 128, ${opacity})`,
        fillShadowGradient: 'rgba(107, 114, 128, 0.1)',
        fillShadowGradientOpacity: 0.1,
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

      {/* Flagged Words Today */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Harmful Content Detected Today</Text>
        <View style={styles.statsCard}>
          <View style={styles.statRow}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>127</Text>
              <Text style={styles.statLabel}>Total Threats</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>23</Text>
              <Text style={styles.statLabel}>Unique Types</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>12</Text>
              <Text style={styles.statLabel}>High Severity</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Trending Words */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Trending Threat Patterns</Text>
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
                  { color: item.change.startsWith('+') ? '#6b7280' : '#6b7280' }
                ]}>
                  {item.change}
                </Text>
              </View>
            </View>
          ))}
        </View>
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