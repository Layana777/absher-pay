import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { CustomHeader } from "../../../common/components";
import UpcomingPaymentCard from "../../../common/components/UpcomingPaymentCard";
import SvgIcons from "../../../common/components/SvgIcons";
import { useUser, useBusinessWallet } from "../../../store/hooks";
import { getUserBills } from "../../../common/services/billsService";
import GOVERNMENT_SERVICES_DATA from "../../../common/services/firebase/governmentServicesData";
import { getMinistryIconName } from "../../../common/utils/ministryIconMapper";

const PaidBillsScreen = ({ navigation, route }) => {
  const { primaryColor = "#0055aa" } = route.params || {};

  // Redux state
  const user = useUser();
  const businessWallet = useBusinessWallet();

  // Local state
  const [paidBills, setPaidBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

    // Absolute fallback
    return serviceType;
  };

  // Helper function to get icon for service
  const getServiceIcon = (serviceType) => {
    const iconMap = {
      passports: "file-text",
      traffic: "truck",
      civil_affairs: "file",
      human_resources: "users",
      commerce: "briefcase",
      justice: "scale",
    };
    return iconMap[serviceType] || "file-text";
  };

  // Helper function to get color for service
  const getServiceColor = (serviceType) => {
    const colorMap = {
      passports: { icon: "#8B5CF6", bg: "bg-purple-50" },
      traffic: { icon: "#EF4444", bg: "bg-red-50" },
      civil_affairs: { icon: "#3B82F6", bg: "bg-blue-50" },
      human_resources: { icon: "#8B5CF6", bg: "bg-purple-50" },
      commerce: { icon: "#F97316", bg: "bg-orange-50" },
      justice: { icon: "#10B981", bg: "bg-green-50" },
    };
    return colorMap[serviceType] || { icon: "#6B7280", bg: "bg-gray-50" };
  };

  // Transform Firebase bill to UpcomingPaymentCard format
  const transformBillToPayment = (bill) => {
    if (!bill) return null;

    // Get service name using the helper function
    const serviceSubTypeNameAr = getServiceNameAr(
      bill?.serviceType,
      bill?.serviceSubType
    );

    const colors = getServiceColor(bill?.serviceType);
    const displayAmount = bill?.amount || 0;

    // Format payment date description
    const paymentDate = bill?.paymentDate || bill?.updatedAt;
    const daysText = paymentDate
      ? `تم الدفع في ${new Date(paymentDate).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })}`
      : "تم الدفع";

    return {
      id: bill?.id,
      title: bill?.serviceName?.ar || serviceSubTypeNameAr || "غير محدد",
      description: daysText,
      amount: displayAmount,
      icon: getServiceIcon(bill?.serviceType),
      iconColor: colors.icon,
      iconBgColor: colors.bg,
      isUrgent: false,
      dueDate: bill?.paymentDate || bill?.updatedAt,
      status: "مدفوع",
      statusColor: "bg-green-500",
      referenceNumber: bill?.referenceNumber,
      serviceType: bill?.serviceName?.ar || serviceSubTypeNameAr || "غير محدد",
      // Ministry icon configuration
      ministryIconName: getMinistryIconName(bill?.serviceType),
      ministryIconSize: 50,
      // Keep original bill data
      originalBill: bill,
    };
  };

  // Fetch paid bills from Firebase
  const fetchPaidBills = async () => {
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

      // Filter to only paid business wallet bills
      const paidBusinessBills = bills.filter(
        (bill) =>
          bill.walletId === businessWallet.id &&
          bill.isBusiness === true &&
          bill.status === "paid"
      );

      // Sort by payment date (newest first)
      paidBusinessBills.sort((a, b) => {
        const dateA = a.paymentDate || a.updatedAt || 0;
        const dateB = b.paymentDate || b.updatedAt || 0;
        return dateB - dateA;
      });

      setPaidBills(paidBusinessBills);
    } catch (err) {
      console.error("Error fetching paid bills:", err);
      setError("حدث خطأ أثناء تحميل الفواتير المدفوعة");
    } finally {
      setLoading(false);
    }
  };

  // Fetch bills on component mount
  useEffect(() => {
    fetchPaidBills();
  }, [user?.uid, businessWallet?.id]);

  // Calculate total paid amount
  const totalPaidAmount = paidBills.reduce((total, bill) => {
    const amount = bill?.amount || 0;
    return total + amount;
  }, 0);

  return (
    <>
      <CustomHeader
        title="الفواتير المدفوعة"
        onBack={() => navigation.goBack()}
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
              onPress={fetchPaidBills}
            >
              <Text className="text-white font-semibold">إعادة المحاولة</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Main Content */}
        {!loading && !error && (
          <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
            {/* Summary Card */}
            <View className="bg-white p-4 mb-4 shadow-sm">
              <View
                className="rounded-2xl p-6"
                style={{ backgroundColor: primaryColor }}
              >
                <Text className="text-white text-sm mb-2 text-center opacity-90">
                  إجمالي المبالغ المدفوعة
                </Text>

                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "center",
                    direction: "ltr",
                    padding: 10,
                  }}
                >
                  <SvgIcons name="SAR" size={28} />
                  <Text className="text-white text-4xl font-bold text-center">
                    {totalPaidAmount.toLocaleString()}
                  </Text>
                </View>

                <View
                  className=" flex-row  items-center  justify-center"
                  style={{ direction: "rtl" }}
                >
                  <Text className="text-white text-base opacity-90">
                    عدد الفواتير:
                  </Text>
                  <Text className="text-white text-lg font-bold p-3 ">
                    {paidBills.length}
                  </Text>
                </View>
              </View>
            </View>

            {/* Paid Bills List */}
            <View className="px-4 pb-6">
              <Text
                className="text-gray-700 font-bold text-lg mb-4 text-left"
                style={{ direction: "rtl" }}
              >
                جميع الفواتير المدفوعة
              </Text>

              {paidBills.map((bill) => {
                const payment = transformBillToPayment(bill);
                if (!payment) return null;

                return (
                  <UpcomingPaymentCard
                    key={payment.id}
                    payment={payment}
                    onPress={() => {
                      navigation.navigate("UpcomingPayDetails", {
                        payment: {
                          ...payment,
                          billData: bill,
                        },
                        primaryColor,
                      });
                    }}
                  />
                );
              })}

              {/* Empty State */}
              {paidBills.length === 0 && (
                <View className="items-center justify-center py-12">
                  <Feather name="inbox" size={64} color="#D1D5DB" />
                  <Text className="text-gray-500 text-base mt-4">
                    لا توجد فواتير مدفوعة
                  </Text>
                  <Text className="text-gray-400 text-sm mt-2 text-center px-8">
                    ستظهر هنا جميع الفواتير التي قمت بدفعها
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

export default PaidBillsScreen;
