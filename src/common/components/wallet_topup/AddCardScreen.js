import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import SvgIcons from "../SvgIcons";

const AddCardScreen = ({ onSaveCard, onBack, primaryColor = "#0055aa" }) => {
  const [cardNumber, setCardNumber] = useState("");
  const [cardHolder, setCardHolder] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cvv, setCvv] = useState("");
  const [errors, setErrors] = useState({});

  const formatCardNumber = (text) => {
    const cleaned = text.replace(/\s/g, "");
    const formatted = cleaned.match(/.{1,4}/g)?.join(" ") || cleaned;
    return formatted;
  };

  const formatExpiryDate = (text) => {
    const cleaned = text.replace(/\D/g, "");
    if (cleaned.length >= 2) {
      return cleaned.substring(0, 2) + "/" + cleaned.substring(2, 4);
    }
    return cleaned;
  };

  const validateForm = () => {
    const newErrors = {};

    if (!cardNumber || cardNumber.replace(/\s/g, "").length < 16) {
      newErrors.cardNumber = "رقم البطاقة يجب أن يكون 16 رقماً";
    }

    if (!cardHolder || cardHolder.trim().length < 3) {
      newErrors.cardHolder = "أدخل اسم حامل البطاقة";
    }

    if (!expiryDate || expiryDate.length < 5) {
      newErrors.expiryDate = "أدخل تاريخ انتهاء صحيح";
    }

    if (!cvv || cvv.length < 3) {
      newErrors.cvv = "CVV يجب أن يكون 3 أرقام";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveCard = () => {
    if (validateForm()) {
      onSaveCard({
        cardNumber: cardNumber.replace(/\s/g, ""),
        cardHolder,
        expiryDate,
        cvv,
      });
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-white"
    >
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={{ backgroundColor: primaryColor }} className="px-6 pt-12 pb-8">
          <TouchableOpacity
            onPress={onBack}
            className="flex-row items-center mb-6"
          >
            <Feather name="arrow-right" size={24} color="white" />
            <Text className="text-white text-base font-semibold mr-3">
              رجوع
            </Text>
          </TouchableOpacity>

          <View className="items-center">
            <View className="w-20 h-20 bg-white/20 rounded-full items-center justify-center mb-4">
              <SvgIcons name="CreditCard" size={40} />
            </View>
            <Text className="text-white text-2xl font-bold mb-2">
              إضافة بطاقة جديدة
            </Text>
            <Text className="text-white/80 text-sm text-center">
              أضف بطاقة فيزا لإكمال عملية الدفع.
            </Text>
          </View>
        </View>

        {/* Card Preview */}
        <View className="px-6 -mt-8 mb-6">
          <View style={{ backgroundColor: primaryColor }} className="rounded-2xl p-6 shadow-lg">
            <View className="mb-8">
              <SvgIcons name="CreditCard" size={40} />
            </View>
            <Text
              className="text-white text-xl tracking-widest mb-6 font-mono"
              style={{ direction: "ltr" }}
            >
              {cardNumber || "•••• •••• •••• ••••"}
            </Text>
            <View className="flex-row justify-between items-end">
              <View>
                <Text className="text-white/60 text-xs mb-1">Card Holder</Text>
                <Text className="text-white text-base font-semibold">
                  {cardHolder || "YOUR NAME"}
                </Text>
              </View>
              <View className="items-end">
                <Text className="text-white/60 text-xs mb-1">Expires</Text>
                <Text className="text-white text-base font-semibold">
                  {expiryDate || "MM/YY"}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Form */}
        <View className="px-6 pb-6">
          {/* Card Number */}
          <View className="mb-5">
            <Text className="text-gray-700 text-sm font-semibold mb-2 text-right">
              رقم البطاقة
            </Text>
            <View
              className={`bg-gray-50 border ${
                errors.cardNumber ? "border-red-500" : "border-gray-200"
              } rounded-xl px-4 py-4 flex-row items-center`}
            >
              <Feather
                name="credit-card"
                size={20}
                color={errors.cardNumber ? "#ef4444" : "#6b7280"}
              />
              <TextInput
                className="flex-1 text-gray-900 text-base mr-3"
                placeholder="1234 5678 9012 3456"
                placeholderTextColor="#9ca3af"
                value={cardNumber}
                onChangeText={(text) =>
                  setCardNumber(formatCardNumber(text.substring(0, 19)))
                }
                keyboardType="numeric"
                maxLength={19}
                style={{ direction: "ltr", textAlign: "left" }}
              />
            </View>
            {errors.cardNumber && (
              <Text className="text-red-500 text-xs mt-1 text-right">
                {errors.cardNumber}
              </Text>
            )}
          </View>

          {/* Card Holder */}
          <View className="mb-5">
            <Text className="text-gray-700 text-sm font-semibold mb-2 text-right">
              اسم حامل البطاقة
            </Text>
            <View
              className={`bg-gray-50 border ${
                errors.cardHolder ? "border-red-500" : "border-gray-200"
              } rounded-xl px-4 py-4 flex-row items-center`}
            >
              <Feather
                name="user"
                size={20}
                color={errors.cardHolder ? "#ef4444" : "#6b7280"}
              />
              <TextInput
                className="flex-1 text-gray-900 text-base mr-3"
                placeholder="Ahmed Ali"
                placeholderTextColor="#9ca3af"
                value={cardHolder}
                onChangeText={setCardHolder}
                autoCapitalize="words"
                style={{ direction: "ltr", textAlign: "left" }}
              />
            </View>
            {errors.cardHolder && (
              <Text className="text-red-500 text-xs mt-1 text-right">
                {errors.cardHolder}
              </Text>
            )}
          </View>

          {/* Expiry Date & CVV */}
          <View className="flex-row gap-4 mb-6">
            {/* Expiry Date */}
            <View className="flex-1">
              <Text className="text-gray-700 text-sm font-semibold mb-2 text-right">
                تاريخ الانتهاء
              </Text>
              <View
                className={`bg-gray-50 border ${
                  errors.expiryDate ? "border-red-500" : "border-gray-200"
                } rounded-xl px-4 py-4 flex-row items-center`}
              >
                <Feather
                  name="calendar"
                  size={20}
                  color={errors.expiryDate ? "#ef4444" : "#6b7280"}
                />
                <TextInput
                  className="flex-1 text-gray-900 text-base mr-3"
                  placeholder="MM/YY"
                  placeholderTextColor="#9ca3af"
                  value={expiryDate}
                  onChangeText={(text) =>
                    setExpiryDate(formatExpiryDate(text.substring(0, 5)))
                  }
                  keyboardType="numeric"
                  maxLength={5}
                  style={{ direction: "ltr", textAlign: "left" }}
                />
              </View>
              {errors.expiryDate && (
                <Text className="text-red-500 text-xs mt-1 text-right">
                  {errors.expiryDate}
                </Text>
              )}
            </View>

            {/* CVV */}
            <View className="flex-1">
              <Text className="text-gray-700 text-sm font-semibold mb-2 text-right">
                CVV
              </Text>
              <View
                className={`bg-gray-50 border ${
                  errors.cvv ? "border-red-500" : "border-gray-200"
                } rounded-xl px-4 py-4 flex-row items-center`}
              >
                <Feather
                  name="lock"
                  size={20}
                  color={errors.cvv ? "#ef4444" : "#6b7280"}
                />
                <TextInput
                  className="flex-1 text-gray-900 text-base mr-3"
                  placeholder="123"
                  placeholderTextColor="#9ca3af"
                  value={cvv}
                  onChangeText={(text) => setCvv(text.substring(0, 3))}
                  keyboardType="numeric"
                  maxLength={3}
                  secureTextEntry
                  style={{ direction: "ltr", textAlign: "left" }}
                />
              </View>
              {errors.cvv && (
                <Text className="text-red-500 text-xs mt-1 text-right">
                  {errors.cvv}
                </Text>
              )}
            </View>
          </View>

          {/* Security Note */}
          <View className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
            <View className="flex-row items-start">
              <Feather name="shield" size={20} color={primaryColor} />
              <View className="flex-1 mr-3">
                <Text style={{ color: primaryColor }} className="text-sm font-semibold mb-1 text-right">
                  معلوماتك آمنة
                </Text>
                <Text className="text-gray-600 text-xs text-right">
                  نحن نستخدم تشفير بنكي لحماية معلومات بطاقتك
                </Text>
              </View>
            </View>
          </View>

          {/* Save Button */}
          <TouchableOpacity
            onPress={handleSaveCard}
            style={{ backgroundColor: primaryColor }}
            className="rounded-2xl py-5 items-center shadow-lg"
            activeOpacity={0.8}
          >
            <View className="flex-row items-center">
              <Text className="text-white text-lg font-bold">حفظ البطاقة</Text>
              <Feather name="check-circle" size={20} color="white" style={{ marginRight: 8 }} />
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default AddCardScreen;
