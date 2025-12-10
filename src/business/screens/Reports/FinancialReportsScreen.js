import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { CustomHeader } from "../../../common/components";
import { useBusinessWallet } from "../../../store/hooks";
import {
  getAllReports,
  filterReports,
  getQuickRange,
  getReportTypeLabel,
  generateCustomReport,
} from "../../../common/services/reportsService";
import QuickFilters from "./components/QuickFilters";
import ReportTypeFilter from "./components/ReportTypeFilter";
import ReportCard from "./components/ReportCard";
import DateRangeSelector from "./components/DateRangeSelector";

const FinancialReportsScreen = ({ navigation, route }) => {
  const { primaryColor = "#0055aa" } = route.params || {};
  const businessWallet = useBusinessWallet();

  // State
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [allReports, setAllReports] = useState([]);
  const [filteredReports, setFilteredReports] = useState([]);

  // Filter states
  const [activeReportType, setActiveReportType] = useState("all");
  const [activeQuickFilter, setActiveQuickFilter] = useState(null);
  const [customDateRange, setCustomDateRange] = useState({
    start: null,
    end: null,
  });

  // Load reports
  const loadReports = async () => {
    try {
      setLoading(true);

      if (!businessWallet?.id) {
        Alert.alert("خطأ", "لم يتم العثور على المحفظة");
        return;
      }

      const result = await getAllReports(businessWallet.id);

      if (result.success) {
        setAllReports(result.data);
        setFilteredReports(result.data);
      } else {
        Alert.alert("خطأ", result.error || "فشل تحميل التقارير");
      }
    } catch (error) {
      console.error("Error loading reports:", error);
      Alert.alert("خطأ", "حدث خطأ أثناء تحميل التقارير");
    } finally {
      setLoading(false);
    }
  };

  // Refresh reports
  const onRefresh = async () => {
    setRefreshing(true);
    await loadReports();
    setRefreshing(false);
  };

  // Apply filters
  const applyFilters = () => {
    let dateRange = { startDate: null, endDate: null };

    // Apply quick filter if selected
    if (activeQuickFilter) {
      const range = getQuickRange(activeQuickFilter);
      dateRange.startDate = range.start;
      dateRange.endDate = range.end;
    }
    // Apply custom date range if set
    else if (customDateRange.start && customDateRange.end) {
      dateRange.startDate = customDateRange.start;
      dateRange.endDate = customDateRange.end;
    }

    // Filter reports
    const filtered = filterReports(allReports, {
      type: activeReportType,
      ...dateRange,
    });

    setFilteredReports(filtered);
  };

  // Handle report type change
  const handleReportTypeChange = (type) => {
    setActiveReportType(type);
  };

  // Handle quick filter change - Create custom report
  const handleQuickFilterChange = async (filter) => {
    try {
      if (!businessWallet?.id) {
        Alert.alert("خطأ", "لم يتم العثور على المحفظة");
        return;
      }

      setLoading(true);

      // Get date range for the filter
      const range = getQuickRange(filter);

      // Get custom title based on filter
      const titles = {
        "7d": "تقرير آخر 7 أيام",
        "30d": "تقرير آخر 30 يوم",
        "90d": "تقرير آخر 90 يوم",
      };

      // Generate custom report for this date range
      const result = await generateCustomReport(
        businessWallet.id,
        range.start,
        range.end,
        titles[filter]
      );

      if (result.success && result.data) {
        // Add the custom report to the beginning of the list
        const updatedReports = [
          result.data,
          ...allReports.filter((r) => r.type !== "custom"),
        ];
        setAllReports(updatedReports);
        setFilteredReports(updatedReports);

        // Set active filter
        setActiveQuickFilter(filter);
        setCustomDateRange({ start: null, end: null });

        Alert.alert("نجح", "تم إنشاء التقرير السريع بنجاح");
      } else {
        Alert.alert("خطأ", result.error || "فشل إنشاء التقرير");
      }
    } catch (error) {
      console.error("Error creating quick report:", error);
      Alert.alert("خطأ", "حدث خطأ أثناء إنشاء التقرير");
    } finally {
      setLoading(false);
    }
  };

  // Handle custom date range change - Create custom report
  const handleDateRangeChange = async (start, end) => {
    try {
      if (!start || !end) {
        setCustomDateRange({ start, end });
        return;
      }

      if (!businessWallet?.id) {
        Alert.alert("خطأ", "لم يتم العثور على المحفظة");
        return;
      }

      setLoading(true);

      // Generate custom report for this date range
      const result = await generateCustomReport(businessWallet.id, start, end);

      if (result.success && result.data) {
        // Add the custom report to the beginning of the list
        const updatedReports = [
          result.data,
          ...allReports.filter((r) => r.type !== "custom"),
        ];
        setAllReports(updatedReports);
        setFilteredReports(updatedReports);

        // Set custom date range
        setCustomDateRange({ start, end });
        setActiveQuickFilter(null); // Clear quick filter when custom date is selected

        Alert.alert("نجح", "تم إنشاء التقرير المخصص بنجاح");
      } else {
        Alert.alert("خطأ", result.error || "فشل إنشاء التقرير");
      }
    } catch (error) {
      console.error("Error creating custom report:", error);
      Alert.alert("خطأ", "حدث خطأ أثناء إنشاء التقرير");
    } finally {
      setLoading(false);
    }
  };

  // Handle preview report
  const handlePreviewReport = (report) => {
    // Navigate to report details screen
    navigation.navigate("ReportDetails", {
      report,
      primaryColor,
    });
  };

  // Load reports on mount
  useEffect(() => {
    loadReports();
  }, [businessWallet?.id]);

  // Apply filters when filter states change
  useEffect(() => {
    if (allReports.length > 0) {
      applyFilters();
    }
  }, [activeReportType, activeQuickFilter, customDateRange, allReports]);

  // Calculate summary stats
  const totalReports = filteredReports.length;
  const totalOperations = filteredReports.reduce(
    (sum, r) => sum + r.operationsCount,
    0
  );
  const totalExpense = filteredReports.reduce(
    (sum, r) => sum + (r.totalExpense || 0),
    0
  );

  return (
    <>
      {/* Header */}
      <CustomHeader
        title="التقارير المالية"
        onBack={() => navigation.goBack()}
        backgroundColor="#0055aa"
        textColor="#FFFFFF"
        statusBarStyle="light-content"
        statusBarBackgroundColor="#0055aa"
        rightComponent={
          <TouchableOpacity
            onPress={onRefresh}
            className="p-2"
            disabled={loading}
          >
            <Feather
              name="refresh-cw"
              size={24}
              color={loading ? "#ccc" : "#FFFFFF"}
            />
          </TouchableOpacity>
        }
      />

      <View className="flex-1 bg-gray-50" style={{ direction: "ltr" }}>
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ padding: 16 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {/* Summary Card */}
          <View className="bg-white rounded-3xl p-5 mb-5 shadow-sm">
            <Text className="text-lg font-bold text-gray-900 mb-4 text-right">
              إحصائيات التقارير
            </Text>

            <View className="flex-row justify-between">
              <View className="flex-1 items-center py-3 bg-blue-50 rounded-2xl mx-1">
                <Text className="text-2xl font-bold text-blue-600">
                  {totalReports}
                </Text>
                <Text className="text-xs text-gray-600 mt-1">عدد التقارير</Text>
              </View>

              <View className="flex-1 items-center py-3 bg-green-50 rounded-2xl mx-1">
                <Text className="text-2xl font-bold text-green-600">
                  {totalOperations}
                </Text>
                <Text className="text-xs text-gray-600 mt-1">
                  إجمالي العمليات
                </Text>
              </View>

              <View className="flex-1 items-center py-3 bg-red-50 rounded-2xl mx-1">
                <Text className="text-2xl font-bold text-red-600">
                  {totalExpense.toLocaleString("en-US", {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0,
                  })}
                </Text>
                <Text className="text-xs text-gray-600 mt-1">
                  إجمالي المدفوعات
                </Text>
              </View>
            </View>
          </View>

          {/* Quick Date Filters */}
          <View className="mb-3">
            <Text className="text-base font-bold text-gray-900 mb-3 text-right">
              إنشاء تقرير سريع
            </Text>
            <QuickFilters
              activeFilter={activeQuickFilter}
              onFilterSelect={handleQuickFilterChange}
            />
          </View>

          {/* Custom Date Range Selector */}
          <DateRangeSelector
            startDate={customDateRange.start}
            endDate={customDateRange.end}
            onDateRangeChange={handleDateRangeChange}
            primaryColor={primaryColor}
          />

          {/* Report Type Filters */}
          <View className="mb-4">
            <Text className="text-base font-bold text-gray-900 mb-3 text-right">
              التقارير المتاحة
            </Text>
            <ReportTypeFilter
              activeType={activeReportType}
              onTypeSelect={handleReportTypeChange}
            />
          </View>

          {/* Reports Count */}
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-sm text-gray-600">
              {filteredReports.length} تقرير
            </Text>
            <Text className="text-sm font-medium text-gray-700">
              {getReportTypeLabel(activeReportType)}
            </Text>
          </View>

          {/* Loading State */}
          {loading && (
            <View className="py-20 items-center">
              <ActivityIndicator size="large" color={primaryColor} />
              <Text className="text-gray-500 mt-4">جاري تحميل التقارير...</Text>
            </View>
          )}

          {/* Empty State */}
          {!loading && filteredReports.length === 0 && (
            <View className="py-20 items-center">
              <View className="w-20 h-20 bg-gray-100 rounded-full items-center justify-center mb-4">
                <Feather name="file-text" size={40} color="#9CA3AF" />
              </View>
              <Text className="text-gray-900 font-bold text-lg mb-2">
                لا توجد تقارير
              </Text>
              <Text className="text-gray-500 text-center px-8">
                لم يتم العثور على تقارير مطابقة للفلاتر المحددة
              </Text>
            </View>
          )}

          {/* Reports List */}
          {!loading && filteredReports.length > 0 && (
            <View>
              {filteredReports.map((report) => (
                <ReportCard
                  key={report.id}
                  report={report}
                  onPreview={handlePreviewReport}
                  walletId={businessWallet?.id}
                  primaryColor={primaryColor}
                />
              ))}
            </View>
          )}
        </ScrollView>
      </View>
    </>
  );
};

export default FinancialReportsScreen;
