import React from "react";
import { View, Text, TouchableOpacity, Modal, FlatList, Image } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useDispatch } from "react-redux";
import { selectBankAccount } from "../../store/slices/bankAccountsSlice";

const LinkedBankAccountsModal = ({ visible, onClose, accounts, onAddAccount, selectedAccountId }) => {
  const dispatch = useDispatch();

  const handleSelectAccount = (account) => {
    dispatch(selectBankAccount(account.id));
    onClose();
  };

  const renderBankAccount = ({ item }) => {
    const isSelected = item.id === selectedAccountId;

    return (
      <TouchableOpacity
        onPress={() => handleSelectAccount(item)}
        className="px-5 py-4 border-b border-gray-100 flex-row-reverse items-center justify-between"
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
            {item.iban}
          </Text>
          <Text className="text-gray-400 text-xs text-right">
            {item.accountOwner}
          </Text>
        </View>

        {/* Bank Icon/Logo */}
        <View className="rounded-xl w-12 h-12 items-center justify-center ml-3">
          {item.bankLogo ? (
            <Image source={item.bankLogo} style={{ width: 32, height: 32 }} resizeMode="contain" />
          ) : (
            <Feather name="briefcase" size={24} color="#0055aa" />
          )}
        </View>
      </TouchableOpacity>
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

          {/* Add Account Button */}
          <View className="px-5 pt-3 pb-8 border-t border-gray-200">
            <TouchableOpacity
              onPress={() => {
                onClose();
                onAddAccount();
              }}
              className="bg-[#0055aa] rounded-xl py-4 flex-row-reverse items-center justify-center"
            >
              <Text className="text-white text-base font-semibold">
                إضافة حساب جديد
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default LinkedBankAccountsModal;
