import React, { useEffect } from "react";
import { StatusBar } from "react-native";
import { SplashScreen } from "../../common/components";

const BusinessSplashScreen = ({ navigation }) => {
  useEffect(() => {
    // Navigate to Business Login screen
    const timer = setTimeout(() => {
      navigation.replace("BusinessLogin");
    }, 2000);

    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <>
      <StatusBar barStyle="light-content" />
      <SplashScreen
        backgroundColor="#0055aa"
        title="محفظة أبشر أعمال"
        subtitle="إدارة ذكية للمدفوعات الحكومية"
        footerText="وزارة الداخلية - المملكة العربية السعودية"
      />
    </>
  );
};

export default BusinessSplashScreen;
