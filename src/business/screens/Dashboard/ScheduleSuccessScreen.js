import React from "react";
import { View, Text, TouchableOpacity, SafeAreaView } from "react-native";
import { Feather } from "@expo/vector-icons";

const ScheduleSuccessScreen = ({ route, navigation }) => {
  const { billNumber, paymentDate, serviceName, amount } = route.params;
  const primaryColor = "#0055aa";

  const handleDone = () => {
    // Navigate to main screen (BusinessHome with WalletCard)
    navigation.navigate("BusinessHome");
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 justify-center px-5">
        {/* Success Icon */}
        <View className="items-center mb-6">
          <View
            className="rounded-full items-center justify-center"
            style={{
              width: 80,
              height: 80,
              backgroundColor: '#10B981',
            }}
          >
            <Feather name="check" size={48} color="white" />
          </View>
        </View>

        {/* Success Message */}
        <Text className="text-gray-800 text-xl font-bold text-center mb-4">
          تم جدولة الفاتورة بنجاح
        </Text>

        {/* Bill Details Card */}
        <View className="bg-gray-50 rounded-2xl p-4 mb-4 mx-0">
          {/* Bill Number */}
          <View className="flex-row items-center justify-between mb-3 pb-3 border-b border-gray-200" style={{direction: "ltr"}}>
            <View className="flex-1 items-center">
              <Text className="text-gray-800 text-sm font-bold">{billNumber}</Text>
            </View>
            <Text className="text-gray-700 text-xs font-semibold">رقم المرجع</Text>
          </View>

          {/* Service Name */}
          <View className="flex-row items-center justify-between mb-3 pb-3 border-b border-gray-200" style={{direction: "ltr"}}>
            <View className="flex-1 items-center">
              <Text className="text-gray-800 text-sm font-semibold">{serviceName}</Text>
            </View>
            <Text className="text-gray-700 text-xs font-semibold">الخدمة</Text>
          </View>

          {/* Amount */}
          <View className="flex-row items-center justify-between mb-3 pb-3 border-b border-gray-200" style={{direction: "ltr"}}>
            <View className="flex-1 items-center">
              <Text className="text-gray-800 text-sm font-semibold">{amount}</Text>
            </View>
            <Text className="text-gray-700 text-xs font-semibold">المبلغ</Text>
          </View>

          {/* Scheduled Date */}
          <View className="flex-row items-center justify-between mb-3" style={{direction: "ltr"}}>
            <View className="flex-1 items-center" style={{paddingLeft: 75}}>
              <Text className="text-gray-800 text-sm font-semibold text-center">{paymentDate}</Text>
            </View>
            <Text className="text-gray-700 text-xs font-semibold">تاريخ الدفع المجدول</Text>
          </View>
        </View>

        {/* Info Message */}
        <View className="flex-row items-center bg-blue-50 rounded-xl p-3 mb-4">
          <Feather name="info" size={16} color={primaryColor} style={{ marginLeft: 8, marginRight: 8 }} />
          <Text className="text-gray-700 text-xs">
            سيتم الدفع تلقائياً في التاريخ المحدد
          </Text>

        </View>

        {/* Done Button */}
        <TouchableOpacity
          onPress={handleDone}
          className="rounded-xl py-3"
          style={{ backgroundColor: primaryColor }}
        >
          <Text className="text-white text-base font-semibold text-center">
            تم
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default ScheduleSuccessScreen;
