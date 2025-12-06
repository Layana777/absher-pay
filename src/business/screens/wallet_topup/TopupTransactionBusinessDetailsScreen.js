import React from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { Feather } from "@expo/vector-icons";
import SvgIcons from "../../../common/components/SvgIcons";
import { formatAmount } from "../../../common/utils";
import { CustomHeader } from "../../../common/components";
import { useUser, useBusinessWallet } from "../../../store/hooks";

const TopupTransactionBusinessDetailsScreen = ({ navigation, route }) => {
  const {
    amount,
    paymentMethod = "CARD",
    primaryColor = "#0055aa",
    cardData,
  } = route.params || {};

  // Get user and wallet data from Redux
  const user = useUser();
  const businessWallet = useBusinessWallet();

  // Calculate fees and totals
  // const vatRate = 0.15; // 15% VAT
  // const vatAmount = amount * vatRate;
  const transactionFee = 0;
  const totalAmount = amount;

  const currentDate = new Date();
  const transactionDate = currentDate.toLocaleDateString("ar-SA", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const transactionTime = currentDate.toLocaleTimeString("ar-SA", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const handleConfirm = () => {
    // Use uid for user ID (Firebase Auth UID)
    // Both user.uid and businessWallet.id should exist if logged in
    const userId = user?.uid || user?.id;
    const walletId = businessWallet?.id;

    // Get cardholder name from cardData or user info
    const cardHolderName =
      cardData?.cardHolder ||
      businessWallet?.businessInfo?.companyName ||
      user?.fullName ||
      user?.name ||
      "Unknown";

    // Extract payment details with validation and fallbacks
    const lastFourDigits =
      cardData?.lastFourDigits || cardData?.cardNumber?.slice(-4) || "****";

    const cardType = cardData?.cardType || cardData?.type || "mada";

    navigation.navigate("OtpVerification", {
      amount: totalAmount,
      paymentMethod,
      primaryColor,
      userId,
      walletId,
      phoneNumber: user?.phoneNumber || "05xxxxxxxx",
      paymentDetails: {
        lastFourDigits: lastFourDigits,
        cardType: cardType,
        cardHolder: cardHolderName,
      },
    });
  };

  return (
    <>
      <CustomHeader
        title="تفاصيل العملية"
        onBack={() => navigation.goBack()}
        statusBarBackgroundColor="#F3F4F6"
      />
      <View className="flex-1 bg-backgroundRGB" style={{ direction: "ltr" }}>
        {/* Header */}

        <ScrollView className="flex-1">
          <View className="px-4 py-6">
            {/* Main Amount Card */}
            <View
              className="rounded-3xl p-6 mb-4 items-center"
              style={{ backgroundColor: primaryColor }}
            >
              {/* Icon */}
              <View
                className="w-16 h-16 rounded-full items-center justify-center mb-4"
                style={{ backgroundColor: "rgba(255, 255, 255, 0.2)" }}
              >
                <SvgIcons name={"paymentManagement"} size={30} />
              </View>

              {/* Amount Text */}
              <Text className="text-white text-sm mb-2">
                المبلغ المراد إضافته
              </Text>
              <View className="flex-row items-center">
                <Text className="text-white text-xl">
                  <SvgIcons name={"SAR"} size={44} />
                </Text>
                <Text className="text-white text-4xl font-bold mr-2">
                  {formatAmount(amount)}
                </Text>
              </View>
            </View>

            {/* Transaction Details Card */}
            <View className="bg-white rounded-2xl p-5 mb-4 border border-gray-200">
              <Text className="text-gray-900 font-semibold text-base mb-4 text-right">
                تفاصيل العملية
              </Text>

              {/* Payment Method */}
              <View className="flex-row items-center justify-between mb-4 pb-4 border-b border-gray-100">
                <View className="flex-row items-center flex-1">
                  <View
                    className="w-10 h-10 rounded-lg items-center justify-center"
                    style={{ backgroundColor: `${primaryColor}15` }}
                  >
                    {paymentMethod === "APPLE_PAY" ? (
                      <SvgIcons name="Apple" size={20} />
                    ) : (
                      <Feather
                        name="credit-card"
                        size={20}
                        color={primaryColor}
                      />
                    )}
                  </View>
                  <View className="mr-3 flex-1">
                    <Text className="text-gray-900 font-medium text-right">
                      طريقة الدفع
                    </Text>
                    <Text className="text-gray-500 text-sm text-right">
                      {paymentMethod === "APPLE_PAY"
                        ? "Apple Pay"
                        : `بطاقة أعمال **** ${
                            cardData?.cardNumber?.slice(-4) || "8734"
                          }`}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Account Type */}
              <View className="flex-row items-center justify-between mb-4 pb-4 border-b border-gray-100">
                <View className="flex-row items-center flex-1">
                  <View
                    className="w-10 h-10 rounded-lg items-center justify-center"
                    style={{ backgroundColor: `${primaryColor}15` }}
                  >
                    <Feather name="briefcase" size={20} color={primaryColor} />
                  </View>
                  <View className="mr-3 flex-1">
                    <Text className="text-gray-900 font-medium text-right">
                      نوع الحساب
                    </Text>
                    <Text className="text-gray-500 text-sm text-right">
                      حساب أعمال – أبشر أعمال
                    </Text>
                  </View>
                </View>
              </View>

              {/* Transaction Time */}
              <View className="flex-row items-center justify-between mb-4 pb-4 border-b border-gray-100">
                <View className="flex-row items-center flex-1">
                  <View
                    className="w-10 h-10 rounded-lg items-center justify-center"
                    style={{ backgroundColor: `${primaryColor}15` }}
                  >
                    <Feather name="clock" size={20} color={primaryColor} />
                  </View>
                  <View className="mr-3 flex-1">
                    <Text className="text-gray-900 font-medium text-right">
                      وقت العملية
                    </Text>
                    <Text className="text-gray-500 text-sm text-right">
                      اليوم – {transactionTime}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Security */}
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center flex-1">
                  <View className="w-10 h-10 rounded-lg items-center justify-center bg-green-50">
                    <Feather name="shield" size={20} color="#10b981" />
                  </View>
                  <View className="mr-3 flex-1">
                    <Text className="text-gray-900 font-medium text-right">
                      الأمان
                    </Text>
                    <Text className="text-gray-500 text-sm text-right">
                      محمية ومستقرة
                    </Text>
                  </View>
                </View>
                <Feather name="check-circle" size={20} color="#10b981" />
              </View>
            </View>

            {/* Summary Card */}
            <View className="bg-white rounded-2xl p-5 mb-4 border border-gray-200">
              <Text className="text-gray-900 font-semibold text-base mb-4 text-right">
                ملخص العملية
              </Text>

              {/* Amount */}
              <View className="flex-row justify-between items-center mb-3">
                <Text className="text-gray-900 text-base">
                  <SvgIcons name={"SARBlack"} size={14} />{" "}
                  {formatAmount(amount)}
                </Text>

                <Text className="text-gray-600 text-base">المبلغ</Text>
              </View>

              {/* Transaction Fee */}
              <View className="flex-row justify-between items-center mb-4 pb-4 border-b border-gray-200">
                <Text className="text-green-600 text-base">
                  <SvgIcons name={"SARGreen"} size={14} />{" "}
                  {formatAmount(transactionFee)}
                </Text>
                <Text className="text-gray-600 text-base">رسوم العملية</Text>
              </View>

              {/* Total */}
              <View className="flex-row justify-between items-center">
                <Text
                  className="text-xl font-bold"
                  style={{ color: primaryColor }}
                >
                  <SvgIcons name={"SARBlue"} size={18} />{" "}
                  {formatAmount(totalAmount)}
                </Text>
                <Text className="text-gray-900 font-semibold text-base">
                  الإجمالي
                </Text>
              </View>
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
                    معاملة آمنة ومشفرة
                  </Text>
                  <Text className="text-gray-600 text-xs text-right">
                    جميع عملياتك محمية بأعلى معايير الأمان السيبراني ومعتمدة لدى
                    أبشر أعمال
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </ScrollView>

        {/* Confirm Button */}
        <View className="px-4 pb-6 ">
          <TouchableOpacity
            onPress={handleConfirm}
            className="rounded-lg py-4"
            style={{ backgroundColor: primaryColor }}
          >
            <Text className="text-white text-center text-base font-semibold">
              تأكيد وإرسال رمز التحقق
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </>
  );
};

export default TopupTransactionBusinessDetailsScreen;
