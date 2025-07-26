import { Feather } from '@expo/vector-icons';
import { useState } from 'react';
import {
    Dimensions,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const { width } = Dimensions.get('window');

function TimePatternAnalyticsScreen({ navigation }) {
  // const { user } = useAuth(); // Get user from auth context
  const [selectedTimeRange, setSelectedTimeRange] = useState('Week');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [timePatternData, setTimePatternData] = useState({
    hourlyPatterns: [],
    dailyPatterns: [],
    peakHours: [],
    activitySummary: {},
    totalActivities: 0
  });

  const timeRanges = ['Today', 'Week', 'Month', 'Year'];

  // Fetch user-specific time pattern analytics data
  const fetchTimePatternData = async (timeRange) => {
    try {
      setIsLoading(true);
      setError('');

      // Map time range to match server expectations
      const mappedTimeRange = timeRange.toLowerCase() === 'week' ? 'week' :
                             timeRange.toLowerCase() === 'month' ? 'month' :
                             timeRange.toLowerCase() === 'year' ? 'year' :
                             timeRange.toLowerCase();

      // For now, use mock data that represents user's time-based activity patterns
      const mockTimePatternData = {
        hourlyPatterns: [
          { hour: '6AM', detections: 2, activities: 5 },
          { hour: '9AM', detections: 8, activities: 15 },
          { hour: '12PM', detections: 12, activities: 25 },
          { hour: '3PM', detections: 18, activities: 35 },
          { hour: '6PM', detections: 15, activities: 28 },
          { hour: '9PM', detections: 10, activities: 20 },
          { hour: '12AM', detections: 3, activities: 8 },
        ],
        dailyPatterns: [
          { day: 'Mon', detections: 45 },
          { day: 'Tue', detections: 52 },
          { day: 'Wed', detections: 38 },
          { day: 'Thu', detections: 67 },
          { day: 'Fri', detections: 89 },
          { day: 'Sat', detections: 74 },
          { day: 'Sun', detections: 92 },
        ],
        peakHours: [
          { time: '3:00 PM', activity: 'High browsing activity', detections: 18 },
          { time: '6:00 PM', activity: 'Social media usage', detections: 15 },
          { time: '9:00 PM', activity: 'Entertainment content', detections: 10 },
        ],
        activitySummary: {
          mostActiveDay: 'Sunday',
          mostActiveHour: '3:00 PM',
          averageDaily: 65,
          weekendVsWeekday: '+23%'
        },
        totalActivities: 457
      };

      setTimePatternData(mockTimePatternData);
    } catch (err) {
      console.error('Failed to fetch time pattern data:', err);
      setError('Failed to load time pattern analytics. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle time range change
  const handleTimeRangeChange = (timeRange) => {
    setSelectedTimeRange(timeRange);
    fetchTimePatternData(timeRange);
  };

  // Effect to load data on component mount and time range change
  useEffect(() => {
    fetchTimePatternData(selectedTimeRange);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTimeRange]);

  // Generate dynamic chart data from user's time patterns
  const flagHistoryData = {
    labels: timePatternData.dailyPatterns.length > 0 ?
            timePatternData.dailyPatterns.map(d => d.day) :
            ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        data: timePatternData.dailyPatterns.length > 0 ?
              timePatternData.dailyPatterns.map(d => d.detections) :
              [45, 52, 38, 67, 89, 74, 92],
        strokeWidth: 3,
        color: (opacity = 1) => `rgba(2, 185, 127, ${opacity})`,
        fillShadowGradient: '#02B97F',
        fillShadowGradientOpacity: 0.7,
      },
    ],
  };

  const timeOfDayData = {
    labels: timePatternData.hourlyPatterns.length > 0 ?
            timePatternData.hourlyPatterns.map(h => h.hour) :
            ['6AM', '9AM', '12PM', '3PM', '6PM', '9PM', '12AM'],
    datasets: [
      {
        data: timePatternData.hourlyPatterns.length > 0 ?
              timePatternData.hourlyPatterns.map(h => h.detections) :
              [5, 12, 18, 25, 20, 15, 8],
        strokeWidth: 3,
        color: (opacity = 1) => `rgba(2, 185, 127, ${opacity})`,
        fillShadowGradient: '#02B97F',
        fillShadowGradientOpacity: 0.7,
      },
    ],
  };

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

  const timeOfDayConfig = {
    ...chartConfig,
    propsForDots: {
      r: '0',
    },
    withHorizontalLabels: true,
  };

  const risingTerms = [
    { term: 'cyberbullying', increase: '+45%', trend: '↗' },
    { term: 'hate speech', increase: '+32%', trend: '↗' },
    { term: 'misinformation', increase: '+28%', trend: '↗' },
    { term: 'harassment', increase: '+15%', trend: '↗' },
    { term: 'fake news', increase: '+12%', trend: '↗' },
  ];

  const weeklyPatterns = [
    { day: 'Monday', flags: 45, trend: '↗' },
    { day: 'Tuesday', flags: 52, trend: '↗' },
    { day: 'Wednesday', flags: 38, trend: '↘' },
    { day: 'Thursday', flags: 67, trend: '↗' },
    { day: 'Friday', flags: 89, trend: '↗' },
    { day: 'Saturday', flags: 74, trend: '↘' },
    { day: 'Sunday', flags: 92, trend: '↗' },
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Feather name="arrow-left" size={24} color="#374151" />
        </TouchableOpacity>
        <Text style={styles.title}>Patterns Over Time</Text>
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

      {/* Daily Detection Patterns */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Daily Detection Patterns</Text>
        {isLoading ? (
          <View style={styles.loadingCard}>
            <Text style={styles.loadingText}>Loading daily patterns...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorCard}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : (
          <View style={styles.chartContainer}>
            <LineChart
              data={flagHistoryData}
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
        )}
      </View>

      {/* Hourly Detection Patterns */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Hourly Detection Patterns</Text>
        {isLoading ? (
          <View style={styles.loadingCard}>
            <Text style={styles.loadingText}>Loading hourly patterns...</Text>
          </View>
        ) : (
          <>
            <View style={styles.chartContainer}>
              <LineChart
                data={timeOfDayData}
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
            <View style={styles.timeInsight}>
              <Text style={styles.insightText}>
                Peak activity: {timePatternData.activitySummary?.mostActiveHour || '3:00 PM'}
                ({timePatternData.hourlyPatterns.find(h => h.hour === '3PM')?.detections || 25} detections)
              </Text>
            </View>
          </>
        )}
      </View>

      {/* Weekly Patterns */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Weekly Patterns</Text>
        <View style={styles.patternsContainer}>
          {weeklyPatterns.map((pattern, index) => (
            <View key={index} style={styles.patternItem}>
              <View style={styles.patternInfo}>
                <Text style={styles.patternDay}>{pattern.day}</Text>
                <Text style={styles.patternFlags}>{pattern.flags} flags</Text>
              </View>
              <View style={styles.trendBadge}>
                <Text style={styles.trendText}>{pattern.trend}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* New or Rising Terms */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>New or Rising Terms</Text>
        <View style={styles.termsContainer}>
          {risingTerms.map((term, index) => (
            <View key={index} style={styles.termItem}>
              <View style={styles.termInfo}>
                <Text style={styles.termName}>{term.term}</Text>
                <Text style={styles.termIncrease}>{term.increase}</Text>
              </View>
              <View style={styles.trendIcon}>
                <Text style={styles.trendIconText}>{term.trend}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* Pattern Summary */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Pattern Summary</Text>
        {isLoading ? (
          <View style={styles.loadingCard}>
            <Text style={styles.loadingText}>Loading pattern summary...</Text>
          </View>
        ) : (
          <View style={styles.summaryContainer}>
            <View style={styles.summaryItem}>
              <MaterialCommunityIcons name="trending-up" size={20} color="#02B97F" />
              <Text style={styles.summaryText}>
                Average daily: {timePatternData.activitySummary?.averageDaily || 65} detections
              </Text>
            </View>
            <View style={styles.summaryItem}>
              <MaterialCommunityIcons name="clock-outline" size={20} color="#3b82f6" />
              <Text style={styles.summaryText}>
                Peak time: {timePatternData.activitySummary?.mostActiveHour || '3:00 PM'}
              </Text>
            </View>
            <View style={styles.summaryItem}>
              <MaterialCommunityIcons name="calendar-week" size={20} color="#f59e0b" />
              <Text style={styles.summaryText}>
                Most active: {timePatternData.activitySummary?.mostActiveDay || 'Sunday'}
              </Text>
            </View>
            <View style={styles.summaryItem}>
              <MaterialCommunityIcons name="chart-line" size={20} color="#8b5cf6" />
              <Text style={styles.summaryText}>
                Weekend activity: {timePatternData.activitySummary?.weekendVsWeekday || '+23%'} higher
              </Text>
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
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'Poppins-Medium',
    color: '#111827',
    marginBottom: 16,
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
  timeInsight: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eff6ff',
    padding: 12,
    borderRadius: 12,
    marginTop: 12,
  },
  insightText: {
    fontSize: 14,
    fontFamily: 'Poppins-SemiBold',
    color: '#3b82f6',
    marginLeft: 8,
  },
  patternsContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#f3f4f6',
  },
  patternItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f8f9fa',
  },
  patternInfo: {
    flex: 1,
  },
  patternDay: {
    fontSize: 14,
    fontFamily: 'Poppins-SemiBold',
    color: '#111827',
    marginBottom: 4,
  },
  patternFlags: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: '#6b7280',
  },
  trendBadge: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  trendText: {
    fontSize: 12,
    fontFamily: 'Poppins-SemiBold',
    color: '#6b7280',
  },
  termsContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#f3f4f6',
  },
  termItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f8f9fa',
  },
  termInfo: {
    flex: 1,
  },
  termName: {
    fontSize: 14,
    fontFamily: 'Poppins-SemiBold',
    color: '#111827',
    marginBottom: 4,
  },
  termIncrease: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: '#6b7280',
  },
  trendIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#fef2f2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  trendIconText: {
    fontSize: 16,
    fontFamily: 'Poppins-Bold',
    color: '#ef4444',
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
  trendingTerm: {
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    color: '#111827',
    marginRight: 8,
  },
  statNumber: {
    fontSize: 20,
    fontFamily: 'Poppins-Medium',
    color: '#111827',
    marginBottom: 4,
  },
  changeText: {
    fontSize: 12,
    fontFamily: 'Poppins-Medium',
  },
});

export default TimePatternAnalyticsScreen; 