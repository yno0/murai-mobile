import { StatusBar } from "expo-status-bar";
import React from "react";
import AppNavigator from "./app/navigation/AppNavigator";

export default function MainApp() {
  return (
    <>
      <StatusBar style="light" />
      <AppNavigator />
    </>
  );
} 