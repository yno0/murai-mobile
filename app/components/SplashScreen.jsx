import React, { useEffect, useRef } from "react";
import { Animated, Dimensions, View } from "react-native";
import { COLORS } from "../constants/theme";

const BG = COLORS.BG;
const ACCENT = COLORS.ACCENT;
const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function SplashScreen({ onFinish }) {
  const scaleAnim = useRef(new Animated.Value(0.7)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Initial animation
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();

    // Pulse animation
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

    // Finish after delay
    const timeout = setTimeout(() => {
      if (onFinish) onFinish();
    }, 3000); // Reduced from 5000 to 3000 for better UX

    return () => clearTimeout(timeout);
  }, []);

  return (
    <View style={{ 
      flex: 1, 
      justifyContent: 'center', 
      alignItems: 'center', 
      backgroundColor: BG 
    }}>
      <Animated.View style={{
        transform: [{ scale: Animated.multiply(scaleAnim, pulseAnim) }],
        opacity: opacityAnim,
      }}>
        <Animated.Image
          source={require("../../assets/images/logo.png")}
          style={{
            width: SCREEN_WIDTH * 0.4,
            height: SCREEN_WIDTH * 0.16,
            tintColor: ACCENT,
          }}
          resizeMode="contain"
        />
      </Animated.View>
    </View>
  );
} 