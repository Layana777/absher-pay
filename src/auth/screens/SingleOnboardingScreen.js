import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Dimensions,
} from "react-native";
import SvgIcons from "../../common/components/SvgIcons";
import { PaginationDots, Button } from "../../common/components/ui";

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
      // Navigate to login screen
      navigation.replace("SingleLogin");
    }
  };

  const handleSkip = () => {
    // Navigate to login screen
    navigation.replace("SingleLogin");
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
      {/* Background Circles */}
      <View
        className="absolute top-[12%] left-[5%] w-36 h-36 rounded-full"
        style={{ backgroundColor: "rgba(2,133,80,0.03)" }}
      />
      {/* <View className="absolute top-[40%] right-[8%] w-32 h-32 rounded-full bg-[#028550]/5" /> */}
      <View
        className="absolute bottom-[20%] left-[15%] w-28 h-28 rounded-full"
        style={{ backgroundColor: "rgba(2,133,80,0.03)" }}
      />
      <View
        className="absolute bottom-[52%] left-[70%] w-20 h-20 rounded-full"
        style={{ backgroundColor: "rgba(2,133,80,0.03)" }}
      />

      {/* Top Section - Skip Button & Pagination Dots */}
      <View className="absolute top-16 left-0 right-0 flex-row justify-between items-center px-5 z-10">
        {/* Pagination Dots - Left */}
        <PaginationDots
          count={onboardingData.length}
          currentIndex={currentIndex}
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
        <Button
          title={
            currentIndex === onboardingData.length - 1 ? "ابدأ الآن" : "التالي"
          }
          onPress={handleNext}
          variant="single-primary"
          size="medium"
        />
      </View>
    </View>
  );
};

export default SingleOnboardingScreen;
