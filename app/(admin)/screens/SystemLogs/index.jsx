import { Feather } from "@expo/vector-icons";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import MainHeader from "../../../components/common/MainHeader";
import { useAuth } from "../../../context/AuthContext";

const API_BASE_URL = "http://localhost:3000/api";

export default function AdminSystemLogsScreen({ navigation }) {
  const { makeAuthenticatedRequest } = useAuth();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState("all"); // 'all', 'admin', 'user'
  const [selectedLevel, setSelectedLevel] = useState("all"); // 'all', 'success', 'failed', 'info'
  const [stats, setStats] = useState(null);

  const filterOptions = [
    { key: "all", label: "All Logs", color: "#6b7280" },
    { key: "admin", label: "Admin Actions", color: "#dc2626" },
    { key: "user", label: "User Activities", color: "#059669" },
  ];

  const levelOptions = [
    { key: "all", label: "All Levels", color: "#6b7280" },
    { key: "success", label: "Success", color: "#059669" },
    { key: "failed", label: "Failed", color: "#dc2626" },
    { key: "info", label: "Info", color: "#2563eb" },
  ];

  const loadLogs = useCallback(
    async (refresh = false) => {
      if (refresh) {
        setPage(1);
        setHasMore(true);
      }

      setLoading(true);
      try {
        console.log("🔄 Loading system logs...");
        const currentPage = refresh ? 1 : page;

        const params = new URLSearchParams({
          page: currentPage.toString(),
          limit: "20",
          type: selectedFilter,
          level: selectedLevel,
        });

        const data = await makeAuthenticatedRequest(
          `/admin/system-logs?${params}`
        );
        console.log("✅ System logs loaded:", data);

        if (refresh) {
          setLogs(data.logs);
        } else {
          setLogs((prev) => [...prev, ...data.logs]);
        }

        setStats(data.stats);
        setHasMore(data.pagination.hasNextPage);
        setPage(currentPage + 1);
      } catch (error) {
        console.error("❌ Load logs error:", error);
        Alert.alert("Error", error.message || "Failed to load system logs");
      } finally {
        setLoading(false);
      }
    },
    [makeAuthenticatedRequest, page, selectedFilter, selectedLevel]
  );

  useEffect(() => {
    loadLogs(true);
  }, [selectedFilter, selectedLevel]);

  const handleRefresh = () => {
    loadLogs(true);
  };

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      loadLogs(false);
    }
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((now - date) / (1000 * 60));
      return `${diffInMinutes}m ago`;
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else {
      return (
        date.toLocaleDateString() +
        " " +
        date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      );
    }
  };

  const getLevelColor = (level) => {
    switch (level) {
      case "success":
        return "#059669";
      case "failed":
        return "#dc2626";
      case "info":
        return "#2563eb";
      default:
        return "#6b7280";
    }
  };

  const getLevelIcon = (level) => {
    switch (level) {
      case "success":
        return "check-circle";
      case "failed":
        return "x-circle";
      case "info":
        return "info";
      default:
        return "circle";
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case "admin":
        return "#dc2626";
      case "user":
        return "#059669";
      default:
        return "#6b7280";
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case "admin":
        return "shield";
      case "user":
        return "user";
      default:
        return "activity";
    }
  };

  const renderLogItem = ({ item }) => (
    <View style={styles.logItem}>
      <View style={styles.logHeader}>
        <View style={styles.logLeft}>
          <View
            style={[
              styles.typeIndicator,
              { backgroundColor: getTypeColor(item.type) },
            ]}
          >
            <Feather name={getTypeIcon(item.type)} size={12} color="#FFFFFF" />
          </View>
          <View
            style={[
              styles.levelIndicator,
              { backgroundColor: getLevelColor(item.level) },
            ]}
          >
            <Feather
              name={getLevelIcon(item.level)}
              size={10}
              color="#FFFFFF"
            />
          </View>
          <View style={styles.logInfo}>
            <Text style={styles.logAction}>{item.action}</Text>
            <Text style={styles.logUser}>{item.user}</Text>
          </View>
        </View>
        <Text style={styles.logTimestamp}>
          {formatTimestamp(item.timestamp)}
        </Text>
      </View>
      <Text style={styles.logDetails}>{item.details}</Text>
      <View style={styles.logFooter}>
        <Text style={styles.logCategory}>
          {item.category?.replace("_", " ")}
        </Text>
        <Text style={[styles.logType, { color: getTypeColor(item.type) }]}>
          {item.type.toUpperCase()}
        </Text>
      </View>
    </View>
  );

  const renderStatsCard = (title, value, color) => (
    <View style={styles.statsCard}>
      <Text style={[styles.statsValue, { color }]}>{value}</Text>
      <Text style={styles.statsLabel}>{title}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <MainHeader
        title="System Logs"
        subtitle="Admin and user activity monitoring"
        leftAction={{
          icon: "arrow-left",
          onPress: () => navigation.goBack(),
        }}
      />

      {/* Stats Overview */}
      {stats && (
        <View style={styles.statsContainer}>
          {renderStatsCard("Total", stats.total, "#6b7280")}
          {renderStatsCard("Admin", stats.adminActions, "#dc2626")}
          {renderStatsCard("User", stats.userActivities, "#059669")}
          {renderStatsCard("Success", stats.successfulActions, "#059669")}
          {renderStatsCard("Failed", stats.failedActions, "#dc2626")}
        </View>
      )}

      {/* Filter Buttons */}
      <View style={styles.filtersContainer}>
        <Text style={styles.filterTitle}>Type:</Text>
        <View style={styles.filterRow}>
          {filterOptions.map((option) => (
            <TouchableOpacity
              key={option.key}
              style={[
                styles.filterButton,
                selectedFilter === option.key && {
                  backgroundColor: option.color,
                },
              ]}
              onPress={() => setSelectedFilter(option.key)}
            >
              <Text
                style={[
                  styles.filterText,
                  selectedFilter === option.key && styles.filterTextActive,
                ]}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.filterTitle}>Level:</Text>
        <View style={styles.filterRow}>
          {levelOptions.map((option) => (
            <TouchableOpacity
              key={option.key}
              style={[
                styles.filterButton,
                selectedLevel === option.key && {
                  backgroundColor: option.color,
                },
              ]}
              onPress={() => setSelectedLevel(option.key)}
            >
              <Text
                style={[
                  styles.filterText,
                  selectedLevel === option.key && styles.filterTextActive,
                ]}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Logs List */}
      <FlatList
        data={logs}
        renderItem={renderLogItem}
        keyExtractor={(item) => item.id}
        style={styles.logsList}
        contentContainerStyle={styles.logsListContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={loading && page === 1}
            onRefresh={handleRefresh}
            colors={["#01B97F"]}
            tintColor="#01B97F"
          />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.1}
        ListFooterComponent={
          loading && page > 1 ? (
            <View style={styles.loadingFooter}>
              <ActivityIndicator size="small" color="#01B97F" />
              <Text style={styles.loadingText}>Loading more logs...</Text>
            </View>
          ) : null
        }
        ListEmptyComponent={
          !loading ? (
            <View style={styles.emptyContainer}>
              <Feather name="file-text" size={48} color="#9CA3AF" />
              <Text style={styles.emptyText}>No logs found</Text>
              <Text style={styles.emptySubtext}>
                System logs will appear here when available
              </Text>
            </View>
          ) : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
    paddingHorizontal: 16,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
    paddingHorizontal: 4,
  },
  statsCard: {
    flex: 1,
    backgroundColor: "#f9fafb",
    borderRadius: 8,
    padding: 12,
    marginHorizontal: 2,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#f3f4f6",
  },
  statsValue: {
    fontSize: 18,
    fontFamily: "Poppins-Bold",
    marginBottom: 2,
  },
  statsLabel: {
    fontSize: 10,
    fontFamily: "Poppins-Medium",
    color: "#6b7280",
    textTransform: "uppercase",
  },
  filtersContainer: {
    marginBottom: 20,
  },
  filterTitle: {
    fontSize: 14,
    fontFamily: "Poppins-SemiBold",
    color: "#374151",
    marginBottom: 8,
    marginTop: 12,
  },
  filterRow: {
    flexDirection: "row",
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: "#f3f4f6",
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  filterText: {
    fontSize: 12,
    fontFamily: "Poppins-Medium",
    color: "#6b7280",
  },
  filterTextActive: {
    color: "#ffffff",
  },
  logsList: {
    flex: 1,
  },
  logsListContent: {
    paddingBottom: 20,
  },
  logItem: {
    backgroundColor: "#ffffff",
    borderRadius: 8,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#f3f4f6",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  logHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  logLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  typeIndicator: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 6,
  },
  levelIndicator: {
    width: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  logInfo: {
    flex: 1,
  },
  logAction: {
    fontSize: 14,
    fontFamily: "Poppins-SemiBold",
    color: "#111827",
    marginBottom: 2,
  },
  logUser: {
    fontSize: 12,
    fontFamily: "Poppins-Regular",
    color: "#6b7280",
  },
  logTimestamp: {
    fontSize: 11,
    fontFamily: "Poppins-Medium",
    color: "#9ca3af",
  },
  logDetails: {
    fontSize: 13,
    fontFamily: "Poppins-Regular",
    color: "#4b5563",
    lineHeight: 18,
    marginBottom: 8,
  },
  logFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  logCategory: {
    fontSize: 11,
    fontFamily: "Poppins-Medium",
    color: "#9ca3af",
    textTransform: "capitalize",
  },
  logType: {
    fontSize: 10,
    fontFamily: "Poppins-Bold",
    letterSpacing: 0.5,
  },
  loadingFooter: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 16,
  },
  loadingText: {
    fontSize: 12,
    fontFamily: "Poppins-Medium",
    color: "#6b7280",
    marginLeft: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    fontFamily: "Poppins-SemiBold",
    color: "#374151",
    marginTop: 16,
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    color: "#6b7280",
    textAlign: "center",
  },
});
