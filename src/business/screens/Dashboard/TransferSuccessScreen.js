import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Feather } from "@expo/vector-icons";
import { CommonActions } from "@react-navigation/native";
import Button from "../../../common/components/ui/Button";
import CustomHeader from "../../../common/components/CustomHeader";
import { useBusinessWallet } from "../../../store/hooks";
import SvgIcons from "../../../common/components/SvgIcons";
import { formatAmount } from "../../../common/utils";

const TransferSuccessScreen = ({ navigation, route }) => {
  const { amount, bankName, iban, transactionId, referenceNumber } = route?.params || {};
  const businessWallet = useBusinessWallet();

  const handleGoToDashboard = () => {
    // Reset navigation stack to prevent going back to this screen
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: "BusinessTabs" }],
      })
    );
  };

  const balance = businessWallet?.balance
    ? businessWallet.balance.toLocaleString("en-US", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      })
    : "0";

  return (
    <View className="flex-1 bg-gray-50" style={{ direction: "ltr" }}>
      <CustomHeader
        title="إيصال تحويل"
        onBack={handleGoToDashboard}
        backgroundColor="#0055aa"
        textColor="#FFFFFF"
        statusBarStyle="light-content"
        statusBarBackgroundColor="#0055aa"
      />

      <View className="flex-1 items-center justify-center px-6">
        {/* Success Icon */}
        <View className="bg-green-100 rounded-full w-32 h-32 items-center justify-center mb-8">
          <View className="bg-green-500 rounded-full w-28 h-28 items-center justify-center">
            <Feather name="check" size={64} color="white" />
          </View>
        </View>

        {/* Success Message */}
        <Text className="text-gray-600 text-base text-center mb-8 leading-6">
          تم تحويل المبلغ بنجاح{"\n"}
          سيصل إلى حسابك البنكي خلال 24 ساعة
        </Text>

        {/* Transfer Details Card */}
        <View className="bg-white rounded-2xl p-5 w-full mb-6 shadow-sm">
          {/* Amount */}
          <View className="flex-row-reverse justify-between items-center mb-4 pb-4 border-b border-gray-100">
            <Text className="text-gray-500 text-sm">المبلغ المحول</Text>
            <View
              className="flex-row items-center"
              style={{ direction: "ltr" }}
            >
              <SvgIcons name="SARBlack" size={24} />
              <Text className="text-gray-800 text-xl font-bold ml-1">
                {formatAmount(amount)}
              </Text>
            </View>
          </View>

          {/* Bank Name */}
          <View className="flex-row-reverse justify-between items-center mb-4 pb-4 border-b border-gray-100">
            <Text className="text-gray-500 text-sm">إلى</Text>
            <Text className="text-gray-800 text-base font-semibold">
              {bankName || "الحساب البنكي"}
            </Text>
          </View>

          {/* IBAN */}
          <View className="flex-row-reverse justify-between items-center mb-4 pb-4 border-b border-gray-100">
            <Text className="text-gray-500 text-sm">رقم الحساب</Text>
            <Text className="text-gray-800 text-sm font-mono">
              {iban || "SA•••• •••• •••• ••••"}
            </Text>
          </View>

          {/* New Balance */}
          <View className="flex-row-reverse justify-between items-center mb-4 pb-4 border-b border-gray-100">
            <Text className="text-gray-500 text-sm">الرصيد الحالي</Text>
            <View
              className="flex-row items-center"
              style={{ direction: "ltr" }}
            >
              <SvgIcons name="SARBlack" size={20} />
              <Text className="text-gray-800 text-lg font-bold">{balance}</Text>
            </View>
          </View>

          {/* Reference Number */}
          {referenceNumber && (
            <View className="flex-row-reverse justify-between items-center mb-4 pb-4 border-b border-gray-100">
              <Text className="text-gray-500 text-sm">رقم المرجع</Text>
              <Text className="text-gray-800 text-sm font-mono font-semibold">
                {referenceNumber}
              </Text>
            </View>
          )}

          {/* Transaction ID */}
          {transactionId && (
            <View className="flex-row-reverse justify-between items-center">
              <Text className="text-gray-500 text-sm">رقم المعاملة</Text>
              <Text className="text-gray-800 text-xs font-mono">
                {transactionId.slice(-12)}
              </Text>
            </View>
          )}
        </View>

        {/* Buttons */}
        <View className="w-full">
          {/* Go to Dashboard Button */}
          <Button
            title="العودة للرئيسية"
            onPress={handleGoToDashboard}
            variant="business-primary"
            className="w-full"
          />
        </View>
      </View>
    </View>
  );
};

export default TransferSuccessScreen;
