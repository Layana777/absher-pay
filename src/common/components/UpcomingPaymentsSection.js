import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import UpcomingPaymentCard from "./UpcomingPaymentCard";
import { getUserBills, getDaysUntilDue } from "../services/billsService";

/**
 * Map bill data to payment card format
 */
const mapBillToPayment = (bill) => {
  const daysUntilDue = getDaysUntilDue(bill);
  const isUrgent = daysUntilDue <= 7 && daysUntilDue >= 0;

  // Format description based on days until due
  let description = "";
  if (daysUntilDue < 0) {
    description = `متأخر ${Math.abs(daysUntilDue)} يوم`;
  } else if (daysUntilDue === 0) {
    description = "مستحق اليوم";
  } else if (daysUntilDue <= 7) {
    description = `${daysUntilDue} أيام متبقية`;
  } else {
    description = `${daysUntilDue} يوم`;
  }

  return {
    id: bill.id,
    title: bill.serviceName.ar,
    description,
    amount: bill.penaltyInfo?.totalWithPenalty || bill.amount,
    icon: bill.category || "file-text",
    iconColor: isUrgent ? "#dc2626" : "#0055aa",
    iconBgColor: isUrgent ? "bg-red-50" : "bg-blue-50",
    isUrgent,
    // Store original bill data for details screen
    billData: bill,
  };
};

/**
 * Reusable Upcoming Payments Section Component
 * @param {string} userId - User ID to fetch bills for
 * @param {Array} payments - Array of payment objects (optional, will fetch if not provided)
 * @param {Function} onViewAll - Callback when "View All" is pressed
 * @param {Function} onPaymentPress - Callback when a payment card is pressed
 * @param {string} title - Section title (default: "المدفوعات القادمة")
 * @param {boolean} showViewAll - Whether to show "View All" button (default: true)
 */
const UpcomingPaymentsSection = ({
  userId,
  payments = [],
  onViewAll,
  onPaymentPress,
  title = "المدفوعات القادمة",
  showViewAll = true,
}) => {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Only fetch if no payments provided and userId is available
    if (payments.length === 0 && userId) {
      fetchUpcomingBills();
    }
  }, [userId]);

  const fetchUpcomingBills = async () => {
    try {
      setLoading(true);
      const allBills = await getUserBills(userId);

      // Filter for unpaid and upcoming bills, sort by due date, limit to 3
      const upcomingBills = allBills
        .filter(
          (bill) => bill.status === "unpaid" || bill.status === "upcoming"
        )
        .sort((a, b) => a.dueDate - b.dueDate)
        .slice(0, 3)
        .map(mapBillToPayment);

      setBills(upcomingBills);
    } catch (error) {
      console.error("Error fetching bills:", error);
      setBills([]);
    } finally {
      setLoading(false);
    }
  };

  const displayPayments = payments.length > 0 ? payments : bills;

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

      {/* Loading State */}
      {loading && (
        <View className="py-8 items-center">
          <ActivityIndicator size="large" color="#0055aa" />
        </View>
      )}

      {/* Payment Cards */}
      {!loading &&
        displayPayments.length > 0 &&
        displayPayments.map((payment) => (
          <UpcomingPaymentCard
            key={payment.id}
            payment={payment}
            onPress={() => onPaymentPress && onPaymentPress(payment)}
          />
        ))}

      {/* Empty State */}
      {!loading && displayPayments.length === 0 && (
        <View className="py-8 items-center">
          <Text className="text-gray-500 text-center">
            لا توجد فواتير قادمة
          </Text>
        </View>
      )}
    </View>
  );
};

export default UpcomingPaymentsSection;
