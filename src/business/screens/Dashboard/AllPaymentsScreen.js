import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { CustomHeader } from "../../../common/components";
import UpcomingPaymentCard from "../../../common/components/UpcomingPaymentCard";
import SvgIcons from "../../../common/components/SvgIcons";
import { useUser, useBusinessWallet } from "../../../store/hooks";
import {
  getUserBills,
  calculateBulkTotal,
  isBillOverdue,
  getDaysUntilDue,
} from "../../../common/services/billsService";
import GOVERNMENT_SERVICES_DATA from "../../../common/services/firebase/governmentServicesData";
import { getMinistryIconName } from "../../../common/utils/ministryIconMapper";
import { getArabicStatus } from "../../../common/utils/billStatusUtils";

const AllPaymentsScreen = ({ navigation, route }) => {
  const { primaryColor = "#0055aa" } = route.params || {};

  // Redux state
  const user = useUser();
  const businessWallet = useBusinessWallet();

  // Local state
  const [allBills, setAllBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeStatusFilter, setActiveStatusFilter] = useState("الكل");
  const [activeServiceFilter, setActiveServiceFilter] = useState("الكل");
  const [totalDueAmount, setTotalDueAmount] = useState(0);

  // Status filters (Arabic)
  const statusFilters = ["الكل", "غير مدفوع", "قادم", "متأخر"];

  // Fixed service filters from GOVERNMENT_SERVICES_DATA (Arabic only)
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

  // Helper function to get service name in Arabic
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

  // Helper function to get icon for service
  const getServiceIcon = (serviceType) => {
    const iconMap = {
      passports: "file-text",
      traffic: "truck",
      civil_affairs: "file",
      commerce: "briefcase",
    };
    return iconMap[serviceType] || "file-text";
  };

  // Helper function to get color for service
  const getServiceColor = (serviceType) => {
    const colorMap = {
      passports: { icon: "#8B5CF6", bg: "bg-purple-50" },
      traffic: { icon: "#EF4444", bg: "bg-red-50" },
      civil_affairs: { icon: "#3B82F6", bg: "bg-blue-50" },
      commerce: { icon: "#F97316", bg: "bg-orange-50" },
    };
    return colorMap[serviceType] || { icon: "#6B7280", bg: "bg-gray-50" };
  };

  // Transform Firebase bill to UpcomingPaymentCard format
  const transformBillToPayment = (bill) => {
    console.log("Transforming bill:", bill);

    // Get service name using the helper function
    const serviceSubTypeNameAr = getServiceNameAr(
      bill.serviceType,
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

  // Fetch bills from Firebase
  const fetchBills = async () => {
    if (!user?.uid || !businessWallet?.id) {
      setError("لا يوجد مستخدم أو محفظة نشطة");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Fetch all bills for the user
      const bills = await getUserBills(user.uid, {});

      // Filter to only business wallet bills (including paid bills for transaction history)
      const businessBills = bills.filter(
        (bill) =>
          bill.walletId === businessWallet.id &&
          bill.isBusiness === true
      );

      setAllBills(businessBills);

      // Calculate total due amount (unpaid + overdue, excluding paid)
      const dueBills = businessBills.filter(
        (bill) => bill.status !== "paid" && (bill.status === "unpaid" || isBillOverdue(bill))
      );
      const total = calculateBulkTotal(dueBills);
      setTotalDueAmount(total);
    } catch (err) {
      console.error("Error fetching bills:", err);
      setError("حدث خطأ أثناء تحميل الفواتير");
    } finally {
      setLoading(false);
    }
  };

  // Fetch bills on component mount
  useEffect(() => {
    fetchBills();
  }, [user?.uid, businessWallet?.id]);

  // فلترة المدفوعات حسب الفلاتر النشطة
  const filteredPayments = allBills
    .filter((bill) => {
      // IMPORTANT: Exclude paid bills - this screen only shows unpaid/upcoming/overdue bills
      if (bill.status === "paid") return false;

      // Filter by status
      if (activeStatusFilter !== "الكل") {
        const arabicStatus = getArabicStatus(bill);
        if (arabicStatus !== activeStatusFilter) return false;
      }

      // Filter by service type using serviceType field
      if (activeServiceFilter !== "الكل") {
        const selectedServiceTypeKey = getServiceTypeKey(activeServiceFilter);
        if (
          selectedServiceTypeKey &&
          bill.serviceType !== selectedServiceTypeKey
        ) {
          return false;
        }
      }

      return true;
    })
    .map(transformBillToPayment);

  // معالج الضغط على كرت المدفوعة
  const handlePaymentPress = (payment) => {
    console.log("Payment pressed:", payment);
    navigation.navigate("UpcomingPayDetails", {
      payment,
      primaryColor,
    });
  };

  // Handle Pay All button - Navigate to review screen
  const handlePayAll = () => {
    if (!user?.uid || !businessWallet?.id) {
      Alert.alert("خطأ", "لا يوجد مستخدم أو محفظة نشطة");
      return;
    }

    // Get all unpaid and overdue bills (excluding paid)
    const billsToPay = (allBills || []).filter(
      (bill) =>
        bill != null && bill.status !== "paid" && (bill.status === "unpaid" || isBillOverdue(bill))
    );

    if (billsToPay.length === 0) {
      Alert.alert("تنبيه", "لا توجد فواتير مستحقة للدفع");
      return;
    }

    const total = calculateBulkTotal(billsToPay);

    // Navigate to bulk payment review screen
    navigation.navigate("BulkPaymentReview", {
      billsToPay,
      totalAmount: total,
      userId: user.uid,
      walletId: businessWallet.id,
      primaryColor,
      onPaymentComplete: fetchBills, // Pass refresh function
    });
  };

  return (
    <>
      <CustomHeader
        title="مركز المدفوعات"
        onBack={() => navigation.goBack()}
        rightComponent={
          <TouchableOpacity
            onPress={() => navigation.navigate("PaidBills", { primaryColor })}
            className="p-2"
          >
            <Feather name="file-text" size={24} color="#000000" />
          </TouchableOpacity>
        }
      />
      <View className="flex-1 bg-gray-50" style={{ direction: "ltr" }}>
        {/* Loading State */}
        {loading && (
          <View className="flex-1 justify-center items-center">
            <ActivityIndicator size="large" color={primaryColor} />
            <Text className="text-gray-600 mt-4">جاري تحميل الفواتير...</Text>
          </View>
        )}

        {/* Error State */}
        {!loading && error && (
          <View className="flex-1 justify-center items-center px-6">
            <Feather name="alert-circle" size={48} color="#EF4444" />
            <Text className="text-gray-700 text-center mt-4 text-lg">
              {error}
            </Text>
            <TouchableOpacity
              className="mt-6 px-6 py-3 rounded-lg"
              style={{ backgroundColor: primaryColor }}
              onPress={fetchBills}
            >
              <Text className="text-white font-semibold">إعادة المحاولة</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Main ScrollView - Everything scrolls together */}
        {!loading && !error && (
          <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
            {/* الجزء العلوي بالكامل - كرت + فلاتر بخلفية واحدة */}
            <View className="bg-[#ffffff] p-3 mb-6 pb-4 rounded-b-[30px]">
              {/* إجمالي المدفوعات المستحقة */}
              <View className="px-4 pt-2 pb-4">
                <View
                  className="rounded-3xl p-9"
                  style={{ backgroundColor: primaryColor }}
                >
                  <Text className="text-white text-sm mb-2 text-center opacity-90">
                    إجمالي المدفوعات المستحقة
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
                      {totalDueAmount.toLocaleString()}
                    </Text>
                  </View>

                  <TouchableOpacity
                    className="bg-white rounded-xl py-3"
                    onPress={handlePayAll}
                    disabled={totalDueAmount === 0}
                    style={{ opacity: totalDueAmount === 0 ? 0.5 : 1 }}
                  >
                    <Text
                      className="text-center font-semibold"
                      style={{ color: primaryColor }}
                    >
                      دفع الكل
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* فلتر نوع الخدمة */}
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

              {/* فلتر الحالة */}
              <View className="mb-5" style={{ direction: "rtl" }}>
                <View className="flex-row items-center bg-[#f8f8f8] rounded-lg py-2">
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ paddingHorizontal: 3 }}
                  >
                    {statusFilters.map((filter, index) => (
                      <TouchableOpacity
                        key={filter}
                        onPress={() => setActiveStatusFilter(filter)}
                        className="px-6 py-2 rounded-lg"
                        style={{
                          backgroundColor:
                            activeStatusFilter === filter
                              ? primaryColor
                              : "white",
                          marginRight: index < statusFilters.length - 1 ? 8 : 0,
                        }}
                      >
                        <Text
                          className={`font-semibold ${
                            activeStatusFilter === filter
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
            </View>

            {/* قائمة المدفوعات */}
            <View className="px-4 pb-6">
              {filteredPayments.map((payment) => (
                <UpcomingPaymentCard
                  key={payment.id}
                  payment={payment}
                  onPress={() => handlePaymentPress(payment)}
                />
              ))}

              {/* رسالة فارغة */}
              {filteredPayments.length === 0 && (
                <View className="items-center justify-center py-12">
                  <Feather name="inbox" size={48} color="#D1D5DB" />
                  <Text className="text-gray-500 text-base mt-4">
                    لا توجد مدفوعات في هذا القسم
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

export default AllPaymentsScreen;
