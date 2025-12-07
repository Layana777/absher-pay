import React, { useEffect, useRef } from "react";
import { View, Text, TouchableOpacity, Animated, Share } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { CommonActions } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";
import { formatAmount, formatDateLong, formatTime } from "../../../common/utils";

/**
 * Bill Payment Success Screen
 * Displays payment confirmation with transaction details
 *
 * Route params:
 * - bill: Original bill object
 * - totalAmount: Total amount paid
 * - transactionId: Created transaction ID
 * - referenceNumber: Transaction reference number
 * - newBalance: Updated wallet balance
 * - primaryColor: Theme color
 */
const BillPaymentSuccessScreen = ({ navigation, route }) => {
  const {
    bill,
    totalAmount,
    transactionId,
    referenceNumber,
    newBalance,
    primaryColor = "#0055aa",
  } = route.params || {};

  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Animate success icon
    Animated.sequence([
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 5,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleDone = () => {
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [
          {
            name: "BusinessTabs",
            state: { routes: [{ name: "Home" }], index: 0 },
          },
        ],
      })
    );
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `إيصال دفع فاتورة\n\nالخدمة: ${bill.serviceName.ar}\nالمبلغ: ${totalAmount.toFixed(
          2
        )} ريال\nرقم المرجع: ${bill.referenceNumber}\nرقم العملية: ${transactionId}`,
        title: "إيصال الدفع",
      });
    } catch (error) {
      console.error("Share error:", error);
    }
  };

  const transactionDate = formatDateLong(new Date(), "ar-SA");
  const transactionTime = formatTime(new Date(), "ar-SA");

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="flex-1 justify-center items-center px-6">
        {/* Animated Success Icon */}
        <Animated.View
          style={{
            transform: [{ scale: scaleAnim }],
            backgroundColor: `${primaryColor}15`,
          }}
          className="w-24 h-24 rounded-full items-center justify-center mb-6"
        >
          <View
            className="w-20 h-20 rounded-full items-center justify-center"
            style={{ backgroundColor: primaryColor }}
          >
            <Feather name="check" size={40} color="white" />
          </View>
        </Animated.View>

        {/* Success Message */}
        <Animated.View style={{ opacity: fadeAnim }} className="items-center mb-8">
          <Text className="text-2xl font-bold text-gray-900 mb-2">
            تم الدفع بنجاح
          </Text>
          <Text className="text-gray-600 text-center">
            تم دفع الفاتورة وتحديث رصيدك
          </Text>
        </Animated.View>

        {/* Transaction Details */}
        <Animated.View
          style={{ opacity: fadeAnim }}
          className="w-full bg-white rounded-3xl p-6 mb-6 shadow-sm"
        >
          {/* Service Info */}
          <View className="items-center mb-6 pb-6 border-b border-gray-100">
            <Text className="text-gray-600 text-sm mb-2">الخدمة</Text>
            <Text className="text-lg font-bold text-gray-800 mb-1 text-center">
              {bill.serviceName.ar}
            </Text>
            <Text className="text-sm text-gray-500 text-center">
              {bill.ministryName.ar}
            </Text>
          </View>

          {/* Amount */}
          <View className="items-center mb-6 pb-6 border-b border-gray-100">
            <Text className="text-gray-600 text-sm mb-2">المبلغ المدفوع</Text>
            <Text
              className="text-3xl font-bold"
              style={{ color: primaryColor }}
            >
              {formatAmount(totalAmount)} ريال
            </Text>
            {bill.penaltyInfo && (
              <Text className="text-xs text-gray-500 mt-1">
                (شامل غرامة تأخير {bill.penaltyInfo.lateFee.toFixed(2)} ريال)
              </Text>
            )}
          </View>

          {/* Transaction Details */}
          <View className="space-y-3">
            <InfoRow label="رقم الفاتورة" value={bill.referenceNumber} />
            <InfoRow label="رقم العملية" value={transactionId} />
            <InfoRow label="التاريخ" value={transactionDate} />
            <InfoRow label="الوقت" value={transactionTime} />
            <InfoRow
              label="الرصيد الجديد"
              value={`${formatAmount(newBalance)} ريال`}
              highlight={true}
              primaryColor={primaryColor}
            />
          </View>
        </Animated.View>

        {/* Action Buttons */}
        <Animated.View style={{ opacity: fadeAnim }} className="w-full space-y-3">
          {/* Done Button */}
          <TouchableOpacity
            onPress={handleDone}
            className="rounded-2xl py-4"
            style={{ backgroundColor: primaryColor }}
          >
            <Text className="text-white text-center text-base font-bold">
              تم
            </Text>
          </TouchableOpacity>

          {/* Share Button */}
          <TouchableOpacity
            onPress={handleShare}
            className="rounded-2xl py-4 border-2"
            style={{ borderColor: primaryColor }}
          >
            <Text
              className="text-center text-base font-bold"
              style={{ color: primaryColor }}
            >
              مشاركة الإيصال
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
};

// Helper component for info rows
const InfoRow = ({ label, value, highlight = false, primaryColor = "#0055aa" }) => (
  <View className="flex-row justify-between items-center py-2">
    <Text
      className={`font-medium ${highlight ? "text-lg" : "text-sm"}`}
      style={highlight ? { color: primaryColor } : { color: "#374151" }}
    >
      {label}
    </Text>
    <Text
      className={`${highlight ? "text-lg font-bold" : "text-sm"}`}
      style={highlight ? { color: primaryColor } : { color: "#6B7280" }}
    >
      {value}
    </Text>
  </View>
);

export default BillPaymentSuccessScreen;
