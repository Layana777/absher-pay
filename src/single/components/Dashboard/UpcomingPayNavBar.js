import React from "react";
import { View, Text, TouchableOpacity, SafeAreaView, StatusBar } from "react-native";
import { Feather } from "@expo/vector-icons";
import { COLORS } from "../../../common/constants/colors";

/**
 * Single (Customer) Navigation Bar for payment details screen
 *
 * @param {string} primaryColor - Primary brand color (Single green)
 * @param {Function} onBack - Back button callback
 */
const UpcomingPayNavBar = ({ primaryColor = COLORS.singlePrimary, onBack }) => {
  return (
    <View style={{ backgroundColor: primaryColor, direction: "rtl" }}>
      <StatusBar barStyle="light-content" backgroundColor={primaryColor} />
      <SafeAreaView>
        <View className="absolute top-[4%] left-[-14%] w-40 h-40 rounded-full opacity-10 bg-white" />
        <View className="flex-row items-center justify-between px-4 py-4">
          {/* Empty Space for Balance */}
          <View style={{ width: 40 }} />

          {/* Center Title */}
          <Text className="text-white text-lg font-semibold">
            تفاصيل الدفعة
          </Text>

          {/* Back Button */}
          <TouchableOpacity onPress={onBack} className="p-2">
            <Feather name="arrow-left" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
};

export default UpcomingPayNavBar;
