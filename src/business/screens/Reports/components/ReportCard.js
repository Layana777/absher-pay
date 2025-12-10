import React, { useState } from "react";
import { View, Text, TouchableOpacity, Alert } from "react-native";
import { Feather } from "@expo/vector-icons";
import SvgIcons from "../../../../common/components/SvgIcons";
import { generateReportPDF } from "../../../../common/services/PDFService";
import { getTransactionsByDateRange } from "../../../../common/services/transactionService";

const ReportCard = ({ report, onDownload, onPreview, primaryColor = "#0055aa", walletId }) => {
  const [downloading, setDownloading] = useState(false);
  // Get report type icon and color
  const getReportTypeStyle = (type) => {
    const styles = {
      monthly: { icon: "calendar", color: "#8B5CF6", bgColor: "#F3E8FF" },
      quarterly: { icon: "trending-up", color: "#10B981", bgColor: "#D1FAE5" },
      yearly: { icon: "bar-chart-2", color: "#3B82F6", bgColor: "#DBEAFE" },
      custom: { icon: "settings", color: "#F59E0B", bgColor: "#FEF3C7" },
    };
    return styles[type] || styles.monthly;
  };

  const typeStyle = getReportTypeStyle(report.type);

  // Format date
  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
    });
  };

  // Handle PDF download
  const handleDownloadPDF = async () => {
    try {
      setDownloading(true);

      if (!walletId) {
        Alert.alert("خطأ", "لم يتم العثور على المحفظة");
        return;
      }

      // Get transactions for this report's date range
      const result = await getTransactionsByDateRange(
        walletId,
        report.fromDate,
        report.toDate
      );

      if (result.success) {
        // Filter only payment transactions (money out)
        const paymentTransactions = result.data.filter((txn) => txn.amount < 0);

        if (paymentTransactions.length === 0) {
          Alert.alert("تنبيه", "لا توجد عمليات لتحميلها في التقرير");
          return;
        }

        await generateReportPDF(report, paymentTransactions);
      } else {
        Alert.alert("خطأ", result.error || "فشل تحميل تفاصيل التقرير");
      }
    } catch (error) {
      console.error("Error downloading PDF:", error);
      Alert.alert("خطأ", "حدث خطأ أثناء تحميل ملف PDF");
    } finally {
      setDownloading(false);
    }
  };

  // Handle preview
  const handlePreview = () => {
    if (onPreview) {
      onPreview(report);
    }
  };

  return (
    <View
      className="bg-white rounded-2xl p-4 mb-3 border border-gray-100"
      style={{ direction: "rtl" }}
    >
      {/* Header with Icon */}
      <View className="flex-row items-center justify-between mb-3">
        <View className="flex-row items-center flex-1">
          <View
            className="w-12 h-12 rounded-xl items-center justify-center mr-3"
            style={{ backgroundColor: typeStyle.bgColor }}
          >
            <Feather name={typeStyle.icon} size={24} color={typeStyle.color} />
          </View>

          <View className="flex-1 m-3">
            <Text className="text-base font-bold text-left text-gray-900 mb-1">
              {report.title}
            </Text>
            <Text className="text-sm text-gray-500 text-left">
              {report.periodLabel}
            </Text>
          </View>
        </View>
      </View>

      {/* Stats Row */}
      <View className="flex-row items-center justify-between mb-3 px-2 ">
        <View className="flex-1 items-center">
          <Text className="text-xs text-gray-500 ">إجمالي المدفوعات</Text>
          <Text className="text-lg font-bold " style={{ color: primaryColor }}>
            <SvgIcons name="SARBlue" size={16} />{" "}
            {report.totalExpense?.toLocaleString("en-US")}
          </Text>
        </View>

        <View className="flex-1 items-center">
          <Text className="text-xs text-gray-500 mb-1 ">عدد العمليات</Text>
          <Text className="text-lg font-bold text-gray-900">
            {report.operationsCount}
          </Text>
        </View>

        {/* <View className="flex-1 items-end">
          <Text className="text-xs text-gray-500 ">الحجم</Text>
          <Text className="text-sm font-medium text-gray-700">
            {report.fileSize} KB
          </Text>
        </View> */}
      </View>

      {/* Action Buttons - Preview & PDF Download */}
      <View className="flex-row gap-2" style={{ direction: "rtl" }}>
        {/* Preview Button */}
        <TouchableOpacity
          onPress={handlePreview}
          className="flex-1 rounded-xl py-3 flex-row items-center justify-center bg-white border-2"
          style={{ borderColor: primaryColor }}
        >
          <Feather name="eye" size={18} color={primaryColor} />
          <Text className="font-bold text-sm mr-2" style={{ color: primaryColor }}>
            معاينة
          </Text>
        </TouchableOpacity>

        {/* PDF Download Button */}
        <TouchableOpacity
          onPress={handleDownloadPDF}
          disabled={downloading}
          className="flex-1 rounded-xl py-3 flex-row items-center justify-center"
          style={{ backgroundColor: downloading ? "#cccccc" : primaryColor }}
        >
          <Feather name="download" size={18} color="white" />
          <Text className="text-white font-bold text-sm mr-2">
            {downloading ? "جاري التحميل..." : "تحميل PDF"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ReportCard;
