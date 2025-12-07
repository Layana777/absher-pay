import { useState } from "react";
import {
  View,
  ScrollView,
  Alert,
  Share,
  Modal,
  Text,
  TouchableOpacity,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import {
  UpcomingPayHeaderDetails,
  PaymentInfoSection,
  PaymentBreakdownCard,
  PaymentActionButtons,
  PaymentWarningAlert,
  PaymentSecondaryActions,
  PaymentAITips,
  PaymentAdditionalInfoSection,
} from "../../components/Dashboard";
import Button from "../../../common/components/ui/Button";
import { getWalletById } from "../../../common/services/walletService";

/**
 * Upcoming Payment Details Screen
 * Displays detailed information about a payment and provides payment actions
 *
 * @param {Object} navigation - React Navigation object
 * @param {Object} route - Route params containing payment data
 * @param {Object} route.params.payment - Payment object (can include billData)
 * @param {string} route.params.primaryColor - Primary brand color
 */
const UpcomingPayDetailsScreen = ({ navigation, route }) => {
  const { payment, primaryColor = "#0055aa" } = route.params || {};
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [walletData, setWalletData] = useState(null);

  // Handle case where no payment data is provided
  if (!payment) {
    Alert.alert("خطأ", "لم يتم العثور على بيانات الدفعة", [
      { text: "حسناً", onPress: () => navigation.goBack() },
    ]);
    return null;
  }

  // Extract bill data if available
  const billData = payment.billData || null;

  // Use bill amount if available, otherwise use payment amount
  const baseAmount = billData?.amount || payment.amount;
  const penaltyAmount = billData?.penaltyInfo?.lateFee || 0;
  const amountWithPenalty = baseAmount + penaltyAmount;

  // Calculate payment breakdown
  // Note: Government bills typically don't have VAT, but keeping for compatibility
  const vatRate = 0;
  const vatAmount = 0;
  const serviceFee = 0;
  const totalAmount = amountWithPenalty + vatAmount + serviceFee;

  // Prepare payment object with bill information
  const enrichedPayment = {
    ...payment,
    amount: totalAmount,
    // Add bill-specific fields for display
    referenceNumber: billData?.referenceNumber || "N/A",
    dueDate: billData?.dueDate || Date.now(),
    ministry: billData?.ministryName?.ar || "غير محدد",
    category: billData?.category || "عام",
    status: billData?.status || "unpaid",
    penaltyInfo: billData?.penaltyInfo || null,
  };

  // Handle Pay Now action
  const handlePayNow = async () => {
    console.log("Pay Now pressed for payment:", payment.id);

    try {
      // Get current wallet balance
      const wallet = await getWalletById(enrichedPayment.billData.walletId);

      if (!wallet) {
        Alert.alert("خطأ", "لم يتم العثور على المحفظة");
        return;
      }

      // Validate sufficient balance
      if (wallet.balance < totalAmount) {
        Alert.alert(
          "رصيد غير كافٍ",
          `الرصيد الحالي: ${wallet.balance.toFixed(
            2
          )} ريال\nالمبلغ المطلوب: ${totalAmount.toFixed(2)} ريال`,
          [{ text: "حسناً" }]
        );
        return;
      }

      // Store wallet data and show confirmation modal
      setWalletData(wallet);
      setShowConfirmModal(true);
    } catch (error) {
      console.error("Balance check error:", error);
      Alert.alert("خطأ", "حدث خطأ أثناء التحقق من الرصيد");
    }
  };

  // Confirm and navigate to OTP screen
  const handleConfirmPayment = () => {
    setShowConfirmModal(false);

    if (walletData) {
      navigation.navigate("BillPaymentOtp", {
        bill: enrichedPayment.billData,
        totalAmount,
        walletId: walletData.id,
        userId: walletData.userId,
        primaryColor,
      });
    }
  };

  // Handle Schedule Payment action
  const handleSchedulePayment = () => {
    console.log("Schedule Payment pressed");
    // TODO: Navigate to payment scheduling screen
    Alert.alert("جدولة الدفع", "سيتم إضافة خاصية جدولة الدفع قريباً", [
      { text: "حسناً" },
    ]);
  };

  // Handle Remind Later action
  const handleRemindLater = () => {
    console.log("Remind Later pressed");
    Alert.alert("تذكير", "سيتم تذكيرك بهذه الدفعة قبل موعد الاستحقاق", [
      {
        text: "حسناً",
        onPress: () => navigation.goBack(),
      },
    ]);
  };

  // Handle Download PDF
  const handleDownloadPDF = () => {
    console.log("Download PDF pressed");
    Alert.alert("تحميل PDF", "سيتم تحميل الفاتورة بصيغة PDF", [
      { text: "حسناً" },
    ]);
  };

  // Handle Share
  const handleShare = async () => {
    try {
      await Share.share({
        message: `فاتورة: ${
          payment.title
        }\nالمبلغ: ${totalAmount.toLocaleString("en-US")} ريال`,
        title: "مشاركة الفاتورة",
      });
    } catch (error) {
      console.error("Error sharing:", error);
    }
  };

  // Handle Set Reminder
  const handleSetReminder = () => {
    console.log("Set Reminder pressed");
    Alert.alert("تذكير", "سيتم إضافة تذكير لهذه الدفعة", [{ text: "حسناً" }]);
  };

  return (
    <View className="flex-1 bg-gray-50" style={{ direction: "ltr" }}>
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Header with main payment info */}
        <UpcomingPayHeaderDetails
          payment={enrichedPayment}
          primaryColor={primaryColor}
          onBack={() => navigation.goBack()}
        />

        {/* Warning Alert for urgent payments */}
        {enrichedPayment.isUrgent && (
          <PaymentWarningAlert
            message="قد تحتاج حساباً أعمال أو تأخير سداد لحراك الوزارات"
            type="warning"
          />
        )}

        {/* Overdue penalty alert */}
        {enrichedPayment.penaltyInfo && (
          <PaymentWarningAlert
            message={`غرامة تأخير: ${enrichedPayment.penaltyInfo.lateFee.toFixed(
              2
            )} ريال (${enrichedPayment.penaltyInfo.daysOverdue} أيام)`}
            type="warning"
          />
        )}

        {/* Payment details section */}
        <PaymentInfoSection
          payment={enrichedPayment}
          primaryColor={primaryColor}
        />

        {/* Additional Information Section */}
        <PaymentAdditionalInfoSection
          billData={billData}
          serviceType={billData?.serviceType}
          primaryColor={primaryColor}
        />

        {/* Cost breakdown */}
        <PaymentBreakdownCard
          amount={baseAmount}
          vatAmount={vatAmount}
          serviceFee={serviceFee}
          totalAmount={totalAmount}
          penaltyAmount={penaltyAmount}
          primaryColor={primaryColor}
        />

        {/* Secondary Actions (PDF, Share, Reminder) */}
        <PaymentSecondaryActions
          onDownloadPDF={handleDownloadPDF}
          onShare={handleShare}
          onSetReminder={handleSetReminder}
          primaryColor={primaryColor}
        />

        {/* AI Tips and Suggestions */}
        <PaymentAITips primaryColor={primaryColor} />

        {/* Action Buttons - Inside ScrollView */}
        <PaymentActionButtons
          onPayNow={handlePayNow}
          onSchedule={handleSchedulePayment}
          onRemindLater={handleRemindLater}
          primaryColor={primaryColor}
          isUrgent={enrichedPayment.isUrgent}
          serviceName={payment.title}
          amount={`${totalAmount.toLocaleString("en-US")} ريال`}
        />

        {/* Bottom padding for scrolling */}
        <View className="h-6" />
      </ScrollView>

      {/* Confirmation Modal */}
      <Modal
        visible={showConfirmModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowConfirmModal(false)}
      >
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => setShowConfirmModal(false)}
          className="flex-1 justify-end bg-black/50"
          style={{ direction: "rtl" }}
        >
          <TouchableOpacity activeOpacity={1}>
            <View className="bg-white rounded-t-3xl">
              {/* Handle Bar */}
              <View className="items-center py-3">
                <View className="w-12 h-1 bg-gray-300 rounded-full" />
              </View>

              {/* Content */}
              <View className="px-6 pb-8">
                {/* Header */}
                <View className="items-center mb-6">
                  <View
                    style={{ backgroundColor: `${primaryColor}15` }}
                    className="w-16 h-16 rounded-full items-center justify-center mb-3"
                  >
                    <Feather
                      name="alert-circle"
                      size={32}
                      color={primaryColor}
                    />
                  </View>
                  <Text className="text-gray-900 text-xl font-bold mb-2">
                    تأكيد الدفع
                  </Text>
                  <Text className="text-gray-500 text-sm text-center">
                    هل أنت متأكد من رغبتك في الانتقال لإتمام عملية الدفع؟
                  </Text>
                </View>

                {/* Payment Details */}
                <View className="bg-gray-50 rounded-2xl p-4 mb-6">
                  <View className="flex-row justify-between items-center mb-3">
                    <Text className="text-gray-600 text-sm">الخدمة</Text>
                    <Text className="text-gray-800 text-sm font-bold">
                      {enrichedPayment.billData.serviceName.ar}
                    </Text>
                  </View>
                  <View className="flex-row justify-between items-center mb-3">
                    <Text className="text-gray-600 text-sm">الوزارة</Text>
                    <Text className="text-gray-800 text-sm font-medium">
                      {enrichedPayment.billData.ministryName.ar}
                    </Text>
                  </View>
                  <View className="flex-row justify-between items-center mb-3">
                    <Text className="text-gray-600 text-sm">رقم المرجع</Text>
                    <Text className="text-gray-800 text-sm font-medium">
                      {enrichedPayment.referenceNumber}
                    </Text>
                  </View>
                  {walletData && (
                    <View className="flex-row justify-between items-center mb-3">
                      <Text className="text-gray-600 text-sm">
                        رصيد المحفظة
                      </Text>
                      <Text className="text-gray-800 text-sm font-medium">
                        {walletData.balance.toFixed(2)} ريال
                      </Text>
                    </View>
                  )}
                  <View className="h-px bg-gray-200 my-2" />
                  <View className="flex-row justify-between items-center">
                    <Text className="text-gray-900 text-base font-bold">
                      المبلغ الإجمالي
                    </Text>
                    <Text
                      className="text-xl font-bold"
                      style={{ color: primaryColor }}
                    >
                      {totalAmount.toFixed(2)} ريال
                    </Text>
                  </View>
                  {enrichedPayment.penaltyInfo && (
                    <Text className="text-xs text-gray-500 mt-2 text-right">
                      (شامل غرامة تأخير{" "}
                      {enrichedPayment.penaltyInfo.lateFee.toFixed(2)} ريال)
                    </Text>
                  )}
                </View>

                {/* Action Buttons */}
                <View className="gap-3">
                  {/* Confirm Button */}
                  <Button
                    title="المتابعة للدفع"
                    onPress={handleConfirmPayment}
                    variant="business-primary"
                    size="medium"
                    className="rounded-2xl"
                  />

                  {/* Cancel Button */}
                  <Button
                    title="إلغاء"
                    onPress={() => setShowConfirmModal(false)}
                    variant="danger-outline"
                    size="medium"
                    className="rounded-2xl"
                  />
                </View>

                {/* Security Note */}
                <View className="flex-row items-center justify-center mt-4">
                  <Text className="text-gray-400 text-xs mr-2 text-center">
                    سيتم تحويلك إلى شاشة التحقق لإتمام الدفع
                  </Text>
                  <Feather name="shield" size={14} color="#9ca3af" />
                </View>
              </View>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

export default UpcomingPayDetailsScreen;
