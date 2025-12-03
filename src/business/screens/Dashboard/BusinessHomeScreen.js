import React from "react";
import {
  View,
  ScrollView,
  StatusBar,
  TouchableOpacity,
  Text,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { WalletCard } from "../../components";
import SvgIcons from "../../../common/components/SvgIcons";

const BusinessHomeScreen = ({ navigation }) => {
  return (
    <View className="flex-1 bg-white" style={{ direction: "ltr" }}>
      <StatusBar barStyle="light-content" backgroundColor="#0055aa" />

      {/* Top Header with Notification and Menu */}
      <View className="bg-[#0055aa] pt-12 pb-4 px-6 flex-row justify-between items-center">
        <TouchableOpacity className="relative">
          <Feather name="bell" size={24} color="white" />
          <View className="absolute -top-1 -right-1 bg-red-500 rounded-full w-4 h-4 items-center justify-center">
            <Text className="text-white text-xs font-bold">3</Text>
          </View>
        </TouchableOpacity>

        <SvgIcons name={"AbsherWhite"} size={45} />
      </View>

      <ScrollView className="flex-1 bg-gray-50">
        {/* Wallet Card Component */}
        <WalletCard
          balance="45,230"
          institution="مؤسسة النجاح التجارية"
          crNumber="1010567890"
        />
      </ScrollView>
    </View>
  );
};

export default BusinessHomeScreen;
