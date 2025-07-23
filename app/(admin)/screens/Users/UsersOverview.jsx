import { Feather } from '@expo/vector-icons';
import { RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';

export default function UsersOverview({ users, loading, onRefresh }) {
  const getStats = () => {
    const total = users.length;
    const active = users.filter(u => u.status === 'Active').length;
    const inactive = users.filter(u => u.status === 'Inactive').length;
    const admins = users.filter(u => u.role === 'Admin').length;
    const regularUsers = users.filter(u => u.role === 'User').length;

    return { total, active, inactive, admins, regularUsers };
  };

  const stats = getStats();

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

  const getRoleDistribution = () => {
    const roles = {};
    users.forEach(user => {
      roles[user.role] = (roles[user.role] || 0) + 1;
    });
    return Object.entries(roles).map(([role, count]) => ({
      role,
      count,
      percentage: ((count / users.length) * 100).toFixed(1)
    }));
  };

  const roleDistribution = getRoleDistribution();

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
            <Feather name="user-check" size={20} color="#01B97F" />
            <Text style={styles.statValue}>{stats.active}</Text>
            <Text style={styles.statLabel}>Active</Text>
          </View>
          <View style={styles.statCard}>
            <Feather name="user-x" size={20} color="#EF4444" />
            <Text style={styles.statValue}>{stats.inactive}</Text>
            <Text style={styles.statLabel}>Inactive</Text>
          </View>
        </View>
      </View>

      {/* Role Distribution */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Feather name="shield" size={18} color="#01B97F" />
          <Text style={styles.sectionTitle}>Role Distribution</Text>
        </View>
        <View style={styles.card}>
          {roleDistribution.map((item, idx) => (
            <View key={idx} style={styles.roleItem}>
              <View style={styles.roleInfo}>
                <View style={styles.roleIcon}>
                  <Feather 
                    name={item.role === 'Admin' ? 'shield' : 'user'} 
                    size={16} 
                    color={item.role === 'Admin' ? '#01B97F' : '#6b7280'} 
                  />
                </View>
                <View style={styles.roleDetails}>
                  <Text style={styles.roleName}>{item.role}</Text>
                  <Text style={styles.roleCount}>{item.count} users</Text>
                </View>
              </View>
              <View style={[
                styles.percentageBadge,
                { backgroundColor: item.role === 'Admin' ? '#e8f5f0' : '#f3f4f6' }
              ]}>
                <Text style={[
                  styles.percentageText,
                  { color: item.role === 'Admin' ? '#01B97F' : '#6b7280' }
                ]}>
                  {item.percentage}%
                </Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* Activity Stats */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Feather name="activity" size={18} color="#01B97F" />
          <Text style={styles.sectionTitle}>User Activity</Text>
        </View>
        <View style={styles.card}>
          <View style={styles.activityItem}>
            <View style={styles.activityInfo}>
              <Feather name="calendar" size={16} color="#01B97F" />
              <View style={styles.activityDetails}>
                <Text style={styles.activityName}>Active This Week</Text>
                <Text style={styles.activityDesc}>Users active in last 7 days</Text>
              </View>
            </View>
            <Text style={styles.activityCount}>{activityStats.activeLastWeek}</Text>
          </View>
          <View style={styles.activityItem}>
            <View style={styles.activityInfo}>
              <Feather name="calendar" size={16} color="#F59E0B" />
              <View style={styles.activityDetails}>
                <Text style={styles.activityName}>Active This Month</Text>
                <Text style={styles.activityDesc}>Users active in last 30 days</Text>
              </View>
            </View>
            <Text style={styles.activityCount}>{activityStats.activeLastMonth}</Text>
          </View>
          <View style={styles.activityItem}>
            <View style={styles.activityInfo}>
              <Feather name="user-plus" size={16} color="#3B82F6" />
              <View style={styles.activityDetails}>
                <Text style={styles.activityName}>New This Month</Text>
                <Text style={styles.activityDesc}>Users joined in last 30 days</Text>
              </View>
            </View>
            <Text style={styles.activityCount}>{activityStats.newThisMonth}</Text>
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
