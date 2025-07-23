import React, { useEffect, useState } from "react";
import { View } from "react-native";
import SplashScreen from "../components/SplashScreen";
import AuthStack from "./AuthStack";
import RootNavigator from "./RootNavigator";

export default function AppNavigator() {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setIsLoading(false);
    }, 3000);

    return () => clearTimeout(timeout);
  }, []);

  if (isLoading) {
    return (
      <View style={{ flex: 1 }}>
        <SplashScreen onFinish={() => setIsLoading(false)} />
      </View>
    );
  }

  return isAuthenticated ? <RootNavigator /> : <AuthStack />;
} 