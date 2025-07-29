import { createStackNavigator } from '@react-navigation/stack';
import DashboardScreen from '../screens/Dashboard';
import DetectionAnalytics from '../screens/Dashboard/DetectionAnalytics';
import LanguageAnalytics from '../screens/Dashboard/LanguageAnalytics';
import TimePatternAnalytics from '../screens/Dashboard/TimePatternAnalytics';
import WebsiteAnalytics from '../screens/Dashboard/WebsiteAnalytics';

const Stack = createStackNavigator();

function DashboardStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: '#FFFFFF' },
      }}
    >
      <Stack.Screen name="DashboardMain" component={DashboardScreen} />
      <Stack.Screen name="DetectionAnalytics" component={DetectionAnalytics} />
      <Stack.Screen name="WebsiteAnalytics" component={WebsiteAnalytics} />
      <Stack.Screen name="LanguageAnalytics" component={LanguageAnalytics} />
      <Stack.Screen name="TimePatternAnalytics" component={TimePatternAnalytics} />
    </Stack.Navigator>
  );
}

export default DashboardStack; 