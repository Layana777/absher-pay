import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Keyboard,
  TouchableWithoutFeedback,
  StatusBar,
} from "react-native";
import AbsherPay from "../../common/assets/icons/logo-white-abhser.svg";

const OtpBusinessScreen = ({ navigation }) => {
  const [otp, setOtp] = useState(["", "", "", ""]);
  const inputRefs = useRef([]);

  const handleOtpChange = (value, index) => {
    // Only allow numbers
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e, index) => {
    // Handle backspace
    if (e.nativeEvent.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleResendCode = () => {
    console.log("Resend OTP code");
    // Add resend logic here
  };

  const handleSkip = () => {
    navigation.goBack();
    // Or navigate to next screen
  };

  const handleAutoSubmit = () => {
    const otpCode = otp.join("");
    if (otpCode.length === 4) {
      // Dismiss keyboard
      Keyboard.dismiss();
      // Verify OTP or navigate to next screen
      console.log("OTP Complete:", otpCode);
      // TODO: Add your OTP verification logic here
      // navigation.navigate('NextScreen');
    }
  };

  // Auto-submit when all 4 digits are entered
  useEffect(() => {
    if (otp.every((digit) => digit !== "")) {
      handleAutoSubmit();
    }
  }, [otp]);

  // Auto-focus first input on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      inputRefs.current[0]?.focus();
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View className="flex-1" style={{ direction: "ltr" }}>
        <StatusBar barStyle="light-content" />
        {/* Blue Header Section */}
        <View className="bg-[#0055aa] pt-12 pb-20 px-6 relative">
          {/* Skip Button */}

          {/* Logo and Title */}
          <View className="items-center mt-8">
            {/* Logo */}
            <View className="mb-6">
              <AbsherPay width={100} />
            </View>

            <Text className="text-white text-2xl font-bold mb-2">
              محفظة أبشر أعمال
            </Text>
            <Text className="text-white/90 text-base">تحقق من هويتك</Text>
          </View>
        </View>

        {/* White Content Section with Rounded Top */}
        <View className="flex-1 bg-white -mt-10 rounded-t-[30px] px-6 pt-8">
          {/* Title */}
          <Text className="text-2xl font-bold text-gray-800 text-right mb-2">
            رمز التحقق
          </Text>

          {/* Subtitle */}
          <Text className="text-sm text-gray-500 text-right mb-8">
            أدخل الرمز المرسل إلى رقم الجوال
          </Text>

          {/* OTP Input Label */}
          <Text className="text-sm text-gray-600 text-center mb-4">
            أدخل الرمز المكون من 4 أرقام
          </Text>

          {/* OTP Input Boxes */}
          <View
            className="flex-row justify-center gap-3 mb-6"
            style={{ direction: "ltr" }}
          >
            {otp.map((digit, index) => (
              <TextInput
                key={index}
                ref={(ref) => (inputRefs.current[index] = ref)}
                value={digit}
                onChangeText={(value) => handleOtpChange(value, index)}
                onKeyPress={(e) => handleKeyPress(e, index)}
                keyboardType="number-pad"
                maxLength={1}
                className="w-16 h-16 border-2 border-gray-300 rounded-2xl text-center text-2xl font-bold text-gray-800"
                style={{
                  textAlign: "center",
                }}
              />
            ))}
          </View>

          {/* Resend Code */}
          <TouchableOpacity
            onPress={handleResendCode}
            className="flex-row items-center justify-center mb-6"
          >
            <View className="w-6 h-6 items-center justify-center">
              <Text className="text-[#0055aa] text-xl">↺</Text>
            </View>
            <Text className="text-[#0055aa] text-base ml-2">
              إعادة إرسال الرمز
            </Text>
          </TouchableOpacity>

          {/* Footer Text */}
          <View className="absolute bottom-10 left-0 right-0 px-6">
            <Text className="text-xs text-gray-400 text-center">
              تواصل آمن ومشفر مع منظومة أبشر
            </Text>
          </View>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
};

export default OtpBusinessScreen;
