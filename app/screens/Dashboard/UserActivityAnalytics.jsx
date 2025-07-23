import { Feather } from '@expo/vector-icons';
import React, { useState } from 'react';
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

// API service for user activity data
const API_BASE_URL = 'http://localhost:3000/api';

const userActivityService = {
  getUserActivityData: async (timeRange) => {
    try {
      const response = await fetch(`${API_BASE_URL}/dashboard/user-activity?timeRange=${encodeURIComponent(timeRange)}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('User activity data received:', data);
      return data;
    } catch (error) {
      console.error('Error fetching user activity data:', error);
      return {
        activityBreakdown: [],
        recentActivity: [],
        activeUsers: 0,
        totalActivities: 0
      };
    }
  },
};

const { width } = Dimensions.get('window');

function UserActivityAnalyticsScreen({ navigation }) {
  const [selectedTimeRange, setSelectedTimeRange] = useState('Today');
  const [selectedGroup, setSelectedGroup] = useState('Overall');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userActivityData, setUserActivityData] = useState({
    activityBreakdown: [],
    recentActivity: [],
    activeUsers: 0,
    totalActivities: 0
  });

  const timeRanges = ['Today', 'Last 7 days', 'Last 30 days', 'All Time'];
  const groupOptions = [
    { label: 'Overall', value: 'Overall' },
    { label: 'Family Chat', value: 'family' },
    { label: 'Work Team', value: 'work' },
    { label: 'Gaming Group', value: 'gaming' },
    { label: 'Study Group', value: 'study' },
    { label: 'Sports Club', value: 'sports' },
  ];

  // Fetch user activity data
  const fetchUserActivityData = async (timeRange) => {
    try {
      setIsLoading(true);
      const data = await userActivityService.getUserActivityData(timeRange);
      setUserActivityData(data);
    } catch (error) {
      console.error('Failed to fetch user activity data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUserActivityData(selectedTimeRange);
  }, [selectedTimeRange]);

  // Transform real data into chart format
  const generateChartData = () => {
    if (!userActivityData.recentActivity || userActivityData.recentActivity.length === 0) {
      return [0, 0, 0, 0, 0, 0, 0];
    }

    // Group activities by day for the last 7 days
    const last7Days = [];
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dayKey = date.toISOString().split('T')[0];
      
      const dayCount = userActivityData.recentActivity.filter(activity => {
        const activityDate = new Date(activity.timestamp).toISOString().split('T')[0];
        return activityDate === dayKey;
      }).length;
      
      last7Days.push(dayCount);
    }

    return last7Days;
  };

  // Generate mock most active users from real activity data
  const getMostActiveUsers = () => {
    if (!userActivityData.recentActivity || userActivityData.recentActivity.length === 0) {
      return [];
    }

    // Group activities by user
    const userActivityCount = {};
    userActivityData.recentActivity.forEach(activity => {
      const userName = activity.user || 'Unknown User';
      userActivityCount[userName] = (userActivityCount[userName] || 0) + 1;
    });

    // Convert to array and sort
    return Object.entries(userActivityCount)
      .map(([name, count]) => ({
        name,
        flags: count,
        change: `+${Math.floor(Math.random() * 5) + 1}`,
        avatar: name.charAt(0).toUpperCase(),
        group: 'Active Group'
      }))
      .sort((a, b) => b.flags - a.flags)
      .slice(0, 5);
  };

  // Overall analytics data using real API data
  const overallData = {
    mostActiveUsers: getMostActiveUsers(),
    chartData: generateChartData(),
    allowedWords: [
      { word: 'heck', reason: 'Context appropriate', date: '2 days ago', group: 'Family Chat' },
      { word: 'darn', reason: 'Mild expression', date: '1 week ago', group: 'Work Team' },
      { word: 'shoot', reason: 'Sports context', date: '3 days ago', group: 'Gaming Group' },
    ],
  };

  // Group-specific analytics data
  const groupDataMap = {
    family: {
      mostActiveUsers: [
        { name: 'John Doe', flags: 8, change: '+2', avatar: 'J', group: 'Active today' },
        { name: 'David Wilson', flags: 6, change: '0', avatar: 'D', group: 'Active yesterday' },
        { name: 'Mom', flags: 4, change: '+1', avatar: 'M', group: 'Active today' },
      ],
      chartData: [8, 10, 6, 12, 15, 18, 14],
      allowedWords: [
        { word: 'heck', reason: 'Context appropriate', date: '2 days ago', group: 'Family context' },
      ],
    },
    work: {
      mostActiveUsers: [
        { name: 'Sarah Smith', flags: 12, change: '+1', avatar: 'S', group: 'Team lead' },
        { name: 'Alex Johnson', flags: 7, change: '+3', avatar: 'A', group: 'Developer' },
        { name: 'Emily Davis', flags: 5, change: '-1', avatar: 'E', group: 'Designer' },
      ],
      chartData: [5, 8, 12, 15, 11, 18, 20],
      allowedWords: [
        { word: 'darn', reason: 'Mild expression', date: '1 week ago', group: 'Work discussion' },
        { word: 'pressure', reason: 'Work context', date: '3 days ago', group: 'Project talk' },
      ],
    },
    gaming: {
      mostActiveUsers: [
        { name: 'Mike Johnson', flags: 10, change: '-2', avatar: 'M', group: 'Pro player' },
        { name: 'GameMaster', flags: 8, change: '+4', avatar: 'G', group: 'Moderator' },
        { name: 'PlayerOne', flags: 6, change: '+1', avatar: 'P', group: 'Regular' },
      ],
      chartData: [15, 12, 18, 22, 16, 25, 20],
      allowedWords: [
        { word: 'shoot', reason: 'Sports context', date: '3 days ago', group: 'Gaming term' },
        { word: 'competitive', reason: 'Gaming context', date: '1 day ago', group: 'Game discussion' },
      ],
    },
    study: {
      mostActiveUsers: [
        { name: 'Lisa Brown', flags: 8, change: '+2', avatar: 'L', group: 'Study leader' },
        { name: 'Student A', flags: 5, change: '+1', avatar: 'SA', group: 'Active member' },
        { name: 'Student B', flags: 3, change: '0', avatar: 'SB', group: 'Regular member' },
      ],
      chartData: [3, 5, 8, 6, 10, 12, 15],
      allowedWords: [
        { word: 'challenge', reason: 'Study motivation', date: '5 days ago', group: 'Academic context' },
      ],
    },
    sports: {
      mostActiveUsers: [
        { name: 'Coach Mike', flags: 6, change: '+2', avatar: 'C', group: 'Team coach' },
        { name: 'Player X', flags: 4, change: '0', avatar: 'PX', group: 'Team captain' },
        { name: 'Player Y', flags: 3, change: '+1', avatar: 'PY', group: 'Regular player' },
      ],
      chartData: [2, 4, 6, 5, 8, 10, 12],
      allowedWords: [
        { word: 'aggressive', reason: 'Sports context', date: '1 week ago', group: 'Game strategy' },
      ],
    },
  };

  const currentData = selectedGroup === 'Overall' ? overallData : groupDataMap[selectedGroup] || overallData;

  const chartData = {
    labels: ['', '', '', '', '', '', ''],
    datasets: [
      {
        data: [45, 52, 38, 67, 58, 74, 82],
        strokeWidth: 2,
        color: (opacity = 1) => `rgba(34, 197, 94, ${opacity})`,
        fillShadowGradient: 'rgba(34, 197, 94, 0.1)',
        fillShadowGradientOpacity: 0.1,
      },
      {
        data: [25, 35, 28, 45, 40, 55, 62],
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

  const statsData = [
    { label: 'PROTECTED USERS', value: '4.9k', change: '-2,149', changeLabel: 'FLAGS PREVENTED' },
    { label: 'SAFETY SCORE', value: '+12k', change: '+59%', changeLabel: 'IMPROVEMENT' },
    { label: 'ALERTS HANDLED', value: '+9,231', change: '1.9m', changeLabel: 'TOTAL REACH' },
  ];

  const alertInteractions = [
    { metric: 'Alerts Opened', count: 45, percentage: '75%' },
    { metric: 'Alerts Dismissed', count: 15, percentage: '25%' },
    { metric: 'Response Time', count: '2.3s', percentage: 'Avg' },
    { metric: 'User Engagement', count: 'High', percentage: '92%' },
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Feather name="arrow-left" size={24} color="#374151" />
        </TouchableOpacity>
        <Text style={styles.title}>People & Activity</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Group Selection Dropdown */}
      <View style={styles.dropdownContainer}>
        <TouchableOpacity 
          style={styles.dropdownButton}
          onPress={() => setIsDropdownOpen(!isDropdownOpen)}
        >
          <View style={styles.dropdownLeft}>
            <View>
              <Text style={styles.dropdownLabel}>
                {groupOptions.find(option => option.value === selectedGroup)?.label}
              </Text>
              <Text style={styles.dropdownSubtext}>
                {selectedGroup === 'Overall' ? '@allgroups' : '@group'}
              </Text>
            </View>
          </View>
          <Feather 
            name={isDropdownOpen ? "chevron-up" : "chevron-down"} 
            size={20} 
            color="#6b7280" 
          />
        </TouchableOpacity>
        
        {isDropdownOpen && (
          <View style={styles.dropdownMenu}>
            {groupOptions.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={styles.dropdownItem}
                onPress={() => {
                  setSelectedGroup(option.value);
                  setIsDropdownOpen(false);
                }}
              >
                <Text style={[
                  styles.dropdownItemText,
                  selectedGroup === option.value && styles.dropdownItemTextActive
                ]}>
                  {option.label}
                </Text>
                {selectedGroup === option.value && (
                  <Feather name="check" size={16} color="#6b7280" />
                )}
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      {/* Dual Line Chart */}
      <View style={styles.chartSection}>
        <View style={styles.chartContainer}>
          <LineChart
            data={chartData}
            width={width - 40}
            height={200}
            chartConfig={chartConfig}
            bezier
            style={styles.chart}
            withDots={false}
            withShadow={false}
            withFill={true}
          />
          <View style={styles.chartLegend}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#22c55e' }]} />
              <Text style={styles.legendText}>Protected Users</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#6b7280' }]} />
              <Text style={styles.legendText}>Safety Alerts</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Statistics Cards */}
      <View style={styles.statsSection}>
        <View style={styles.statsGrid}>
          {statsData.map((stat, index) => (
            <View key={index} style={styles.statCard}>
              <Text style={styles.statLabel}>{stat.label}</Text>
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statChange}>{stat.change}</Text>
              <Text style={styles.statChangeLabel}>{stat.changeLabel}</Text>
            </View>
          ))}
        </View>
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

      {/* Most Active Users */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Most Active Users</Text>
        <View style={styles.usersContainer}>
          {currentData.mostActiveUsers.map((user, index) => (
            <View key={index} style={styles.userItem}>
              <View style={styles.userInfo}>
                <View style={styles.userAvatar}>
                  <Text style={styles.avatarText}>{user.avatar}</Text>
                </View>
                <View style={styles.userDetails}>
                  <Text style={styles.userName}>{user.name}</Text>
                  <Text style={styles.userFlags}>
                    {selectedGroup === 'Overall' 
                      ? `${user.flags} flags • ${user.group}` 
                      : `${user.flags} flags • ${user.group}`
                    }
                  </Text>
                </View>
              </View>
              <View style={[
                styles.changeBadge,
                { backgroundColor: user.change.startsWith('+') ? '#fef3c7' : '#fef2f2' }
              ]}>
                <Text style={[
                  styles.changeText,
                  { color: user.change.startsWith('+') ? '#f59e0b' : '#ef4444' }
                ]}>
                  {user.change}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* Words You Allowed */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Words You Allowed</Text>
        <View style={styles.allowedContainer}>
          {currentData.allowedWords.map((item, index) => (
            <View key={index} style={styles.allowedItem}>
              <View style={styles.allowedInfo}>
                <Text style={styles.allowedWord}>{item.word}</Text>
                <Text style={styles.allowedReason}>{item.reason} • {item.group}</Text>
              </View>
              <Text style={styles.allowedDate}>{item.date}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Alert Interactions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Alert Interactions</Text>
        <View style={styles.interactionsContainer}>
          {alertInteractions.map((interaction, index) => (
            <View key={index} style={styles.interactionItem}>
              <View style={styles.interactionInfo}>
                <Text style={styles.interactionMetric}>{interaction.metric}</Text>
                <Text style={styles.interactionCount}>{interaction.count}</Text>
              </View>
              <View style={styles.percentageBadge}>
                <Text style={styles.percentageText}>{interaction.percentage}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* Activity Trend Chart */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>User Activity Trend</Text>
        <View style={styles.chartContainer}>
          <LineChart
            data={chartData}
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

      {/* Activity Summary */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Activity Summary</Text>
        <View style={styles.summaryContainer}>
          <View style={styles.summaryItem}>
            <MaterialCommunityIcons name="account-group" size={20} color="#f59e0b" />
            <Text style={styles.summaryText}>
              {selectedGroup === 'Overall' 
                ? '5 active users this week' 
                : `${currentData.mostActiveUsers.length} active members this week`
              }
            </Text>
          </View>
          <View style={styles.summaryItem}>
            <MaterialCommunityIcons name="check-circle" size={20} color="#10b981" />
            <Text style={styles.summaryText}>
              {selectedGroup === 'Overall' 
                ? '3 words allowed by users' 
                : `${currentData.allowedWords.length} words allowed in group`
              }
            </Text>
          </View>
          <View style={styles.summaryItem}>
            <MaterialCommunityIcons name="bell-ring" size={20} color="#3b82f6" />
            <Text style={styles.summaryText}>75% alert engagement rate</Text>
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
  dropdownContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#f3f4f6',
  },
  dropdownButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dropdownLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dropdownLabel: {
    fontSize: 16,
    fontFamily: 'Poppins-Medium',
    color: '#111827',
    marginBottom: 2,
  },
  dropdownSubtext: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: '#9ca3af',
  },
  dropdownMenu: {
    marginTop: 12,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#f3f4f6',
  },
  dropdownItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f8f9fa',
  },
  dropdownItemText: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#6b7280',
  },
  dropdownItemTextActive: {
    fontFamily: 'Poppins-Medium',
    color: '#111827',
  },
  chartSection: {
    marginBottom: 20,
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
  chartLegend: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 15,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  legendText: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: '#6b7280',
  },
  statsSection: {
    marginBottom: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCard: {
    width: '32%', // Three columns
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#f3f4f6',
  },
  statLabel: {
    fontSize: 10,
    fontFamily: 'Poppins-Regular',
    color: '#6b7280',
    marginBottom: 4,
    textAlign: 'center',
  },
  statValue: {
    fontSize: 16,
    fontFamily: 'Poppins-Medium',
    color: '#111827',
    marginBottom: 2,
    textAlign: 'center',
  },
  statChange: {
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    color: '#6b7280',
    textAlign: 'center',
  },
  statChangeLabel: {
    fontSize: 9,
    fontFamily: 'Poppins-Regular',
    color: '#9ca3af',
    textAlign: 'center',
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
    fontFamily: 'Poppins-Regular',
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Poppins-Medium',
    color: '#374151',
    marginBottom: 16,
  },
  usersContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#f3f4f6',
  },
  userItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f8f9fa',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fef3c7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 16,
    fontFamily: 'Poppins-Medium',
    color: '#f59e0b',
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    color: '#111827',
    marginBottom: 4,
  },
  userFlags: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: '#6b7280',
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
  allowedContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  allowedItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  allowedInfo: {
    flex: 1,
  },
  allowedWord: {
    fontSize: 16,
    fontFamily: 'Poppins-Medium',
    color: '#374151',
    marginBottom: 4,
  },
  allowedReason: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#6b7280',
  },
  allowedDate: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: '#9ca3af',
  },
  interactionsContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  interactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  interactionInfo: {
    flex: 1,
  },
  interactionMetric: {
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    color: '#374151',
    marginBottom: 4,
  },
  interactionCount: {
    fontSize: 16,
    fontFamily: 'Poppins-Medium',
    color: '#374151',
  },
  percentageBadge: {
    backgroundColor: '#eff6ff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  percentageText: {
    fontSize: 12,
    fontFamily: 'Poppins-Medium',
    color: '#3b82f6',
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
});

export default UserActivityAnalyticsScreen; 