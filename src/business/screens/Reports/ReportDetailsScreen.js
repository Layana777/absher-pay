import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, ActivityIndicator, Alert } from "react-native";
import { CustomHeader } from "../../../common/components";
import { Feather } from "@expo/vector-icons";
import { useBusinessWallet } from "../../../store/hooks";
import { getTransactionsByDateRange } from "../../../common/services/transactionService";
import SvgIcons from "../../../common/components/SvgIcons";

const ReportDetailsScreen = ({ navigation, route }) => {
  const { report, primaryColor = "#0055aa" } = route.params || {};
  const businessWallet = useBusinessWallet();

  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    loadReportTransactions();
  }, []);

  const loadReportTransactions = async () => {
    try {
      setLoading(true);

      if (!businessWallet?.id) {
        Alert.alert("خطأ", "لم يتم العثور على المحفظة");
        return;
      }

      // Get transactions for this report's date range
      const result = await getTransactionsByDateRange(
        businessWallet.id,
        report.fromDate,
        report.toDate
      );

      if (result.success) {
        // Filter only payment transactions (money out)
        const paymentTransactions = result.data.filter((txn) => txn.amount < 0);
        setTransactions(paymentTransactions);
      } else {
        Alert.alert("خطأ", result.error || "فشل تحميل تفاصيل التقرير");
      }
    } catch (error) {
      console.error("Error loading report transactions:", error);
      Alert.alert("خطأ", "حدث خطأ أثناء تحميل تفاصيل التقرير");
    } finally {
      setLoading(false);
    }
  };

  // Format date
  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Format time
  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Get transaction icon
  const getTransactionIcon = (type) => {
    const icons = {
      payment: "file-text",
      transfer_out: "send",
      withdrawal: "arrow-down-circle",
      fee: "credit-card",
      penalty: "alert-circle",
    };
    return icons[type] || "arrow-down";
  };

  // Get transaction color
  const getTransactionColor = (type) => {
    const colors = {
      payment: "#3B82F6",
      transfer_out: "#8B5CF6",
      withdrawal: "#EF4444",
      fee: "#F59E0B",
      penalty: "#DC2626",
    };
    return colors[type] || "#6B7280";
  };

  // Group transactions by date
  const groupedTransactions = transactions.reduce((groups, txn) => {
    const date = formatDate(txn.timestamp);
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(txn);
    return groups;
  }, {});

  return (
    <View className="flex-1 bg-gray-50">
      <CustomHeader
        title={report?.title || "تفاصيل التقرير"}
        onBack={() => navigation.goBack()}
        backgroundColor="#0055aa"
        textColor="#FFFFFF"
        statusBarStyle="light-content"
        statusBarBackgroundColor="#0055aa"
      />

      <ScrollView className="flex-1" contentContainerStyle={{ padding: 16 }}>
        {/* Report Summary Card */}
        <View
          className="bg-white rounded-3xl p-5 mb-4"
          style={{ direction: "ltr" }}
        >
          <Text className="text-lg font-bold text-gray-900 mb-4 text-right">
            ملخص التقرير
          </Text>

          <View className="mb-3">
            <Text className="text-sm text-gray-500 text-right mb-1">
              الفترة الزمنية
            </Text>
            <Text className="text-base font-medium text-gray-900 text-right">
              {report?.periodLabel}
            </Text>
          </View>

          <View className="flex-row justify-between mb-3 gap-2">
            <View className="flex-1 bg-blue-50 rounded-2xl p-3 ml-2 items-center">
              <Text className="text-xs text-gray-600  mb-1">عدد العمليات</Text>
              <Text className="text-2xl font-bold text-blue-600 text-center">
                {report?.operationsCount || 0}
              </Text>
            </View>

            <View className="flex-1 bg-red-50 rounded-2xl p-3">
              <Text className="text-xs text-gray-600  mb-1 text-center">
                إجمالي المدفوعات
              </Text>
              <View className="flex-row items-center justify-end">
                <Text className="text-2xl font-bold text-red-600 text-center mr-7">
                  <SvgIcons name="SARTred" size={20} />
                  {(report?.totalExpense || 0).toLocaleString("en-US")}
                </Text>
              </View>
            </View>
          </View>

          <View
            className="border-t border-gray-200 pt-3"
            style={{ direction: "rtl" }}
          >
            <View className="flex-row ">
              <Text className="text-sm text-gray-600 ">من تاريخ:</Text>
              <Text className="text-sm font-medium text-gray-900">
                {formatDate(report?.fromDate)}
              </Text>
            </View>
            <View className="flex-row mt-2">
              <Text className="text-sm text-gray-600">إلى تاريخ:</Text>
              <Text className="text-sm font-medium text-gray-900">
                {formatDate(report?.toDate)}
              </Text>
            </View>
          </View>
        </View>

        {/* Loading State */}
        {loading && (
          <View className="py-20 items-center">
            <ActivityIndicator size="large" color={primaryColor} />
            <Text className="text-gray-500 mt-4">جاري تحميل التفاصيل...</Text>
          </View>
        )}

        {/* Transactions List */}
        {!loading && transactions.length > 0 && (
          <View>
            <Text
              className="text-lg font-bold text-gray-900 mb-3 text-right"
              style={{ direction: "ltr" }}
            >
              تفاصيل العمليات ({transactions.length})
            </Text>

            {Object.keys(groupedTransactions).map((date) => (
              <View key={date} className="mb-4" style={{ direction: "ltr" }}>
                {/* Date Header */}
                <View className="bg-gray-100 rounded-xl px-4 py-2 mb-2">
                  <Text className="text-sm font-bold text-gray-700 text-right">
                    {date}
                  </Text>
                </View>

                {/* Transactions for this date */}
                {groupedTransactions[date].map((txn) => (
                  <View
                    key={txn.id}
                    className="bg-white rounded-2xl p-4 mb-2 border border-gray-100"
                    style={{ direction: "rtl" }}
                  >
                    <View className="flex-row items-center justify-between">
                      {/* Transaction Info */}
                      <View className="flex-row items-center flex-1">
                        <View
                          className="w-10 h-10 rounded-xl items-center justify-center ml-3"
                          style={{
                            backgroundColor: `${getTransactionColor(
                              txn.type
                            )}20`,
                          }}
                        >
                          <Feather
                            name={getTransactionIcon(txn.type)}
                            size={20}
                            color={getTransactionColor(txn.type)}
                          />
                        </View>

                        <View
                          className="flex-1 m-3"
                          style={{ direction: "ltr" }}
                        >
                          <Text className="text-base font-bold text-gray-900 text-right ">
                            {txn.serviceName?.ar ||
                              txn.serviceName?.en ||
                              txn.descriptionAr ||
                              txn.descriptionEn}
                          </Text>
                          {txn.ministryName && (
                            <Text className="text-xs text-gray-600 text-right mb-1">
                              {txn.ministryName?.ar || txn.ministryName?.en}
                            </Text>
                          )}
                          <Text className="text-xs text-gray-500 text-right">
                            {formatTime(txn.timestamp)} • {txn.referenceNumber}
                          </Text>
                        </View>
                      </View>

                      {/* Amount */}
                      <View className="items-end">
                        <View className="flex-row items-center">
                          <Text className="text-lg font-bold text-red-600 mr-1">
                            {Math.abs(txn.amount).toLocaleString("en-US", {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </Text>
                          <SvgIcons name="SARTred" size={20} />
                        </View>
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            ))}
          </View>
        )}

        {/* Empty State */}
        {!loading && transactions.length === 0 && (
          <View className="py-20 items-center">
            <View className="w-20 h-20 bg-gray-100 rounded-full items-center justify-center mb-4">
              <Feather name="inbox" size={40} color="#9CA3AF" />
            </View>
            <Text className="text-gray-900 font-bold text-lg mb-2">
              لا توجد عمليات
            </Text>
            <Text className="text-gray-500 text-center px-8">
              لم يتم العثور على عمليات في هذه الفترة
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default ReportDetailsScreen;
