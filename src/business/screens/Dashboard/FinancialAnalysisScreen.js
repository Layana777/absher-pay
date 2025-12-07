import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import CustomHeader from "../../../common/components/CustomHeader";
import MonthPeriodPicker from "../../components/MonthPeriodPicker";

const FinancialAnalysisScreen = ({ navigation }) => {
  const monthNames = [
    "يناير",
    "فبراير",
    "مارس",
    "أبريل",
    "مايو",
    "يونيو",
    "يوليو",
    "أغسطس",
    "سبتمبر",
    "أكتوبر",
    "نوفمبر",
    "ديسمبر",
  ];

  // Calculate default date range: previous month to current month
  const getDefaultDateRange = () => {
    const today = new Date();
    const currentMonth = today.getMonth(); // 0-indexed
    const currentYear = today.getFullYear();

    // Calculate previous month
    let previousMonth = currentMonth - 1;
    let previousYear = currentYear;

    // Handle January case (previous month would be December of previous year)
    if (previousMonth < 0) {
      previousMonth = 11; // December
      previousYear = currentYear - 1;
    }

    return {
      startMonth: previousMonth,
      startYear: previousYear,
      endMonth: currentMonth,
      endYear: currentYear,
      startMonthName: monthNames[previousMonth],
      endMonthName: monthNames[currentMonth],
    };
  };

  const [selectedTab, setSelectedTab] = useState("monthly"); // monthly or annual
  const [selectedPeriod, setSelectedPeriod] = useState("all");
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const [dateRange, setDateRange] = useState(getDefaultDateRange());

  // Sample data
  const monthlyTrends = [
    { month: "نوفمبر", amount: 3200 },
    { month: "اكتوبر", amount: 3400 },
    { month: "سبتمبر", amount: 3000 },
    { month: "اغسطس", amount: 2900 },
    { month: "يوليو", amount: 3100 },
    { month: "يونيو", amount: 3280 },
  ];

  const categories = [
    { name: "المعاملات الضريبية", amount: 800, percentage: 35.4, color: "#ef4444" },
    { name: "خدمات", amount: 650, percentage: 25.5, color: "#3b82f6" },
    { name: "المواردات", amount: 760, percentage: 24.5, color: "#10b981" },
    { name: "رسوم شهرية", amount: 500, percentage: 10.5, color: "#f97316" },
    { name: "أخرى", amount: 250, percentage: 5.1, color: "#6b7280" },
  ];

  const maxAmount = Math.max(...monthlyTrends.map((t) => t.amount));

  const handleDateRangeSelect = (range) => {
    setDateRange(range);
    setSelectedPeriod("custom");
  };

  const getDisplayDateRange = () => {
    if (dateRange.startYear === dateRange.endYear) {
      return `${dateRange.startMonthName} - ${dateRange.endMonthName} ${dateRange.startYear}`;
    }
    return `${dateRange.startMonthName} ${dateRange.startYear} - ${dateRange.endMonthName} ${dateRange.endYear}`;
  };

  return (
    <View className="flex-1 bg-gray-50" style={{ direction: "ltr" }}>
      <CustomHeader
        title="التحليلات المالية"
        onBack={() => navigation.goBack()}
        backgroundColor="#0055aa"
        textColor="#FFFFFF"
        statusBarStyle="light-content"
        statusBarBackgroundColor="#0055aa"
      />

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Tabs */}
        <View className="flex-row gap-3 px-6 mt-6">
          <TouchableOpacity
            onPress={() => setSelectedTab("annual")}
            className={`flex-1 py-3 rounded-xl ${
              selectedTab === "annual" ? "bg-gray-100" : "bg-white"
            }`}
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.05,
              shadowRadius: 2,
              elevation: 2,
            }}
          >
            <Text
              className={`text-center font-semibold ${
                selectedTab === "annual" ? "text-gray-900" : "text-gray-500"
              }`}
            >
              سنوي
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setSelectedTab("monthly")}
            className={`flex-1 py-3 rounded-xl ${
              selectedTab === "monthly" ? "bg-white" : "bg-gray-100"
            }`}
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: selectedTab === "monthly" ? 0.1 : 0.05,
              shadowRadius: 3,
              elevation: selectedTab === "monthly" ? 3 : 2,
            }}
          >
            <Text
              className={`text-center font-semibold ${
                selectedTab === "monthly" ? "text-gray-900" : "text-gray-500"
              }`}
            >
              شهري
            </Text>
          </TouchableOpacity>
        </View>

        {/* Date Selector */}
        <View className="flex-row items-center justify-between px-6 mt-6">
          <View className="flex-row gap-3">
            <TouchableOpacity className="w-10 h-10 bg-white rounded-lg items-center justify-center">
              <Feather name="filter" size={20} color="#6b7280" />
            </TouchableOpacity>
            <TouchableOpacity
              className="w-10 h-10 bg-white rounded-lg items-center justify-center"
              onPress={() => setShowMonthPicker(true)}
            >
              <Feather name="calendar" size={20} color="#6b7280" />
            </TouchableOpacity>
          </View>
          <Text className="text-gray-600 text-sm">{getDisplayDateRange()}</Text>
        </View>

        {/* Period Filter Buttons */}
        <View className="flex-row gap-2 px-6 mt-4">
          {["الكل", "نوفمبر", "اكتوبر", "يناير"].map((period) => (
            <TouchableOpacity
              key={period}
              onPress={() => setSelectedPeriod(period)}
              className={`px-6 py-2 rounded-lg ${
                selectedPeriod === period || (selectedPeriod === "all" && period === "الكل")
                  ? "bg-[#0055aa]"
                  : "bg-white"
              }`}
            >
              <Text
                className={`text-sm font-medium ${
                  selectedPeriod === period || (selectedPeriod === "all" && period === "الكل")
                    ? "text-white"
                    : "text-gray-600"
                }`}
              >
                {period}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Quick Action Buttons */}
        <View className="flex-row gap-2 px-6 mt-4">
          <TouchableOpacity className="px-4 py-2 bg-white rounded-lg border border-gray-200">
            <Text className="text-gray-700 text-sm">مدفوعات متكررة</Text>
          </TouchableOpacity>
          <TouchableOpacity className="px-4 py-2 bg-white rounded-lg border border-gray-200">
            <Text className="text-gray-700 text-sm">مدفوعات القيود</Text>
          </TouchableOpacity>
          <TouchableOpacity className="flex-row items-center gap-1 px-4 py-2 bg-white rounded-lg border border-gray-200">
            <Feather name="download" size={16} color="#374151" />
            <Text className="text-gray-700 text-sm">تصدير</Text>
          </TouchableOpacity>
        </View>

        {/* Metric Cards */}
        <View className="px-6 mt-6">
          {/* First Row */}
          <View className="flex-row justify-between mb-3" style={{direction:"rtl"}}>
            {/* Monthly Spending 1 */}
            <View className="bg-white rounded-2xl p-5 w-[48.5%]" style={{direction:"rtl"}}>
              <Text className="text-gray-400 text-sm text-right mb-6">
                الإنفاق الشهري
              </Text>
              <Text className="text-gray-900 text-4xl font-bold text-center mb-6">
                3,280
              </Text>
              <View className="flex-row items-center justify-start">
                <Feather
                  name="trending-down"
                  size={14}
                  color="#ef4444"
                  style={{ marginLeft: 4 }}
                />
                <Text className="text-red-500 text-xs font-semibold">
                  حر 12.5%
                </Text>
              </View>
            </View>

            {/* Monthly Spending 2 */}
            <View className="bg-white rounded-2xl p-5 w-[48.5%]" style={{direction:"rtl"}}>
              <Text className="text-gray-400 text-sm text-right mb-6">
                الإنفاق الشهري
              </Text>
              <Text className="text-gray-900 text-4xl font-bold text-center mb-6">
                3,103
              </Text>
              <Text className="text-gray-300 text-xs text-left">ريال</Text>
            </View>
          </View>

          {/* Second Row */}
          <View className="flex-row justify-between" style={{direction:"rtl"}}>
            {/* Monthly Average */}
            <View className="bg-white rounded-2xl p-5 w-[48.5%]" style={{direction:"rtl"}}>
              <Text className="text-gray-400 text-sm text-right mb-6">
                المتوسط الشهري
              </Text>
              <Text className="text-gray-900 text-4xl font-bold text-center mb-6">
                34,130
              </Text>
              <Text className="text-gray-300 text-xs text-left">ريال</Text>
            </View>

            {/* Transaction Count */}
            <View className="bg-white rounded-2xl p-5 w-[48.5%]" style={{direction:"rtl"}}>
              <Text className="text-gray-400 text-sm text-right mb-6">
                عدد المعاملات
              </Text>
              <Text className="text-gray-900 text-4xl font-bold text-center mb-6">
                47
              </Text>
              <Text className="text-gray-300 text-xs text-left">معاملة</Text>
            </View>
          </View>
        </View>

        {/* Monthly Trend Chart */}
        <View className="bg-white rounded-2xl p-5 mx-6 mt-6">
          <Text className="text-gray-900 text-base font-semibold text-right mb-6">
            الاتجاه الشهري
          </Text>

          {monthlyTrends.map((trend, index) => {
            const barWidth = (trend.amount / maxAmount) * 100;
            return (
              <View key={index} className="mb-4">
                <View className="flex-row items-center justify-between mb-2">
                  <Text className="text-gray-600 text-sm">
                    {trend.amount.toLocaleString()} ر.س
                  </Text>
                  <Text className="text-gray-700 text-sm font-medium">
                    {trend.month}
                  </Text>
                </View>
                <View className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                  <View
                    className="h-full bg-[#0055aa] rounded-full"
                    style={{ width: `${barWidth}%` }}
                  />
                </View>
              </View>
            );
          })}
        </View>

        {/* Category Breakdown */}
        <View className="bg-white rounded-2xl p-5 mx-6 mt-6">
          <Text className="text-gray-900 text-base font-semibold text-right mb-6">
            التصنيف حسب الفئات
          </Text>

          {categories.map((category, index) => (
            <View key={index} className="mb-5">
              <View className="flex-row items-center justify-between mb-2">
                <View className="flex-row items-center">
                  <View
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: category.color }}
                  />
                </View>
                <Text className="text-gray-700 text-sm font-medium">
                  {category.name}
                </Text>
              </View>
              <Text className="text-gray-900 text-lg font-bold text-right">
                {category.amount} ريال
              </Text>
              <Text className="text-gray-500 text-xs text-right mt-1">
                {category.percentage}%
              </Text>
            </View>
          ))}
        </View>

        {/* Financial Insights */}
        <View className="bg-purple-50 rounded-2xl p-5 mx-6 mt-6 mb-8">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-2xl">💡</Text>
            <Text className="text-purple-900 text-base font-bold">
              رؤى مالية
            </Text>
          </View>

          <View className="gap-3">
            <Text className="text-purple-700 text-sm text-right leading-6">
              • متوسط انفاقك 34,130 ريال يضعك على الهدف المحدد
            </Text>
            <Text className="text-red-600 text-sm text-right leading-6">
              حر 12.5%
            </Text>
            <Text className="text-purple-700 text-sm text-right leading-6">
              • مخطط الانفاق الخاص بك في (36.4) يقع في المعاملات الضريبية
            </Text>
            <Text className="text-purple-700 text-sm text-right leading-6">
              • يُنصح بمراجعة المعاملات الضريبية لتقليل التكاليف
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Month Period Picker Modal */}
      <MonthPeriodPicker
        visible={showMonthPicker}
        onClose={() => setShowMonthPicker(false)}
        onSelect={handleDateRangeSelect}
        initialStartMonth={dateRange.startMonth}
        initialEndMonth={dateRange.endMonth}
      />
    </View>
  );
};

export default FinancialAnalysisScreen;
