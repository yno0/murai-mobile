import { Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Picker } from '@react-native-picker/picker';
import { useNavigation } from '@react-navigation/native';
import { useCallback, useEffect, useState } from 'react';
import {
    Alert,
    FlatList,
    Platform,
    RefreshControl,
    StyleSheet,
    Text,
    View
} from 'react-native';

// API configuration
const API_BASE_URL = 'https://murai-server.onrender.com/api';

const MainHeader = require('../../../components/common/MainHeader').default;

export default function SystemLogsScreen() {
  const navigation = useNavigation();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // Helper function to get auth token
  const getAuthToken = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      return token;
    } catch (error) {
      console.error('Error getting auth token:', error);
      return null;
    }
  };

  // Helper function to make authenticated API calls
  const makeAuthenticatedRequest = useCallback(async (url, options = {}) => {
    const token = await getAuthToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${API_BASE_URL}${url}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }, []);

  // Mock system logs data
  const mockLogs = [
    {
      id: '1',
      timestamp: new Date('2024-01-22T10:30:00'),
      action: 'User Login',
      user: 'admin@murai.com',
      details: 'Successful admin login from IP 192.168.1.100',
      level: 'info',
      category: 'authentication'
    },
    {
      id: '2',
      timestamp: new Date('2024-01-22T10:25:00'),
      action: 'System Configuration',
      user: 'admin@murai.com',
      details: 'Updated detection sensitivity settings',
      level: 'warning',
      category: 'configuration'
    },
    {
      id: '3',
      timestamp: new Date('2024-01-22T10:20:00'),
      action: 'Data Export',
      user: 'admin@murai.com',
      details: 'Exported user reports for January 2024',
      level: 'info',
      category: 'data'
    },
    {
      id: '4',
      timestamp: new Date('2024-01-22T10:15:00'),
      action: 'User Management',
      user: 'admin@murai.com',
      details: 'Created new user account: user123@example.com',
      level: 'info',
      category: 'user_management'
    },
    {
      id: '5',
      timestamp: new Date('2024-01-22T10:10:00'),
      action: 'System Error',
      user: 'system',
      details: 'Failed to connect to external API endpoint',
      level: 'error',
      category: 'system'
    },
    {
      id: '6',
      timestamp: new Date('2024-01-22T10:05:00'),
      action: 'Database Backup',
      user: 'system',
      details: 'Automated daily backup completed successfully',
      level: 'info',
      category: 'maintenance'
    },
  ];

  const loadLogs = useCallback(async (refresh = false) => {
    if (refresh) {
      setPage(1);
      setHasMore(true);
    }

    setLoading(true);
    try {
      console.log('🔄 Loading admin activity logs...');
      const currentPage = refresh ? 1 : page;

      const data = await makeAuthenticatedRequest(`/admin/profile/activity?page=${currentPage}&limit=20`);
      console.log('✅ Activity logs loaded:', data);

      // Transform API data to match our log format
      const transformedLogs = data.activities.map(activity => ({
        id: activity._id,
        timestamp: new Date(activity.timestamp),
        action: activity.action,
        user: activity.adminId?.email || activity.adminId?.name || 'System',
        details: activity.details || 'No details available',
        level: activity.status === 'failed' ? 'error' : 'info',
        category: activity.activityType || 'system'
      }));

      if (refresh) {
        setLogs(transformedLogs);
      } else {
        setLogs(prev => [...prev, ...transformedLogs]);
      }

      setHasMore(data.pagination.hasNextPage);
      setPage(currentPage + 1);

    } catch (error) {
      console.error('❌ Load logs error:', error);
      Alert.alert('Error', error.message || 'Failed to load system logs');

      // Fallback to mock data on error
      if (logs.length === 0) {
        setLogs(mockLogs);
      }
    } finally {
      setLoading(false);
    }
  }, [makeAuthenticatedRequest, page, logs.length]);

  useEffect(() => {
    loadLogs(true);
  }, []);

  const handleRefresh = () => {
    loadLogs(true);
  };

  const getFilteredLogs = () => {
    if (selectedFilter === 'all') return logs;
    return logs.filter(log => log.level === selectedFilter);
  };

  const getLevelColor = (level) => {
    switch (level) {
      case 'error': return '#EF4444';
      case 'warning': return '#F59E0B';
      case 'info': return '#01B97F';
      default: return '#6B7280';
    }
  };

  const getLevelIcon = (level) => {
    switch (level) {
      case 'error': return 'alert-circle';
      case 'warning': return 'alert-triangle';
      case 'info': return 'info';
      default: return 'circle';
    }
  };

  const formatTimestamp = (timestamp) => {
    return timestamp.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const renderLogItem = ({ item }) => (
    <View style={styles.logItem}>
      <View style={styles.logHeader}>
        <View style={styles.logLeft}>
          <View style={[styles.levelIndicator, { backgroundColor: getLevelColor(item.level) }]}>
            <Feather name={getLevelIcon(item.level)} size={12} color="#FFFFFF" />
          </View>
          <View style={styles.logInfo}>
            <Text style={styles.logAction}>{item.action}</Text>
            <Text style={styles.logUser}>{item.user}</Text>
          </View>
        </View>
        <Text style={styles.logTimestamp}>{formatTimestamp(item.timestamp)}</Text>
      </View>
      <Text style={styles.logDetails}>{item.details}</Text>
      <View style={styles.logFooter}>
        <Text style={styles.logCategory}>{item.category.replace('_', ' ')}</Text>
        <Text style={[styles.logLevel, { color: getLevelColor(item.level) }]}>
          {item.level.toUpperCase()}
        </Text>
      </View>
    </View>
  );

  const filterOptions = [
    { key: 'all', label: 'All Logs', count: logs.length },
    { key: 'error', label: 'Errors', count: logs.filter(l => l.level === 'error').length },
    { key: 'warning', label: 'Warnings', count: logs.filter(l => l.level === 'warning').length },
    { key: 'info', label: 'Info', count: logs.filter(l => l.level === 'info').length },
  ];

  return (
    <View style={styles.container}>
      <MainHeader
        title="System Logs"
        subtitle="Monitor system activities and events"
        leftActions={[
          {
            icon: 'arrow-left',
            iconType: 'feather',
            onPress: () => navigation.goBack()
          }
        ]}
        rightActions={[
          {
            icon: loading ? 'loader' : 'refresh-cw',
            iconType: 'feather',
            onPress: loading ? undefined : handleRefresh,
            disabled: loading
          }
        ]}
        style={{ paddingHorizontal: 0 }}
      />

      {/* Filter Dropdown */}
      <View style={styles.dropdownContainer}>
        <Text style={{ fontFamily: 'Poppins-SemiBold', fontSize: 15, color: '#6B7280', marginBottom: 8, marginLeft: 4 }}>
          Filter Logs By Type
        </Text>
        <Picker
          selectedValue={selectedFilter}
          onValueChange={(itemValue) => setSelectedFilter(itemValue)}
          style={styles.picker}
          itemStyle={styles.pickerItem}
          mode="dropdown"
        >
          {filterOptions.map(option => (
            <Picker.Item
              key={option.key}
              label={`${option.label} (${option.count})`}
              value={option.key}
              color={selectedFilter === option.key ? '#01B97F' : '#6B7280'}
            />
          ))}
        </Picker>
      </View>

      {/* Logs List */}
      <FlatList
        data={getFilteredLogs()}
        renderItem={renderLogItem}
        keyExtractor={(item) => item.id}
        style={styles.logsList}
        contentContainerStyle={styles.logsListContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={handleRefresh}
            colors={['#01B97F']}
            tintColor="#01B97F"
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Feather name="file-text" size={48} color="#9CA3AF" />
            <Text style={styles.emptyText}>No logs found</Text>
            <Text style={styles.emptySubtext}>
              {selectedFilter === 'all' 
                ? 'System logs will appear here when available'
                : `No ${selectedFilter} logs found`
              }
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    paddingHorizontal: 10,
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 10,
    marginTop: 18,
    marginBottom: 22,
    justifyContent: 'space-between',
    gap: 12,
  },
  filterTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    gap: 10,
    marginHorizontal: 4,
  },
  filterTabActive: {
    backgroundColor: '#e8f5f0',
    borderColor: '#01B97F',
  },
  filterTabText: {
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    color: '#6B7280',
  },
  filterTabTextActive: {
    color: '#01B97F',
  },
  filterBadge: {
    backgroundColor: '#e5e7eb',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    minWidth: 24,
    alignItems: 'center',
  },
  filterBadgeActive: {
    backgroundColor: '#01B97F',
  },
  filterBadgeText: {
    fontSize: 12,
    fontFamily: 'Poppins-SemiBold',
    color: '#6B7280',
  },
  filterBadgeTextActive: {
    color: '#FFFFFF',
  },
  logsList: {
    flex: 1,
  },
  logsListContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  logItem: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  logHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  logLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  levelIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logInfo: {
    flex: 1,
  },
  logAction: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    color: '#111827',
    marginBottom: 2,
  },
  logUser: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: '#6B7280',
  },
  logTimestamp: {
    fontSize: 12,
    fontFamily: 'Poppins-Medium',
    color: '#9CA3AF',
  },
  logDetails: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#374151',
    marginBottom: 12,
    lineHeight: 20,
  },
  logFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logCategory: {
    fontSize: 12,
    fontFamily: 'Poppins-Medium',
    color: '#6B7280',
    textTransform: 'capitalize',
  },
  logLevel: {
    fontSize: 12,
    fontFamily: 'Poppins-Bold',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontFamily: 'Poppins-SemiBold',
    color: '#6B7280',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#9CA3AF',
    textAlign: 'center',
  },
  dropdownContainer: {
    paddingHorizontal: 20,
    marginTop: 18,
    marginBottom: 22,
    backgroundColor: '#fff',
    borderRadius: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    paddingVertical: 16,
    marginHorizontal: 8,
  },
  picker: {
    backgroundColor: '#f8fafc',
    borderRadius: 10,
    color: '#111827',
    fontFamily: 'Poppins-Medium',
    fontSize: 16,
    borderWidth: 0,
    marginTop: 4,
    marginBottom: 2,
    minHeight: 48,
    paddingHorizontal: 12,
    ...Platform.select({
      android: {
        borderWidth: 0,
        backgroundColor: 'transparent',
        minHeight: 48,
      },
    }),
  },
  pickerItem: {
    fontFamily: 'Poppins-Medium',
    fontSize: 16,
  },
});
