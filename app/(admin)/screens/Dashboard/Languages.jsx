import { useState } from 'react';
import { Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { LineChart, PieChart } from 'react-native-chart-kit';
import MainHeader from '../../../components/common/MainHeader';

export default function AdminLanguagesScreen({ navigation }) {
  const [selectedTimeRange, setSelectedTimeRange] = useState('Today');
  const timeRanges = ['Today', 'Last 7 days', 'Last 30 days', 'All Time'];
  const { width } = Dimensions.get('window');

  // Mock data for analytics
  const languageData = [
    { name: 'English', population: 70, color: '#10b981', legendFontColor: '#7F7F7F', legendFontSize: 12 },
    { name: 'Filipino/Tagalog', population: 22, color: '#3b82f6', legendFontColor: '#7F7F7F', legendFontSize: 12 },
    { name: 'Cebuano', population: 5, color: '#f59e0b', legendFontColor: '#7F7F7F', legendFontSize: 12 },
    { name: 'Other', population: 3, color: '#ef4444', legendFontColor: '#7F7F7F', legendFontSize: 12 },
  ];
  const languageBreakdown = [
    { language: 'English', count: 89, percentage: '70%' },
    { language: 'Filipino/Tagalog', count: 28, percentage: '22%' },
    { language: 'Cebuano', count: 7, percentage: '5%' },
    { language: 'Other', count: 3, percentage: '3%' },
  ];

  const languageTrendData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        data: [120, 150, 130, 180, 160, 200, 190],
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

  const pieChartConfig = {
    backgroundColor: 'transparent',
    color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    paddingTop: 10,
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <MainHeader
        title="Languages"
        subtitle="Languages analytics and details"
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

      {/* Language Distribution Pie Chart */}
      <View style={styles.chartContainer}>
        <View style={styles.chartHeader}>
          <Text style={styles.chartTitle}>Language Distribution</Text>
        </View>
        <PieChart
          data={languageData}
          width={width - 40}
          height={200}
          chartConfig={pieChartConfig}
          accessor="population"
          backgroundColor="transparent"
          paddingLeft="15"
          absolute
        />
      </View>

      {/* Language Detection Trend Line Chart */}
      <View style={styles.chartContainer}>
        <View style={styles.chartHeader}>
          <Text style={styles.chartTitle}>Language Detection Trend</Text>
        </View>
        <LineChart
          data={languageTrendData}
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

      {/* Language Breakdown */}
      <View style={styles.analyticsSectionContainer}>
        <Text style={styles.analyticsSectionTitle}>Language Breakdown</Text>
        <View style={styles.analyticsList}>
          {languageBreakdown.map((item, idx) => (
            <View key={idx} style={styles.analyticsListItem}>
              <View style={styles.languageInfo}>
                <Text style={styles.analyticsListItemText}>{item.language}</Text>
                <Text style={styles.languageCount}>{item.count} threats detected</Text>
              </View>
              <View style={styles.percentageBadge}>
                <Text style={styles.percentageText}>{item.percentage}</Text>
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
  languageInfo: {
    flex: 1,
  },
  languageCount: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: '#6b7280',
    marginTop: 2,
  },
  percentageBadge: {
    backgroundColor: '#e8f5f0',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  percentageText: {
    fontSize: 12,
    fontFamily: 'Poppins-Medium',
    color: '#01B97F',
  },
});