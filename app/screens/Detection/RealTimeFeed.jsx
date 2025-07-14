import React, { useEffect, useRef } from "react";
import { Animated, Dimensions, Platform, ScrollView, Text, View } from "react-native";
import { BarChart, LineChart, PieChart } from 'react-native-chart-kit';
import Header from "../../components/common/Header";
import { COLORS } from "../../constants/theme";

export default function RealTimeFeed() {
  const BG = COLORS.BG;
  const CARD_BG = COLORS.CARD_BG;
  const ACCENT = COLORS.ACCENT;
  const TEXT_MAIN = COLORS.TEXT_MAIN;
  const TEXT_SECONDARY = COLORS.TEXT_SECONDARY;

  const screenWidth = Dimensions.get('window').width;
  const horizontalPadding = 16;
  const maxCardWidth = 500;
  const chartWidth = Math.min(screenWidth - horizontalPadding * 2 - 32, maxCardWidth - 32);

  // 1. Trend Over Time (Line Chart)
  const trendData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      { data: [5, 8, 6, 10, 7, 4, 9] }
    ]
  };

  // 2. Category Breakdown (Pie Chart)
  const categoryPie = [
    { name: 'Spam', count: 20, color: '#f59e0b', legendFontColor: TEXT_MAIN, legendFontSize: 14 },
    { name: 'Hate', count: 12, color: '#ef4444', legendFontColor: TEXT_MAIN, legendFontSize: 14 },
    { name: 'Profanity', count: 8, color: '#6366f1', legendFontColor: TEXT_MAIN, legendFontSize: 14 },
    { name: 'Other', count: 5, color: '#34d399', legendFontColor: TEXT_MAIN, legendFontSize: 14 },
  ];

  // 3. Top Offenders (Bar Chart)
  const offendersData = {
    labels: ['UserA', 'UserB', 'UserC', 'UserD'],
    datasets: [
      { data: [10, 7, 5, 3] }
    ]
  };

  // 4. Website Breakdown (Bar Chart)
  const websiteData = {
    labels: ['siteA.com', 'siteB.com', 'siteC.com', 'siteD.com'],
    datasets: [
      { data: [8, 6, 4, 2] }
    ]
  };

  // 5. Action Outcomes (Pie Chart)
  const actionPie = [
    { name: 'Flagged', count: 15, color: '#f59e0b', legendFontColor: TEXT_MAIN, legendFontSize: 14 },
    { name: 'Blocked', count: 7, color: '#ef4444', legendFontColor: TEXT_MAIN, legendFontSize: 14 },
    { name: 'Warned', count: 10, color: '#6366f1', legendFontColor: TEXT_MAIN, legendFontSize: 14 },
    { name: 'Ignored', count: 13, color: '#34d399', legendFontColor: TEXT_MAIN, legendFontSize: 14 },
  ];

  // 6. Time of Day Analysis (Bar Chart)
  const timeOfDayData = {
    labels: ['0-4', '4-8', '8-12', '12-16', '16-20', '20-24'],
    datasets: [
      { data: [2, 5, 8, 6, 7, 4] }
    ]
  };

  const chartConfig = {
    backgroundColor: BG,
    backgroundGradientFrom: CARD_BG,
    backgroundGradientTo: CARD_BG,
    decimalPlaces: 0,
    color: (opacity = 1) => ACCENT,
    labelColor: (opacity = 1) => TEXT_MAIN,
    style: { borderRadius: 16 },
    propsForBackgroundLines: {
      strokeDasharray: '', // Removes dashed lines
      stroke: CARD_BG, // Optionally, make grid lines invisible
    },
  };

  // Animation refs
  const fadeAnim1 = useRef(new Animated.Value(0)).current;
  const fadeAnim2 = useRef(new Animated.Value(0)).current;
  const fadeAnim3 = useRef(new Animated.Value(0)).current;
  const fadeAnim4 = useRef(new Animated.Value(0)).current;
  const fadeAnim5 = useRef(new Animated.Value(0)).current;
  const fadeAnim6 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.stagger(200, [
      Animated.timing(fadeAnim1, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(fadeAnim2, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(fadeAnim3, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(fadeAnim4, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(fadeAnim5, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(fadeAnim6, { toValue: 1, duration: 600, useNativeDriver: true }),
    ]).start();
  }, []);

  const CARD_STYLE = {
    backgroundColor: CARD_BG,
    borderRadius: 18,
    padding: 16,
    marginBottom: 28,
    width: '100%',
    maxWidth: maxCardWidth,
    alignSelf: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: Platform.OS === 'android' ? 2 : 0,
  };

  return (
    <View style={{ flex: 1, backgroundColor: BG }}>
      <Header title="Detection Analytics" showBack onBack={() => { if (navigation && navigation.goBack) navigation.goBack(); }} />
      <ScrollView style={{ flex: 1, backgroundColor: BG }} contentContainerStyle={{ alignItems: 'center', padding: horizontalPadding, paddingBottom: 32 }}>
        <Text style={{ color: TEXT_MAIN, fontSize: screenWidth < 400 ? 20 : 24, fontWeight: 'bold', marginBottom: 4, alignSelf: 'flex-start', maxWidth: maxCardWidth }}>Detection Analytics</Text>
        <Text style={{ color: TEXT_SECONDARY, fontSize: screenWidth < 400 ? 13 : 15, marginBottom: 20, alignSelf: 'flex-start', maxWidth: maxCardWidth }}>Overview of inappropriate content and system actions</Text>

        {/* 1. Trend Over Time */}
        <Animated.View style={[CARD_STYLE, { opacity: fadeAnim1 }]}>
          <Text style={{ color: TEXT_MAIN, fontSize: 18, fontWeight: 'bold', marginBottom: 8 }}>Trend Over Time</Text>
          <LineChart
            data={trendData}
            width={chartWidth}
            height={200}
            chartConfig={chartConfig}
            style={{ borderRadius: 16 }}
          />
        </Animated.View>

        {/* 2. Category Breakdown */}
        <Animated.View style={[CARD_STYLE, { opacity: fadeAnim2 }]}>
          <Text style={{ color: TEXT_MAIN, fontSize: 18, fontWeight: 'bold', marginBottom: 8 }}>Category Breakdown</Text>
          <PieChart
            data={categoryPie}
            width={chartWidth}
            height={180}
            chartConfig={chartConfig}
            accessor={'count'}
            backgroundColor={'transparent'}
            paddingLeft={'16'}
            absolute
            style={{ borderRadius: 16 }}
          />
        </Animated.View>

        {/* 3. Top Offenders */}
        <Animated.View style={[CARD_STYLE, { opacity: fadeAnim3 }]}>
          <Text style={{ color: TEXT_MAIN, fontSize: 18, fontWeight: 'bold', marginBottom: 8 }}>Top Offenders</Text>
          <BarChart
            data={offendersData}
            width={chartWidth}
            height={200}
            chartConfig={chartConfig}
            style={{ borderRadius: 16 }}
          />
        </Animated.View>

        {/* 4. Website Breakdown */}
        <Animated.View style={[CARD_STYLE, { opacity: fadeAnim4 }]}>
          <Text style={{ color: TEXT_MAIN, fontSize: 18, fontWeight: 'bold', marginBottom: 8 }}>Website Breakdown</Text>
          <BarChart
            data={websiteData}
            width={chartWidth}
            height={200}
            chartConfig={chartConfig}
            style={{ borderRadius: 16 }}
          />
        </Animated.View>

        {/* 5. Action Outcomes */}
        <Animated.View style={[CARD_STYLE, { opacity: fadeAnim5 }]}>
          <Text style={{ color: TEXT_MAIN, fontSize: 18, fontWeight: 'bold', marginBottom: 8 }}>Action Outcomes</Text>
          <PieChart
            data={actionPie}
            width={chartWidth}
            height={180}
            chartConfig={chartConfig}
            accessor={'count'}
            backgroundColor={'transparent'}
            paddingLeft={'16'}
            absolute
            style={{ borderRadius: 16 }}
          />
        </Animated.View>

        {/* 6. Time of Day Analysis */}
        <Animated.View style={[CARD_STYLE, { opacity: fadeAnim6 }]}>
          <Text style={{ color: TEXT_MAIN, fontSize: 18, fontWeight: 'bold', marginBottom: 8 }}>Time of Day Analysis</Text>
          <BarChart
            data={timeOfDayData}
            width={chartWidth}
            height={200}
            chartConfig={chartConfig}
            style={{ borderRadius: 16 }}
          />
        </Animated.View>
      </ScrollView>
    </View>
  );
}
