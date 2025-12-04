import React, { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { Feather } from "@expo/vector-icons";
import SvgIcons from "../SvgIcons";
import AmountKeypad from "./AmountKeypad";

const TopupAmountScreen = ({ paymentMethod, onConfirm, onBack, primaryColor = "#0055aa" }) => {
  const [amount, setAmount] = useState("3");

  const handleNumberPress = (num) => {
    if (amount === "0" || amount === "3") {
      setAmount(num);
    } else {
      // Limit to reasonable amount
      if (amount.length < 7) {
        setAmount(amount + num);
      }
    }
  };

  const handleDelete = () => {
    if (amount.length > 1) {
      setAmount(amount.slice(0, -1));
    } else {
      setAmount("0");
    }
  };

  const handleConfirm = () => {
    const parsedAmount = parseFloat(amount);
    if (parsedAmount > 0) {
      onConfirm(parsedAmount);
    }
  };

  const getPaymentMethodInfo = () => {
    if (paymentMethod === "APPLE_PAY") {
      return {
        icon: "smartphone",
        title: "أبل باي",
        description: "ادفع باستخدام Face ID أو Touch ID",
        bgColor: "bg-[#1a1a1a]",
        textColor: "text-white",
      };
    } else {
      return {
        icon: "CreditCard",
        title: "بطاقة فيزا",
        description: "ادفع باستخدام بطاقتك الائتمانية",
        bgColor: primaryColor,
        textColor: "text-white",
      };
    }
  };

  const methodInfo = getPaymentMethodInfo();

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white px-6 pt-12 pb-6 shadow-sm">
        <TouchableOpacity
          onPress={onBack}
          className="flex-row items-center mb-4"
        >
          <Feather name="arrow-right" size={24} color="#374151" />
          <Text className="text-gray-900 text-base font-semibold mr-3">
            رجوع
          </Text>
        </TouchableOpacity>

        <Text className="text-gray-900 text-2xl font-bold text-right">
          إضافة رصيد
        </Text>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-6 py-6">
          {/* Payment Method Banner */}
          <View
            style={{ backgroundColor: typeof methodInfo.bgColor === 'string' && methodInfo.bgColor.startsWith('#') ? methodInfo.bgColor : undefined }}
            className={`${typeof methodInfo.bgColor === 'string' && !methodInfo.bgColor.startsWith('#') ? methodInfo.bgColor : ''} rounded-2xl p-5 mb-6 flex-row items-center`}
          >
            <View className="flex-1">
              <View className="flex-row items-center justify-end mb-1">
                {paymentMethod === "APPLE_PAY" ? (
                  <Feather name={methodInfo.icon} size={20} color="white" />
                ) : (
                  <SvgIcons name={methodInfo.icon} size={20} />
                )}
                <Text className={`${methodInfo.textColor} text-lg font-bold mr-2`}>
                  {methodInfo.title}
                </Text>
              </View>
              <Text className={`${methodInfo.textColor}/80 text-xs text-right`}>
                {methodInfo.description}
              </Text>
            </View>
          </View>

          {/* Amount Display */}
          <View className="bg-white rounded-3xl p-8 mb-6 shadow-sm">
            <Text className="text-gray-500 text-sm text-center mb-2">
              رصيد المحفظة
            </Text>
            <View className="flex-row items-center justify-center mb-4">
              <SvgIcons name="SAR" size={45} />
              <Text
                className="text-gray-900 text-6xl font-bold"
                style={{
                  fontVariant: ["tabular-nums"],
                }}
              >
                {amount}
              </Text>
            </View>
            <Text className="text-gray-400 text-sm text-center">
              أدخل المبلغ الذي تريد إضافته
            </Text>
          </View>

          {/* Keypad */}
          <AmountKeypad
            onNumberPress={handleNumberPress}
            onDelete={handleDelete}
          />
        </View>
      </ScrollView>

      {/* Confirm Button */}
      <View className="px-6 pb-8 bg-gray-50">
        <TouchableOpacity
          onPress={handleConfirm}
          style={{ backgroundColor: parseFloat(amount) > 0 ? primaryColor : '#d1d5db' }}
          className="rounded-2xl py-5 items-center shadow-lg"
          activeOpacity={0.8}
          disabled={parseFloat(amount) <= 0}
        >
          <View className="flex-row items-center">
            <Text className="text-white text-lg font-bold">تأكيد المبلغ</Text>
            <Feather
              name="arrow-left"
              size={20}
              color="white"
              style={{ marginRight: 8 }}
            />
          </View>
        </TouchableOpacity>

        {/* Amount Preview */}
        {parseFloat(amount) > 0 && (
          <View className="flex-row items-center justify-center mt-4">
            <Text className="text-gray-500 text-sm">
              سيتم إضافة {amount} ريال سعودي
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};

export default TopupAmountScreen;
