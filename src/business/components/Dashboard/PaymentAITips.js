import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Feather } from "@expo/vector-icons";

/**
 * Payment AI Tips Component
 * Displays AI-powered tips and suggestions
 *
 * @param {string} primaryColor - Primary brand color (default: "#0055aa")
 */
const PaymentAITips = ({ primaryColor = "#0055aa" }) => {
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
        description="لقد تم رفع نسبة مدفوعات الإقامات 30% هذا الربع. نقترح عليك تخصيص 18 آلاف ريال في الربع القادم والأشهر القادمة."
        bgColor="#FFF3E0"
        iconBgColor="#FFFFFF"
        iconColor="#F57C00"
      />

      <TipCard
        icon="alert-circle"
        title="تنبيه عام للمنشآت والقطاع الخاص"
        description="يتم غرامة 5000 ريال إذا تأخرت الدفع أكثر من 30 يوماً."
        bgColor="#FFF8E1"
        iconBgColor="#FFFFFF"
        iconColor="#F9A825"
      />
    </View>
  );
};

export default PaymentAITips;
