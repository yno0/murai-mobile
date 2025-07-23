import { createStackNavigator } from '@react-navigation/stack';
import React from 'react';
import DashboardScreen from '../screens/Dashboard';
import FlaggedWordsAnalytics from '../screens/Dashboard/FlaggedWordsAnalytics';
import LanguageAnalytics from '../screens/Dashboard/LanguageAnalytics';
import TimePatternAnalytics from '../screens/Dashboard/TimePatternAnalytics';
import UserActivityAnalytics from '../screens/Dashboard/UserActivityAnalytics';
import WebsiteAnalytics from '../screens/Dashboard/WebsiteAnalytics';

const Stack = createStackNavigator();

function DashboardStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: '#FFFFFF' },
      }}
    >
      <Stack.Screen name="DashboardMain" component={DashboardScreen} />
      <Stack.Screen name="FlaggedWordsAnalytics" component={FlaggedWordsAnalytics} />
      <Stack.Screen name="WebsiteAnalytics" component={WebsiteAnalytics} />
      <Stack.Screen name="LanguageAnalytics" component={LanguageAnalytics} />
      <Stack.Screen name="UserActivityAnalytics" component={UserActivityAnalytics} />
      <Stack.Screen name="TimePatternAnalytics" component={TimePatternAnalytics} />
    </Stack.Navigator>
  );
}

export default DashboardStack; 