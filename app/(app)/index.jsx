import React from 'react';
import { Text, View } from 'react-native';

export default function AdminHome() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold' }}>Admin Home</Text>
      <Text>Welcome, admin user!</Text>
    </View>
  );
} 