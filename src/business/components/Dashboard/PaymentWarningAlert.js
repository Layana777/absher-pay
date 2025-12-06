import React from "react";
import { View, Text } from "react-native";
import { Feather } from "@expo/vector-icons";

/**
 * Payment Warning/Alert Component
 * Displays warning messages for urgent payments
 *
 * @param {string} message - Warning message to display
 * @param {string} type - Alert type: 'warning' or 'info' (default: 'warning')
 */
const PaymentWarningAlert = ({
  message = "قد تحتاج حسابًا غير أعمال - يحتفظ فقط بحساب لحراك الوزارات",
  type = "warning",
}) => {
  const isWarning = type === "warning";

  return (
    <View
      className="mx-4 mb-4 rounded-2xl p-4 flex-row items-start mt-3"
      style={{
        backgroundColor: isWarning ? "#FFF3F3" : "#F0F9FF",
        direction: "rtl",
      }}
    >
      <View className="ml-3">
        <Feather
          name={isWarning ? "alert-circle" : "info"}
          size={20}
          color={isWarning ? "#DC2626" : "#0055aa"}
        />
      </View>
      <Text
        className="flex-1 text-xs leading-5 text-left mx-2"
        style={{ color: isWarning ? "#DC2626" : "#0055aa" }}
      >
        {message}
      </Text>
    </View>
  );
};

export default PaymentWarningAlert;
