import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Feather } from "@expo/vector-icons";
import { Text } from "react-native";
import { BusinessHomeScreen, SettingsScreen } from "../screens";
import {
  CardSelectionScreen,
  AddCardScreen,
  TopupAmountScreen,
  TopupSuccessScreen,
  TopupTransactionBusinessDetailsScreen,
} from "../screens/wallet_topup";
import { OtpVerificationScreen } from "../../common/screens";
import AiBusinessChatScreen from "../screens/aiBussenis/AiBusinessChatScreen";
import BankTransferScreen from "../screens/Dashboard/BankTransferScreen";
import UpcomingPayDetailsScreen from "../screens/Dashboard/UpcomingPayDetailsScreen";

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// Placeholder screen component for tabs
const PlaceholderScreen = ({ route }) => {
  const { View, StatusBar, TouchableOpacity } = require("react-native");

  return (
    <View className="flex-1 bg-gray-50" style={{ direction: "ltr" }}>
      <StatusBar barStyle="light-content" backgroundColor="#0055aa" />

      {/* Header */}
      <View className="bg-[#0055aa] pt-12 pb-6 px-6">
        <View className="flex-row justify-between items-center mb-4">
          <TouchableOpacity className="relative">
            <Feather name="bell" size={24} color="white" />
            <View className="absolute -top-1 -right-1 bg-red-500 rounded-full w-4 h-4 items-center justify-center">
              <Text className="text-white text-xs font-bold">3</Text>
            </View>
          </TouchableOpacity>

          <Text className="text-white text-xl font-bold">
            {route.params?.title || "الصفحة"}
          </Text>

          <View style={{ width: 24 }} />
        </View>
      </View>

      {/* Content */}
      <View className="flex-1 items-center justify-center p-6">
        <Feather
          name={route.params?.icon || "circle"}
          size={64}
          color="#d1d5db"
        />
        <Text className="text-gray-400 text-lg mt-4 text-center">
          {route.params?.title || "الصفحة"}
        </Text>
        <Text className="text-gray-400 text-sm mt-2 text-center">
          سيتم إضافة المحتوى قريباً
        </Text>
      </View>
    </View>
  );
};

// Bottom Tab Navigator - Main screens with tabs
const BusinessTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#0055aa",
        tabBarInactiveTintColor: "#9ca3af",
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "600",
        },
        tabBarStyle: {
          backgroundColor: "white",
          borderTopWidth: 1,
          borderTopColor: "#e5e7eb",
          paddingBottom: 8,
          paddingTop: 10,
          height: 90,
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={BusinessHomeScreen}
        options={{
          tabBarLabel: "الرئيسية",
          tabBarIcon: ({ color, size }) => (
            <Feather name="home" size={size} color={color} />
          ),
        }}
      />

      <Tab.Screen
        name="Payments"
        component={PlaceholderScreen}
        initialParams={{ title: "المدفوعات", icon: "credit-card" }}
        options={{
          tabBarLabel: "المدفوعات",
          tabBarIcon: ({ color, size }) => (
            <Feather name="credit-card" size={size} color={color} />
          ),
        }}
      />

      <Tab.Screen
        name="Support"
        component={AiBusinessChatScreen}
        options={{
          tabBarLabel: "المساعد",
          tabBarIcon: ({ color, size }) => (
            <Feather name="message-circle" size={size} color={color} />
          ),
        }}
      />

      <Tab.Screen
        name="Reports"
        component={PlaceholderScreen}
        initialParams={{ title: "الإيصالات", icon: "file-text" }}
        options={{
          tabBarLabel: "الإيصالات",
          tabBarIcon: ({ color, size }) => (
            <Feather name="file-text" size={size} color={color} />
          ),
        }}
      />

      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarLabel: "الإعدادات",
          tabBarIcon: ({ color, size }) => (
            <Feather name="settings" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

// Main Business Navigator - Combines tabs and standalone screens
const BusinessNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      {/* Main Tabs - Default screen */}
      <Stack.Screen name="BusinessTabs" component={BusinessTabNavigator} />

      {/* Wallet Top-up Flow Screens */}
      <Stack.Screen name="CardSelection" component={CardSelectionScreen} />
      <Stack.Screen name="AddCard" component={AddCardScreen} />
      <Stack.Screen name="TopupAmount" component={TopupAmountScreen} />
      <Stack.Screen
        name="TopupTransactionDetails"
        component={TopupTransactionBusinessDetailsScreen}
      />
      <Stack.Screen name="OtpVerification" component={OtpVerificationScreen} />
      <Stack.Screen name="TopupSuccess" component={TopupSuccessScreen} />
      <Stack.Screen name="BusinessHome" component={BusinessHomeScreen} />
      <Stack.Screen name="BankTransfer" component={BankTransferScreen} />

      {/* Payment Details Screen */}
      <Stack.Screen name="UpcomingPayDetails" component={UpcomingPayDetailsScreen} />

      {/* Standalone screens without tabs - Add your screens here */}
      {/* Example:
      <Stack.Screen name="Profile" component={ProfileScreen} />
      <Stack.Screen name="TransactionHistory" component={TransactionHistoryScreen} />
      */}
    </Stack.Navigator>
  );
};

export default BusinessNavigator;
