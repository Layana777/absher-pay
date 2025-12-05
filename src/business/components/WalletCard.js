import React, { useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Feather } from "@expo/vector-icons";
import ActionButtons from "./ActionButtons";
import SvgIcons from "../../common/components/SvgIcons";
import { PaymentMethodSheet } from "../../common/components/wallet-topUp";
import { useBusinessWallet } from "../../store/hooks";

const WalletCard = ({ navigation }) => {
  // Get business wallet data from Redux
  const businessWallet = useBusinessWallet();
  const [showPaymentMethodSheet, setShowPaymentMethodSheet] = useState(false);

  // Extract data from business wallet
  const balance = businessWallet?.balance
    ? businessWallet.balance.toLocaleString("en-US", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      })
    : "0";

  const institution =
    businessWallet?.businessInfo?.companyName || "مؤسسة تجارية";
  const crNumber = businessWallet?.businessInfo?.commercialRegistration || "";

  const handleTopupPress = () => {
    setShowPaymentMethodSheet(true);
  };

  const handleCloseSheet = () => {
    setShowPaymentMethodSheet(false);
  };

  return (
    <>
      <View
        className="bg-[#0055aa] rounded-b-3xl p-5"
        style={{ direction: "ltr" }}
      >
        {/* Header with Institution Name */}

        <View className="items-end mb-6 ">
          <Text className="text-white/80 text-sm mb-1">مرحباً</Text>
          <Text className="text-white text-xl font-bold mb-1">
            {institution}
          </Text>
          <Text className="text-white/60 text-xs">س.ت {crNumber}</Text>
        </View>

        {/* Main Balance Card */}
        <View className="bg-white/10 backdrop-blur rounded-3xl p-6 mb-4">
          {/* Balance with Side Buttons */}
          <View className="flex-row items-center justify-between mb-6 px-2">
            {/* Balance Display */}
            <View className="items-end flex-1 mx-5 ">
              <Text className="text-gray-300 text-sm text-right p-2">
                رصيد المحفظة
              </Text>
              <View className="flex-row items-center">
                <SvgIcons name={"SAR"} size={35} />
                <Text className="text-gray-200 text-4xl font-bold">
                  {balance}
                </Text>
              </View>
            </View>
            <TouchableOpacity className="w-14 h-14 bg-white/20 rounded-xl items-center justify-center">
              <Feather name="credit-card" size={28} color="white" />
            </TouchableOpacity>
          </View>

          {/* Action Buttons */}
          <ActionButtons
            primaryText="شحن المحفظة"
            secondaryText="+ تحويل"
            size="small"
            onPrimaryPress={handleTopupPress}
          />
        </View>

        {/* Monthly Total Section */}
        <View className="bg-white/10 backdrop-blur rounded-3xl p-6">
          <Text className="text-white/90 text-sm mb-4 text-right">
            إجمالي المدفوعات هذا الشهر
          </Text>

          {/* Amount Display */}
          <View className="items-end mb-4">
            <View className="flex-row items-center justify-center">
              <SvgIcons name={"SAR"} size={35} />
              <Text className="text-white text-4xl font-bold">0.00</Text>
            </View>

            {/* Percentage Growth */}
            <View className="flex-row items-center mt-3">
              <Feather name="trending-up" size={16} color="#86efac" />
              <Text className="text-green-300 text-sm font-bold mr-2">
                17.1% عن الشهر الماضي
              </Text>
            </View>
          </View>

          {/* Action Buttons */}
          <ActionButtons
            primaryText="عرض التفاصيل"
            secondaryText="التقارير"
            size="small"
          />
        </View>
      </View>

      {/* Payment Method Sheet */}
      <PaymentMethodSheet
        visible={showPaymentMethodSheet}
        onClose={handleCloseSheet}
        navigation={navigation}
        primaryColor="#0055aa"
      />
    </>
  );
};

export default WalletCard;
