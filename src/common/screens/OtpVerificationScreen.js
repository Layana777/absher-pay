import { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Keyboard,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useResendTimer } from "../hooks/useResendTimer";
import { formatAmount } from "../utils";
import SvgIcons from "../components/SvgIcons";
import { CustomHeader, OTPInput } from "../components";

const OtpVerificationScreen = ({ navigation, route }) => {
  const {
    amount,
    primaryColor = "#0055aa",
    phoneNumber = "05xxxxxxxx",
    onVerifySuccess,
    title = "تأكيد إضافة الرصيد",
    description = "أدخل رمز التحقق المرسل إلى رقم جوالك",
  } = route.params || {};

  const [otpValue, setOtpValue] = useState("");
  const { timer, canResend, resetTimer } = useResendTimer(60);

  const handleResendOtp = () => {
    if (canResend) {
      // TODO: Add API call to resend OTP
      console.log("Resending OTP...");
      resetTimer();
    }
  };

  const handleOtpComplete = (otpCode) => {
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
  };

  const handleVerify = () => {
    if (otpValue.length === 4) {
      handleOtpComplete(otpValue);
    }
  };

  const isOtpComplete = otpValue.length === 4;

  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <View className="flex-1 bg-backgroundRGB">
      {/* Header */}
      <CustomHeader
        title="OTP"
        onBack={() => navigation.goBack()}
        statusBarBackgroundColor="#F3F4F6"
        showBackButton={false}
      />

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
                  className="text-4xl font-bold mr-2"
                  style={{ color: primaryColor }}
                >
                  <SvgIcons name={"SARBlue"} size={25} />
                  {formatAmount(amount)}
                </Text>
              </View>
            </View>
          )}

          {/* OTP Input Fields */}
          <View className="mb-6">
            <OTPInput
              length={4}
              onComplete={handleOtpComplete}
              onChangeOtp={setOtpValue}
              primaryColor={primaryColor}
              autoFocus={true}
            />
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
              <View className="flex-1">
                <Text
                  className="font-semibold text-sm mb-1 text-left"
                  style={{ color: primaryColor }}
                >
                  معاملة آمنة 100%
                </Text>
                <Text className="text-gray-600 text-xs text-left">
                  رمز التحقق يُرسل عبر رسالة SMS لضمان أمان حسابك
                </Text>
              </View>
              <Feather
                name="shield"
                size={20}
                color={primaryColor}
                style={{ marginRight: 8, marginTop: 2 }}
              />
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
    </View>
  );
};

export default OtpVerificationScreen;
