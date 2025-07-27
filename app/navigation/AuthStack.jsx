import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from '../screens/Auth/Login';
import RegisterScreen from '../screens/Auth/Register';

const Stack = createStackNavigator();

function AuthStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: '#FFFFFF' },
      }}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
    </Stack.Navigator>
  );
}

export default AuthStack; 