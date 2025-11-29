import { createNativeStackNavigator } from "@react-navigation/native-stack";
import {
  UserTypeScreen,
  SingleSplashScreen,
  BusinessSplashScreen,
  SingleOnboardingScreen,
} from "../screens";

const Stack = createNativeStackNavigator();

const AuthNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="UserType" component={UserTypeScreen} />
      <Stack.Screen name="SingleSplash" component={SingleSplashScreen} />
      <Stack.Screen name="BusinessSplash" component={BusinessSplashScreen} />
      <Stack.Screen name="SingleOnboarding" component={SingleOnboardingScreen} />
    </Stack.Navigator>
  );
};

export default AuthNavigator;
