import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Feather } from "@expo/vector-icons";

/**
 * Payment Information Section Component
 * Displays detailed payment information in card format
 *
 * @param {Object} payment - Payment data object
 * @param {string} payment.category - Payment category
 * @param {string} payment.dueDate - Due date string
 * @param {string} payment.referenceNumber - Payment reference number
 * @param {string} primaryColor - Primary brand color (default: "#0055aa")
 */
const PaymentInfoSection = ({ payment, primaryColor = "#0055aa" }) => {
  const {
    category = "وزارة الموارد البشرية والتنمية الاجتماعية",
    dueDate = payment.isUrgent ? "خلال 3 أيام" : "خلال 15 يوم",
    referenceNumber = `BIZ-T-${Date.now().toString().slice(-6)}`,
    isUrgent = false,
  } = payment;

  return (
    <View
      className="bg-white rounded-3xl p-6 mx-4 mb-4 shadow-sm"
      style={{ direction: "ltr" }}
    >
      {/* Header with Icon */}
      <View
        className="flex-row items-center justify-between mb-5"
        style={{ direction: "rtl" }}
      >
        <Text className="text-gray-800 text-base font-bold text-right">
          معلومات الفاتورة
        </Text>
        <View
          className="w-10 h-10 rounded-full items-center justify-center"
          style={{ backgroundColor: `${primaryColor}15` }}
        >
          <Feather name="info" size={20} color={primaryColor} />
        </View>
      </View>

      {/* Info Cards */}
      <View className="space-y-3">
        {/* Reference Number */}
        <View className="bg-gray-50 rounded-2xl p-4">
          <View
            className="flex-row items-center justify-between mb-2"
            style={{ direction: "rtl" }}
          >
            <Text className="text-gray-500 text-xs text-right">رقم المرجع</Text>
            <TouchableOpacity>
              <Feather name="copy" size={16} color="#6B7280" />
            </TouchableOpacity>
          </View>
          <Text className="text-gray-800 font-bold text-base text-right">
            {referenceNumber}
          </Text>
        </View>

        {/* Due Date */}
        <View className="bg-gray-50 rounded-2xl p-4">
          <View className="flex-row items-center justify-between ">
            <View className="flex-1 m-2">
              <Text className="text-gray-500 text-xs mb-2 text-right ">
                تاريخ الإستحقاق
              </Text>
              <Text className="text-gray-800 font-bold text-base text-right ">
                1147/03/01 هـ
              </Text>
            </View>
            <View
              className="w-10 h-10 rounded-full items-center justify-center"
              style={{ backgroundColor: isUrgent ? "#FEE2E2" : "#F3F4F6" }}
            >
              <Feather
                name="calendar"
                size={18}
                color={isUrgent ? "#DC2626" : "#6B7280"}
              />
            </View>
          </View>
        </View>

        {/* Remaining Time */}
        <View className="bg-gray-50 rounded-2xl p-4">
          <View className="flex-row items-center justify-between">
            <View className="flex-1 m-1">
              <Text className="text-gray-500 text-xs mb-2 text-right ">
                ميعاد الإستحقاق
              </Text>
              <Text className="text-gray-800 font-bold text-base text-right ">
                خلال {isUrgent ? "3" : "15"} يوم
              </Text>
            </View>
            <View
              className="w-10 h-10 rounded-full items-center justify-center"
              style={{ backgroundColor: "#F3F4F6" }}
            >
              <Feather name="clock" size={18} color="#6B7280" />
            </View>
          </View>
        </View>

        {/* Category */}
        <View className="bg-gray-50 rounded-2xl p-4">
          <View className="flex-row items-center justify-between">
            <View className="flex-1 m-2">
              <Text className="text-gray-500 text-xs mb-2 text-right ">
                نوع الفاتورة
              </Text>
              <Text
                className="text-gray-800 font-bold text-sm text-right "
                numberOfLines={2}
              >
                {category}
              </Text>
            </View>
            <View
              className="w-10 h-10 rounded-full items-center justify-center"
              style={{ backgroundColor: `${primaryColor}15` }}
            >
              <Feather name="briefcase" size={18} color={primaryColor} />
            </View>
          </View>
        </View>

        {/* Workers Info */}
        {payment.isUrgent && (
          <View
            className="rounded-2xl p-4 flex-row items-center"
            style={{ backgroundColor: `${primaryColor}08` }}
          >
            <View className="flex-1 m-1">
              <Text
                className="text-sm font-bold mb-1 text-right "
                style={{ color: primaryColor }}
              >
                13 عامل
              </Text>
              <Text
                className="text-xs text-right "
                style={{ color: primaryColor }}
              >
                عدد المستفيدين من الخدمة
              </Text>
            </View>
            <View
              className="w-10 h-10 rounded-full items-center justify-center"
              style={{ backgroundColor: primaryColor }}
            >
              <Feather name="users" size={18} color="white" />
            </View>
          </View>
        )}
      </View>
    </View>
  );
};

export default PaymentInfoSection;
