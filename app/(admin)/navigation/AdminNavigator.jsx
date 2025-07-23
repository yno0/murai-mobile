import { Feather } from "@expo/vector-icons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { View } from "react-native";
import AdminDetectionScreen from "../screens/Dashboard/Detection";
import AdminGroupsScreen from "../screens/Dashboard/Groups";
import AdminDashboardScreen from "../screens/Dashboard/index";
import AdminLanguagesScreen from "../screens/Dashboard/Languages";
import AdminPatternsOverTimeScreen from "../screens/Dashboard/PatternsOverTime";
import AdminSitesScreen from "../screens/Dashboard/Sites";
import AdminHomeScreen from "../screens/Home/index";
import AccountSettingsScreen from "../screens/Profile/AccountSettings";
import ChangePasswordScreen from "../screens/Profile/ChangePassword";
import AdminProfileScreen from "../screens/Profile/index";
import PersonalDetailsScreen from "../screens/Profile/PersonalDetails";
import SystemLogsScreen from "../screens/Profile/SystemLogs";
import AdminReportsScreen from "../screens/Reports/index";
import AdminUsersScreen from "../screens/Users/index";

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function AdminTabNavigator() {
  return (
    <Tab.Navigator
      initialRouteName="AdminHome"
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
            case "AdminHome":
              iconName = "home";
              break;
            case "AdminDashboard":
              iconName = "bar-chart-2";
              break;
            case "AdminUsers":
              iconName = "users";
              break;
            case "AdminReports":
              iconName = "file-text";
              break;
            case "AdminGroups":
              iconName = "users";
              break;
            case "AdminSettings":
              iconName = "settings";
              break;
            case "AdminAuditLogs":
              iconName = "file-text";
              break;
            case "AdminProfile":
              iconName = "user";
              break;
            default:
              iconName = "circle";
          }

          const iconColor = focused ? '#01B97F' : '#9CA3AF';
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
              shadowColor: focused ? '#01B97F' : 'transparent',
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
        tabBarActiveTintColor: '#01B97F',
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
      <Tab.Screen name="AdminHome" component={AdminHomeScreen} options={{ title: "Home" }} />
      <Tab.Screen name="AdminDashboard" component={AdminDashboardScreen} options={{ title: "Dashboard" }} />
      <Tab.Screen name="AdminUsers" component={AdminUsersScreen} options={{ title: "Users" }} />
      <Tab.Screen name="AdminReports" component={AdminReportsScreen} options={{ title: "Reports" }} />
      <Tab.Screen name="AdminProfile" component={AdminProfileScreen} options={{ title: "Profile" }} />
    </Tab.Navigator>
  );
}

export default function AdminNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="AdminTabs" component={AdminTabNavigator} />
      <Stack.Screen name="AdminDetection" component={AdminDetectionScreen} />
      <Stack.Screen name="AdminSites" component={AdminSitesScreen} />
      <Stack.Screen name="AdminLanguages" component={AdminLanguagesScreen} />
      <Stack.Screen name="AdminGroups" component={AdminGroupsScreen} />
      <Stack.Screen name="AdminPatternsOverTime" component={AdminPatternsOverTimeScreen} />
      <Stack.Screen name="PersonalDetails" component={PersonalDetailsScreen} />
      <Stack.Screen name="SystemLogs" component={SystemLogsScreen} />
      <Stack.Screen name="AccountSettings" component={AccountSettingsScreen} />
      <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} />
    </Stack.Navigator>
  );
}
