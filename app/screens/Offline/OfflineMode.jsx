import React from "react";
import { Text, View } from "react-native";
import { COLORS, globalStyles } from "../../constants/theme";

export default function OfflineMode() {
  return (
    <View style={globalStyles.container}>
      <Text style={{ 
        color: COLORS.TEXT_MAIN, 
        fontSize: 24, 
        fontFamily: "Poppins-Bold" 
      }}>
        Offline Mode
      </Text>
      <Text style={globalStyles.text}>
        You are currently offline. Some features may not be available.
      </Text>
    </View>
  );
}
