import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import UpcomingPaymentCard from "./UpcomingPaymentCard";
import {
  getUserBills,
  getDaysUntilDue,
  isBillOverdue,
} from "../services/billsService";
import GOVERNMENT_SERVICES_DATA from "../services/firebase/governmentServicesData";
import { getMinistryIconName } from "../utils/ministryIconMapper";

/**
 * Helper function to get service name in Arabic
 */
const getServiceNameAr = (serviceType, serviceSubType) => {
  const service = GOVERNMENT_SERVICES_DATA[serviceType];

  // If subType exists, return its Arabic name
  if (service?.subTypes?.[serviceSubType]?.nameAr) {
    return service.subTypes[serviceSubType].nameAr;
  }

  // If no subType, return main service Arabic name
  if (service?.nameAr) {
    return service.nameAr;
  }

  // Absolute fallback (should rarely happen)
  return serviceType;
};

/**
 * Helper function to get icon for service
 */
const getServiceIcon = (serviceType) => {
  const iconMap = {
    passports: "file-text",
    traffic: "truck",
    civil_affairs: "file",
    commerce: "briefcase",
  };
  return iconMap[serviceType] || "file-text";
};

/**
 * Helper function to get color for service
 */
const getServiceColor = (serviceType) => {
  const colorMap = {
    passports: { icon: "#8B5CF6", bg: "bg-purple-50" },
    traffic: { icon: "#EF4444", bg: "bg-red-50" },
    civil_affairs: { icon: "#3B82F6", bg: "bg-blue-50" },
    commerce: { icon: "#F97316", bg: "bg-orange-50" },
  };
  return colorMap[serviceType] || { icon: "#6B7280", bg: "bg-gray-50" };
};

/**
 * Helper function to map Firebase status to Arabic
 */
const getArabicStatus = (bill) => {
  if (isBillOverdue(bill)) return "متأخر";
  if (bill.status === "upcoming") return "متوقع";
  if (bill.status === "unpaid") return "مستحق";
  return "الكل";
};

/**
 * Transform Firebase bill to payment card format
 */
const transformBillToPayment = (bill) => {
  // Get service name using the helper function
  const serviceSubTypeNameAr = getServiceNameAr(
    bill.serviceType,
    bill.serviceSubType
  );

  const colors = getServiceColor(bill.serviceType);
  const arabicStatus = getArabicStatus(bill);
  const displayAmount = bill.penaltyInfo?.totalWithPenalty || bill.amount;

  // Calculate days remaining
  const daysRemaining = getDaysUntilDue(bill);
  const daysText =
    daysRemaining > 0
      ? `${daysRemaining} يوم متبقي`
      : daysRemaining === 0
      ? "اليوم آخر موعد"
      : `متأخر ${Math.abs(daysRemaining)} يوم`;

  return {
    id: bill.id,
    title: bill.serviceName?.ar || serviceSubTypeNameAr || "غير محدد",
    description: daysText,
    amount: displayAmount,
    icon: getServiceIcon(bill.serviceType),
    iconColor: colors.icon,
    iconBgColor: colors.bg,
    isUrgent: isBillOverdue(bill),
    dueDate: bill.dueDate,
    status: arabicStatus,
    category: arabicStatus,
    serviceType: bill.serviceName?.ar || serviceSubTypeNameAr || "غير محدد",
    aiSuggestion: bill.penaltyInfo
      ? `متأخر ${bill.penaltyInfo.daysOverdue} يوم - غرامة ${bill.penaltyInfo.lateFee} ريال`
      : "لا يوجد",
    // Ministry icon configuration
    ministryIconName: getMinistryIconName(bill.serviceType),
    ministryIconSize: 50, // Size for detail screen header
    // Keep original bill data for payment processing
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
        .map(transformBillToPayment);

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
