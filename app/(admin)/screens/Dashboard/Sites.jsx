import { useState } from 'react';
import { Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { BarChart, PieChart } from 'react-native-chart-kit';
import MainHeader from '../../../components/common/MainHeader';

export default function AdminSitesScreen({ navigation }) {
  const [selectedTimeRange, setSelectedTimeRange] = useState('Today');
  const timeRanges = ['Today', 'Last 7 days', 'Last 30 days', 'All Time'];
  const { width } = Dimensions.get('window');

  // Mock data for analytics
  const siteStats = [
    { label: 'Total Sites', value: 15 },
    { label: 'Active Monitoring', value: 12 },
    { label: 'High-Risk Sites', value: 4 },
  ];
  const siteDetections = [25, 18, 14, 10, 7, 5];
  const siteLabels = ['Facebook', 'Twitter', 'YouTube', 'Instagram', 'TikTok', 'Other'];
  const mostActiveSites = [
    { name: 'Facebook', detections: 25 },
    { name: 'Twitter', detections: 18 },
    { name: 'YouTube', detections: 14 },
    { name: 'Reddit', detections: 10 },
    { name: 'Blogs', detections: 7 },
  ];

  const siteTypeData = [
    { name: 'Social Media', population: 60, color: '#FF6384', legendFontColor: '#7F7F7F', legendFontSize: 12 },
    { name: 'Forums', population: 20, color: '#36A2EB', legendFontColor: '#7F7F7F', legendFontSize: 12 },
    { name: 'Blogs', population: 10, color: '#FFCE56', legendFontColor: '#7F7F7F', legendFontSize: 12 },
    { name: 'News Sites', population: 5, color: '#4BC0C0', legendFontColor: '#7F7F7F', legendFontSize: 12 },
    { name: 'Other', population: 5, color: '#9966CC', legendFontColor: '#7F7F7F', legendFontSize: 12 },
  ];

  const barChartData = {
    labels: siteLabels,
    datasets: [
      {
        data: siteDetections,
        colors: [
          (opacity = 1) => `rgba(79, 70, 229, ${opacity})`,
          (opacity = 1) => `rgba(99, 102, 241, ${opacity})`,
          (opacity = 1) => `rgba(129, 140, 248, ${opacity})`,
          (opacity = 1) => `rgba(165, 180, 252, ${opacity})`,
          (opacity = 1) => `rgba(199, 210, 254, ${opacity})`,
          (opacity = 1) => `rgba(224, 231, 255, ${opacity})`,
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

  const pieChartConfig = {
    backgroundColor: 'transparent',
    color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    paddingTop: 10,
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <MainHeader
        title="Sites"
        subtitle="Sites analytics and details"
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

      {/* Site Stats */}
      <View style={styles.overallStatsContainer}>
        {siteStats.map((item, idx) => (
          <View key={idx} style={styles.statCard}>
            <Text style={styles.statValue}>{item.value}</Text>
            <Text style={styles.statLabel}>{item.label}</Text>
          </View>
        ))}
      </View>

      {/* Detections Per Site Bar Chart */}
      <View style={styles.chartContainer}>
        <View style={styles.chartHeader}>
          <Text style={styles.chartTitle}>Detections Per Site</Text>
        </View>
        <BarChart
          data={barChartData}
          width={width - 40}
          height={180}
          chartConfig={barChartConfig}
          style={styles.chart}
          fromZero
          showBarTops
          showValuesOnTopOfBars
          flatColor
        />
      </View>

      {/* Site Type Distribution Pie Chart */}
      <View style={styles.chartContainer}>
        <View style={styles.chartHeader}>
          <Text style={styles.chartTitle}>Site Type Distribution</Text>
        </View>
        <PieChart
          data={siteTypeData}
          width={width - 40}
          height={200}
          chartConfig={pieChartConfig}
          accessor="population"
          backgroundColor="transparent"
          paddingLeft="15"
          absolute
        />
      </View>

      {/* Most Active Sites */}
      <View style={styles.analyticsSectionContainer}>
        <Text style={styles.analyticsSectionTitle}>Most Active Sites</Text>
        <View style={styles.analyticsList}>
          {mostActiveSites.map((site, idx) => (
            <View key={idx} style={styles.analyticsListItem}>
              <Text style={styles.analyticsListItemText}>{site.name}</Text>
              <Text style={styles.analyticsListItemValue}>{site.detections} detections</Text>
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
  analyticsListItemValue: {
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    color: '#111827',
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
});