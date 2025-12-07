import { View, ScrollView, Alert, Share } from "react-native";
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
  const handlePayNow = () => {
    console.log("Pay Now pressed for payment:", payment.id);
    // TODO: Navigate to payment method selection or OTP screen
    // navigation.navigate("PaymentMethodSelection", {
    //   payment,
    //   totalAmount,
    //   primaryColor,
    // });
    Alert.alert(
      "الدفع",
      `سيتم الدفع بمبلغ ${totalAmount.toLocaleString("en-US")} ريال`,
      [
        { text: "إلغاء", style: "cancel" },
        {
          text: "متابعة",
          onPress: () => console.log("Proceeding to payment..."),
        },
      ]
    );
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
        />

        {/* Bottom padding for scrolling */}
        <View className="h-6" />
      </ScrollView>
    </View>
  );
};

export default UpcomingPayDetailsScreen;
