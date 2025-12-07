import {
  View,
  ScrollView,
  StatusBar,
  TouchableOpacity,
  Text,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Feather } from "@expo/vector-icons";
import { useDispatch } from "react-redux";
import { useUser } from "../../../store/hooks";
import { clearUser } from "../../../store/slices/userSlice";
import { clearWallets } from "../../../store/slices/walletSlice";
import { WalletCard } from "../../components";
import SvgIcons from "../../../common/components/SvgIcons";
import {
  UpcomingPaymentsSection,
  SpendingAnalyticsSection,
  AITipsSection,
  QuickStatsSection,
} from "../../components/HomeContentSections";

const BusinessHomeScreen = ({ navigation }) => {
  const dispatch = useDispatch();

  // Get user data from Redux for debugging
  const user = useUser();
  console.log(user);

  // Handle logout
  const handleLogout = () => {
    Alert.alert(
      "تسجيل الخروج",
      "هل أنت متأكد من تسجيل الخروج؟",
      [
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

              console.log("User logged out successfully");
              // RootNavigator will automatically switch to AuthNavigator
            } catch (error) {
              console.error("Logout error:", error);
              Alert.alert("خطأ", "حدث خطأ أثناء تسجيل الخروج");
            }
          },
        },
      ]
    );
  };

  // Handle view all payments
  const handleViewAllPayments = () => {
    console.log("View all payments pressed");
    navigation.navigate("AllPayments", {
      primaryColor: "#0055aa"
    });
  };

  // Handle payment card press
  const handlePaymentPress = (payment) => {
    console.log("Payment pressed:", payment);
    navigation.navigate("UpcomingPayDetails", {
      payment,
      primaryColor: "#0055aa"
    });
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

      <ScrollView className="flex-1 bg-gray-50">
        {/* Wallet Card Component */}
        <WalletCard navigation={navigation}
          onTransferPress={() => navigation.navigate("BankTransfer")}
        />

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
          userId={user?.uid}
          onViewAll={handleViewAllPayments}
          onPaymentPress={handlePaymentPress}
        />
     
      </ScrollView>
    </View>
  );
};

export default BusinessHomeScreen;
