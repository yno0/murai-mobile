import React from "react";
import { Text, View } from "react-native";
import { COLORS, globalStyles } from "../../constants/theme";

export default function FAQ() {
  return (
    <View style={globalStyles.container}>
      <Text style={{ 
        color: COLORS.TEXT_MAIN, 
        fontSize: 24, 
        fontFamily: "Poppins-Bold" 
      }}>
        FAQ
      </Text>
      <Text style={globalStyles.text}>
        Frequently Asked Questions will be displayed here.
      </Text>
    </View>
  );
}
