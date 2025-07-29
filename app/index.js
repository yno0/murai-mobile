import { Redirect } from "expo-router";
import { useEffect, useState } from "react";
import { View } from "react-native";

export default function Index() {
  const [isFirstTime, setIsFirstTime] = useState(null);

  useEffect(() => {
    checkFirstTime();
  }, []);

  const checkFirstTime = async () => {
    try {
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      const hasSeenOnboarding = await AsyncStorage.getItem('hasSeenOnboarding');
      setIsFirstTime(!hasSeenOnboarding);
    } catch (error) {
      console.error('Error checking onboarding status:', error);
      setIsFirstTime(true); // Default to showing onboarding if there's an error
    }
  };

  if (isFirstTime === null) {
    // Still checking, show nothing or a loading state
    return <View style={{ flex: 1, backgroundColor: '#FFFFFF' }} />;
  }

  if (isFirstTime) {
    return <Redirect href="/(onboarding)" />;
  }

  return <Redirect href="/(auth)/login" />;
}