import { createStackNavigator } from "@react-navigation/stack";
import React from "react";
import CreateGroup from "../screens/Group/CreateGroup";

const Stack = createStackNavigator();

export default function GroupStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="CreateGroup" component={CreateGroup} />
    </Stack.Navigator>
  );
}
