import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Dimensions,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { LineChart, PieChart } from 'react-native-chart-kit';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import MainHeader from '../../../components/common/MainHeader';

const API_BASE_URL = 'https://murai-server.onrender.com/api';

const languagesService = {
  getLanguages: async (timeRange) => {
    try {
      console.log(`Fetching languages data for timeRange: ${timeRange}`);
      const response = await fetch(`${API_BASE_URL}/dashboard/language-analytics?timeRange=${encodeURIComponent(timeRange)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log(`API Response status: ${response.status}`);

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`API Error: ${response.status} - ${errorText}`);
        throw new Error(`Failed to fetch languages data: ${response.status}`);
      }

      const data = await response.json();
      console.log('Raw API response:', data);

      return data;
    } catch (error) {
      console.error('Languages service error:', error);
      throw error;
    }
  },
};

export default function AdminLanguagesScreen({ navigation }) {
  const [selectedTimeRange, setSelectedTimeRange] = useState('Today');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [languagesData, setLanguagesData] = useState({
    languages: null,
  });

  const timeRanges = ['Today', 'Last 7 days', 'Last 30 days', 'All Time'];
  const { width } = Dimensions.get('window');

  const fetchLanguagesData = async (timeRange) => {
    try {
      setIsLoading(true);
      setError(null);
      const languages = await languagesService.getLanguages(timeRange);

      setLanguagesData({
        languages,
      });
    } catch (error) {
      console.error("Failed to fetch languages data:", error);
      setError("Failed to load languages data. Please try again later.");
      setLanguagesData({
        languages: {
          totalDetections: 0,
          languageDistribution: [],
          trendData: {},
          topPatterns: [],
          summary: {
            totalLanguages: 0,
            mostCommonLanguage: 'None',
            avgAccuracy: 0
          }
        },
      });
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const onRefresh = () => {
    setIsRefreshing(true);
    fetchLanguagesData(selectedTimeRange);
  };

  useEffect(() => {
    fetchLanguagesData(selectedTimeRange);
  }, [selectedTimeRange]);

  // Process language data from API response
  const processLanguageData = () => {
    if (!languagesData.languages || !languagesData.languages.languageDistribution) {
      return { languageData: [], languageBreakdown: [], trendData: [], trendLabels: [], totalDetections: 0 };
    }

    const { languageDistribution, totalDetections, trendData, topPatterns } = languagesData.languages;

    // Create balanced colors for pie chart
    const balancedColors = [
      '#34D399', // Medium emerald
      '#60A5FA', // Medium blue
      '#A78BFA', // Medium purple
      '#FBBF24', // Medium amber
      '#F87171', // Medium red
      '#6B7280', // Medium gray
    ];

    const languageData = languageDistribution.map((lang, index) => {
      return {
        name: `${lang.language} (${lang.percentage}%)`,
        population: lang.count,
        color: balancedColors[index % balancedColors.length],
        legendFontColor: '#374151',
        legendFontSize: 11,
        legendFontFamily: 'Poppins-Medium',
      };
    });

    const languageBreakdown = languageDistribution.map(lang => ({
      language: lang.language,
      count: lang.count,
      percentage: `${lang.percentage}%`,
      avgSentiment: lang.avgSentiment,
      avgAccuracy: lang.avgAccuracy,
      severityBreakdown: lang.severityBreakdown
    }));

    // Process trend data for chart (last 7 days)
    const trendEntries = Object.entries(trendData || {}).slice(-7);
    const chartTrendData = [];
    const trendLabels = [];

    trendEntries.forEach(([date, languages]) => {
      const totalForDay = Object.values(languages).reduce((sum, count) => sum + count, 0);
      chartTrendData.push(totalForDay);
      trendLabels.push(new Date(date).toLocaleDateString('en-US', { weekday: 'short' }));
    });

    return {
      languageData,
      languageBreakdown,
      trendData: chartTrendData,
      trendLabels,
      totalDetections,
      topPatterns: topPatterns || []
    };
  };

  const { languageData, languageBreakdown, trendData, trendLabels, totalDetections, topPatterns } = processLanguageData();

  const lineChartConfig = {
    backgroundColor: 'transparent',
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(107, 114, 128, ${opacity})`, // Gray 500
    labelColor: (opacity = 1) => `rgba(156, 163, 175, ${opacity})`, // Gray 400
    style: { borderRadius: 16 },
    propsForDots: { r: '4', strokeWidth: '2', stroke: '#4F46E5' }, // Indigo 600
    propsForBackgroundLines: { strokeWidth: 0.5, stroke: '#e5e7eb' }, // Gray 200
    withHorizontalLabels: true,
    withVerticalLabels: true,
    withInnerLines: true,
    withOuterLines: false,
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
        title="Languages"
        subtitle="Languages analytics and details"
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
          <MaterialCommunityIcons name="alert-circle-outline" size={24} color="#ef4444" />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#01B97F" />
          <Text style={styles.loadingText}>Loading languages data...</Text>
        </View>
      ) : (
        <View>
          {/* Language Detection Trend Chart */}
          {trendData.length > 0 && (
            <View style={styles.chartContainer}>
              <View style={styles.chartHeader}>
                <Text style={styles.chartTitle}>Language Detection Trend ({selectedTimeRange})</Text>
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <LineChart
                  data={{
                    labels: trendLabels.length > 0 ? trendLabels : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                    datasets: [
                      {
                        data: trendData.length > 0 ? trendData : [0, 0, 0, 0, 0, 0, 0],
                        color: (opacity = 1) => `rgba(1, 185, 127, ${opacity})`,
                        strokeWidth: 3,
                        withDots: true,
                        fillShadowGradient: 'rgba(1, 185, 127, 0.6)',
                        fillShadowGradientOpacity: 0.6,
                      },
                    ],
                  }}
                  width={Math.max((trendLabels.length * 80), width - 40)}
                  height={220}
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
                  bezier
                  style={styles.chart}
                  withDots={true}
                  withShadow={false}
                  withInnerLines={true}
                  withHorizontalLabels={true}
                  withVerticalLabels={true}
                  withVerticalLines={false}
                  withFill={true}
                  getDotColor={() => '#01B97F'}
                  getDotProps={() => ({
                    r: '4',
                    strokeWidth: '2',
                    stroke: '#ffffff',
                    fill: '#01B97F'
                  })}
                />
              </ScrollView>
            </View>
          )}

          {/* Language Distribution Pie Chart */}
          {languageData.length > 0 && (
            <View style={styles.chartContainer}>
              <View style={styles.chartHeader}>
                <Text style={styles.chartTitle}>Language Distribution</Text>
                <Text style={styles.chartSubtitle}>Based on detection activity</Text>
              </View>
              <View style={styles.pieChartWrapper}>
                <PieChart
                  data={languageData}
                  width={width - 40}
                  height={240}
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
                  center={[0, 10]}
                  absolute={false}
                  hasLegend={true}
                  avoidFalseZero={true}
                />
              </View>
              <View style={styles.pieChartSummary}>
                <Text style={styles.summaryText}>
                  Total Detections: <Text style={styles.summaryValue}>{totalDetections}</Text>
                </Text>
                <Text style={styles.summarySubtext}>
                  Across {languageData.length} detected languages
                </Text>
              </View>
            </View>
          )}

          {/* Language Breakdown */}
          <View style={styles.analyticsSectionContainer}>
            <Text style={styles.analyticsSectionTitle}>Language Breakdown</Text>
            <View style={styles.analyticsList}>
              {languageBreakdown.map((item, idx) => (
                <View key={idx} style={styles.analyticsListItem}>
                  <View style={styles.languageInfo}>
                    <Text style={styles.analyticsListItemText}>{item.language}</Text>
                    <Text style={styles.languageCount}>{item.count} detections</Text>
                  </View>
                  <View style={styles.percentageBadge}>
                    <Text style={styles.percentageText}>{item.percentage}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        </View>
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
    marginBottom: 4,
  },
  chartSubtitle: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: '#6b7280',
    marginBottom: 15,
  },
  pieChartWrapper: {
    alignItems: 'center',
    marginVertical: 10,
  },
  pieChartSummary: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    alignItems: 'center',
  },
  summaryText: {
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    color: '#374151',
    textAlign: 'center',
  },
  summaryValue: {
    fontSize: 14,
    fontFamily: 'Poppins-SemiBold',
    color: '#01B97F',
  },
  summarySubtext: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 4,
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
  languageInfo: {
    flex: 1,
  },
  languageCount: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: '#6b7280',
    marginTop: 2,
  },
  percentageBadge: {
    backgroundColor: '#e8f5f0',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  percentageText: {
    fontSize: 12,
    fontFamily: 'Poppins-Medium',
    color: '#01B97F',
  },
});