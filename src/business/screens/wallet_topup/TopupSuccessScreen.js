import React, { useEffect, useRef, useState } from "react";
import { View, Text, TouchableOpacity, Animated } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { CommonActions } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";
import SvgIcons from "../../../common/components/SvgIcons";
import { formatAmount } from "../../../common/utils";

const TopupSuccessScreen = ({ navigation, route }) => {
  const { amount, primaryColor = "#0055aa" } = route.params || {};

  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Generate transaction number only once
  const [transactionNumber] = useState(() =>
    Math.random().toString(36).substring(2, 10).toUpperCase()
  );

  useEffect(() => {
    // Animate checkmark
    Animated.sequence([
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 5,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleDone = () => {
    // Reset navigation stack and go back to Home tab
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [
          {
            name: "BusinessTabs",
            state: {
              routes: [{ name: "Home" }],
              index: 0,
            },
          },
        ],
      })
    );
  };

  const transactionDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const transactionTime = new Date().toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <SafeAreaView className="flex-1 bg-backgroundRGB">
      <View className="flex-1 justify-center items-center px-6">
        {/* Animated Success Icon */}
        <Animated.View
          style={{
            transform: [{ scale: scaleAnim }],
            backgroundColor: `${primaryColor}15`,
          }}
          className="w-24 h-24 rounded-full items-center justify-center mb-6"
        >
          <View
            className="w-20 h-20 rounded-full items-center justify-center"
            style={{ backgroundColor: primaryColor }}
          >
            <Feather name="check" size={40} color="white" />
          </View>
        </Animated.View>

        {/* Success Message */}
        <Animated.View
          style={{ opacity: fadeAnim }}
          className="items-center mb-8"
        >
          <Text className="text-2xl font-bold text-gray-900 mb-2">
            تمت العملية بنجاح
          </Text>
          <Text className="text-gray-600 text-center">
            تم إضافة الرصيد إلى محفظتك
          </Text>
        </Animated.View>

        {/* Transaction Details */}
        <Animated.View
          style={{ opacity: fadeAnim }}
          className="w-full bg-gray-50 rounded-2xl p-6 mb-8"
        >
          {/* Amount */}
          <View className="items-center mb-6 pb-6 border-b border-gray-200">
            <Text className="text-gray-600 text-sm mb-2">المبلغ المضاف</Text>
            <View className="flex-row items-center">
              <Text
                className="text-3xl font-bold mr-2"
                style={{ color: primaryColor }}
              >
                <SvgIcons name={"SARBlue"} size={25} />

                {formatAmount(amount)}
              </Text>
            </View>
          </View>

          {/* Transaction Info */}
          <View className="space-y-3">
            <View className="flex-row justify-between items-center">
              <Text className="text-gray-900 font-medium">التاريخ</Text>
              <Text className="text-gray-600">{transactionDate}</Text>
            </View>

            <View className="flex-row justify-between items-center">
              <Text className="text-gray-900 font-medium">الوقت</Text>
              <Text className="text-gray-600">{transactionTime}</Text>
            </View>

            <View className="flex-row justify-between items-center">
              <Text className="text-gray-900 font-medium">رقم العملية</Text>
              <Text className="text-gray-600">{transactionNumber}</Text>
            </View>
          </View>
        </Animated.View>

        {/* Done Button */}
        <Animated.View style={{ opacity: fadeAnim }} className="w-full">
          <TouchableOpacity
            onPress={handleDone}
            className="rounded-lg py-4"
            style={{ backgroundColor: primaryColor }}
          >
            <Text className="text-white text-center text-base font-semibold">
              تم
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
};

export default TopupSuccessScreen;
