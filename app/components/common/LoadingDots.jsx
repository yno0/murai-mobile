import React, { useEffect, useRef } from 'react';
import { Animated, View, Text, StyleSheet } from 'react-native';

const LoadingDots = ({ 
  text = "Loading", 
  dotColor = "#02B97F", 
  textColor = "#6b7280",
  size = 8,
  textSize = 16,
  style = {} 
}) => {
  const dot1Anim = useRef(new Animated.Value(0)).current;
  const dot2Anim = useRef(new Animated.Value(0)).current;
  const dot3Anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animateDots = () => {
      const animationSequence = Animated.sequence([
        Animated.timing(dot1Anim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(dot2Anim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(dot3Anim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.parallel([
          Animated.timing(dot1Anim, {
            toValue: 0,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(dot2Anim, {
            toValue: 0,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(dot3Anim, {
            toValue: 0,
            duration: 400,
            useNativeDriver: true,
          }),
        ]),
      ]);

      Animated.loop(animationSequence).start();
    };

    animateDots();
  }, [dot1Anim, dot2Anim, dot3Anim]);

  const getDotStyle = (animValue) => ({
    opacity: animValue.interpolate({
      inputRange: [0, 1],
      outputRange: [0.3, 1],
    }),
    transform: [
      {
        scale: animValue.interpolate({
          inputRange: [0, 1],
          outputRange: [0.8, 1.2],
        }),
      },
    ],
  });

  return (
    <View style={[styles.container, style]}>
      <Text style={[styles.loadingText, { color: textColor, fontSize: textSize }]}>
        {text}
      </Text>
      <View style={styles.dotsContainer}>
        <Animated.View
          style={[
            styles.dot,
            { backgroundColor: dotColor, width: size, height: size, borderRadius: size / 2 },
            getDotStyle(dot1Anim),
          ]}
        />
        <Animated.View
          style={[
            styles.dot,
            { backgroundColor: dotColor, width: size, height: size, borderRadius: size / 2 },
            getDotStyle(dot2Anim),
          ]}
        />
        <Animated.View
          style={[
            styles.dot,
            { backgroundColor: dotColor, width: size, height: size, borderRadius: size / 2 },
            getDotStyle(dot3Anim),
          ]}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  loadingText: {
    fontFamily: 'Poppins-Medium',
    marginBottom: 16,
    textAlign: 'center',
  },
  dotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  dot: {
    marginHorizontal: 2,
  },
});

export default LoadingDots;
