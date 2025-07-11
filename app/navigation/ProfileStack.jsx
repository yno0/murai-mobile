import { createStackNavigator } from "@react-navigation/stack";
import React from "react";
import AccountManagement from "../screens/Profile/AccountManagement";
import NotificationPreferences from "../screens/Profile/NotificationPreferences";
import PersonalInfo from "../screens/Profile/PersonalInfo";
import PrivacyControls from "../screens/Profile/PrivacyControls";
import SecuritySettings from "../screens/Profile/SecuritySettings";

const Stack = createStackNavigator();

export default function ProfileStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="PersonalInfo" component={PersonalInfo} />
      <Stack.Screen name="AccountManagement" component={AccountManagement} />
      <Stack.Screen name="NotificationPreferences" component={NotificationPreferences} />
      <Stack.Screen name="PrivacyControls" component={PrivacyControls} />
      <Stack.Screen name="SecuritySettings" component={SecuritySettings} />
    </Stack.Navigator>
  );
}
