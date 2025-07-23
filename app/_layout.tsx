import { Stack } from "expo-router";
import React from "react";
import { View } from "react-native";
import SplashScreen from "./components/SplashScreen";
import { AuthProvider } from "./context/AuthContext";
import { checkFontAvailability, loadPoppinsFonts } from "./utils/fontLoader";

const BG = "#0f0f0f";

export default function RootLayout() {
  const [isLoading, setIsLoading] = React.useState(true);
  const [fontsLoaded, setFontsLoaded] = React.useState(false);

  React.useEffect(() => {
    async function initializeApp() {
      try {
        // Load fonts
        const fontsSuccess = await loadPoppinsFonts();
        setFontsLoaded(true);
        
        // Check font availability in development
        if (__DEV__) {
          setTimeout(() => {
            checkFontAvailability();
          }, 1000);
        }
        
        // Simulate loading time
        setTimeout(() => {
          setIsLoading(false);
        }, 2000);
        
      } catch (error) {
        console.error('Error initializing app:', error);
        setFontsLoaded(true);
        setIsLoading(false);
      }
    }

    initializeApp();
  }, []);

  if (isLoading || !fontsLoaded) {
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
