import React from "react";
import { View, Text, TouchableOpacity } from "react-native";

// This file contains additional sections for BusinessHomeScreen
// Export the reusable UpcomingPaymentsSection from common components
export { default as UpcomingPaymentsSection } from "../../common/components/UpcomingPaymentsSection";

const SpendingAnalyticsSection = () => {
  return (
    <View className="px-4 mb-6">
      <Text className="text-gray-800 text-lg font-bold mb-4">
        أكبر 3 فئات صرف
      </Text>

      {/* Spending Category 1 */}
      <View className="mb-4">
        <View className="flex-row justify-between items-center mb-2">
          <Text className="text-gray-800 font-bold text-base">
            تجديد الإقامات
          </Text>
          <View className="items-end">
            <Text className="text-gray-800 font-bold text-base">
              12,400 ريال
            </Text>
            <Text className="text-gray-500 text-xs">43.6%</Text>
          </View>
        </View>
        <View className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <View
            className="h-full bg-blue-500 rounded-full"
            style={{ width: "43.6%" }}
          />
        </View>
      </View>

      {/* Spending Category 2 */}
      <View className="mb-4">
        <View className="flex-row justify-between items-center mb-2">
          <Text className="text-gray-800 font-bold text-base">رسوم الشؤون</Text>
          <View className="items-end">
            <Text className="text-gray-800 font-bold text-base">
              8,200 ريال
            </Text>
            <Text className="text-gray-500 text-xs">28.8%</Text>
          </View>
        </View>
        <View className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <View
            className="h-full bg-green-500 rounded-full"
            style={{ width: "28.8%" }}
          />
        </View>
      </View>

      {/* Spending Category 3 */}
      <View className="mb-4">
        <View className="flex-row justify-between items-center mb-2">
          <Text className="text-gray-800 font-bold text-base">المبادرات</Text>
          <View className="items-end">
            <Text className="text-gray-800 font-bold text-base">
              4,850 ريال
            </Text>
            <Text className="text-gray-500 text-xs">17.0%</Text>
          </View>
        </View>
        <View className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <View
            className="h-full bg-orange-500 rounded-full"
            style={{ width: "17%" }}
          />
        </View>
      </View>
    </View>
  );
};

const AITipsSection = () => {
  return (
    <View className="px-4 mb-6">
      {/* Tip 1 */}
      <View className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-2xl p-4 mb-3 flex-row items-start">
        <View className="w-10 h-10 bg-purple-100 rounded-full items-center justify-center">
          <Text className="text-lg">✨</Text>
        </View>
        <View className="flex-1 mr-3">
          <View className="flex-row items-center mb-2">
            <Text className="text-purple-600 text-xs font-bold bg-purple-100 px-2 py-1 rounded-full">
              AI
            </Text>
            <Text className="text-gray-800 font-bold text-sm mr-2">
              رؤى ذكية
            </Text>
          </View>
          <Text className="text-gray-600 text-xs leading-5">
            تَوَقُّع المشاركة للعامل 13 بعد 14 أيام. تحتاج تجديد الإقامة بقيمة
            6,500 ريال.
          </Text>
        </View>
      </View>

      {/* Tip 2 */}
      <View className="bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-2xl p-4 mb-3 flex-row items-start">
        <View className="w-10 h-10 bg-blue-100 rounded-full items-center justify-center">
          <Text className="text-lg">💡</Text>
        </View>
        <View className="flex-1 mr-3">
          <Text className="text-gray-800 font-bold text-sm mb-2">
            ارتفعت نسبة مدفوعات المنشآت بنسبة 32% هذا الشهر
          </Text>
          <Text className="text-gray-600 text-xs">
            الخبر الجيد - لتصبح لمراجعة مؤسستك للتأكد من النمو.
          </Text>
        </View>
      </View>
    </View>
  );
};

const QuickStatsSection = () => {
  return (
    <View className="px-4 mb-20">
      <View className="flex-row gap-3">
        <View className="flex-1 bg-white rounded-2xl p-4 shadow-sm">
          <Text className="text-gray-500 text-xs mb-2">عدد المعاملات</Text>
          <Text className="text-gray-800 font-bold text-2xl mb-1">23</Text>
          <TouchableOpacity>
            <Text className="text-[#0055aa] text-xs">هذا الشهر</Text>
          </TouchableOpacity>
        </View>

        <View className="flex-1 bg-white rounded-2xl p-4 shadow-sm">
          <Text className="text-gray-500 text-xs mb-2">المبلغ المتوسط</Text>
          <Text className="text-gray-800 font-bold text-2xl mb-1">26,300</Text>
          <Text className="text-gray-500 text-xs">ريال</Text>
        </View>
      </View>
    </View>
  );
};

export {
  SpendingAnalyticsSection,
  AITipsSection,
  QuickStatsSection,
};
