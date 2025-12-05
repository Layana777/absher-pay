import React from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import UpcomingPaymentCard from "./UpcomingPaymentCard";

/**
 * Reusable Upcoming Payments Section Component
 * @param {Array} payments - Array of payment objects
 * @param {Function} onViewAll - Callback when "View All" is pressed
 * @param {Function} onPaymentPress - Callback when a payment card is pressed
 * @param {string} title - Section title (default: "المدفوعات القادمة")
 * @param {boolean} showViewAll - Whether to show "View All" button (default: true)
 */
const UpcomingPaymentsSection = ({
  payments = [],
  onViewAll,
  onPaymentPress,
  title = "المدفوعات القادمة",
  showViewAll = true,
}) => {
  // Default sample data if no payments provided
  const defaultPayments = [
    {
      id: "1",
      title: "تجديد إقامة العمالة",
      description: "حلول ذا اسبوع • 13 عامل",
      amount: 6500,
      icon: "users",
      iconColor: "#dc2626",
      iconBgColor: "bg-red-50",
      isUrgent: true,
    },
    {
      id: "2",
      title: "رسوم الغرفة",
      description: "15 يوم • 3 أيام",
      amount: 2800,
      icon: "file-text",
      iconColor: "#0055aa",
      iconBgColor: "bg-blue-50",
      isUrgent: false,
    },
    {
      id: "3",
      title: "تجديد السجل التجاري",
      description: "22 يوم",
      amount: 1200,
      icon: "file",
      iconColor: "#0055aa",
      iconBgColor: "bg-blue-50",
      isUrgent: false,
    },
  ];

  const displayPayments = payments.length > 0 ? payments : defaultPayments;

  return (
    <View className=" p-8 mb-6" style={{ direction: "rtl" }}>
      {/* Header */}
      <View className="flex-row justify-between items-center mb-4 ">
        <Text className="text-gray-800 text-lg font-bold text-right">
          {title}
        </Text>
        {showViewAll && onViewAll && (
          <TouchableOpacity onPress={onViewAll}>
            <Text className="text-[#0055aa] text-sm">عرض الكل</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Payment Cards */}
      {displayPayments.map((payment) => (
        <UpcomingPaymentCard
          key={payment.id}
          payment={payment}
          onPress={() => onPaymentPress && onPaymentPress(payment)}
        />
      ))}
    </View>
  );
};

export default UpcomingPaymentsSection;
