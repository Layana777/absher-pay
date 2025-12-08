import { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";

// Components
import CustomHeader from "../../../common/components/CustomHeader";
import SvgIcons from "../../../common/components/SvgIcons";
import { generateTransactionPDF } from "../../../common/services/PDFService";

// Constants
const PRIMARY_COLOR = "#0055aa";

// ==================== HELPER FUNCTIONS ====================

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
 * Get Arabic label for transaction type
 */
const getTypeLabel = (type) => {
  const labels = {
    top_up: "إيداع رصيد",
    payment: "دفع للخدمات",
    refund: "استرجاع مبلغ",
    transfer_in: "تحويل وارد",
    transfer_out: "تحويل صادر",
    withdrawal: "سحب رصيد",
    adjustment: "تعديل إداري",
    cashback: "استرجاع نقدي",
    bonus: "مكافأة",
    penalty: "غرامة",
    reversal: "عكس معاملة",
    fee: "رسوم",
  };
  return labels[type] || type;
};

/**
 * Get Arabic label for transaction status
 */
const getStatusLabel = (status) => {
  const labels = {
    completed: "مكتملة",
    pending: "قيد الانتظار",
    failed: "فاشلة",
    cancelled: "ملغاة",
  };
  return labels[status] || status;
};

/**
 * Get transaction category label
 */
const getTransactionCategory = (type) => {
  const categories = {
    top_up: "معاملات الإيداع",
    payment: "معاملات البطاقة",
    transfer_in: "التحويلات الواردة",
    transfer_out: "التحويلات الصادرة",
    withdrawal: "عمليات السحب",
    refund: "عمليات الاسترجاع",
    cashback: "الاسترجاع النقدي",
    bonus: "المكافآت",
    penalty: "الغرامات",
    fee: "الرسوم",
    adjustment: "التعديلات الإدارية",
    reversal: "العمليات المعكوسة",
  };
  return categories[type] || "معاملة عامة";
};

/**
 * Format date for display
 */
const formatDate = (timestamp) => {
  if (!timestamp) return "غير متوفر";

  const date = new Date(timestamp);
  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const year = date.getFullYear();
  const hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";
  const displayHours = (hours % 12 || 12).toString().padStart(2, "0");

  return `${day}/${month}/${year} ${displayHours}:${minutes} ${ampm}`;
};

// ==================== FAQ ITEM COMPONENT ====================

const FAQItem = ({ question, answer }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <View className="mb-4">
      <TouchableOpacity
        className="bg-gray-50 rounded-2xl p-4"
        onPress={() => setIsExpanded(!isExpanded)}
        activeOpacity={0.7}
      >
        <View className="flex-row items-center justify-between">
          <Text className="flex-1 text-gray-900 font-semibold text-sm text-right ml-3">
            {question}
          </Text>
          <Feather
            name={isExpanded ? "chevron-up" : "chevron-down"}
            size={20}
            color="#6B7280"
          />
        </View>
        {isExpanded && (
          <Text className="text-gray-600 text-sm mt-3 text-right leading-6">
            {answer}
          </Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

// ==================== DETAIL ROW COMPONENT ====================

const DetailRow = ({ label, value, icon, showCopy, onCopy }) => {
  return (
    <View className="bg-white rounded-2xl p-4 mb-3 border border-gray-100">
      <View
        className="flex-row items-center justify-between mb-2"
        style={{ direction: "rtl" }}
      >
        <View className="flex-row items-center flex-1">
          <View className="w-8 h-8 rounded-lg items-center justify-center bg-gray-50 mx-2">
            <Feather name={icon} size={16} color="#6B7280" />
          </View>
          <Text className="text-gray-500 text-xs text-right">{label}</Text>
        </View>
        {showCopy && (
          <TouchableOpacity onPress={onCopy} className="p-1">
            <Feather name="copy" size={16} color="#6B7280" />
          </TouchableOpacity>
        )}
      </View>
      <Text className="text-gray-900 font-semibold text-base text-right pr-11">
        {value}
      </Text>
    </View>
  );
};

// ==================== MAIN SCREEN COMPONENT ====================

const TransactionDetailsScreen = ({ navigation, route }) => {
  const { transaction } = route.params || {};
  const [showHelpModal, setShowHelpModal] = useState(false);

  // Check if transaction exists
  useEffect(() => {
    if (!transaction) {
      Alert.alert("خطأ", "لم يتم العثور على بيانات المعاملة", [
        { text: "حسناً", onPress: () => navigation.goBack() },
      ]);
    }
  }, [transaction, navigation]);

  if (!transaction) {
    return null;
  }

  const isPositive = transaction.amount > 0;
  const iconConfig = getIconConfig(transaction.type);

  // ==================== HANDLERS ====================

  /**
   * Handle copy to clipboard
   */
  const handleCopy = async (text) => {
    try {
      await Clipboard.setStringAsync(text);
      Alert.alert("تم النسخ", "تم نسخ المعلومات بنجاح");
    } catch (error) {
      console.error("Copy error:", error);
      Alert.alert("خطأ", "فشل النسخ، يرجى المحاولة مرة أخرى");
    }
  };

  /**
   * Handle PDF button press
   */
  const handlePDFPress = async () => {
    await generateTransactionPDF(transaction);
  };

  /**
   * Handle help button press
   */
  const handleHelpPress = () => {
    setShowHelpModal(true);
  };

  /**
   * Render type-specific fields
   */
  const renderTypeSpecificFields = () => {
    switch (transaction.type) {
      case "transfer_out":
        return (
          <>
            {transaction.toUserName && (
              <DetailRow
                label="المستلم"
                value={transaction.toUserName}
                icon="user"
              />
            )}
            {transaction.transferNote && (
              <DetailRow
                label="ملاحظة"
                value={transaction.transferNote}
                icon="message-circle"
              />
            )}
          </>
        );

      case "transfer_in":
        return (
          <>
            {transaction.fromUserName && (
              <DetailRow
                label="المرسل"
                value={transaction.fromUserName}
                icon="user"
              />
            )}
          </>
        );

      case "withdrawal":
        return (
          <>
            {transaction.withdrawalDetails?.bankName && (
              <DetailRow
                label="البنك"
                value={transaction.withdrawalDetails.bankName}
                icon="credit-card"
              />
            )}
            {transaction.withdrawalDetails?.accountNumber && (
              <DetailRow
                label="رقم الحساب"
                value={transaction.withdrawalDetails.accountNumber}
                icon="hash"
              />
            )}
          </>
        );

      case "top_up":
        return (
          <>
            {transaction.paymentDetails?.paymentMethod && (
              <DetailRow
                label="طريقة الدفع"
                value={transaction.paymentDetails.paymentMethod}
                icon="credit-card"
              />
            )}
            {transaction.paymentDetails?.lastFourDigits && (
              <DetailRow
                label="آخر 4 أرقام"
                value={`**** ${transaction.paymentDetails.lastFourDigits}`}
                icon="lock"
              />
            )}
          </>
        );

      default:
        return null;
    }
  };

  // ==================== RENDER ====================

  return (
    <>
      <CustomHeader
        title="تفاصيل المعاملة"
        onBack={() => navigation.goBack()}
        showBackButton={true}
        backgroundColor={PRIMARY_COLOR}
        textColor="#FFFFFF"
        statusBarStyle="light-content"
        statusBarBackgroundColor={PRIMARY_COLOR}
      />
      <View className="flex-1 bg-gray-50" style={{ direction: "ltr" }}>
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          {/* Icon Section */}
          <View className="items-center pt-6 pb-4">
            <View
              className="w-20 h-20 rounded-full items-center justify-center"
              style={{ backgroundColor: "#E0F2FE" }}
            >
              <Feather
                name={iconConfig.icon}
                size={32}
                color={iconConfig.color}
              />
            </View>
          </View>

          {/* Title Section */}
          <View className="items-center px-6 mb-4">
            <Text className="text-gray-900 text-2xl font-bold text-center mb-1">
              {transaction.descriptionAr || "معاملة"}
            </Text>
            <Text className="text-gray-500 text-sm text-center">
              {getTransactionCategory(transaction.type)}
            </Text>
          </View>

          {/* Amount Display */}
          <View className="items-center mb-4">
            <View className="flex-row items-center">
              {isPositive ? (
                <SvgIcons name={"SARTGreen"} size={35} />
              ) : (
                <SvgIcons name={"SARTred"} size={35} />
              )}
              :
              <Text
                className={`text-4xl font-bold mx-1 ${
                  isPositive ? "text-green-500" : "text-red-500"
                }`}
              >
                {isPositive ? "+" : "-"}
                {Math.abs(transaction.amount).toFixed(2)}
              </Text>
            </View>
          </View>

          {/* Status Badge */}
          <View className="items-center mb-6">
            <View
              className={`px-6 py-2 rounded-full ${
                transaction.status === "completed"
                  ? "bg-green-100"
                  : transaction.status === "pending"
                  ? "bg-yellow-100"
                  : transaction.status === "failed"
                  ? "bg-red-100"
                  : "bg-gray-100"
              }`}
            >
              <Text
                className={`text-sm font-semibold ${
                  transaction.status === "completed"
                    ? "text-green-700"
                    : transaction.status === "pending"
                    ? "text-yellow-700"
                    : transaction.status === "failed"
                    ? "text-red-700"
                    : "text-gray-700"
                }`}
              >
                {getStatusLabel(transaction.status)}
              </Text>
            </View>
          </View>

          {/* Quick Action Buttons */}
          <View className="flex-row px-6 gap-4 mb-6">
            {/* PDF Button */}
            <TouchableOpacity
              className="flex-1 bg-white rounded-2xl p-4 border border-gray-200 flex-row items-center justify-center"
              onPress={handlePDFPress}
              activeOpacity={0.7}
            >
              <Feather name="file-text" size={20} color="#6B7280" />
              <Text className="text-gray-700 text-sm font-semibold mx-2">
                PDF
              </Text>
            </TouchableOpacity>

            {/* Help Button */}
            <TouchableOpacity
              className="flex-1 bg-white rounded-2xl p-4 border border-gray-200 flex-row items-center justify-center"
              onPress={handleHelpPress}
              activeOpacity={0.7}
            >
              <Feather name="help-circle" size={20} color="#6B7280" />
              <Text className="text-gray-700 text-sm font-semibold mx-2">
                مساعدة
              </Text>
            </TouchableOpacity>
          </View>

          {/* Details Section */}
          <View className="px-6 pb-6">
            {/* Date */}
            <DetailRow
              label="التاريخ"
              value={formatDate(transaction.timestamp)}
              icon="calendar"
            />

            {/* Transaction ID with copy */}
            <DetailRow
              label="معرف المعاملة"
              value={transaction.id}
              icon="hash"
              showCopy={true}
              onCopy={() => handleCopy(transaction.id)}
            />

            {/* Transaction Type */}
            <DetailRow
              label="نوع المعاملة"
              value={getTypeLabel(transaction.type)}
              icon="file-text"
            />

            {/* Reference Number */}
            <DetailRow
              label="الرقم المرجعي"
              value={transaction.referenceNumber}
              icon="bookmark"
              showCopy={true}
              onCopy={() => handleCopy(transaction.referenceNumber)}
            />

            {/* Merchant/Description (for payment transactions) */}
            {transaction.descriptionEn && (
              <DetailRow
                label="اسم التاجر"
                value={transaction.descriptionEn}
                icon="briefcase"
              />
            )}

            {/* Balance Before */}
            {transaction.balanceBefore !== undefined && (
              <DetailRow
                label="الرصيد قبل"
                value={`${transaction.balanceBefore.toFixed(2)} ريال`}
                icon="trending-down"
              />
            )}

            {/* Balance After */}
            {transaction.balanceAfter !== undefined && (
              <DetailRow
                label="الرصيد بعد"
                value={`${transaction.balanceAfter.toFixed(2)} ريال`}
                icon="trending-up"
              />
            )}

            {/* Type-specific fields */}
            {renderTypeSpecificFields()}
          </View>
        </ScrollView>

        {/* Help Modal */}
        <Modal
          visible={showHelpModal}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowHelpModal(false)}
        >
          <View className="flex-1 justify-end bg-black/50">
            <View
              className="bg-white rounded-t-3xl p-6"
              style={{ maxHeight: "80%" }}
            >
              {/* Header */}
              <View className="flex-row items-center justify-between mb-4">
                <TouchableOpacity onPress={() => setShowHelpModal(false)}>
                  <Feather name="x" size={24} color="#6B7280" />
                </TouchableOpacity>
                <Text className="text-xl font-bold text-gray-900">
                  الأسئلة الشائعة
                </Text>
                <View style={{ width: 24 }} />
              </View>

              {/* FAQ Items */}
              <ScrollView showsVerticalScrollIndicator={false}>
                <FAQItem
                  question="كيف يمكنني الاعتراض على معاملة؟"
                  answer="يمكنك التواصل مع الدعم الفني من خلال قسم المساعدة في التطبيق. سيقوم فريقنا بمراجعة طلبك والرد عليك خلال 24 ساعة."
                />
                <FAQItem
                  question="ما هو وقت معالجة المعاملات؟"
                  answer="عادة ما تتم معالجة المعاملات خلال دقائق معدودة. في بعض الحالات قد تستغرق المعاملات حتى 24 ساعة عمل."
                />
                <FAQItem
                  question="كيف أحصل على إيصال رسمي؟"
                  answer="يمكنك الحصول على إيصال رسمي من خلال الضغط على زر 'صورة' في أعلى الشاشة. سيتم تحميل الإيصال بصيغة PDF."
                />
                <FAQItem
                  question="هل يمكنني إلغاء المعاملة؟"
                  answer="المعاملات المكتملة لا يمكن إلغاؤها. يمكنك طلب استرداد من خلال التواصل مع الدعم الفني."
                />
                <FAQItem
                  question="لماذا ظهرت المعاملة كفاشلة؟"
                  answer="قد تفشل المعاملة لعدة أسباب مثل عدم كفاية الرصيد، أو مشكلة في وسيلة الدفع. يرجى التحقق من المعلومات والمحاولة مرة أخرى."
                />
              </ScrollView>

              {/* Close Button */}
              <View className="mt-4">
                <TouchableOpacity
                  className="rounded-xl py-4"
                  style={{ backgroundColor: PRIMARY_COLOR }}
                  onPress={() => setShowHelpModal(false)}
                >
                  <Text className="text-white text-center font-semibold text-base">
                    إغلاق
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </>
  );
};

export default TransactionDetailsScreen;
