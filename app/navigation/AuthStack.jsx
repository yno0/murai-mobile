import { Stack } from "expo-router";
import React from "react";
import Login from "../screens/Auth/Login";
import Register from "../screens/Auth/Register";

export default function AuthStack() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "fade",
      }}
    >
      <Stack.Screen
        name="login"
        component={Login}
        options={{
          gestureEnabled: false,
        }}
      />
      <Stack.Screen
        name="register"
        component={Register}
        options={{
          gestureEnabled: true,
        }}
      />
    </Stack>
  );
} 