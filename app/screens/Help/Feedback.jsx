import React from "react";
import { Text, View } from "react-native";
import { COLORS, globalStyles } from "../../constants/theme";

export default function Feedback() {
  return (
    <View style={globalStyles.container}>
      <Text style={{ 
        color: COLORS.TEXT_MAIN, 
        fontSize: 24, 
        fontFamily: "Poppins-Bold" 
      }}>
        Feedback
      </Text>
      <Text style={globalStyles.text}>
        Share your feedback with us.
      </Text>
    </View>
  );
}
