import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  SafeAreaView,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import SvgIcons from "../../../common/components/SvgIcons";
import { useBusinessWallet, useUser } from "../../../store/hooks";
import { SIZES } from "../../../common/constants/sizes";

const BankTransferScreen = ({ navigation }) => {
  const [amount, setAmount] = useState("");

  // Get user data from Redux
  const user = useUser();
  // Get business wallet data from Redux
  const businessWallet = useBusinessWallet();
  console.log("getting the business wallet balance" , businessWallet)
  const balance = businessWallet?.balance
    ? businessWallet.balance.toLocaleString("en-US", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      })
    : "0";
  const linkedBank = {
    name: "مصرف الراجحي",
    accountNumber: "SA•••• •••• •••• 9813",
    isVerified: true,
  };

  const quickAmounts = [100, 500, 1000, 5000];

  const handleQuickAmount = (value) => {
    setAmount(value.toString());
  };

  const handleContinue = () => {
    // TODO: Implement transfer logic
    console.log("Transfer amount:", amount);
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-[#0055aa] px-5 py-4">
        <View className="flex-row items-center justify-between">
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            className="p-2"
          >
            <Feather name="arrow-right" size={24} color="white" />
          </TouchableOpacity>
          <Text className="text-white text-lg font-bold">التحويل البنكي</Text>
          <View className="w-10" />
        </View>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Current Balance Card */}
        <View className="bg-white mx-4 mt-5 rounded-2xl p-5 shadow-sm">
          <Text className="text-gray-500 text-sm text-center mb-2">
            الرصيد المتاح
          </Text>
          <View className="flex-row items-center justify-center">
            <SvgIcons name="SAR" size={30} />
            <Text className="text-gray-800 text-3xl font-bold mr-2">
              {balance}
            </Text>
          </View>
        </View>

        {/* Linked Bank Account Card */}
        <View className="bg-white mx-4 mt-4 rounded-2xl p-5 shadow-sm">
          <View className="flex-row items-center justify-between mb-4">
            <TouchableOpacity className="px-3 py-1">
              <Text className="text-[#0055aa] text-sm font-semibold">
                تغيير
              </Text>
            </TouchableOpacity>
            <Text className="text-gray-700 text-sm font-semibold">
              الحساب البنكي المربوط
            </Text>
          </View>

          <View className="flex-row items-center justify-between bg-gray-50 rounded-xl p-4">
            {/* Bank Icon */}
            <View className="bg-[#0055aa] rounded-xl w-12 h-12 items-center justify-center">
              <Feather name="briefcase" size={24} color="white" />
            </View>

            {/* Bank Info */}
            <View className="flex-1 mx-3 items-end">
              <Text className="text-gray-800 text-base font-bold mb-1">
                {linkedBank.name}
              </Text>
              <Text className="text-gray-500 text-sm">
                {linkedBank.accountNumber}
              </Text>
            </View>

            {/* Verified Icon */}
            <View className="bg-green-500 rounded-full w-8 h-8 items-center justify-center">
              <Feather name="check" size={18} color="white" />
            </View>
          </View>
        </View>

        {/* Transfer Amount Card */}
        <View className="bg-white mx-4 mt-4 rounded-2xl p-5 shadow-sm">
          <Text className="text-gray-700 text-sm font-semibold text-center mb-4">
            المبلغ المطلوب تحويله
          </Text>

          {/* Amount Input */}
          <View className="bg-gray-50 rounded-xl p-4 mb-4">
            <View className="flex-row items-center justify-center">
              <SvgIcons name="SAR" size={24} />
              <TextInput
                className="text-gray-800 text-2xl font-bold text-center flex-1 mr-2"
                style={{ fontSize: SIZES.fontSize.xxl }}
                value={amount}
                onChangeText={setAmount}
                keyboardType="numeric"
                placeholder="0"
                placeholderTextColor="#9ca3af"
              />
            </View>
          </View>

          {/* Quick Amount Buttons */}
          <View className="flex-row justify-between mb-4">
            {quickAmounts.map((quickAmount) => (
              <TouchableOpacity
                key={quickAmount}
                onPress={() => handleQuickAmount(quickAmount)}
                className="bg-gray-100 px-4 py-2 rounded-lg"
              >
                <Text className="text-gray-700 text-sm font-semibold">
                  {quickAmount.toLocaleString()}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Continue Button */}
          <TouchableOpacity
            onPress={handleContinue}
            className="bg-[#4a9eda] rounded-xl py-4 items-center"
            disabled={!amount || amount === "0"}
          >
            <Text className="text-white text-base font-bold">متابعة</Text>
          </TouchableOpacity>
        </View>

        {/* Notice */}
        <View className="bg-blue-50 mx-4 mt-4 mb-6 rounded-xl p-4">
          <Text className="text-[#0055aa] text-xs text-center leading-5">
            سيتم تحويل المبلغ إلى حسابك البنكي خلال 24 ساعة من وقت تأكيد العملية
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default BankTransferScreen;
