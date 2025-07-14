import { NativeBaseProvider } from 'native-base';
import React from "react";
import RootNavigator from "../navigation/RootNavigator";

export default function AppLayout() {
  return (
    <NativeBaseProvider>
      <RootNavigator />
    </NativeBaseProvider>
  );
} 