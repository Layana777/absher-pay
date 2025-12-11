import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Feather } from "@expo/vector-icons";
import { formatDate } from "../../../common/utils";

/**
 * Payment Information Section Component
 * Displays detailed payment information in card format
 *
 * @param {Object} payment - Payment data object
 * @param {string} payment.category - Payment category
 * @param {number} payment.dueDate - Due date timestamp
 * @param {number} payment.issueDate - Issue date timestamp (optional)
 * @param {string} payment.referenceNumber - Payment reference number
 * @param {string} payment.ministry - Ministry name
 * @param {string} payment.status - Bill status
 * @param {Object} payment.billData - Original bill data with additional info
 * @param {string} primaryColor - Primary brand color (default: "#0055aa")
 */
const PaymentInfoSection = ({ payment, primaryColor = "#0055aa" }) => {
  const billData = payment.billData || {};

  const getDaysUntilDue = () => {
    if (!payment.dueDate) return 0;
    const now = Date.now();
    const days = Math.ceil((payment.dueDate - now) / (1000 * 60 * 60 * 24));
    return days;
  };

  const daysUntilDue = getDaysUntilDue();
  const isOverdue = daysUntilDue < 0;

  // Extract data
  const {
    referenceNumber = `BIZ-T-${Date.now().toString().slice(-6)}`,
    ministry = "غير محدد",
    status = "unpaid",
    isUrgent = false,
  } = payment;

  const serviceName = billData.serviceName?.ar || payment.title || "غير محدد";
  const issueDate = billData.issueDate || Date.now();
  const employeeCount =
    billData.additionalInfo?.employeeCount ||
    billData.additionalInfo?.employees?.length;

  // Status text mapping - using Arabic keys
  const statusMap = {
    "مدفوع": { text: "مدفوع", color: "#10B981" },
    "غير مدفوع": { text: "غير مدفوع", color: "#F59E0B" },
    "متأخر": { text: "متأخر", color: "#EF4444" },
    "قادم": { text: "قادم", color: "#3B82F6" },
    // Fallback for English keys (backward compatibility)
    paid: { text: "مدفوع", color: "#10B981" },
    unpaid: { text: "غير مدفوع", color: "#F59E0B" },
    overdue: { text: "متأخر", color: "#EF4444" },
    upcoming: { text: "قادم", color: "#3B82F6" },
  };

  const statusInfo = statusMap[status] || statusMap["غير مدفوع"];

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

        {/* Bill Status */}
        <View className="bg-gray-50 rounded-2xl p-4">
          <View className="flex-row items-center justify-between">
            <View className="flex-1 m-2">
              <Text className="text-gray-500 text-xs mb-2 text-right">
                حالة الفاتورة
              </Text>
              <Text
                className="text-base font-bold text-right"
                style={{ color: statusInfo.color }}
              >
                {statusInfo.text}
              </Text>
            </View>
            <View
              className="w-10 h-10 rounded-full items-center justify-center"
              style={{ backgroundColor: `${statusInfo.color}15` }}
            >
              <Feather
                name={status === "paid" ? "check-circle" : "alert-circle"}
                size={18}
                color={statusInfo.color}
              />
            </View>
          </View>
        </View>

        {/* Ministry */}
        <View className="bg-gray-50 rounded-2xl p-4">
          <View className="flex-row items-center justify-between">
            <View className="flex-1 m-2">
              <Text className="text-gray-500 text-xs mb-2 text-right">
                الجهة الحكومية
              </Text>
              <Text
                className="text-gray-800 font-bold text-sm text-right"
                numberOfLines={2}
              >
                {ministry}
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

        {/* Service Type */}
        <View className="bg-gray-50 rounded-2xl p-4">
          <View className="flex-row items-center justify-between">
            <View className="flex-1 m-2">
              <Text className="text-gray-500 text-xs mb-2 text-right">
                نوع الخدمة
              </Text>
              <Text
                className="text-gray-800 font-bold text-sm text-right"
                numberOfLines={2}
              >
                {serviceName}
              </Text>
            </View>
            <View
              className="w-10 h-10 rounded-full items-center justify-center"
              style={{ backgroundColor: `${primaryColor}15` }}
            >
              <Feather name="file-text" size={18} color={primaryColor} />
            </View>
          </View>
        </View>

        {/* Issue Date */}
        <View className="bg-gray-50 rounded-2xl p-4">
          <View className="flex-row items-center justify-between">
            <View className="flex-1 m-2">
              <Text className="text-gray-500 text-xs mb-2 text-right">
                تاريخ الإصدار
              </Text>
              <Text className="text-gray-800 font-bold text-sm text-right">
                {formatDate(issueDate)}
              </Text>
            </View>
            <View
              className="w-10 h-10 rounded-full items-center justify-center"
              style={{ backgroundColor: "#F3F4F6" }}
            >
              <Feather name="calendar" size={18} color="#6B7280" />
            </View>
          </View>
        </View>

        {/* Due Date */}
        <View className="bg-gray-50 rounded-2xl p-4">
          <View className="flex-row items-center justify-between">
            <View className="flex-1 m-2">
              <Text className="text-gray-500 text-xs mb-2 text-right">
                تاريخ الاستحقاق
              </Text>
              <Text className="text-gray-800 font-bold text-sm text-right">
                {formatDate(payment.dueDate)}
              </Text>
            </View>
            <View
              className="w-10 h-10 rounded-full items-center justify-center"
              style={{
                backgroundColor: isUrgent || isOverdue ? "#FEE2E2" : "#F3F4F6",
              }}
            >
              <Feather
                name="calendar"
                size={18}
                color={isUrgent || isOverdue ? "#DC2626" : "#6B7280"}
              />
            </View>
          </View>
        </View>

        {/* Remaining Time */}
        <View className="bg-gray-50 rounded-2xl p-4">
          <View className="flex-row items-center justify-between">
            <View className="flex-1 m-2">
              <Text className="text-gray-500 text-xs mb-2 text-right">
                {isOverdue ? "تأخر الدفع" : "الوقت المتبقي"}
              </Text>
              <Text
                className="font-bold text-base text-right"
                style={{
                  color: isOverdue
                    ? "#DC2626"
                    : isUrgent
                    ? "#F59E0B"
                    : "#6B7280",
                }}
              >
                {isOverdue
                  ? `متأخر ${Math.abs(daysUntilDue)} يوم`
                  : daysUntilDue === 0
                  ? "مستحق اليوم"
                  : `${daysUntilDue} يوم متبقي`}
              </Text>
            </View>
            <View
              className="w-10 h-10 rounded-full items-center justify-center"
              style={{
                backgroundColor: isOverdue ? "#FEE2E2" : "#F3F4F6",
              }}
            >
              <Feather
                name="clock"
                size={18}
                color={isOverdue ? "#DC2626" : "#6B7280"}
              />
            </View>
          </View>
        </View>

        {/* Employee Count (for business bills) */}
        {employeeCount && (
          <View
            className="rounded-2xl p-4 flex-row items-center"
            style={{ backgroundColor: `${primaryColor}08` }}
          >
            <View className="flex-1 m-1">
              <Text
                className="text-sm font-bold mb-1 text-right"
                style={{ color: primaryColor }}
              >
                {employeeCount} عامل
              </Text>
              <Text
                className="text-xs text-right"
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

        {/* Additional Info for specific services */}
        {billData.additionalInfo?.plateNumber && (
          <View className="bg-gray-50 rounded-2xl p-4">
            <View className="flex-row items-center justify-between">
              <View className="flex-1 m-2">
                <Text className="text-gray-500 text-xs mb-2 text-right">
                  رقم اللوحة
                </Text>
                <Text className="text-gray-800 font-bold text-base text-right">
                  {billData.additionalInfo.plateNumber}
                </Text>
              </View>
              <View
                className="w-10 h-10 rounded-full items-center justify-center"
                style={{ backgroundColor: `${primaryColor}15` }}
              >
                <Feather name="truck" size={18} color={primaryColor} />
              </View>
            </View>
          </View>
        )}

        {billData.additionalInfo?.iqamaNumber && (
          <View className="bg-gray-50 rounded-2xl p-4">
            <View className="flex-row items-center justify-between">
              <View className="flex-1 m-2">
                <Text className="text-gray-500 text-xs mb-2 text-right">
                  رقم الإقامة
                </Text>
                <Text className="text-gray-800 font-bold text-base text-right">
                  {billData.additionalInfo.iqamaNumber}
                </Text>
              </View>
              <View
                className="w-10 h-10 rounded-full items-center justify-center"
                style={{ backgroundColor: `${primaryColor}15` }}
              >
                <Feather name="credit-card" size={18} color={primaryColor} />
              </View>
            </View>
          </View>
        )}

        {billData.additionalInfo?.passportNumber && (
          <View className="bg-gray-50 rounded-2xl p-4">
            <View className="flex-row items-center justify-between">
              <View className="flex-1 m-2">
                <Text className="text-gray-500 text-xs mb-2 text-right">
                  رقم الجواز
                </Text>
                <Text className="text-gray-800 font-bold text-base text-right">
                  {billData.additionalInfo.passportNumber}
                </Text>
              </View>
              <View
                className="w-10 h-10 rounded-full items-center justify-center"
                style={{ backgroundColor: `${primaryColor}15` }}
              >
                <Feather name="book" size={18} color={primaryColor} />
              </View>
            </View>
          </View>
        )}
      </View>
    </View>
  );
};

export default PaymentInfoSection;
