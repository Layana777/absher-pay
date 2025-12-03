import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Keyboard,
  TouchableWithoutFeedback,
  StatusBar,
  Alert,
} from "react-native";
import AbsherPay from "../../common/assets/icons/logo-white-abhser.svg";
import { useDispatch } from "react-redux";
import { setUser } from "../../store/slices/userSlice";
import { getUserByUid } from "../../common/services";
import { useResendTimer } from "../../common/hooks";

const OtpBusinessScreen = ({ navigation, route }) => {
  const dispatch = useDispatch();
  const { uid, nationalId, phoneNumber } = route.params || {};
  const [otp, setOtp] = useState(["", "", "", ""]);
  const inputRefs = useRef([]);
  const [loading, setLoading] = useState(false);
  const [verificationSuccess, setVerificationSuccess] = useState(false);
  const [error, setError] = useState("");
  const { timer, canResend, resetTimer } = useResendTimer(60);

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
    if (!canResend) return;
    console.log("Resend OTP code");
    // Reset timer
    resetTimer();
    // Add resend logic here
  };

  const handleSkip = () => {
    navigation.goBack();
    // Or navigate to next screen
  };

  const handleAutoSubmit = async () => {
    const otpCode = otp.join("");
    if (otpCode.length !== 4) return;

    // Dismiss keyboard
    Keyboard.dismiss();
    setLoading(true);
    setError("");

    try {
      // For now, accept any 4-digit OTP (simulated)
      console.log("OTP Complete:", otpCode);
      console.log("Verifying user with UID:", uid);

      // Fetch full user data from database
      const userData = await getUserByUid(uid);

      if (!userData) {
        setError("فشل في جلب بيانات المستخدم");
        setLoading(false);
        return;
      }

      // Dispatch user data to Redux store
      dispatch(setUser(userData));

      // Show success state
      setVerificationSuccess(true);

      // Show success alert
      Alert.alert(
        "تم التحقق بنجاح",
        `مرحباً ${userData.firstName} ${userData.lastName}`,
        [
          {
            text: "حسناً",
            style: "default",
          },
        ]
      );

      console.log("User authenticated and saved to Redux:", userData);
    } catch (error) {
      console.error("OTP verification error:", error);
      setError("حدث خطأ أثناء التحقق. يرجى المحاولة مرة أخرى");
    } finally {
      setLoading(false);
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
    const timeout = setTimeout(() => {
      inputRefs.current[0]?.focus();
    }, 100);
    return () => clearTimeout(timeout);
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
            أدخل الرمز المرسل إلى رقم الجوال {""}
            {phoneNumber.substring(1) + "+" || ""}
          </Text>

          {/* Error Message */}
          {error ? (
            <View className="bg-red-50 border border-red-200 rounded-xl p-3 mb-4">
              <Text className="text-red-600 text-sm text-center">{error}</Text>
            </View>
          ) : null}

          {/* Success Message */}
          {verificationSuccess ? (
            <View className="bg-green-50 border border-green-200 rounded-xl p-3 mb-4">
              <Text className="text-green-600 text-sm text-center">
                ✓ تم التحقق بنجاح
              </Text>
            </View>
          ) : null}

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
                editable={!loading && !verificationSuccess}
                className={`w-16 h-16 border-2 rounded-2xl text-center text-2xl font-bold ${
                  verificationSuccess
                    ? "border-green-500 bg-green-50 text-green-600"
                    : loading
                    ? "border-gray-200 bg-gray-50 text-gray-400"
                    : "border-gray-300 text-gray-800"
                }`}
                style={{
                  textAlign: "center",
                }}
              />
            ))}
          </View>

          {/* Loading Indicator */}
          {loading ? (
            <Text className="text-[#0055aa] text-sm text-center mb-4">
              جاري التحقق...
            </Text>
          ) : null}

          {/* Resend Code */}
          <TouchableOpacity
            onPress={handleResendCode}
            className="flex-row items-center justify-center mb-6"
            disabled={loading || verificationSuccess || !canResend}
          >
            <View className="w-6 h-6 items-center justify-center">
              <Text
                className={`text-xl ${
                  canResend && !loading && !verificationSuccess
                    ? "text-[#0055aa]"
                    : "text-gray-400"
                }`}
              >
                ↺
              </Text>
            </View>
            <Text
              className={`text-base ml-2 ${
                canResend && !loading && !verificationSuccess
                  ? "text-[#0055aa]"
                  : "text-gray-400"
              }`}
            >
              {canResend
                ? "إعادة إرسال الرمز"
                : `إعادة الإرسال بعد ${timer} ثانية`}
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
