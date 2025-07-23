import { useEffect, useState } from 'react';
import {
    Dimensions,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { BarChart, PieChart } from 'react-native-chart-kit';
import MainHeader from '../../../components/common/MainHeader';

const API_BASE_URL = 'http://localhost:3000/api';

const groupsService = {
  getGroups: async (timeRange) => {
    try {
      console.log(`Fetching groups data for timeRange: ${timeRange}`);
      const response = await fetch(`${API_BASE_URL}/dashboard/groups?timeRange=${encodeURIComponent(timeRange)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log(`API Response status: ${response.status}`);

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`API Error: ${response.status} - ${errorText}`);
        throw new Error(`Failed to fetch groups data: ${response.status}`);
      }

      const data = await response.json();
      console.log('Raw API response:', data);

      return data;
    } catch (error) {
      console.error('Groups service error:', error);
      throw error;
    }
  },
};

export default function AdminGroupsScreen({ navigation }) {
  const [selectedTimeRange, setSelectedTimeRange] = useState('Today');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [groupsData, setGroupsData] = useState({
    groups: null,
  });

  const timeRanges = ['Today', 'Last 7 days', 'Last 30 days', 'All Time'];
  const { width } = Dimensions.get('window');

  const fetchGroupsData = async (timeRange) => {
    try {
      setIsLoading(true);
      setError(null);
      const groups = await groupsService.getGroups(timeRange);

      setGroupsData({
        groups,
      });
    } catch (error) {
      console.error("Failed to fetch groups data:", error);
      setError("Failed to load groups data. Please try again later.");
      setGroupsData({
        groups: {
          totalGroups: 0,
          activeGroups: 0,
          inactiveGroups: 0,
          largestGroups: [],
          statusDistribution: [],
          groupsWithMembers: []
        },
      });
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const onRefresh = () => {
    setIsRefreshing(true);
    fetchGroupsData(selectedTimeRange);
  };

  // Process data for display
  const groupStats = groupsData.groups ? [
    { label: 'Total Groups', value: groupsData.groups.totalGroups || 0 },
    { label: 'Active Groups', value: groupsData.groups.activeGroups || 0 },
    { label: 'Inactive Groups', value: groupsData.groups.inactiveGroups || 0 },
  ] : [
    { label: 'Total Groups', value: 0 },
    { label: 'Active Groups', value: 0 },
    { label: 'Inactive Groups', value: 0 },
  ];

  // Get largest groups for charts
  const largestGroups = groupsData.groups?.largestGroups?.slice(0, 6) || [];
  const groupLabels = largestGroups.map(group => group.name.length > 10 ? group.name.substring(0, 10) + '...' : group.name);
  const groupSizes = largestGroups.map(group => group.memberCount);

  // Create balanced colors for pie chart
  const balancedColors = [
    '#34D399', // Medium emerald
    '#F87171', // Medium red
    '#FBBF24', // Medium amber
  ];

  const groupStatusData = groupsData.groups?.statusDistribution?.map((status, index) => ({
    name: status.status.charAt(0).toUpperCase() + status.status.slice(1),
    population: status.count,
    color: balancedColors[index % balancedColors.length],
    legendFontColor: '#374151',
    legendFontSize: 11,
    legendFontFamily: 'Poppins-Medium',
  })) || [];

  // Fetch data when component mounts or time range changes
  useEffect(() => {
    fetchGroupsData(selectedTimeRange);
  }, [selectedTimeRange]);

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
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={onRefresh}
          colors={['#01B97F']}
          tintColor={'#01B97F'}
        />
      }
    >
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

      {error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : isLoading ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading groups data...</Text>
        </View>
      ) : (
        <>
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
          {largestGroups.length > 0 && (
            <View style={styles.chartContainer}>
              <View style={styles.chartHeader}>
                <Text style={styles.chartTitle}>Group Sizes ({selectedTimeRange})</Text>
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <BarChart
                  data={{
                    labels: groupLabels,
                    datasets: [
                      {
                        data: groupSizes.length > 0 ? groupSizes : [0],
                        colors: groupSizes.map((_, index) => {
                          const colors = [
                            '#01B97F', // Primary theme
                            '#34D399', // Emerald variant
                            '#10B981', // Emerald light
                            '#065F46', // Emerald dark
                            '#6B7280', // Gray
                            '#374151', // Dark gray
                          ];
                          return (opacity = 1) => colors[index % colors.length] || '#01B97F';
                        }),
                      },
                    ],
                  }}
                  width={Math.max((groupLabels.length * 80), width - 40)}
                  height={200}
                  chartConfig={{
                    backgroundColor: 'transparent',
                    backgroundGradientFrom: '#ffffff',
                    backgroundGradientTo: '#ffffff',
                    decimalPlaces: 0,
                    color: (opacity = 1) => '#01B97F',
                    labelColor: (opacity = 1) => `rgba(75, 85, 99, ${opacity})`,
                    style: { borderRadius: 16 },
                    propsForBackgroundLines: {
                      strokeWidth: 1,
                      stroke: '#f3f4f6',
                      strokeDasharray: '5,5'
                    },
                    propsForLabels: {
                      fontSize: 11,
                      fontFamily: 'Poppins-Medium'
                    },
                  }}
                  style={styles.chart}
                  fromZero
                  showBarTops={false}
                  showValuesOnTopOfBars
                  withCustomBarColorFromData
                  flatColor={false}
                />
              </ScrollView>
            </View>
          )}

          {/* Group Status Distribution Pie Chart */}
          {groupStatusData.length > 0 && (
            <View style={styles.chartContainer}>
              <View style={styles.chartHeader}>
                <Text style={styles.chartTitle}>Group Status Distribution</Text>
              </View>
              <PieChart
                data={groupStatusData}
                width={width - 40}
                height={200}
                chartConfig={{
                  backgroundColor: 'transparent',
                  color: (opacity = 1) => `rgba(1, 185, 127, ${opacity})`,
                  labelColor: (opacity = 1) => `rgba(55, 65, 81, ${opacity})`,
                  style: {
                    borderRadius: 16,
                  },
                }}
                accessor="population"
                backgroundColor="transparent"
                paddingLeft="15"
                absolute={false}
                hasLegend={true}
                avoidFalseZero={true}
              />
            </View>
          )}

          {/* Largest Groups */}
          <View style={styles.analyticsSectionContainer}>
            <Text style={styles.analyticsSectionTitle}>Largest Groups</Text>
            <View style={styles.analyticsList}>
              {largestGroups.map((group, idx) => (
                <View key={idx} style={styles.analyticsListItem}>
                  <View style={styles.groupInfo}>
                    <Text style={styles.analyticsListItemText}>{group.name}</Text>
                    <Text style={styles.groupStatus}>Status: {group.status}</Text>
                  </View>
                  <Text style={styles.analyticsListItemValue}>{group.memberCount} members</Text>
                </View>
              ))}
            </View>
          </View>
        </>
      )}
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
  groupInfo: {
    flex: 1,
  },
  groupStatus: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: '#6b7280',
    marginTop: 2,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    color: '#6b7280',
    marginTop: 12,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
    backgroundColor: '#fef2f2',
    borderRadius: 12,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: '#ef4444',
    marginBottom: 20,
  },
  errorText: {
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    color: '#ef4444',
    marginTop: 8,
    textAlign: 'center',
  },
});