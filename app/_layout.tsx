import { Stack } from "expo-router";
import React from "react";
import { View } from "react-native";
import SplashScreen from "./components/SplashScreen";
import { AuthProvider } from "./context/AuthContext";

const BG = "#0f0f0f";

export default function RootLayout() {
  const [isLoading, setIsLoading] = React.useState(true);

  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: BG }}>
        <SplashScreen onFinish={() => setIsLoading(false)} />
      </View>
    );
  }

  return (
    <AuthProvider>
      <Stack
        screenOptions={{
          headerShown: false,
          animation: "fade",
          contentStyle: { backgroundColor: BG }
        }}
      />
    </AuthProvider>
  );
}
