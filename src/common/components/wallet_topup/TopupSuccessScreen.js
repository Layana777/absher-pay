import { useEffect } from "react";
import { View, Text, TouchableOpacity, Animated } from "react-native";
import { Feather } from "@expo/vector-icons";
import SvgIcons from "../SvgIcons";

const TopupSuccessScreen = ({ amount, onDone, primaryColor = "#0055aa" }) => {
  const scaleAnim = new Animated.Value(0);
  const fadeAnim = new Animated.Value(0);

  useEffect(() => {
    Animated.sequence([
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <View className="flex-1 bg-white">
      {/* Content */}
      <View className="flex-1 justify-center items-center px-6">
        {/* Success Icon */}
        <Animated.View
          style={{
            transform: [{ scale: scaleAnim }],
          }}
          className="mb-8"
        >
          <View className="w-32 h-32 bg-green-500/10 rounded-full items-center justify-center">
            <View className="w-24 h-24 bg-green-500/20 rounded-full items-center justify-center">
              <View style={{ backgroundColor: primaryColor }} className="w-20 h-20 rounded-full items-center justify-center">
                <Feather name="check" size={48} color="white" />
              </View>
            </View>
          </View>
        </Animated.View>

        {/* Success Message */}
        <Animated.View
          style={{ opacity: fadeAnim }}
          className="items-center mb-8"
        >
          <Text className="text-gray-900 text-3xl font-bold mb-3 text-center">
            تم شحن المحفظة بنجاح
          </Text>
          <Text className="text-gray-500 text-base text-center mb-6">
            تم إضافة المبلغ إلى محفظتك بنجاح
          </Text>

          {/* Amount Display */}
          <View className="bg-gray-50 rounded-3xl p-6 w-full items-center mb-4">
            <Text className="text-gray-500 text-sm mb-2">المبلغ المضاف</Text>
            <View className="flex-row items-center justify-center">
              <SvgIcons name="SAR" size={40} />
              <Text style={{ color: primaryColor }} className="text-5xl font-bold">
                {amount}
              </Text>
            </View>
            <Text className="text-gray-400 text-sm mt-2">ريال سعودي</Text>
          </View>

          {/* Transaction Details */}
          <View className="w-full bg-blue-50 border border-blue-100 rounded-2xl p-5">
            <View className="flex-row justify-between items-center mb-3">
              <Text className="text-gray-500 text-sm">رقم العملية</Text>
              <Text className="text-gray-900 text-sm font-semibold">
                #TRX-{Date.now().toString().slice(-8)}
              </Text>
            </View>
            <View className="flex-row justify-between items-center mb-3">
              <Text className="text-gray-500 text-sm">التاريخ</Text>
              <Text className="text-gray-900 text-sm font-semibold">
                {new Date().toLocaleDateString("ar-SA")}
              </Text>
            </View>
            <View className="flex-row justify-between items-center">
              <Text className="text-gray-500 text-sm">الوقت</Text>
              <Text className="text-gray-900 text-sm font-semibold">
                {new Date().toLocaleTimeString("ar-SA", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </Text>
            </View>
          </View>
        </Animated.View>

        {/* Success Features */}
        <Animated.View
          style={{ opacity: fadeAnim }}
          className="w-full gap-3 mb-8"
        >
          <View className="flex-row items-center">
            <View className="w-10 h-10 bg-green-500/10 rounded-full items-center justify-center">
              <Feather name="check-circle" size={20} color="#10b981" />
            </View>
            <Text className="text-gray-600 text-sm mr-3">
              تم تحديث رصيد المحفظة فوراً
            </Text>
          </View>
          <View className="flex-row items-center">
            <View className="w-10 h-10 bg-green-500/10 rounded-full items-center justify-center">
              <Feather name="shield" size={20} color="#10b981" />
            </View>
            <Text className="text-gray-600 text-sm mr-3">
              عملية آمنة ومشفرة بالكامل
            </Text>
          </View>
          <View className="flex-row items-center">
            <View className="w-10 h-10 bg-green-500/10 rounded-full items-center justify-center">
              <Feather name="mail" size={20} color="#10b981" />
            </View>
            <Text className="text-gray-600 text-sm mr-3">
              تم إرسال إيصال العملية إلى بريدك
            </Text>
          </View>
        </Animated.View>
      </View>

      {/* Action Buttons */}
      <Animated.View style={{ opacity: fadeAnim }} className="px-6 pb-8">
        <TouchableOpacity
          onPress={onDone}
          style={{ backgroundColor: primaryColor }}
          className="rounded-2xl py-5 items-center shadow-lg mb-3"
          activeOpacity={0.8}
        >
          <View className="flex-row items-center">
            <Text className="text-white text-lg font-bold">
              العودة إلى الرئيسية
            </Text>
            <Feather
              name="home"
              size={20}
              color="white"
              style={{ marginRight: 8 }}
            />
          </View>
        </TouchableOpacity>

        {/* Share Receipt */}
        <TouchableOpacity
          className="bg-gray-100 rounded-2xl py-4 items-center"
          activeOpacity={0.8}
        >
          <View className="flex-row items-center">
            <Text className="text-gray-700 text-base font-semibold">
              مشاركة الإيصال
            </Text>
            <Feather
              name="share-2"
              size={18}
              color="#374151"
              style={{ marginRight: 8 }}
            />
          </View>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

export default TopupSuccessScreen;
