import { StatusBar } from 'expo-status-bar';
import { Text, View, ScrollView } from 'react-native';
import { Button } from './src/common/components';

export default function App() {
  return (
    <View className="flex-1 bg-background">
      <ScrollView contentContainerClassName="p-6">
        <View className="items-center mb-8">
          <Text className="text-2xl font-bold text-text mt-12 mb-2">Absher Pay 💳</Text>
          <Text className="text-sm text-text-secondary">Clean Architecture - Multi App</Text>
        </View>

        {/* Single (Customer) App Colors */}
        <View className="bg-card rounded-xl p-4 mb-4">
          <Text className="text-lg font-semibold text-text mb-3">Single (Customer) App</Text>
          <Text className="text-sm text-text-secondary mb-3">Primary Color: #028550</Text>
          <View className="flex-row items-center mb-2">
            <View className="w-12 h-12 bg-single-primary rounded-lg mr-3" />
            <View className="w-12 h-12 bg-single-primary-light rounded-lg mr-3" />
            <View className="w-12 h-12 bg-single-primary-dark rounded-lg" />
          </View>
          <Button
            title="Customer Primary Button"
            variant="single-primary"
            onPress={() => alert('Customer Button Pressed!')}
            className="mt-2"
          />
        </View>

        {/* Business App Colors */}
        <View className="bg-card rounded-xl p-4 mb-4">
          <Text className="text-lg font-semibold text-text mb-3">Business App</Text>
          <Text className="text-sm text-text-secondary mb-3">Primary Color: #0055aa</Text>
          <View className="flex-row items-center mb-2">
            <View className="w-12 h-12 bg-business-primary rounded-lg mr-3" />
            <View className="w-12 h-12 bg-business-primary-light rounded-lg mr-3" />
            <View className="w-12 h-12 bg-business-primary-dark rounded-lg" />
          </View>
          <Button
            title="Business Primary Button"
            variant="business-primary"
            onPress={() => alert('Business Button Pressed!')}
            className="mt-2"
          />
        </View>

        {/* Default Colors */}
        <View className="bg-card rounded-xl p-4 mb-4">
          <Text className="text-lg font-semibold text-text mb-3">Default Buttons</Text>
          <Button
            title="Primary (Green)"
            variant="primary"
            onPress={() => {}}
            className="mb-3"
          />
          <Button
            title="Secondary (Blue)"
            variant="secondary"
            onPress={() => {}}
            className="mb-3"
          />
          <Button
            title="Success"
            variant="success"
            onPress={() => {}}
            className="mb-3"
          />
          <Button
            title="Outline"
            variant="outline"
            onPress={() => {}}
          />
        </View>

        <View className="items-center mt-4">
          <Text className="text-xs text-text-secondary">Background: #f8f8f8</Text>
          <Text className="text-xs text-text-secondary mt-1">Built with NativeWind 🎨</Text>
        </View>
      </ScrollView>
      <StatusBar style="auto" />
    </View>
  );
}
