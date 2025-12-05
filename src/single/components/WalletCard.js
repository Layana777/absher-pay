import { useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Feather } from "@expo/vector-icons";
import ActionButtons from "./ActionButtons";
import SvgIcons from "../../common/components/SvgIcons";
import { PaymentMethodSheet } from "../../common/components/wallet-topUp";
import { usePersonalWallet, useUser } from "../../store/hooks";

const WalletCard = ({ navigation, onTransferPress }) => {
  // Get personal wallet and user data from Redux
  const personalWallet = usePersonalWallet();
  const user = useUser();
  console.log("User data in WalletCard:", user);
  const [showPaymentMethodSheet, setShowPaymentMethodSheet] = useState(false);

  // Extract data from personal wallet
  const balance = personalWallet?.balance
    ? personalWallet.balance.toLocaleString("en-US", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      })
    : "0";

  const userName =
    user?.firstName + " " + user?.middleName + " " + user?.lastName ||
    "مستخدم أبشر";

  const handleTopupPress = () => {
    setShowPaymentMethodSheet(true);
  };

  const handleCloseSheet = () => {
    setShowPaymentMethodSheet(false);
  };

  return (
    <>
      <View
        className="bg-[#028550] rounded-b-3xl p-5"
        style={{ direction: "ltr" }}
      >
        {/* Header with User Name */}
        <View className="items-end mb-6">
          <Text className="text-white/80 text-sm mb-1">مرحباً</Text>
          <Text className="text-white text-xl font-bold mb-1">{userName}</Text>
        </View>

        {/* Main Balance Card */}
        <View className="bg-white/10 backdrop-blur rounded-3xl p-6 mb-4">
          {/* Balance with Side Buttons */}
          <View className="flex-row items-center justify-between mb-6 px-2">
            {/* Balance Display */}
            <View className="items-end flex-1 mx-5">
              <Text className="text-gray-300 text-sm text-right p-2">
                الرصيد المتاح
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
            onSecondaryPress={onTransferPress}
          />
        </View>
      </View>

      {/* Payment Method Sheet */}
      <PaymentMethodSheet
        visible={showPaymentMethodSheet}
        onClose={handleCloseSheet}
        navigation={navigation}
        primaryColor="#028550"
      />
    </>
  );
};

export default WalletCard;
