import { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Animated,
    Dimensions,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { BarChart } from 'react-native-chart-kit';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import MainHeader from '../../components/common/MainHeader';

const { width } = Dimensions.get('window');

// MURAi Color Scheme
const COLORS = {
  PRIMARY: '#02B97F',
  PRIMARY_DARK: '#01A06E',
  PRIMARY_LIGHT: '#E6F7F1',
  BACKGROUND: '#ffffff',
  CARD_BG: '#ffffff',
  SECTION_BG: '#F8FAFC',
  TEXT_MAIN: '#1F2937',
  TEXT_SECONDARY: '#4B5563',
  TEXT_MUTED: '#6B7280',
  BORDER: '#E5E7EB',
  BORDER_LIGHT: '#F1F5F9',
  SUCCESS: '#10B981',
  WARNING: '#F59E0B',
  ERROR: '#EF4444',
  ACCENT_BLUE: '#3B82F6',
  ACCENT_PURPLE: '#8B5CF6',
  ACCENT_ORANGE: '#F59E0B',
  SHADOW: 'rgba(0, 0, 0, 0.1)',
  SHADOW_LIGHT: 'rgba(0, 0, 0, 0.05)',
};

export default function MemberAnalytics({ route, navigation }) {
  const { memberId, memberName, groupId } = route.params;
  const [isLoading, setIsLoading] = useState(true);
  const [memberData, setMemberData] = useState(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Sample data for demonstration
  const sampleMemberData = {
    profile: {
      name: memberName || 'John Doe',
      joinedAt: '2024-01-15',
      status: 'active',
      totalDetections: 45,
      riskLevel: 'Medium',
    },
    detectionStats: {
      thisWeek: 12,
      thisMonth: 45,
      totalDetections: 156,
      averagePerDay: 2.3,
    },

    detectionTrends: {
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      datasets: [{
        data: [3, 7, 2, 8, 5, 1, 4],
        color: (opacity = 1) => `rgba(2, 185, 127, ${opacity})`,
        strokeWidth: 2,
      }],
    },

  };

  useEffect(() => {
    loadMemberData();
  }, []);

  const loadMemberData = async () => {
    try {
      setIsLoading(true);

      // Fetch real member analytics data
      const [detectionStats, activityStats] = await Promise.all([
        fetch(`https://murai-server.onrender.com/api/user-dashboard/overview?userId=${memberId}&timeRange=month`).then(res => res.json()).catch(() => null),
        fetch(`https://murai-server.onrender.com/api/user-dashboard/user-activity?userId=${memberId}&timeRange=week`).then(res => res.json()).catch(() => null)
      ]);

      // Process and format the real data
      const realMemberData = {
        profile: {
          name: memberName || 'Member',
          joinedAt: new Date().toISOString().split('T')[0],
          status: 'active',
          totalDetections: detectionStats?.totalDetections || 0,
          riskLevel: detectionStats?.totalDetections > 50 ? 'High' : detectionStats?.totalDetections > 20 ? 'Medium' : 'Low',
        },
        detectionStats: {
          thisWeek: detectionStats?.weeklyDetections || 0,
          thisMonth: detectionStats?.monthlyDetections || 0,
          totalDetections: detectionStats?.totalDetections || 0,
          averagePerDay: detectionStats?.averagePerDay || 0,
        },

        detectionTrends: {
          labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
          datasets: [{
            data: activityStats?.dailyActivity?.slice(-7).map(day => day.count) || [0, 0, 0, 0, 0, 0, 0],
            color: (opacity = 1) => `rgba(2, 185, 127, ${opacity})`,
            strokeWidth: 2,
          }],
        },

      };

      setMemberData(realMemberData);

      // Animate content in
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
    } catch (error) {
      console.error('Error loading member data:', error);
      // Fallback to sample data if API fails
      setMemberData(sampleMemberData);

      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
    } finally {
      setIsLoading(false);
    }
  };

  const chartConfig = {
    backgroundColor: COLORS.BACKGROUND,
    backgroundGradientFrom: COLORS.BACKGROUND,
    backgroundGradientTo: COLORS.BACKGROUND,
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(2, 185, 127, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(31, 41, 55, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '4',
      strokeWidth: '2',
      stroke: COLORS.PRIMARY,
    },
    propsForBackgroundLines: {
      strokeDasharray: '',
      stroke: COLORS.BORDER_LIGHT,
    },
  };

  const renderStatCard = (title, value, subtitle, icon, color = COLORS.PRIMARY) => (
    <View style={styles.statCard}>
      <View style={[styles.statIcon, { backgroundColor: `${color}20` }]}>
        <MaterialCommunityIcons name={icon} size={24} color={color} />
      </View>
      <View style={styles.statContent}>
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.statTitle}>{title}</Text>
        {subtitle && <Text style={styles.statSubtitle}>{subtitle}</Text>}
      </View>
    </View>
  );

  if (isLoading) {
    return (
      <View style={styles.container}>
        <MainHeader 
          title="Member Analytics"
          showBackButton={true}
          onBackPress={() => navigation.goBack()}
        />
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <MaterialCommunityIcons name="arrow-left" size={24} color={COLORS.TEXT_MAIN} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Member Analytics</Text>
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.PRIMARY} />
          <Text style={styles.loadingText}>Loading member analytics...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <MaterialCommunityIcons name="arrow-left" size={24} color={COLORS.TEXT_MAIN} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Member Analytics</Text>
        <View style={styles.headerSpacer} />
      </View>
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Animated.View style={{ opacity: fadeAnim }}>
          {/* Member Profile Header */}
          <View style={styles.profileHeader}>
            <View style={styles.profileAvatar}>
              <Text style={styles.profileInitial}>
                {memberData?.profile?.name?.charAt(0).toUpperCase() || 'M'}
              </Text>
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{memberData?.profile?.name}</Text>
              <Text style={styles.profileJoined}>
                Joined {new Date(memberData?.profile?.joinedAt).toLocaleDateString()}
              </Text>
              <View style={styles.riskBadge}>
                <Text style={styles.riskText}>Risk Level: {memberData?.profile?.riskLevel}</Text>
              </View>
            </View>
          </View>

          {/* Detection Statistics */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Detection Overview</Text>
            <View style={styles.statsGrid}>
              {renderStatCard(
                'This Week',
                memberData?.detectionStats?.thisWeek,
                'detections',
                'calendar-week',
                COLORS.SUCCESS
              )}
              {renderStatCard(
                'This Month',
                memberData?.detectionStats?.thisMonth,
                'detections',
                'calendar-month',
                COLORS.ACCENT_BLUE
              )}
              {renderStatCard(
                'Total',
                memberData?.detectionStats?.totalDetections,
                'all time',
                'chart-line',
                COLORS.ACCENT_PURPLE
              )}
              {renderStatCard(
                'Daily Average',
                memberData?.detectionStats?.averagePerDay,
                'per day',
                'trending-up',
                COLORS.ACCENT_ORANGE
              )}
            </View>
          </View>

          {/* Weekly Detection Trends */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Weekly Detection Trends</Text>
            <View style={styles.chartCard}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <BarChart
                  data={memberData?.detectionTrends}
                  width={Math.max(width - 40, 400)}
                  height={200}
                  chartConfig={chartConfig}
                  style={styles.chart}
                  showValuesOnTopOfBars={true}
                  fromZero={true}
                />
              </ScrollView>
            </View>
          </View>






        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
    backgroundColor: COLORS.BACKGROUND,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.SECTION_BG,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'Poppins-SemiBold',
    color: COLORS.TEXT_MAIN,
    flex: 1,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontFamily: 'Poppins-Medium',
    color: COLORS.TEXT_SECONDARY,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.CARD_BG,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: COLORS.SHADOW,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  profileAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.PRIMARY,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  profileInitial: {
    fontSize: 24,
    fontFamily: 'Poppins-Bold',
    color: '#ffffff',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 20,
    fontFamily: 'Poppins-SemiBold',
    color: COLORS.TEXT_MAIN,
    marginBottom: 4,
  },
  profileJoined: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: COLORS.TEXT_SECONDARY,
    marginBottom: 8,
  },
  riskBadge: {
    backgroundColor: COLORS.WARNING + '20',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  riskText: {
    fontSize: 12,
    fontFamily: 'Poppins-Medium',
    color: COLORS.WARNING,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Poppins-SemiBold',
    color: COLORS.TEXT_MAIN,
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  statCard: {
    backgroundColor: COLORS.CARD_BG,
    borderRadius: 12,
    padding: 16,
    width: (width - 52) / 2,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: COLORS.SHADOW,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  statContent: {
    flex: 1,
  },
  statValue: {
    fontSize: 18,
    fontFamily: 'Poppins-Bold',
    color: COLORS.TEXT_MAIN,
  },
  statTitle: {
    fontSize: 12,
    fontFamily: 'Poppins-Medium',
    color: COLORS.TEXT_SECONDARY,
  },
  statSubtitle: {
    fontSize: 10,
    fontFamily: 'Poppins-Regular',
    color: COLORS.TEXT_MUTED,
  },
  chartCard: {
    backgroundColor: COLORS.CARD_BG,
    borderRadius: 16,
    padding: 16,
    shadowColor: COLORS.SHADOW,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  chart: {
    borderRadius: 16,
  },

});
