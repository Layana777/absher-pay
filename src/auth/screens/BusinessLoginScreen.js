import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  Alert,
} from "react-native";
import { Button } from "../../common/components/ui";
import TextInput from "../../common/components/forms/TextInput";
import SvgIcons from "../../common/components/SvgIcons";
import {
  validateNationalId,
  validatePassword,
  loginUser,
} from "../../common/services";

const BusinessLoginScreen = ({ navigation }) => {
  const [nationalId, setNationalId] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [nationalIdError, setNationalIdError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [generalError, setGeneralError] = useState("");

  const handleBack = () => {
    navigation.goBack();
  };

  const handleBiometricLogin = () => {
    console.log("Biometric login pressed");
    // TODO: Implement biometric authentication
  };

  const handleDigitalIdLogin = () => {
    console.log("Digital ID login pressed");
    // TODO: Implement digital ID authentication
  };

  const handleLogin = async () => {
    // Clear previous errors
    setNationalIdError("");
    setPasswordError("");
    setGeneralError("");

    // Validate National ID
    const nationalIdValidation = validateNationalId(nationalId);
    if (!nationalIdValidation.isValid) {
      setNationalIdError(nationalIdValidation.error);
      return;
    }

    // Validate Password
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      setPasswordError(passwordValidation.error);
      return;
    }

    // Proceed with login
    setLoading(true);

    try {
      const result = await loginUser(nationalId, password, true);

      if (result.success) {
        console.log("Login successful:", result.user);
        // Navigate to OTP screen with user data
        navigation.navigate("OtpBusiness", {
          uid: result.uid,
          nationalId: result.user.nationalId,
          phoneNumber: result.user.phoneNumber,
        });
      } else {
        setGeneralError(result.error);
      }
    } catch (error) {
      console.error("Login error:", error);
      setGeneralError("حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    console.log("Forgot password pressed");
    // TODO: Navigate to forgot password screen
  };

  const handleRegister = () => {
    console.log("Register pressed");
    // TODO: Navigate to registration screen
  };

  const isFormValid = nationalId.length > 0 && password.length > 0;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1"
      style={{ direction: "ltr" }}
    >
      <StatusBar barStyle="light-content" />
      <ScrollView
        className="flex-1 bg-white"
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Blue Header Section */}
        <View className="bg-business-primary rounded-b-[30px] pb-10 pt-12">
          {/* Back Button */}
          <TouchableOpacity
            onPress={handleBack}
            className="flex-row items-center justify-end px-5 mb-6"
            activeOpacity={0.7}
          >
            <Text className="text-white text-base mx-2">رجوع</Text>
            <Text className="text-white text-lg">→</Text>
          </TouchableOpacity>

          {/* iPay Logo Placeholder */}
          <View className="items-center mb-5">
            {/* TODO: Add iPay icon/logo here */}
            <SvgIcons name={"AbsherWhite"} size={100} />

            {/* Title */}
            <Text className="text-white text-xl font-bold mb-1">
              محفظة أبشر أعمال
            </Text>

            {/* Subtitle */}
            <Text className="text-white/80 text-sm">
              إدارة ذكية للمدفوعات الحكومية
            </Text>
          </View>
        </View>

        {/* White Card Section */}
        <View className="flex-1 -mt-10">
          <View className="bg-white rounded-3xl shadow-lg p-6">
            {/* Login Title */}
            <Text className="text-2xl font-bold text-gray-800 text-center mb-6">
              تسجيل الدخول
            </Text>

            {/* General Error Banner */}
            {generalError ? (
              <View className="bg-red-50 border border-red-200 rounded-xl p-3 mb-4">
                <Text className="text-red-600 text-sm text-center">
                  {generalError}
                </Text>
              </View>
            ) : null}

            {/* Biometric Auth Box */}
            <View className="bg-[#0055aa]/10 rounded-2xl p-4 mb-6">
              <View className="flex-row items-center justify-between">
                {/* Text Section */}
                <View className="flex-1 mx-4">
                  <Text className="text-sm text-gray-700 text-right leading-5">
                    تسجيل الدخول بالهوية الوطنية{"\n"}
                    آمن وسريع عبر الضغط
                  </Text>
                </View>

                {/* Fingerprint Button */}
                <TouchableOpacity
                  onPress={handleBiometricLogin}
                  className="w-16 h-16 bg-[#0055aa] rounded-[15px] items-center justify-center"
                  activeOpacity={0.8}
                >
                  <SvgIcons name="FingerPrintWhite" size={32} />
                </TouchableOpacity>
              </View>

              {/* Digital ID Login Button */}
              <Button
                title="الدخول بالهوية الرقمية"
                onPress={handleDigitalIdLogin}
                variant="business-primary"
                size="small"
                className="mt-4"
              />
            </View>

            {/* Divider */}
            <View className="flex-row items-center my-6">
              <View className="flex-1 h-px bg-gray-200" />
              <Text className="mx-4 text-gray-400 text-sm">أو</Text>
              <View className="flex-1 h-px bg-gray-200" />
            </View>

            {/* Traditional Login Form */}
            <View>
              {/* Username/National ID Input */}
              <TextInput
                label="اسم المستخدم أو رقم الهوية"
                placeholder="1130019514"
                value={nationalId}
                onChangeText={(text) => {
                  setNationalId(text);
                  setNationalIdError("");
                  setGeneralError("");
                }}
                keyboardType="numeric"
                icon={<SvgIcons name={"Person"} size={20} />}
              />
              {nationalIdError ? (
                <Text className="text-red-500 text-xs mt-1 mb-2 text-right">
                  {nationalIdError}
                </Text>
              ) : null}

              {/* Password Input */}
              <TextInput
                label="كلمة المرور"
                placeholder="ادخل كلمة المرور"
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  setPasswordError("");
                  setGeneralError("");
                }}
                secureTextEntry
                icon={<SvgIcons name={"Lock"} size={20} />}
              />
              {passwordError ? (
                <Text className="text-red-500 text-xs mt-1 mb-2 text-right">
                  {passwordError}
                </Text>
              ) : null}

              {/* Forgot Password Link */}
              <TouchableOpacity
                onPress={handleForgotPassword}
                className="self-end mb-6"
                activeOpacity={0.7}
              >
                <Text className="text-[#0055aa] text-sm font-medium">
                  نسيت كلمة المرور؟
                </Text>
              </TouchableOpacity>

              {/* Login Button */}
              <Button
                title="تسجيل الدخول"
                onPress={handleLogin}
                variant="business-primary"
                size="medium"
                disabled={!isFormValid}
                loading={loading}
              />

              {/* Register Footer */}
              <View className="flex-row items-center justify-center mt-6">
                <TouchableOpacity onPress={handleRegister} activeOpacity={0.7}>
                  <Text className="text-[#0055aa] text-sm font-medium mx-2">
                    التسجيل في أبشر أعمال
                  </Text>
                </TouchableOpacity>
                <Text className="text-gray-500 text-sm">ليس لديك حساب؟</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default BusinessLoginScreen;
