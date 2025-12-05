import { StatusBar } from "expo-status-bar";
import { View, I18nManager } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { RootNavigator } from "./src/navigation";
import { useEffect } from "react";
import { Provider } from "react-redux";
import { store } from "./src/store";
import { GestureHandlerRootView } from "react-native-gesture-handler";

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
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Provider store={store}>
        <NavigationContainer>
          <View className="flex-1 bg-background">
            <RootNavigator />
            <StatusBar style="auto" />
          </View>
        </NavigationContainer>
      </Provider>
    </GestureHandlerRootView>
  );
}
