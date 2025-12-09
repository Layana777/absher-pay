import { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Keyboard,
  Alert,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useDispatch } from "react-redux";
import { CommonActions } from "@react-navigation/native";
import { CustomHeader, OTPInput } from "../../../common/components";
import { useResendTimer } from "../../../common/hooks/useResendTimer";
import { formatAmount } from "../../../common/utils";
import SvgIcons from "../../../common/components/SvgIcons";
import {
  getWalletById,
  updateWalletBalance,
  createPaymentTransactionEnhanced,
  markBillAsPaid,
} from "../../../common/services";
import { updateBusinessWalletBalance } from "../../../store/slices/walletSlice";

/**
 * Bill Payment OTP Verification Screen
 * Handles OTP verification and bill payment processing
 *
 * Route params:
 * - bill: Full bill object (for single payment)
 * - billsToPay: Array of bills (for bulk payment)
 * - totalAmount: Total amount to pay (including penalties)
 * - walletId: Wallet ID
 * - userId: User ID
 * - primaryColor: Theme color
 * - isBulkPayment: Boolean flag for bulk payment mode
 */
const BillPaymentOtpScreen = ({ navigation, route }) => {
  const {
    bill,
    billsToPay,
    totalAmount,
    walletId,
    userId,
    primaryColor = "#0055aa",
    isBulkPayment = false,
  } = route.params || {};

  // Use billsToPay if bulk payment, otherwise wrap single bill in array
  const bills = isBulkPayment ? billsToPay : bill ? [bill] : [];

  const dispatch = useDispatch();
  const [otpValue, setOtpValue] = useState("");
  const [lastSubmittedOtp, setLastSubmittedOtp] = useState(""); // Track last submitted OTP
  const [isProcessing, setIsProcessing] = useState(false);
  const { timer, canResend, resetTimer } = useResendTimer(60);

  // Helper functions
  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const isOtpComplete = otpValue.length === 4;

  // Handle OTP completion (when 4 digits are entered)
  const handleOtpComplete = async (otpCode) => {
    // Prevent duplicate submissions of the same OTP
    if (isProcessing || otpCode === lastSubmittedOtp) {
      console.log("OTP already submitted or processing, ignoring duplicate");
      return;
    }

    // Mark this OTP as submitted
    setLastSubmittedOtp(otpCode);

    Keyboard.dismiss();

    // Process payment directly (no modal in OTP screen)
    await processBillPayment(otpCode);
  };

  const handleResendOtp = () => {
    if (canResend) {
      console.log("Resending OTP...");
      // TODO: Add API call to resend OTP
      resetTimer();
      // Reset OTP tracking to allow new submission
      setLastSubmittedOtp("");
      setOtpValue("");
    }
  };

  const handleVerify = () => {
    if (otpValue.length === 4 && !isProcessing) {
      handleOtpComplete(otpValue);
    }
  };

  const processBillPayment = async (otpCode) => {
    setIsProcessing(true);

    try {
      console.log("=== BILL PAYMENT DEBUG ===");
      console.log("Is Bulk Payment:", isBulkPayment);
      console.log("Bills Count:", bills.length);
      console.log("User ID:", userId);
      console.log("Wallet ID:", walletId);
      console.log("Total Amount:", totalAmount);
      console.log("============================");

      // 1. Verify OTP (mock for now)
      console.log("Verifying OTP:", otpCode);

      // 2. Get current wallet balance (double-check)
      const wallet = await getWalletById(walletId);
      if (!wallet) {
        throw new Error("لم يتم العثور على المحفظة");
      }

      const balanceBefore = wallet.balance;
      console.log("Wallet balance:", balanceBefore);

      // 3. Validate balance again (in case it changed)
      if (balanceBefore < totalAmount) {
        Alert.alert("خطأ", "الرصيد غير كافٍ");
        setIsProcessing(false);
        return;
      }

      // 4. Create payment transaction with enhanced metadata
      console.log("Creating enhanced payment transaction...");

      // Determine transaction description
      const descriptionAr = isBulkPayment
        ? `دفع ${bills.length} فاتورة حكومية`
        : bill?.serviceName?.ar || "دفع فاتورة";
      const descriptionEn = isBulkPayment
        ? `Payment for ${bills.length} government bills`
        : bill?.serviceName?.en || bill?.serviceName?.ar || "Bill payment";
      const serviceType = isBulkPayment
        ? "bulk_payment"
        : bill?.serviceType || "government_service";

      // Build enhanced payment metadata for AI insights
      const paymentMetadata = {
        serviceSubType: isBulkPayment ? null : bill?.serviceSubType,
        serviceName: isBulkPayment ? null : bill?.serviceName,
        ministry: isBulkPayment ? null : bill?.ministry,
        ministryName: isBulkPayment ? null : bill?.ministryName,
        linkedBillIds: bills.map(b => b?.id).filter(Boolean),
        penaltyInfo: isBulkPayment ? null : bill?.penaltyInfo,
      };

      const transactionResult = await createPaymentTransactionEnhanced(
        walletId,
        userId,
        totalAmount,
        balanceBefore,
        serviceType,
        descriptionAr,
        descriptionEn,
        paymentMetadata
      );


      if (!transactionResult.success) {
        throw new Error(transactionResult.error || "فشل إنشاء المعاملة");
      }

      const transaction = transactionResult.data;
      console.log("Transaction created:", transaction.id);

      // 5. Update wallet balance (deduct amount)
      const newBalance = balanceBefore - totalAmount;
      console.log(
        "Updating wallet balance from",
        balanceBefore,
        "to",
        newBalance
      );

      const balanceUpdateResult = await updateWalletBalance(
        walletId,
        newBalance
      );

      if (!balanceUpdateResult) {
        // Rollback might be needed here in production
        console.error("Failed to update wallet balance");
        throw new Error("فشل تحديث رصيد المحفظة");
      }

      console.log("Wallet balance updated successfully");

      // 6. Mark bills as paid
      console.log("Marking bills as paid...");
      let failedBills = 0;

      for (const currentBill of bills) {
        if (currentBill?.id) {
          const billUpdateSuccess = await markBillAsPaid(
            userId,
            currentBill.id,
            transaction.id
          );

          if (!billUpdateSuccess) {
            console.warn(`Failed to mark bill ${currentBill.id} as paid`);
            failedBills++;
          } else {
            console.log(`Bill ${currentBill.id} marked as paid successfully`);
          }
        }
      }

      if (failedBills > 0) {
        console.warn(
          `${failedBills} bills failed to update, but payment processed`
        );
      }

      // 7. Update Redux state to refresh UI on home screen
      dispatch(updateBusinessWalletBalance(newBalance));
      console.log("Redux wallet balance updated to:", newBalance);

      // 8. Show success and navigate
      setIsProcessing(false);

      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [
            {
              name: "BusinessTabs",
              state: { routes: [{ name: "Home" }], index: 0 },
            },
            {
              name: "BillPaymentSuccess",
              params: {
                bill: isBulkPayment ? null : bill,
                billsToPay: isBulkPayment ? bills : null,
                isBulkPayment,
                billsCount: bills.length,
                totalAmount,
                transactionId: transaction.id,
                referenceNumber: transaction.referenceNumber,
                newBalance,
                primaryColor,
              },
            },
          ],
        })
      );
    } catch (error) {
      console.error("Bill payment error:", error);
      setIsProcessing(false);

      Alert.alert(
        "فشلت العملية",
        error.message ||
          "حدث خطأ أثناء معالجة العملية. يرجى المحاولة مرة أخرى.",
        [
          {
            text: "إعادة المحاولة",
            onPress: () => {
              setOtpValue("");
              setLastSubmittedOtp(""); // Reset to allow new submission
            },
          },
          {
            text: "إلغاء",
            onPress: () => {
              setLastSubmittedOtp(""); // Reset on cancel
              if (navigation.canGoBack()) {
                navigation.goBack();
              }
            },
            style: "cancel",
          },
        ]
      );
    }
  };

  return (
    <View className="flex-1 bg-backgroundRGB">
      {/* Header */}
      <CustomHeader
        title="رمز التحقق"
        onBack={() => navigation.goBack()}
        backgroundColor={primaryColor}
        textColor="#FFFFFF"
        statusBarStyle="light-content"
        statusBarBackgroundColor={primaryColor}
      />

      <ScrollView className="flex-1" contentContainerStyle={{ flexGrow: 1 }}>
        <View className="flex-1 px-6 py-8">
          {/* Shield Icon Section */}
          <View className="items-center mb-6">
            <View
              className="w-20 h-20 rounded-full items-center justify-center mb-4"
              style={{ backgroundColor: `${primaryColor}15` }}
            >
              <Feather name="shield" size={40} color={primaryColor} />
            </View>

            {/* Title */}
            <Text className="text-2xl font-bold text-gray-900 mb-2 text-center">
              تأكيد دفع الفاتورة
            </Text>

            {/* Description */}
            <Text className="text-gray-600 text-center mb-2">
              أدخل رمز التحقق المرسل إلى رقم جوالك المسجل
            </Text>
            <Text className="text-gray-500 text-sm text-center">
              {isBulkPayment
                ? `دفع ${bills.length} فاتورة`
                : bill?.serviceName?.ar && bill?.ministryName?.ar
                ? `${bill.serviceName.ar} - ${bill.ministryName.ar}`
                : bill?.serviceName?.ar || "فاتورة"}
            </Text>
          </View>

          {/* Amount Display */}
          <View className="items-center mb-8">
            <Text className="text-gray-600 text-sm mb-2">المبلغ الإجمالي</Text>
            <View className="flex-row items-center">
              <Text
                className="text-4xl font-bold mr-2"
                style={{ color: primaryColor }}
              >
                <SvgIcons name={"SARBlue"} size={25} />
                {formatAmount(totalAmount)}
              </Text>
            </View>
            {!isBulkPayment && bill?.penaltyInfo && (
              <Text className="text-xs text-gray-500 mt-2">
                (شامل غرامة تأخير {formatAmount(bill.penaltyInfo.lateFee)} ريال)
              </Text>
            )}
            {isBulkPayment && bills.some((b) => b?.penaltyInfo) && (
              <Text className="text-xs text-gray-500 mt-2">
                (شامل غرامات التأخير)
              </Text>
            )}
          </View>

          {/* OTP Input Fields */}
          <View className="mb-6">
            <OTPInput
              length={4}
              onComplete={handleOtpComplete}
              onChangeOtp={setOtpValue}
              primaryColor={primaryColor}
              autoFocus={true}
              editable={!isProcessing}
            />
          </View>

          {/* Timer / Resend */}
          <View className="items-center mb-6">
            {canResend && !isProcessing ? (
              <TouchableOpacity
                onPress={handleResendOtp}
                disabled={isProcessing}
              >
                <Text style={{ color: primaryColor }} className="font-semibold">
                  إعادة إرسال رمز التحقق
                </Text>
              </TouchableOpacity>
            ) : (
              <View className="flex-row items-center">
                <Text className="text-gray-600">
                  إعادة الإرسال بعد{" "}
                  <Text className="font-bold" style={{ color: primaryColor }}>
                    {formatTimer(timer)}
                  </Text>
                </Text>
              </View>
            )}
          </View>

          {/* Security Info Card */}
          <View
            className="rounded-2xl p-4 mb-6"
            style={{ backgroundColor: `${primaryColor}08` }}
          >
            <View className="flex-row items-start">
              <View className="flex-1">
                <Text
                  className="font-semibold text-sm mb-1 text-left"
                  style={{ color: primaryColor }}
                >
                  معاملة آمنة 100%
                </Text>
                <Text className="text-gray-600 text-xs text-left">
                  رمز التحقق يُرسل عبر رسالة SMS لضمان أمان عملية الدفع
                </Text>
              </View>
              <Feather
                name="shield"
                size={20}
                color={primaryColor}
                style={{ marginRight: 8, marginTop: 2 }}
              />
            </View>
          </View>

          {/* Spacer to push button to bottom */}
          <View className="flex-1" />

          {/* Verify Button */}
          <View className="mb-4">
            <TouchableOpacity
              onPress={handleVerify}
              disabled={!isOtpComplete || isProcessing}
              className="rounded-lg py-4"
              style={{
                backgroundColor:
                  isOtpComplete && !isProcessing ? primaryColor : "#d1d5db",
              }}
            >
              {isProcessing ? (
                <View className="flex-row items-center justify-center">
                  <ActivityIndicator color="#fff" size="small" />
                  <Text className="text-white text-center text-base font-semibold mr-2">
                    جاري معالجة الدفع...
                  </Text>
                </View>
              ) : (
                <Text className="text-white text-center text-base font-semibold">
                  تأكيد الدفع
                </Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Help Text */}
          <Text className="text-gray-500 text-xs text-center px-4">
            لم تستلم الرمز؟ تأكد من رقم الجوال أو حاول المحاولة لاحقًا
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

export default BillPaymentOtpScreen;
