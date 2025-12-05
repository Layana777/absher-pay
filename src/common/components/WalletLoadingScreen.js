import React, { useEffect, useRef } from "react";
import { View, Text, Animated } from "react-native";
import WalletIcon from "../assets/icons/wallet.svg";
import SvgIcons from "./SvgIcons";
const WalletLoadingScreen = ({
  backgroundColor = "#0055aa",
  message = "جاري إنشاء محفظتك الرقمية...",
  subtitle = "لحظات وستكون جاهزاً",
  footerText = "محفظتك آمنة ومحمية بأعلى معايير الأمان",
}) => {
  // Animation values for three dots
  const dot1Opacity = useRef(new Animated.Value(0.3)).current;
  const dot2Opacity = useRef(new Animated.Value(0.3)).current;
  const dot3Opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    // Create staggered animation for dots
    const animateDots = () => {
      Animated.sequence([
        Animated.timing(dot1Opacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(dot2Opacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(dot3Opacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.parallel([
          Animated.timing(dot1Opacity, {
            toValue: 0.3,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(dot2Opacity, {
            toValue: 0.3,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(dot3Opacity, {
            toValue: 0.3,
            duration: 400,
            useNativeDriver: true,
          }),
        ]),
      ]).start(() => animateDots());
    };

    animateDots();
  }, [dot1Opacity, dot2Opacity, dot3Opacity]);

  return (
    <View
      className="flex-1 justify-center items-center px-5"
      style={{ backgroundColor }}
    >
      {/* Background Circle Decorations */}
      <View className="absolute top-[15%] right-[10%] w-40 h-40 rounded-full opacity-10 bg-white" />
      <View className="absolute bottom-[25%] left-[5%] w-32 h-32 rounded-full opacity-10 bg-white" />

      {/* Wallet Icon */}
      <View className="items-center mb-8">
        <SvgIcons name="AbsherWhite" size={100} />
      </View>

      {/* Message */}
      <Text className="text-2xl font-bold text-white text-center mb-3">
        {message}
      </Text>

      {/* Subtitle */}
      <Text className="text-base text-white/90 text-center mb-16">
        {subtitle}
      </Text>

      {/* Loading Indicator - Three Dots */}
      <View className="flex-row gap-2 mb-16">
        <Animated.View
          className="w-2.5 h-2.5 rounded-full bg-white"
          style={{ opacity: dot1Opacity }}
        />
        <Animated.View
          className="w-2.5 h-2.5 rounded-full bg-white"
          style={{ opacity: dot2Opacity }}
        />
        <Animated.View
          className="w-2.5 h-2.5 rounded-full bg-white"
          style={{ opacity: dot3Opacity }}
        />
      </View>

      {/* Footer */}
      <View className="absolute bottom-10">
        <Text className="text-xs text-white/80 text-center">{footerText}</Text>
      </View>
    </View>
  );
};

export default WalletLoadingScreen;
