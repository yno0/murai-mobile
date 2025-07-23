import { useState } from 'react';
import { Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { BarChart, LineChart } from 'react-native-chart-kit';
import MainHeader from '../../../components/common/MainHeader';

export default function AdminPatternsOverTimeScreen({ navigation }) {
  const [selectedTimeRange, setSelectedTimeRange] = useState('Today');
  const timeRanges = ['Today', 'Last 7 days', 'Last 30 days', 'All Time'];
  const { width } = Dimensions.get('window');

  // Mock data for analytics
  const summaryStats = [
    { label: 'Total Patterns', value: 8 },
    { label: 'Peak Activity', value: '2:00 PM' },
    { label: 'Lowest Activity', value: '4:00 AM' },
  ];
  const chartData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        data: [12, 19, 8, 15, 22, 17, 10],
        strokeWidth: 2,
        color: (opacity = 1) => `rgba(79, 70, 229, ${opacity})`, // Indigo 600
        fillShadowGradient: 'rgba(79, 70, 229, 0.1)',
        fillShadowGradientOpacity: 0.1,
      },
    ],
  };
  const chartConfig = {
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

  const topPatternsData = {
    labels: ['Profanity', 'Hate Speech', 'Sensitive', 'Threat', 'Harassment'],
    datasets: [
      {
        data: [45, 28, 18, 10, 8],
        colors: [
          (opacity = 1) => `rgba(255, 99, 132, ${opacity})`,
          (opacity = 1) => `rgba(54, 162, 235, ${opacity})`,
          (opacity = 1) => `rgba(255, 206, 86, ${opacity})`,
          (opacity = 1) => `rgba(75, 192, 192, ${opacity})`,
          (opacity = 1) => `rgba(153, 102, 255, ${opacity})`,
        ],
      },
    ],
  };

  const barChartConfig = {
    backgroundColor: 'transparent',
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(107, 114, 128, ${opacity})`, // Gray 500
    labelColor: (opacity = 1) => `rgba(156, 163, 175, ${opacity})`, // Gray 400
    style: { borderRadius: 16 },
    propsForBackgroundLines: { strokeWidth: 0.5, stroke: '#e5e7eb' }, // Gray 200
    propsForLabels: { fontSize: 10 },
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
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

      {/* Summary Stats */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Pattern Summary</Text>
        <View style={styles.card}>
          <View style={styles.statRow}>
            {summaryStats.map((item, idx) => (
              <View key={idx} style={styles.statItem}>
                <Text style={styles.statNumber}>{item.value}</Text>
                <Text style={styles.statLabel}>{item.label}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>

      {/* Patterns Over Time Chart */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Patterns Over Time</Text>
        <View style={styles.card}>
          <LineChart
            data={chartData}
            width={width - 60} // Adjusted for card padding
            height={220}
            chartConfig={chartConfig}
            bezier
            style={styles.chart}
            withDots={true}
            withShadow={false}
            withInnerLines={true}
            withHorizontalLabels={true}
            withVerticalLabels={true}
          />
        </View>
      </View>

      {/* Top 5 Patterns Bar Chart */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Top 5 Patterns</Text>
        <View style={styles.card}>
          <BarChart
            data={topPatternsData}
            width={width - 60} // Adjusted for card padding
            height={220}
            chartConfig={barChartConfig}
            style={styles.chart}
            fromZero
            showBarTops
            showValuesOnTopOfBars
            flatColor
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
    paddingHorizontal: 10,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    color: '#111827',
    marginBottom: 16,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#f3f4f6',
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
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: 28,
    fontFamily: 'Poppins-Bold',
    color: '#111827',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: 'Poppins-Medium',
    color: '#9ca3af',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
    alignSelf: 'center',
  },
});