import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Keyboard,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useResendTimer } from "../hooks/useResendTimer";
import { formatAmount } from "../utils";
import SvgIcons from "../components/SvgIcons";

const OtpVerificationScreen = ({ navigation, route }) => {
  const {
    amount,
    primaryColor = "#0055aa",
    phoneNumber = "05xxxxxxxx",
    onVerifySuccess,
    title = "تأكيد إضافة الرصيد",
    description = "أدخل رمز التحقق المرسل إلى رقم جوالك",
  } = route.params || {};

  const [otp, setOtp] = useState(["", "", "", ""]);
  const inputRefs = [useRef(null), useRef(null), useRef(null), useRef(null)];
  const { timer, canResend, resetTimer } = useResendTimer(60);

  const handleOtpChange = (index, value) => {
    // Only allow numbers
    if (value && !/^\d$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 3) {
      inputRefs[index + 1].current?.focus();
    }
  };

  const handleKeyPress = (index, key) => {
    // Handle backspace
    if (key === "Backspace" && !otp[index] && index > 0) {
      inputRefs[index - 1].current?.focus();
    }
  };

  const handleResendOtp = () => {
    if (canResend) {
      // TODO: Add API call to resend OTP
      console.log("Resending OTP...");
      resetTimer();
    }
  };

  const handleVerify = () => {
    const otpCode = otp.join("");
    if (otpCode.length === 4) {
      Keyboard.dismiss();

      // If custom callback provided, use it
      if (onVerifySuccess) {
        onVerifySuccess(otpCode);
      } else {
        // Default behavior: navigate to success screen
        navigation.navigate("TopupSuccess", {
          amount,
          primaryColor,
        });
      }
    }
  };

  const isOtpComplete = otp.every((digit) => digit !== "");

  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <SafeAreaView className="flex-1 bg-backgroundRGB">
      {/* Header - Fixed */}
      <View className="flex-row items-center justify-between px-4 py-4 border-b border-gray-200 bg-white">
        <TouchableOpacity onPress={() => navigation.goBack()} className="p-2">
          <Feather name="arrow-right" size={24} color="#000" />
        </TouchableOpacity>
        <Text className="text-lg font-semibold">OTP</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView className="flex-1" contentContainerStyle={{ flexGrow: 1 }}>
        <View className="flex-1 px-6 py-8">
          {/* Shield Icon */}
          <View className="items-center mb-6">
            <View
              className="w-20 h-20 rounded-full items-center justify-center mb-4"
              style={{ backgroundColor: `${primaryColor}15` }}
            >
              <Feather name="shield" size={40} color={primaryColor} />
            </View>

            {/* Title */}
            <Text className="text-2xl font-bold text-gray-900 mb-2 text-center">
              {title}
            </Text>

            {/* Description */}
            <Text className="text-gray-600 text-center mb-2">
              {description}
            </Text>
            <Text className="text-gray-500 text-sm text-center">
              {phoneNumber}
            </Text>
          </View>

          {/* Amount Display */}
          {amount && (
            <View className="items-center mb-8">
              <Text className="text-gray-600 text-sm mb-2">المبلغ</Text>
              <View className="flex-row items-center">
                <Text
                  className="text-5xl font-bold mr-2"
                  style={{ color: primaryColor }}
                >
                  <SvgIcons name={"SARBlue"} size={35} />
                  {formatAmount(amount)}
                </Text>
              </View>
            </View>
          )}

          {/* OTP Input Fields */}
          <View className="flex-row justify-center mb-6" style={{ gap: 12 }}>
            {otp.map((digit, index) => (
              <TextInput
                key={index}
                ref={inputRefs[index]}
                className="w-16 h-16 text-center text-2xl font-bold rounded-xl border-2"
                style={{
                  borderColor: digit ? primaryColor : "#d1d5db",
                  color: primaryColor,
                }}
                value={digit}
                onChangeText={(value) => handleOtpChange(index, value)}
                onKeyPress={({ nativeEvent: { key } }) =>
                  handleKeyPress(index, key)
                }
                keyboardType="number-pad"
                maxLength={1}
                selectTextOnFocus
              />
            ))}
          </View>

          {/* Timer / Resend */}
          <View className="items-center mb-6">
            {canResend ? (
              <TouchableOpacity onPress={handleResendOtp}>
                <Text style={{ color: primaryColor }} className="font-semibold">
                  إعادة إرسال رمز التحقق
                </Text>
              </TouchableOpacity>
            ) : (
              <View className="flex-row items-center">
                <Text className="text-gray-600">
                  إعادة الإرسال بعد{" "}
                  <Text className="font-bold" style={{ color: primaryColor }}>
                    {formatTimer(timer)}
                  </Text>
                </Text>
              </View>
            )}
          </View>

          {/* Security Info Card */}
          <View
            className="rounded-2xl p-4 mb-6"
            style={{ backgroundColor: `${primaryColor}08` }}
          >
            <View className="flex-row items-start">
              <Feather
                name="shield"
                size={20}
                color={primaryColor}
                style={{ marginLeft: 8, marginTop: 2 }}
              />
              <View className="flex-1">
                <Text
                  className="font-semibold text-sm mb-1 text-right"
                  style={{ color: primaryColor }}
                >
                  معاملة آمنة 100%
                </Text>
                <Text className="text-gray-600 text-xs text-right">
                  رمز التحقق يُرسل عبر رسالة SMS لضمان أمان حسابك
                </Text>
              </View>
            </View>
          </View>

          {/* Spacer to push button to bottom */}
          <View className="flex-1" />

          {/* Verify Button */}
          <View className="mb-4">
            <TouchableOpacity
              onPress={handleVerify}
              disabled={!isOtpComplete}
              className="rounded-lg py-4"
              style={{
                backgroundColor: isOtpComplete ? primaryColor : "#d1d5db",
              }}
            >
              <Text className="text-white text-center text-base font-semibold">
                تحقق من الرمز
              </Text>
            </TouchableOpacity>
          </View>

          {/* Help Text */}
          <Text className="text-gray-500 text-xs text-center px-4">
            لم تستلم الرمز؟ تحقق من رسائل التسويق أو حاول المحاولة لاحقًا
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default OtpVerificationScreen;
