import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { CustomHeader } from "../../../common/components";
import SvgIcons from "../../../common/components/SvgIcons";
import GOVERNMENT_SERVICES_DATA from "../../../common/services/firebase/governmentServicesData";
import { getMinistryIconName } from "../../../common/utils/ministryIconMapper";

const PaidBillDetailsScreen = ({ navigation, route }) => {
  const { payment, primaryColor = "#0055aa" } = route.params || {};
  const bill = payment?.originalBill;

  if (!bill) {
    return (
      <>
        <CustomHeader title="تفاصيل الفاتورة" onBack={() => navigation.goBack()} />
        <View className="flex-1 bg-gray-50 items-center justify-center">
          <Text className="text-gray-500 text-lg">لا توجد تفاصيل متاحة</Text>
        </View>
      </>
    );
  }

  // Helper function to get service name in Arabic
  const getServiceNameAr = (serviceType, serviceSubType) => {
    const service = GOVERNMENT_SERVICES_DATA[serviceType];
    if (service?.subTypes?.[serviceSubType]?.nameAr) {
      return service.subTypes[serviceSubType].nameAr;
    }
    if (service?.nameAr) {
      return service.nameAr;
    }
    return serviceType;
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
    if (!timestamp) return "غير محدد";
    const date = new Date(timestamp);
    return date.toLocaleDateString("ar-SA", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const serviceName =
    bill?.serviceName?.ar ||
    getServiceNameAr(bill?.serviceType, bill?.serviceSubType) ||
    "غير محدد";
  const colors = getServiceColor(bill?.serviceType);
  const displayAmount = bill?.amount || 0;

  return (
    <>
      <CustomHeader
        title="تفاصيل الفاتورة المدفوعة"
        onBack={() => navigation.goBack()}
      />
      <ScrollView
        className="flex-1 bg-gray-50"
        style={{ direction: "ltr" }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Card */}
        <View className="bg-white p-6 mb-4 shadow-sm">
          <View className="items-center">
            {/* Ministry Icon */}
            <View
              className={`w-24 h-24 ${colors.bg} rounded-2xl items-center justify-center mb-4`}
            >
              <SvgIcons
                name={getMinistryIconName(bill?.serviceType)}
                size={80}
              />
            </View>

            {/* Service Name */}
            <Text className="text-gray-900 text-xl font-bold text-center mb-2">
              {serviceName}
            </Text>

            {/* Status Badge */}
            <View
              className="px-4 py-2 rounded-full mb-4"
              style={{ backgroundColor: "#10B98115" }}
            >
              <Text
                className="text-base font-semibold"
                style={{ color: "#10B981" }}
              >
                ✓ مدفوعة
              </Text>
            </View>

            {/* Amount */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                direction: "ltr",
                marginBottom: 8,
              }}
            >
              <SvgIcons name="SAR" size={32} />
              <Text className="text-gray-900 text-4xl font-bold ml-2">
                {displayAmount.toLocaleString()}
              </Text>
            </View>
            <Text className="text-gray-500 text-sm">المبلغ المدفوع</Text>
          </View>
        </View>

        {/* Payment Information */}
        <View className="bg-white p-6 mb-4 shadow-sm" style={{ direction: "rtl" }}>
          <Text className="text-gray-900 text-lg font-bold mb-4">
            معلومات الدفع
          </Text>

          {/* Payment Date */}
          <View className="flex-row items-center justify-between py-3 border-b border-gray-100">
            <View className="flex-row items-center">
              <Feather name="calendar" size={20} color="#6B7280" />
              <Text className="text-gray-600 text-base mr-3">تاريخ الدفع</Text>
            </View>
            <Text className="text-gray-900 text-base font-semibold">
              {formatDate(bill?.paymentDate)}
            </Text>
          </View>

          {/* Due Date */}
          <View className="flex-row items-center justify-between py-3 border-b border-gray-100">
            <View className="flex-row items-center">
              <Feather name="clock" size={20} color="#6B7280" />
              <Text className="text-gray-600 text-base mr-3">
                تاريخ الاستحقاق الأصلي
              </Text>
            </View>
            <Text className="text-gray-900 text-base font-semibold">
              {formatDate(bill?.dueDate)}
            </Text>
          </View>

          {/* Issue Date */}
          <View className="flex-row items-center justify-between py-3 border-b border-gray-100">
            <View className="flex-row items-center">
              <Feather name="file-text" size={20} color="#6B7280" />
              <Text className="text-gray-600 text-base mr-3">تاريخ الإصدار</Text>
            </View>
            <Text className="text-gray-900 text-base font-semibold">
              {formatDate(bill?.issueDate)}
            </Text>
          </View>

          {/* Reference Number */}
          {bill?.referenceNumber && (
            <View className="flex-row items-center justify-between py-3 border-b border-gray-100">
              <View className="flex-row items-center">
                <Feather name="hash" size={20} color="#6B7280" />
                <Text className="text-gray-600 text-base mr-3">رقم المرجع</Text>
              </View>
              <Text className="text-gray-900 text-base font-semibold font-mono">
                {bill.referenceNumber}
              </Text>
            </View>
          )}

          {/* Transaction ID */}
          {bill?.paidWith && (
            <View className="flex-row items-center justify-between py-3">
              <View className="flex-row items-center">
                <Feather name="credit-card" size={20} color="#6B7280" />
                <Text className="text-gray-600 text-base mr-3">
                  رقم المعاملة
                </Text>
              </View>
              <Text className="text-gray-900 text-xs font-semibold font-mono">
                {bill.paidWith.substring(0, 20)}...
              </Text>
            </View>
          )}
        </View>

        {/* Service Details */}
        <View className="bg-white p-6 mb-4 shadow-sm" style={{ direction: "rtl" }}>
          <Text className="text-gray-900 text-lg font-bold mb-4">
            تفاصيل الخدمة
          </Text>

          {/* Service Type */}
          <View className="flex-row items-center justify-between py-3 border-b border-gray-100">
            <Text className="text-gray-600 text-base">نوع الخدمة</Text>
            <Text className="text-gray-900 text-base font-semibold">
              {serviceName}
            </Text>
          </View>

          {/* Ministry */}
          {bill?.ministryName && (
            <View className="flex-row items-center justify-between py-3 border-b border-gray-100">
              <Text className="text-gray-600 text-base">الجهة</Text>
              <Text className="text-gray-900 text-base font-semibold">
                {typeof bill.ministryName === 'object'
                  ? bill.ministryName?.ar || bill.ministryName?.en || ''
                  : bill.ministryName}
              </Text>
            </View>
          )}

          {/* Category */}
          {bill?.category && (
            <View className="flex-row items-center justify-between py-3">
              <Text className="text-gray-600 text-base">الفئة</Text>
              <Text className="text-gray-900 text-base font-semibold">
                {typeof bill.category === 'object'
                  ? bill.category?.ar || bill.category?.en || ''
                  : bill.category}
              </Text>
            </View>
          )}
        </View>

        {/* Additional Information */}
        {bill?.additionalInfo && Object.keys(bill.additionalInfo).length > 0 && (
          <View className="bg-white p-6 mb-4 shadow-sm" style={{ direction: "rtl" }}>
            <Text className="text-gray-900 text-lg font-bold mb-4">
              معلومات إضافية
            </Text>

            {Object.entries(bill.additionalInfo).map(([key, value], index) => {
              // Skip if value is null, undefined, or object
              if (value == null || typeof value === 'object') return null;

              // Format key names
              const keyNames = {
                passportNumber: "رقم الجواز",
                plateNumber: "رقم اللوحة",
                violationType: "نوع المخالفة",
                location: "الموقع",
                iqamaNumber: "رقم الإقامة",
                employeeName: "اسم الموظف",
                nationality: "الجنسية",
                occupation: "المهنة",
                nationalId: "رقم الهوية",
                holderName: "اسم صاحب الجواز",
                expiryDate: "تاريخ الانتهاء",
                speed: "السرعة",
                speedLimit: "الحد الأقصى للسرعة",
                violationDate: "تاريخ المخالفة",
                visaType: "نوع التأشيرة",
                validUntil: "صالح حتى",
              };

              const displayKey = keyNames[key] || key;

              // Format value if it's a timestamp
              let displayValue = value;
              if (typeof value === 'number' && value > 1000000000000) {
                displayValue = new Date(value).toLocaleDateString("ar-SA", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                });
              }

              return (
                <View
                  key={key}
                  className={`flex-row items-center justify-between py-3 ${
                    index < Object.keys(bill.additionalInfo).length - 1
                      ? "border-b border-gray-100"
                      : ""
                  }`}
                >
                  <Text className="text-gray-600 text-base">{displayKey}</Text>
                  <Text className="text-gray-900 text-base font-semibold">
                    {String(displayValue)}
                  </Text>
                </View>
              );
            })}
          </View>
        )}

        {/* Success Message */}
        <View className="mx-6 mb-6 p-4 rounded-xl" style={{ backgroundColor: "#10B98110" }}>
          <View className="flex-row items-center" style={{ direction: "rtl" }}>
            <View
              className="w-10 h-10 rounded-full items-center justify-center"
              style={{ backgroundColor: "#10B981" }}
            >
              <Feather name="check" size={20} color="white" />
            </View>
            <View className="flex-1 mr-3">
              <Text className="text-gray-900 font-semibold text-base mb-1">
                تم الدفع بنجاح
              </Text>
              <Text className="text-gray-600 text-sm">
                تم دفع هذه الفاتورة وإتمام المعاملة بنجاح
              </Text>
            </View>
          </View>
        </View>

        {/* Back Button */}
        <View className="px-6 pb-8">
          <TouchableOpacity
            className="rounded-xl py-4"
            style={{ backgroundColor: primaryColor }}
            onPress={() => navigation.goBack()}
          >
            <Text className="text-white text-center font-bold text-lg">
              رجوع
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </>
  );
};

export default PaidBillDetailsScreen;
