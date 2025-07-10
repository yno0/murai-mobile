import React, { useEffect, useState } from "react";
import { View } from "react-native";
import SplashScreen from "../components/SplashScreen";
import AuthStack from "./AuthStack";
import RootNavigator from "./RootNavigator";

const BG = "#0f0f0f";

export default function AppNavigator() {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Handle initial app loading
  useEffect(() => {
    // TODO: Check if user is authenticated
    // For now, we'll just simulate a loading delay
    const timeout = setTimeout(() => {
      setIsLoading(false);
    }, 3000);

    return () => clearTimeout(timeout);
  }, []);

  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: BG }}>
        <SplashScreen onFinish={() => setIsLoading(false)} />
      </View>
    );
  }

  return isAuthenticated ? <RootNavigator /> : <AuthStack />;
} 