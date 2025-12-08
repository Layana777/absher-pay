import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  SafeAreaView,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import {
  getUserScheduledBills,
  cancelScheduledBill,
  processScheduledBill,
  getScheduledBillStats,
} from "../../../common/services/scheduledBillsService";
import { getUserInfo } from "../../../common/services/authService";

/**
 * Scheduled Bills Screen
 * Displays all scheduled bill payments for the user
 */
const ScheduledBillsScreen = ({ navigation }) => {
  const primaryColor = "#0055aa";
  const [scheduledBills, setScheduledBills] = useState([]);
  const [filteredBills, setFilteredBills] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [userId, setUserId] = useState(null);

  // Fetch user ID
  useEffect(() => {
    const fetchUserId = async () => {
      try {
        const userInfo = await getUserInfo();
        if (userInfo) {
          setUserId(userInfo.uid);
        }
      } catch (error) {
        console.error("Error fetching user ID:", error);
      }
    };
    fetchUserId();
  }, []);

  // Fetch scheduled bills
  const fetchScheduledBills = async () => {
    if (!userId) return;

    try {
      setLoading(true);
      const bills = await getUserScheduledBills(userId);
      const billStats = await getScheduledBillStats(userId);

      setScheduledBills(bills);
      setStats(billStats);
      applyFilter(bills, selectedFilter);
    } catch (error) {
      console.error("Error fetching scheduled bills:", error);
      Alert.alert("خطأ", "حدث خطأ أثناء تحميل الفواتير المجدولة");
    } finally {
      setLoading(false);
    }
  };

  // Refresh scheduled bills
  const onRefresh = async () => {
    setRefreshing(true);
    await fetchScheduledBills();
    setRefreshing(false);
  };

  // Fetch on screen focus
  useFocusEffect(
    useCallback(() => {
      if (userId) {
        fetchScheduledBills();
      }
    }, [userId])
  );

  // Apply filter
  const applyFilter = (bills, filter) => {
    let filtered = bills;

    if (filter === "scheduled") {
      filtered = bills.filter((bill) => bill.status === "scheduled");
    } else if (filter === "paid") {
      filtered = bills.filter((bill) => bill.status === "paid");
    } else if (filter === "cancelled") {
      filtered = bills.filter((bill) => bill.status === "cancelled");
    }

    setFilteredBills(filtered);
  };

  // Handle filter change
  const handleFilterChange = (filter) => {
    setSelectedFilter(filter);
    applyFilter(scheduledBills, filter);
  };

  // Format date
  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString("ar-SA", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Get status info
  const getStatusInfo = (status) => {
    const statusMap = {
      scheduled: {
        label: "مجدول",
        color: "#3b82f6",
        bgColor: "#dbeafe",
        icon: "clock",
      },
      paid: {
        label: "مدفوع",
        color: "#10b981",
        bgColor: "#d1fae5",
        icon: "check-circle",
      },
      cancelled: {
        label: "ملغي",
        color: "#6b7280",
        bgColor: "#f3f4f6",
        icon: "x-circle",
      },
      failed: {
        label: "فشل",
        color: "#ef4444",
        bgColor: "#fee2e2",
        icon: "alert-circle",
      },
    };

    return statusMap[status] || statusMap.scheduled;
  };

  // Check if scheduled date is past
  const isOverdue = (scheduledDate, status) => {
    if (status !== "scheduled") return false;
    // Compare date only (midnight to midnight)
    const todayMidnight = new Date();
    todayMidnight.setHours(0, 0, 0, 0);
    return scheduledDate < todayMidnight.getTime();
  };

  // Handle cancel scheduled bill
  const handleCancelSchedule = (scheduledBill) => {
    Alert.alert(
      "إلغاء الجدولة",
      `هل أنت متأكد من رغبتك في إلغاء جدولة دفع فاتورة ${scheduledBill.serviceName}؟`,
      [
        { text: "لا", style: "cancel" },
        {
          text: "نعم، إلغاء",
          style: "destructive",
          onPress: async () => {
            try {
              await cancelScheduledBill(userId, scheduledBill.id);
              Alert.alert("نجح", "تم إلغاء الجدولة بنجاح");
              await fetchScheduledBills();
            } catch (error) {
              console.error("Error cancelling scheduled bill:", error);
              Alert.alert("خطأ", "حدث خطأ أثناء إلغاء الجدولة");
            }
          },
        },
      ]
    );
  };

  // Handle pay now (process scheduled bill immediately)
  const handlePayNow = (scheduledBill) => {
    Alert.alert(
      "تنفيذ الدفع الآن",
      `هل تريد تنفيذ دفع فاتورة ${scheduledBill.serviceName} الآن؟`,
      [
        { text: "لا", style: "cancel" },
        {
          text: "نعم، الدفع",
          onPress: async () => {
            try {
              const result = await processScheduledBill(userId, scheduledBill.id);

              if (result.success) {
                Alert.alert(
                  "نجح الدفع",
                  "تم دفع الفاتورة بنجاح",
                  [
                    {
                      text: "حسناً",
                      onPress: () => fetchScheduledBills(),
                    },
                  ]
                );
              } else {
                Alert.alert(
                  "فشل الدفع",
                  result.error || "حدث خطأ أثناء معالجة الدفع"
                );
              }
            } catch (error) {
              console.error("Error processing scheduled bill:", error);
              Alert.alert("خطأ", "حدث خطأ أثناء معالجة الدفع");
            }
          },
        },
      ]
    );
  };

  // Render filter buttons
  const renderFilters = () => {
    const filters = [
      { key: "all", label: "الكل" },
      { key: "scheduled", label: "مجدول" },
      { key: "paid", label: "مدفوع" },
      { key: "cancelled", label: "ملغي" },
    ];

    return (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="px-5 mb-4"
      >
        <View className="flex-row gap-2">
          {filters.map((filter) => (
            <TouchableOpacity
              key={filter.key}
              onPress={() => handleFilterChange(filter.key)}
              className="px-4 py-2 rounded-full"
              style={{
                backgroundColor:
                  selectedFilter === filter.key ? primaryColor : "#f3f4f6",
              }}
            >
              <Text
                className="text-sm font-semibold"
                style={{
                  color: selectedFilter === filter.key ? "#ffffff" : "#6b7280",
                }}
              >
                {filter.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    );
  };

  // Render stats card
  const renderStatsCard = () => {
    if (!stats) return null;

    return (
      <View className="mx-5 mb-4 bg-white rounded-2xl p-4 shadow-sm">
        <Text className="text-gray-800 text-base font-bold mb-3">
          ملخص الجدولة
        </Text>

        <View className="flex-row justify-between mb-2">
          <Text className="text-gray-600 text-sm">المجدول</Text>
          <View className="flex-row items-center gap-1">
            <Text className="text-gray-800 text-sm font-semibold">
              {stats.totalScheduled}
            </Text>
            <Text className="text-gray-500 text-xs">
              ({stats.totalScheduledAmount.toFixed(2)} ريال)
            </Text>
          </View>
        </View>

        <View className="flex-row justify-between mb-2">
          <Text className="text-gray-600 text-sm">المدفوع</Text>
          <View className="flex-row items-center gap-1">
            <Text className="text-gray-800 text-sm font-semibold">
              {stats.totalPaid}
            </Text>
            <Text className="text-gray-500 text-xs">
              ({stats.totalPaidAmount.toFixed(2)} ريال)
            </Text>
          </View>
        </View>

        <View className="flex-row justify-between">
          <Text className="text-gray-600 text-sm">الملغي</Text>
          <Text className="text-gray-800 text-sm font-semibold">
            {stats.totalCancelled}
          </Text>
        </View>

        {stats.overdueCount > 0 && (
          <View className="mt-3 pt-3 border-t border-gray-200">
            <View className="flex-row items-center gap-2">
              <Feather name="alert-circle" size={16} color="#ef4444" />
              <Text className="text-red-500 text-sm font-semibold">
                {stats.overdueCount} جدولة متأخرة
              </Text>
            </View>
          </View>
        )}
      </View>
    );
  };

  // Render scheduled bill card
  const renderScheduledBillCard = (scheduledBill) => {
    const statusInfo = getStatusInfo(scheduledBill.status);
    const overdue = isOverdue(scheduledBill.scheduledDate, scheduledBill.status);

    return (
      <View
        key={scheduledBill.id}
        className="mx-5 mb-3 bg-white rounded-2xl p-4 shadow-sm"
      >
        {/* Header */}
        <View className="flex-row justify-between items-start mb-3">
          <View className="flex-1">
            <Text className="text-gray-800 text-base font-bold mb-1">
              {scheduledBill.serviceName}
            </Text>
            <Text className="text-gray-500 text-xs">
              {scheduledBill.ministryName?.ar}
            </Text>
          </View>

          <View
            className="px-3 py-1 rounded-full flex-row items-center gap-1"
            style={{ backgroundColor: statusInfo.bgColor }}
          >
            <Feather name={statusInfo.icon} size={12} color={statusInfo.color} />
            <Text className="text-xs font-semibold" style={{ color: statusInfo.color }}>
              {statusInfo.label}
            </Text>
          </View>
        </View>

        {/* Divider */}
        <View className="h-px bg-gray-200 mb-3" />

        {/* Details */}
        <View className="gap-2 mb-3">
          <View className="flex-row justify-between">
            <Text className="text-gray-600 text-sm">رقم المرجع</Text>
            <Text className="text-gray-800 text-sm font-medium">
              {scheduledBill.billReferenceNumber}
            </Text>
          </View>

          <View className="flex-row justify-between">
            <Text className="text-gray-600 text-sm">المبلغ</Text>
            <Text className="text-gray-800 text-sm font-semibold">
              {scheduledBill.scheduledAmount.toFixed(2)} ريال
            </Text>
          </View>

          <View className="flex-row justify-between">
            <Text className="text-gray-600 text-sm">تاريخ الجدولة</Text>
            <Text className="text-gray-800 text-sm font-medium">
              {formatDate(scheduledBill.scheduledDate)}
            </Text>
          </View>

          {scheduledBill.completedAt && (
            <View className="flex-row justify-between">
              <Text className="text-gray-600 text-sm">تاريخ التنفيذ</Text>
              <Text className="text-gray-800 text-sm font-medium">
                {formatDate(scheduledBill.completedAt)}
              </Text>
            </View>
          )}
        </View>

        {/* Overdue warning */}
        {overdue && (
          <View className="bg-red-50 rounded-xl p-3 mb-3 flex-row items-center gap-2">
            <Feather name="alert-circle" size={16} color="#ef4444" />
            <Text className="text-red-600 text-xs flex-1">
              تأخر موعد الدفع المجدول. يمكنك تنفيذه الآن أو إلغائه.
            </Text>
          </View>
        )}

        {/* Action buttons for scheduled bills */}
        {scheduledBill.status === "scheduled" && (
          <View className="flex-row gap-2">
            <TouchableOpacity
              onPress={() => handlePayNow(scheduledBill)}
              className="flex-1 py-2 rounded-xl"
              style={{ backgroundColor: primaryColor }}
            >
              <Text className="text-white text-sm font-semibold text-center">
                دفع الآن
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => handleCancelSchedule(scheduledBill)}
              className="flex-1 py-2 rounded-xl border border-gray-300"
            >
              <Text className="text-gray-700 text-sm font-semibold text-center">
                إلغاء الجدولة
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  // Render empty state
  const renderEmptyState = () => {
    const emptyMessages = {
      all: "لا توجد فواتير مجدولة",
      scheduled: "لا توجد فواتير مجدولة حالياً",
      paid: "لا توجد فواتير مدفوعة",
      cancelled: "لا توجد فواتير ملغية",
    };

    return (
      <View className="flex-1 items-center justify-center px-5 py-20">
        <View
          className="w-20 h-20 rounded-full items-center justify-center mb-4"
          style={{ backgroundColor: `${primaryColor}15` }}
        >
          <Feather name="calendar" size={32} color={primaryColor} />
        </View>
        <Text className="text-gray-800 text-lg font-bold mb-2">
          {emptyMessages[selectedFilter]}
        </Text>
        <Text className="text-gray-500 text-sm text-center">
          يمكنك جدولة دفع الفواتير من صفحة تفاصيل الفاتورة
        </Text>
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <View className="flex-1 items-center justify-center">
          <Text className="text-gray-600">جاري التحميل...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50" style={{ direction: "rtl" }}>
      {/* Header */}
      <View className="bg-white px-5 py-4 border-b border-gray-200">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-3">
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Feather name="arrow-right" size={24} color="#1f2937" />
            </TouchableOpacity>
            <Text className="text-gray-800 text-xl font-bold">
              الفواتير المجدولة
            </Text>
          </View>

          <TouchableOpacity onPress={onRefresh}>
            <Feather name="refresh-cw" size={20} color={primaryColor} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Stats Card */}
        {renderStatsCard()}

        {/* Filter Buttons */}
        {renderFilters()}

        {/* Scheduled Bills List */}
        {filteredBills.length > 0 ? (
          <View className="pb-5">
            {filteredBills.map((bill) => renderScheduledBillCard(bill))}
          </View>
        ) : (
          renderEmptyState()
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default ScheduledBillsScreen;
