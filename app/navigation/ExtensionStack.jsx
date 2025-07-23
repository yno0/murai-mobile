import { createStackNavigator } from '@react-navigation/stack';
import React from 'react';
import ExtensionScreen from '../screens/Extension';

const Stack = createStackNavigator();

function ExtensionStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: '#FFFFFF' },
      }}
    >
      <Stack.Screen name="ExtensionMain" component={ExtensionScreen} />
    </Stack.Navigator>
  );
}

export default ExtensionStack; 