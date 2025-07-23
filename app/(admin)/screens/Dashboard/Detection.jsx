import { useState } from 'react';
import { Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { LineChart, PieChart } from 'react-native-chart-kit';
import MainHeader from '../../../components/common/MainHeader';

export default function AdminDetectionScreen({ navigation }) {
  const [selectedTimeRange, setSelectedTimeRange] = useState('Today');
  const timeRanges = ['Today', 'Last 7 days', 'Last 30 days', 'All Time'];
  const { width } = Dimensions.get('window');

  // Mock data for analytics
  const summaryStats = [
    { label: 'Total Detections', value: 127 },
    { label: 'Unique Types', value: 23 },
    { label: 'High Severity', value: 12 },
  ];
  const trendingPatterns = [
    { pattern: 'Profanity', count: 45, change: '+12%', color: '#FF6384' },
    { pattern: 'Hate Speech', count: 28, change: '+8%', color: '#36A2EB' },
    { pattern: 'Sensitive', count: 18, change: '+3%', color: '#FFCE56' },
    { pattern: 'Threat', count: 10, change: '+5%', color: '#4BC0C0' },
    { pattern: 'Harassment', count: 8, change: '+2%', color: '#9966CC' },
  ];

  const detectedWords = [
    { id: '1', word: 'damn', type: 'Profanity', timestamp: '2025-07-21T10:30:00Z', context: 'User A said "damn it" in chat.' },
    { id: '2', word: 'idiot', type: 'Insult', timestamp: '2025-07-21T11:05:00Z', context: 'User B called User C an "idiot".' },
    { id: '3', word: 'kill', type: 'Threat', timestamp: '2025-07-21T12:15:00Z', context: 'User D mentioned "I will kill you" in a private message.' },
    { id: '4', word: 'hate', type: 'Hate Speech', timestamp: '2025-07-21T13:40:00Z', context: 'User E expressed "I hate this group".' },
    { id: '5', word: 'sex', type: 'Sensitive', timestamp: '2025-07-21T14:00:00Z', context: 'User F discussed "sex education".' },
    { id: '6', word: 'bitch', type: 'Profanity', timestamp: '2025-07-20T09:00:00Z', context: 'User G used the word "bitch" in a comment.' },
    { id: '7', word: 'nazi', type: 'Hate Speech', timestamp: '2025-07-20T10:00:00Z', context: 'User H made a reference to "nazi ideology".' },
    { id: '8', word: 'suicide', type: 'Sensitive', timestamp: '2025-07-20T11:00:00Z', context: 'User I talked about "suicide prevention".' },
  ];

  const lineChartData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        data: [45, 52, 38, 67, 89, 74, 92],
        strokeWidth: 2,
        color: (opacity = 1) => `rgba(79, 70, 229, ${opacity})`, // Indigo 600
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
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
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

      {/* Summary Stats */}
      <View style={styles.overallStatsContainer}>
        {summaryStats.map((item, idx) => (
          <View key={idx} style={styles.statCard}>
            <Text style={styles.statValue}>{item.value}</Text>
            <Text style={styles.statLabel}>{item.label}</Text>
          </View>
        ))}
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

      {/* Weekly Trend Chart */}
      <View style={styles.chartContainer}>
        <View style={styles.chartHeader}>
          <Text style={styles.chartTitle}>Weekly Trend</Text>
        </View>
        <LineChart
          data={lineChartData}
          width={width - 40}
          height={180}
          chartConfig={lineChartConfig}
          bezier
          style={styles.chart}
          withDots={true}
          withShadow={false}
          withInnerLines={true}
          withHorizontalLabels={true}
          withVerticalLabels={true}
        />
      </View>

      {/* Detection Types Distribution Pie Chart */}
      <View style={styles.chartContainer}>
        <View style={styles.chartHeader}>
          <Text style={styles.chartTitle}>Detection Types Distribution</Text>
        </View>
        <PieChart
          data={pieChartData}
          width={width - 40}
          height={200}
          chartConfig={pieChartConfig}
          accessor="population"
          backgroundColor="transparent"
          paddingLeft="15"
          absolute
        />
      </View>

      {/* Detected Words List */}
      <View style={styles.analyticsSectionContainer}>
        <Text style={styles.analyticsSectionTitle}>Recently Detected Words</Text>
        <View style={styles.analyticsList}>
          {detectedWords.map((item) => (
            <View key={item.id} style={styles.analyticsListItem}>
              <View style={styles.wordInfo}>
                <Text style={styles.analyticsListItemText}>{item.word}</Text>
                <Text style={styles.wordType}>{item.type}</Text>
              </View>
              <View style={styles.wordDetails}>
                <Text style={styles.wordTimestamp}>{new Date(item.timestamp).toLocaleString()}</Text>
                <Text style={styles.wordContext}>{item.context}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>
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
});