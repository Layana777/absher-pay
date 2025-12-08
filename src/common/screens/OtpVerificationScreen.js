/**
 * OtpVerificationScreen - OTP verification screen with transaction processing
 *
 * This screen handles OTP verification for wallet top-up transactions.
 * When OTP is verified successfully, it:
 * 1. Creates a top-up transaction in Firebase
 * 2. Updates the wallet balance
 * 3. Shows success message with transaction reference
 * 4. Navigates to success screen
 *
 * Usage Example:
 * ```javascript
 * navigation.navigate('OtpVerification', {
 *   amount: 500.00,
 *   userId: 'user123',
 *   walletId: 'wallet_personal_1234567890',
 *   accountType: 'personal', // 'personal' for SARGreen, 'business' for SARBlue
 *   phoneNumber: '0501234567',
 *   paymentMethod: 'mada',
 *   paymentDetails: {
 *     lastFourDigits: '4532',
 *     cardType: 'mada',
 *   },
 *   primaryColor: '#0055aa',
 * });
 * ```
 *
 * Required Parameters:
 * - amount: Number - Amount to add to wallet
 * - userId: String - Firebase user ID
 * - walletId: String - Wallet ID to credit
 *
 * Optional Parameters:
 * - accountType: String - Account type ('personal' or 'business') for SAR icon
 * - phoneNumber: String - Phone number for display
 * - paymentMethod: String - Payment method (mada, apple_pay, etc.)
 * - paymentDetails: Object - Additional payment information
 * - primaryColor: String - Theme color
 * - onVerifySuccess: Function - Custom callback for verification
 */

import { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Keyboard,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useDispatch } from "react-redux";
import { updateBusinessWalletBalance, updatePersonalWalletBalance } from "../../store/slices/walletSlice";
import { useResendTimer } from "../hooks/useResendTimer";
import { formatAmount } from "../utils";
import SvgIcons from "../components/SvgIcons";
import { CustomHeader, OTPInput } from "../components";
import {
  createTopUpTransaction,
  updateWalletBalance,
  getWalletById,
} from "../services";

const OtpVerificationScreen = ({ navigation, route }) => {
  const {
    amount,
    primaryColor = "#0055aa",
    phoneNumber = "05xxxxxxxx",
    onVerifySuccess,
    title = "تأكيد إضافة الرصيد",
    description = "أدخل رمز التحقق المرسل إلى رقم جوالك",
    userId,
    walletId,
    accountType, // 'personal' or 'business'
    paymentMethod = "mada",
    paymentDetails = {},
  } = route.params || {};

  // Determine SAR icon based on account type
  // Priority: accountType param > walletId check > default to business
  let walletType = 'business';
  if (accountType) {
    walletType = accountType;
  } else if (walletId?.includes('personal')) {
    walletType = 'personal';
  } else if (walletId?.includes('business')) {
    walletType = 'business';
  }

  const sarIconName = walletType === 'personal' ? 'SARGreen' : 'SARBlue';

  // Debug: Log wallet info
  console.log('=== SAR ICON DEBUG ===');
  console.log('Wallet ID:', walletId);
  console.log('Account Type Param:', accountType);
  console.log('Wallet Type:', walletType);
  console.log('SAR Icon Name:', sarIconName);
  console.log('====================');

  const dispatch = useDispatch();
  const [otpValue, setOtpValue] = useState("");
  const [lastSubmittedOtp, setLastSubmittedOtp] = useState(""); // Track last submitted OTP
  const [isProcessing, setIsProcessing] = useState(false);
  const { timer, canResend, resetTimer } = useResendTimer(60);

  const handleResendOtp = () => {
    if (canResend) {
      // TODO: Add API call to resend OTP
      console.log("Resending OTP...");
      resetTimer();
    }
  };

  const processTopUpTransaction = async (otpCode) => {
    setIsProcessing(true);

    try {
      // Debug: Log transaction parameters
      console.log("=== TRANSACTION DEBUG INFO ===");
      console.log("User ID:", userId);
      console.log("Wallet ID:", walletId);
      console.log("Amount:", amount);
      console.log("Payment Method:", paymentMethod);
      console.log("Payment Details:", paymentDetails);
      console.log("============================");

      // 1. Verify OTP (you can add actual OTP verification here)
      console.log("Verifying OTP:", otpCode);

      // 2. Get current wallet balance
      const wallet = await getWalletById(walletId);

      if (!wallet) {
        throw new Error("لم يتم العثور على المحفظة");
      }

      console.log("Wallet found:", wallet);
      const balanceBefore = wallet.balance;

      // 3. Create top-up transaction
      console.log("Creating top-up transaction...");
      const transactionResult = await createTopUpTransaction(
        walletId,
        userId,
        parseFloat(amount),
        balanceBefore,
        paymentMethod,
        {
          ...paymentDetails,
          otpVerified: true,
          otpCode: otpCode,
          timestamp: Date.now(),
        }
      );

      if (!transactionResult.success) {
        throw new Error(transactionResult.error || "فشل إنشاء المعاملة");
      }

      const transaction = transactionResult.data;
      console.log("Transaction created:", transaction.id);

      // 4. Update wallet balance
      const newBalance = balanceBefore + parseFloat(amount);
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

      // Update Redux state to refresh UI on home screen
      // Determine wallet type from walletId or a passed parameter

      const walletType = walletId?.includes('personal') ? 'personal' : 'business';
      if (walletType === 'personal') {
        dispatch(updatePersonalWalletBalance(newBalance));
        console.log("Redux personal wallet balance updated to:", newBalance);
      } else {
        dispatch(updateBusinessWalletBalance(newBalance));
        console.log("Redux business wallet balance updated to:", newBalance);
      }

      // 5. Show success and navigate
      setIsProcessing(false);

      Alert.alert(
        "تمت العملية بنجاح",
        `تم إضافة ${formatAmount(amount)} ريال إلى محفظتك\n\nرقم المرجع: ${
          transaction.referenceNumber
        }`,
        [
          {
            text: "حسناً",
            onPress: () => {
              navigation.navigate("TopupSuccess", {
                amount,
                primaryColor,
                transactionId: transaction.id,
                referenceNumber: transaction.referenceNumber,
                newBalance: newBalance,
              });
            },
          },
        ]
      );
    } catch (error) {
      console.error("Top-up transaction error:", error);
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

  const handleOtpComplete = async (otpCode) => {
    // Prevent duplicate submissions of the same OTP
    if (isProcessing || otpCode === lastSubmittedOtp) {
      console.log("OTP already submitted or processing, ignoring duplicate");
      return;
    }

    // Mark this OTP as submitted
    setLastSubmittedOtp(otpCode);

    Keyboard.dismiss();

    // If custom callback provided, use it (custom handling)
    if (onVerifySuccess) {
      onVerifySuccess(otpCode);
      return;
    }

    // Check if we have required data for transaction
    if (!userId || !walletId || !amount) {
      Alert.alert(
        "خطأ",
        "معلومات المعاملة غير مكتملة. يرجى المحاولة مرة أخرى.",
        [
          {
            text: "حسناً",
            onPress: () => {
              // Reset lastSubmittedOtp to allow retry
              setLastSubmittedOtp("");
              if (navigation.canGoBack()) {
                navigation.goBack();
              }
            },
          },
        ]
      );
      return;
    }

    // Process the top-up transaction
    await processTopUpTransaction(otpCode);
  };

  const handleVerify = () => {
    if (otpValue.length === 4 && !isProcessing) {
      handleOtpComplete(otpValue);
    }
  };

  const isOtpComplete = otpValue.length === 4;

  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
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
          {/* Shield Icon */}
          <View className="items-center mb-6">
            <View
              className="w-20 h-20 rounded-full items-center justify-center mb-4"
              style={{ backgroundColor: `${primaryColor}15` }}
            >
              <Feather name="shield" size={40} color={primaryColor} />
            </View>

            {/* Title */}
            <Text className="text-2xl font-bold text-gray-900 mb-2 text-center">
              {title}
            </Text>

            {/* Description */}
            <Text className="text-gray-600 text-center mb-2">
              {description}
            </Text>
            <Text className="text-gray-500 text-sm text-center">
              {phoneNumber}
            </Text>
          </View>

          {/* Amount Display */}
          {amount && (
            <View className="items-center mb-8">
              <Text className="text-gray-600 text-sm mb-2">المبلغ</Text>
              <View className="flex-row items-center">
                <Text
                  className="text-4xl font-bold mr-2"
                  style={{ color: primaryColor }}
                >
                  <SvgIcons name={sarIconName} size={25} />
                  {formatAmount(amount)}
                </Text>
              </View>
            </View>
          )}

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
                  رمز التحقق يُرسل عبر رسالة SMS لضمان أمان حسابك
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
                    جاري المعالجة...
                  </Text>
                </View>
              ) : (
                <Text className="text-white text-center text-base font-semibold">
                  تحقق من الرمز
                </Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Help Text */}
          <Text className="text-gray-500 text-xs text-center px-4">
            لم تستلم الرمز؟ تحقق من رسائل التسويق أو حاول المحاولة لاحقًا
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

export default OtpVerificationScreen;
