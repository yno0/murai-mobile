import { Feather } from "@expo/vector-icons";
import { useState } from "react";
import {
  Dimensions,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { BarChart } from "react-native-chart-kit";

const { width } = Dimensions.get("window");

export default function ReportsOverview({
  reports,
  loading,
  onRefresh,
  overviewStats,
}) {
  const [currentDetectionPage, setCurrentDetectionPage] = useState(1);
  const DETECTION_ITEMS_PER_PAGE = 5;

  // Mock recently detected words data
  const recentlyDetectedWords = [
    {
      id: 1,
      word: "inappropriate",
      site: "example.com",
      time: "2 min ago",
      severity: "high",
      language: "EN",
    },
    {
      id: 2,
      word: "spam content",
      site: "test.org",
      time: "5 min ago",
      severity: "medium",
      language: "EN",
    },
    {
      id: 3,
      word: "toxic behavior",
      site: "demo.net",
      time: "8 min ago",
      severity: "high",
      language: "EN",
    },
    {
      id: 4,
      word: "harassment",
      site: "sample.com",
      time: "12 min ago",
      severity: "high",
      language: "EN",
    },
    {
      id: 5,
      word: "offensive language",
      site: "website.org",
      time: "15 min ago",
      severity: "medium",
      language: "EN",
    },
    {
      id: 6,
      word: "hate speech",
      site: "portal.com",
      time: "18 min ago",
      severity: "high",
      language: "EN",
    },
    {
      id: 7,
      word: "bullying",
      site: "forum.net",
      time: "22 min ago",
      severity: "medium",
      language: "EN",
    },
    {
      id: 8,
      word: "profanity",
      site: "blog.org",
      time: "25 min ago",
      severity: "low",
      language: "EN",
    },
  ];
  const getStats = () => {
    // Use overviewStats if available (from API), otherwise calculate from reports array
    if (overviewStats !== null) {
      console.log("🎯 Using overview stats from API:", overviewStats);
      return {
        total: overviewStats.total,
        pending: overviewStats.pending,
        resolved: overviewStats.resolved,
        rejected: overviewStats.rejected,
        falsePositives: overviewStats.falsePositives,
        falseNegatives: overviewStats.falseNegatives,
        resolutionRate: overviewStats.resolutionRate,
      };
    }

    // Fallback to calculating from reports array (for backward compatibility)
    console.log(
      "⚠️ Falling back to local calculation from reports array:",
      reports.length,
      "reports"
    );
    const total = reports.length;
    const pending = reports.filter((r) => r.status === "pending").length;
    const resolved = reports.filter((r) => r.status === "resolved").length;
    const rejected = reports.filter((r) => r.status === "rejected").length;
    const falsePositives = reports.filter(
      (r) => r.reportType === "false_positive"
    ).length;
    const falseNegatives = reports.filter(
      (r) => r.reportType === "false_negative"
    ).length;
    const resolutionRate =
      total > 0 ? (((resolved + rejected) / total) * 100).toFixed(1) : 0;

    return {
      total,
      pending,
      resolved,
      rejected,
      falsePositives,
      falseNegatives,
      resolutionRate,
    };
  };

  const stats = getStats();

  const getCategoryStats = () => {
    // Use overviewStats if available (from API), otherwise calculate from reports array
    if (overviewStats !== null && overviewStats.categoryStats) {
      return overviewStats.categoryStats;
    }

    // Fallback to calculating from reports array (for backward compatibility)
    const categories = {};
    reports.forEach((report) => {
      categories[report.category] = (categories[report.category] || 0) + 1;
    });
    return Object.entries(categories).map(([category, count]) => ({
      category,
      count,
      percentage:
        reports.length > 0 ? ((count / reports.length) * 100).toFixed(1) : 0,
    }));
  };

  const categoryStats = getCategoryStats();

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
          <Feather name="bar-chart-2" size={18} color="#01B97F" />
          <Text style={styles.sectionTitle}>Overview</Text>
        </View>
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Feather name="file-text" size={20} color="#01B97F" />
            <Text style={styles.statValue}>{stats.total}</Text>
            <Text style={styles.statLabel}>Total Reports</Text>
          </View>
          <View style={styles.statCard}>
            <Feather name="clock" size={20} color="#F59E0B" />
            <Text style={styles.statValue}>{stats.pending}</Text>
            <Text style={styles.statLabel}>Pending</Text>
          </View>
        </View>
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Feather name="check" size={20} color="#01B97F" />
            <Text style={styles.statValue}>{stats.resolved}</Text>
            <Text style={styles.statLabel}>Resolved</Text>
          </View>
          <View style={styles.statCard}>
            <Feather name="x-circle" size={20} color="#EF4444" />
            <Text style={styles.statValue}>{stats.rejected}</Text>
            <Text style={styles.statLabel}>Rejected</Text>
          </View>
        </View>
      </View>

      {/* Report Types */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Feather name="pie-chart" size={18} color="#01B97F" />
          <Text style={styles.sectionTitle}>Report Types</Text>
        </View>
        <View style={styles.card}>
          <View style={styles.reportTypeItem}>
            <View style={styles.reportTypeLeft}>
              <Feather name="alert-triangle" size={16} color="#EF4444" />
              <View style={styles.reportTypeInfo}>
                <Text style={styles.reportTypeName}>False Positives</Text>
                <Text style={styles.reportTypeDesc}>
                  Incorrectly flagged content
                </Text>
              </View>
            </View>
            <Text style={styles.reportTypeCount}>{stats.falsePositives}</Text>
          </View>
          <View style={styles.reportTypeItem}>
            <View style={styles.reportTypeLeft}>
              <Feather name="alert-circle" size={16} color="#F59E0B" />
              <View style={styles.reportTypeInfo}>
                <Text style={styles.reportTypeName}>False Negatives</Text>
                <Text style={styles.reportTypeDesc}>
                  Missed harmful content
                </Text>
              </View>
            </View>
            <Text style={styles.reportTypeCount}>{stats.falseNegatives}</Text>
          </View>
        </View>
      </View>

      {/* Category Breakdown */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Feather name="tag" size={18} color="#01B97F" />
          <Text style={styles.sectionTitle}>Category Breakdown</Text>
        </View>
        <View style={styles.card}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <BarChart
              data={{
                labels: categoryStats.map((item) => item.category),
                datasets: [
                  {
                    data: categoryStats.map((item) => item.count),
                  },
                ],
              }}
              width={Math.max(categoryStats.length * 80, width - 60)}
              height={220}
              fromZero
              showBarTops
              showValuesOnTopOfBars
              chartConfig={{
                backgroundGradientFrom: "#fff",
                backgroundGradientTo: "#fff",
                decimalPlaces: 0,
                color: (opacity = 1) => `rgba(1, 185, 127, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(29, 29, 31, ${opacity})`,
                style: { borderRadius: 16 },
                propsForBackgroundLines: {
                  stroke: "#f3f4f6",
                },
                propsForLabels: {
                  fontFamily: "Poppins-Medium",
                },
              }}
              style={{ borderRadius: 16 }}
            />
          </ScrollView>
        </View>
      </View>

      {/* Activity Overview */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Feather name="activity" size={18} color="#01B97F" />
          <Text style={styles.sectionTitle}>Activity Overview</Text>
        </View>
        <View style={styles.activityContainer}>
          <View style={styles.activityGrid}>
            {[
              {
                label: "Reports Today",
                value: "12",
                change: "+3",
                trend: "up",
                icon: "file-text",
              },
              {
                label: "Avg Response Time",
                value: "2.4h",
                change: "-0.5h",
                trend: "down",
                icon: "clock",
              },
              {
                label: "Resolution Rate",
                value: "94%",
                change: "+2%",
                trend: "up",
                icon: "check-circle",
              },
              {
                label: "Active Reviewers",
                value: "8",
                change: "+1",
                trend: "up",
                icon: "users",
              },
            ].map((item, idx) => (
              <View key={idx} style={styles.activityCard}>
                <View style={styles.activityIcon}>
                  <Feather name={item.icon} size={16} color="#01B97F" />
                </View>
                <View style={styles.activityContent}>
                  <Text style={styles.activityLabel}>{item.label}</Text>
                  <View style={styles.activityValueRow}>
                    <Text style={styles.activityValue}>{item.value}</Text>
                    <View
                      style={[
                        styles.activityChange,
                        {
                          backgroundColor:
                            item.trend === "up" ? "#e8f5f0" : "#fef3c7",
                        },
                      ]}
                    >
                      <Feather
                        name={
                          item.trend === "up" ? "trending-up" : "trending-down"
                        }
                        size={10}
                        color={item.trend === "up" ? "#01B97F" : "#f59e0b"}
                      />
                      <Text
                        style={[
                          styles.activityChangeText,
                          {
                            color: item.trend === "up" ? "#01B97F" : "#f59e0b",
                          },
                        ]}
                      >
                        {item.change}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            ))}
          </View>
        </View>
      </View>

      {/* Detection - Recently Detected Words */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Feather name="shield-alert" size={18} color="#01B97F" />
          <Text style={styles.sectionTitle}>Recently Detected Words</Text>
        </View>
        <View style={styles.detectionContainer}>
          {/* Table Header */}
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderText, { flex: 2 }]}>
              Word/Phrase
            </Text>
            <Text style={[styles.tableHeaderText, { flex: 1.5 }]}>Site</Text>
            <Text style={[styles.tableHeaderText, { flex: 1 }]}>Time</Text>
            <Text style={[styles.tableHeaderText, { flex: 1 }]}>Severity</Text>
          </View>

          {/* Table Rows */}
          {recentlyDetectedWords
            .slice(
              (currentDetectionPage - 1) * DETECTION_ITEMS_PER_PAGE,
              currentDetectionPage * DETECTION_ITEMS_PER_PAGE
            )
            .map((item) => (
              <View key={item.id} style={styles.tableRow}>
                <Text style={[styles.tableCell, { flex: 2 }]} numberOfLines={1}>
                  {item.word}
                </Text>
                <Text
                  style={[styles.tableCell, { flex: 1.5 }]}
                  numberOfLines={1}
                >
                  {item.site}
                </Text>
                <Text style={[styles.tableCell, { flex: 1 }]} numberOfLines={1}>
                  {item.time}
                </Text>
                <View style={[styles.tableCell, { flex: 1 }]}>
                  <View
                    style={[
                      styles.severityBadge,
                      { backgroundColor: getSeverityColor(item.severity) },
                    ]}
                  >
                    <Text
                      style={[
                        styles.severityText,
                        { color: getSeverityTextColor(item.severity) },
                      ]}
                    >
                      {item.severity}
                    </Text>
                  </View>
                </View>
              </View>
            ))}

          {/* Pagination */}
          {Math.ceil(recentlyDetectedWords.length / DETECTION_ITEMS_PER_PAGE) >
            1 && (
            <View style={styles.detectionPagination}>
              <Text style={styles.paginationInfo}>
                Page {currentDetectionPage} of{" "}
                {Math.ceil(
                  recentlyDetectedWords.length / DETECTION_ITEMS_PER_PAGE
                )}
              </Text>
              <View style={styles.paginationButtons}>
                <TouchableOpacity
                  style={[
                    styles.paginationButton,
                    currentDetectionPage === 1 &&
                      styles.paginationButtonDisabled,
                  ]}
                  onPress={() =>
                    setCurrentDetectionPage((prev) => Math.max(1, prev - 1))
                  }
                  disabled={currentDetectionPage === 1}
                >
                  <Feather
                    name="chevron-left"
                    size={16}
                    color={currentDetectionPage === 1 ? "#9ca3af" : "#01B97F"}
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.paginationButton,
                    currentDetectionPage ===
                      Math.ceil(
                        recentlyDetectedWords.length / DETECTION_ITEMS_PER_PAGE
                      ) && styles.paginationButtonDisabled,
                  ]}
                  onPress={() =>
                    setCurrentDetectionPage((prev) =>
                      Math.min(
                        Math.ceil(
                          recentlyDetectedWords.length /
                            DETECTION_ITEMS_PER_PAGE
                        ),
                        prev + 1
                      )
                    )
                  }
                  disabled={
                    currentDetectionPage ===
                    Math.ceil(
                      recentlyDetectedWords.length / DETECTION_ITEMS_PER_PAGE
                    )
                  }
                >
                  <Feather
                    name="chevron-right"
                    size={16}
                    color={
                      currentDetectionPage ===
                      Math.ceil(
                        recentlyDetectedWords.length / DETECTION_ITEMS_PER_PAGE
                      )
                        ? "#9ca3af"
                        : "#01B97F"
                    }
                  />
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </View>

      {/* System Logs */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Feather name="activity" size={18} color="#01B97F" />
          <Text style={styles.sectionTitle}>System Logs</Text>
        </View>
        <View style={styles.logsContainer}>
          {[
            {
              type: "info",
              message: "Report processing completed",
              time: "2 min ago",
              icon: "info",
            },
            {
              type: "warning",
              message: "High volume of reports detected",
              time: "15 min ago",
              icon: "alert-triangle",
            },
            {
              type: "success",
              message: "Automated review completed",
              time: "1 hour ago",
              icon: "check-circle",
            },
            {
              type: "error",
              message: "Failed to process report #1234",
              time: "2 hours ago",
              icon: "alert-circle",
            },
          ].map((log, idx) => (
            <View key={idx} style={styles.logCard}>
              <View
                style={[
                  styles.logIcon,
                  { backgroundColor: getLogColor(log.type) },
                ]}
              >
                <Feather
                  name={log.icon}
                  size={14}
                  color={getLogIconColor(log.type)}
                />
              </View>
              <View style={styles.logContent}>
                <Text style={styles.logMessage}>{log.message}</Text>
                <Text style={styles.logTime}>{log.time}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* Bottom spacing */}
      <View style={styles.bottomSpacing} />
    </ScrollView>
  );
}

const getLogColor = (type) => {
  switch (type) {
    case "info":
      return "#e0f2fe";
    case "warning":
      return "#fef3c7";
    case "success":
      return "#e8f5f0";
    case "error":
      return "#fef2f2";
    default:
      return "#f3f4f6";
  }
};

const getLogIconColor = (type) => {
  switch (type) {
    case "info":
      return "#0284c7";
    case "warning":
      return "#f59e0b";
    case "success":
      return "#01B97F";
    case "error":
      return "#ef4444";
    default:
      return "#6b7280";
  }
};

const getSeverityColor = (severity) => {
  switch (severity) {
    case "high":
      return "#fef2f2";
    case "medium":
      return "#fef3c7";
    case "low":
      return "#f0fdf4";
    default:
      return "#f3f4f6";
  }
};

const getSeverityTextColor = (severity) => {
  switch (severity) {
    case "high":
      return "#ef4444";
    case "medium":
      return "#f59e0b";
    case "low":
      return "#10b981";
    default:
      return "#6b7280";
  }
};

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
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: "Poppins-SemiBold",
    color: "#111827",
  },
  statsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#f3f4f6",
  },
  statValue: {
    fontSize: 24,
    fontFamily: "Poppins-Bold",
    color: "#111827",
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: "Poppins-Medium",
    color: "#9ca3af",
    textAlign: "center",
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: "#f3f4f6",
  },
  reportTypeItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f8fafc",
  },
  reportTypeLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  reportTypeInfo: {
    marginLeft: 12,
    flex: 1,
  },
  reportTypeName: {
    fontSize: 14,
    fontFamily: "Poppins-Medium",
    color: "#111827",
  },
  reportTypeDesc: {
    fontSize: 12,
    fontFamily: "Poppins-Regular",
    color: "#6b7280",
    marginTop: 2,
  },
  reportTypeCount: {
    fontSize: 16,
    fontFamily: "Poppins-Bold",
    color: "#111827",
  },
  categoryItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f8fafc",
  },
  categoryInfo: {
    flex: 1,
  },
  categoryName: {
    fontSize: 14,
    fontFamily: "Poppins-Medium",
    color: "#111827",
  },
  categoryCount: {
    fontSize: 12,
    fontFamily: "Poppins-Regular",
    color: "#6b7280",
    marginTop: 2,
  },
  percentageBadge: {
    backgroundColor: "#e8f5f0",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  percentageText: {
    fontSize: 12,
    fontFamily: "Poppins-Medium",
    color: "#01B97F",
  },
  logsContainer: {
    gap: 8,
  },
  logCard: {
    backgroundColor: "#ffffff",
    borderRadius: 8,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#f3f4f6",
    gap: 12,
  },
  logIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  logContent: {
    flex: 1,
  },
  logMessage: {
    fontSize: 12,
    fontFamily: "Poppins-Medium",
    color: "#111827",
    lineHeight: 16,
  },
  logTime: {
    fontSize: 10,
    fontFamily: "Poppins-Regular",
    color: "#9ca3af",
    marginTop: 2,
  },
  activityContainer: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#f3f4f6",
    gap: 16,
  },
  activityGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 12,
  },
  activityCard: {
    flexBasis: "48%",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#f3f4f6",
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  activityItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  activityIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#e8f5f0",
    alignItems: "center",
    justifyContent: "center",
  },
  activityContent: {
    flex: 1,
  },
  activityLabel: {
    fontSize: 12,
    fontFamily: "Poppins-Regular",
    color: "#6b7280",
    marginBottom: 4,
  },
  activityValueRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  activityValue: {
    fontSize: 16,
    fontFamily: "Poppins-Bold",
    color: "#111827",
  },
  activityChange: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    gap: 2,
  },
  activityChangeText: {
    fontSize: 10,
    fontFamily: "Poppins-SemiBold",
  },
  detectionContainer: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#f3f4f6",
    overflow: "hidden",
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#f8fafc",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  tableHeaderText: {
    fontSize: 12,
    fontFamily: "Poppins-SemiBold",
    color: "#6b7280",
    textTransform: "uppercase",
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f8fafc",
    alignItems: "center",
  },
  tableCell: {
    fontSize: 12,
    fontFamily: "Poppins-Regular",
    color: "#374151",
  },
  severityBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    alignSelf: "flex-start",
  },
  severityText: {
    fontSize: 10,
    fontFamily: "Poppins-SemiBold",
    textTransform: "uppercase",
  },
  detectionPagination: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: "#f8fafc",
  },
  paginationInfo: {
    fontSize: 11,
    fontFamily: "Poppins-Regular",
    color: "#6b7280",
  },
  paginationButtons: {
    flexDirection: "row",
    gap: 8,
  },
  paginationButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    alignItems: "center",
    justifyContent: "center",
  },
  paginationButtonDisabled: {
    backgroundColor: "#f9fafb",
    borderColor: "#f3f4f6",
  },
  bottomSpacing: {
    height: 20,
  },
});
