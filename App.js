import { StatusBar } from "expo-status-bar";
import { View, I18nManager } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { RootNavigator } from "./src/navigation";
import { useEffect } from "react";

// Enable RTL
I18nManager.allowRTL(true);
I18nManager.forceRTL(true);

export default function App() {
  useEffect(() => {
    // Ensure RTL is enabled
    if (!I18nManager.isRTL) {
      I18nManager.forceRTL(true);
      // Note: On some devices, you may need to reload the app for RTL to take effect
    }
  }, []);

  return (
    <NavigationContainer>
      <View className="flex-1 bg-background">
        <RootNavigator />
        <StatusBar style="auto" />
      </View>
    </NavigationContainer>
  );
}
