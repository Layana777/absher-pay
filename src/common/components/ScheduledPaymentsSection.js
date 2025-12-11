import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import UpcomingPaymentCard from "./UpcomingPaymentCard";
import {
  getUserBills,
} from "../services/billsService";
import {
  getUserScheduledBills,
  getDaysUntilScheduled,
} from "../services/scheduledBillsService";
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
 * Transform scheduled bill to payment card format
 * @param {Object} scheduledBill - Scheduled bill object
 * @param {Object} originalBill - Original bill object
 */
const transformScheduledBillToPayment = (scheduledBill, originalBill) => {
  const serviceType = scheduledBill.metadata?.serviceType || originalBill?.serviceType || "commerce";

  // Calculate days until scheduled
  const daysRemaining = getDaysUntilScheduled(scheduledBill);
  const daysText =
    daysRemaining > 0
      ? `بعد ${daysRemaining} يوم`
      : daysRemaining === 0
      ? "اليوم"
      : `قبل ${Math.abs(daysRemaining)} يوم`;

  return {
    id: scheduledBill.billId || scheduledBill.id, // Use original bill ID
    title: scheduledBill.serviceName || originalBill?.serviceName?.ar || "خدمة مجدولة",
    description: daysText,
    amount: scheduledBill.scheduledAmount,
    icon: getServiceIcon(serviceType),
    iconColor: "#10b981", // Green color for scheduled
    iconBgColor: "bg-green-50",
    isUrgent: false,
    dueDate: scheduledBill.scheduledDate,
    status: "", // Remove "مجدول" label
    category: "", // Remove "مجدول" label
    serviceType: scheduledBill.serviceName || originalBill?.serviceName?.ar || "خدمة مجدولة",
    aiSuggestion: `سيتم الدفع تلقائياً في ${new Date(scheduledBill.scheduledDate).toLocaleDateString("ar")}`,
    ministryIconName: getMinistryIconName(serviceType),
    ministryIconSize: 50,
    isScheduled: true,
    scheduledBillData: scheduledBill,
    // Include original bill data so UpcomingPayDetails can access it
    billData: originalBill,
  };
};

/**
 * Scheduled Payments Section Component
 * @param {string} userId - User ID to fetch scheduled bills for
 * @param {Function} onViewAll - Callback when "View All" is pressed
 * @param {Function} onPaymentPress - Callback when a payment card is pressed
 * @param {string} title - Section title (default: "الدفعات المجدولة")
 * @param {boolean} showViewAll - Whether to show "View All" button (default: true)
 */
const ScheduledPaymentsSection = ({
  userId,
  onViewAll,
  onPaymentPress,
  title = "المدفوعات المجدولة",
  showViewAll = true,
}) => {
  const [scheduledPayments, setScheduledPayments] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (userId) {
      fetchScheduledPayments();
    }
  }, [userId]);

  const fetchScheduledPayments = async () => {
    try {
      setLoading(true);

      // Fetch both scheduled bills and all bills
      const [scheduledBills, allBills] = await Promise.all([
        getUserScheduledBills(userId, { status: 'scheduled' }),
        getUserBills(userId)
      ]);

      // Create a map of bills by ID for quick lookup
      const billsMap = {};
      allBills.forEach(bill => {
        billsMap[bill.id] = bill;
      });

      // Transform scheduled bills with their original bill data
      const transformedScheduledBills = scheduledBills
        .map(scheduledBill => {
          const originalBill = billsMap[scheduledBill.billId];

          // Skip if no original bill found
          if (!originalBill) {
            console.warn('⚠️ No original bill found for scheduled bill:', scheduledBill.billId);
            return null;
          }

          // Skip if original bill has been paid
          if (originalBill.status === 'paid') {
            return null;
          }

          return transformScheduledBillToPayment(scheduledBill, originalBill);
        })
        .filter(Boolean) // Remove null entries
        .sort((a, b) => a.dueDate - b.dueDate) // Sort by scheduled date
        .slice(0, 3); // Limit to 3

      setScheduledPayments(transformedScheduledBills);
    } catch (error) {
      console.error("Error fetching scheduled payments:", error);
      setScheduledPayments([]);
    } finally {
      setLoading(false);
    }
  };

  // Don't render section if no scheduled payments
  if (!loading && scheduledPayments.length === 0) {
    return null;
  }

  return (
    <View className=" p-8 mb-2" style={{ direction: "rtl" }}>
      {/* Header */}
      <View className="flex-row justify-between items-center mb-4 ">
        <Text className="text-gray-800 text-lg font-bold text-right">
          {title}
        </Text>
        {showViewAll && onViewAll && scheduledPayments.length > 0 && (
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
        scheduledPayments.length > 0 &&
        scheduledPayments.map((payment) => (
          <UpcomingPaymentCard
            key={payment.id}
            payment={payment}
            onPress={() => onPaymentPress && onPaymentPress(payment)}
          />
        ))}
    </View>
  );
};

export default ScheduledPaymentsSection;
