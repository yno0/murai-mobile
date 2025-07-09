import React, { useEffect, useRef } from "react";
import { Animated, View } from "react-native";

export default function SplashScreen({ onFinish }) {
  const scaleAnim = useRef(new Animated.Value(0.7)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 900,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 900,
        useNativeDriver: true,
      }),
    ]).start();
    const timeout = setTimeout(() => {
      if (onFinish) onFinish();
    }, 5000);
    return () => clearTimeout(timeout);
  }, []);

  return (
    <View className="flex-1 justify-center items-center bg-white">
      <Animated.Image
        source={require("../../assets/images/logo.png")}
        style={{
          width: 80,
          height: 32,
          transform: [{ scale: scaleAnim }],
          opacity: opacityAnim,
        }}
        resizeMode="contain"
      />
    </View>
  );
} 