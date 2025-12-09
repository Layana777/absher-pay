import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import CustomHeader from "../../../common/components/CustomHeader";
import DatePickerWheels from "../../components/DatePickerWheels";
import { useUser, useBusinessWallet } from "../../../store/hooks";
import { getFinancialAnalysis } from "../../../common/services/transactionService";

const FinancialAnalysisScreen = ({ navigation }) => {
  // Get user and wallet from Redux
  const user = useUser();
  const businessWallet = useBusinessWallet();

  // Calculate default date range: start of current month to today
  const getDefaultDateRange = () => {
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    return {
      fromDate: startOfMonth,
      toDate: today,
    };
  };

  const [showFromDatePicker, setShowFromDatePicker] = useState(false);
  const [showToDatePicker, setShowToDatePicker] = useState(false);
  const [dateRange, setDateRange] = useState(getDefaultDateRange());
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [metrics, setMetrics] = useState({
    monthlySpending: 0,
    yearlySpending: 0,
    monthlyAverage: 0,
    totalTransactions: 0,
  });

  // Color mapping for categories
  const categoryColors = {
    passports: "#ef4444",
    traffic: "#3b82f6",
    civil_affairs: "#10b981",
    commerce: "#f97316",
  };

  const [tempDate, setTempDate] = useState(new Date());

  // Fetch financial data from Firebase
  const fetchFinancialData = async () => {
    if (!businessWallet?.id) {
      console.log("No business wallet found");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      // Convert dates to timestamps
      const startTimestamp = dateRange.fromDate.getTime();
      const endTimestamp = new Date(dateRange.toDate).setHours(23, 59, 59, 999);

      console.log("Fetching financial analysis from", new Date(startTimestamp), "to", new Date(endTimestamp));

      const result = await getFinancialAnalysis(
        businessWallet.id,
        startTimestamp,
        endTimestamp
      );

      if (result.success) {
        // Map categories with colors
        const categoriesWithColors = result.data.categories.map((cat) => ({
          ...cat,
          color: categoryColors[cat.serviceType] || "#6b7280",
        }));

        setCategories(categoriesWithColors);
        setMetrics(result.data.metrics);
      } else {
        console.error("Error fetching financial analysis:", result.error);
      }
    } catch (error) {
      console.error("Error fetching financial data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch data when component mounts or date range changes
  useEffect(() => {
    fetchFinancialData();
  }, [dateRange.fromDate.getTime(), dateRange.toDate.getTime(), businessWallet?.id]);

  const handleFromDateChange = (date) => {
    setTempDate(date);
  };

  const handleToDateChange = (date) => {
    setTempDate(date);
  };

  const handleFromDateDone = () => {
    setDateRange({
      fromDate: new Date(tempDate),
      toDate: new Date(dateRange.toDate),
    });
    setShowFromDatePicker(false);
  };

  const handleToDateDone = () => {
    setDateRange({
      fromDate: new Date(dateRange.fromDate),
      toDate: new Date(tempDate),
    });
    setShowToDatePicker(false);
  };

  const formatDate = (date) => {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
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
        {/* Date Range Selector */}
        <View className="px-6 mt-6" style={{direction: "rtl"}}>
          <View className="flex-row items-center justify-between gap-4">
            {/* From Date */}
            <View className="flex-1" style={{direction:"ltr"}}>
              <Text className="text-gray-600 text-sm mb-2 text-right">من</Text>
              <TouchableOpacity
                className="bg-white rounded-lg px-4 py-3 flex-row items-center justify-between"
                onPress={() => {
                  setTempDate(dateRange.fromDate);
                  setShowFromDatePicker(true);
                }}
              >
                <Feather name="calendar" size={18} color="#6b7280" />
                <Text className="text-gray-700 text-sm flex-1 text-center">
                  {formatDate(dateRange.fromDate)}
                </Text>
              </TouchableOpacity>
            </View>

            {/* To Date */}
            <View className="flex-1" style={{direction:"ltr"}}>
              <Text className="text-gray-600 text-sm mb-2 text-right">إلى</Text>
              <TouchableOpacity
                className="bg-white rounded-lg px-4 py-3 flex-row items-center justify-between"
                onPress={() => {
                  setTempDate(dateRange.toDate);
                  setShowToDatePicker(true);
                }}
              >
                <Feather name="calendar" size={18} color="#6b7280" />
                <Text className="text-gray-700 text-sm flex-1 text-center">
                  {formatDate(dateRange.toDate)}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>


        {/* Loading Indicator */}
        {loading && (
          <View className="flex-1 items-center justify-center py-20">
            <ActivityIndicator size="large" color="#0055aa" />
            <Text className="text-gray-500 mt-4">جاري تحميل البيانات...</Text>
          </View>
        )}

        {/* Metric Cards */}
        {!loading && (
          <View className="px-6 mt-6">
            {/* First Row */}
            <View className="flex-row justify-between mb-3" style={{direction:"rtl"}}>
              {/* Monthly Spending */}
              <View className="bg-white rounded-2xl p-5 w-[48.5%]" style={{direction:"ltr"}}>
                <Text className="text-gray-400 text-xs text-right mb-4">
                  الإنفاق الشهري
                </Text>
                <Text className="text-gray-900 text-2xl font-bold text-center mb-4">
                  {metrics.monthlySpending.toLocaleString()}
                </Text>
                <Text className="text-gray-300 text-xs text-right" style={{direction:"rtl"}}>ريال</Text>
              </View>

              {/* Yearly Spending */}
              <View className="bg-white rounded-2xl p-5 w-[48.5%]" style={{direction:"ltr"}}>
                <Text className="text-gray-400 text-xs text-right mb-4">
                  الإنفاق السنوي
                </Text>
                <Text className="text-gray-900 text-2xl font-bold text-center mb-4">
                  {metrics.yearlySpending.toLocaleString()}
                </Text>
                <Text className="text-gray-300 text-xs text-right" style={{direction:"rtl"}}>ريال</Text>
              </View>
            </View>

            {/* Second Row */}
            <View className="flex-row justify-between" style={{direction:"rtl"}}>
              {/* Monthly Average */}
              <View className="bg-white rounded-2xl p-5 w-[48.5%]" style={{direction:"ltr"}}>
                <Text className="text-gray-400 text-xs text-right mb-4">
                  المتوسط الشهري
                </Text>
                <Text className="text-gray-900 text-2xl font-bold text-center mb-4">
                  {metrics.monthlyAverage.toLocaleString()}
                </Text>
                <Text className="text-gray-300 text-xs text-right" style={{direction:"rtl"}}>ريال</Text>
              </View>

              {/* Transaction Count */}
              <View className="bg-white rounded-2xl p-5 w-[48.5%]" style={{direction:"ltr"}}>
                <Text className="text-gray-400 text-xs text-right mb-4">
                  عدد المعاملات
                </Text>
                <Text className="text-gray-900 text-2xl font-bold text-center mb-4">
                  {metrics.totalTransactions}
                </Text>
                <Text className="text-gray-300 text-xs text-right" style={{direction:"rtl"}}>معاملة</Text>
              </View>
            </View>
          </View>
        )}

        {/* Category Breakdown */}
        {!loading && (
          <View className="bg-white rounded-2xl p-5 mx-6 mt-6" style={{direction: "rtl"}}>
            <Text className="text-gray-900 text-base font-semibold text-right mb-6" style={{direction: "ltr"}}>
              التصنيف حسب الفئات
            </Text>

            {categories.length === 0 ? (
              <Text className="text-gray-500 text-sm text-center py-8">
                لا توجد معاملات في الفترة المحددة
              </Text>
            ) : (
              categories.map((category, index) => (
                <View key={index} className="mb-5">
                  <Text className="text-gray-700 text-sm font-medium mb-1 text-right" style={{direction: 'ltr'}}>
                    {category.name}
                  </Text>
                  <Text className="text-gray-900 text-lg font-bold mb-1 text-right" style={{direction: 'rtl'}}>
                    {category.amount.toLocaleString()} ريال
                  </Text>

                  {/* Progress Bar */}
                  <View className="flex-row-reverse items-center gap-2">
                    <Text className="text-gray-500 text-xs font-semibold min-w-[45px] text-right">
                      {category.percentage}%
                    </Text>
                    <View className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <View
                        className="h-full rounded-full"
                        style={{
                          width: `${category.percentage}%`,
                          backgroundColor: category.color
                        }}
                      />
                    </View>
                  </View>
                </View>
              ))
            )}
          </View>
        )}

        {/* Financial Insights */}
        {!loading && categories.length > 0 && (
          <View className="bg-purple-50 rounded-2xl p-5 mx-6 mt-6 mb-8" style={{direction: "rtl"}}>
            <View className="flex-row items-center justify-between mb-4" style={{direction: "rtl"}}>
              <Text className="text-purple-900 text-base font-bold">
                رؤى مالية
              </Text>
              <Text className="text-2xl" style={{direction: "rtl"}}>💡</Text>
            </View>

            <View className="gap-3">
              <Text className="text-purple-700 text-sm text-right leading-6" style={{direction: "ltr"}}>
                • متوسط انفاقك الشهري {metrics.monthlyAverage.toLocaleString()} ريال
              </Text>
              {categories[0] && (
                <Text className="text-purple-700 text-sm text-right leading-6" style={{direction: "ltr"}}>
                  • أعلى إنفاق في {categories[0].name} بنسبة {categories[0].percentage}%
                </Text>
              )}
              <Text className="text-purple-700 text-sm text-right leading-6" style={{direction: "ltr"}}>
                • إجمالي المعاملات: {metrics.totalTransactions} معاملة
              </Text>
            </View>
          </View>
        )}
      </ScrollView>

      {/* From Date Picker Modal */}
      <Modal
        visible={showFromDatePicker}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowFromDatePicker(false)}
      >
        <View className="flex-1 justify-end bg-black/50">
          <View className="bg-white rounded-t-3xl px-5 pb-8">
            {/* Handle Bar */}
            <View className="items-center py-3">
              <View className="w-12 h-1 bg-gray-300 rounded-full" />
            </View>

            {/* Title */}
            <Text className="text-gray-800 text-xl font-bold text-center mb-6">
              اختر تاريخ البداية
            </Text>

            {/* Date Picker */}
            <DatePickerWheels
              onDateChange={handleFromDateChange}
              initialDate={tempDate}
              minimumDate={new Date(2020, 0, 1)}
            />

            {/* Action Buttons */}
            <View className="flex-row gap-3 mt-4">
              <TouchableOpacity
                onPress={handleFromDateDone}
                className="flex-1 rounded-xl py-3"
                style={{ backgroundColor: "#0055aa" }}
              >
                <Text className="text-white text-base font-semibold text-center">
                  تأكيد
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setShowFromDatePicker(false)}
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

      {/* To Date Picker Modal */}
      <Modal
        visible={showToDatePicker}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowToDatePicker(false)}
      >
        <View className="flex-1 justify-end bg-black/50">
          <View className="bg-white rounded-t-3xl px-5 pb-8">
            {/* Handle Bar */}
            <View className="items-center py-3">
              <View className="w-12 h-1 bg-gray-300 rounded-full" />
            </View>

            {/* Title */}
            <Text className="text-gray-800 text-xl font-bold text-center mb-6">
              اختر تاريخ النهاية
            </Text>

            {/* Date Picker */}
            <DatePickerWheels
              onDateChange={handleToDateChange}
              initialDate={tempDate}
              minimumDate={new Date(2020, 0, 1)}
            />

            {/* Action Buttons */}
            <View className="flex-row gap-3 mt-4">
              <TouchableOpacity
                onPress={handleToDateDone}
                className="flex-1 rounded-xl py-3"
                style={{ backgroundColor: "#0055aa" }}
              >
                <Text className="text-white text-base font-semibold text-center">
                  تأكيد
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setShowToDatePicker(false)}
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
