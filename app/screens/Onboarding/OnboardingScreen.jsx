import { router } from 'expo-router';
import { useRef, useState } from 'react';
import {
    Dimensions,
    FlatList,
    Image,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const onboardingData = [
  {
    id: '1',
    title: 'Protect Every Click',
    subtitle: 'MURAi flags inappropriate words in English and Filipino as you browse. Peace of mind starts here',
    image: require('../../../assets/images/protect_every_click.jpg'),
    color: '#02B97F'
  },
  {
    id: '2',
    title: 'Smart Detection',
    subtitle: 'Advanced AI technology monitors your browsing in real-time, keeping you safe from harmful content',
    image: require('../../../assets/images/smartdetection.jpg'),
    color: '#02B97F'
  },
  {
    id: '3',
    title: 'Stay Connected',
    subtitle: 'Join groups, share insights, and build a safer internet community together with MURAi',
    image: require('../../../assets/images/stay_connected.jpg'),
    color: '#02B97F'
  }
];

export default function OnboardingScreen() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef(null);

  const markOnboardingComplete = async () => {
    try {
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      await AsyncStorage.setItem('hasSeenOnboarding', 'true');
    } catch (error) {
      console.error('Error saving onboarding status:', error);
    }
  };

  const handleNext = async () => {
    if (currentIndex < onboardingData.length - 1) {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      flatListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
    } else {
      // Navigate to welcome animation
      router.replace('/(onboarding)/welcome');
    }
  };

  const handleSkip = async () => {
    router.replace('/(onboarding)/welcome');
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      const prevIndex = currentIndex - 1;
      setCurrentIndex(prevIndex);
      flatListRef.current?.scrollToIndex({ index: prevIndex, animated: true });
    }
  };

  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index);
    }
  }).current;

  const renderOnboardingItem = ({ item }) => (
    <View style={styles.slide}>
      <View style={styles.content}>
        {/* Skip Button */}
        <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>{item.title}</Text>
        </View>

        {/* Image */}
        <View style={styles.imageContainer}>
          <Image source={item.image} style={styles.onboardingImage} resizeMode="cover" />
        </View>

        {/* Subtitle */}
        <View style={styles.subtitleContainer}>
          <Text style={styles.subtitle}>{item.subtitle}</Text>
        </View>
      </View>
    </View>
  );

  const renderPagination = () => (
    <View style={styles.pagination}>
      {onboardingData.map((_, index) => (
        <View
          key={index}
          style={[
            styles.paginationDot,
            {
              backgroundColor: index === currentIndex ? '#02B97F' : '#E5E7EB',
              width: index === currentIndex ? 24 : 8,
            }
          ]}
        />
      ))}
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Onboarding Content */}
      <FlatList
        ref={flatListRef}
        data={onboardingData}
        renderItem={renderOnboardingItem}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={{ itemVisiblePercentThreshold: 50 }}
        keyExtractor={(item) => item.id}
      />

      {/* Bottom Section */}
      <View style={styles.bottomSection}>
        {/* Pagination */}
        {renderPagination()}

        {/* Navigation Buttons */}
        <View style={styles.buttonContainer}>
          {currentIndex > 0 && (
            <TouchableOpacity style={styles.backButton} onPress={handlePrevious}>
              <MaterialCommunityIcons name="chevron-left" size={24} color="#6B7280" />
            </TouchableOpacity>
          )}
          
          <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
            {currentIndex === onboardingData.length - 1 ? (
              <Text style={styles.nextButtonText}>Get Started</Text>
            ) : (
              <MaterialCommunityIcons name="chevron-right" size={24} color="#FFFFFF" />
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  skipButton: {
    position: 'absolute',
    top: 50,
    right: 32,
    paddingHorizontal: 16,
    paddingVertical: 8,
    zIndex: 10,
  },
  skipText: {
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    color: '#64748B',
  },
  slide: {
    width: SCREEN_WIDTH,
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingTop: 60,
    paddingBottom: 40,
  },

  header: {
    alignItems: 'center',
  },
  title: {
    fontSize: 36,
    fontFamily: 'Poppins-Bold',
    color: '#1F2937',
    textAlign: 'center',
    lineHeight: 44,
    letterSpacing: -0.5,
  },
  imageContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    width: '100%',
  },
  onboardingImage: {
    width: SCREEN_WIDTH * 0.85,
    height: SCREEN_HEIGHT * 0.35,
    borderRadius: 24,
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  subtitleContainer: {
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  subtitle: {
    fontSize: 18,
    fontFamily: 'Poppins-Regular',
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 28,
    maxWidth: SCREEN_WIDTH * 0.8,
  },
  bottomSection: {
    paddingBottom: 60,
    paddingHorizontal: 32,
    backgroundColor: '#FFFFFF',
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 48,
    gap: 12,
  },
  paginationDot: {
    height: 10,
    borderRadius: 5,
    transition: 'all 0.3s ease',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  backButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#F8FAFC',
    borderWidth: 2,
    borderColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  nextButton: {
    backgroundColor: '#02B97F',
    paddingHorizontal: 40,
    paddingVertical: 18,
    borderRadius: 28,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 140,
    shadowColor: '#02B97F',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  nextButtonText: {
    fontSize: 17,
    fontFamily: 'Poppins-SemiBold',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
});
