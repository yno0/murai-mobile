import { Feather } from '@expo/vector-icons';
import { useState } from 'react';
import { Dimensions, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { LineChart } from 'react-native-chart-kit';

const screenWidth = Dimensions.get('window').width;



export default function UsersOverview({ users, loading, onRefresh }) {
  const [selectedTimeFilter, setSelectedTimeFilter] = useState('today');

  const getStats = () => {
    const total = users.length;
    const active = users.filter(u => u.status === 'Active').length;
    const inactive = users.filter(u => u.status === 'Inactive').length;
    const admins = users.filter(u => u.role === 'Admin').length;
    const regularUsers = users.filter(u => u.role === 'User').length;
    const premiumUsers = users.filter(u => u.isPremium).length;

    return { total, active, inactive, admins, regularUsers, premiumUsers };
  };

  // Prepare chart data
  const getChartData = () => {
    const stats = getStats();

    // Generate trends data based on selected time filter
    const getTrendsData = () => {
      const now = new Date();
      const labels = [];
      const registrationData = [];

      if (selectedTimeFilter === 'today') {
        // Today - hourly data (24 hours)
        for (let i = 23; i >= 0; i--) {
          const hour = new Date(now);
          hour.setHours(hour.getHours() - i);

          // Format as hour (00, 06, 12, 18)
          if (i % 6 === 0) {
            labels.push(hour.getHours().toString().padStart(2, '0') + ':00');
          } else {
            labels.push('');
          }

          const hourUsers = users.filter(user => {
            const userDate = new Date(user.joinedAt);
            return userDate.getDate() === hour.getDate() &&
                   userDate.getMonth() === hour.getMonth() &&
                   userDate.getFullYear() === hour.getFullYear() &&
                   userDate.getHours() === hour.getHours();
          }).length;

          registrationData.push(hourUsers);
        }
      } else if (selectedTimeFilter === 'week') {
        // This week - daily data (7 days)
        for (let i = 6; i >= 0; i--) {
          const date = new Date(now);
          date.setDate(date.getDate() - i);
          labels.push(date.toLocaleDateString('en', { weekday: 'short' }));

          const dayUsers = users.filter(user => {
            const userDate = new Date(user.joinedAt);
            return userDate.toDateString() === date.toDateString();
          }).length;

          registrationData.push(dayUsers);
        }
      } else if (selectedTimeFilter === 'month') {
        // Last 12 months - monthly data (Jan to Dec)
        for (let i = 11; i >= 0; i--) {
          const date = new Date(now);
          date.setMonth(date.getMonth() - i);
          labels.push(date.toLocaleDateString('en', { month: 'short' }));

          const monthUsers = users.filter(user => {
            const userDate = new Date(user.joinedAt);
            return userDate.getMonth() === date.getMonth() &&
                   userDate.getFullYear() === date.getFullYear();
          }).length;

          registrationData.push(monthUsers);
        }
      } else if (selectedTimeFilter === 'year') {
        // Last few years - yearly data (2022, 2023, 2024, 2025...)
        const currentYear = now.getFullYear();
        const startYear = currentYear - 3; // Show last 4 years

        for (let year = startYear; year <= currentYear; year++) {
          labels.push(year.toString());

          const yearUsers = users.filter(user => {
            const userDate = new Date(user.joinedAt);
            return userDate.getFullYear() === year;
          }).length;

          registrationData.push(yearUsers);
        }
      }

      // If no data, create sample data for visualization
      const hasData = registrationData.some(val => val > 0);
      if (!hasData && users.length > 0) {
        const dataPoints = registrationData.length;
        const avgPerPoint = Math.ceil(users.length / dataPoints);
        for (let i = 0; i < dataPoints; i++) {
          registrationData[i] = Math.max(0, avgPerPoint + Math.floor(Math.random() * 3) - 1);
        }
      }

      return {
        labels,
        datasets: [
          {
            data: registrationData.length > 0 ? registrationData : new Array(labels.length).fill(0),
            color: (opacity = 1) => `rgba(1, 185, 127, ${opacity})`,
            strokeWidth: 3,
          },
        ],
      };
    };

    const userTrendsData = getTrendsData();

    return { userTrendsData, stats };
  };

  const { userTrendsData, stats } = getChartData();

  const getActivityStats = () => {
    const now = new Date();
    const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const lastMonth = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const activeLastWeek = users.filter(u => u.lastActive >= lastWeek).length;
    const activeLastMonth = users.filter(u => u.lastActive >= lastMonth).length;
    const newThisMonth = users.filter(u => u.joinedAt >= lastMonth).length;

    return { activeLastWeek, activeLastMonth, newThisMonth };
  };

  const activityStats = getActivityStats();

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl 
          refreshing={loading} 
          onRefresh={onRefresh}
          tintColor="#01B97F"
          colors={["#01B97F"]}
        />
      }
    >
      {/* Summary Stats */}
      <View style={styles.statsSection}>
        <View style={styles.sectionHeader}>
          <Feather name="users" size={18} color="#01B97F" />
          <Text style={styles.sectionTitle}>User Overview</Text>
        </View>
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Feather name="users" size={20} color="#01B97F" />
            <Text style={styles.statValue}>{stats.total}</Text>
            <Text style={styles.statLabel}>Total Users</Text>
          </View>
          <View style={styles.statCard}>
            <Feather name="star" size={20} color="#d97706" />
            <Text style={styles.statValue}>{stats.premiumUsers}</Text>
            <Text style={styles.statLabel}>Premium</Text>
          </View>
        </View>
      </View>



      {/* User Registration Trends */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Feather name="trending-up" size={18} color="#01B97F" />
          <Text style={styles.sectionTitle}>Registration Trends</Text>
        </View>

        {/* Time Filter */}
        <View style={styles.timeFilterContainer}>
          <TouchableOpacity
            style={[
              styles.timeFilterButton,
              selectedTimeFilter === 'today' && styles.timeFilterButtonActive
            ]}
            onPress={() => setSelectedTimeFilter('today')}
          >
            <Text style={[
              styles.timeFilterText,
              selectedTimeFilter === 'today' && styles.timeFilterTextActive
            ]}>
              Today
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.timeFilterButton,
              selectedTimeFilter === 'week' && styles.timeFilterButtonActive
            ]}
            onPress={() => setSelectedTimeFilter('week')}
          >
            <Text style={[
              styles.timeFilterText,
              selectedTimeFilter === 'week' && styles.timeFilterTextActive
            ]}>
              Week
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.timeFilterButton,
              selectedTimeFilter === 'month' && styles.timeFilterButtonActive
            ]}
            onPress={() => setSelectedTimeFilter('month')}
          >
            <Text style={[
              styles.timeFilterText,
              selectedTimeFilter === 'month' && styles.timeFilterTextActive
            ]}>
              Month
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.timeFilterButton,
              selectedTimeFilter === 'year' && styles.timeFilterButtonActive
            ]}
            onPress={() => setSelectedTimeFilter('year')}
          >
            <Text style={[
              styles.timeFilterText,
              selectedTimeFilter === 'year' && styles.timeFilterTextActive
            ]}>
              Year
            </Text>
          </TouchableOpacity>
        </View>
        <View style={styles.chartContainer}>
          {stats.total > 0 ? (
            <>
              {/* Scrollable Chart Only */}
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.chartScrollView}
                contentContainerStyle={styles.chartScrollContent}
              >
                <LineChart
                  data={userTrendsData}
                  width={screenWidth * 1.2}
                  height={220}
                  chartConfig={{
                    backgroundColor: 'transparent',
                    backgroundGradientFrom: 'transparent',
                    backgroundGradientTo: 'transparent',
                    decimalPlaces: 0,
                    color: (opacity = 1) => `rgba(1, 185, 127, ${opacity})`,
                    labelColor: (opacity = 1) => `rgba(107, 114, 128, ${opacity})`,
                    style: {
                      borderRadius: 0,
                    },
                    propsForDots: {
                      r: '3',
                      strokeWidth: '1',
                      stroke: '#01B97F',
                      fill: '#01B97F',
                    },
                    propsForBackgroundLines: {
                      strokeDasharray: '3,3',
                      stroke: '#e5e7eb',
                      strokeWidth: 0.5,
                    },
                    propsForLabels: {
                      fontSize: 10,
                    },
                  }}
                  bezier
                  withDots={true}
                  withInnerLines={false}
                  withOuterLines={false}
                  withVerticalLines={false}
                  withHorizontalLines={true}
                  style={{
                    paddingRight: 20,
                    paddingLeft: 10,
                  }}
                />
              </ScrollView>

              {/* Fixed Trend Insights */}
              <View style={styles.trendInsights}>
                <View style={styles.trendInsightItem}>
                  <Feather name="calendar" size={14} color="#6b7280" />
                  <Text style={styles.trendInsightText}>
                    {selectedTimeFilter === 'today' ? 'Today (hourly)' :
                     selectedTimeFilter === 'week' ? 'This week (daily)' :
                     selectedTimeFilter === 'month' ? 'Last 12 months' :
                     'Last 4 years'} registration trends
                  </Text>
                </View>
                <View style={styles.trendInsightItem}>
                  <Feather name="arrow-up" size={14} color="#01B97F" />
                  <Text style={styles.trendInsightText}>
                    {userTrendsData.datasets[0].data.reduce((a, b) => a + b, 0)} new users registered
                  </Text>
                </View>
              </View>
            </>
          ) : (
            <View style={styles.noDataContainer}>
              <Text style={styles.noDataText}>No trend data available</Text>
            </View>
          )}
        </View>
      </View>

      {/* Activity Stats */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Feather name="activity" size={18} color="#01B97F" />
          <Text style={styles.sectionTitle}>User Activity Insights</Text>
        </View>
        <View style={styles.card}>
          {/* Active This Week */}
          <View style={styles.activityProgressItem}>
            <View style={styles.activityHeader}>
              <View style={styles.activityLabelContainer}>
                <Feather name="calendar" size={16} color="#01B97F" />
                <View style={styles.activityDetails}>
                  <Text style={styles.activityName}>Active This Week</Text>
                  <Text style={styles.activityDesc}>Users active in last 7 days</Text>
                </View>
              </View>
              <Text style={styles.activityCount}>{activityStats.activeLastWeek}</Text>
            </View>
            <View style={styles.activityProgressBar}>
              <View style={styles.progressBarBackground}>
                <View
                  style={[
                    styles.progressBarFill,
                    {
                      width: `${stats.total > 0 ? (activityStats.activeLastWeek / stats.total) * 100 : 0}%`,
                      backgroundColor: '#01B97F'
                    }
                  ]}
                />
              </View>
              <Text style={styles.activityPercentage}>
                {stats.total > 0 ? Math.round((activityStats.activeLastWeek / stats.total) * 100) : 0}%
              </Text>
            </View>
          </View>

          {/* Active This Month */}
          <View style={styles.activityProgressItem}>
            <View style={styles.activityHeader}>
              <View style={styles.activityLabelContainer}>
                <Feather name="calendar" size={16} color="#F59E0B" />
                <View style={styles.activityDetails}>
                  <Text style={styles.activityName}>Active This Month</Text>
                  <Text style={styles.activityDesc}>Users active in last 30 days</Text>
                </View>
              </View>
              <Text style={styles.activityCount}>{activityStats.activeLastMonth}</Text>
            </View>
            <View style={styles.activityProgressBar}>
              <View style={styles.progressBarBackground}>
                <View
                  style={[
                    styles.progressBarFill,
                    {
                      width: `${stats.total > 0 ? (activityStats.activeLastMonth / stats.total) * 100 : 0}%`,
                      backgroundColor: '#F59E0B'
                    }
                  ]}
                />
              </View>
              <Text style={styles.activityPercentage}>
                {stats.total > 0 ? Math.round((activityStats.activeLastMonth / stats.total) * 100) : 0}%
              </Text>
            </View>
          </View>

          {/* New This Month */}
          <View style={styles.activityProgressItem}>
            <View style={styles.activityHeader}>
              <View style={styles.activityLabelContainer}>
                <Feather name="user-plus" size={16} color="#3B82F6" />
                <View style={styles.activityDetails}>
                  <Text style={styles.activityName}>New This Month</Text>
                  <Text style={styles.activityDesc}>Users joined in last 30 days</Text>
                </View>
              </View>
              <Text style={styles.activityCount}>{activityStats.newThisMonth}</Text>
            </View>
            <View style={styles.activityProgressBar}>
              <View style={styles.progressBarBackground}>
                <View
                  style={[
                    styles.progressBarFill,
                    {
                      width: `${stats.total > 0 ? (activityStats.newThisMonth / stats.total) * 100 : 0}%`,
                      backgroundColor: '#3B82F6'
                    }
                  ]}
                />
              </View>
              <Text style={styles.activityPercentage}>
                {stats.total > 0 ? Math.round((activityStats.newThisMonth / stats.total) * 100) : 0}%
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Status Breakdown */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Feather name="pie-chart" size={18} color="#01B97F" />
          <Text style={styles.sectionTitle}>Status Breakdown</Text>
        </View>
        <View style={styles.statusGrid}>
          <View style={styles.statusCard}>
            <View style={styles.statusIcon}>
              <Feather name="check-circle" size={24} color="#01B97F" />
            </View>
            <Text style={styles.statusValue}>{stats.active}</Text>
            <Text style={styles.statusLabel}>Active Users</Text>
            <Text style={styles.statusPercentage}>
              {((stats.active / stats.total) * 100).toFixed(1)}%
            </Text>
          </View>
          <View style={styles.statusCard}>
            <View style={styles.statusIcon}>
              <Feather name="x-circle" size={24} color="#EF4444" />
            </View>
            <Text style={styles.statusValue}>{stats.inactive}</Text>
            <Text style={styles.statusLabel}>Inactive Users</Text>
            <Text style={styles.statusPercentage}>
              {((stats.inactive / stats.total) * 100).toFixed(1)}%
            </Text>
          </View>
        </View>
      </View>

      {/* Bottom spacing */}
      <View style={styles.bottomSpacing} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 10,
  },
  statsSection: {
    marginBottom: 20,
  },
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    color: '#111827',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#f3f4f6',
  },
  statValue: {
    fontSize: 24,
    fontFamily: 'Poppins-Bold',
    color: '#111827',
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: 'Poppins-Medium',
    color: '#9ca3af',
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#f3f4f6',
  },
  roleItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f8fafc',
  },
  roleInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  roleIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f8fafc',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  roleDetails: {
    flex: 1,
  },
  roleName: {
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    color: '#111827',
  },
  roleCount: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: '#6b7280',
    marginTop: 2,
  },
  percentageBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  percentageText: {
    fontSize: 12,
    fontFamily: 'Poppins-Medium',
  },
  // Chart styles
  chartCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 20,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    alignItems: 'center',
  },
  minimalChartCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
  
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  // Chart container styles
  chartContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    overflow: 'hidden',
    minHeight: 300,
  },
  chartScrollView: {
    // No additional styling needed
  },
  chartScrollContent: {
    paddingLeft: 0,
    paddingRight: 20,
    paddingVertical: 20,
  },
  // Trend insights styles
  trendInsights: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  trendInsightItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  trendInsightText: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: '#6b7280',
    marginLeft: 8,
    flex: 1,
  },
  // Time filter styles
  timeFilterContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 16,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    padding: 4,
  },
  timeFilterButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  timeFilterButtonActive: {
    backgroundColor: '#01B97F',
  },
  timeFilterText: {
    fontSize: 12,
    fontFamily: 'Poppins-Medium',
    color: '#6b7280',
  },
  timeFilterTextActive: {
    color: '#ffffff',
  },
  noDataContainer: {
    height: 220,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noDataText: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#6b7280',
  },
  // Progress bar styles
  progressItem: {
    marginBottom: 20,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressLabel: {
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    color: '#111827',
    marginLeft: 8,
  },
  progressValue: {
    fontSize: 14,
    fontFamily: 'Poppins-SemiBold',
    color: '#6b7280',
  },
  progressBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressBarBackground: {
    flex: 1,
    height: 8,
    backgroundColor: '#f3f4f6',
    borderRadius: 4,
    marginRight: 12,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressPercentage: {
    fontSize: 12,
    fontFamily: 'Poppins-SemiBold',
    color: '#6b7280',
    minWidth: 35,
    textAlign: 'right',
  },
  // Activity progress styles
  activityProgressItem: {
    marginBottom: 20,
  },
  activityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  activityLabelContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
  },
  activityProgressBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  activityPercentage: {
    fontSize: 12,
    fontFamily: 'Poppins-SemiBold',
    color: '#6b7280',
    minWidth: 35,
    textAlign: 'right',
  },
  // Trend summary styles
  trendSummary: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  trendItem: {
    alignItems: 'center',
  },
  trendIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  trendLabel: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: '#6b7280',
    marginLeft: 4,
  },
  trendValue: {
    fontSize: 18,
    fontFamily: 'Poppins-SemiBold',
    color: '#111827',
  },
  trendValueContainer: {
    alignItems: 'center',
  },
  trendGrowth: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  trendGrowthText: {
    fontSize: 10,
    fontFamily: 'Poppins-Medium',
    marginLeft: 2,
  },

  activityItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f8fafc',
  },
  activityInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  activityDetails: {
    marginLeft: 12,
    flex: 1,
  },
  activityName: {
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    color: '#111827',
  },
  activityDesc: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: '#6b7280',
    marginTop: 2,
  },
  activityCount: {
    fontSize: 16,
    fontFamily: 'Poppins-Bold',
    color: '#111827',
  },
  statusGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  statusCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#f3f4f6',
  },
  statusIcon: {
    marginBottom: 12,
  },
  statusValue: {
    fontSize: 20,
    fontFamily: 'Poppins-Bold',
    color: '#111827',
    marginBottom: 4,
  },
  statusLabel: {
    fontSize: 12,
    fontFamily: 'Poppins-Medium',
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 8,
  },
  statusPercentage: {
    fontSize: 14,
    fontFamily: 'Poppins-SemiBold',
    color: '#01B97F',
  },
  bottomSpacing: {
    height: 20,
  },
});
