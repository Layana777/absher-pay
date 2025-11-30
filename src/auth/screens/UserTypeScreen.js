import React, { useState } from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import AbsherPay from "../../common/assets/icons/logo-white-abhser.svg";
const UserTypeScreen = ({ navigation }) => {
  const [selectedType, setSelectedType] = useState(null);

  const handleSingleUserPress = () => {
    setSelectedType("single");
    navigation.navigate("SingleSplash");
  };

  const handleBusinessPress = () => {
    setSelectedType("business");
    navigation.navigate("BusinessSplash");
  };

  return (
    <View className="flex-1 bg-[#F5F7FA] px-5 pt-[60px] pb-2.5">
      {/* Cards Container */}
      <View className="flex-[0.9] justify-center gap-5">
        {/* Header */}
        <Text className="text-[32px] font-bold text-[#1A1A1A] text-center mb-3">
          مرحباً بك
        </Text>
        <Text className="text-base text-gray-500 text-center mb-10">
          اختر نوع الحساب للمتابعة
        </Text>

        {/* Single User Card */}
        <TouchableOpacity
          className={`bg-white rounded-2xl p-6 shadow-md border-2 ${
            selectedType === "single" ? "border-[#028550]" : "border-gray-200"
          }`}
          onPress={handleSingleUserPress}
          activeOpacity={0.8}
          style={{
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 4,
          }}
        >
          <View className="flex-row items-center mb-4">
            <View className="flex-1">
              <Text className="text-[22px] font-bold text-[#1A1A1A] mb-1 text-right">
                أبشر أفراد
              </Text>
              <Text className="text-sm text-gray-500 text-right">
                للأفراد والمواطنين
              </Text>
            </View>

            {/* Icon */}
            <View className="w-16 h-16 rounded-xl justify-center items-center ml-4 bg-[#028550] opacity-90">
              <AbsherPay width={50} />
            </View>
          </View>

          <View className="h-1 rounded-lg bg-[#028550] my-4" />

          <Text className="text-sm text-gray-500 text-center">
            إدارة المدفوعات الحكومية الشخصية
          </Text>
        </TouchableOpacity>

        {/* Business Card */}
        <TouchableOpacity
          className={`bg-white rounded-2xl p-6 shadow-md border-2 ${
            selectedType === "business" ? "border-[#0055aa]" : "border-gray-200"
          }`}
          onPress={handleBusinessPress}
          activeOpacity={0.8}
          style={{
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 4,
          }}
        >
          <View className="flex-row items-center mb-4">
            <View className="flex-1">
              <Text className="text-[22px] font-bold text-[#1A1A1A] mb-1 text-right">
                أبشر أعمال
              </Text>
              <Text className="text-sm text-gray-500 text-right">
                للمنشآت والشركات
              </Text>
            </View>

            {/* Icon */}
            <View className="w-16 h-16 rounded-xl justify-center items-center ml-4 bg-[#0055aa]">
              <AbsherPay width={50} />
            </View>
          </View>

          <View className="h-1 rounded-lg bg-[#0055aa] my-4" />

          <Text className="text-sm text-gray-500 text-center">
            إدارة المدفوعات الحكومية للمنشآت
          </Text>
        </TouchableOpacity>
      </View>

      {/* Footer */}
      <Text className="text-xs text-gray-400 text-center mt-2.5">
        خدمة آمنة ومشفرة من وزارة الداخلية
      </Text>
    </View>
  );
};

export default UserTypeScreen;
