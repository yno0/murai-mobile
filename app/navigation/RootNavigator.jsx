import { Feather } from "@expo/vector-icons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { View } from "react-native";
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
          borderTopWidth: 0,
          height: 85,
          paddingBottom: 20,
          paddingTop: 12,
          paddingHorizontal: 10,
          shadowColor: '#000',
          shadowOffset: {
            width: 0,
            height: -4,
          },
          shadowOpacity: 0.1,
          shadowRadius: 12,
          elevation: 15,
        },
        tabBarIcon: ({ focused }) => {
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

          const iconColor = focused ? '#02B97F' : '#9CA3AF';
          const iconSize = focused ? 26 : 24;

          return (
            <View style={{
              backgroundColor: focused ? '#e8f5f0' : 'transparent',
              borderRadius: 16,
              paddingHorizontal: 18,
              paddingVertical: 10,
              minWidth: 55,
              alignItems: 'center',
              justifyContent: 'center',
              shadowColor: focused ? '#02B97F' : 'transparent',
              shadowOffset: {
                width: 0,
                height: 2,
              },
              shadowOpacity: focused ? 0.15 : 0,
              shadowRadius: 4,
              elevation: focused ? 3 : 0,
            }}>
              <Feather name={iconName} size={iconSize} color={iconColor} />
            </View>
          );
        },
        tabBarActiveTintColor: '#02B97F',
        tabBarInactiveTintColor: '#9CA3AF',
        tabBarLabelStyle: {
          fontSize: 11,
          fontFamily: 'Poppins-SemiBold',
          marginTop: 6,
          letterSpacing: 0.3,
        },
        tabBarItemStyle: {
          paddingVertical: 4,
        },
        tabBarHideOnKeyboard: true,
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
