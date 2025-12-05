import { useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  Animated,
  Dimensions,
} from "react-native";
import { GestureDetector, Gesture } from "react-native-gesture-handler";
import { Feather } from "@expo/vector-icons";
import SvgIcons from "../SvgIcons";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

const PaymentMethodSheet = ({
  visible,
  onClose,
  primaryColor = "#0055aa", // أزرق للـ Business، أخضر للـ Customer
  navigation,
}) => {
  const translateY = useRef(new Animated.Value(0)).current;
  const gestureStartY = useRef(0);

  const handleApplePay = () => {
    onClose();
    // الانتقال لشاشة إدخال المبلغ مع Apple Pay
    navigation.navigate("TopupAmount", {
      paymentMethod: "APPLE_PAY",
      primaryColor: primaryColor,
    });
  };

  const handleCard = () => {
    onClose();
    // Always navigate to CardSelection screen where user can choose saved card or add new one
    navigation.navigate("CardSelection", {
      primaryColor: primaryColor,
    });
  };

  const panGesture = Gesture.Pan()
    .onStart(() => {
      gestureStartY.current = translateY._value;
    })
    .onUpdate((event) => {
      // السماح بالسحب لأسفل فقط
      if (event.translationY > 0) {
        translateY.setValue(event.translationY);
      }
    })
    .onEnd((event) => {
      if (event.translationY > 100) {
        // إذا سحب لأسفل أكثر من 100 بكسل، أغلق المودل
        Animated.timing(translateY, {
          toValue: SCREEN_HEIGHT,
          duration: 200,
          useNativeDriver: true,
        }).start(() => {
          translateY.setValue(0);
          onClose();
        });
      } else {
        // إرجاع المودل لمكانه
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
          damping: 20,
          stiffness: 90,
        }).start();
      }
    });

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        activeOpacity={1}
        onPress={onClose}
        className="flex-1 justify-end bg-black/50"
      >
        <TouchableOpacity activeOpacity={1}>
          <GestureDetector gesture={panGesture}>
            <Animated.View
              style={{
                transform: [{ translateY }],
              }}
              className="bg-white rounded-t-3xl"
            >
              {/* Handle Bar */}
              <View className="items-center py-3">
                <View className="w-12 h-1 bg-gray-300 rounded-full" />
              </View>

              {/* Content */}
              <View className="px-6 pb-8">
                {/* Header */}
                <View className="items-center mb-6">
                  <View
                    style={{ backgroundColor: `${primaryColor}9a` }}
                    className="w-16 h-16 rounded-full items-center justify-center mb-3"
                  >
                    <SvgIcons name="CreditCard" size={32} />
                  </View>
                  <Text className="text-gray-900 text-xl font-bold mb-2">
                    اختر طريقة الدفع
                  </Text>
                  <Text className="text-gray-500 text-sm text-center">
                    اختر كيف تريد إضافة الأموال إلى محفظتك
                  </Text>
                </View>

                {/* Payment Options */}
                <View className="gap-3">
                  {/* Apple Pay Option */}
                  <TouchableOpacity
                    onPress={handleApplePay}
                    className="bg-[#1a1a1a] rounded-2xl p-5 flex-row items-center justify-between"
                    activeOpacity={0.7}
                  >
                    <View className="flex-row items-center flex-1">
                      <Feather name="arrow-left" size={20} color="white" />
                      <View className="flex-1">
                        <Text className="text-white text-lg  text-right font-bold mb-1">
                          أبل باي
                        </Text>
                        <Text className="text-white/70 text-right text-xs">
                          ادفع باستخدام Face ID أو Touch ID
                        </Text>
                      </View>
                      <View className="w-12 h-12 bg-white rounded-xl items-center justify-center ml-4">
                        <SvgIcons name={"Apple"} size={30} />
                      </View>
                    </View>
                  </TouchableOpacity>

                  {/* Card Option */}
                  <TouchableOpacity
                    onPress={handleCard}
                    style={{ backgroundColor: primaryColor }}
                    className="rounded-2xl p-5 flex-row items-center justify-between"
                    activeOpacity={0.7}
                  >
                    <Feather name="arrow-left" size={20} color="white" />
                    <View className="flex-row items-center flex-1">
                      <View className="flex-1">
                        <Text className="text-white text-lg text-right font-bold mb-1">
                          بطاقة مدى
                        </Text>
                        <Text className="text-white/80 text-right text-xs">
                          ادفع باستخدام بطاقتك الائتمانية
                        </Text>
                      </View>
                    </View>

                    <View className="w-12 h-12 bg-white/20 rounded-xl items-center justify-center ml-4">
                      <SvgIcons name="CreditCard" size={24} />
                    </View>
                  </TouchableOpacity>
                </View>

                {/* Security Note */}
                <View className="flex-row items-center justify-center mt-6 px-4">
                  <Text className="text-gray-400 text-xs mr-2 text-center">
                    معاملات الدفع الخاصة بك آمنة ومشفرة بالكامل
                  </Text>
                  <Feather name="lock" size={14} color="#9ca3af" />
                </View>
              </View>
            </Animated.View>
          </GestureDetector>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};

export default PaymentMethodSheet;
