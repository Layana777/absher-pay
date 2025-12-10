import React, { useState } from "react";
import { View, Text, TouchableOpacity, Modal, FlatList, Image, Alert } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useDispatch } from "react-redux";
import { selectBankAccount, removeBankAccount } from "../../store/slices/bankAccountsSlice";
import { deleteBankAccount } from "../../common/services/bankAccountService";
import { useUser } from "../../store/hooks";

// Saudi Banks logos mapping by ID
const BANK_LOGOS = {
  "1": require("../../common/assets/icons/alrajhi-logo.png"),
  "2": require("../../common/assets/icons/snb-logo.png"),
  "3": require("../../common/assets/icons/riyad-bank-logo.png"),
  "4": require("../../common/assets/icons/sabb-logo.png"),
  "5": require("../../common/assets/icons/anb-logo.png"),
  "6": require("../../common/assets/icons/albilad-logo.png"),
  "7": require("../../common/assets/icons/alinma-logo.png"),
  "8": require("../../common/assets/icons/aljazira-logo.png"),
};

// Fallback mapping by bank name (for older accounts without bankId)
const BANK_LOGOS_BY_NAME = {
  "مصرف الراجحي": require("../../common/assets/icons/alrajhi-logo.png"),
  "البنك الأهلي السعودي": require("../../common/assets/icons/snb-logo.png"),
  "بنك الرياض": require("../../common/assets/icons/riyad-bank-logo.png"),
  "بنك السعودي الأول": require("../../common/assets/icons/sabb-logo.png"),
  "البنك العربي الوطني": require("../../common/assets/icons/anb-logo.png"),
  "بنك البلاد": require("../../common/assets/icons/albilad-logo.png"),
  "بنك الإنماء": require("../../common/assets/icons/alinma-logo.png"),
  "بنك الجزيرة": require("../../common/assets/icons/aljazira-logo.png"),
};

// Helper function to get bank logo
const getBankLogo = (account) => {
  // Try bankId first (new accounts)
  if (account.bankId && BANK_LOGOS[account.bankId]) {
    return BANK_LOGOS[account.bankId];
  }

  // Fallback to bank name (old accounts)
  if (account.bankName && BANK_LOGOS_BY_NAME[account.bankName]) {
    return BANK_LOGOS_BY_NAME[account.bankName];
  }

  // Check if bankLogo property exists
  if (account.bankLogo) {
    return account.bankLogo;
  }

  return null;
};

const LinkedBankAccountsModal = ({ visible, onClose, accounts, onAddAccount, selectedAccountId }) => {
  const dispatch = useDispatch();
  const user = useUser();
  const [deletingAccountId, setDeletingAccountId] = useState(null);

  const handleSelectAccount = (account) => {
    dispatch(selectBankAccount(account.id));
    onClose();
  };

  const handleDeleteAccount = (account) => {
    Alert.alert(
      "حذف الحساب البنكي",
      `هل أنت متأكد من حذف حساب ${account.bankName}؟\n${account.ibanFormatted || account.iban}`,
      [
        {
          text: "إلغاء",
          style: "cancel"
        },
        {
          text: "حذف",
          style: "destructive",
          onPress: async () => {
            try {
              setDeletingAccountId(account.id);

              // Delete from Firebase
              const result = await deleteBankAccount(user?.uid, account.id);

              if (result.success) {
                console.log("Bank account deleted from Firebase:", account.id);

                // Remove from Redux
                dispatch(removeBankAccount(account.id));

                // Show success message
                Alert.alert("تم الحذف", "تم حذف الحساب البنكي بنجاح");
              } else {
                console.error("Failed to delete bank account:", result.error);
                Alert.alert("خطأ", "حدث خطأ أثناء حذف الحساب البنكي");
              }
            } catch (error) {
              console.error("Error deleting bank account:", error);
              Alert.alert("خطأ", "حدث خطأ أثناء حذف الحساب البنكي");
            } finally {
              setDeletingAccountId(null);
            }
          }
        }
      ],
      { cancelable: true }
    );
  };

  const renderBankAccount = ({ item }) => {
    const isSelected = item.id === selectedAccountId;

    return (
      <View className="px-5 py-4 border-b border-gray-100">
        <TouchableOpacity
          onPress={() => handleSelectAccount(item)}
          className="flex-row-reverse items-center"
          style={{direction:"rtl"}}
        >
          {/* Selection Indicator */}
          <View className="w-6">
            {isSelected && (
              <View className="bg-[#0055aa] rounded-full w-6 h-6 items-center justify-center">
                <Feather name="check" size={16} color="white" />
              </View>
            )}
          </View>

          {/* Account Info */}
          <View className="flex-1 items-end mr-3" style={{direction:"ltr"}}>
            <Text className="text-gray-800 text-base font-bold mb-1 text-right">
              {item.bankName}
            </Text>
            <Text className="text-gray-500 text-sm text-right mb-1">
              {item.ibanFormatted || item.iban}
            </Text>
            <Text className="text-gray-400 text-xs text-right">
              {item.accountOwner}
            </Text>
          </View>

          {/* Bank Icon/Logo */}
          <View className="rounded-xl w-12 h-12 items-center justify-center ml-3" style={{direction:"rtl"}}>
            {getBankLogo(item) ? (
              <Image source={getBankLogo(item)} style={{ width: 32, height: 32 }} resizeMode="contain" />
            ) : (
              <Feather name="briefcase" size={24} color="#0055aa" />
            )}
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/50 justify-end">
        <View className="bg-white rounded-t-3xl" style={{ maxHeight: "80%" }}>
          {/* Modal Header */}
          <View className="px-5 py-4 border-b border-gray-200 flex-row-reverse items-center justify-between">
            <View className="w-8" />
            <Text className="text-gray-800 text-xl font-bold flex-1 text-center">
              الحسابات المربوطة
            </Text>
            <TouchableOpacity onPress={onClose}>
              <Feather name="x" size={24} color="#6b7280" />
            </TouchableOpacity>
          </View>

          {/* Accounts List */}
          {accounts.length > 0 ? (
            <FlatList
              data={accounts}
              keyExtractor={(item) => item.id}
              renderItem={renderBankAccount}
              showsVerticalScrollIndicator={false}
            />
          ) : (
            <View className="py-12 px-6 items-center">
              <View className="bg-gray-100 rounded-full w-20 h-20 items-center justify-center mb-4">
                <Feather name="briefcase" size={40} color="#9ca3af" />
              </View>
              <Text className="text-gray-600 text-base text-center mb-2">
                لا توجد حسابات مربوطة
              </Text>
              <Text className="text-gray-400 text-sm text-center mb-6">
                قم بإضافة حساب بنكي للبدء في التحويلات
              </Text>
            </View>
          )}

          {/* Action Buttons */}
          <View className="px-5 pt-3 pb-8 border-t border-gray-200">
            {/* Add Account Button */}
            <TouchableOpacity
              onPress={() => {
                onClose();
                onAddAccount();
              }}
              className="bg-[#0055aa] rounded-xl py-4 flex-row-reverse items-center justify-center mb-3"
            >
              <Text className="text-white text-base font-semibold">
                إضافة حساب جديد
              </Text>
            </TouchableOpacity>

            {/* Delete Selected Account Button */}
            <TouchableOpacity
              onPress={() => {
                const selectedAccount = accounts.find(acc => acc.id === selectedAccountId);
                if (selectedAccount) {
                  handleDeleteAccount(selectedAccount);
                }
              }}
              disabled={!selectedAccountId || deletingAccountId !== null}
              className={`${
                !selectedAccountId || deletingAccountId !== null
                  ? "bg-gray-100 border-2 border-gray-300"
                  : "bg-white border-2 border-red-500"
              } rounded-xl py-4 flex-row-reverse items-center justify-center`}
            >
              {deletingAccountId !== null ? (
                <Feather name="loader" size={20} color="#ef4444" />
              ) : (
                <Text className={`${
                  !selectedAccountId || deletingAccountId !== null
                    ? "text-gray-400"
                    : "text-red-500"
                } text-base font-semibold`}>
                  حذف الحساب
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default LinkedBankAccountsModal;
