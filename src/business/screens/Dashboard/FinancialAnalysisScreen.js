import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Modal,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import CustomHeader from "../../../common/components/CustomHeader";
import DatePickerWheels from "../../components/DatePickerWheels";

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

  // Get last three months dynamically
  const getLastThreeMonths = () => {
    const today = new Date();
    const currentMonth = today.getMonth(); // 0-indexed
    const months = [];

    for (let i = 0; i < 3; i++) {
      let monthIndex = currentMonth - i;
      if (monthIndex < 0) {
        monthIndex = 12 + monthIndex; // Handle year wrap
      }
      months.push(monthNames[monthIndex]);
    }

    return months;
  };

  const [selectedPeriod, setSelectedPeriod] = useState("all");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [dateRange, setDateRange] = useState(getDefaultDateRange());

  // Sample data

  const categories = [
    { name: "المعاملات الضريبية", amount: 800, percentage: 35.4, color: "#ef4444" },
    { name: "خدمات", amount: 650, percentage: 25.5, color: "#3b82f6" },
    { name: "المواردات", amount: 760, percentage: 24.5, color: "#10b981" },
    { name: "رسوم شهرية", amount: 500, percentage: 10.5, color: "#f97316" },
    { name: "أخرى", amount: 250, percentage: 5.1, color: "#6b7280" },
  ];

  const handleDateChange = (date) => {
    setSelectedDate(date);
  };

  const handleDateDone = () => {
    // Update date range based on selected date
    const date = new Date(selectedDate);
    const month = date.getMonth();
    const year = date.getFullYear();

    setDateRange({
      startMonth: month,
      startYear: year,
      endMonth: month,
      endYear: year,
      startMonthName: monthNames[month],
      endMonthName: monthNames[month],
    });

    setShowDatePicker(false);
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
        {/* Date Selector */}
        <View className="flex-row items-center justify-between px-6 mt-6" style={{direction: "rtl"}}>
          <Text className="text-gray-600 text-sm">{getDisplayDateRange()}</Text>
          <View className="flex-row gap-3">
            <TouchableOpacity
              className="w-10 h-10 bg-white rounded-lg items-center justify-center"
              onPress={() => setShowDatePicker(true)}
            >
              <Feather name="calendar" size={20} color="#6b7280" />
            </TouchableOpacity>
            <TouchableOpacity className="w-10 h-10 bg-white rounded-lg items-center justify-center">
              <Feather name="download" size={20} color="#6b7280" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Period Filter Buttons */}
        <View className="flex-row gap-2 px-6 mt-4" style={{direction: "rtl"}}>
          {["الكل", ...getLastThreeMonths()].map((period) => (
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


        {/* Metric Cards */}
        <View className="px-6 mt-6">
          {/* First Row */}
          <View className="flex-row justify-between mb-3" style={{direction:"rtl"}}>
            {/* Monthly Spending 1 */}
            <View className="bg-white rounded-2xl p-5 w-[48.5%]" style={{direction:"ltr"}}>
              <Text className="text-gray-400 text-sm text-right mb-6">
                الإنفاق الشهري
              </Text>
              <Text className="text-gray-900 text-4xl font-bold text-center mb-6">
                3,280
              </Text>
              <View className="flex-row items-center justify-end">
                <Text className="text-red-500 text-xs font-semibold" style={{direction:"ltr"}}>
                  حر 12.5%
                </Text>
                <Feather
                  name="trending-down"
                  size={14}
                  color="#ef4444"
                  style={{ marginRight: 4 }}
                />
              </View>
            </View>

            {/* Monthly Spending 2 */}
            <View className="bg-white rounded-2xl p-5 w-[48.5%]" style={{direction:"ltr"}}>
              <Text className="text-gray-400 text-sm text-right mb-6">
                الإنفاق السنوي
              </Text>
              <Text className="text-gray-900 text-4xl font-bold text-center mb-6">
                3,103
              </Text>
              <Text className="text-gray-300 text-xs text-right" style={{direction:"rtl"}}>ريال</Text>
            </View>
          </View>

          {/* Second Row */}
          <View className="flex-row justify-between" style={{direction:"rtl"}}>
            {/* Monthly Average */}
            <View className="bg-white rounded-2xl p-5 w-[48.5%]" style={{direction:"ltr"}}>
              <Text className="text-gray-400 text-sm text-right mb-6">
                المتوسط الشهري
              </Text>
              <Text className="text-gray-900 text-4xl font-bold text-center mb-6">
                34,130
              </Text>
              <Text className="text-gray-300 text-xs text-right" style={{direction:"rtl"}}>ريال</Text>
            </View>

            {/* Transaction Count */}
            <View className="bg-white rounded-2xl p-5 w-[48.5%]" style={{direction:"ltr"}}>
              <Text className="text-gray-400 text-sm text-right mb-6">
                عدد المعاملات
              </Text>
              <Text className="text-gray-900 text-4xl font-bold text-center mb-6">
                47
              </Text>
              <Text className="text-gray-300 text-xs text-right" style={{direction:"rtl"}}>معاملة</Text>
            </View>
          </View>
        </View>

        {/* Category Breakdown */}
        <View className="bg-white rounded-2xl p-5 mx-6 mt-6" style={{direction: "rtl"}}>
          <Text className="text-gray-900 text-base font-semibold text-right mb-6" style={{direction: "ltr"}}>
            التصنيف حسب الفئات
          </Text>

          {categories.map((category, index) => (
            <View key={index} className="mb-5">
              <View className="flex-row items-center justify-between mb-2" style={{direction: "rtl"}}>
                <Text className="text-gray-700 text-sm font-medium">
                  {category.name}
                </Text>
                <View className="flex-row items-center">
                  <View
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: category.color }}
                  />
                </View>
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
        <View className="bg-purple-50 rounded-2xl p-5 mx-6 mt-6 mb-8" style={{direction: "rtl"}}>
          <View className="flex-row items-center justify-between mb-4" style={{direction: "rtl"}}>
            <Text className="text-purple-900 text-base font-bold">
              رؤى مالية
            </Text>
            <Text className="text-2xl" style={{direction: "rtl"}}>💡</Text>
          </View>

          <View className="gap-3">
            <Text className="text-purple-700 text-sm text-right leading-6" style={{direction: "ltr"}}>
              • متوسط انفاقك 34,130 ريال يضعك على الهدف المحدد
            </Text>
            <Text className="text-red-600 text-sm text-right leading-6" style={{direction: "ltr"}}>
              حر 12.5%
            </Text>
            <Text className="text-purple-700 text-sm text-right leading-6" style={{direction: "ltr"}}>
              • مخطط الانفاق الخاص بك في (36.4) يقع في المعاملات الضريبية
            </Text>
            <Text className="text-purple-700 text-sm text-right leading-6" style={{direction: "ltr"}}>
              • يُنصح بمراجعة المعاملات الضريبية لتقليل التكاليف
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Date Picker Modal */}
      <Modal
        visible={showDatePicker}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowDatePicker(false)}
      >
        <View className="flex-1 justify-end bg-black/50">
          <View className="bg-white rounded-t-3xl px-5 pb-8">
            {/* Handle Bar */}
            <View className="items-center py-3">
              <View className="w-12 h-1 bg-gray-300 rounded-full" />
            </View>

            {/* Title */}
            <Text className="text-gray-800 text-xl font-bold text-center mb-6">
              اختر التاريخ
            </Text>

            {/* Date Picker */}
            <DatePickerWheels
              onDateChange={handleDateChange}
              initialDate={selectedDate}
              minimumDate={new Date(2020, 0, 1)}
            />

            {/* Action Buttons */}
            <View className="flex-row gap-3 mt-4">
              <TouchableOpacity
                onPress={handleDateDone}
                className="flex-1 rounded-xl py-3"
                style={{ backgroundColor: "#0055aa" }}
              >
                <Text className="text-white text-base font-semibold text-center">
                  تأكيد
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setShowDatePicker(false)}
                className="flex-1 rounded-xl py-3 border border-gray-300"
              >
                <Text className="text-gray-700 text-base font-semibold text-center">
                  إلغاء
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default FinancialAnalysisScreen;
