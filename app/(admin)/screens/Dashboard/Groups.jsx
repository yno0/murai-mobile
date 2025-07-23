import { useState } from 'react';
import { Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { BarChart, PieChart } from 'react-native-chart-kit';
import MainHeader from '../../../components/common/MainHeader';

export default function AdminGroupsScreen({ navigation }) {
  const [selectedTimeRange, setSelectedTimeRange] = useState('Today');
  const timeRanges = ['Today', 'Last 7 days', 'Last 30 days', 'All Time'];
  const { width } = Dimensions.get('window');

  // Mock data for analytics
  const groupStats = [
    { label: 'Total Groups', value: 18 },
    { label: 'Active Groups', value: 14 },
    { label: 'Inactive Groups', value: 4 },
  ];
  const groupSizes = [32, 28, 24, 20, 18, 12];
  const groupLabels = ['Group A', 'Group B', 'Group C', 'Group D', 'Group E', 'Group F'];
  const largestGroups = [
    { name: 'Group A', members: 32 },
    { name: 'Group B', members: 28 },
    { name: 'Group C', members: 24 },
    { name: 'Group D', members: 20 },
    { name: 'Group E', members: 18 },
  ];

  const groupStatusData = [
    { name: 'Active', population: 14, color: '#4CAF50', legendFontColor: '#7F7F7F', legendFontSize: 12 },
    { name: 'Inactive', population: 4, color: '#F44336', legendFontColor: '#7F7F7F', legendFontSize: 12 },
    { name: 'Pending', population: 2, color: '#FFEB3B', legendFontColor: '#7F7F7F', legendFontSize: 12 },
  ];

  const barChartData = {
    labels: groupLabels,
    datasets: [
      {
        data: groupSizes,
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
        title="Groups"
        subtitle="Groups analytics and details"
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

      {/* Group Stats */}
      <View style={styles.overallStatsContainer}>
        {groupStats.map((item, idx) => (
          <View key={idx} style={styles.statCard}>
            <Text style={styles.statValue}>{item.value}</Text>
            <Text style={styles.statLabel}>{item.label}</Text>
          </View>
        ))}
      </View>

      {/* Group Sizes Bar Chart */}
      <View style={styles.chartContainer}>
        <View style={styles.chartHeader}>
          <Text style={styles.chartTitle}>Group Sizes</Text>
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

      {/* Group Status Distribution Pie Chart */}
      <View style={styles.chartContainer}>
        <View style={styles.chartHeader}>
          <Text style={styles.chartTitle}>Group Status Distribution</Text>
        </View>
        <PieChart
          data={groupStatusData}
          width={width - 40}
          height={200}
          chartConfig={pieChartConfig}
          accessor="population"
          backgroundColor="transparent"
          paddingLeft="15"
          absolute
        />
      </View>

      {/* Largest Groups */}
      <View style={styles.analyticsSectionContainer}>
        <Text style={styles.analyticsSectionTitle}>Largest Groups</Text>
        <View style={styles.analyticsList}>
          {largestGroups.map((group, idx) => (
            <View key={idx} style={styles.analyticsListItem}>
              <Text style={styles.analyticsListItemText}>{group.name}</Text>
              <Text style={styles.analyticsListItemValue}>{group.members} members</Text>
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