import { createNativeStackNavigator } from "@react-navigation/native-stack";
import {
  UserTypeScreen,
  SingleSplashScreen,
  BusinessSplashScreen,
  SingleOnboardingScreen,
  SingleLoginScreen,
  BusinessLoginScreen,
  OtpSingleScreen,
  OtpBusinessScreen,
} from "../screens";
import BusinessOnboardingScreen from "../screens/BusinessOnboardingScreen";

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
      <Stack.Screen name="SingleLogin" component={SingleLoginScreen} />
      <Stack.Screen name="BusinessLogin" component={BusinessLoginScreen} />
      <Stack.Screen name="OtpSingle" component={OtpSingleScreen} />
      <Stack.Screen name="OtpBusiness" component={OtpBusinessScreen} />
      <Stack.Screen name="BusinessOnboarding" component={BusinessOnboardingScreen} />

    </Stack.Navigator>
  );
};

export default AuthNavigator;
