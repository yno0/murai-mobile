import { router } from 'expo-router';
import { useEffect, useRef } from 'react';
import {
  Animated,
  Dimensions,
  Image,
  StatusBar,
  StyleSheet,
  Text,
  View
} from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function WelcomeAnimation() {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.3)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const logoTranslateY = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(1)).current;
  const backgroundOpacity = useRef(new Animated.Value(1)).current;
  const textTranslateY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Mark onboarding as complete
    markOnboardingComplete();
    
    // Start animation sequence
    startAnimation();
  }, []);

  const markOnboardingComplete = async () => {
    try {
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      await AsyncStorage.setItem('hasSeenOnboarding', 'true');
    } catch (error) {
      console.error('Error saving onboarding status:', error);
    }
  };

  const startAnimation = () => {
    // Phase 1: Entrance Animation
    Animated.sequence([
      // Fade in background
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      // Logo entrance - scale and fade in
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
      // Text entrance with slight delay
      Animated.timing(textOpacity, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // Phase 2: Hold for a moment
      setTimeout(() => {
        startExitAnimation();
      }, 1200);
    });
  };

  const startExitAnimation = () => {
    // Calculate login logo position (welcome logo moved down 10px)
    // Login screen: paddingTop(60) + logoContainer padding(12) + logo center(60) = 132px
    // Adding margin spacing: 132 + 32 + 32 = 196px from top
    // Moving welcome logo down 10px: 196 + 10 = 206px from top
    const loginLogoCenter = 60 + 12 + 60 + 32 + 32 + 10; // 206px from top (welcome logo 10px lower)
    const currentLogoCenter = SCREEN_HEIGHT / 2; // Center of screen
    const translateDistance = -(currentLogoCenter - loginLogoCenter);

    // Phase 3: Exit Animation - Move logo to exact login position
    Animated.parallel([
      // Move logo to exact login position
      Animated.timing(logoTranslateY, {
        toValue: translateDistance,
        duration: 900,
        useNativeDriver: true,
      }),
      // Scale logo to exact login size (120px from 140px)
      Animated.timing(logoScale, {
        toValue: 0.857, // 120/140 = 0.857
        duration: 900,
        useNativeDriver: true,
      }),
      // Fade out text smoothly
      Animated.timing(textOpacity, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
      // Slide text down slightly while fading
      Animated.timing(textTranslateY, {
        toValue: 30,
        duration: 500,
        useNativeDriver: true,
      }),
      // Fade out background after text starts fading
      Animated.sequence([
        Animated.delay(300),
        Animated.timing(backgroundOpacity, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }),
      ]),
    ]).start(() => {
      // Navigate to login after animation completes
      router.replace('/(auth)/login');
    });
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Background */}
      <Animated.View
        style={[
          styles.background,
          {
            opacity: backgroundOpacity,
          }
        ]}
      />

      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
          }
        ]}
      >
        {/* Logo */}
        <Animated.View
          style={[
            styles.logoContainer,
            {
              opacity: logoOpacity,
              transform: [
                { scale: Animated.multiply(scaleAnim, logoScale) },
                { translateY: logoTranslateY }
              ],
            }
          ]}
        >
          <Image
            source={require('../../../assets/images/logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </Animated.View>

        {/* Welcome Text */}
        <Animated.View
          style={[
            styles.textContainer,
            {
              opacity: textOpacity,
              transform: [{ translateY: textTranslateY }],
            }
          ]}
        >
          <View style={styles.welcomeTextWrapper}>
            <Text style={styles.welcomeText}>Welcome to</Text>
            <Text style={styles.brandText}>MURAi</Text>
          </View>
          <View style={styles.taglineWrapper}>
            <Text style={styles.taglineText}>Your Digital Safety Companion</Text>
            <View style={styles.taglineUnderline} />
          </View>
        </Animated.View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  background: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'linear-gradient(135deg, #FFFFFF 0%, #F8FAFC 100%)',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 64,
    shadowColor: '#02B97F',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.2,
    shadowRadius: 24,
    elevation: 12,
  },
  logo: {
    width: 140,
    height: 140,
  },
  textContainer: {
    alignItems: 'center',
    maxWidth: SCREEN_WIDTH * 0.85,
  },
  welcomeTextWrapper: {
    alignItems: 'center',
    marginBottom: 32,
  },
  welcomeText: {
    fontSize: 24,
    fontFamily: 'Poppins-Light',
    color: '#64748B',
    marginBottom: 8,
    textAlign: 'center',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  brandText: {
    fontSize: 64,
    fontFamily: 'Poppins-ExtraBold',
    color: '#02B97F',
    textAlign: 'center',
    letterSpacing: -3,
    lineHeight: 72,
    textShadowColor: 'rgba(2, 185, 127, 0.25)',
    textShadowOffset: { width: 0, height: 6 },
    textShadowRadius: 12,
  },
  taglineWrapper: {
    alignItems: 'center',
  },
  taglineText: {
    fontSize: 17,
    fontFamily: 'Poppins-Medium',
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 26,
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  taglineUnderline: {
    width: 60,
    height: 3,
    backgroundColor: '#02B97F',
    borderRadius: 2,
    opacity: 0.6,
  },
});
