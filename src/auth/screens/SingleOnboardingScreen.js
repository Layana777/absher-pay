import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Dimensions,
} from "react-native";
import SvgIcons from "../../common/components/SvgIcons";

const { width } = Dimensions.get("window");

const onboardingData = [
  {
    id: "1",
    title: "محفظتك الحكومية الآمنة",
    description: "مركز موحد لجميع مدفوعاتك وخدماتك الحكومية في مكان واحد",
    iconPlaceholder: <SvgIcons name={"wallet"} />,
  },
  {
    id: "2",
    title: " الدفع بالهوية الرقمية",
    description: "ادفع بسرعة وأمان باستخدام بصمة الإصبع أو التعرف على الوجه",
    iconPlaceholder: <SvgIcons name={"fingerPrint"} />,
  },
  {
    id: "3",
    title: "ذكاء اصطناعي متقدم",
    description:
      "تنبؤ ذكية بالفواتير القادمة وتذكيرات مبكرة قبل انتهاء الخدمات",
    iconPlaceholder: <SvgIcons name={"Ai"} />,
  },
  {
    id: "4",
    title: "الدفع التلقائي الذكي  ",
    description: " جدول مدفوعاتك تلقائياً ولا تقلق بشأن التأخير أو الغرامات ",
    iconPlaceholder: <SvgIcons name={"directPay"} />,
  },
];

const SingleOnboardingScreen = ({ navigation }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef(null);

  const handleScroll = (event) => {
    const scrollPosition = event.nativeEvent.contentOffset.x;
    const index = Math.round(scrollPosition / width);
    setCurrentIndex(index);
  };

  const handleNext = () => {
    if (currentIndex < onboardingData.length - 1) {
      const nextIndex = currentIndex + 1;
      flatListRef.current?.scrollToOffset({
        offset: nextIndex * width,
        animated: true,
      });
      setCurrentIndex(nextIndex);
    } else {
      // Navigate to next screen (Login/Signup)
      console.log("Navigate to login/signup");
    }
  };

  const handleSkip = () => {
    // Navigate to login/signup
    console.log("Skip to login/signup");
  };

  const renderItem = ({ item }) => (
    <View style={{ width }} className="flex-1 items-center justify-center px-8">
      {/* Icon Placeholder */}
      <View className="w-32 h-32 rounded-full bg-[#028550]/10 items-center justify-center mb-12">
        <View className="w-20 h-20 rounded-full items-center justify-center">
          {/* Icon will be added here */}
          <Text className="text-[#028550] text-2xl font-bold">
            {item.iconPlaceholder}
          </Text>
        </View>
      </View>

      {/* Title */}
      <Text className="text-2xl font-bold text-gray-800 text-center mb-4">
        {item.title}
      </Text>

      {/* Description */}
      <Text className="text-base text-gray-500 text-center leading-6">
        {item.description}
      </Text>
    </View>
  );

  return (
    <View style={{ direction: "ltr" }} className="flex-1 bg-white">
      {/* Top Section - Skip Button & Pagination Dots */}
      <View className="absolute top-16 left-0 right-0 flex-row justify-between items-center px-5 z-10">
        {/* Pagination Dots - Left */}
        <View className="flex-row items-center">
          {onboardingData.map((_, index) => (
            <View
              key={index}
              className={`h-2 rounded-full mx-1 ${
                index === currentIndex ? "w-8 bg-[#028550]" : "w-2 bg-gray-300"
              }`}
            />
          ))}
        </View>

        {/* Skip Button - Right */}
        <TouchableOpacity onPress={handleSkip}>
          <Text className="text-gray-500 text-base">تخطي</Text>
        </TouchableOpacity>
      </View>

      {/* Slides */}
      <FlatList
        ref={flatListRef}
        data={onboardingData}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        getItemLayout={(_, index) => ({
          length: width,
          offset: width * index,
          index,
        })}
      />

      {/* Bottom Section */}
      <View className="pb-10 px-5">
        {/* Next Button */}
        <TouchableOpacity
          onPress={handleNext}
          className="bg-[#028550] rounded-xl py-4 items-center"
          activeOpacity={0.8}
        >
          <Text className="text-white text-lg font-bold">
            {currentIndex === onboardingData.length - 1
              ? "ابدأ الآن"
              : "التالي"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default SingleOnboardingScreen;
