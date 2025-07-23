import { Feather } from '@expo/vector-icons';
import { useState } from 'react';
import { Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { BarChart, PieChart } from 'react-native-chart-kit';

export default function AdminUsersScreen({ navigation }) {
  const [selectedTimeRange, setSelectedTimeRange] = useState('Today');
  const timeRanges = ['Today', 'Last 7 days', 'Last 30 days', 'All Time'];
  const { width } = Dimensions.get('window');

  // Mock data for analytics
  const userStats = [
    { label: 'Total Users', value: 1247 },
    { label: 'Active Users', value: 892 },
    { label: 'New Users', value: 45 },
  ];
  const userActivity = [120, 150, 130, 180, 160, 200, 190];
  const activityLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const topActiveUsers = [
    { name: 'Alice Johnson', activity: 245 },
    { name: 'Bob Smith', activity: 198 },
    { name: 'Charlie Brown', activity: 167 },
    { name: 'Diana Prince', activity: 134 },
    { name: 'Edward Norton', activity: 112 },
  ];

  const userTypeData = [
    { name: 'Regular Users', population: 75, color: '#4CAF50', legendFontColor: '#7F7F7F', legendFontSize: 12 },
    { name: 'Premium Users', population: 20, color: '#2196F3', legendFontColor: '#7F7F7F', legendFontSize: 12 },
    { name: 'Admin Users', population: 3, color: '#FF9800', legendFontColor: '#7F7F7F', legendFontSize: 12 },
    { name: 'Suspended', population: 2, color: '#F44336', legendFontColor: '#7F7F7F', legendFontSize: 12 },
  ];

  const barChartData = {
    labels: activityLabels,
    datasets: [
      {
        data: userActivity,
        colors: [
          (opacity = 1) => `rgba(79, 70, 229, ${opacity})`,
          (opacity = 1) => `rgba(99, 102, 241, ${opacity})`,
          (opacity = 1) => `rgba(129, 140, 248, ${opacity})`,
          (opacity = 1) => `rgba(165, 180, 252, ${opacity})`,
          (opacity = 1) => `rgba(199, 210, 254, ${opacity})`,
          (opacity = 1) => `rgba(224, 231, 255, ${opacity})`,
          (opacity = 1) => `rgba(238, 242, 255, ${opacity})`,
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
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Feather name="arrow-left" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Users</Text>
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

      {/* User Stats */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>User Statistics</Text>
        <View style={styles.card}>
          <View style={styles.statRow}>
            {userStats.map((item, idx) => (
              <View key={idx} style={styles.statItem}>
                <Text style={styles.statNumber}>{item.value}</Text>
                <Text style={styles.statLabel}>{item.label}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>

      {/* User Activity Bar Chart */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Weekly User Activity</Text>
        <View style={styles.card}>
          <BarChart
            data={barChartData}
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

      {/* User Type Distribution Pie Chart */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>User Type Distribution</Text>
        <View style={styles.card}>
          <PieChart
            data={userTypeData}
            width={width - 60} // Adjusted for card padding
            height={200}
            chartConfig={pieChartConfig}
            accessor="population"
            backgroundColor="transparent"
            paddingLeft="15"
            absolute
          />
        </View>
      </View>

      {/* Top Active Users */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Most Active Users</Text>
        <View style={styles.card}>
          {topActiveUsers.map((user, idx) => (
            <View key={idx} style={styles.activeUserItem}>
              <Text style={styles.activeUserName}>{user.name}</Text>
              <Text style={styles.activeUserActivity}>{user.activity} actions</Text>
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
    backgroundColor: '#F0F2F5',
    paddingHorizontal: 0,
    paddingTop: 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 20,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 3,
  },
  backButton: {
    marginRight: 12,
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: 'Poppins-Bold',
    color: '#111827',
  },
  section: {
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Poppins-SemiBold',
    color: '#111827',
    marginBottom: 15,
    marginTop: 20,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#f3f4f6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3.84,
    elevation: 5,
  },
  timeRangeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 8,
    marginTop: 20,
    marginHorizontal: 20,
    borderWidth: 1,
    borderColor: '#f3f4f6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3.84,
    elevation: 5,
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
  activeUserItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f8f9fa',
  },
  activeUserName: {
    fontSize: 16,
    fontFamily: 'Poppins-Medium',
    color: '#111827',
  },
  activeUserActivity: {
    fontSize: 13,
    fontFamily: 'Poppins-Regular',
    color: '#6b7280',
  },
});