import { Feather } from '@expo/vector-icons';
import { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Animated,
    Dimensions,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { BarChart, PieChart } from 'react-native-chart-kit';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import MainHeader from '../../components/common/MainHeader';
import api from '../../services/api';

const { width } = Dimensions.get('window');

function DetectionAnalyticsScreen({ navigation }) {
  const [selectedTimeRange, setSelectedTimeRange] = useState('Today');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [detectionData, setDetectionData] = useState({
    flaggedWords: null,
    languageDistribution: null,
    trendPatterns: null,
    severityAnalysis: null,
    siteTypeAnalysis: null,
  });

  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Chart configurations following the established pattern
  const chartConfig = {
    backgroundColor: 'transparent',
    backgroundGradientFrom: '#f8fafc',
    backgroundGradientTo: '#f8fafc',
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(2, 185, 127, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(107, 114, 128, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '4',
      strokeWidth: '2',
      stroke: '#ffffff',
    },
    propsForBackgroundLines: {
      strokeWidth: 1,
      stroke: '#f1f5f9',
      strokeDasharray: '5,5',
    },
  };

  const timeRanges = ['Today', 'Last 7 Days', 'Last Month', 'Last Year'];

  // Fetch detection analytics data
  const fetchDetectionData = async (timeRangeParam = selectedTimeRange) => {
    setIsLoading(true);
    setError('');
    try {
      // Map time range to match server expectations
      const mappedTimeRange = timeRangeParam === 'Today' ? 'today' :
                             timeRangeParam === 'Last 7 Days' ? 'week' :
                             timeRangeParam === 'Last Month' ? 'month' :
                             timeRangeParam === 'Last Year' ? 'year' :
                             timeRangeParam.toLowerCase();

      const [flaggedWordsRes, detectedWordsRes] = await Promise.all([
        // Get flagged words data
        api.get(`/dashboard/flagged-words?timeRange=${mappedTimeRange}`).catch(() => ({
          data: { topWords: [], recentDetections: [], totalCount: 0, summary: { avgAccuracy: 95, avgResponseTime: 120 } }
        })),
        // Get detected words with language and pattern information
        api.get(`/user-dashboard/detected-words?timeRange=${mappedTimeRange}&includeLanguage=true&includePatterns=true`).catch(() => ({
          data: { detectedWords: [], totalCount: 0 }
        }))
      ]);

      const flaggedWords = flaggedWordsRes.data;
      const detectedWords = detectedWordsRes.data.detectedWords || [];

      // Process language distribution
      const languageCount = {};
      const patternCount = {};
      const severityCount = { low: 0, medium: 0, high: 0 };
      const siteTypeCount = {};

      detectedWords.forEach(word => {
        // Language processing
        const lang = detectLanguage(word.context || word.word || '');
        languageCount[lang] = (languageCount[lang] || 0) + 1;

        // Pattern processing
        const pattern = word.patternType || 'General';
        patternCount[pattern] = (patternCount[pattern] || 0) + 1;

        // Severity processing
        const severity = word.severity || determineSeverity(word.sentimentScore);
        severityCount[severity] = (severityCount[severity] || 0) + 1;

        // Site type processing
        const siteType = word.siteType || 'Unknown';
        siteTypeCount[siteType] = (siteTypeCount[siteType] || 0) + 1;
      });

      // Convert to chart format
      const languageDistribution = createPieChartData(languageCount, ['#02B97F', '#3b82f6', '#f59e0b', '#8b5cf6', '#ef4444']);
      const trendPatterns = createBarChartData(patternCount);
      const severityAnalysis = createPieChartData(severityCount, ['#10b981', '#f59e0b', '#ef4444']);
      const siteTypeAnalysis = createPieChartData(siteTypeCount, ['#02B97F', '#3b82f6', '#f59e0b', '#8b5cf6']);

      setDetectionData({
        flaggedWords,
        languageDistribution,
        trendPatterns,
        severityAnalysis,
        siteTypeAnalysis,
        totalDetections: detectedWords.length,
        detectedWords
      });
    } catch (err) {
      console.error('Detection analytics error:', err);
      setError('Failed to load detection analytics. Please check server connection.');
      // Set default data on error
      setDetectionData({
        flaggedWords: { topWords: [], recentDetections: [], totalCount: 0, summary: { avgAccuracy: 95, avgResponseTime: 120 } },
        languageDistribution: [],
        trendPatterns: { labels: [], datasets: [{ data: [] }] },
        severityAnalysis: [],
        siteTypeAnalysis: [],
        totalDetections: 0,
        detectedWords: []
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Language detection helper
  const detectLanguage = (text) => {
    if (!text) return 'Unknown';
    
    // Check for mixed English-Tagalog (Taglish)
    const hasEnglish = /\b(the|and|or|but|in|on|at|to|for|of|with|by)\b/i.test(text);
    const hasTagalog = /\b(ang|ng|sa|mga|ako|ikaw|siya|kami|kayo|sila|na|pa|po|opo)\b/i.test(text);
    
    if (hasEnglish && hasTagalog) {
      return 'Taglish';
    } else if (hasTagalog || /[ñáéíóúü]/i.test(text)) {
      return 'Tagalog';
    } else if (/^[a-zA-Z\s.,!?'"()-]+$/.test(text)) {
      return 'English';
    } else {
      return 'Other';
    }
  };

  // Severity determination helper
  const determineSeverity = (sentimentScore) => {
    if (sentimentScore < -0.5) return 'high';
    if (sentimentScore < -0.2) return 'medium';
    return 'low';
  };

  // Create pie chart data helper
  const createPieChartData = (dataObj, colors) => {
    return Object.entries(dataObj)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 6)
      .map(([name, count], index) => ({
        name,
        population: count,
        color: colors[index] || '#6b7280',
        legendFontColor: '#374151',
        legendFontSize: 12,
      }));
  };

  // Create bar chart data helper
  const createBarChartData = (dataObj) => {
    const entries = Object.entries(dataObj).sort(([,a], [,b]) => b - a).slice(0, 8);
    return {
      labels: entries.map(([name]) => name.length > 8 ? name.substring(0, 8) + '...' : name),
      datasets: [{
        data: entries.map(([,count]) => count),
        color: (opacity = 1) => `rgba(2, 185, 127, ${opacity})`,
      }]
    };
  };

  // Create flagged words bar chart data
  const createFlaggedWordsBarChart = (flaggedWords) => {
    if (!flaggedWords?.topWords || flaggedWords.topWords.length === 0) {
      return {
        labels: ['No Data'],
        datasets: [{
          data: [0],
          color: (opacity = 1) => `rgba(156, 163, 175, ${opacity})`
        }]
      };
    }

    const topWords = flaggedWords.topWords.slice(0, 6);
    return {
      labels: topWords.map(word => word.word.length > 8 ? word.word.substring(0, 8) + '...' : word.word),
      datasets: [{
        data: topWords.map(word => word.count),
        color: (opacity = 1) => `rgba(2, 185, 127, ${opacity})`,
      }]
    };
  };

  // Animation functions
  const startEntranceAnimation = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 700,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const resetAnimations = () => {
    fadeAnim.setValue(0);
    slideAnim.setValue(50);
    scaleAnim.setValue(0.8);
  };

  const startPulseAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  useEffect(() => {
    fetchDetectionData(selectedTimeRange);
  }, [selectedTimeRange]);

  useEffect(() => {
    if (isLoading) {
      startPulseAnimation();
    } else if (!error) {
      pulseAnim.stopAnimation();
      pulseAnim.setValue(1);
      startEntranceAnimation();
    }
  }, [isLoading, error]);

  const handleTimeRangeChange = (range) => {
    if (range !== selectedTimeRange) {
      resetAnimations();
      setSelectedTimeRange(range);
      setIsLoading(true);
    }
  };

  // Calculate overall stats
  const overallStats = detectionData.flaggedWords ? [
    {
      value: detectionData.totalDetections?.toString() || '0',
      label: 'Total Detections',
      change: '+12%',
      color: 'rgba(2, 185, 127, 1)',
      icon: 'shield-alert'
    },
    {
      value: detectionData.flaggedWords.topWords?.length?.toString() || '0',
      label: 'Unique Words',
      change: '+8%',
      color: 'rgba(59, 130, 246, 1)',
      icon: 'format-text'
    },
    {
      value: Math.round(detectionData.flaggedWords.summary?.avgAccuracy || 95) + '%',
      label: 'Accuracy Rate',
      change: '+2%',
      color: 'rgba(16, 185, 129, 1)',
      icon: 'target'
    },
  ] : [];

  const sideMenuItems = [
    { title: 'Dashboard Overview', icon: 'bar-chart-2', action: () => navigation.navigate('DashboardMain') },
    { title: 'Detection Analytics', icon: 'shield-search', action: () => setIsMenuOpen(false) },
    { title: 'Where It Happened', icon: 'web', action: () => navigation.navigate('WebsiteAnalytics') },
    { title: 'People & Activity', icon: 'account-group', action: () => navigation.navigate('UserActivityAnalytics') },
  ];

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleMenuAction = (action) => {
    setIsMenuOpen(false);
    action();
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <MainHeader
        title="Detection Analytics"
        subtitle="Comprehensive detection insights"
        rightActions={[
          {
            icon: 'menu',
            iconType: 'feather',
            onPress: toggleMenu
          }
        ]}
        style={{ paddingHorizontal: 0 }}
      />

      {/* Enhanced Time Range Selector */}
      <Animated.View
        style={[
          styles.timeRangeContainer,
          {
            opacity: fadeAnim,
          }
        ]}
      >
        <View style={styles.timeRangeSelectorHeader}>
          <MaterialCommunityIcons name="clock-outline" size={20} color="#6b7280" />
          <Text style={styles.timeRangeSelectorTitle}>Time Period</Text>
        </View>
        <View style={styles.timeRangeButtonsContainer}>
          {timeRanges.map((range) => (
            <TouchableOpacity
              key={range}
              style={[
                styles.timeRangeButton,
                selectedTimeRange === range && styles.timeRangeButtonActive,
              ]}
              onPress={() => handleTimeRangeChange(range)}
            >
              {isLoading && selectedTimeRange === range ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <MaterialCommunityIcons
                  name={
                    range === 'Today' ? 'calendar-today' :
                    range === 'Last 7 Days' ? 'calendar-week' :
                    range === 'Last Month' ? 'calendar-month' :
                    'calendar-range'
                  }
                  size={16}
                  color={selectedTimeRange === range ? '#ffffff' : '#6b7280'}
                />
              )}
              <Text style={[
                styles.timeRangeText,
                selectedTimeRange === range && styles.timeRangeTextActive,
              ]}>
                {range}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </Animated.View>

      {/* Overall Stats */}
      {isLoading ? (
        <Animated.View
          style={[
            styles.loadingContainer,
            {
              transform: [{ scale: pulseAnim }]
            }
          ]}
        >
          <ActivityIndicator size="large" color="#02B97F" />
          <Text style={styles.loadingText}>Loading detection analytics...</Text>
        </Animated.View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <MaterialCommunityIcons name="alert-circle-outline" size={24} color="#ef4444" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => fetchDetectionData(selectedTimeRange)}
          >
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.overallStatsContainer}>
          {overallStats.map((stat, index) => (
            <Animated.View
              key={index}
              style={[
                styles.statCard,
                {
                  opacity: fadeAnim,
                  transform: [{
                    translateY: slideAnim
                  }]
                }
              ]}
            >
              <View style={styles.statIconContainer}>
                <MaterialCommunityIcons
                  name={stat.icon}
                  size={24}
                  color="#02B97F"
                />
              </View>
              <View style={styles.statContent}>
                <Text style={styles.statValue}>{stat.value}</Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
                <View style={styles.statChangeContainer}>
                  <MaterialCommunityIcons
                    name={stat.change.includes('+') ? 'trending-up' : 'trending-down'}
                    size={14}
                    color={stat.change.includes('+') ? '#10b981' : '#ef4444'}
                  />
                  <Text style={[styles.statChange, {
                    color: stat.change.includes('+') ? '#10b981' : '#ef4444'
                  }]}>
                    {stat.change}
                  </Text>
                </View>
              </View>
            </Animated.View>
          ))}
        </View>
      )}

      {/* Most Flagged Words Section - Bar Chart */}
      <Animated.View
        style={[
          styles.sectionContainer,
          {
            opacity: fadeAnim,
          }
        ]}
      >
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleContainer}>
            <MaterialCommunityIcons name="flag-variant" size={24} color="#ef4444" />
            <Text style={styles.sectionTitle}>Most Flagged Words</Text>
          </View>
          <View style={styles.sectionBadge}>
            <Text style={styles.sectionBadgeText}>Bar Chart</Text>
          </View>
        </View>

        {isLoading ? (
          <View style={styles.chartLoadingContainer}>
            <ActivityIndicator size="large" color="#02B97F" />
          </View>
        ) : (
          <View style={styles.chartContainer}>
            <Animated.View
              style={[
                styles.barChartWrapper,
                {
                  opacity: fadeAnim,
                  transform: [{ scale: scaleAnim }]
                }
              ]}
            >
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.barChartScrollContent}
                style={styles.barChartScroll}
              >
                <BarChart
                  data={createFlaggedWordsBarChart(detectionData.flaggedWords)}
                  width={Math.max(width - 20, (detectionData.flaggedWords?.topWords?.length || 1) * 100)}
                  height={220}
                  chartConfig={{
                    backgroundColor: 'transparent',
                    backgroundGradientFrom: '#f8fafc',
                    backgroundGradientTo: '#f8fafc',
                    decimalPlaces: 0,
                    color: (opacity = 1) => `rgba(2, 185, 127, ${opacity})`,
                    labelColor: (opacity = 1) => `rgba(107, 114, 128, ${opacity})`,
                    style: { borderRadius: 16 },
                    barPercentage: 0.6,
                    fillShadowGradient: '#02B97F',
                    fillShadowGradientOpacity: 0.8,
                    propsForBackgroundLines: {
                      strokeWidth: 1,
                      stroke: '#f1f5f9',
                      strokeDasharray: '5,5',
                    },
                  }}
                  style={styles.chart}
                  showValuesOnTopOfBars={true}
                  fromZero={true}
                  verticalLabelRotation={0}
                />
              </ScrollView>
            </Animated.View>

            {/* Legend for severity colors */}
            <Animated.View
              style={[
                styles.flaggedWordsLegend,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }]
                }
              ]}
            >
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: '#ef4444' }]} />
                <Text style={styles.legendText}>High Risk</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: '#f59e0b' }]} />
                <Text style={styles.legendText}>Medium Risk</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: '#10b981' }]} />
                <Text style={styles.legendText}>Low Risk</Text>
              </View>
            </Animated.View>
          </View>
        )}
      </Animated.View>

      {/* Language Distribution Section */}
      <Animated.View
        style={[
          styles.sectionContainer,
          {
            opacity: fadeAnim,
          }
        ]}
      >
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleContainer}>
            <MaterialCommunityIcons name="translate" size={24} color="#3b82f6" />
            <Text style={styles.sectionTitle}>Language Distribution</Text>
          </View>
          <View style={styles.sectionBadge}>
            <Text style={styles.sectionBadgeText}>Pie Chart</Text>
          </View>
        </View>

        {isLoading ? (
          <View style={styles.chartLoadingContainer}>
            <ActivityIndicator size="large" color="#02B97F" />
          </View>
        ) : detectionData.languageDistribution?.length > 0 ? (
          <Animated.View
            style={[
              styles.chartContainer,
              {
                opacity: fadeAnim,
                transform: [{ scale: scaleAnim }]
              }
            ]}
          >
            <PieChart
              data={detectionData.languageDistribution}
              width={width - 40}
              height={220}
              chartConfig={chartConfig}
              accessor="population"
              backgroundColor="transparent"
              paddingLeft="15"
              center={[10, 10]}
              absolute
            />
            <Animated.View
              style={[
                styles.languageStatsContainer,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }]
                }
              ]}
            >
              {detectionData.languageDistribution.map((lang, index) => (
                <Animated.View
                  key={index}
                  style={[
                    styles.languageStatItem,
                    {
                      opacity: fadeAnim,
                      transform: [{
                        translateY: Animated.add(slideAnim, new Animated.Value(index * 5))
                      }]
                    }
                  ]}
                >
                  <View style={[styles.languageColorDot, { backgroundColor: lang.color }]} />
                  <Text style={styles.languageStatName}>{lang.name}</Text>
                  <Text style={styles.languageStatValue}>{lang.population}</Text>
                </Animated.View>
              ))}
            </Animated.View>
          </Animated.View>
        ) : (
          <View style={styles.noDataContainer}>
            <MaterialCommunityIcons name="chart-pie" size={24} color="#6b7280" />
            <Text style={styles.noDataText}>No language distribution data available</Text>
          </View>
        )}
      </Animated.View>

      {/* Trend Pattern Analysis Section */}
      <Animated.View
        style={[
          styles.sectionContainer,
          {
            opacity: fadeAnim,
          }
        ]}
      >
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleContainer}>
            <MaterialCommunityIcons name="trending-up" size={24} color="#f59e0b" />
            <Text style={styles.sectionTitle}>Pattern Categories</Text>
          </View>
          <View style={styles.sectionBadge}>
            <Text style={styles.sectionBadgeText}>Top 8</Text>
          </View>
        </View>

        {isLoading ? (
          <View style={styles.chartLoadingContainer}>
            <ActivityIndicator size="large" color="#02B97F" />
          </View>
        ) : detectionData.trendPatterns?.labels?.length > 0 ? (
          <Animated.View
            style={[
              styles.chartContainer,
              {
                opacity: fadeAnim,
                transform: [{ scale: scaleAnim }]
              }
            ]}
          >
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <BarChart
                data={detectionData.trendPatterns}
                width={Math.max(width - 40, detectionData.trendPatterns.labels.length * 60)}
                height={220}
                chartConfig={chartConfig}
                verticalLabelRotation={30}
                style={styles.chart}
                showValuesOnTopOfBars={true}
              />
            </ScrollView>
          </Animated.View>
        ) : (
          <View style={styles.noDataContainer}>
            <MaterialCommunityIcons name="chart-bar" size={24} color="#6b7280" />
            <Text style={styles.noDataText}>No pattern data available</Text>
          </View>
        )}
      </Animated.View>

      {/* Severity Analysis Section */}
      <Animated.View
        style={[
          styles.sectionContainer,
          {
            opacity: fadeAnim,
          }
        ]}
      >
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleContainer}>
            <MaterialCommunityIcons name="alert-octagon" size={24} color="#ef4444" />
            <Text style={styles.sectionTitle}>Severity Distribution</Text>
          </View>
          <View style={styles.sectionBadge}>
            <Text style={styles.sectionBadgeText}>Risk Level</Text>
          </View>
        </View>

        {isLoading ? (
          <View style={styles.chartLoadingContainer}>
            <ActivityIndicator size="large" color="#02B97F" />
          </View>
        ) : detectionData.severityAnalysis?.length > 0 ? (
          <View style={styles.chartContainer}>
            <PieChart
              data={detectionData.severityAnalysis}
              width={width - 40}
              height={220}
              chartConfig={chartConfig}
              accessor="population"
              backgroundColor="transparent"
              paddingLeft="15"
              center={[10, 10]}
              absolute
            />
            <View style={styles.severityStatsContainer}>
              {detectionData.severityAnalysis.map((severity, index) => (
                <View key={index} style={styles.severityStatItem}>
                  <View style={[styles.severityColorDot, { backgroundColor: severity.color }]} />
                  <Text style={styles.severityStatName}>
                    {severity.name.charAt(0).toUpperCase() + severity.name.slice(1)} Risk
                  </Text>
                  <Text style={styles.severityStatValue}>{severity.population}</Text>
                </View>
              ))}
            </View>
          </View>
        ) : (
          <View style={styles.noDataContainer}>
            <MaterialCommunityIcons name="shield-alert" size={24} color="#6b7280" />
            <Text style={styles.noDataText}>No severity data available</Text>
          </View>
        )}
      </Animated.View>

      {/* Site Type Analysis Section */}
      <Animated.View
        style={[
          styles.sectionContainer,
          {
            opacity: fadeAnim,
          }
        ]}
      >
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleContainer}>
            <MaterialCommunityIcons name="web" size={24} color="#8b5cf6" />
            <Text style={styles.sectionTitle}>Site Type Analysis</Text>
          </View>
          <View style={styles.sectionBadge}>
            <Text style={styles.sectionBadgeText}>Sources</Text>
          </View>
        </View>

        {isLoading ? (
          <View style={styles.chartLoadingContainer}>
            <ActivityIndicator size="large" color="#02B97F" />
          </View>
        ) : detectionData.siteTypeAnalysis?.length > 0 ? (
          <View style={styles.chartContainer}>
            <PieChart
              data={detectionData.siteTypeAnalysis}
              width={width - 40}
              height={220}
              chartConfig={chartConfig}
              accessor="population"
              backgroundColor="transparent"
              paddingLeft="15"
              center={[10, 10]}
              absolute
            />
            <View style={styles.siteTypeStatsContainer}>
              {detectionData.siteTypeAnalysis.map((siteType, index) => (
                <View key={index} style={styles.siteTypeStatItem}>
                  <View style={[styles.siteTypeColorDot, { backgroundColor: siteType.color }]} />
                  <Text style={styles.siteTypeStatName}>{siteType.name}</Text>
                  <Text style={styles.siteTypeStatValue}>{siteType.population}</Text>
                </View>
              ))}
            </View>
          </View>
        ) : (
          <View style={styles.noDataContainer}>
            <MaterialCommunityIcons name="web" size={24} color="#6b7280" />
            <Text style={styles.noDataText}>No site type data available</Text>
          </View>
        )}
      </Animated.View>

      {/* Side Menu Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isMenuOpen}
        onRequestClose={() => setIsMenuOpen(false)}
      >
        <View style={styles.overlay}>
          <TouchableOpacity
            style={styles.bottomSheetContainer}
            activeOpacity={1}
            onPress={() => setIsMenuOpen(false)}
          >
            <View style={styles.bottomSheet}>
              <View style={styles.handleBar} />
              <View style={styles.menuHeader}>
                <Text style={styles.sectionTitle}>Navigation</Text>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setIsMenuOpen(false)}
                >
                  <Feather name="x" size={20} color="#6b7280" />
                </TouchableOpacity>
              </View>
              <ScrollView style={styles.menuScroll} showsVerticalScrollIndicator={false}>
                {/* Analytics Section */}
                <View style={styles.menuSection}>
                  <Text style={styles.sectionTitle}>Analytics</Text>
                  {sideMenuItems.map((item, index) => (
                    <TouchableOpacity
                      key={index}
                      style={styles.menuItem}
                      onPress={() => handleMenuAction(item.action)}
                    >
                      <View style={styles.menuItemIcon}>
                        <MaterialCommunityIcons name={item.icon} size={24} color="#374151" />
                      </View>
                      <View style={styles.menuItemContent}>
                        <Text style={styles.menuItemText}>{item.title}</Text>
                        <Text style={styles.menuItemSubtitle}>
                          {index === 0 ? 'Main dashboard overview' :
                           index === 1 ? 'Comprehensive detection insights' :
                           index === 2 ? 'Website monitoring & stats' :
                           'User activity & interactions'}
                        </Text>
                      </View>
                      <MaterialCommunityIcons name="chevron-right" size={20} color="#9ca3af" />
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>
          </TouchableOpacity>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    paddingHorizontal: 20,
  },
  timeRangeContainer: {
    marginBottom: 24,
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    padding: 16,
  },
  timeRangeSelectorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  timeRangeSelectorTitle: {
    fontSize: 14,
    fontFamily: 'Poppins-SemiBold',
    color: '#374151',
  },
  timeRangeButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  timeRangeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    gap: 6,
  },
  timeRangeButtonActive: {
    backgroundColor: '#02B97F',
    borderColor: '#02B97F',
  },
  timeRangeText: {
    fontSize: 12,
    fontFamily: 'Poppins-SemiBold',
    color: '#6b7280',
  },
  timeRangeTextActive: {
    color: '#ffffff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    color: '#6b7280',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  errorText: {
    marginTop: 12,
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    color: '#ef4444',
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 16,
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: '#02B97F',
    borderRadius: 12,
  },
  retryText: {
    color: '#ffffff',
    fontSize: 14,
    fontFamily: 'Poppins-SemiBold',
  },
  overallStatsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
    gap: 8,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#f3f4f6',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    minHeight: 120,
  },
  statIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#E8F5F0',
    marginBottom: 12,
  },
  statContent: {
    flex: 1,
  },
  statValue: {
    fontSize: 24,
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
    marginBottom: 8,
  },
  statChangeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statChange: {
    fontSize: 12,
    fontFamily: 'Poppins-SemiBold',
  },
  sectionContainer: {
    marginBottom: 24,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#f3f4f6',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    color: '#374151',
  },
  sectionBadge: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  sectionBadgeText: {
    fontSize: 10,
    fontFamily: 'Poppins-SemiBold',
    color: '#6b7280',
    textTransform: 'uppercase',
  },
  chartLoadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  chartContainer: {
    alignItems: 'center',
  },
  chart: {
    borderRadius: 16,
  },
  noDataContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
    gap: 8,
  },
  noDataText: {
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    color: '#6b7280',
    textAlign: 'center',
  },
  flaggedWordsContainer: {
    gap: 12,
  },
  flaggedWordItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 12,
    gap: 12,
  },
  flaggedWordRank: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#02B97F',
    justifyContent: 'center',
    alignItems: 'center',
  },
  flaggedWordRankText: {
    fontSize: 14,
    fontFamily: 'Poppins-Bold',
    color: '#ffffff',
  },
  flaggedWordContent: {
    flex: 1,
  },
  flaggedWordText: {
    fontSize: 14,
    fontFamily: 'Poppins-SemiBold',
    color: '#111827',
    marginBottom: 2,
  },
  flaggedWordContext: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: '#6b7280',
  },
  flaggedWordStats: {
    alignItems: 'center',
  },
  flaggedWordCount: {
    fontSize: 16,
    fontFamily: 'Poppins-Bold',
    color: '#02B97F',
  },
  flaggedWordCountLabel: {
    fontSize: 10,
    fontFamily: 'Poppins-Medium',
    color: '#6b7280',
  },
  severityIndicator: {
    width: 8,
    height: 32,
    borderRadius: 4,
  },
  languageStatsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
    marginTop: 16,
  },
  languageStatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 8,
  },
  languageColorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  languageStatName: {
    fontSize: 12,
    fontFamily: 'Poppins-Medium',
    color: '#374151',
  },
  languageStatValue: {
    fontSize: 12,
    fontFamily: 'Poppins-Bold',
    color: '#02B97F',
  },
  severityStatsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
    marginTop: 16,
  },
  severityStatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 8,
  },
  severityColorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  severityStatName: {
    fontSize: 12,
    fontFamily: 'Poppins-Medium',
    color: '#374151',
  },
  severityStatValue: {
    fontSize: 12,
    fontFamily: 'Poppins-Bold',
    color: '#02B97F',
  },
  siteTypeStatsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
    marginTop: 16,
  },
  siteTypeStatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 8,
  },
  siteTypeColorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  siteTypeStatName: {
    fontSize: 12,
    fontFamily: 'Poppins-Medium',
    color: '#374151',
  },
  siteTypeStatValue: {
    fontSize: 12,
    fontFamily: 'Poppins-Bold',
    color: '#02B97F',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  bottomSheetContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'transparent',
  },
  bottomSheet: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 10,
  },
  handleBar: {
    width: 40,
    height: 4,
    backgroundColor: '#e5e7eb',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 15,
  },
  menuHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
    fontFamily: 'Poppins-SemiBold',
    color: '#374151',
    marginBottom: 12,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  menuItemIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  menuItemContent: {
    flex: 1,
  },
  menuItemText: {
    fontSize: 16,
    fontFamily: 'Poppins-Medium',
    color: '#111827',
    marginBottom: 2,
  },
  menuItemSubtitle: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: '#9ca3af',
  },
  closeButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
  },
  flaggedWordsLegend: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: 16,
    marginTop: 16,
    paddingHorizontal: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendText: {
    fontSize: 11,
    fontFamily: 'Poppins-Medium',
    color: '#374151',
  },
  barChartWrapper: {
    width: '100%',
    alignItems: 'center',
  },
  barChartScroll: {
    width: '100%',
  },
  barChartScrollContent: {
    paddingHorizontal: 10,
    alignItems: 'center',
  },
});

export default DetectionAnalyticsScreen;
