import React from "react";
import { View, Text } from "react-native";
import { Feather } from "@expo/vector-icons";
import { COLORS } from "../../../common/constants/colors";

/**
 * Single (Customer) Payment Breakdown Card Component
 */
const PaymentBreakdownCard = ({
  amount,
  vatAmount,
  serviceFee = 0,
  penaltyAmount = 0,
  totalAmount,
  primaryColor = COLORS.singlePrimary,
}) => {
  const BreakdownRow = ({ label, value, isSubdued = false }) => (
    <View className="flex-row items-center justify-between py-2">
      <Text
        className={`text-sm ${
          isSubdued ? "text-gray-500" : "text-gray-700"
        } text-right`}
      >
        {label}
      </Text>
      <Text
        className={`text-sm font-bold ${
          isSubdued ? "text-gray-600" : "text-gray-800"
        } text-left`}
      >
        {value.toLocaleString("en-US")} ريال
      </Text>
    </View>
  );

  return (
    <View
      className="bg-white rounded-3xl p-6 mx-4 mb-4 shadow-sm"
      style={{ direction: "rtl" }}
    >
      <View className="flex-row items-center justify-between mb-5">
        <Text className="text-gray-800 text-base font-bold text-right">
          تفاصيل المبلغ
        </Text>
        <View
          className="w-10 h-10 rounded-full items-center justify-center"
          style={{ backgroundColor: `${primaryColor}15` }}
        >
          <Feather name="credit-card" size={20} color={primaryColor} />
        </View>
      </View>

      <View className="bg-gray-50 rounded-2xl p-4 mb-3">
        <BreakdownRow label="المبلغ الأساسي" value={amount} />
        {penaltyAmount > 0 && (
          <BreakdownRow label="غرامة التأخير" value={penaltyAmount} isSubdued />
        )}
        {serviceFee > 0 && (
          <BreakdownRow label="رسوم الخدمة" value={serviceFee} isSubdued />
        )}
      </View>

      <View className="bg-gray-50 rounded-2xl p-4">
        <View className="flex-row items-center justify-between">
          <Text className="text-base font-bold text-gray-800 text-right">
            الإجمالي النهائي
          </Text>
          <Text className="text-xl font-bold text-gray-900 text-left">
            {totalAmount.toLocaleString("en-US")} ريال
          </Text>
        </View>
      </View>
    </View>
  );
};

export default PaymentBreakdownCard;
