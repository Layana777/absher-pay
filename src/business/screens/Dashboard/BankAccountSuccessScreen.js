import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Feather } from "@expo/vector-icons";
import { CommonActions } from "@react-navigation/native";
import Button from "../../../common/components/ui/Button";
import CustomHeader from "../../../common/components/CustomHeader";

const BankAccountSuccessScreen = ({ navigation, route }) => {
  const { bankName, iban } = route?.params || {};

  const handleGoToDashboard = () => {
    // Reset navigation stack to prevent going back to this screen
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: "BusinessTabs" }],
      })
    );
  };

  const handleGoToTransfer = () => {
    // Reset navigation and go to transfer screen
    navigation.dispatch(
      CommonActions.reset({
        index: 1,
        routes: [
          { name: "BusinessTabs" },
          { name: "BankTransfer" }
        ],
      })
    );
  };

  return (
    <View className="flex-1 bg-gray-50">
      <CustomHeader
        title="تم اضافة الحساب بنجاح"
        onBack={handleGoToDashboard}
        backgroundColor="#0055aa"
        textColor="#FFFFFF"
        statusBarStyle="light-content"
        statusBarBackgroundColor="#0055aa"
      />

      <View className="flex-1 items-center justify-center px-6">
        {/* Success Icon */}
        <View className="bg-green-100 rounded-full w-32 h-32 items-center justify-center mb-8">
          <View className="bg-green-500 rounded-full w-28 h-28 items-center justify-center">
            <Feather name="check" size={64} color="white" />
          </View>
        </View>

        {/* Success Message */}
        <Text className="text-gray-600 text-base text-center mb-8 leading-6">
          تمت اضافة الحساب بنجاح{"\n"}
          يمكنك الآن تحويل الأموال إلى حسابك
        </Text>

      {/* Account Details Card */}
      <View className="bg-white rounded-2xl p-5 w-full mb-8 shadow-sm" style={{direction: "ltr"}}>
        {/* Bank Name */}
        <View className="flex-row-reverse justify-between items-center mb-4 pb-4 border-b border-gray-100" style={{direction: "ltr"}}>
          <Text className="text-gray-500 text-sm">البنك</Text>
          <Text className="text-gray-800 text-base font-semibold">
            {bankName || "مصرف الراجحي"}
          </Text>
        </View>

        {/* IBAN */}
        <View className="flex-row-reverse justify-between items-center" style={{direction: "ltr"}}>
          <Text className="text-gray-500 text-sm">رقم الايبان</Text>
          <Text className="text-gray-800 text-sm font-mono">
            {iban || "SA03 8000 0000 6080 1016 7519"}
          </Text>
        </View>
      </View>

      {/* Buttons */}
      <View className="w-full">
        {/* Transfer Now Button */}
        <Button
          title="التحويل الآن"
          onPress={handleGoToTransfer}
          variant="business-primary"
          className="w-full mb-3"
        />

        {/* Go to Dashboard Button */}
        <TouchableOpacity
          onPress={handleGoToDashboard}
          className="py-4"
        >
          <Text className="text-gray-600 text-center text-base font-semibold">
            العودة للرئيسية
          </Text>
        </TouchableOpacity>
      </View>
      </View>
    </View>
  );
};

export default BankAccountSuccessScreen;
