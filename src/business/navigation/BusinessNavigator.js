import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { BusinessHomeScreen } from "../screens";

const Stack = createNativeStackNavigator();

const BusinessNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
      }}
    >
      <Stack.Screen name="BusinessHome" component={BusinessHomeScreen} />
    </Stack.Navigator>
  );
};

export default BusinessNavigator;
