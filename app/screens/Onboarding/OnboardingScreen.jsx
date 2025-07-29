import { router } from 'expo-router';
import { useRef, useState } from 'react';
import {
    Dimensions,
    FlatList,
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
    icon: 'shield-check',
    color: '#02B97F'
  },
  {
    id: '2',
    title: 'Smart Detection',
    subtitle: 'Advanced AI technology monitors your browsing in real-time, keeping you safe from harmful content',
    icon: 'brain',
    color: '#02B97F'
  },
  {
    id: '3',
    title: 'Stay Connected',
    subtitle: 'Join groups, share insights, and build a safer internet community together with MURAi',
    icon: 'account-group',
    color: '#02B97F'
  }
];

export default function OnboardingScreen() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef(null);

  const handleNext = () => {
    if (currentIndex < onboardingData.length - 1) {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      flatListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
    } else {
      // Navigate to login
      router.replace('/(auth)/login');
    }
  };

  const handleSkip = () => {
    router.replace('/(auth)/login');
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
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>{item.title}</Text>
        </View>

        {/* Icon/Image Placeholder */}
        <View style={styles.imageContainer}>
          <View style={styles.iconWrapper}>
            <MaterialCommunityIcons 
              name={item.icon} 
              size={120} 
              color={item.color} 
            />
          </View>
          <View style={styles.imagePlaceholder}>
            <Text style={styles.placeholderText}>picture here</Text>
          </View>
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
      
      {/* Skip Button */}
      <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
        <Text style={styles.skipText}>Skip</Text>
      </TouchableOpacity>

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
    left: 20,
    zIndex: 1,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  skipText: {
    fontSize: 16,
    fontFamily: 'Poppins-Medium',
    color: '#6B7280',
  },
  slide: {
    width: SCREEN_WIDTH,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  header: {
    marginBottom: 60,
  },
  title: {
    fontSize: 32,
    fontFamily: 'Poppins-Bold',
    color: '#1F2937',
    textAlign: 'center',
    lineHeight: 40,
  },
  imageContainer: {
    alignItems: 'center',
    marginBottom: 60,
  },
  iconWrapper: {
    marginBottom: 20,
  },
  imagePlaceholder: {
    width: SCREEN_WIDTH * 0.8,
    height: 200,
    backgroundColor: '#F3F4F6',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
  },
  placeholderText: {
    fontSize: 18,
    fontFamily: 'Poppins-Medium',
    color: '#9CA3AF',
  },
  subtitleContainer: {
    paddingHorizontal: 20,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
  },
  bottomSection: {
    paddingBottom: 50,
    paddingHorizontal: 40,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
    gap: 8,
  },
  paginationDot: {
    height: 8,
    borderRadius: 4,
    transition: 'all 0.3s ease',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  nextButton: {
    backgroundColor: '#02B97F',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 120,
    shadowColor: '#02B97F',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  nextButtonText: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    color: '#FFFFFF',
  },
});
