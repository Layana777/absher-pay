import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Keyboard,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { CustomHeader } from "../../../common/components";
import TextInput from "../../../common/components/forms/TextInput";

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

  const isFormComplete = () => {
    return (
      cardNumber.trim().length > 0 &&
      cardHolder.trim().length > 0 &&
      expiryDate.trim().length > 0 &&
      cvv.trim().length > 0
    );
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
                <TextInput
                  label="رقم البطاقة"
                  placeholder="1234 5678 9012 3456"
                  value={cardNumber}
                  onChangeText={(text) => setCardNumber(formatCardNumber(text))}
                  keyboardType="numeric"
                  maxLength={19}
                  error={errors.cardNumber}
                />

                {/* Card Holder */}
                <TextInput
                  label="اسم حامل البطاقة"
                  placeholder="محمد أحمد"
                  value={cardHolder}
                  onChangeText={(text) => {
                    if (text.length <= 16) {
                      setCardHolder(text);
                    }
                  }}
                  maxLength={16}
                  error={errors.cardHolder}
                />

                {/* Expiry and CVV */}
                <View className="flex-row" style={{ gap: 12 }}>
                  <View className="flex-1">
                    <TextInput
                      label="CVV"
                      placeholder="123"
                      value={cvv}
                      onChangeText={(text) => setCvv(text.slice(0, 3))}
                      keyboardType="numeric"
                      maxLength={3}
                      secureTextEntry
                      error={errors.cvv}
                    />
                  </View>
                  <View className="flex-1">
                    <TextInput
                      label="تاريخ الانتهاء"
                      placeholder="MM/YY"
                      value={expiryDate}
                      onChangeText={(text) =>
                        setExpiryDate(formatExpiryDate(text))
                      }
                      keyboardType="numeric"
                      maxLength={5}
                      error={errors.expiryDate}
                    />
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
                disabled={!isFormComplete()}
                className="rounded-xl py-4"
                style={{
                  backgroundColor: isFormComplete() ? primaryColor : "#d1d5db",
                }}
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
