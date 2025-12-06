import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import SvgIcons from "../../../common/components/SvgIcons";
import { CustomHeader } from "../../../common/components";

const TopupAmountScreen = ({ navigation, route }) => {
  const {
    paymentMethod,
    primaryColor = "#0055aa",
    cardData,
  } = route.params || {};
  const [amount, setAmount] = useState("");

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

  const handleAmountChange = (text) => {
    // Only allow numbers and decimal point
    const sanitized = text.replace(/[^0-9.]/g, "");

    // Prevent multiple decimal points
    const parts = sanitized.split(".");
    if (parts.length > 2) {
      return;
    }

    // Limit to reasonable amount (e.g., 10000)
    const numValue = parseFloat(sanitized);
    if (sanitized && numValue > 10000) {
      return;
    }

    setAmount(sanitized);
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-white"
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={0}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View className="flex-1">
          {/* Header */}
          <CustomHeader
            title="إضافة مبلغ"
            onBack={() => navigation.goBack()}
            statusBarBackgroundColor="#F3F4F6"
          />

          {/* Content */}
          <View className="flex-1 px-6 pt-8">
            {/* Amount Input Section */}
            <View className="bg-white rounded-2xl p-6 mb-6 border border-gray-100">
              <Text className="text-gray-400 text-sm text-left mb-3">
                ادخال المبلغ
              </Text>

              {/* Amount Display with Hidden Input */}
              <View className="flex-row items-center justify-start mb-2">
                <TextInput
                  className="text-4xl font-bold text-right flex-0.3 mx-2"
                  value={amount}
                  onChangeText={handleAmountChange}
                  keyboardType="decimal-pad"
                  placeholder="00.00"
                  placeholderTextColor="#D1D5DB"
                  style={{ textAlign: "right" }}
                  maxLength={10}
                />
                <SvgIcons name={"SARBlack"} size={29} />
              </View>

              {/* Blue vertical line indicator */}
              <View className="self-end">
                <View
                  className="h-12 w-0.5 mb-2"
                  style={{ backgroundColor: primaryColor }}
                />
              </View>
            </View>

            {/* Payment Method Section */}
            <View className="bg-white rounded-2xl p-5 flex-row items-center justify-between border border-gray-100">
              <TouchableOpacity className="bg-gray-100 rounded-lg px-6 py-2">
                <Text className="text-gray-700 text-sm">تغيير</Text>
              </TouchableOpacity>

              <View className="flex-row items-center">
                <Text className="text-base font-medium text-gray-900 mr-2">
                  Apple Pay
                </Text>
                <View className="border border-gray-300 rounded px-2 py-1">
                  <SvgIcons name={"Apple"} size={20} />
                </View>
              </View>
            </View>
          </View>

          {/* Confirm Button */}
          <View className="px-6 pb-8">
            <TouchableOpacity
              onPress={handleConfirm}
              disabled={!amount || parseFloat(amount) <= 0}
              className="rounded-xl py-4"
              style={{
                backgroundColor:
                  amount && parseFloat(amount) > 0 ? primaryColor : "#D1D5DB",
              }}
            >
              <Text className="text-white text-center text-base font-semibold">
                استمرار
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

export default TopupAmountScreen;
