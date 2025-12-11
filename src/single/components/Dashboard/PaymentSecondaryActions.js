import React from "react";
import { View, TouchableOpacity, Text } from "react-native";
import { Feather } from "@expo/vector-icons";
import { COLORS } from "../../../common/constants/colors";

/**
 * Single (Customer) Payment Secondary Actions Component
 */
const PaymentSecondaryActions = ({
  onDownloadPDF,
  onShare,
  onSetReminder,
  primaryColor = COLORS.singlePrimary,
}) => {
  const ActionButton = ({ icon, label, onPress, bgColor, iconColor }) => (
    <TouchableOpacity
      className="flex-1 items-center"
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View
        className="w-14 h-14 rounded-2xl items-center justify-center mb-2"
        style={{ backgroundColor: bgColor }}
      >
        <Feather name={icon} size={22} color={iconColor} />
      </View>
      <Text className="text-gray-700 text-xs font-medium text-center">
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View
      className="bg-white rounded-3xl p-5 mx-4 mb-4 shadow-sm"
      style={{ direction: "ltr" }}
    >
      <Text className="text-gray-800 text-base font-bold mb-4 text-right">
        إجراءات سريعة
      </Text>

      <View className="flex-row items-center justify-around">
        <ActionButton
          icon="download"
          label="تحميل PDF"
          onPress={onDownloadPDF}
          bgColor="#E3F2FD"
          iconColor="#1976D2"
        />
        <ActionButton
          icon="share-2"
          label="مشاركة"
          onPress={onShare}
          bgColor="#E8F5E9"
          iconColor="#388E3C"
        />
        <ActionButton
          icon="clock"
          label="تذكير"
          onPress={onSetReminder}
          bgColor="#FFF3E0"
          iconColor="#F57C00"
        />
      </View>
    </View>
  );
};

export default PaymentSecondaryActions;
