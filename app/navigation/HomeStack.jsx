import { createStackNavigator } from '@react-navigation/stack';
import React from 'react';
import HomeScreen from '../screens/Home';

const Stack = createStackNavigator();

function HomeStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: '#FFFFFF' },
      }}
    >
      <Stack.Screen name="HomeMain" component={HomeScreen} />
    </Stack.Navigator>
  );
}

export default HomeStack; 