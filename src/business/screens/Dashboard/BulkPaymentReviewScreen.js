import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Modal,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { CustomHeader } from "../../../common/components";
import UpcomingPaymentCard from "../../../common/components/UpcomingPaymentCard";
import SvgIcons from "../../../common/components/SvgIcons";
import Button from "../../../common/components/ui/Button";
import {
  processBulkBillPayment,
  isBillOverdue,
  getDaysUntilDue,
} from "../../../common/services/billsService";
import GOVERNMENT_SERVICES_DATA from "../../../common/services/firebase/governmentServicesData";
import { getMinistryIconName } from "../../../common/utils/ministryIconMapper";

const BulkPaymentReviewScreen = ({ navigation, route }) => {
  const {
    billsToPay = [],
    totalAmount = 0,
    userId,
    walletId,
    primaryColor = "#0055aa",
    iconBgColor = "bg-blue-50",
    ministryIconName = "MOI",
    onPaymentComplete,
  } = route.params || {};

  const [loading, setLoading] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

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

  // Helper function to format date
  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString("ar-SA", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Helper function to get Arabic status
  const getArabicStatus = (bill) => {
    if (isBillOverdue(bill)) return "متأخر";
    if (bill.status === "upcoming") return "متوقع";
    if (bill.status === "unpaid") return "مستحق";
    return "الكل";
  };

  // Transform Firebase bill to UpcomingPaymentCard format
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
      dueDate: formatDate(bill.dueDate),
      status: arabicStatus,
      category: arabicStatus,
      serviceType: bill.serviceName?.ar || serviceSubTypeNameAr || "غير محدد",
      aiSuggestion: bill.penaltyInfo
        ? `متأخر ${bill.penaltyInfo.daysOverdue} يوم - غرامة ${bill.penaltyInfo.lateFee} ريال`
        : "لا يوجد",
      // Ministry icon configuration
      ministryIconName: getMinistryIconName(bill.serviceType),
      ministryIconSize: 50,
      // Keep original bill data for payment processing
      originalBill: bill,
    };
  };

  // Show confirmation modal
  const handlePayNow = () => {
    setShowConfirmModal(true);
  };

  // Confirm and navigate to OTP screen
  const handleConfirmPayment = () => {
    setShowConfirmModal(false);

    if (!userId || !walletId) {
      Alert.alert("خطأ", "لا يوجد مستخدم أو محفظة نشطة");
      return;
    }

    // Navigate to OTP screen for bulk payment
    navigation.navigate("BillPaymentOtp", {
      billsToPay, // Pass all bills for bulk payment
      totalAmount,
      walletId,
      userId,
      primaryColor,
      isBulkPayment: true, // Flag to indicate bulk payment
      onPaymentComplete, // Pass refresh function
    });
  };

  return (
    <>
      <CustomHeader title="مراجعة الدفع" onBack={() => navigation.goBack()} />
      <View className="flex-1 bg-gray-50" style={{ direction: "ltr" }}>
        {/* Summary Card at Top */}
        {/* <View className="bg-white p-4 mb-4 shadow-sm">
          <View
            className="rounded-2xl p-6"
            style={{ backgroundColor: primaryColor }}
          >
            <Text className="text-white text-sm mb-2 text-center opacity-90">
              إجمالي المبلغ المستحق
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
                {totalAmount.toLocaleString()}
              </Text>
            </View>

            <View
              className="mt-4 flex-row justify-between items-center"
              style={{ direction: "rtl" }}
            >
              <Text className="text-white text-base opacity-90">
                عدد الفواتير:
              </Text>
              <Text className="text-white text-lg font-bold">
                {billsToPay.length}
              </Text>
            </View>
          </View>
        </View> */}

        {/* Bills List */}
        <ScrollView
          className="flex-1 px-4"
          showsVerticalScrollIndicator={false}
        >
          <Text
            className="text-gray-700 font-bold text-lg mb-8 m-4"
            style={{ textAlign: "right" }}
          >
            الفواتير المستحقة
          </Text>

          {billsToPay.map((bill) => {
            const payment = transformBillToPayment(bill);
            const serviceName =
              bill.serviceName?.ar ||
              getServiceNameAr(bill.serviceType, bill.serviceSubType) ||
              "غير محدد";
            const arabicStatus = getArabicStatus(bill);
            const displayAmount =
              bill.penaltyInfo?.totalWithPenalty || bill.amount;

            // Status badge colors
            const statusColor =
              arabicStatus === "متأخر"
                ? "#EF4444"
                : arabicStatus === "مستحق"
                ? "#F59E0B"
                : "#6B7280";

            return (
              <View key={payment.id} className="mb-3">
                {/* UpcomingPaymentCard */}
                {/* <UpcomingPaymentCard payment={payment} onPress={() => {}} /> */}

                {/* Additional Details Below Card */}
                <View
                  className="bg-white rounded-xl px-4 pb-6 shadow-lg mt-1"
                  style={{ direction: "rtl" }}
                >
                  {/* Service Name with Ministry Icon */}
                  <View className="flex-row items-center mb-2 pt-3 border-t border-gray-100">
                    <View
                      className={`w-12 h-12 ${iconBgColor} rounded-xl items-center justify-center`}
                    >
                      <SvgIcons name={ministryIconName} size={40} />
                    </View>
                    <View className="flex-row items-center flex-1">
                      <Text className="text-gray-800 font-semibold text-sm text-left flex-1 p-3">
                        {serviceName}
                      </Text>
                    </View>
                  </View>

                  {/* Status Badge */}
                  <View className="flex-row items-center mb-2">
                    <Text className="text-gray-600 text-sm ml-2">الحالة:</Text>
                    <View
                      className="px-3 py-1 rounded-full"
                      style={{ backgroundColor: `${statusColor}15` }}
                    >
                      <Text
                        className="text-xs font-semibold"
                        style={{ color: statusColor }}
                      >
                        {arabicStatus}
                      </Text>
                    </View>
                  </View>

                  {/* Due Date */}
                  <View className="flex-row items-center mb-2">
                    <Text className="text-gray-600 text-sm ml-2">
                      تاريخ الاستحقاق:
                    </Text>
                    <Text className="text-gray-800 text-sm">
                      {formatDate(bill.dueDate)}
                    </Text>
                  </View>

                  {/* Amount with Penalty Info */}
                  <View className="flex-row items-center justify-between pt-2 border-t border-gray-100">
                    <Text className="text-gray-600 text-sm">
                      المبلغ الإجمالي:
                    </Text>
                    <View>
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          direction: "ltr",
                        }}
                      >
                        <Text className="text-gray-600 text-sm">
                          <SvgIcons name="SARBlack" size={15} />
                        </Text>
                        <Text className="text-gray-800 font-bold text-base ml-1">
                          {displayAmount.toLocaleString()}
                        </Text>
                      </View>
                      {bill.penaltyInfo && (
                        <Text className="text-red-600 text-xs text-left mt-1">
                          يشمل غرامة {bill.penaltyInfo.lateFee} ريال
                        </Text>
                      )}
                    </View>
                  </View>
                </View>
              </View>
            );
          })}

          {/* Empty space for bottom button */}
          <View className="h-24" />
        </ScrollView>

        {/* Bottom Payment Button */}
        <View
          className="bg-white p-4 shadow-lg"
          style={{
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
          }}
        >
          <TouchableOpacity
            className="rounded-xl py-4"
            style={{ backgroundColor: loading ? "#9CA3AF" : primaryColor }}
            onPress={handlePayNow}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white text-center font-bold text-lg">
                ادفع الآن
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            className="mt-3"
            onPress={() => navigation.goBack()}
            disabled={loading}
          >
            <Text className="text-gray-600 text-center font-semibold">
              إلغاء
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Confirmation Modal */}
      <Modal
        visible={showConfirmModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowConfirmModal(false)}
      >
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => setShowConfirmModal(false)}
          className="flex-1 justify-end bg-black/50"
          style={{ direction: "rtl" }}
        >
          <TouchableOpacity activeOpacity={1}>
            <View className="bg-white rounded-t-3xl">
              {/* Handle Bar */}
              <View className="items-center py-3">
                <View className="w-12 h-1 bg-gray-300 rounded-full" />
              </View>

              {/* Content */}
              <View className="px-6 pb-8">
                {/* Header */}
                <View className="items-center mb-6">
                  <View
                    style={{ backgroundColor: `${primaryColor}15` }}
                    className="w-16 h-16 rounded-full items-center justify-center mb-3"
                  >
                    <Feather
                      name="alert-circle"
                      size={32}
                      color={primaryColor}
                    />
                  </View>
                  <Text className="text-gray-900 text-xl font-bold mb-2">
                    تأكيد الدفع
                  </Text>
                  <Text className="text-gray-500 text-sm text-center">
                    هل أنت متأكد من رغبتك في الانتقال لإتمام عملية الدفع؟
                  </Text>
                </View>

                {/* Payment Details */}
                <View className="bg-gray-50 rounded-2xl p-4 mb-6">
                  <View className="flex-row justify-between items-center mb-3">
                    <Text className="text-gray-600 text-sm">عدد الفواتير</Text>
                    <Text className="text-gray-800 text-sm font-bold">
                      {billsToPay.length} فاتورة
                    </Text>
                  </View>
                  <View className="h-px bg-gray-200 my-2" />
                  <View className="flex-row justify-between items-center">
                    <Text className="text-gray-900 text-base font-bold">
                      المبلغ الإجمالي
                    </Text>
                    <Text
                      className="text-xl font-bold"
                      style={{ color: primaryColor }}
                    >
                      {totalAmount.toLocaleString()}{" "}
                      <SvgIcons name="SARBlack" size={15} />
                    </Text>
                  </View>
                </View>

                {/* Action Buttons */}
                <View className="gap-3">
                  {/* Confirm Button */}
                  <Button
                    title={loading ? "جاري الدفع..." : "تأكيد الدفع"}
                    onPress={handleConfirmPayment}
                    variant="business-primary"
                    size="medium"
                    className="rounded-2xl"
                    disabled={loading}
                  />

                  {/* Cancel Button */}
                  <Button
                    title="إلغاء"
                    onPress={() => setShowConfirmModal(false)}
                    variant="danger-outline"
                    size="medium"
                    className="rounded-2xl"
                    disabled={loading}
                  />
                </View>

                {/* Security Note */}
                <View className="flex-row items-center justify-center mt-4">
                  <Text className="text-gray-400 text-xs mr-2 text-center">
                    سيتم خصم المبلغ من محفظتك بعد التأكيد
                  </Text>
                  <Feather name="shield" size={14} color="#9ca3af" />
                </View>
              </View>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </>
  );
};

export default BulkPaymentReviewScreen;
