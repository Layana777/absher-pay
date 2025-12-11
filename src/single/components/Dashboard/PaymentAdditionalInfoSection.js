import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Feather } from "@expo/vector-icons";
import { formatDate } from "../../../common/utils";
import { COLORS } from "../../../common/constants/colors";

/**
 * Single (Customer) Payment Additional Information Section Component
 */
const PaymentAdditionalInfoSection = ({
  billData,
  serviceType,
  primaryColor = COLORS.singlePrimary,
}) => {
  if (!billData?.additionalInfo) {
    return null;
  }

  const additionalInfo = billData.additionalInfo;
  const hasAdditionalInfo = Object.keys(additionalInfo).length > 0;

  if (!hasAdditionalInfo) {
    return null;
  }

  const InfoCard = ({ icon, label, value }) => (
    <View className="bg-gray-50 rounded-2xl p-4 mb-3">
      <View className="flex-row items-center justify-between">
        <View className="flex-1 m-2">
          <Text className="text-gray-500 text-xs mb-2 text-right">{label}</Text>
          <Text className="text-gray-800 font-bold text-base text-right" numberOfLines={2}>
            {value}
          </Text>
        </View>
        <View
          className="w-10 h-10 rounded-full items-center justify-center"
          style={{ backgroundColor: `${primaryColor}15` }}
        >
          <Feather name={icon} size={18} color={primaryColor} />
        </View>
      </View>
    </View>
  );

  return (
    <View
      className="bg-white rounded-3xl p-6 mx-4 mb-4 shadow-sm"
      style={{ direction: "ltr" }}
    >
      <View
        className="flex-row items-center justify-between mb-5"
        style={{ direction: "rtl" }}
      >
        <Text className="text-gray-800 text-base font-bold text-right">
          معلومات إضافية
        </Text>
        <View
          className="w-10 h-10 rounded-full items-center justify-center"
          style={{ backgroundColor: `${primaryColor}15` }}
        >
          <Feather name="file-plus" size={20} color={primaryColor} />
        </View>
      </View>

      <View className="space-y-3">
        {/* Passports */}
        {serviceType === "passports" && (
          <>
            {additionalInfo.passportNumber && (
              <InfoCard icon="book" label="رقم الجواز" value={additionalInfo.passportNumber} />
            )}
            {additionalInfo.holderName && (
              <InfoCard icon="user" label="اسم حامل الجواز" value={additionalInfo.holderName} />
            )}
            {additionalInfo.expiryDate && (
              <InfoCard icon="calendar" label="تاريخ انتهاء الصلاحية" value={formatDate(additionalInfo.expiryDate)} />
            )}
          </>
        )}

        {/* Traffic */}
        {serviceType === "traffic" && (
          <>
            {additionalInfo.plateNumber && (
              <InfoCard icon="truck" label="رقم اللوحة" value={additionalInfo.plateNumber} />
            )}
            {additionalInfo.violationType && (
              <InfoCard icon="alert-triangle" label="نوع المخالفة" value="تجاوز السرعة" />
            )}
            {additionalInfo.location && (
              <InfoCard icon="map-pin" label="الموقع" value={additionalInfo.location} />
            )}
            {additionalInfo.violationDate && (
              <InfoCard icon="calendar" label="تاريخ المخالفة" value={formatDate(additionalInfo.violationDate)} />
            )}
          </>
        )}

        {/* Civil Affairs */}
        {serviceType === "civil_affairs" && (
          <>
            {additionalInfo.iqamaNumber && (
              <InfoCard icon="credit-card" label="رقم الإقامة" value={additionalInfo.iqamaNumber} />
            )}
            {additionalInfo.nationalId && (
              <InfoCard icon="credit-card" label="رقم الهوية الوطنية" value={additionalInfo.nationalId} />
            )}
            {additionalInfo.expiryDate && (
              <InfoCard icon="calendar" label="تاريخ انتهاء الصلاحية" value={formatDate(additionalInfo.expiryDate)} />
            )}
          </>
        )}

        {/* Commerce */}
        {serviceType === "commerce" && (
          <>
            {additionalInfo.registrationNumber && (
              <InfoCard icon="hash" label="رقم السجل التجاري" value={additionalInfo.registrationNumber} />
            )}
            {additionalInfo.companyName && (
              <InfoCard icon="briefcase" label="اسم الشركة" value={additionalInfo.companyName} />
            )}
          </>
        )}
      </View>
    </View>
  );
};

export default PaymentAdditionalInfoSection;
