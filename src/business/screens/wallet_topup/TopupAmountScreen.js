import React, { useState } from "react";
import { View, Text, TouchableOpacity, SafeAreaView } from "react-native";
import { Feather } from "@expo/vector-icons";
import AmountKeypad from "../../../common/components/wallet-topUp/AmountKeypad";
import { formatAmount } from "../../../common/utils";
import SvgIcons from "../../../common/components/SvgIcons";

const { SARBlack } = SvgIcons;

const TopupAmountScreen = ({ navigation, route }) => {
  const {
    paymentMethod,
    primaryColor = "#0055aa",
    cardData,
  } = route.params || {};
  const [amount, setAmount] = useState("");

  const quickAmounts = [50, 100, 200, 500];

  const handleQuickAmount = (value) => {
    setAmount(value.toString());
  };

  const handleKeypadPress = (value) => {
    if (value === "delete") {
      setAmount(amount.slice(0, -1));
    } else if (value === ".") {
      if (!amount.includes(".")) {
        setAmount(amount + value);
      }
    } else {
      // Limit to reasonable amount (e.g., 10000)
      const newAmount = amount + value;
      if (parseFloat(newAmount) <= 10000) {
        setAmount(newAmount);
      }
    }
  };

  const handleConfirm = () => {
    const parsedAmount = parseFloat(amount);
    if (parsedAmount > 0) {
      navigation.navigate("TopupTransactionDetails", {
        amount: parsedAmount,
        paymentMethod,
        primaryColor,
        cardData,
      });
    }
  };

  const displayAmount = formatAmount(amount);

  return (
    <SafeAreaView className="flex-1 bg-backgroundRGB">
      <View className="flex-1">
        {/* Header */}
        <View className="flex-row items-center px-4 py-4 border-b bg-white border-gray-200">
          <TouchableOpacity onPress={() => navigation.goBack()} className="p-2">
            <Feather name="arrow-right" size={24} color="#000" />
          </TouchableOpacity>
          <Text className="flex-1 text-lg font-semibold text-center mr-10">
            إضافة رصيد
          </Text>
        </View>

        {/* Content */}
        <View className="flex-1 px-6 pt-8">
          {/* Payment Method Info */}
          <View className="items-center mb-6">
            <Text className="text-gray-600 text-sm mb-2">طريقة الدفع</Text>
            <View className="flex-row items-center">
              <SvgIcons name={"Apple"} size={21} />
              <Text className="text-base font-medium mr-2">
                {paymentMethod === "APPLE_PAY" ? "Apple Pay" : "البطاقة"}
              </Text>
            </View>
          </View>

          {/* Amount Display */}
          <View className="items-center mb-8">
            <Text className="text-gray-600 text-sm mb-2">المبلغ</Text>
            <View className="flex-row items-center">
              <Text className="text-5xl font-bold mr-2">{displayAmount}</Text>
              <SvgIcons name={"SARBlack"} size={35} />
            </View>
          </View>

          {/* Quick Amount Buttons */}
          <View className="flex-row justify-between mb-3">
            {quickAmounts.map((value) => (
              <TouchableOpacity
                key={value}
                onPress={() => handleQuickAmount(value)}
                className="border border-gray-300 rounded-lg px-4 py-3 flex-1 mx-1"
                style={{
                  borderColor:
                    amount === value.toString() ? primaryColor : "#D1D5DB",
                  backgroundColor:
                    amount === value.toString() ? `${primaryColor}10` : "white",
                }}
              >
                <Text
                  className="text-center font-medium"
                  style={{
                    color:
                      amount === value.toString() ? primaryColor : "#374151",
                  }}
                >
                  {value}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Custom Keypad */}
          <AmountKeypad
            onKeyPress={handleKeypadPress}
            primaryColor={primaryColor}
          />
        </View>

        {/* Confirm Button */}
        <View className="px-6">
          <TouchableOpacity
            onPress={handleConfirm}
            disabled={!amount || parseFloat(amount) <= 0}
            className="rounded-lg py-4"
            style={{
              backgroundColor:
                amount && parseFloat(amount) > 0 ? primaryColor : "#D1D5DB",
            }}
          >
            <Text className="text-white text-center text-base font-semibold">
              تأكيد
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default TopupAmountScreen;
