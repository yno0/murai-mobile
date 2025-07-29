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

  // Dynamic chart configuration generator
  const createChartConfig = (dataSize = 1, type = 'default') => {
    // Iterative scaling based on data complexity
    const complexity = Math.min(dataSize / 10, 1); // 0 to 1 scale
    const baseOpacity = 0.7 + (complexity * 0.3); // More data = more opacity
    const strokeWidth = 0.5 + (complexity * 1.5); // More data = thicker lines

    return {
      backgroundColor: 'transparent',
      backgroundGradientFrom: '#f8fafc',
      backgroundGradientTo: '#f8fafc',
      decimalPlaces: 0,
      color: (opacity = 1) => `rgba(2, 185, 127, ${baseOpacity * opacity})`,
      labelColor: (opacity = 1) => `rgba(107, 114, 128, ${opacity})`,
      style: {
        borderRadius: 16,
      },
      propsForDots: {
        r: Math.max(2, 4 - (complexity * 2)).toString(), // Smaller dots for complex data
        strokeWidth: '2',
        stroke: '#ffffff',
      },
      propsForBackgroundLines: {
        strokeWidth: strokeWidth,
        stroke: `rgba(241, 245, 249, ${0.5 + complexity * 0.5})`,
        strokeDasharray: complexity > 0.5 ? '3,3' : '5,5', // Denser dashes for complex data
      },
      // Iterative font sizing based on data density
      propsForLabels: {
        fontSize: Math.max(8, 12 - (dataSize * 0.2)),
      },
    };
  };

  // Default chart config for backward compatibility
  const chartConfig = createChartConfig(5, 'default');

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

      const [overviewRes, detectedWordsRes, threatDistributionRes] = await Promise.all([
        // Get overview data for summary statistics
        api.get(`/user-dashboard/overview?timeRange=${mappedTimeRange}`).catch(() => ({
          data: { harmfulContentDetected: { value: '0' }, websitesMonitored: { value: '0' }, protectionEffectiveness: { value: '0%' } }
        })),
        // Get detected words with language and pattern information
        api.get(`/user-dashboard/detected-words?timeRange=${mappedTimeRange}&includeLanguage=true&includePatterns=true`).catch(() => ({
          data: { detectedWords: [], totalCount: 0 }
        })),
        // Get threat distribution with URL deduplication
        api.get(`/user-dashboard/threat-distribution?timeRange=${mappedTimeRange}`).catch(() => ({
          data: {
            severityDistribution: { low: 0, medium: 0, high: 0 },
            languageDistribution: {},
            patternDistribution: {},
            siteTypeDistribution: {},
            totalUniqueThreats: 0,
            totalDetections: 0
          }
        }))
      ]);

      const overview = overviewRes.data;
      const detectedWords = detectedWordsRes.data.detectedWords || [];
      const totalCount = detectedWordsRes.data.totalCount || 0;
      const threatDistribution = threatDistributionRes.data;

      // Use server-calculated threat distribution (already deduplicated by URL)
      const languageCount = threatDistribution.languageDistribution || {};
      const patternCount = threatDistribution.patternDistribution || {};
      const severityCount = threatDistribution.severityDistribution || { low: 0, medium: 0, high: 0 };
      const siteTypeCount = threatDistribution.siteTypeDistribution || {};

      // Calculate summary statistics from detected words
      const avgAccuracy = detectedWords.length > 0
        ? detectedWords.reduce((sum, word) => sum + (word.accuracy || 0), 0) / detectedWords.length * 100
        : 0;
      const avgResponseTime = detectedWords.length > 0
        ? detectedWords.reduce((sum, word) => sum + (word.responseTime || 0), 0) / detectedWords.length
        : 0;

      // Create summary object compatible with existing UI
      const summary = {
        totalCount: totalCount,
        uniqueThreats: threatDistribution.totalUniqueThreats || 0,
        avgAccuracy: avgAccuracy,
        avgResponseTime: avgResponseTime,
        topWords: Object.entries(patternCount)
          .sort(([,a], [,b]) => b - a)
          .slice(0, 10)
          .map(([word, count]) => ({ word, count })),
        recentDetections: detectedWords.slice(0, 10)
      };

      // Convert to chart format with iterative scaling
      const languageDistribution = createPieChartData(languageCount, 'language');
      const trendPatterns = createBarChartData(patternCount, 'pattern');
      const severityAnalysis = createPieChartData(severityCount, 'severity');
      const siteTypeAnalysis = createPieChartData(siteTypeCount, 'sitetype');

      // Debug logging
      console.log('Final Chart Data:');
      console.log('Language Distribution:', languageDistribution);
      console.log('Trend Patterns:', trendPatterns);
      console.log('Severity Analysis:', severityAnalysis);
      console.log('Site Type Analysis:', siteTypeAnalysis);

      setDetectionData({
        flaggedWords: { ...summary },
        languageDistribution,
        trendPatterns,
        severityAnalysis,
        siteTypeAnalysis,
        totalDetections: totalCount,
        detectedWords
      });
    } catch (err) {
      console.error('Detection analytics error:', err);
      setError('Failed to load detection analytics. Please check server connection.');
      // Set default data on error
      setDetectionData({
        flaggedWords: { topWords: [], recentDetections: [], totalCount: 0, avgAccuracy: 0, avgResponseTime: 0 },
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

  // Dynamic color generation based on data intensity
  const generateIterativeColors = (dataCount, baseHue = 180, type = 'pie') => {
    const colors = [];
    for (let i = 0; i < dataCount; i++) {
      if (type === 'severity') {
        // Severity-specific color progression: green -> yellow -> red
        const intensity = i / Math.max(dataCount - 1, 1);
        const hue = 120 - (intensity * 120); // 120 (green) to 0 (red)
        const saturation = 70 + (intensity * 30); // 70% to 100%
        const lightness = 50 + (intensity * 10); // 50% to 60%
        colors.push(`hsl(${hue}, ${saturation}%, ${lightness}%)`);
      } else if (type === 'language') {
        // Language-specific color progression: cool to warm
        const hue = (baseHue + (i * 60)) % 360; // Spread across color wheel
        const saturation = 65 + (i * 5); // Gradually increase saturation
        const lightness = 55 - (i * 3); // Gradually decrease lightness
        colors.push(`hsl(${hue}, ${Math.min(saturation, 85)}%, ${Math.max(lightness, 35)}%)`);
      } else {
        // Default iterative progression
        const hue = (baseHue + (i * 45)) % 360;
        const saturation = 60 + (i * 8);
        const lightness = 50 + (i * 5);
        colors.push(`hsl(${hue}, ${Math.min(saturation, 90)}%, ${Math.min(lightness, 70)}%)`);
      }
    }
    return colors;
  };

  // Create pie chart data with iterative scaling
  const createPieChartData = (dataObj, type = 'default') => {
    const entries = Object.entries(dataObj);
    if (entries.length === 0) {
      return [];
    }

    const sortedEntries = entries.sort(([,a], [,b]) => b - a).slice(0, 6);
    const totalValue = sortedEntries.reduce((sum, [,count]) => sum + count, 0);
    const colors = generateIterativeColors(sortedEntries.length,
      type === 'severity' ? 120 : type === 'language' ? 240 : 180, type);

    return sortedEntries.map(([name, count], index) => {
      const percentage = totalValue > 0 ? Math.round((count / totalValue) * 100) : 0;
      const intensity = count / Math.max(...sortedEntries.map(([,c]) => c));

      return {
        name,
        population: count,
        percentage,
        color: colors[index],
        legendFontColor: '#374151',
        legendFontSize: Math.max(10, 12 - (index * 0.5)), // Iterative font sizing
        intensity: intensity // For potential future use
      };
    });
  };

  // Create bar chart data with iterative scaling and colors
  const createBarChartData = (dataObj, type = 'pattern') => {
    const entries = Object.entries(dataObj).sort(([,a], [,b]) => b - a).slice(0, 8);
    if (entries.length === 0) {
      return {
        labels: ['No Data'],
        datasets: [{
          data: [0],
          color: (opacity = 1) => `rgba(156, 163, 175, ${opacity})`,
        }]
      };
    }

    const maxValue = Math.max(...entries.map(([,count]) => count));
    const colors = generateIterativeColors(entries.length,
      type === 'pattern' ? 300 : 180, 'bar');

    return {
      labels: entries.map(([name]) => name.length > 8 ? name.substring(0, 8) + '...' : name),
      datasets: [{
        data: entries.map(([,count]) => count),
        colors: entries.map((_, index) => {
          const intensity = entries[index][1] / maxValue;
          return (opacity = 1) => {
            // Convert HSL color to rgba with iterative opacity
            const baseOpacity = 0.7 + (intensity * 0.3); // 0.7 to 1.0 based on value
            return colors[index].replace('hsl', 'hsla').replace(')', `, ${baseOpacity * opacity})`);
          };
        }),
      }]
    };
  };

  // Create flagged words bar chart with iterative scaling
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

    const topWords = flaggedWords.topWords.slice(0, 8);
    const maxCount = Math.max(...topWords.map(word => word.count));
    const colors = generateIterativeColors(topWords.length, 0, 'words'); // Red-based for flagged words

    return {
      labels: topWords.map(word => word.word.length > 8 ? word.word.substring(0, 8) + '...' : word.word),
      datasets: [{
        data: topWords.map(word => word.count),
        colors: topWords.map((word, index) => {
          const intensity = word.count / maxCount;
          const baseOpacity = 0.6 + (intensity * 0.4); // More intense = more opaque
          return (opacity = 1) => {
            return colors[index].replace('hsl', 'hsla').replace(')', `, ${baseOpacity * opacity})`);
          };
        }),
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
      color: 'rgba(2, 185, 127, 1)',
      icon: 'shield-alert'
    },
    {
      value: detectionData.flaggedWords.uniqueThreats?.toString() || '0',
      label: 'Unique Threats',
      color: 'rgba(239, 68, 68, 1)',
      icon: 'alert-triangle'
    },
    {
      value: Math.round(detectionData.flaggedWords.avgAccuracy || 0) + '%',
      label: 'Accuracy Rate',
      color: 'rgba(16, 185, 129, 1)',
      icon: 'target'
    },
  ] : [];

  const sideMenuItems = [
    { title: 'Dashboard Overview', icon: 'view-dashboard', action: () => navigation.navigate('DashboardMain') },
    { title: 'Detection Analytics', icon: 'shield-search', action: () => setIsMenuOpen(false) },
    { title: 'Where It Happened', icon: 'web', action: () => navigation.navigate('WebsiteAnalytics') },

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
            icon: 'list',
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
          <MaterialCommunityIcons name="clock-outline" size={20} color="#02B97F" />
          <Text style={styles.timeRangeSelectorTitle}>Select Time Period</Text>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.timeRangeScrollContainer}
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
              activeOpacity={0.7}
            >
              {isLoading && selectedTimeRange === range ? (
                <View style={styles.timeRangeLoadingContainer}>
                  <ActivityIndicator size="small" color="#ffffff" />
                </View>
              ) : (
                <View style={[
                  styles.timeRangeIconContainer,
                  selectedTimeRange === range && { backgroundColor: 'rgba(255, 255, 255, 0.2)' }
                ]}>
                  <MaterialCommunityIcons
                    name={
                      range === 'Today' ? 'calendar-today' :
                      range === 'Last 7 Days' ? 'calendar-week' :
                      range === 'Last Month' ? 'calendar-month' :
                      'calendar-range'
                    }
                    size={18}
                    color={selectedTimeRange === range ? '#ffffff' : '#6b7280'}
                  />
                </View>
              )}
              <Text style={[
                styles.timeRangeText,
                selectedTimeRange === range && styles.timeRangeTextActive,
              ]}
              numberOfLines={1}>
                {range}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
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
            <Text style={styles.sectionBadgeText}>Unique URLs</Text>
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
              height={200}
              chartConfig={createChartConfig(detectionData.languageDistribution?.length || 1, 'pie')}
              accessor="population"
              backgroundColor="transparent"
              paddingLeft="0"
              center={[0, 0]}
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
                height={200 + (detectionData.trendPatterns.labels.length * 2)} // Iterative height
                chartConfig={createChartConfig(detectionData.trendPatterns.labels.length, 'bar')}
                verticalLabelRotation={Math.min(45, 15 + (detectionData.trendPatterns.labels.length * 3))} // Iterative rotation
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
            <Text style={styles.sectionTitle}>Threat Distribution</Text>
          </View>
          <View style={styles.sectionBadge}>
            <Text style={styles.sectionBadgeText}>Unique URLs</Text>
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
              height={200}
              chartConfig={createChartConfig(detectionData.severityAnalysis?.length || 1, 'severity')}
              accessor="population"
              backgroundColor="transparent"
              paddingLeft="0"
              center={[0, 0]}
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
            <Text style={styles.sectionBadgeText}>Unique URLs</Text>
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
              height={200}
              chartConfig={chartConfig}
              accessor="population"
              backgroundColor="transparent"
              paddingLeft="0"
              center={[0, 0]}
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

      {/* Bottom Sheet Menu */}
      <Modal
        visible={isMenuOpen}
        transparent={true}
        animationType="slide"
        onRequestClose={toggleMenu}
        statusBarTranslucent={true}
      >
        <View style={styles.overlay}>
          <TouchableOpacity style={styles.overlayTouchable} onPress={toggleMenu} />
          <View style={styles.bottomSheetContainer}>
            <View style={styles.bottomSheet}>
              {/* Handle Bar */}
              <View style={styles.handleBar} />

              {/* Close Button */}
              <View style={styles.menuHeader}>
                <View style={styles.menuHeaderContent} />
                <TouchableOpacity style={styles.closeButton} onPress={toggleMenu}>
                  <MaterialCommunityIcons name="close" size={20} color="#6b7280" />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.menuScroll} showsVerticalScrollIndicator={false}>
                {/* Analytics Menu Items */}
                <View style={styles.menuSection}>
                  {sideMenuItems.map((item, index) => (
                    <TouchableOpacity
                      key={index}
                      style={styles.menuItem}
                      onPress={() => handleMenuAction(item.action)}
                    >
                      <View style={[styles.menuItemIcon, { backgroundColor: '#E8F5F0' }]}>
                        <MaterialCommunityIcons name={item.icon} size={22} color="#02B97F" />
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
                      <MaterialCommunityIcons name="chevron-right" size={18} color="#02B97F" />
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>
          </View>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 16,
    backgroundColor: '#ffffff',
    borderWidth: 2,
    borderColor: '#e5e7eb',
    gap: 8,
    minWidth: 130,
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  timeRangeButtonActive: {
    backgroundColor: '#02B97F',
    borderColor: '#02B97F',
    shadowColor: '#02B97F',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  timeRangeText: {
    fontSize: 13,
    fontFamily: 'Poppins-SemiBold',
    color: '#6b7280',
  },
  timeRangeTextActive: {
    color: '#ffffff',
  },
  timeRangeIconContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timeRangeLoadingContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
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
  overlayTouchable: {
    flex: 1,
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
    paddingBottom: 40,
    maxHeight: '90%',
    minHeight: 400,
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
  menuHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  menuTitle: {
    fontSize: 18,
    fontFamily: 'Poppins-SemiBold',
    color: '#111827',
  },
  menuScroll: {
    flex: 1,
    paddingBottom: 20,
  },
  menuSection: {
    marginBottom: 20,
  },

  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  menuItemIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
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
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 18,
    backgroundColor: '#f8fafc',
  },
  debugSection: {
    padding: 16,
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    marginTop: 16,
  },
  debugText: {
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    color: '#6b7280',
    textAlign: 'center',
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
  timeRangeScrollContainer: {
    flexDirection: 'row',
    marginTop: 12,
  },
  timeRangeScrollContent: {
    alignItems: 'center',
  },
});

export default DetectionAnalyticsScreen;
