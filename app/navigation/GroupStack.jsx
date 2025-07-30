import { createStackNavigator } from '@react-navigation/stack';
import GroupsScreen from '../screens/Group';
import GroupDetailsScreen from '../screens/Group/GroupDetails';
import MemberAnalyticsScreen from '../screens/Group/MemberAnalytics';

const Stack = createStackNavigator();

function GroupStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: '#FFFFFF' },
      }}
    >
      <Stack.Screen name="Groups" component={GroupsScreen} />
      <Stack.Screen name="GroupDetails" component={GroupDetailsScreen} />
      <Stack.Screen name="MemberAnalytics" component={MemberAnalyticsScreen} />
    </Stack.Navigator>
  );
}

export default GroupStack;
