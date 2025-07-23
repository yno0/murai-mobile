import { createStackNavigator } from '@react-navigation/stack';
import React from 'react';
import AccessibilitySettingsScreen from '../screens/Profile/AccessibilitySettings';
import AccountManagementScreen from '../screens/Profile/AccountManagement';
import NotificationPreferencesScreen from '../screens/Profile/NotificationPreferences';
import PersonalInfoScreen from '../screens/Profile/PersonalInfo';
import PrivacyControlsScreen from '../screens/Profile/PrivacyControls';
import SecuritySettingsScreen from '../screens/Profile/SecuritySettings';

const Stack = createStackNavigator();

function ProfileStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: '#FFFFFF' },
      }}
    >
      <Stack.Screen name="PersonalInfo" component={PersonalInfoScreen} />
      <Stack.Screen name="SecuritySettings" component={SecuritySettingsScreen} />
      <Stack.Screen name="NotificationPreferences" component={NotificationPreferencesScreen} />
      <Stack.Screen name="PrivacyControls" component={PrivacyControlsScreen} />
      <Stack.Screen name="AccessibilitySettings" component={AccessibilitySettingsScreen} />
      <Stack.Screen name="AccountManagement" component={AccountManagementScreen} />
    </Stack.Navigator>
  );
}

export default ProfileStack;
