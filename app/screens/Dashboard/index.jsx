import { Feather } from '@expo/vector-icons';
import * as Print from 'expo-print';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import MainHeader from '../../components/common/MainHeader';
import api from '../../services/api';

const { width } = Dimensions.get('window');

function DashboardScreen({ navigation }) {
  // const { user } = useAuth(); // Get user from auth context
  const [selectedTimeRange, setSelectedTimeRange] = useState('Last 7 Days');


  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [dashboardData, setDashboardData] = useState({
    overview: null,
    chartData: null,
    userActivity: null,
  });



  // Detection chart configuration matching home screen theme
  const detectionChartConfig = {
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
    withHorizontalLabels: true,
    withVerticalLabels: false,
    withInnerLines: true,
    withOuterLines: false,
    withShadow: true,
    fillShadowGradient: '#02B97F',
    fillShadowGradientOpacity: 0.3,
  };

  const timeRanges = ['Today', 'Last 7 Days', 'Last Month', 'Last Year'];

  // Fetch dashboard data using the same pattern as home screen
  const fetchDashboardData = async (timeRangeParam = selectedTimeRange) => {
    setIsLoading(true);
    setError('');
    try {
      console.log('Fetching dashboard data for time range:', timeRangeParam);

      // Map time range to match server expectations
      const mappedTimeRange = timeRangeParam === 'Today' ? 'today' :
                             timeRangeParam === 'Last 7 Days' ? 'week' :
                             timeRangeParam === 'Last Month' ? 'month' :
                             timeRangeParam === 'Last Year' ? 'year' :
                             timeRangeParam.toLowerCase();

      console.log('Mapped time range:', mappedTimeRange);

      // Use detection-focused endpoints
      const yearParam = '';

      console.log('Making API calls to dashboard endpoints...');

      const [overviewRes, detectionChartRes, userActivityRes] = await Promise.all([
        // Get overview data with detection focus
        api.get(`/user-dashboard/overview?timeRange=${mappedTimeRange}${yearParam}`),
        // Get detection chart data (using user dashboard activity chart)
        api.get(`/user-dashboard/activity-chart?timeRange=${mappedTimeRange}${yearParam}`),
        // Get user activity data
        api.get(`/user-dashboard/user-activity?timeRange=${mappedTimeRange}${yearParam}`),
      ]);

      console.log('API calls successful:', {
        overview: overviewRes.data,
        chart: detectionChartRes.data,
        activity: userActivityRes.data
      });

      setDashboardData({
        overview: overviewRes.data,
        chartData: detectionChartRes.data,
        userActivity: userActivityRes.data,
      });
    } catch (err) {
      console.error('Dashboard API Error:', err);
      setError('Failed to load dashboard data. Please check server connection.');
      // Set default data on error
      setDashboardData({
        overview: {
          harmfulContentDetected: { value: '0', change: '+0%' },
          websitesMonitored: { value: '0', change: '+0' },
          protectionEffectiveness: { value: '95.0%', change: '+0%' },
        },
        chartData: {
          labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
          datasets: [
            { label: 'Protected', data: [0, 0, 0, 0, 0, 0, 0] },
            { label: 'Monitored', data: [0, 0, 0, 0, 0, 0, 0] },
          ],
        },

        userActivity: {
          activityBreakdown: [],
          recentActivity: [],
          totalActivities: 0
        },
      });
    } finally {
      setIsLoading(false);
    }
  };



  // Effect to load data on component mount and time range change
  useEffect(() => {
    fetchDashboardData(selectedTimeRange);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTimeRange]);

  // Prepare detection chart data based on detected words data
  const detectionChartData = dashboardData.chartData ? {
    labels: dashboardData.chartData.labels || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        data: dashboardData.chartData.datasets?.[0]?.data || [0, 0, 0, 0, 0, 0, 0],
        strokeWidth: 3,
        color: (opacity = 1) => `rgba(2, 185, 127, ${opacity})`,
        fillShadowGradient: '#02B97F',
        fillShadowGradientOpacity: 0.7,
        withDots: true,
      },
    ],
  } : {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        data: [0, 0, 0, 0, 0, 0, 0],
        strokeWidth: 3,
        color: (opacity = 1) => `rgba(2, 185, 127, ${opacity})`,
        fillShadowGradient: '#02B97F',
        fillShadowGradientOpacity: 0.7,
      },
    ],
  };

  // Prepare overview stats for display
  const overallStats = dashboardData.overview ? [
    {
      value: dashboardData.overview.harmfulContentDetected?.value || '0',
      label: 'Harmful Content Detected',
      change: dashboardData.overview.harmfulContentDetected?.change || '+0%',
      color: 'rgba(1, 82, 55, 1)',
      icon: 'shield-alert'
    },
    {
      value: dashboardData.overview.websitesMonitored?.value || '0',
      label: 'Websites Monitored',
      change: dashboardData.overview.websitesMonitored?.change || '+0',
      color: 'rgba(1, 82, 55, 1)',
      icon: 'web'
    },
    {
      value: dashboardData.overview.protectionEffectiveness?.value || '95%',
      label: 'Protection Effectiveness',
      change: dashboardData.overview.protectionEffectiveness?.change || '+0%',
      color: 'rgba(1, 82, 55, 1)',
      icon: 'shield-check'
    },
  ] : [];



  const menuOptions = [
    {
      icon: '🔍',
      title: 'Detection Analytics',
      subtitle: 'Comprehensive detection insights & patterns',
      color: '#f0fdf4',
      iconColor: '#02B97F',
      screen: 'DetectionAnalytics',
    },
    {
      icon: '🧼',
      title: 'What MURAi Caught',
      subtitle: 'Flagged words, trending terms & changes',
      color: '#fef2f2',
      iconColor: '#ef4444',
      screen: 'DetectionAnalytics',
    },
    {
      icon: '🌍',
      title: 'Where It Happened',
      subtitle: 'Top websites & monitoring stats',
      color: '#eff6ff',
      iconColor: '#3b82f6',
      screen: 'WebsiteAnalytics',
    },
    {
      icon: '👨‍👩‍👧‍👦',
      title: 'People & Activity',
      subtitle: 'User activity & alert interactions',
      color: '#fef3c7',
      iconColor: '#f59e0b',
      screen: 'UserActivityAnalytics',
    },
  ];

  const sideMenuItems = [
    { title: 'Dashboard Overview', icon: 'view-dashboard', action: () => setIsMenuOpen(false) },
    { title: 'Detection Analytics', icon: 'shield-search', action: () => navigation.navigate('DetectionAnalytics') },
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

  const handleTimeRangeChange = (range) => {
    if (range !== selectedTimeRange) {
      setSelectedTimeRange(range);
      // Show loading state immediately for better UX
      setIsLoading(true);
    }
  };

  const handlePrintReport = async () => {
    try {
      // Show loading alert
      Alert.alert('Generating Report', 'Fetching comprehensive analytics data...');

      // Fetch additional analytics data for comprehensive report
      const additionalData = await fetchComprehensiveAnalytics();

      // Generate HTML report with all data
      const htmlContent = generateReportHTML(additionalData);

      // Print the report
      await Print.printAsync({
        html: htmlContent,
        printerUrl: undefined, // Use default printer
      });

      Alert.alert('Success', 'Comprehensive analytics report has been sent to printer');
    } catch (error) {
      console.error('Print error:', error);
      Alert.alert('Error', 'Failed to generate report. Please try again.');
    }
  };

  const fetchComprehensiveAnalytics = async () => {
    try {
      const mappedTimeRange = selectedTimeRange === 'Today' ? 'today' :
                             selectedTimeRange === 'Per Week' ? 'week' :
                             selectedTimeRange === 'Per Months' ? 'month' : 'year';

      console.log('Fetching comprehensive analytics for timeRange:', mappedTimeRange);

      // Fetch comprehensive user-specific analytics with error handling for each endpoint
      const requests = [
        api.get(`/user-dashboard/detected-words?timeRange=${mappedTimeRange}&includeLanguage=true&includePatterns=true`).catch(err => {
          console.warn('Threat distribution fetch failed:', err);
          return { data: null };
        }),
        api.get(`/user-dashboard/websites?timeRange=${mappedTimeRange}`).catch(err => {
          console.warn('Website analytics fetch failed:', err);
          return { data: null };
        }),
        api.get(`/user-dashboard/user-activity?timeRange=${mappedTimeRange}`).catch(err => {
          console.warn('User activity fetch failed:', err);
          return { data: null };
        }),
        api.get('/home-stats').catch(err => {
          console.warn('Home stats fetch failed:', err);
          return { data: null };
        })
      ];

      const [
        threatDistributionRes,
        websiteAnalyticsRes,
        userActivityRes,
        homeStatsRes
      ] = await Promise.all(requests);

      const analyticsData = {
        threatDistribution: threatDistributionRes.data,
        websiteAnalytics: websiteAnalyticsRes.data,
        userActivity: userActivityRes.data,
        homeStats: homeStatsRes.data,
        timeRange: selectedTimeRange
      };

      console.log('Comprehensive analytics fetched:', analyticsData);
      return analyticsData;
    } catch (error) {
      console.error('Error fetching comprehensive analytics:', error);
      return null;
    }
  };

  const generateReportHTML = (additionalData = null) => {
    const currentDate = new Date().toLocaleDateString();
    const currentTime = new Date().toLocaleTimeString();
    
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>MURAi Analytics Report</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; border-bottom: 2px solid #02B97F; padding-bottom: 20px; margin-bottom: 30px; }
            .title { color: #02B97F; font-size: 24px; font-weight: bold; }
            .subtitle { color: #6b7280; font-size: 16px; }
            .section { margin-bottom: 30px; }
            .section-title { color: #1f2937; font-size: 20px; font-weight: bold; margin-bottom: 15px; }
            .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 20px; }
            .stat-card {
              background: #ffffff;
              padding: 20px;
              border-radius: 12px;
              border-left: 4px solid #02B97F;
              box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
              border: 1px solid #e5e7eb;
            }
            .stat-value { font-size: 28px; font-weight: bold; color: #1f2937; margin-bottom: 5px; }
            .stat-label { font-size: 14px; color: #6b7280; margin-top: 5px; font-weight: 500; }
            .chart-container { background: #ffffff; padding: 20px; border-radius: 8px; border: 1px solid #e5e7eb; margin-bottom: 20px; }
            .footer { text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="title">🛡️ MURAi Protection Report</div>
            <div class="subtitle">Personal Security Analytics & Insights</div>
            <div style="margin-top: 10px; color: #6b7280;">
              Generated on ${currentDate} at ${currentTime} | Period: ${selectedTimeRange}
            </div>
          </div>

          <div class="section">
            <div class="section-title">📊 Protection Overview</div>
            <div class="stats-grid">
              <div class="stat-card">
                <div class="stat-value">${dashboardData.overview?.harmfulContentDetected?.value || '0'}</div>
                <div class="stat-label">Threats Blocked</div>
                <div style="color: #02B97F; font-size: 12px; margin-top: 5px;">${dashboardData.overview?.harmfulContentDetected?.change || '+0%'}</div>
              </div>
              <div class="stat-card">
                <div class="stat-value">${dashboardData.overview?.websitesMonitored?.value || '0'}</div>
                <div class="stat-label">Sites Monitored</div>
                <div style="color: #02B97F; font-size: 12px; margin-top: 5px;">${dashboardData.overview?.websitesMonitored?.change || '+0'}</div>
              </div>
              <div class="stat-card">
                <div class="stat-value">${dashboardData.overview?.protectionEffectiveness?.value || '95%'}</div>
                <div class="stat-label">AI Accuracy</div>
                <div style="color: #02B97F; font-size: 12px; margin-top: 5px;">${dashboardData.overview?.protectionEffectiveness?.change || '+0%'}</div>
              </div>
              ${additionalData?.homeStats ? `
              <div class="stat-card">
                <div class="stat-value">${additionalData.homeStats.overallStats?.[0]?.totalThreatsBlocked || '0'}</div>
                <div class="stat-label">Lifetime Total</div>
                <div style="color: #6b7280; font-size: 12px; margin-top: 5px;">All Time</div>
              </div>
              ` : ''}
            </div>
          </div>

          <div class="section">
            <div class="section-title">📈 Activity Trends</div>
            <div class="chart-container">
              <div style="margin-bottom: 15px;">
                <strong>Time Period:</strong> ${selectedTimeRange}
              </div>
              <div style="background: #f8fafc; padding: 20px; border-radius: 8px; text-align: center;">
                <div style="color: #6b7280; margin-bottom: 10px;">Chart Data Summary</div>
                <div style="font-size: 18px; color: #1f2937;">
                  Total Detections: ${dashboardData.chartData?.datasets?.[0]?.data?.reduce((a, b) => a + b, 0) || 0}
                </div>
                <div style="font-size: 14px; color: #6b7280; margin-top: 5px;">
                  Peak Activity: ${Math.max(...(dashboardData.chartData?.datasets?.[0]?.data || [0]))}
                </div>
              </div>
            </div>
          </div>

          <div class="section">
            <div class="section-title">🔍 Key Insights</div>
            <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; border-left: 4px solid #02B97F;">
              <div style="font-weight: bold; color: #1f2937; margin-bottom: 10px;">Protection Status</div>
              <div style="color: #6b7280; line-height: 1.6;">
                • Your digital safety is being monitored 24/7<br>
                • Real-time threat detection is active<br>
                • Comprehensive website monitoring in place<br>
                • User activity tracking enabled
              </div>
            </div>
          </div>

          ${additionalData ? `
          <!-- Threat Distribution Analysis -->
          <div class="section">
            <div class="section-title">🎯 Threat Distribution Analysis</div>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-bottom: 20px;">
              <div style="background: #fef2f2; padding: 15px; border-radius: 8px; border-left: 4px solid #ef4444;">
                <div style="font-weight: bold; color: #dc2626;">High Severity</div>
                <div style="font-size: 24px; color: #dc2626;">${additionalData.threatDistribution?.severityDistribution?.high || 0}</div>
              </div>
              <div style="background: #fffbeb; padding: 15px; border-radius: 8px; border-left: 4px solid #f59e0b;">
                <div style="font-weight: bold; color: #d97706;">Medium Severity</div>
                <div style="font-size: 24px; color: #d97706;">${additionalData.threatDistribution?.severityDistribution?.medium || 0}</div>
              </div>
              <div style="background: #f0fdf4; padding: 15px; border-radius: 8px; border-left: 4px solid #02B97F;">
                <div style="font-weight: bold; color: #059669;">Low Severity</div>
                <div style="font-size: 24px; color: #059669;">${additionalData.threatDistribution?.severityDistribution?.low || 0}</div>
              </div>
            </div>
            <div style="background: #f8fafc; padding: 15px; border-radius: 8px;">
              <div style="font-weight: bold; margin-bottom: 10px;">Summary</div>
              <div>Total Unique Threats: <strong>${additionalData.threatDistribution?.totalUniqueThreats || 0}</strong></div>
              <div>Total Detections: <strong>${additionalData.threatDistribution?.totalDetections || 0}</strong></div>
            </div>
          </div>

          <!-- Website Analytics -->
          <div class="section">
            <div class="section-title">🌐 Website Analytics</div>
            ${additionalData.websiteAnalytics?.topWebsites ? `
            <div style="background: #ffffff; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
              <div style="background: #f8fafc; padding: 15px; border-bottom: 1px solid #e5e7eb;">
                <div style="font-weight: bold;">Top Monitored Websites</div>
              </div>
              ${additionalData.websiteAnalytics.topWebsites.slice(0, 5).map(site => `
                <div style="padding: 12px 15px; border-bottom: 1px solid #f3f4f6;">
                  <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div>
                      <div style="font-weight: bold; color: #1f2937;">${site.domain}</div>
                      <div style="font-size: 12px; color: #6b7280;">Risk Level: ${site.riskLevel.toUpperCase()}</div>
                    </div>
                    <div style="text-align: right;">
                      <div style="font-weight: bold; color: #ef4444;">${site.detectionCount} threats</div>
                      <div style="font-size: 12px; color: #6b7280;">${site.accuracy}% accuracy</div>
                    </div>
                  </div>
                </div>
              `).join('')}
            </div>
            ` : ''}
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 15px; margin-top: 15px;">
              <div style="background: #f8fafc; padding: 15px; border-radius: 8px; text-align: center;">
                <div style="font-size: 20px; font-weight: bold; color: #1f2937;">${additionalData.websiteAnalytics?.totalWebsites || 0}</div>
                <div style="color: #6b7280; font-size: 14px;">Total Sites</div>
              </div>
              <div style="background: #f8fafc; padding: 15px; border-radius: 8px; text-align: center;">
                <div style="font-size: 20px; font-weight: bold; color: #ef4444;">${additionalData.websiteAnalytics?.monitoringStats?.highRiskSites || 0}</div>
                <div style="color: #6b7280; font-size: 14px;">High Risk</div>
              </div>
              <div style="background: #f8fafc; padding: 15px; border-radius: 8px; text-align: center;">
                <div style="font-size: 20px; font-weight: bold; color: #02B97F;">${additionalData.websiteAnalytics?.monitoringStats?.aiAccuracy || 0}%</div>
                <div style="color: #6b7280; font-size: 14px;">AI Accuracy</div>
              </div>
            </div>
          </div>

          <!-- User Activity Analytics -->
          <div class="section">
            <div class="section-title">👤 User Activity Analytics</div>
            ${additionalData.userActivity?.activityBreakdown ? `
            <div style="background: #ffffff; border: 1px solid #e5e7eb; border-radius: 8px; padding: 15px; margin-bottom: 15px;">
              <div style="font-weight: bold; margin-bottom: 10px;">Activity Breakdown</div>
              ${additionalData.userActivity.activityBreakdown.map(activity => `
                <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #f3f4f6;">
                  <span style="color: #1f2937;">${activity._id}</span>
                  <span style="font-weight: bold; color: #02B97F;">${activity.count}</span>
                </div>
              `).join('')}
            </div>
            ` : ''}
            <div style="background: #f8fafc; padding: 15px; border-radius: 8px;">
              <div style="font-weight: bold; margin-bottom: 10px;">Activity Summary</div>
              <div>Total Activities: <strong>${additionalData.userActivity?.totalActivities || 0}</strong></div>
              <div>Recent Activity Count: <strong>${additionalData.userActivity?.recentActivity?.length || 0}</strong></div>
            </div>
          </div>
          ` : `
          <div class="section">
            <div class="section-title">📊 Enhanced Analytics</div>
            <div style="background: #fffbeb; padding: 20px; border-radius: 8px; border-left: 4px solid #f59e0b;">
              <div style="font-weight: bold; color: #92400e; margin-bottom: 10px;">Note</div>
              <div style="color: #92400e;">
                Enhanced analytics data is being processed. Basic protection metrics are shown above.
                For detailed threat analysis, website monitoring, and activity insights, please ensure you have recent activity data.
              </div>
            </div>
          </div>
          `}

          <!-- Report Summary -->
          <div class="section">
            <div class="section-title">📋 Report Summary</div>
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px;">
              <div style="font-size: 18px; font-weight: bold; margin-bottom: 15px;">Protection Status: ACTIVE</div>
              <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px;">
                <div>
                  <div style="opacity: 0.9;">Current Period</div>
                  <div style="font-weight: bold;">${selectedTimeRange}</div>
                </div>
                <div>
                  <div style="opacity: 0.9;">Monitoring Status</div>
                  <div style="font-weight: bold;">24/7 Active</div>
                </div>
                <div>
                  <div style="opacity: 0.9;">Protection Level</div>
                  <div style="font-weight: bold;">Maximum</div>
                </div>
                <div>
                  <div style="opacity: 0.9;">Report Generated</div>
                  <div style="font-weight: bold;">${currentTime}</div>
                </div>
              </div>
            </div>
          </div>

          <!-- Recommendations -->
          ${additionalData ? `
          <div class="section">
            <div class="section-title">💡 Recommendations</div>
            <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; border-left: 4px solid #02B97F;">
              <div style="font-weight: bold; color: #1f2937; margin-bottom: 15px;">Security Recommendations</div>
              <ul style="color: #374151; line-height: 1.8; margin: 0; padding-left: 20px;">
                ${additionalData.websiteAnalytics?.monitoringStats?.highRiskSites > 0 ?
                  `<li>⚠️ You have ${additionalData.websiteAnalytics.monitoringStats.highRiskSites} high-risk sites. Consider reviewing your browsing habits.</li>` :
                  `<li>✅ No high-risk sites detected. Great job maintaining safe browsing habits!</li>`
                }
                ${additionalData.threatDistribution?.severityDistribution?.high > 0 ?
                  `<li>🔴 ${additionalData.threatDistribution.severityDistribution.high} high-severity threats detected. Stay vigilant.</li>` :
                  `<li>✅ No high-severity threats detected in this period.</li>`
                }
                <li>🛡️ Continue using MURAi for comprehensive protection</li>
                <li>📊 Review this report regularly to track your digital safety</li>
                <li>🔄 Keep your protection settings updated</li>
              </ul>
            </div>
          </div>
          ` : ''}

          <div class="footer">
            <div style="margin-bottom: 10px;">
              <strong>🛡️ MURAi Protection System</strong>
            </div>
            <div style="font-size: 14px; margin-bottom: 5px;">
              Comprehensive Digital Safety Analytics & Real-time Monitoring
            </div>
            <div style="font-size: 12px; color: #9ca3af;">
              This report contains user-specific data for the selected time period.
              For questions or support, contact the MURAi team.
            </div>
          </div>
        </body>
      </html>
    `;
  };


  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <MainHeader
        title="MURAi Dashboard"
        subtitle="Real-time protection insights"
        rightActions={[
          {
            icon: 'printer',
            iconType: 'material',
            color: '#02B97F',
            onPress: handlePrintReport
          },
          {
            icon: 'list',
            iconType: 'feather',
            onPress: toggleMenu
          }
        ]}
        style={{ paddingHorizontal: 0 }}
      />

      {/* Enhanced Time Range Selector */}
      <View style={styles.timeRangeContainer}>
        <View style={styles.timeRangeSelectorHeader}>
          <MaterialCommunityIcons name="clock-outline" size={20} color="#6b7280" />
          <Text style={styles.timeRangeSelectorTitle}>Time Period</Text>
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
        </ScrollView>
      </View>



      {/* Overall Stats */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#02B97F" />
          <Text style={styles.loadingText}>Loading dashboard data...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <MaterialCommunityIcons name="alert-circle-outline" size={24} color="#ef4444" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => fetchDashboardData(selectedTimeRange)}
          >
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.overallStatsContainer}>
          {overallStats.map((stat, index) => (
            <View key={index} style={styles.statCard}>
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
            </View>
          ))}
        </View>
      )}

      {/* Detection Trends Chart with Horizontal Scroll */}
      <View style={styles.chartContainer}>
        <View style={styles.chartHeader}>
          <View style={styles.chartTitleContainer}>
            <MaterialCommunityIcons name="shield-search" size={24} color="#02B97F" />
            <Text style={styles.chartTitle}>
              {selectedTimeRange === 'Today' ? 'Today\'s Activity' :
               selectedTimeRange === 'Last 7 Days' ? 'Weekly Overview' :
               selectedTimeRange === 'Last Month' ? 'Monthly Trends' :
               'Yearly Overview'}
            </Text>
          </View>
          <View style={styles.chartPeriodBadge}>
            <Text style={styles.chartPeriodText}>{selectedTimeRange}</Text>
          </View>
        </View>

        {/* Detection Stats Summary */}
        <View style={styles.chartStatsContainer}>
          <View style={styles.chartStatItem}>
            <MaterialCommunityIcons name="shield-alert" size={20} color="#ef4444" />
            <Text style={styles.chartStatValue}>
              {isLoading ? '...' : detectionChartData.datasets[0].data.reduce((a, b) => a + b, 0)}
            </Text>
            <Text style={styles.chartStatLabel}>Total Detections</Text>
          </View>
          <View style={styles.chartStatDivider} />
          <View style={styles.chartStatItem}>
            <MaterialCommunityIcons name="trending-up" size={20} color="#02B97F" />
            <Text style={styles.chartStatValue}>
              {isLoading ? '...' : Math.max(...detectionChartData.datasets[0].data)}
            </Text>
            <Text style={styles.chartStatLabel}>
              {selectedTimeRange === 'Today' ? 'Peak Hour' :
               selectedTimeRange === 'Last 7 Days' ? 'Peak Day' :
               selectedTimeRange === 'Last Month' ? 'Peak Month' :
               'Peak Year'}
            </Text>
          </View>
        </View>

        {/* Horizontally Scrollable Detection Chart */}
        {isLoading ? (
          <View style={styles.chartLoadingContainer}>
            <ActivityIndicator size="large" color="#02B97F" />
            <Text style={styles.chartLoadingText}>Loading {selectedTimeRange.toLowerCase()} data...</Text>
          </View>
        ) : (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.chartScrollContainer}
            contentContainerStyle={styles.chartScrollContent}
          >
            <LineChart
              data={detectionChartData}
              width={Math.max(width - 40, detectionChartData.labels.length * 80)}
              height={200}
              chartConfig={detectionChartConfig}
              bezier
              style={styles.chart}
              withDots={true}
              withShadow={true}
              withFill={true}
              withInnerLines={false}
              withOuterLines={false}
              withVerticalLines={false}
              withHorizontalLines={false}
            />
          </ScrollView>
        )}

        {/* Detection Legend */}
        <View style={styles.chartLegend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#02B97F' }]} />
            <Text style={styles.legendText}>Harmful Content Detected</Text>
            <View style={styles.legendBadge}>
              <Text style={styles.legendBadgeText}>
                {selectedTimeRange}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Analytics Menu */}
      <View style={styles.menuContainer}>
        <Text style={styles.menuTitle}>Analytics Sections</Text>
        {menuOptions.map((option, index) => (
          <TouchableOpacity
            key={index}
            style={styles.menuItem}
            onPress={() => navigation.navigate(option.screen)}
          >
            <View style={[styles.menuIcon, { backgroundColor: option.color }]}>
              <Text style={styles.menuEmoji}>{option.icon}</Text>
            </View>
            <View style={styles.menuContent}>
              <Text style={styles.menuItemTitle}>{option.title}</Text>
              <Text style={styles.menuItemSubtitle}>{option.subtitle}</Text>
            </View>
            <Feather name="chevron-right" size={20} color="#9ca3af" />
          </TouchableOpacity>
        ))}
      </View>



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

              {/* Header */}
              <View style={styles.menuHeader}>
                <Text style={styles.menuTitle}>MURAi Dashboard</Text>
                <TouchableOpacity style={styles.closeButton} onPress={toggleMenu}>
                  <MaterialCommunityIcons name="close" size={24} color="#374151" />
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
                           index === 1 ? 'Flagged words & trending terms' :
                           index === 2 ? 'Website monitoring & stats' :
                           'User activity & interactions'}
                        </Text>
                      </View>
                      <MaterialCommunityIcons name="chevron-right" size={20} color="#9ca3af" />
                    </TouchableOpacity>
                  ))}
                </View>
                
                {/* Debug: Show menu items count */}
                <View style={styles.debugSection}>
                  <Text style={styles.debugText}>Menu Items: {sideMenuItems.length}</Text>
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
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  menuButton: {
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
  greeting: {
    fontSize: 16,
    fontFamily: 'Poppins-Medium',
    color: '#111827',
    marginBottom: 4,
  },
  statusBar: {
    alignItems: 'flex-end',
  },
  timeText: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#374151',
  },
  headerSection: {
    marginBottom: 20,
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
  timeRangeScrollContainer: {
    marginHorizontal: -4,
  },
  timeRangeScrollContent: {
    paddingHorizontal: 4,
    gap: 8,
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
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    gap: 6,
    minWidth: 120,
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
  yearSelectorContainer: {
    marginBottom: 24,
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    padding: 16,
  },
  yearSelectorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  yearSelectorTitle: {
    fontSize: 14,
    fontFamily: 'Poppins-SemiBold',
    color: '#374151',
  },
  yearScrollContainer: {
    marginHorizontal: -4,
  },
  yearButtonsContainer: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 4,
  },
  yearButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    minWidth: 80,
    alignItems: 'center',
  },
  yearButtonActive: {
    backgroundColor: '#02B97F',
    borderColor: '#02B97F',
  },
  yearText: {
    fontSize: 12,
    fontFamily: 'Poppins-SemiBold',
    color: '#6b7280',
  },
  yearTextActive: {
    color: '#ffffff',
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
    lineHeight: 12,
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
  chartContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
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
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  chartTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  chartTitle: {
    fontSize: 18,
    fontFamily: 'Poppins-SemiBold',
    color: '#111827',
  },
  chartPeriodBadge: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  chartPeriodText: {
    fontSize: 12,
    fontFamily: 'Poppins-Medium',
    color: '#6b7280',
  },
  chartStatsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  chartStatItem: {
    alignItems: 'center',
    flex: 1,
  },
  chartStatValue: {
    fontSize: 24,
    fontFamily: 'Poppins-Bold',
    color: '#111827',
    marginBottom: 4,
  },
  chartStatLabel: {
    fontSize: 12,
    fontFamily: 'Poppins-Medium',
    color: '#6b7280',
    textAlign: 'center',
  },
  chartStatDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#e5e7eb',
    marginHorizontal: 16,
  },
  chartScrollContainer: {
    marginBottom: 20,
  },
  chartScrollContent: {
    paddingRight: 20,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  chartLoadingContainer: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    marginBottom: 20,
  },
  chartLoadingText: {
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    color: '#6b7280',
    marginTop: 12,
  },
  viewAllText: {
    fontSize: 14,
    color: '#3b82f6',
    fontFamily: 'Poppins-SemiBold',
  },
  menuContainer: {
    marginBottom: 24,
  },
  menuTitle: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    color: '#111827',
    marginBottom: 16,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#f3f4f6',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 2,
    minHeight: 60,
  },
  menuIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  menuEmoji: {
    fontSize: 24,
  },
  menuContent: {
    flex: 1,
  },
  menuItemTitle: {
    fontSize: 14,
    fontFamily: 'Poppins-SemiBold',
    color: '#111827',
    marginBottom: 2,
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
    marginBottom: 20,
  },
  errorText: {
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    color: '#ef4444',
    marginTop: 12,
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#ef4444',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryText: {
    color: '#ffffff',
    fontSize: 14,
    fontFamily: 'Poppins-SemiBold',
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 10,
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
  menuScroll: {
    flex: 1,
    paddingBottom: 20,
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
  menuItemIcon: {
    width: 48,
    height: 48,
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
    marginLeft: 16,
    marginBottom: 4,
  },
  menuItemSubtitle: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: '#9ca3af',
    marginLeft: 16,
  },
  closeButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
  },
  chartLegend: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    paddingHorizontal: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    flex: 1,
    marginHorizontal: 4,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  legendText: {
    fontSize: 11,
    fontFamily: 'Poppins-Medium',
    color: '#6b7280',
    flex: 1,
  },
  legendBadge: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginLeft: 4,
  },
  legendBadgeText: {
    fontSize: 10,
    fontFamily: 'Poppins-Bold',
    color: '#374151',
  },
  insightsTitle: {
    fontSize: 16,
    fontFamily: 'Poppins-Medium',
    color: 'rgba(81, 7, 192, 1)',
    marginBottom: 8,
  },
  insightsSubtitle: {
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    color: 'rgba(81, 7, 192, 0.7)',
    marginBottom: 12,
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
});

export default DashboardScreen;