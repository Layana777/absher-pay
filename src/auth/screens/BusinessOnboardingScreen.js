import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Dimensions,
} from "react-native";
import SvgIcons from "../../common/components/SvgIcons";
import { PaginationDots } from "../../common/components/ui";

const { width } = Dimensions.get("window");

const onboardingData = [
  {
    id: "1",
    title: "إدارة مدفوعات منشأتك",
    description:
      "جميع مدفوعات منشأتك في مكان واحد لعرض ومراجعة كل العمليات بسهولة.",
    icon: <SvgIcons name={"paymentManagement"} size={80} />,
  },
  {
    id: "2",
    title: "ذكاء اصطناعي متقدم",
    description:
      "تحليلات ذكية للعمليات والمدفوعات لمساعدتك في اتخاذ قرارات أفضل.",
    icon: <SvgIcons name={"businessAi"} size={80} />,
  },
  {
    id: "3",
    title: "تحليلات شاملة",
    description: "رسوم بيانية وتقارير تفصيلية لحالة المبيعات وتدفق المدفوعات.",
    icon: <SvgIcons name={"businessAnalysis"} size={80} />,
  },
  {
    id: "4",
    title: "أمان عالي المستوى",
    description: "حماية متقدمة لبيانات منشأتك مع أعلى درجات الأمان والامتثال.",
    icon: <SvgIcons name={"businessShield"} size={80} />,
  },
];

const BusinessOnboardingScreen = ({ navigation }) => {
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
      // navigation.replace(""); skip to the business login screen
      navigation.replace("BusinessLogin");
    }
  };

  const handleSkip = () => {
    // navigation.replace(""); skip to the business login
    navigation.replace("BusinessLogin");
  };

  const renderItem = ({ item }) => (
    <View style={{ width }} className="flex-1 items-center justify-center px-8">
      {/* iconplaceholder */}
      <View className="w-40 h-40 rounded-3xl bg-[#0055aa] items-center justify-center mb-8 shadow-md">
        {item.icon}
      </View>

      {/* title */}
      <Text className="text-xl font-bold text-gray-800 text-center mb-3">
        {item.title}
      </Text>

      {/* description */}
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
        <PaginationDots
          count={onboardingData.length}
          currentIndex={currentIndex}
          color="#0055aa"
        />

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
          className="bg-[#0055aa] rounded-xl py-4 items-center"
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

export default BusinessOnboardingScreen;
