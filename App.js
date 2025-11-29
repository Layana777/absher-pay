import { StatusBar } from "expo-status-bar";
import { View } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { RootNavigator } from "./src/navigation";

export default function App() {
  return (
    <NavigationContainer>
      <View className="flex-1 bg-background">
        <RootNavigator />
        <StatusBar style="auto" />
      </View>
    </NavigationContainer>
  );
}
