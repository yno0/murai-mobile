import { Feather } from "@expo/vector-icons";
import { useCallback, useEffect, useState } from "react";
import {
    ActivityIndicator,
    Dimensions,
    Modal,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native";
import { LineChart } from "react-native-chart-kit";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import MainHeader from "../../../components/common/MainHeader";

const API_BASE_URL = "http://localhost:3000/api";

const dashboardService = {
  getOverview: async (timeRange) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/dashboard/overview?timeRange=${encodeURIComponent(
          timeRange
        )}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      throw error;
    }
  },
  getActivityChart: async (timeRange) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/dashboard/activity-chart?timeRange=${encodeURIComponent(
          timeRange
        )}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      throw error;
    }
  },
  getInsights: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/dashboard/insights`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      throw error;
    }
  },
  getFlaggedWords: async (timeRange) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/dashboard/flagged-words?timeRange=${encodeURIComponent(
          timeRange
        )}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      throw error;
    }
  },
  getWebsites: async (timeRange) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/dashboard/websites?timeRange=${encodeURIComponent(
          timeRange
        )}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      throw error;
    }
  },
};

const { width } = Dimensions.get("window");

export default function AdminDashboardScreen({ navigation }) {
  const [selectedTimeRange, setSelectedTimeRange] = useState("Today");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState(null);
  const [customDateModalVisible, setCustomDateModalVisible] = useState(false);
  const [fromDate, setFromDate] = useState(new Date());
  const [toDate, setToDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedFromDate, setSelectedFromDate] = useState(null);
  const [selectedToDate, setSelectedToDate] = useState(null);
  const [isSelectingFrom, setIsSelectingFrom] = useState(true);
  const [showYearPicker, setShowYearPicker] = useState(false);
  const [dashboardData, setDashboardData] = useState({
    overview: null,
    chartData: null,
    insights: null,
    topFlaggedContent: [],
    topMonitoredWebsites: [],
  });

  const defaultChartData = {
    labels: ["", "", "", "", "", "", ""],
    datasets: [
      {
        data: [0, 0, 0, 0, 0, 0, 0],
        strokeWidth: 2,
        color: (opacity = 1) => `rgba(34, 197, 94, ${opacity})`,
        fillShadowGradient: "rgba(34, 197, 94, 0.1)",
        fillShadowGradientOpacity: 0.1,
      },
      {
        data: [0, 0, 0, 0, 0, 0, 0],
        strokeWidth: 2,
        color: (opacity = 1) => `rgba(107, 114, 128, ${opacity})`,
        fillShadowGradient: "rgba(107, 114, 128, 0.1)",
        fillShadowGradientOpacity: 0.1,
      },
    ],
  };

  const chartConfig = {
    backgroundColor: "transparent",
    backgroundGradientFrom: "#ffffff",
    backgroundGradientTo: "#ffffff",
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(107, 114, 128, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(156, 163, 175, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: "0",
    },
    propsForBackgroundLines: {
      strokeWidth: 0,
    },
    withHorizontalLabels: false,
    withVerticalLabels: false,
    withInnerLines: false,
    withOuterLines: false,
  };

  const timeRanges = ["Today", "Last 7 days", "Last 30 days", "All Time"];

  const fetchDashboardData = useCallback(async (timeRange) => {
    try {
      setIsLoading(true);
      setError(null); // Clear any previous errors

      // Map time range for API consistency
      const mappedTimeRange = timeRange.toLowerCase();

      const [overview, chartData, insights, flaggedWordsData, websitesData] = await Promise.all([
        dashboardService.getOverview(mappedTimeRange),
        dashboardService.getActivityChart(mappedTimeRange),
        dashboardService.getInsights(),
        dashboardService.getFlaggedWords(mappedTimeRange),
        dashboardService.getWebsites(mappedTimeRange),
      ]);

      // Format flagged words data for display
      const topFlaggedContent = flaggedWordsData.topWords?.slice(0, 10).map((word, index) => ({
        id: index + 1,
        term: word.word,
        count: word.count,
        severity: word.severity || 'medium'
      })) || [];

      // Format websites data for display
      const topMonitoredWebsites = websitesData.topWebsites?.slice(0, 10).map((site, index) => ({
        id: index + 1,
        url: site.domain || site.url,
        issues: site.detectionCount,
        riskLevel: site.riskLevel || 'medium'
      })) || [];

      setDashboardData({
        overview,
        chartData,
        insights,
        topFlaggedContent,
        topMonitoredWebsites,
      });
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
      setError("Failed to load dashboard data. Please try again later.");
      setDashboardData({
        overview: {
          harmfulContentDetected: { value: "0", change: "+0%" },
          websitesMonitored: { value: "0", change: "+0" },
          protectionEffectiveness: { value: "95%", change: "+0%" },
        },
        chartData: {
          labels: ["", "", "", "", "", "", ""],
          datasets: [
            { label: "Protected", data: [0, 0, 0, 0, 0, 0, 0] },
            { label: "Monitored", data: [0, 0, 0, 0, 0, 0, 0] },
          ],
        },
        insights: {
          insights: [
            {
              icon: "shield-alert",
              text: "Unable to load insights",
              color: "#ef4444",
            },
          ],
        },
        topFlaggedContent: [],
        topMonitoredWebsites: [],
      });
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []); // Empty dependency array since this function doesn't depend on any props or state

  const onRefresh = () => {
    setIsRefreshing(true);
    fetchDashboardData(selectedTimeRange);
  };

  useEffect(() => {
    fetchDashboardData(selectedTimeRange);
  }, [selectedTimeRange, fetchDashboardData]);

  // Real-time updates for flagged content and websites
  useEffect(() => {
    const updateInterval = setInterval(async () => {
      // Only update if not currently loading and not in custom date mode
      if (!isLoading && selectedTimeRange !== 'Custom') {
        setIsUpdating(true);
        try {
          await fetchDashboardData(selectedTimeRange);
        } finally {
          setIsUpdating(false);
        }
      }
    }, 30000); // Update every 30 seconds

    return () => clearInterval(updateInterval);
  }, [selectedTimeRange, isLoading, fetchDashboardData]);

  // Detection and Reports counts mock data for each time range
  const detectionReportsData = {
    Today: {
      labels: ["12AM", "4AM", "8AM", "12PM", "4PM", "8PM"],
      detections: [5, 8, 12, 20, 15, 10],
      reports: [2, 3, 4, 6, 5, 3],
    },
    "Last 7 days": {
      labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      detections: [45, 52, 38, 67, 89, 74, 92],
      reports: [12, 15, 10, 18, 20, 16, 22],
    },
    "Last 30 days": {
      labels: Array.from({ length: 30 }, (_, i) => `Day ${i + 1}`),
      detections: Array.from({ length: 30 }, () =>
        Math.floor(Math.random() * 100)
      ),
      reports: Array.from({ length: 30 }, () => Math.floor(Math.random() * 30)),
    },
    "All Time": {
      labels: [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ],
      detections: [320, 280, 350, 400, 420, 390, 410, 430, 390, 370, 360, 400],
      reports: [80, 70, 90, 100, 110, 95, 105, 120, 100, 90, 85, 110],
    },
  };

  const selectedData = detectionReportsData[selectedTimeRange];
  const detectionChartData = {
    labels: selectedData.labels,
    datasets: [
      {
        data: selectedData.detections,
        color: (opacity = 1) => `rgba(1, 185, 127, ${opacity})`,
        fillShadowGradient: "rgba(1, 185, 127, 0.1)",
        fillShadowGradientOpacity: 0.1,
      },
      {
        data: selectedData.reports,
        color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
        fillShadowGradient: "rgba(59, 130, 246, 0.1)",
        fillShadowGradientOpacity: 0.1,
      },
    ],
  };

  const overallStats = dashboardData.overview
    ? [
        {
          value: dashboardData.overview.harmfulContentDetected?.value || "0",
          label: "HARMFUL CONTENT\nDETECTED",
          change:
            dashboardData.overview.harmfulContentDetected?.change || "+0%",
          color: "#6b7280",
          icon: "shield-alert",
        },
        {
          value: dashboardData.overview.websitesMonitored?.value || "0",
          label: "WEBSITES\nMONITORED",
          change: dashboardData.overview.websitesMonitored?.change || "+0",
          color: "#6b7280",
          icon: "web",
        },
        {
          value: dashboardData.overview.protectionEffectiveness?.value || "95%",
          label: "PROTECTION\nEFFECTIVENESS",
          change:
            dashboardData.overview.protectionEffectiveness?.change || "+0%",
          color: "#6b7280",
          icon: "shield-check",
        },
      ]
    : [];

  const insightsData = dashboardData.insights?.insights || [
    { icon: "shield-alert", text: "Loading insights...", color: "#6b7280" },
  ];

  const menuOptions = [
    {
      icon: "shield-alert",
      title: "Detection",
      subtitle: "Detection analytics and details",
      color: "#e8f5f0",
      iconColor: "#01B97F",
      screen: "AdminDetection",
    },
    {
      icon: "web",
      title: "Sites",
      subtitle: "Sites analytics and details",
      color: "#e8f5f0",
      iconColor: "#01B97F",
      screen: "AdminSites",
    },
    {
      icon: "translate",
      title: "Languages",
      subtitle: "Languages analytics and details",
      color: "#e8f5f0",
      iconColor: "#01B97F",
      screen: "AdminLanguages",
    },
    {
      icon: "account-group",
      title: "Groups",
      subtitle: "Groups analytics and details",
      color: "#e8f5f0",
      iconColor: "#01B97F",
      screen: "AdminGroups",
    },
    {
      icon: "chart-timeline-variant",
      title: "Patterns Over Time",
      subtitle: "Patterns over time analytics and details",
      color: "#e8f5f0",
      iconColor: "#01B97F",
      screen: "AdminPatternsOverTime",
    },
  ];

  const sideMenuItems = [
    {
      title: "Dashboard Overview",
      icon: "bar-chart-2",
      action: () => setIsMenuOpen(false),
    },
    {
      title: "Detection",
      icon: "alert-circle",
      action: () => navigation.navigate("AdminDetection"),
    },
    {
      title: "Sites",
      icon: "web",
      action: () => navigation.navigate("AdminSites"),
    },
    {
      title: "Languages",
      icon: "translate",
      action: () => navigation.navigate("AdminLanguages"),
    },
    {
      title: "Groups",
      icon: "account-group",
      action: () => navigation.navigate("AdminGroups"),
    },
    {
      title: "Patterns Over Time",
      icon: "trending-up",
      action: () => navigation.navigate("AdminPatternsOverTime"),
    },
  ];

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleMenuAction = (action) => {
    setIsMenuOpen(false);
    action();
  };

  const handleTimeRangeChange = (range) => {
    setSelectedTimeRange(range);
  };

  const openCustomDateModal = () => {
    // Initialize with current date
    const today = new Date();
    setCurrentMonth(today);
    setSelectedFromDate(null);
    setSelectedToDate(null);
    setIsSelectingFrom(true);
    setCustomDateModalVisible(true);
  };

  const closeCustomDateModal = () => {
    setCustomDateModalVisible(false);
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const validateDateInput = (day, month, year) => {
    const dayNum = parseInt(day);
    const monthNum = parseInt(month);
    const yearNum = parseInt(year);
    
    if (isNaN(dayNum) || isNaN(monthNum) || isNaN(yearNum)) return false;
    if (monthNum < 1 || monthNum > 12) return false;
    if (dayNum < 1 || dayNum > 31) return false;
    if (yearNum < 1900 || yearNum > 2100) return false;
    
    // Check for valid day in month
    const date = new Date(yearNum, monthNum - 1, dayNum);
    return date.getDate() === dayNum && date.getMonth() === monthNum - 1;
  };

  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const generateCalendarDays = (date) => {
    const daysInMonth = getDaysInMonth(date);
    const firstDay = getFirstDayOfMonth(date);
    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(date.getFullYear(), date.getMonth(), i));
    }
    
    return days;
  };

  const isSameDay = (date1, date2) => {
    return date1 && date2 && 
           date1.getDate() === date2.getDate() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getFullYear() === date2.getFullYear();
  };

  const isDateInRange = (date, fromDate, toDate) => {
    if (!date || !fromDate || !toDate) return false;
    return date >= fromDate && date <= toDate;
  };

  const formatMonthYear = (date) => {
    return date.toLocaleDateString('en-US', { 
      month: 'long', 
      year: 'numeric' 
    });
  };

  const handleDateSelect = (date) => {
    if (isSelectingFrom) {
      setSelectedFromDate(date);
      setIsSelectingFrom(false);
    } else {
      if (date >= selectedFromDate) {
        setSelectedToDate(date);
      } else {
        setSelectedFromDate(date);
        setSelectedToDate(null);
      }
    }
  };

  const handleMonthChange = (direction) => {
    const newMonth = new Date(currentMonth);
    if (direction === 'next') {
      newMonth.setMonth(newMonth.getMonth() + 1);
    } else {
      newMonth.setMonth(newMonth.getMonth() - 1);
    }
    setCurrentMonth(newMonth);
  };

  const handleYearChange = (direction) => {
    const newMonth = new Date(currentMonth);
    if (direction === 'next') {
      newMonth.setFullYear(newMonth.getFullYear() + 1);
    } else {
      newMonth.setFullYear(newMonth.getFullYear() - 1);
    }
    setCurrentMonth(newMonth);
  };

  const applyDateRange = () => {
    if (selectedFromDate && selectedToDate) {
      setFromDate(selectedFromDate);
      setToDate(selectedToDate);
      setSelectedTimeRange("Custom");
      closeCustomDateModal();
      fetchDashboardData("Custom");
    }
  };

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={onRefresh}
          colors={["#3b82f6"]}
          tintColor={"#3b82f6"}
        />
      }
    >
      <MainHeader
        title="Admin Dashboard"
        subtitle="Admin real-time protection insights"
        rightActions={[
          {
            icon: "menu",
            iconType: "feather",
            onPress: toggleMenu,
          },
        ]}
        style={{ paddingHorizontal: 0 }}
      />
      <View style={styles.timeRangeContainer}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.timeRangeScrollContent}
        >
          {timeRanges.map((range) => (
            <TouchableOpacity
              key={range}
              style={[
                styles.timeRangeButton,
                selectedTimeRange === range && styles.timeRangeButtonActive,
              ]}
              onPress={() => handleTimeRangeChange(range)}
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
          <TouchableOpacity
            style={[
              styles.timeRangeButton,
              styles.customDateButton,
              selectedTimeRange === "Custom" && styles.timeRangeButtonActive,
            ]}
            onPress={openCustomDateModal}
          >
            <Feather name="calendar" size={16} color={selectedTimeRange === "Custom" ? "#ffffff" : "#374151"} />
            <Text
              style={[
                styles.timeRangeText,
                selectedTimeRange === "Custom" && styles.timeRangeTextActive,
              ]}
            >
              Custom
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
      {error ? (
        <View style={styles.errorContainer}>
          <MaterialCommunityIcons
            name="alert-circle-outline"
            size={24}
            color="#ef4444"
          />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3b82f6" />
          <Text style={styles.loadingText}>Loading dashboard data...</Text>
        </View>
      ) : (
        <View style={styles.overallStatsContainer}>
          {overallStats.map((stat, index) => (
            <View key={index} style={styles.statCard}>
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
              <Text style={[styles.statChange, { color: stat.color }]}>
                {" "}
                {stat.change}{" "}
              </Text>
            </View>
          ))}
        </View>
      )}
      <View style={styles.chartContainer}>
        <View style={styles.chartHeader}>
          <Text style={styles.chartTitle}>
            Detection & Reports ({selectedTimeRange})
          </Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <LineChart
            data={{
              labels: detectionChartData.labels,
              datasets: [
                {
                  data: selectedData.detections,
                  color: (opacity = 1) => `rgba(1, 185, 127, ${opacity})`,
                  strokeWidth: 3,
                  withDots: true,
                  fillShadowGradient: "rgba(16, 185, 129, 0.6)", // More vibrant green
                  fillShadowGradientOpacity: 0.6,
                },
                {
                  data: selectedData.reports,
                  color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
                  strokeWidth: 3,
                  withDots: true,
                  fillShadowGradient: "rgba(59, 130, 246, 0.6)", // More vibrant blue
                  fillShadowGradientOpacity: 0.6,
                },
              ],
            }}
            width={Math.max(detectionChartData.labels.length * 80, width - 40)}
            height={220}
            chartConfig={{
              ...chartConfig,
              propsForBackgroundLines: { stroke: "#f3f4f6" },
              propsForLabels: { fontFamily: "Poppins-Medium" },
            }}
            style={styles.chart}
            fromZero
            withDots={true}
            withShadow={true}
            withInnerLines={true}
            withHorizontalLabels={true}
            withVerticalLabels={true}
          />
        </ScrollView>
        <View style={styles.chartLegend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: "#01B97F" }]} />
            <Text style={styles.legendText}>Detections</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: "#3B82F6" }]} />
            <Text style={styles.legendText}>Reports</Text>
          </View>
        </View>
      </View>
      <View style={styles.menuContainer}>
        <Text style={styles.menuTitle}>Analytics Sections</Text>
        {menuOptions.map((option, index) => (
          <TouchableOpacity
            key={index}
            style={styles.menuItem}
            onPress={() => navigation.navigate(option.screen)}
          >
            <View style={[styles.menuIcon, { backgroundColor: option.color }]}>
              <MaterialCommunityIcons
                name={option.icon}
                size={24}
                color={option.iconColor}
              />
            </View>
            <View style={styles.menuContent}>
              <Text style={styles.menuItemTitle}>{option.title}</Text>
              <Text style={styles.menuItemSubtitle}>{option.subtitle}</Text>
            </View>
            <Feather name="chevron-right" size={20} color="#9ca3af" />
          </TouchableOpacity>
        ))}
      </View>

      {/* New Analytics Sections */}
      <View style={styles.analyticsSectionContainer}>
        <View style={styles.sectionTitleContainer}>
          <Text style={styles.analyticsSectionTitle}>Top Flagged Content</Text>
          {isUpdating && (
            <View style={styles.updateIndicator}>
              <ActivityIndicator size="small" color="#3b82f6" />
              <Text style={styles.updateText}>Updating...</Text>
            </View>
          )}
        </View>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color="#3b82f6" />
            <Text style={styles.loadingText}>
              Loading top flagged content...
            </Text>
          </View>
        ) : (
          <View style={styles.analyticsList}>
            {dashboardData.topFlaggedContent.map((item) => (
              <View key={item.id} style={styles.analyticsListItem}>
                <View style={styles.analyticsItemLeft}>
                  <Text style={styles.analyticsListItemText}>{item.term}</Text>
                  <View style={[styles.severityBadge, {
                    backgroundColor: item.severity === 'high' ? '#fee2e2' :
                                   item.severity === 'medium' ? '#fef3c7' : '#f0fdf4',
                  }]}>
                    <Text style={[styles.severityText, {
                      color: item.severity === 'high' ? '#dc2626' :
                             item.severity === 'medium' ? '#d97706' : '#16a34a',
                    }]}>
                      {item.severity}
                    </Text>
                  </View>
                </View>
                <Text style={styles.analyticsListItemValue}>{item.count}</Text>
              </View>
            ))}
          </View>
        )}
      </View>

      <View style={styles.analyticsSectionContainer}>
        <View style={styles.sectionTitleContainer}>
          <Text style={styles.analyticsSectionTitle}>Top Monitored Websites</Text>
          {isUpdating && (
            <View style={styles.updateIndicator}>
              <ActivityIndicator size="small" color="#3b82f6" />
              <Text style={styles.updateText}>Updating...</Text>
            </View>
          )}
        </View>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color="#3b82f6" />
            <Text style={styles.loadingText}>
              Loading top monitored websites...
            </Text>
          </View>
        ) : (
          <View style={styles.analyticsList}>
            {dashboardData.topMonitoredWebsites.map((item) => (
              <View key={item.id} style={styles.analyticsListItem}>
                <View style={styles.analyticsItemLeft}>
                  <Text style={styles.analyticsListItemText}>{item.url}</Text>
                  <View style={[styles.riskBadge, {
                    backgroundColor: item.riskLevel === 'high' ? '#fee2e2' :
                                   item.riskLevel === 'medium' ? '#fef3c7' : '#f0fdf4',
                  }]}>
                    <Text style={[styles.riskText, {
                      color: item.riskLevel === 'high' ? '#dc2626' :
                             item.riskLevel === 'medium' ? '#d97706' : '#16a34a',
                    }]}>
                      {item.riskLevel} risk
                    </Text>
                  </View>
                </View>
                <Text style={styles.analyticsListItemValue}>{item.issues}</Text>
              </View>
            ))}
          </View>
        )}
      </View>


      <Modal
        visible={isMenuOpen}
        transparent={true}
        animationType="slide"
        onRequestClose={toggleMenu}
      >
        <TouchableOpacity style={styles.overlay} onPress={toggleMenu}>
          <View style={styles.bottomSheetContainer}>
            <View style={styles.bottomSheet}>
              <View style={styles.handleBar} />
              <View style={styles.menuHeader}>
                <Text style={styles.menuTitle}>Admin Dashboard</Text>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={toggleMenu}
                >
                  <MaterialCommunityIcons
                    name="close"
                    size={24}
                    color="#374151"
                  />
                </TouchableOpacity>
              </View>
              <ScrollView
                style={styles.menuScroll}
                showsVerticalScrollIndicator={false}
              >
                <View style={styles.menuSection}>
                  <Text style={styles.sectionTitle}>Analytics</Text>
                  {sideMenuItems.map((item, index) => (
                    <TouchableOpacity
                      key={index}
                      style={styles.menuItem}
                      onPress={() => handleMenuAction(item.action)}
                    >
                      <View style={styles.menuItemIcon}>
                        <MaterialCommunityIcons
                          name={item.icon}
                          size={24}
                          color="#374151"
                        />
                      </View>
                      <View style={styles.menuItemContent}>
                        <Text style={styles.menuItemText}>{item.title}</Text>
                        <Text style={styles.menuItemSubtitle}>
                          {index === 0
                            ? "Main dashboard overview"
                            : index === 1
                            ? "Detection analytics and details"
                            : index === 2
                            ? "Sites analytics and details"
                            : index === 3
                            ? "Languages analytics and details"
                            : index === 4
                            ? "Groups analytics and details"
                            : "Patterns over time analytics and details"}
                        </Text>
                      </View>
                      <MaterialCommunityIcons
                        name="chevron-right"
                        size={20}
                        color="#9ca3af"
                      />
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Custom Date Range Modal */}
      <Modal
        visible={customDateModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={closeCustomDateModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.customDateModal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Date Range</Text>
              <TouchableOpacity onPress={closeCustomDateModal}>
                <Feather name="x" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.dateInputContainer}>
              <View style={styles.calendarHeader}>
                <TouchableOpacity onPress={() => handleMonthChange('prev')}>
                  <Feather name="chevron-left" size={24} color="#6B7280" />
                </TouchableOpacity>
                <View style={styles.calendarTitleContainer}>
                  <Text style={styles.calendarTitle}>{formatMonthYear(currentMonth)}</Text>
                  <TouchableOpacity 
                    style={styles.yearSelector}
                    onPress={() => setShowYearPicker(true)}
                  >
                    <Feather name="calendar" size={16} color="#6B7280" />
                  </TouchableOpacity>
                </View>
                <TouchableOpacity onPress={() => handleMonthChange('next')}>
                  <Feather name="chevron-right" size={24} color="#6B7280" />
                </TouchableOpacity>
              </View>

              <View style={styles.calendarStatus}>
                <Text style={styles.calendarStatusText}>
                  {isSelectingFrom ? 'Select start date' : 'Select end date'}
                </Text>
                {selectedFromDate && (
                  <Text style={styles.selectedDateText}>
                    From: {formatDate(selectedFromDate)}
                  </Text>
                )}
                {selectedToDate && (
                  <Text style={styles.selectedDateText}>
                    To: {formatDate(selectedToDate)}
                  </Text>
                )}
              </View>

              <View style={styles.calendarGrid}>
                <View style={styles.weekDays}>
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <Text key={day} style={styles.weekDayText}>{day}</Text>
                  ))}
                </View>
                <View style={styles.daysGrid}>
                  {generateCalendarDays(currentMonth).map((date, index) => (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.dayCell,
                        date && isSameDay(date, selectedFromDate) && styles.selectedFromCell,
                        date && isSameDay(date, selectedToDate) && styles.selectedToCell,
                        date && isDateInRange(date, selectedFromDate, selectedToDate) && styles.inRangeCell,
                        !date && styles.emptyCell,
                      ]}
                      onPress={() => date && handleDateSelect(date)}
                      disabled={!date}
                    >
                      <Text style={[
                        styles.dayText,
                        date && isSameDay(date, selectedFromDate) && styles.selectedDayText,
                        date && isSameDay(date, selectedToDate) && styles.selectedDayText,
                        date && isDateInRange(date, selectedFromDate, selectedToDate) && styles.inRangeDayText,
                      ]}>
                        {date ? date.getDate() : ''}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={closeCustomDateModal}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.applyButton}
                onPress={applyDateRange}
              >
                <Text style={styles.applyButtonText}>Apply</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Year Picker Modal */}
      <Modal
        visible={showYearPicker}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowYearPicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.yearPickerModal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Year</Text>
              <TouchableOpacity onPress={() => setShowYearPicker(false)}>
                <Feather name="x" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.yearPickerScroll}>
              {Array.from({ length: 11 }, (_, i) => {
                const year = new Date().getFullYear() - i;
                return (
                  <TouchableOpacity
                    key={year}
                    style={[
                      styles.yearOption,
                      year === currentMonth.getFullYear() && styles.selectedYearOption
                    ]}
                    onPress={() => {
                      const newMonth = new Date(currentMonth);
                      newMonth.setFullYear(year);
                      setCurrentMonth(newMonth);
                      setShowYearPicker(false);
                    }}
                  >
                    <Text style={[
                      styles.yearOptionText,
                      year === currentMonth.getFullYear() && styles.selectedYearOptionText
                    ]}>
                      {year}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
    paddingHorizontal: 10,
  },
  timeRangeContainer: {
    marginBottom: 20,
  },
  timeRangeScrollContent: {
    paddingHorizontal: 10,
    gap: 8,
  },
  timeRangeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  timeRangeButtonActive: {
    backgroundColor: "#01B97F",
  },
  timeRangeText: {
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    color: "#374151",
  },
  timeRangeTextActive: {
    fontFamily: "Poppins-SemiBold",
    color: "#ffffff",
  },
  customDateButton: {
    backgroundColor: "#f3f4f6",
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  overallStatsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 30,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 20,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: "#f3f4f6",
  },
  statValue: {
    fontSize: 20,
    fontFamily: "Poppins-Bold",
    color: "#111827",
    marginBottom: 4,
  },
  statChange: {
    fontSize: 12,
    fontFamily: "Poppins-Medium",
    marginTop: 4,
  },
  statLabel: {
    fontSize: 10,
    fontFamily: "Poppins-Medium",
    color: "#9ca3af",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  chartContainer: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 20,
    marginBottom: 30,
    borderWidth: 1,
    borderColor: "#f3f4f6",
  },
  chartHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  chartTitle: {
    fontSize: 16,
    fontFamily: "Poppins-SemiBold",
    color: "#111827",
    marginBottom: 15,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  chartLegend: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 15,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  legendText: {
    fontSize: 12,
    fontFamily: "Poppins-Medium",
    color: "#6b7280",
  },
  menuContainer: {
    marginBottom: 30,
  },
  menuTitle: {
    fontSize: 16,
    fontFamily: "Poppins-SemiBold",
    color: "#111827",
    marginBottom: 16,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderRadius: 8,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#f3f4f6",
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },

  menuContent: {
    flex: 1,
  },
  menuItemTitle: {
    fontSize: 14,
    fontFamily: "Poppins-SemiBold",
    color: "#111827",
    marginBottom: 2,
  },
  menuItemSubtitle: {
    fontSize: 12,
    fontFamily: "Poppins-Regular",
    color: "#6b7280",
  },
  summaryContainer: {
    backgroundColor: "#f9fafb",
    borderRadius: 12,
    padding: 20,
    marginBottom: 40,
    borderWidth: 1,
    borderColor: "#f3f4f6",
  },
  summaryTitle: {
    fontSize: 16,
    fontFamily: "Poppins-SemiBold",
    color: "#111827",
    marginBottom: 16,
  },
  summaryItems: {
    gap: 12,
  },
  summaryItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  summaryText: {
    fontSize: 13,
    fontFamily: "Poppins-Regular",
    color: "#6b7280",
    marginLeft: 12,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: 14,
    fontFamily: "Poppins-Medium",
    color: "#6b7280",
    marginTop: 12,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
    backgroundColor: "#fef2f2",
    borderRadius: 12,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: "#ef4444",
  },
  errorText: {
    fontSize: 14,
    fontFamily: "Poppins-Medium",
    color: "#ef4444",
    marginTop: 8,
    textAlign: "center",
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  bottomSheetContainer: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "transparent",
  },
  bottomSheet: {
    backgroundColor: "#ffffff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 10,
  },
  handleBar: {
    width: 40,
    height: 4,
    backgroundColor: "#e5e7eb",
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 15,
  },
  menuHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  menuScroll: {
    flex: 1,
  },
  menuSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: "Poppins-SemiBold",
    color: "#374151",
    marginBottom: 12,
  },
  menuItemIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  menuItemContent: {
    flex: 1,
  },
  menuItemText: {
    fontSize: 16,
    fontFamily: "Poppins-Medium",
    color: "#111827",
    marginLeft: 16,
  },
  closeButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 20,
    backgroundColor: "#f3f4f6",
  },
  analyticsSectionContainer: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 20,
    marginBottom: 30,
    borderWidth: 1,
    borderColor: "#f3f4f6",
  },
  analyticsSectionTitle: {
    fontSize: 16,
    fontFamily: "Poppins-SemiBold",
    color: "#111827",
    marginBottom: 16,
  },
  analyticsList: {
    gap: 10,
  },
  analyticsListItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  analyticsListItemText: {
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    color: "#374151",
  },
  analyticsListItemValue: {
    fontSize: 14,
    fontFamily: "Poppins-Medium",
    color: "#111827",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  customDateModal: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 20,
    width: "90%",
    maxWidth: 400,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: "Poppins-SemiBold",
    color: "#111827",
  },
  dateInputContainer: {
    marginBottom: 20,
  },
  calendarHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  calendarTitle: {
    fontSize: 18,
    fontFamily: "Poppins-SemiBold",
    color: "#111827",
    textAlign: "center",
  },
  calendarTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  yearSelector: {
    width: 32,
    height: 32,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 16,
    backgroundColor: "#f3f4f6",
  },
  calendarStatus: {
    marginBottom: 15,
    paddingHorizontal: 10,
  },
  calendarStatusText: {
    fontSize: 14,
    fontFamily: "Poppins-Medium",
    color: "#6b7280",
    marginBottom: 5,
  },
  selectedDateText: {
    fontSize: 13,
    fontFamily: "Poppins-Regular",
    color: "#374151",
  },
  calendarGrid: {
    borderWidth: 1,
    borderColor: "#f3f4f6",
    borderRadius: 12,
    overflow: "hidden",
  },
  weekDays: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 10,
    backgroundColor: "#f9fafb",
  },
  weekDayText: {
    fontSize: 12,
    fontFamily: "Poppins-Medium",
    color: "#6b7280",
  },
  daysGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  dayCell: {
    width: width / 7, // 7 columns for days of the week
    aspectRatio: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 8,
  },
  dayText: {
    fontSize: 14,
    fontFamily: "Poppins-Medium",
    color: "#374151",
  },
  selectedFromCell: {
    backgroundColor: "#e8f5f0",
    borderRadius: 8,
  },
  selectedToCell: {
    backgroundColor: "#e8f5f0",
    borderRadius: 8,
  },
  inRangeCell: {
    backgroundColor: "#e8f5f0",
    borderRadius: 8,
  },
  emptyCell: {
    backgroundColor: "transparent",
  },
  selectedDayText: {
    color: "#ffffff",
  },
  inRangeDayText: {
    color: "#ffffff",
  },
  dateInput: {
    marginBottom: 15,
  },
  dateLabel: {
    fontSize: 14,
    fontFamily: "Poppins-Medium",
    color: "#6b7280",
    marginBottom: 8,
  },
  dateInputRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
  },
  dateInputField: {
    flex: 1,
  },
  dateInputLabel: {
    fontSize: 12,
    fontFamily: "Poppins-Medium",
    color: "#6b7280",
    marginBottom: 4,
  },
  dateTextInput: {
    fontSize: 16,
    fontFamily: "Poppins-Regular",
    color: "#374151",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 20,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: "#f3f4f6",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    alignItems: "center",
    marginRight: 10,
  },
  cancelButtonText: {
    fontSize: 16,
    fontFamily: "Poppins-Medium",
    color: "#374151",
  },
  applyButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: "#01B97F",
    alignItems: "center",
    marginLeft: 10,
  },
  applyButtonText: {
    fontSize: 16,
    fontFamily: "Poppins-Medium",
    color: "#ffffff",
  },
  yearPickerModal: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 20,
    width: "80%",
    maxWidth: 300,
    maxHeight: "70%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 10,
  },
  yearPickerScroll: {
    maxHeight: 300,
  },
  yearOption: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginVertical: 2,
  },
  selectedYearOption: {
    backgroundColor: "#01B97F",
  },
  yearOptionText: {
    fontSize: 16,
    fontFamily: "Poppins-Medium",
    color: "#374151",
    textAlign: "center",
  },
  selectedYearOptionText: {
    color: "#ffffff",
    fontFamily: "Poppins-SemiBold",
  },
  analyticsItemLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  severityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    marginLeft: 8,
  },
  severityText: {
    fontSize: 10,
    fontFamily: 'Poppins-Medium',
    textTransform: 'uppercase',
  },
  riskBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    marginLeft: 8,
  },
  riskText: {
    fontSize: 10,
    fontFamily: 'Poppins-Medium',
    textTransform: 'uppercase',
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  updateIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  updateText: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: '#3b82f6',
    marginLeft: 4,
  },
});
