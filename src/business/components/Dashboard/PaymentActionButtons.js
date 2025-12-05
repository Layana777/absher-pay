import React from "react";
import { View, TouchableOpacity, Text } from "react-native";
import { Feather } from "@expo/vector-icons";

/**
 * Payment Action Buttons Component
 * Provides action buttons for payment operations
 *
 * @param {Function} onPayNow - Callback for "Pay Now" button
 * @param {Function} onSchedule - Callback for "Schedule Payment" button
 * @param {Function} onRemindLater - Callback for "Remind Later" button
 * @param {string} primaryColor - Primary brand color (default: "#0055aa")
 * @param {boolean} isUrgent - Whether the payment is urgent (affects button styling)
 */
const PaymentActionButtons = ({
  onPayNow,
  onSchedule,
  onRemindLater,
  primaryColor = "#0055aa",
  isUrgent = false,
}) => {
  return (
    <View
      className=" rounded-1xl  p-5 mx-4 mb-9 shadow-sm"
      style={{ direction: "rtl" }}
    >
      {/* Primary Action Button - Pay Now */}
      <TouchableOpacity
        className="rounded-2xl py-4 mb-3 flex-row items-center justify-center"
        style={{ backgroundColor: primaryColor }}
        onPress={onPayNow}
        activeOpacity={0.8}
      >
        <Feather
          name="check-circle"
          size={20}
          color="white"
          style={{ marginLeft: 8 }}
        />
        <Text className="text-white text-base font-bold">ادفع الآن</Text>
      </TouchableOpacity>

      {/* Secondary Actions Row */}
      <View className="flex-row gap-3">
        {/* Schedule Payment */}
        <TouchableOpacity
          className="flex-1 rounded-2xl py-3 flex-row items-center justify-center border"
          style={{ borderColor: primaryColor }}
          onPress={onSchedule}
          activeOpacity={0.7}
        >
          <Feather
            name="calendar"
            size={18}
            color={primaryColor}
            style={{ marginLeft: 6 }}
          />
          <Text className="text-sm font-bold" style={{ color: primaryColor }}>
            جدولة
          </Text>
        </TouchableOpacity>

        {/* Remind Later */}
        <TouchableOpacity
          className="flex-1 rounded-2xl py-3 flex-row items-center justify-center bg-gray-100"
          onPress={onRemindLater}
          activeOpacity={0.7}
        >
          <Feather
            name="bell"
            size={18}
            color="#6B7280"
            style={{ marginLeft: 6 }}
          />
          <Text className="text-gray-700 text-sm font-bold">تذكير</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default PaymentActionButtons;
