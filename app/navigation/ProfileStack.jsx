import { createStackNavigator } from "@react-navigation/stack";
import React from "react";
import PersonalInfo from "../screens/Profile/PersonalInfo";

const Stack = createStackNavigator();

export default function ProfileStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="PersonalInfo" component={PersonalInfo} />
    </Stack.Navigator>
  );
}
