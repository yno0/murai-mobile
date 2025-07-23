import { Feather } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    Dimensions,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const { width } = Dimensions.get('window');

function TimePatternAnalyticsScreen({ navigation }) {
  const [selectedTimeRange, setSelectedTimeRange] = useState('Today');

  const timeRanges = ['Today', 'Last 7 days', 'Last 30 days', 'All Time'];

  const flagHistoryData = {
    labels: ['', '', '', '', '', '', ''],
    datasets: [
      {
        data: [45, 52, 38, 67, 89, 74, 92],
        strokeWidth: 2,
        color: (opacity = 1) => `rgba(107, 114, 128, ${opacity})`,
        fillShadowGradient: 'rgba(107, 114, 128, 0.1)',
        fillShadowGradientOpacity: 0.1,
      },
    ],
  };

  const timeOfDayData = {
    labels: ['6AM', '9AM', '12PM', '3PM', '6PM', '9PM', '12AM'],
    datasets: [
      {
        data: [5, 12, 18, 25, 20, 15, 8],
        strokeWidth: 2,
        color: (opacity = 1) => `rgba(107, 114, 128, ${opacity})`,
        fillShadowGradient: 'rgba(107, 114, 128, 0.1)',
        fillShadowGradientOpacity: 0.1,
      },
    ],
  };

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

      {/* Flag History */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Flag History</Text>
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
      </View>

      {/* Most Active Time of Day */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Most Active Time of Day</Text>
        <View style={styles.chartContainer}>
          <LineChart
            data={timeOfDayData}
            width={width - 40}
            height={200}
            chartConfig={timeOfDayConfig}
            bezier
            style={styles.chart}
            withDots={true}
            withShadow={false}
            withFill={true}
          />
        </View>
        <View style={styles.timeInsight}>
          <MaterialCommunityIcons name="clock" size={20} color="#3b82f6" />
          <Text style={styles.insightText}>Peak activity: 3 PM (25 flags)</Text>
        </View>
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
        <View style={styles.summaryContainer}>
          <View style={styles.summaryItem}>
            <MaterialCommunityIcons name="trending-up" size={20} color="#8b5cf6" />
            <Text style={styles.summaryText}>Flags increased by 15% this week</Text>
          </View>
          <View style={styles.summaryItem}>
            <MaterialCommunityIcons name="clock-outline" size={20} color="#3b82f6" />
            <Text style={styles.summaryText}>Peak activity between 2-4 PM daily</Text>
          </View>
          <View style={styles.summaryItem}>
            <MaterialCommunityIcons name="calendar-week" size={20} color="#f59e0b" />
            <Text style={styles.summaryText}>Friday is the most active day</Text>
          </View>
          <View style={styles.summaryItem}>
            <MaterialCommunityIcons name="alert-circle" size={20} color="#ef4444" />
            <Text style={styles.summaryText}>5 new terms trending upward</Text>
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