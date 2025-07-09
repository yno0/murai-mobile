import { createStackNavigator } from "@react-navigation/stack";
import React from "react";
import Dashboard from "../screens/Home/Dashboard";

const Stack = createStackNavigator();

export default function HomeStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Dashboard" component={Dashboard} />
    </Stack.Navigator>
  );
}
