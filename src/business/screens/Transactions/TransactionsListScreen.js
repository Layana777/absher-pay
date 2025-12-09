import { useState, useEffect, useMemo, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Modal,
  ActivityIndicator,
} from "react-native";
import { Feather } from "@expo/vector-icons";

// Components
import CustomHeader from "../../../common/components/CustomHeader";
import SvgIcons from "../../../common/components/SvgIcons";
import MonthPeriodPicker from "../../components/MonthPeriodPicker";

// Services
import {
  getWalletTransactions,
  searchTransactions,
} from "../../../common/services/transactionService";

// Redux Hooks
import { useBusinessWallet } from "../../../store/hooks";
import Svg from "react-native-svg";

// Constants
const ITEMS_PER_PAGE = 50;

// ==================== HELPER FUNCTIONS ====================

/**
 * Debounce utility function
 */
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Get icon configuration based on transaction type
 */
const getIconConfig = (type) => {
  const configs = {
    top_up: { icon: "arrow-down-circle", color: "#10B981", bgColor: "#D1FAE5" },
    payment: { icon: "credit-card", color: "#EF4444", bgColor: "#FEE2E2" },
    refund: { icon: "rotate-ccw", color: "#10B981", bgColor: "#D1FAE5" },
    transfer_in: {
      icon: "arrow-down-left",
      color: "#10B981",
      bgColor: "#D1FAE5",
    },
    transfer_out: {
      icon: "arrow-up-right",
      color: "#EF4444",
      bgColor: "#FEE2E2",
    },
    withdrawal: {
      icon: "arrow-up-circle",
      color: "#EF4444",
      bgColor: "#FEE2E2",
    },
    cashback: { icon: "gift", color: "#10B981", bgColor: "#D1FAE5" },
    bonus: { icon: "award", color: "#10B981", bgColor: "#D1FAE5" },
    penalty: { icon: "alert-circle", color: "#EF4444", bgColor: "#FEE2E2" },
    fee: { icon: "percent", color: "#F59E0B", bgColor: "#FEF3C7" },
    adjustment: { icon: "settings", color: "#6B7280", bgColor: "#F3F4F6" },
    reversal: { icon: "rotate-cw", color: "#EF4444", bgColor: "#FEE2E2" },
    default: { icon: "file-text", color: "#0055aa", bgColor: "#DBEAFE" },
  };

  return configs[type] || configs.default;
};

/**
 * Format time for display (e.g., "3:00 PM")
 */
const formatTime = (timestamp) => {
  if (!timestamp) return "";

  const date = new Date(timestamp);
  const hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";
  const displayHours = (hours % 12 || 12).toString().padStart(2, "0");

  return `${displayHours}:${minutes} ${ampm}`;
};

// ==================== TRANSACTION CARD COMPONENT ====================

const TransactionCard = ({ transaction, onPress, isLast }) => {
  const isPositive = transaction.amount > 0;
  const iconConfig = getIconConfig(transaction.type);

  return (
    <TouchableOpacity
      className={`px-6 py-4 bg-white ${
        !isLast ? "border-b border-gray-100" : ""
      }`}
      onPress={onPress}
      activeOpacity={0.7}
      style={{ direction: "rtl" }}
    >
      <View className="flex-row items-center justify-between">
        {/* Right side: Icon + Text */}
        <View className="flex-row items-center flex-1">
          <View
            className="w-12 h-12 rounded-xl items-center justify-center"
            style={{ backgroundColor: iconConfig.bgColor }}
          >
            <Feather
              name={iconConfig.icon}
              size={24}
              color={iconConfig.color}
            />
          </View>

          <View className="flex-1 mx-3">
            <Text className="text-gray-900 font-semibold text-base text-left">
              {transaction.descriptionAr}
            </Text>
            <Text className="text-gray-500 text-sm text-left mt-1">
              {transaction.descriptionEn || ""}
            </Text>
            <Text className="text-gray-400 text-xs text-left mt-1">
              {formatTime(transaction.timestamp)}
            </Text>
          </View>
        </View>

        {/* Left side: Amount */}
        <View className="items-end ml-2">
          <View className="flex-row items-center" style={{ direction: "ltr" }}>
            <View className="mx-1">
              {isPositive ? (
                <SvgIcons name={"SARTGreen"} size={16} />
              ) : (
                <SvgIcons name={"SARTred"} size={16} />
              )}
            </View>
            <Text
              className={`text-lg font-bold ${
                isPositive ? "text-green-500" : "text-red-500"
              }`}
            >
              {isPositive ? "+" : "-"}
              {Math.abs(transaction.amount).toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

// ==================== FILTER MODAL COMPONENT ====================

const FilterModal = ({ visible, onClose, currentFilters, onApply }) => {
  const [localFilters, setLocalFilters] = useState(currentFilters);
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Transaction type options
  const transactionTypes = [
    { key: null, label: "الكل" },
    { key: "top_up", label: "إيداع" },
    { key: "payment", label: "دفع" },
    { key: "refund", label: "استرجاع" },
    { key: "transfer_in", label: "تحويل وارد" },
    { key: "transfer_out", label: "تحويل صادر" },
    { key: "withdrawal", label: "سحب" },
    { key: "cashback", label: "استرجاع نقدي" },
    { key: "bonus", label: "مكافأة" },
    { key: "penalty", label: "غرامة" },
    { key: "fee", label: "رسوم" },
  ];

  // Status options
  const statuses = [
    { key: null, label: "الكل" },
    { key: "completed", label: "مكتملة" },
    { key: "pending", label: "قيد الانتظار" },
    { key: "failed", label: "فاشلة" },
    { key: "cancelled", label: "ملغاة" },
  ];

  // Update local filters when modal opens
  useEffect(() => {
    if (visible) {
      setLocalFilters(currentFilters);
    }
  }, [visible, currentFilters]);

  const handleClearFilters = () => {
    setLocalFilters({
      type: null,
      status: null,
      dateRange: { startDate: null, endDate: null },
      amountRange: { min: null, max: null },
    });
  };

  const handleApply = () => {
    onApply(localFilters);
    onClose();
  };

  const formatDateRange = () => {
    const { startDate, endDate } = localFilters.dateRange;
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      return `${start.toLocaleDateString("ar-SA", {
        month: "long",
        year: "numeric",
      })} - ${end.toLocaleDateString("ar-SA", {
        month: "long",
        year: "numeric",
      })}`;
    }
    return "اختر الفترة";
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-end bg-black/50">
        <View className="bg-white rounded-t-3xl" style={{ height: "90%" }}>
          {/* Header */}
          <View className="px-6 py-4 border-b border-gray-200 flex-row items-center justify-between">
            <TouchableOpacity onPress={onClose}>
              <Feather name="x" size={24} color="#6b7280" />
            </TouchableOpacity>
            <Text className="text-lg font-bold text-gray-900">
              تصفية المعاملات
            </Text>
            <View style={{ width: 24 }} />
          </View>

          <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
            {/* Transaction Type Filter */}
            <View className="px-6 py-4 border-b border-gray-100">
              <Text className="text-gray-900 font-semibold text-base mb-3 text-right">
                نوع المعاملة
              </Text>
              <View
                className="flex-row flex-wrap gap-2"
                style={{ direction: "rtl" }}
              >
                {transactionTypes.map((type) => (
                  <TouchableOpacity
                    key={type.key || "all"}
                    onPress={() =>
                      setLocalFilters({
                        ...localFilters,
                        type: type.key,
                      })
                    }
                    className={`px-4 py-2 rounded-lg ${
                      localFilters.type === type.key
                        ? "bg-[#0055aa]"
                        : "bg-gray-100"
                    }`}
                  >
                    <Text
                      className={`text-sm font-medium ${
                        localFilters.type === type.key
                          ? "text-white"
                          : "text-gray-700"
                      }`}
                    >
                      {type.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Status Filter */}
            <View className="px-6 py-4 border-b border-gray-100">
              <Text className="text-gray-900 font-semibold text-base mb-3 text-right">
                الحالة
              </Text>
              <View
                className="flex-row flex-wrap gap-2"
                style={{ direction: "rtl" }}
              >
                {statuses.map((status) => (
                  <TouchableOpacity
                    key={status.key || "all"}
                    onPress={() =>
                      setLocalFilters({
                        ...localFilters,
                        status: status.key,
                      })
                    }
                    className={`px-4 py-2 rounded-lg ${
                      localFilters.status === status.key
                        ? "bg-[#0055aa]"
                        : "bg-gray-100"
                    }`}
                  >
                    <Text
                      className={`text-sm font-medium ${
                        localFilters.status === status.key
                          ? "text-white"
                          : "text-gray-700"
                      }`}
                    >
                      {status.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Date Range Filter */}
            <View className="px-6 py-4 border-b border-gray-100">
              <Text className="text-gray-900 font-semibold text-base mb-3 text-right">
                الفترة الزمنية
              </Text>
              <TouchableOpacity
                className="bg-gray-50 rounded-xl px-4 py-3 flex-row items-center justify-between"
                onPress={() => setShowDatePicker(true)}
              >
                <Feather name="calendar" size={20} color="#6b7280" />
                <Text className="flex-1 text-gray-700 text-right mr-3">
                  {formatDateRange()}
                </Text>
                <Feather name="chevron-left" size={20} color="#6b7280" />
              </TouchableOpacity>
            </View>

            {/* Amount Range Filter */}
            <View className="px-6 py-4">
              <Text className="text-gray-900 font-semibold text-base mb-3 text-right">
                نطاق المبلغ
              </Text>
              <View className="flex-row gap-3" style={{ direction: "rtl" }}>
                <View className="flex-1">
                  <TextInput
                    className="bg-gray-50 rounded-xl px-4 py-3 text-gray-900 text-right"
                    placeholder="من"
                    placeholderTextColor="#9ca3af"
                    keyboardType="numeric"
                    value={localFilters.amountRange.min?.toString() || ""}
                    onChangeText={(text) => {
                      const value = text ? parseFloat(text) : null;
                      setLocalFilters({
                        ...localFilters,
                        amountRange: {
                          ...localFilters.amountRange,
                          min: value,
                        },
                      });
                    }}
                    style={{ direction: "rtl" }}
                  />
                </View>
                <View className="flex-1">
                  <TextInput
                    className="bg-gray-50 rounded-xl px-4 py-3 text-gray-900 text-right"
                    placeholder="إلى"
                    placeholderTextColor="#9ca3af"
                    keyboardType="numeric"
                    value={localFilters.amountRange.max?.toString() || ""}
                    onChangeText={(text) => {
                      const value = text ? parseFloat(text) : null;
                      setLocalFilters({
                        ...localFilters,
                        amountRange: {
                          ...localFilters.amountRange,
                          max: value,
                        },
                      });
                    }}
                    style={{ direction: "rtl" }}
                  />
                </View>
              </View>
            </View>
          </ScrollView>

          {/* Footer Buttons */}
          <View className="px-6 py-4 border-t border-gray-200 flex-row gap-3">
            <TouchableOpacity
              onPress={handleClearFilters}
              className="flex-1 py-3 rounded-xl bg-gray-100"
            >
              <Text className="text-gray-700 text-center font-semibold">
                مسح الفلاتر
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleApply}
              className="flex-1 py-3 rounded-xl bg-[#0055aa]"
            >
              <Text className="text-white text-center font-semibold">
                تطبيق
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* MonthPeriodPicker for date range */}
      <MonthPeriodPicker
        visible={showDatePicker}
        onClose={() => setShowDatePicker(false)}
        onSelect={(range) => {
          // Convert month/year to timestamps
          const startDate = new Date(
            range.startYear,
            range.startMonth,
            1
          ).getTime();
          const endDate = new Date(
            range.endYear,
            range.endMonth + 1,
            0,
            23,
            59,
            59
          ).getTime();

          setLocalFilters({
            ...localFilters,
            dateRange: { startDate, endDate },
          });
          setShowDatePicker(false);
        }}
      />
    </Modal>
  );
};

// ==================== MAIN SCREEN COMPONENT ====================

const TransactionsListScreen = ({ navigation }) => {
  // Redux
  const businessWallet = useBusinessWallet();
  const walletId = businessWallet?.id;

  // Data states
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState(null);

  // Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [filters, setFilters] = useState({
    type: null,
    status: null,
    dateRange: { startDate: null, endDate: null },
    amountRange: { min: null, max: null },
  });

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);

  // ==================== DATA FETCHING ====================

  /**
   * Load initial transactions
   */
  const loadInitialTransactions = async () => {
    if (!walletId) {
      console.log("No walletId available");
      return;
    }

    console.log("Loading transactions for wallet:", walletId);
    setLoading(true);
    setError(null);

    try {
      const result = await getWalletTransactions(walletId, {
        limit: ITEMS_PER_PAGE,
      });

      console.log("Transactions result:", result);

      if (result.success) {
        console.log("Loaded transactions:", result.data?.length || 0);
        setTransactions(result.data || []);
        setHasMore(result.data?.length === ITEMS_PER_PAGE);
        setCurrentPage(1);
      } else {
        console.error("Failed to load transactions:", result.error);
        setError(result.error || "فشل تحميل المعاملات");
      }
    } catch (err) {
      console.error("Transaction fetch error:", err);
      setError("حدث خطأ أثناء تحميل المعاملات");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Load more transactions
   */
  const loadMoreTransactions = async () => {
    if (!walletId || loadingMore || !hasMore) return;

    setLoadingMore(true);

    try {
      const result = await getWalletTransactions(walletId, {
        limit: ITEMS_PER_PAGE * (currentPage + 1),
      });

      if (result.success) {
        setTransactions(result.data || []);
        setHasMore(result.data?.length === ITEMS_PER_PAGE * (currentPage + 1));
        setCurrentPage(currentPage + 1);
      }
    } catch (err) {
      console.error("Load more error:", err);
    } finally {
      setLoadingMore(false);
    }
  };

  // ==================== FILTERING & SEARCH ====================

  /**
   * Apply filters to transactions
   */
  const applyFilters = useCallback(
    (transactionsToFilter) => {
      let filtered = [...transactionsToFilter];

      // Apply type filter
      if (filters.type) {
        filtered = filtered.filter((t) => t.type === filters.type);
      }

      // Apply status filter
      if (filters.status) {
        filtered = filtered.filter((t) => t.status === filters.status);
      }

      // Apply date range filter
      if (filters.dateRange.startDate) {
        filtered = filtered.filter(
          (t) => t.timestamp >= filters.dateRange.startDate
        );
      }
      if (filters.dateRange.endDate) {
        filtered = filtered.filter(
          (t) => t.timestamp <= filters.dateRange.endDate
        );
      }

      // Apply amount range filter
      if (filters.amountRange.min !== null) {
        filtered = filtered.filter(
          (t) => Math.abs(t.amount) >= filters.amountRange.min
        );
      }
      if (filters.amountRange.max !== null) {
        filtered = filtered.filter(
          (t) => Math.abs(t.amount) <= filters.amountRange.max
        );
      }

      return filtered;
    },
    [filters]
  );

  /**
   * Check if transaction matches search query
   */
  const matchesSearch = (transaction, query) => {
    const lowerQuery = query.toLowerCase();
    return (
      transaction.descriptionAr?.includes(query) ||
      transaction.descriptionEn?.toLowerCase().includes(lowerQuery) ||
      transaction.referenceNumber?.toLowerCase().includes(lowerQuery)
    );
  };

  /**
   * Debounced search function
   */
  const performSearch = useCallback(
    debounce(async (query) => {
      if (!walletId) return;

      if (!query.trim()) {
        // Reset to showing all transactions
        return;
      }

      try {
        const result = await searchTransactions(walletId, query, 500);
        if (result.success) {
          setTransactions(result.data || []);
        }
      } catch (err) {
        console.error("Search error:", err);
      }
    }, 500),
    [walletId]
  );

  // ==================== DATE GROUPING ====================

  /**
   * Group transactions by date
   */
  const groupByDate = useCallback((transactionsList) => {
    if (!transactionsList || transactionsList.length === 0) {
      return [];
    }

    // Group by date
    const grouped = transactionsList.reduce((groups, transaction) => {
      const date = new Date(transaction.timestamp);
      // Format as DD/MM/YYYY
      const dateKey = `${date.getDate().toString().padStart(2, "0")}/${(
        date.getMonth() + 1
      )
        .toString()
        .padStart(2, "0")}/${date.getFullYear()}`;

      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(transaction);
      return groups;
    }, {});

    // Convert to array format for FlatList
    return Object.keys(grouped)
      .map((dateKey) => ({
        dateKey,
        timestamp: grouped[dateKey][0].timestamp, // For sorting
        transactions: grouped[dateKey],
      }))
      .sort((a, b) => b.timestamp - a.timestamp); // Newest first
  }, []);

  /**
   * Get filtered and grouped transactions
   */
  const groupedTransactions = useMemo(() => {
    console.log("Computing grouped transactions, total:", transactions.length);
    let filtered = applyFilters(transactions);
    console.log("After filters:", filtered.length);

    // Apply search if query exists
    if (searchQuery.trim()) {
      filtered = filtered.filter((t) => matchesSearch(t, searchQuery));
      console.log("After search:", filtered.length);
    }

    const grouped = groupByDate(filtered);
    console.log("Grouped into", grouped.length, "date groups");
    return grouped;
  }, [transactions, filters, searchQuery, applyFilters, groupByDate]);

  // ==================== EVENT HANDLERS ====================

  /**
   * Handle transaction press
   */
  const handleTransactionPress = (transaction) => {
    navigation.navigate("TransactionDetails", {
      transaction: transaction,
    });
  };

  /**
   * Handle search query change
   */
  const handleSearchChange = (text) => {
    setSearchQuery(text);
    performSearch(text);
  };

  /**
   * Handle retry on error
   */
  const handleRetry = () => {
    setError(null);
    loadInitialTransactions();
  };

  // ==================== EFFECTS ====================

  // Initial load
  useEffect(() => {
    if (walletId) {
      loadInitialTransactions();
    }
  }, [walletId]);

  // ==================== RENDER HELPERS ====================

  /**
   * Render empty state
   */
  const renderEmptyState = () => {
    if (loading) return null;

    if (searchQuery.trim()) {
      return (
        <View className="flex-1 items-center justify-center py-16">
          <Feather name="search" size={64} color="#d1d5db" />
          <Text className="text-gray-400 text-lg mt-4 text-center">
            لا توجد نتائج
          </Text>
          <Text className="text-gray-400 text-sm mt-2 text-center">
            جرب البحث بكلمات أخرى
          </Text>
        </View>
      );
    }

    return (
      <View className="flex-1 items-center justify-center py-16">
        <Feather name="inbox" size={64} color="#d1d5db" />
        <Text className="text-gray-400 text-lg mt-4 text-center">
          لا توجد معاملات
        </Text>
        <Text className="text-gray-400 text-sm mt-2 text-center">
          ستظهر جميع معاملاتك هنا
        </Text>
      </View>
    );
  };

  /**
   * Render load more button
   */
  const renderLoadMoreButton = () => {
    if (!hasMore || groupedTransactions.length === 0) return null;

    return (
      <TouchableOpacity
        className="mx-6 my-4 py-4 bg-white border border-gray-200 rounded-xl"
        onPress={loadMoreTransactions}
        disabled={loadingMore}
      >
        {loadingMore ? (
          <ActivityIndicator size="small" color="#0055aa" />
        ) : (
          <Text className="text-[#0055aa] text-center font-semibold">
            تحميل المزيد
          </Text>
        )}
      </TouchableOpacity>
    );
  };

  /**
   * Render list item (date group with transactions)
   */
  const renderItem = ({ item }) => {
    return (
      <>
        {/* Date Header */}
        <View className="px-6 py-3 bg-gray-50">
          <Text className="text-gray-600 text-sm font-semibold text-right">
            {item.dateKey}
          </Text>
        </View>

        {/* Transactions for this date */}
        {item.transactions.map((transaction, index) => (
          <TransactionCard
            key={transaction.id}
            transaction={transaction}
            onPress={() => handleTransactionPress(transaction)}
            isLast={index === item.transactions.length - 1}
          />
        ))}
      </>
    );
  };

  // ==================== MAIN RENDER ====================

  // Loading state
  if (loading && transactions.length === 0) {
    return (
      <View className="flex-1 bg-gray-50" style={{ direction: "ltr" }}>
        <CustomHeader
          title="سجل المعاملات"
          showBackButton={false}
          backgroundColor="#0055aa"
          textColor="#FFFFFF"
          statusBarStyle="light-content"
          statusBarBackgroundColor="#0055aa"
        />
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#0055aa" />
          <Text className="text-gray-500 text-sm mt-4">
            جاري تحميل المعاملات...
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50" style={{ direction: "ltr" }}>
      <CustomHeader
        title="سجل المعاملات"
        showBackButton={false}
        backgroundColor="#0055aa"
        textColor="#FFFFFF"
        statusBarStyle="light-content"
        statusBarBackgroundColor="#0055aa"
      />

      {/* Search Bar */}
      <View className="px-6 pt-4 pb-2 bg-white">
        <View className="flex-row items-center bg-gray-50 rounded-xl px-4 py-3">
          <Feather name="search" size={20} color="#9ca3af" />
          <TextInput
            className="flex-1 mx-2 text-gray-900 text-right"
            placeholder="البحث في المعاملات"
            placeholderTextColor="#9ca3af"
            value={searchQuery}
            onChangeText={handleSearchChange}
            style={{ direction: "rtl" }}
          />
          <TouchableOpacity onPress={() => setShowFilterModal(true)}>
            <Feather name="filter" size={20} color="#0055aa" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Error State */}
      {error && (
        <View className="bg-red-50 mx-6 my-4 p-4 rounded-xl">
          <Text className="text-red-600 text-center">{error}</Text>
          <TouchableOpacity className="mt-2" onPress={handleRetry}>
            <Text className="text-red-600 text-center font-semibold">
              إعادة المحاولة
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Transactions List */}
      <FlatList
        data={groupedTransactions}
        keyExtractor={(item) => item.dateKey}
        renderItem={renderItem}
        ListEmptyComponent={renderEmptyState}
        ListFooterComponent={renderLoadMoreButton}
        contentContainerStyle={{ paddingBottom: 20 }}
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        windowSize={5}
      />

      {/* Filter Modal */}
      <FilterModal
        visible={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        currentFilters={filters}
        onApply={setFilters}
      />
    </View>
  );
};

export default TransactionsListScreen;
