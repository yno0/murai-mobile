import { createStackNavigator } from "@react-navigation/stack";
import React from "react";
import ConfigurationPanel from "../screens/Extension/ExtensionSettingsMobile";

const Stack = createStackNavigator();

export default function ExtensionStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ConfigurationPanel" component={ConfigurationPanel} />
    </Stack.Navigator>
  );
}
