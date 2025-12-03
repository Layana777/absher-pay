import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Feather } from "@expo/vector-icons";

const WalletCard = ({
  balance = "45,230",
  institution = "مؤسسة النجاح التجارية",
  crNumber = "1010567890",
}) => {
  return (
    <View
      className="bg-[#0055aa] rounded-b-3xl p-5"
      style={{ direction: "ltr" }}
    >
      {/* Header with Institution Name */}

      <View className="items-end mb-6 ">
        <Text className="text-white/80 text-sm mb-1">مرحباً</Text>
        <Text className="text-white text-xl font-bold mb-1">{institution}</Text>
        <Text className="text-white/60 text-xs">س.ت {crNumber}</Text>
      </View>

      {/* Main Balance Card */}
      <View className="bg-white/10 backdrop-blur rounded-2xl p-5 mb-4">
        <Text className="text-white/80 text-sm text-center mb-2">
          رصيد المحفظة
        </Text>
        <View className="flex-row items-center justify-center mb-4">
          <Text className="text-white text-4xl font-bold">{balance}</Text>
          <Text className="text-white text-xl font-bold mr-2">ريال</Text>
        </View>

        {/* Action Buttons */}
        <View className="flex-row gap-3">
          <TouchableOpacity className="flex-1 bg-white/20 backdrop-blur rounded-xl py-3 items-center">
            <Feather name="plus" size={20} color="white" />
            <Text className="text-white text-xs font-bold mt-1">تعزيز +</Text>
          </TouchableOpacity>

          <TouchableOpacity className="flex-1 bg-white rounded-xl py-3 items-center">
            <Feather name="download" size={20} color="#0055aa" />
            <Text className="text-[#0055aa] text-xs font-bold mt-1">
              تحميل المحفظة
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Savings Section */}
      <View className="bg-white/10 backdrop-blur rounded-2xl p-4">
        <Text className="text-white/80 text-xs text-right mb-2">
          إجمالي المبلغ على هذا الشهر
        </Text>
        <View className="flex-row items-end justify-between mb-3">
          <View className="flex-row items-end">
            <Text className="text-white text-2xl font-bold">28,450</Text>
            <Text className="text-white text-base font-bold mr-2">ريال</Text>
          </View>
          <View className="flex-row items-center">
            <Text className="text-green-300 text-xs mr-1">17.1%</Text>
            <Feather name="trending-up" size={14} color="#86efac" />
          </View>
        </View>

        {/* Sub Action Buttons */}
        <View className="flex-row gap-3">
          <TouchableOpacity className="flex-1 bg-white/15 rounded-xl py-3 items-center">
            <Text className="text-white text-xs font-bold">الفواتير</Text>
          </TouchableOpacity>

          <TouchableOpacity className="flex-1 bg-white rounded-xl py-3 items-center">
            <Text className="text-[#0055aa] text-xs font-bold">
              عرض التفاصيل
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default WalletCard;
