import { createStackNavigator } from '@react-navigation/stack';
import React from 'react';
import GroupsScreen from '../screens/Group';
import GroupDetailsScreen from '../screens/Group/GroupDetails';

const Stack = createStackNavigator();

function GroupStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: '#FFFFFF' },
      }}
    >
      <Stack.Screen name="Groups" component={GroupsScreen} />
      <Stack.Screen name="GroupDetails" component={GroupDetailsScreen} />
    </Stack.Navigator>
  );
}

export default GroupStack;
