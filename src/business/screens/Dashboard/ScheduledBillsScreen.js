import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import {
  getUserScheduledBills,
  cancelScheduledBill,
  processScheduledBill,
  getDaysUntilScheduled,
} from "../../../common/services/scheduledBillsService";
import { getUserBills } from "../../../common/services/billsService";
import { CustomHeader } from "../../../common/components";
import UpcomingPaymentCard from "../../../common/components/UpcomingPaymentCard";
import SvgIcons from "../../../common/components/SvgIcons";
import GOVERNMENT_SERVICES_DATA from "../../../common/services/firebase/governmentServicesData";
import { getMinistryIconName } from "../../../common/utils/ministryIconMapper";
import { useUser } from "../../../store/hooks";

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
    id: scheduledBill.billId || scheduledBill.id,
    title: scheduledBill.serviceName || originalBill?.serviceName?.ar || "خدمة مجدولة",
    description: daysText,
    amount: scheduledBill.scheduledAmount,
    icon: getServiceIcon(serviceType),
    iconColor: "#10b981", // Green color for scheduled
    iconBgColor: "bg-green-50",
    isUrgent: false,
    dueDate: scheduledBill.scheduledDate,
    status: "",
    category: "",
    serviceType: scheduledBill.serviceName || originalBill?.serviceName?.ar || "خدمة مجدولة",
    aiSuggestion: `سيتم الدفع تلقائياً في ${new Date(scheduledBill.scheduledDate).toLocaleDateString("ar")}`,
    ministryIconName: getMinistryIconName(serviceType),
    ministryIconSize: 50,
    isScheduled: true,
    scheduledBillData: scheduledBill,
    billData: originalBill,
    // Store service type for filtering
    billServiceType: serviceType,
  };
};

/**
 * Scheduled Bills Screen
 * Displays all scheduled bill payments for the user
 */
const ScheduledBillsScreen = ({ navigation }) => {
  const primaryColor = "#0055aa";

  // Redux state
  const user = useUser();

  // Local state
  const [scheduledPayments, setScheduledPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeServiceFilter, setActiveServiceFilter] = useState("الكل");
  const [totalScheduledAmount, setTotalScheduledAmount] = useState(0);

  // Service filters from GOVERNMENT_SERVICES_DATA (Arabic only)
  const serviceFilters = [
    "الكل",
    ...Object.values(GOVERNMENT_SERVICES_DATA).map((service) => service.nameAr),
  ];

  // Helper to map Arabic service name to service type key
  const getServiceTypeKey = (arabicName) => {
    if (arabicName === "الكل") return "all";
    const entry = Object.entries(GOVERNMENT_SERVICES_DATA).find(
      ([_, service]) => service.nameAr === arabicName
    );
    return entry ? entry[0] : null;
  };

  // Fetch scheduled bills with original bill data
  const fetchScheduledBills = async () => {
    if (!user?.uid) return;

    try {
      setLoading(true);

      // Fetch both scheduled bills and all bills
      const [scheduledBills, allBills] = await Promise.all([
        getUserScheduledBills(user.uid),
        getUserBills(user.uid)
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

          // Skip if original bill has been paid (unless the scheduled bill itself is marked as paid)
          if (originalBill.status === 'paid' && scheduledBill.status !== 'paid') {
            return null;
          }

          return transformScheduledBillToPayment(scheduledBill, originalBill);
        })
        .filter(Boolean) // Remove null entries
        .sort((a, b) => a.dueDate - b.dueDate); // Sort by scheduled date

      setScheduledPayments(transformedScheduledBills);

      // Calculate total scheduled amount (only for scheduled status)
      const totalAmount = transformedScheduledBills
        .filter(payment => payment.scheduledBillData?.status === 'scheduled')
        .reduce((sum, payment) => sum + payment.amount, 0);
      setTotalScheduledAmount(totalAmount);
    } catch (error) {
      console.error("Error fetching scheduled bills:", error);
      Alert.alert("خطأ", "حدث خطأ أثناء تحميل الفواتير المجدولة");
    } finally {
      setLoading(false);
    }
  };

  // Refresh scheduled bills
  const onRefresh = async () => {
    setRefreshing(true);
    await fetchScheduledBills();
    setRefreshing(false);
  };

  // Fetch on screen focus
  useFocusEffect(
    useCallback(() => {
      if (user?.uid) {
        fetchScheduledBills();
      }
    }, [user?.uid])
  );

  // Filter scheduled payments based on active filters
  const filteredPayments = scheduledPayments.filter((payment) => {
    // Filter by service type
    if (activeServiceFilter !== "الكل") {
      const selectedServiceTypeKey = getServiceTypeKey(activeServiceFilter);
      if (selectedServiceTypeKey && payment.billServiceType !== selectedServiceTypeKey) {
        return false;
      }
    }

    return true;
  });

  // Handle payment card press
  const handlePaymentPress = (payment) => {
    console.log("Scheduled payment pressed:", payment);
    navigation.navigate("UpcomingPayDetails", {
      payment,
      primaryColor,
    });
  };

  return (
    <>
      <CustomHeader
        title="الفواتير المجدولة"
        onBack={() => navigation.goBack()}
        backgroundColor={primaryColor}
        textColor="#FFFFFF"
        statusBarStyle="light-content"
        statusBarBackgroundColor={primaryColor}
      />
      <View className="flex-1 bg-gray-50" style={{ direction: "ltr" }}>
        {/* Loading State */}
        {loading && (
          <View className="flex-1 justify-center items-center">
            <ActivityIndicator size="large" color={primaryColor} />
            <Text className="text-gray-600 mt-4">جاري تحميل الفواتير المجدولة...</Text>
          </View>
        )}

        {/* Main Content */}
        {!loading && (
          <ScrollView
            className="flex-1"
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
          >
          {/* Top Section - Total Card + Filters */}
          <View className="bg-[#ffffff] p-3 mb-6 pb-4 rounded-b-[30px]">
            {/* Total Scheduled Amount Card */}
            <View className="px-4 pt-2 pb-4">
              <View
                className="rounded-3xl p-9"
                style={{ backgroundColor: primaryColor }}
              >
                <Text className="text-white text-sm mb-2 text-center opacity-90">
                  إجمالي المدفوعات المجدولة
                </Text>

                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "center",
                    direction: "ltr",
                    padding: 13,
                  }}
                >
                  <SvgIcons name="SAR" size={28} />
                  <Text className="text-white text-4xl font-bold text-center">
                    {totalScheduledAmount.toLocaleString()}
                  </Text>
                </View>
              </View>
            </View>

            {/* Service Type Filter */}
            <View className="mb-6" style={{ direction: "rtl" }}>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 16 }}
              >
                {serviceFilters.map((filter, index) => (
                  <TouchableOpacity
                    key={filter}
                    onPress={() => setActiveServiceFilter(filter)}
                    className="px-6 py-2 rounded-lg"
                    style={{
                      backgroundColor:
                        activeServiceFilter === filter
                          ? primaryColor
                          : "white",
                      marginLeft: index < serviceFilters.length - 1 ? 8 : 0,
                    }}
                  >
                    <Text
                      className={`font-semibold ${
                        activeServiceFilter === filter
                          ? "text-white"
                          : "text-gray-700"
                      }`}
                    >
                      {filter}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>

          {/* Scheduled Bills List */}
          <View className="px-4 pb-6">
            {filteredPayments.map((payment) => (
              <UpcomingPaymentCard
                key={payment.id}
                payment={payment}
                onPress={() => handlePaymentPress(payment)}
              />
            ))}

            {/* Empty State */}
            {filteredPayments.length === 0 && (
              <View className="items-center justify-center py-12">
                <Feather name="calendar" size={48} color="#D1D5DB" />
                <Text className="text-gray-500 text-base mt-4">
                  لا توجد فواتير مجدولة
                </Text>
                <Text className="text-gray-400 text-sm mt-2 text-center">
                  يمكنك جدولة دفع الفواتير من صفحة تفاصيل الفاتورة
                </Text>
              </View>
            )}
          </View>
        </ScrollView>
        )}
      </View>
    </>
  );
};

export default ScheduledBillsScreen;
