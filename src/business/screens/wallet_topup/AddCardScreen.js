import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Keyboard,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { CustomHeader } from "../../../common/components";

const AddCardScreen = ({ navigation, route }) => {
  const { primaryColor = "#0055aa" } = route.params || {};

  const [cardNumber, setCardNumber] = useState("");
  const [cardHolder, setCardHolder] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cvv, setCvv] = useState("");
  const [errors, setErrors] = useState({});

  const formatCardNumber = (text) => {
    const cleaned = text.replace(/\s/g, "");
    const formatted = cleaned.match(/.{1,4}/g)?.join(" ") || cleaned;
    return formatted.slice(0, 19); // 16 digits + 3 spaces
  };

  const formatExpiryDate = (text) => {
    const cleaned = text.replace(/\D/g, "");
    if (cleaned.length >= 2) {
      return cleaned.slice(0, 2) + "/" + cleaned.slice(2, 4);
    }
    return cleaned;
  };

  const validateForm = () => {
    const newErrors = {};

    const cleanCardNumber = cardNumber.replace(/\s/g, "");
    if (!cleanCardNumber || cleanCardNumber.length !== 16) {
      newErrors.cardNumber = "رقم البطاقة غير صحيح";
    }

    if (!cardHolder.trim()) {
      newErrors.cardHolder = "اسم حامل البطاقة مطلوب";
    }

    const expiryPattern = /^(0[1-9]|1[0-2])\/\d{2}$/;
    if (!expiryDate.match(expiryPattern)) {
      newErrors.expiryDate = "تاريخ الانتهاء غير صحيح";
    }

    if (!cvv || cvv.length !== 3) {
      newErrors.cvv = "CVV غير صحيح";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveCard = () => {
    if (validateForm()) {
      navigation.navigate("TopupAmount", {
        paymentMethod: "CARD",
        primaryColor: primaryColor,
        cardData: {
          cardNumber: cardNumber.replace(/\s/g, ""),
          cardHolder,
          expiryDate,
          cvv,
        },
      });
    }
  };

  return (
    <View className="flex-1 bg-gray-50" style={{ direction: "ltr" }}>
      {/* Header */}
      <CustomHeader
        title="إضافة بطاقة جديدة"
        onBack={() => navigation.goBack()}
      />

      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View className="flex-1">

            {/* Form */}
            <ScrollView
              className="flex-1"
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={{ flexGrow: 1 }}
              style={{ direction: "rtl" }}
            >
              <View className="px-4 pt-6 pb-4">
                {/* Card Preview */}
                <View
                  className="rounded-2xl p-6 mb-6"
                  style={{ backgroundColor: primaryColor }}
                >
                  <View className="flex-row justify-between items-start mb-8">
                    <Feather name="credit-card" size={32} color="white" />
                    <Text className="text-white text-xs">VISA/MADA</Text>
                  </View>

                  <Text className="text-white text-lg mb-6 tracking-wider">
                    {cardNumber || "•••• •••• •••• ••••"}
                  </Text>

                  <View className="flex-row justify-between items-end">
                    <View>
                      <Text className="text-white text-xs opacity-70 mb-1">
                        حامل البطاقة
                      </Text>
                      <Text className="text-white font-semibold">
                        {cardHolder || "الاسم الكامل"}
                      </Text>
                    </View>
                    <View>
                      <Text className="text-white text-xs opacity-70 mb-1">
                        تاريخ الانتهاء
                      </Text>
                      <Text className="text-white font-semibold">
                        {expiryDate || "MM/YY"}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Card Number */}
                <View className="mb-4">
                  <Text className="text-sm text-left font-medium text-gray-700 mb-2">
                    رقم البطاقة
                  </Text>
                  <View className="relative">
                    <TextInput
                      className={`border-2 ${
                        errors.cardNumber ? "border-red-500" : "border-gray-300"
                      } rounded-xl px-4 py-4 text-right bg-white text-base`}
                      style={{
                        borderColor:
                          cardNumber && !errors.cardNumber
                            ? primaryColor
                            : undefined,
                      }}
                      placeholder="1234 5678 9012 3456"
                      placeholderTextColor="#9CA3AF"
                      keyboardType="numeric"
                      value={cardNumber}
                      onChangeText={(text) =>
                        setCardNumber(formatCardNumber(text))
                      }
                      maxLength={19}
                    />
                    {cardNumber && !errors.cardNumber && (
                      <View
                        className="absolute left-4 top-1/2"
                        style={{ transform: [{ translateY: -10 }] }}
                      ></View>
                    )}
                  </View>
                  {errors.cardNumber && (
                    <Text className="text-red-500 text-xs mt-1 text-right">
                      {errors.cardNumber}
                    </Text>
                  )}
                </View>

                {/* Card Holder */}
                <View className="mb-4">
                  <Text className="text-sm text-left font-medium text-gray-700 mb-2">
                    اسم حامل البطاقة
                  </Text>
                  <View className="relative">
                    <TextInput
                      className={`border-2 ${
                        errors.cardHolder ? "border-red-500" : "border-gray-300"
                      } rounded-xl px-4 py-4 text-right bg-white text-base`}
                      style={{
                        borderColor:
                          cardHolder && !errors.cardHolder
                            ? primaryColor
                            : undefined,
                      }}
                      placeholder="محمد أحمد"
                      placeholderTextColor="#9CA3AF"
                      value={cardHolder}
                      onChangeText={setCardHolder}
                    />
                    {cardHolder && !errors.cardHolder && (
                      <View
                        className="absolute left-4 top-1/2"
                        style={{ transform: [{ translateY: -10 }] }}
                      ></View>
                    )}
                  </View>
                  {errors.cardHolder && (
                    <Text className="text-red-500 text-xs mt-1 text-right">
                      {errors.cardHolder}
                    </Text>
                  )}
                </View>

                {/* Expiry and CVV */}
                <View className="flex-row " style={{ gap: 12 }}>
                  <View className="flex-1 ">
                    <Text className="text-sm text-left font-medium text-gray-700 mb-2">
                      تاريخ الانتهاء
                    </Text>
                    <TextInput
                      className={`border-2 ${
                        errors.expiryDate ? "border-red-500" : "border-gray-300"
                      } rounded-xl px-4 py-4 text-center bg-white text-base`}
                      style={{
                        borderColor:
                          expiryDate && !errors.expiryDate
                            ? primaryColor
                            : undefined,
                      }}
                      placeholder="MM/YY"
                      placeholderTextColor="#9CA3AF"
                      keyboardType="numeric"
                      value={expiryDate}
                      onChangeText={(text) =>
                        setExpiryDate(formatExpiryDate(text))
                      }
                      maxLength={5}
                    />
                    {errors.expiryDate && (
                      <Text className="text-red-500 text-xs mt-1 text-right">
                        {errors.expiryDate}
                      </Text>
                    )}
                  </View>

                  <View className="flex-1">
                    <Text className="text-sm text-left font-medium text-gray-700 mb-2">
                      CVV
                    </Text>
                    <TextInput
                      className={`border-2 ${
                        errors.cvv ? "border-red-500" : "border-gray-300"
                      } rounded-xl px-4 py-4 text-center bg-white text-base`}
                      style={{
                        borderColor:
                          cvv && !errors.cvv ? primaryColor : undefined,
                      }}
                      placeholder="123"
                      placeholderTextColor="#9CA3AF"
                      keyboardType="numeric"
                      value={cvv}
                      onChangeText={(text) => setCvv(text.slice(0, 3))}
                      maxLength={3}
                      secureTextEntry
                    />
                    {errors.cvv && (
                      <Text className="text-red-500 text-xs mt-1 text-right">
                        {errors.cvv}
                      </Text>
                    )}
                  </View>
                </View>

                {/* Security Info */}
                <View
                  className="rounded-xl p-4 mt-6"
                  style={{ backgroundColor: `${primaryColor}08` }}
                >
                  <View className="flex-row items-start">
                    <Feather
                      name="lock"
                      size={18}
                      color={primaryColor}
                      style={{ marginLeft: 8, marginTop: 2 }}
                    />
                    <View className="flex-1">
                      <Text className="text-xs text-gray-600 text-right">
                        بياناتك محمية بأعلى معايير الأمان والتشفير
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            </ScrollView>

            {/* Save Button */}
            <View className="px-4 pb-6 pt-4 bg-white border-t border-gray-200">
              <TouchableOpacity
                onPress={handleSaveCard}
                className="rounded-xl py-4"
                style={{ backgroundColor: primaryColor }}
              >
                <Text className="text-white text-center text-base font-semibold">
                  حفظ البطاقة والمتابعة
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </View>
  );
};

export default AddCardScreen;
