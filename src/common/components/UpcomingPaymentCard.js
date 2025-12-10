import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Feather } from "@expo/vector-icons";
import moment from "moment";
import SvgIcons from "../../common/components/SvgIcons";

/**
 * Format date to Gregorian format with Arabic month names
 * @param {string|Date} date - Date string or Date object
 * @returns {string} Formatted date in Gregorian (e.g., "25 ديسمبر 2024")
 */
const formatGregorianDate = (date) => {
  if (!date) return "";

  const arabicMonths = {
    "01": "يناير",
    "02": "فبراير",
    "03": "مارس",
    "04": "أبريل",
    "05": "مايو",
    "06": "يونيو",
    "07": "يوليو",
    "08": "أغسطس",
    "09": "سبتمبر",
    10: "أكتوبر",
    11: "نوفمبر",
    12: "ديسمبر",
  };

  const momentDate = moment(date);

  if (!momentDate.isValid()) {
    return date; // Return original if invalid
  }

  const day = momentDate.format("D");
  const month = arabicMonths[momentDate.format("MM")];
  const year = momentDate.format("YYYY");

  return `${day} ${month} ${year}`;
};

/**
 * Reusable Payment Card Component
 * @param {Object} payment - Payment data
 * @param {string} payment.id - Unique payment ID
 * @param {string} payment.title - Payment title
 * @param {string} payment.description - Payment description
 * @param {number} payment.amount - Payment amount in SAR
 * @param {string} payment.icon - Feather icon name
 * @param {string} payment.iconColor - Icon color
 * @param {string} payment.iconBgColor - Icon background color
 * @param {string} payment.ministryIconName - Ministry icon name for SvgIcons
 * @param {boolean} payment.isUrgent - Whether payment is urgent
 * @param {boolean} payment.isScheduled - Whether payment is scheduled
 * @param {string} payment.status - Payment status (e.g., "مدفوع", "قيد الانتظار", "متأخر")
 * @param {string} payment.statusColor - Status badge color (e.g., "bg-green-500", "bg-yellow-500")
 * @param {string} payment.dueDate - Due date or payment date in Gregorian format (e.g., "25 ديسمبر 2024")
 * @param {string} payment.referenceNumber - Optional reference or transaction number
 * @param {Function} onPress - Callback when card is pressed
 */
const UpcomingPaymentCard = ({ payment, onPress }) => {
  const {
    title,
    description,
    amount,
    icon = "file-text",
    iconColor = "#0055aa",
    iconBgColor = "bg-blue-50",
    ministryIconName = "MOI",
    isUrgent = false,
    isScheduled = false,
    status,
    statusColor = "bg-blue-500",
    dueDate,
    referenceNumber,
  } = payment;

  return (
    <TouchableOpacity
      className="bg-white rounded-2xl p-4 mb-3 shadow-sm"
      onPress={onPress}
      activeOpacity={0.7}
      style={{
        direction: "rtl",
      }}
    >
      <View className="flex-row items-center justify-between mb-2 pm-8">
        <View className="flex-row items-center flex-1">
          <View className={`w-12 h-12 rounded-xl items-center justify-center`}>
            <SvgIcons name={ministryIconName} size={40} />
          </View>
          <View className="flex-1 mr-3" style={{ direction: "ltr" }}>
            <Text className="text-gray-800 font-bold text-base mb-1 text-right">
              {title}
            </Text>
            <Text className="text-gray-500 text-xs text-right">
              {description}
            </Text>
          </View>
          <Text className="text-gray-800 font-bold text-xl text-right">
            <SvgIcons name={"SARBlack"} size={18} />
            {amount.toLocaleString("en-US")}
          </Text>
        </View>
      </View>

      <View
        className="flex-row items-center justify-between"
        style={{ direction: "ltr" }}
      >
        {/* Left side: Status badge */}
        <View className="flex-row items-center gap-2">
          {status && (
            <View
              className={`${statusColor} px-3 py-1 rounded-lg items-center justify-center`}
            >
              <Text className="text-white text-xs font-bold">{status}</Text>
            </View>
          )}
        </View>

        {/* Right side: Date and Reference info */}
        <View className="items-end">
          {dueDate && (
            <View className="flex-row items-center gap-1 mx-1">
              <Text className="text-gray-600 text-xs ">
                {formatGregorianDate(dueDate)}
              </Text>
              <Feather name="calendar" size={12} color="#6b7280" />
            </View>
          )}
          {referenceNumber && (
            <View className="flex-row items-center gap-1 mt-1">
              <Text className="text-gray-500 text-xs">{referenceNumber}</Text>
              <Feather name="hash" size={12} color="#9ca3af" />
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default UpcomingPaymentCard;
