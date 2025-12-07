import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Feather } from "@expo/vector-icons";
import SvgIcons from "../../common/components/SvgIcons";

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
 * @param {boolean} payment.isUrgent - Whether payment is urgent
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
    isUrgent = false,
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
          <View
            className={`w-12 h-12 ${iconBgColor} rounded-xl items-center justify-center`}
          >
            <SvgIcons name={"MOI"} size={18} />
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

      <View style={{ direction: "ltr" }}>
        {isUrgent && (
          <View className="bg-red-500  py-1 rounded-lg w-12  items-center justify-center ">
            <Text className="text-white text-xs font-bold items-left">
              عاجل
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

export default UpcomingPaymentCard;
