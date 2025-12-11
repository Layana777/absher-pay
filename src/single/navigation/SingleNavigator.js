import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Feather } from "@expo/vector-icons";
import { Text } from "react-native";
import { SingleHomeScreen, UpcomingPayDetailsScreen } from "../screens";
import { OtpVerificationScreen } from "../../common/screens";
import {
  TopupAmountScreen,
  TopupTransactionDetailsScreen,
  TopupSuccessScreen,
  CardSelectionScreen,
  AddCardScreen,
} from "../screens/wallet_topup";
import SingleBankTransferScreen from "../screens/transformation/SingleBankTransferScreen";
import SingleTransferReceiptScreen from "../screens/transformation/SingleTransferReceiptScreen";
import SingleAddBankAccountScreen from "../screens/transformation/SingleAddBankAccountScreen";
import SingleBankAccountSuccessScreen from "../screens/transformation/SingleBankAccountSuccessScreen";
import {
  BillPaymentOtpScreen,
  BillPaymentSuccessScreen,
} from "../../business/screens/BillPayment";
import ScheduleSuccessScreen from "../../business/screens/Dashboard/ScheduleSuccessScreen";
import AllPaymentsScreen from "../../business/screens/Dashboard/AllPaymentsScreen";

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// Placeholder screen component for tabs
const PlaceholderScreen = ({ route }) => {
  const { View, StatusBar, TouchableOpacity } = require("react-native");

  return (
    <View className="flex-1 bg-gray-50" style={{ direction: "ltr" }}>
      <StatusBar barStyle="light-content" backgroundColor="#028550" />

      {/* Header */}
      <View className="bg-[#028550] pt-12 pb-6 px-6">
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
const SingleTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#028550",
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
        component={SingleHomeScreen}
        options={{
          tabBarLabel: "الرئيسية",
          tabBarIcon: ({ color, size }) => (
            <Feather name="home" size={size} color={color} />
          ),
        }}
      />

      <Tab.Screen
        name="Services"
        component={PlaceholderScreen}
        initialParams={{ title: "الخدمات", icon: "grid" }}
        options={{
          tabBarLabel: "الخدمات",
          tabBarIcon: ({ color, size }) => (
            <Feather name="grid" size={size} color={color} />
          ),
        }}
      />

      <Tab.Screen
        name="Transactions"
        component={PlaceholderScreen}
        initialParams={{ title: "المعاملات", icon: "list" }}
        options={{
          tabBarLabel: "المعاملات",
          tabBarIcon: ({ color, size }) => (
            <Feather name="list" size={size} color={color} />
          ),
        }}
      />

      <Tab.Screen
        name="Offers"
        component={PlaceholderScreen}
        initialParams={{ title: "العروض", icon: "gift" }}
        options={{
          tabBarLabel: "العروض",
          tabBarIcon: ({ color, size }) => (
            <Feather name="gift" size={size} color={color} />
          ),
        }}
      />

      <Tab.Screen
        name="Settings"
        component={PlaceholderScreen}
        initialParams={{ title: "الإعدادات", icon: "settings" }}
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

// Main Single Navigator - Combines tabs and standalone screens
const SingleNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      {/* Main Tabs - Default screen */}
      <Stack.Screen name="SingleTabs" component={SingleTabNavigator} />

      {/* Standalone screens without tabs */}
      <Stack.Screen name="OtpVerification" component={OtpVerificationScreen} />
      <Stack.Screen name="SingleHome" component={SingleHomeScreen} />
      <Stack.Screen name="UpcomingPayDetails" component={UpcomingPayDetailsScreen} />
      <Stack.Screen name="AllPayments" component={AllPaymentsScreen} />

      {/* Bill Payment Flow Screens */}
      <Stack.Screen name="BillPaymentOtp" component={BillPaymentOtpScreen} />
      <Stack.Screen name="BillPaymentSuccess" component={BillPaymentSuccessScreen} />
      <Stack.Screen name="ScheduleSuccess" component={ScheduleSuccessScreen} />

      {/* Wallet Topup Flow Screens */}
      <Stack.Screen name="CardSelection" component={CardSelectionScreen} />
      <Stack.Screen name="AddCard" component={AddCardScreen} />
      <Stack.Screen name="TopupAmount" component={TopupAmountScreen} />
      <Stack.Screen name="TopupTransactionDetails" component={TopupTransactionDetailsScreen} />
      <Stack.Screen name="TopupSuccess" component={TopupSuccessScreen} />

      {/* Bank Transfer Flow Screens */}
      <Stack.Screen name="SingleBankTransfer" component={SingleBankTransferScreen} />
      <Stack.Screen name="SingleTransferReceipt" component={SingleTransferReceiptScreen} />
      <Stack.Screen name="AddBankAccount" component={SingleAddBankAccountScreen} />
      <Stack.Screen name="SingleBankAccountSuccess" component={SingleBankAccountSuccessScreen} />
    </Stack.Navigator>
  );
};

export default SingleNavigator;
