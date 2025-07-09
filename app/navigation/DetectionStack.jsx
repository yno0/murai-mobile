import { createStackNavigator } from "@react-navigation/stack";
import React from "react";
import RealTimeFeed from "../screens/Detection/RealTimeFeed";

const Stack = createStackNavigator();

export default function DetectionStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="RealTimeFeed" component={RealTimeFeed} />
    </Stack.Navigator>
  );
}
