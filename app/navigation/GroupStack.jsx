import { createStackNavigator } from "@react-navigation/stack";
import React from "react";
import CreateGroup from "../screens/Group/CreateGroup";
import GroupDetails from "../screens/Group/GroupDetails";

const Stack = createStackNavigator();

export default function GroupStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="CreateGroup" component={CreateGroup} />
      <Stack.Screen name="GroupDetails" component={GroupDetails} />
    </Stack.Navigator>
  );
}
