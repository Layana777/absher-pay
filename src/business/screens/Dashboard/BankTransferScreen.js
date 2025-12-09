import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Modal,
  Image,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useDispatch } from "react-redux";
import SvgIcons from "../../../common/components/SvgIcons";
import { useBusinessWallet, useUser, useBankAccounts, useSelectedBankAccount } from "../../../store/hooks";
import { SIZES } from "../../../common/constants/sizes";
import CustomHeader from "../../../common/components/CustomHeader";
import Button from "../../../common/components/ui/Button";
import LinkedBankAccountsModal from "../../components/LinkedBankAccountsModal";
import { updateBusinessWalletBalance } from "../../../store/slices/walletSlice";
import { setBankAccounts } from "../../../store/slices/bankAccountsSlice";
import { createTransaction } from "../../../common/services/transactionService";
import { updateWalletBalance } from "../../../common/services/walletService";
import { getBankAccountsByUserId } from "../../../common/services/bankAccountService";

// Bank logos mapping by ID
const BANK_LOGOS_BY_ID = {
  "1": require("../../../common/assets/icons/alrajhi-logo.png"),
  "2": require("../../../common/assets/icons/snb-logo.png"),
  "3": require("../../../common/assets/icons/riyad-bank-logo.png"),
  "4": require("../../../common/assets/icons/sabb-logo.png"),
  "5": require("../../../common/assets/icons/anb-logo.png"),
  "6": require("../../../common/assets/icons/albilad-logo.png"),
  "7": require("../../../common/assets/icons/alinma-logo.png"),
  "8": require("../../../common/assets/icons/aljazira-logo.png"),
};

// Bank logos mapping by name (fallback for older accounts)
const bankLogos = {
  "مصرف الراجحي": require("../../../common/assets/icons/alrajhi-logo.png"),
  "البنك الأهلي السعودي": require("../../../common/assets/icons/snb-logo.png"),
  "بنك الرياض": require("../../../common/assets/icons/riyad-bank-logo.png"),
  "بنك ساب": require("../../../common/assets/icons/sabb-logo.png"),
  "بنك السعودي الأول": require("../../../common/assets/icons/sabb-logo.png"),
  "البنك السعودي الوطني": require("../../../common/assets/icons/snb-logo.png"),
  "البنك العربي الوطني": require("../../../common/assets/icons/anb-logo.png"),
  "مصرف الإنماء": require("../../../common/assets/icons/alinma-logo.png"),
  "بنك الإنماء": require("../../../common/assets/icons/alinma-logo.png"),
  "بنك البلاد": require("../../../common/assets/icons/albilad-logo.png"),
  "بنك الجزيرة": require("../../../common/assets/icons/aljazira-logo.png"),
  "البنك الأهلي التجاري": require("../../../common/assets/icons/anb-logo.png"),
};

// Helper function to get bank logo
const getBankLogo = (account) => {
  if (!account) return null;

  // Try bankId first (new accounts)
  if (account.bankId && BANK_LOGOS_BY_ID[account.bankId]) {
    return BANK_LOGOS_BY_ID[account.bankId];
  }

  // Fallback to bank name (old accounts)
  if (account.bankName && bankLogos[account.bankName]) {
    return bankLogos[account.bankName];
  }

  // Check if bankLogo property exists
  if (account.bankLogo) {
    return account.bankLogo;
  }

  return null;
};

const BankTransferScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const [amount, setAmount] = useState("");
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showAccountsModal, setShowAccountsModal] = useState(false);

  // Get user data from Redux
  const user = useUser();
  // Get business wallet data from Redux
  const businessWallet = useBusinessWallet();
  // Get bank accounts from Redux
  const bankAccounts = useBankAccounts();
  const selectedAccount = useSelectedBankAccount();

  console.log("getting the business wallet balance" , businessWallet)
  console.log("Bank accounts from Redux:", bankAccounts);
  console.log("Selected account:", selectedAccount);

  const balance = businessWallet?.balance
    ? businessWallet.balance.toLocaleString("en-US", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      })
    : "0";

  // Use selected account from Redux
  const linkedBank = selectedAccount;

  const quickAmounts = [100, 500, 1000, 5000];

  // Fetch bank accounts from Firebase on mount
  useEffect(() => {
    const loadBankAccounts = async () => {
      if (!user?.uid) return;

      try {
        const result = await getBankAccountsByUserId(user.uid);

        if (result.success && result.data) {
          console.log("Bank accounts loaded from Firebase:", result.data);
          dispatch(setBankAccounts(result.data));
        } else {
          console.log("No bank accounts found in Firebase");
        }
      } catch (error) {
        console.error("Error loading bank accounts from Firebase:", error);
      }
    };

    loadBankAccounts();
  }, [user?.uid, dispatch]);

  const handleQuickAmount = (value) => {
    setAmount(value.toString());
  };

  const handleContinue = () => {
    if (linkedBank) {
      setShowConfirmModal(true);
    } else {
      // Navigate to add bank account if no bank is linked
      navigation.navigate("AddBankAccount");
    }
  };

  const handleConfirmTransfer = () => {
    // Close the confirmation modal
    setShowConfirmModal(false);

    // Navigate to OTP verification screen
    navigation.navigate("OtpVerification", {
      amount: amount,
      primaryColor: "#0055aa",
      accountType: 'business', // Specify account type for SAR icon
      phoneNumber: user?.phone || "05xxxxxxxx",
      title: "تأكيد التحويل البنكي",
      description: "أدخل رمز التحقق المرسل إلى رقم جوالك",
      onVerifySuccess: async (otpCode) => {
        console.log("OTP verified:", otpCode);

        try {
          // Calculate new balance after deducting the transfer amount
          const transferAmount = parseFloat(amount);
          const currentBalance = businessWallet?.balance || 0;
          const newBalance = currentBalance - transferAmount;

          // Prepare bank transfer details for Firebase
          const bankTransferDetails = {
            bankName: linkedBank?.bankName,
            iban: linkedBank?.iban,
            ibanFormatted: linkedBank?.ibanFormatted,
            accountNumber: linkedBank?.accountNumber,
            accountOwner: linkedBank?.accountOwner,
          };

          // Create transfer-out transaction in Firebase
          const transactionData = {
            userId: user?.uid,
            type: "transfer_out",
            category: "transfer",
            amount: -Math.abs(parseFloat(transferAmount.toFixed(2))),
            balanceBefore: parseFloat(currentBalance.toFixed(2)),
            balanceAfter: parseFloat((currentBalance - transferAmount).toFixed(2)),
            bankTransferDetails,
            estimatedArrival: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
            descriptionAr: `تحويل بنكي إلى ${linkedBank?.bankName}`,
            descriptionEn: `Bank Transfer to ${linkedBank?.bankName}`,
          };

          const transactionResult = await createTransaction(
            businessWallet?.id,
            transactionData
          );

          if (transactionResult.success) {
            console.log("Transaction saved to Firebase:", transactionResult.data);

            // Update the business wallet balance in Redux
            dispatch(updateBusinessWalletBalance(newBalance));

            // Sync wallet balance to Firebase
            await updateWalletBalance(businessWallet?.id, newBalance);

            console.log("Transfer confirmed:", {
              amount: transferAmount,
              previousBalance: currentBalance,
              newBalance: newBalance,
              bankAccount: linkedBank,
              transactionId: transactionResult.data.id,
              referenceNumber: transactionResult.data.referenceNumber,
            });

            // Navigate to success screen
            navigation.navigate("TransferSuccess", {
              amount: amount,
              bankName: linkedBank?.bankName,
              iban: linkedBank?.ibanFormatted || linkedBank?.iban,
              transactionId: transactionResult.data.id,
              referenceNumber: transactionResult.data.referenceNumber,
            });

            // Clear the amount input
            setAmount("");
          } else {
            console.error("Failed to save transaction:", transactionResult.error);
            // You might want to show an error message to the user here
            alert("حدث خطأ أثناء حفظ المعاملة. يرجى المحاولة مرة أخرى.");
          }
        } catch (error) {
          console.error("Error processing transfer:", error);
          alert("حدث خطأ أثناء معالجة التحويل. يرجى المحاولة مرة أخرى.");
        }
      },
    });
  };

  const handleCancelTransfer = () => {
    setShowConfirmModal(false);
  };

  return (
    <View className="flex-1 bg-gray-50">
      <CustomHeader
        title="التحويل البنكي"
        onBack={() => navigation.goBack()}
        backgroundColor="#0055aa"
        textColor="#FFFFFF"
        statusBarStyle="light-content"
        statusBarBackgroundColor="#0055aa"
      />

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Current Balance Card */}
        <View className="bg-white mx-4 mt-5 rounded-2xl p-5 shadow-sm">
          <Text className="text-gray-500 text-sm text-center mb-2">
            الرصيد المتاح
          </Text>
          <View className="flex-row items-center justify-center" style={{ direction: "ltr" }}>
            <SvgIcons name="SARBlack" size={28} />
            <Text className="text-gray-800 text-3xl font-bold">
              {balance}
            </Text>
          </View>
        </View>

        {/* Linked Bank Account Card */}
        <View className="bg-white mx-4 mt-4 rounded-2xl p-5 shadow-sm" style={{direction:"rtl"}}>
          {linkedBank ? (
            <>
              {/* Account Details View (when user has linked account) */}
              <View className="flex-row items-center justify-between mb-4">
                <Text className="text-gray-700 text-sm font-semibold">
                  الحساب البنكي المربوط
                </Text>
                <TouchableOpacity
                  className="px-3 py-1"
                  onPress={() => setShowAccountsModal(true)}
                >
                  <Text className="text-[#0055aa] text-sm font-semibold">
                    عرض الكل
                  </Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                className="flex-row-reverse items-center justify-between bg-gray-50 rounded-xl p-4"
                style={{ direction: "rtl" }}
                onPress={() => setShowAccountsModal(true)}
                activeOpacity={0.7}
              >
                {/* Verified Icon */}
                {linkedBank.isVerified && (
                  <View className="bg-green-500 rounded-full w-6 h-6 items-center justify-center">
                    <Feather name="check" size={10} color="white" />
                  </View>
                )}

                {/* Bank Info */}
                <View className="flex-1 mx-3 items-end" style={{ direction: "ltr" }}>
                  <Text className="text-gray-800 text-base font-bold mb-1 text-left">
                    {linkedBank.bankName}
                  </Text>
                  <Text className="text-gray-500 text-sm text-right">
                    {linkedBank.ibanFormatted || `SA•••• •••• •••• ${linkedBank.accountNumber}`}
                  </Text>
                </View>

                {/* Bank Icon */}
                <View className="rounded-xl w-10 h-10 items-center justify-center overflow-hidden">
                  {getBankLogo(linkedBank) ? (
                    <Image
                      source={getBankLogo(linkedBank)}
                      style={{ width: 30, height: 30 }}
                      resizeMode="contain"
                    />
                  ) : (
                    <View className="bg-[#0055aa] rounded-xl w-10 h-10 items-center justify-center">
                      <Feather name="briefcase" size={20} color="white" />
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            </>
          ) : (
            <>
              {/* No Linked Account - Show Add Button */}
              <TouchableOpacity
                onPress={() => navigation.navigate("AddBankAccount")}
                className="border-2 border-dashed border-[#0055aa] rounded-xl p-4 flex-row items-center justify-center"
              >
                <View className="bg-blue-100 rounded-xl w-10 h-10 items-center justify-center mx-2">
                  <Text className="text-[#0055aa] text-2xl font-light">+</Text>
                </View>
                <Text className="text-[#0055aa] text-sm font-bold">
                  إضافة حساب جديد
                </Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        {/* Transfer Amount Card */}
        <View className="bg-white mx-4 mt-4 rounded-2xl p-5 shadow-sm">
          <Text className="text-gray-700 text-sm font-semibold text-center mb-4">
            المبلغ المطلوب تحويله
          </Text>

          {/* Amount Input */}
          <View className="bg-gray-50 rounded-xl p-4 mb-4">
            <View className="flex-row items-center justify-center">
              <SvgIcons name="SAR" size={24} />
              <TextInput
                className="text-gray-800 text-2xl font-bold text-center flex-1 mr-2"
                style={{ fontSize: SIZES.fontSize.xxl }}
                value={amount}
                onChangeText={setAmount}
                keyboardType="numeric"
                placeholder="0"
                placeholderTextColor="#9ca3af"
              />
            </View>
          </View>

          {/* Quick Amount Buttons */}
          <View className="flex-row justify-between mb-4">
            {quickAmounts.map((quickAmount) => (
              <TouchableOpacity
                key={quickAmount}
                onPress={() => handleQuickAmount(quickAmount)}
                className="bg-gray-100 px-4 py-2 rounded-lg"
              >
                <Text className="text-gray-700 text-sm font-semibold">
                  {quickAmount.toLocaleString()}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Continue Button */}
          <Button
            title="متابعة"
            onPress={handleContinue}
            variant="business-primary"
            disabled={!amount || amount === "0"}
            className="w-full"
          />
        </View>

        {/* Notice */}
        <View className="bg-blue-50 mx-4 mt-4 mb-6 rounded-xl p-4">
          <Text className="text-[#0055aa] text-xs text-center leading-5">
            سيتم تحويل المبلغ إلى حسابك البنكي خلال 24 ساعة من وقت تأكيد العملية
          </Text>
        </View>
      </ScrollView>

      {/* Transfer Confirmation Modal */}
      <Modal
        visible={showConfirmModal}
        transparent={true}
        animationType="slide"
        onRequestClose={handleCancelTransfer}
      >
        <View className="flex-1 justify-end bg-black/50">
          <View className="bg-white rounded-t-3xl px-5 pb-8">
            {/* Handle Bar */}
            <View className="items-center py-3">
              <View className="w-12 h-1 bg-gray-300 rounded-full" />
            </View>

            {/* Title */}
            <Text className="text-gray-800 text-xl font-bold text-center mb-6">
              تأكيد التحويل
            </Text>

            {/* Bank Account Info */}
            <View className="bg-gray-50 rounded-xl p-4 mb-4" style={{direction: "ltr"}}>
              <Text className="text-gray-500 text-xs text-right mb-2">
                إلى الحساب البنكي
              </Text>
              <Text className="text-gray-800 text-base font-bold text-right">
                {linkedBank?.ibanFormatted || linkedBank?.iban || "SA•••• •••• •••• 9012"}
              </Text>
            </View>

            {/* Bank Name */}
            <View className="flex-row justify-between items-center mb-4" style={{direction: "ltr"}}>
              <Text className="text-gray-500 text-sm">{linkedBank?.bankName || "مصرف الراجحي"}</Text>
              <Text className="text-gray-700 text-sm font-semibold">البنك</Text>
            </View>

            {/* Amount */}
            <View className="flex-row items-center justify-between mb-4" style={{direction: "ltr"}}>
              <View className="flex-row items-center" style={{ direction: "ltr" }}>
                <SvgIcons name="SARBlack" size={24} />
                <Text className="text-gray-800 text-2xl font-bold ml-1">
                  {amount}
                </Text>
              </View>
              <Text className="text-gray-700 text-sm font-semibold">المبلغ</Text>
            </View>

            {/* Balance After Transfer */}
            <View className="flex-row justify-between items-center mb-6"  style={{ direction: "ltr" }}>
              <View className="flex-row items-center">
                <SvgIcons name="SARBlack" size={20} />
                <Text className="text-gray-800 text-base font-bold ml-1">
                  {businessWallet?.balance
                    ? (businessWallet.balance - parseFloat(amount || 0)).toLocaleString(
                        "en-US",
                        {
                          minimumFractionDigits: 0,
                          maximumFractionDigits: 0,
                        }
                      )
                    : "0"}
                </Text>
              </View>
              <Text className="text-gray-700 text-sm font-semibold">
                الرصيد بعد التحويل
              </Text>
            </View>

            {/* Confirm Button */}
            <Button
              title="تأكيد التحويل"
              onPress={handleConfirmTransfer}
              variant="business-primary"
              className="w-full mb-3"
            />

            {/* Back Button */}
            <TouchableOpacity
              onPress={handleCancelTransfer}
              className="py-3"
            >
              <Text className="text-gray-600 text-center text-base">رجوع</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Linked Bank Accounts Modal */}
      <LinkedBankAccountsModal
        visible={showAccountsModal}
        onClose={() => setShowAccountsModal(false)}
        accounts={bankAccounts}
        selectedAccountId={selectedAccount?.id}
        onAddAccount={() => navigation.navigate("AddBankAccount")}
      />
    </View>
  );
};

export default BankTransferScreen;
