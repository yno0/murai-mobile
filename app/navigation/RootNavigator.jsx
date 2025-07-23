import { Feather } from "@expo/vector-icons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import React from "react";
import DashboardStack from "./DashboardStack";
import ExtensionStack from "./ExtensionStack";
import GroupStack from "./GroupStack";
import HomeStack from "./HomeStack";
import ProfileStack from "./ProfileStack";

const Tab = createBottomTabNavigator();

export default function RootNavigator() {
  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={({ route }) => ({
        tabBarShowLabel: true,
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#F3F4F6',
          height: 70,
          paddingBottom: 10,
          paddingTop: 8,
          shadowColor: '#000',
          shadowOffset: {
            width: 0,
            height: -2,
          },
          shadowOpacity: 0.05,
          shadowRadius: 8,
          elevation: 8,
        },
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          
          switch (route.name) {
            case "Home":
              iconName = "home";
              break;
            case "Dashboard":
              iconName = "bar-chart-2";
              break;
            case "Extension":
              iconName = "package";
              break;
            case "Group":
              iconName = "users";
              break;
            case "Profile":
              iconName = "user";
              break;
            default:
              iconName = "circle";
          }

          return <Feather name={iconName} size={24} color={color} />;
        },
        tabBarActiveTintColor: '#374151',
        tabBarInactiveTintColor: '#9CA3AF',
        tabBarLabelStyle: {
          fontSize: 12,
          fontFamily: 'Poppins-Medium',
          marginTop: 4,
        },
        headerShown: false,
      })}
    >
      <Tab.Screen name="Home" component={HomeStack} />
      <Tab.Screen name="Dashboard" component={DashboardStack} />
      <Tab.Screen name="Extension" component={ExtensionStack} />
      <Tab.Screen name="Group" component={GroupStack} />
      <Tab.Screen name="Profile" component={ProfileStack} />
    </Tab.Navigator>
  );
}
