import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Feather } from "@expo/vector-icons";
import { COLORS } from "../../../common/constants/colors";

/**
 * Single (Customer) Payment AI Tips Component
 */
const PaymentAITips = ({ primaryColor = COLORS.singlePrimary }) => {
  const TipCard = ({
    icon,
    title,
    description,
    bgColor,
    iconBgColor,
    iconColor,
    actionText,
  }) => (
    <View
      className="rounded-2xl p-4 mb-3"
      style={{ backgroundColor: bgColor, direction: "rtl" }}
    >
      <View className="flex-row items-start">
        <View className="flex-1 ml-3">
          <View className="flex-row items-center mb-2">
            <View
              className="w-8 h-8 rounded-full items-center justify-center ml-2 "
              style={{ backgroundColor: iconBgColor, direction: "ltr" }}
            >
              <Feather name={icon} size={16} color={iconColor} />
            </View>
            <Text className="text-sm font-bold text-gray-800">{title}</Text>
          </View>
          <Text className="text-xs text-gray-600 leading-5 mb-2 text-left">
            {description}
          </Text>
          {actionText && (
            <TouchableOpacity>
              <Text
                className="text-xs font-bold text-left"
                style={{ color: iconColor }}
              >
                {actionText}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );

  return (
    <View className="mx-4 mb-4">
      <TipCard
        icon="refresh-cw"
        title="فعّل الدفع التلقائي"
        description="وفر وقتك واختصر معاملاتك من خلال تفعيل وضع الدفع التلقائي لهذه الخدمة لتجنب الغرامات أو التأخر في التجديد."
        bgColor="#E8F5E9"
        iconBgColor="#FFFFFF"
        iconColor="#388E3C"
        actionText="تفعيل الدفع التلقائي"
      />

      <TipCard
        icon="trending-up"
        title="نصيحة تحسين الميزانية"
        description="يمكنك جدولة دفعاتك المستقبلية لتجنب التأخير والغرامات."
        bgColor="#FFF3E0"
        iconBgColor="#FFFFFF"
        iconColor="#F57C00"
      />
    </View>
  );
};

export default PaymentAITips;
