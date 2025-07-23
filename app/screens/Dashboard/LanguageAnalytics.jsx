import { Feather } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    Dimensions,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { PieChart } from 'react-native-chart-kit';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const { width } = Dimensions.get('window');

function LanguageAnalyticsScreen({ navigation }) {
  const [selectedTimeRange, setSelectedTimeRange] = useState('Today');

  const timeRanges = ['Today', 'Last 7 days', 'Last 30 days', 'All Time'];

  const moodData = [
    {
      name: 'Safe Content',
      population: 72,
      color: '#10b981',
      legendFontColor: '#374151',
      legendFontSize: 12,
    },
    {
      name: 'Neutral/Unknown',
      population: 20,
      color: '#6b7280',
      legendFontColor: '#374151',
      legendFontSize: 12,
    },
    {
      name: 'Harmful Content',
      population: 8,
      color: '#ef4444',
      legendFontColor: '#374151',
      legendFontSize: 12,
    },
  ];

  const safetyMetrics = [
    { metric: 'Overall Safety Score', value: '96%', change: '+2%', color: '#10b981' },
    { metric: 'Content Quality Index', value: '92%', change: '+4%', color: '#3b82f6' },
    { metric: 'Toxicity Detection Rate', value: '98.5%', change: '+1.2%', color: '#8b5cf6' },
    { metric: 'False Positive Rate', value: '1.8%', change: '-0.3%', color: '#ef4444' },
    { metric: 'Language Coverage', value: '15 Languages', change: '+2', color: '#f59e0b' },
  ];

  const languageData = [
    { language: 'English', count: 89, percentage: '70%' },
    { language: 'Filipino/Tagalog', count: 28, percentage: '22%' },
    { language: 'Taglish', count: 7, percentage: '5%' },
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Feather name="arrow-left" size={24} color="#374151" />
        </TouchableOpacity>
        <Text style={styles.title}>Language & Tone</Text>
        <View style={styles.placeholder} />
      </View>

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

      {/* Safety Score */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>MURAi Protection Score</Text>
        <View style={styles.safetyScoreCard}>
          <View style={styles.scoreCircle}>
            <Text style={styles.scoreNumber}>96%</Text>
            <Text style={styles.scoreLabel}>Protected</Text>
          </View>
          <View style={styles.scoreDetails}>
            <Text style={styles.scoreDescription}>Your digital environment is highly protected</Text>
            <Text style={styles.scoreChange}>+2% improvement this week</Text>
          </View>
        </View>
      </View>

      {/* Overall Mood */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Content Safety Analysis</Text>
        <View style={styles.chartContainer}>
          <PieChart
            data={moodData}
            width={width - 40}
            height={200}
            chartConfig={{
              color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            }}
            accessor="population"
            backgroundColor="transparent"
            paddingLeft="15"
            absolute
          />
        </View>
      </View>

      {/* Language Breakdown */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Threat Detection by Language</Text>
        <View style={styles.languageContainer}>
          {languageData.map((item, index) => (
            <View key={index} style={styles.languageItem}>
              <View style={styles.languageInfo}>
                <Text style={styles.languag5eName}>{item.language}</Text>
                <Text style={styles.languageCount}>{item.count} threats detected</Text>
              </View>
              <View style={styles.percentageBadge}>
                <Text style={styles.percentageText}>{item.percentage}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    paddingHorizontal: 20,
    paddingTop: 50,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  backButton: {
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
  placeholder: {
    width: 40,
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
    backgroundColor: '#f3f4f6',
  },
  timeRangeText: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#374151',
  },
  timeRangeTextActive: {
    fontFamily: 'Poppins-SemiBold',
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'Poppins-Medium',
    color: '#111827',
    marginBottom: 16,
  },
  safetyScoreCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#f3f4f6',
  },
  scoreCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f0fdf4',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  scoreNumber: {
    fontSize: 18,
    fontFamily: 'Poppins-Bold',
    color: '#6b7280',
  },
  scoreLabel: {
    fontSize: 10,
    fontFamily: 'Poppins-Medium',
    color: '#6b7280',
    textTransform: 'uppercase',
  },
  scoreDetails: {
    flex: 1,
  },
  scoreDescription: {
    fontSize: 14,
    fontFamily: 'Poppins-SemiBold',
    color: '#111827',
    marginBottom: 4,
  },
  scoreChange: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: '#6b7280',
  },
  chartContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#f3f4f6',
  },
  languageContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#f3f4f6',
  },
  languageItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f8f9fa',
  },
  languageInfo: {
    flex: 1,
  },
  languageName: {
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    color: '#111827',
    marginRight: 8,
  },
  languageCount: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: '#6b7280',
  },
  percentageBadge: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  percentageText: {
    fontSize: 12,
    fontFamily: 'Poppins-SemiBold',
    color: '#6b7280',
  },
  metricsContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  metricItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  metricInfo: {
    flex: 1,
  },
  metricName: {
    fontSize: 14,
    fontFamily: 'Poppins-SemiBold',
    color: '#374151',
    marginBottom: 4,
  },
  metricChange: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: '#10b981',
  },
  metricValue: {
    alignItems: 'flex-end',
  },
  metricNumber: {
    fontSize: 18,
    fontFamily: 'Poppins-Bold',
  },
  summaryContainer: {
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    padding: 20,
  },
  summaryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  summaryText: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#374151',
    marginLeft: 12,
  },
  threatText: {
    fontSize: 10,
    fontFamily: 'Poppins-Medium',
  },
  changeText: {
    fontSize: 12,
    fontFamily: 'Poppins-Medium',
  },
});

export default LanguageAnalyticsScreen; 