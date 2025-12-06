import { View, ScrollView, Alert, Share } from "react-native";
import {
  UpcomingPayHeaderDetails,
  PaymentInfoSection,
  PaymentBreakdownCard,
  PaymentActionButtons,
  PaymentWarningAlert,
  PaymentSecondaryActions,
  PaymentAITips,
} from "../../components/Dashboard";

/**
 * Upcoming Payment Details Screen
 * Displays detailed information about a payment and provides payment actions
 *
 * @param {Object} navigation - React Navigation object
 * @param {Object} route - Route params containing payment data
 * @param {Object} route.params.payment - Payment object
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

  // Calculate payment breakdown (Saudi VAT is 15%)
  const vatRate = 0.15;
  const vatAmount = Math.round(payment.amount * vatRate);
  const serviceFee = 0; // Can be adjusted based on payment type
  const totalAmount = payment.amount + vatAmount + serviceFee;

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
          payment={payment}
          primaryColor={primaryColor}
          onBack={() => navigation.goBack()}
        />

        {/* Warning Alert for urgent payments */}
        {payment.isUrgent && (
          <PaymentWarningAlert
            message="قد تحتاج حساباً أعمال أو تأخير سداد لحراك الوزارات"
            type="warning"
          />
        )}

        {/* Payment details section */}
        <PaymentInfoSection payment={payment} primaryColor={primaryColor} />

        {/* Cost breakdown */}
        <PaymentBreakdownCard
          amount={payment.amount}
          vatAmount={vatAmount}
          serviceFee={serviceFee}
          totalAmount={totalAmount}
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
          isUrgent={payment.isUrgent}
        />

        {/* Bottom padding for scrolling */}
        <View className="h-6" />
      </ScrollView>
    </View>
  );
};

export default UpcomingPayDetailsScreen;
