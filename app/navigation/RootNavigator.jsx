import { Feather } from "@expo/vector-icons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import React from "react";
import { View } from "react-native";
import DetectionStack from "./DetectionStack";
import ExtensionStack from "./ExtensionStack";
import GroupStack from "./GroupStack";
import HomeStack from "./HomeStack";

const Tab = createBottomTabNavigator();

// Theme colors
const ACCENT = "#34d399";
const BG = "#0f0f0f";
const INACTIVE = "#666666";
const NAV_BG = "#1a1a1a"; // Added slightly lighter background for nav

export default function RootNavigator() {
  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={({ route }) => ({
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: NAV_BG,
          borderTopWidth: 0, // Removed border
          elevation: 0, // Remove Android shadow
          shadowOpacity: 0, // Remove iOS shadow
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
          marginBottom: 0,
          borderRadius: 0,
        },
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          
          switch (route.name) {
            case "Home":
              iconName = "home";
              break;
            case "Extension":
              iconName = "box";
              break;
            case "Detection":
              iconName = "radio";
              break;
            case "Group":
              iconName = "users";
              break;
            default:
              iconName = "circle";
          }

          return (
            <View style={{
              alignItems: 'center',
              justifyContent: 'center',
              width: 48,
              height: 48,
              borderRadius: 24,
              backgroundColor: focused ? 'rgba(52,211,153,0.1)' : 'transparent'
            }}>
              <Feather 
                name={iconName} 
                size={focused ? 24 : 22} 
                color={focused ? ACCENT : INACTIVE}
                style={{
                  opacity: focused ? 1 : 0.8
                }}
              />
            </View>
          );
        },
        tabBarActiveTintColor: ACCENT,
        tabBarInactiveTintColor: INACTIVE,
        headerShown: false,
      })}
    >
      <Tab.Screen name="Home" component={HomeStack} />
      <Tab.Screen name="Extension" component={ExtensionStack} />
      <Tab.Screen name="Detection" component={DetectionStack} />
      <Tab.Screen name="Group" component={GroupStack} />
    </Tab.Navigator>
  );
}
