import { StatusBar } from "expo-status-bar";
import { Text, View, ScrollView } from "react-native";
import { Button } from "./src/common/components";

export default function App() {
  return (
    <View className="flex-1 bg-background">
      <StatusBar style="auto" />
    </View>
  );
}
