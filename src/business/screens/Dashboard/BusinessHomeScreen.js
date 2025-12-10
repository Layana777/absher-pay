import {
  View,
  ScrollView,
  StatusBar,
  TouchableOpacity,
  Text,
  Alert,
  RefreshControl,
} from "react-native";
import React, { useState, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Feather } from "@expo/vector-icons";
import { useDispatch } from "react-redux";
import { useUser } from "../../../store/hooks";
import { clearUser } from "../../../store/slices/userSlice";
import { clearWallets, setWallets } from "../../../store/slices/walletSlice";
import { getWalletsByUserId } from "../../../common/services/walletService";
import { WalletCard } from "../../components";
import SvgIcons from "../../../common/components/SvgIcons";
import {
  UpcomingPaymentsSection,
  SpendingAnalyticsSection,
  AITipsSection,
  QuickStatsSection,
} from "../../components/HomeContentSections";
import ScheduledPaymentsSection from "../../../common/components/ScheduledPaymentsSection";
import AIInsightsSection from "../../components/AIInsightsSection";
import { getUserBills } from "../../../common/services/billsService";
import { clearInsightsCache } from "../../../common/services/aiInsightsService";

const BusinessHomeScreen = ({ navigation }) => {
  const dispatch = useDispatch();

  // Get user data from Redux for debugging
  const user = useUser();
  console.log(user);

  const [refreshing, setRefreshing] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const onRefresh = useCallback(async () => {
    if (!user?.uid) return;

    setRefreshing(true);
    try {
      // 1. Fetch fresh wallet data
      const wallets = await getWalletsByUserId(user.uid);

      // 2. Update Redux store
      dispatch(setWallets(wallets));

      // 3. Force re-fetch of upcoming payments
      setRefreshKey((prev) => prev + 1);
    } catch (error) {
      console.error("Error refreshing data:", error);
      Alert.alert("خطأ", "فشل تحديث البيانات");
    } finally {
      setRefreshing(false);
    }
  }, [user?.uid, dispatch]);

  // Handle logout
  const handleLogout = () => {
    Alert.alert("تسجيل الخروج", "هل أنت متأكد من تسجيل الخروج؟", [
      {
        text: "إلغاء",
        style: "cancel",
      },
      {
        text: "تسجيل الخروج",
        style: "destructive",
        onPress: async () => {
          try {
            // Clear Redux state
            dispatch(clearUser());
            dispatch(clearWallets());

            // Clear AsyncStorage
            await AsyncStorage.removeItem("authToken");
            await AsyncStorage.removeItem("userType");

            // Clear AI insights cache
            await clearInsightsCache();

            console.log("User logged out successfully");
            // RootNavigator will automatically switch to AuthNavigator
          } catch (error) {
            console.error("Logout error:", error);
            Alert.alert("خطأ", "حدث خطأ أثناء تسجيل الخروج");
          }
        },
      },
    ]);
  };

  // Handle view all payments
  const handleViewAllPayments = () => {
    console.log("View all payments pressed");
    navigation.navigate("AllPayments", {
      primaryColor: "#0055aa",
    });
  };

  // Handle payment card press
  const handlePaymentPress = (payment) => {
    console.log("Payment pressed:", payment);
    navigation.navigate("UpcomingPayDetails", {
      payment,
      primaryColor: "#0055aa",
    });
  };

  // Handle view all scheduled bills
  const handleViewAllScheduledBills = () => {
    console.log("View all scheduled bills pressed");
    navigation.navigate("ScheduledBills");
  };

  // Handle AI insight card press (navigate to bill if actionable)
  const handleInsightPress = async (billId) => {
    try {
      console.log("AI Insight pressed for bill:", billId);
      // Fetch the bill data
      const bills = await getUserBills(user?.uid);
      const bill = bills.find((b) => b.id === billId);

      if (bill) {
        // Navigate to payment details with the bill
        navigation.navigate("UpcomingPayDetails", {
          payment: {
            id: bill.id,
            billData: bill,
          },
          primaryColor: "#0055aa",
        });
      }
    } catch (error) {
      console.error("Error navigating to bill from insight:", error);
    }
  };

  return (
    <View className="flex-1 bg-white" style={{ direction: "ltr" }}>
      <StatusBar barStyle="light-content" backgroundColor="#0055aa" />

      {/* Top Header with Notification and Menu */}
      <View className="bg-[#0055aa] pt-12 pb-4 px-6 flex-row justify-between items-center">
        <TouchableOpacity className="relative" onPress={handleLogout}>
          <Feather name="bell" size={24} color="white" />
          <View className="absolute -top-1 -right-1 bg-red-500 rounded-full w-4 h-4 items-center justify-center">
            <Text className="text-white text-xs font-bold">3</Text>
          </View>
        </TouchableOpacity>

        <SvgIcons name={"AbsherWhite"} size={45} />
      </View>

      <ScrollView
        className="flex-1 bg-gray-50"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#0055aa"]}
          />
        }
      >
        {/* Wallet Card Component */}
        <WalletCard
          navigation={navigation}
          onTransferPress={() => navigation.navigate("BankTransfer")}
        />

        {/* AI Insights Section */}

        {/* Home Content Sections - Reusable Components */}
        {/*
          Example with custom data:
          <UpcomingPaymentsSection
            payments={customPayments}
            onViewAll={handleViewAllPayments}
            onPaymentPress={handlePaymentPress}
            title="المدفوعات العاجلة"
            showViewAll={true}
          />
        */}

        <UpcomingPaymentsSection
          key={refreshKey}
          userId={user?.uid}
          onViewAll={handleViewAllPayments}
          onPaymentPress={handlePaymentPress}
        />

        {/* Scheduled Payments Section */}
        <ScheduledPaymentsSection
          key={`scheduled-${refreshKey}`}
          userId={user?.uid}
          onViewAll={handleViewAllScheduledBills}
          onPaymentPress={handlePaymentPress}
        />

        <AIInsightsSection
          userId={user?.uid}
          onInsightPress={handleInsightPress}
        />
      </ScrollView>
    </View>
  );
};

export default BusinessHomeScreen;
