import React from "react";
import { View, Text } from "react-native";
import { Feather } from "@expo/vector-icons";

/**
 * Payment Breakdown Card Component
 * Shows cost breakdown including base amount, VAT, service fees, penalty, and total
 *
 * @param {number} amount - Base payment amount
 * @param {number} vatAmount - VAT amount (calculated as amount * 0.15)
 * @param {number} serviceFee - Service fee amount (default: 0)
 * @param {number} penaltyAmount - Penalty amount for overdue bills (default: 0)
 * @param {number} totalAmount - Total amount to pay
 * @param {string} primaryColor - Primary brand color (default: "#0055aa")
 */
const PaymentBreakdownCard = ({
  amount,
  vatAmount,
  serviceFee = 0,
  penaltyAmount = 0,
  totalAmount,
  primaryColor = "#0055aa",
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
      {/* Header with Icon */}
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

      {/* Breakdown */}
      <View className="bg-gray-50 rounded-2xl p-4 mb-3">
        {/* Base Amount */}
        <BreakdownRow label="المبلغ الأساسي" value={amount} />

        {/* Penalty (if applicable) */}
        {penaltyAmount > 0 && (
          <BreakdownRow label="غرامة التأخير" value={penaltyAmount} isSubdued />
        )}

        {/* VAT (15% for Saudi Arabia)
        <BreakdownRow label="ضريبة القيمة المضافة (%15)" value={vatAmount} isSubdued /> */}

        {/* Service Fee (if applicable) */}
        {serviceFee > 0 && (
          <BreakdownRow label="رسوم الخدمة" value={serviceFee} isSubdued />
        )}
      </View>

      {/* Total */}
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
