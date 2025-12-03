import React from "react";
import {
  View,
  ScrollView,
  StatusBar,
  TouchableOpacity,
  Text,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useUser } from "../../../store/hooks";
import { WalletCard } from "../../components";
import SvgIcons from "../../../common/components/SvgIcons";

const BusinessHomeScreen = ({ navigation }) => {
  // Get user data from Redux
  const user = useUser();
  console.log(user);

  // Extract business information from user data
  const businessName =
    user?.businessName || user?.companyName || "مؤسسة تجارية";
  const crNumber =
    user?.crNumber || user?.commercialRegistration || "غير متوفر";
  const balance = user?.balance || user?.walletBalance || "0";

  return (
    <View className="flex-1 bg-white" style={{ direction: "ltr" }}>
      <StatusBar barStyle="light-content" backgroundColor="#0055aa" />

      {/* Top Header with Notification and Menu */}
      <View className="bg-[#0055aa] pt-12 pb-4 px-6 flex-row justify-between items-center">
        <TouchableOpacity className="relative">
          <Feather name="bell" size={24} color="white" />
          <View className="absolute -top-1 -right-1 bg-red-500 rounded-full w-4 h-4 items-center justify-center">
            <Text className="text-white text-xs font-bold">3</Text>
          </View>
        </TouchableOpacity>

        <SvgIcons name={"AbsherWhite"} size={45} />
      </View>

      <ScrollView className="flex-1 bg-gray-50">
        {/* Wallet Card Component */}
        <WalletCard
          balance={balance}
          institution={businessName}
          crNumber={crNumber}
        />
      </ScrollView>
    </View>
  );
};

export default BusinessHomeScreen;
