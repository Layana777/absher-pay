import React, { useEffect } from "react";
import { SplashScreen } from "../../common/components";

const SingleSplashScreen = ({ navigation }) => {
  useEffect(() => {
    // Navigate to SingleOnboarding after 3 seconds
    const timer = setTimeout(() => {
      navigation.replace("SingleOnboarding");
    }, 2000);

    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <SplashScreen
      backgroundColor="#028550"
      title="محفظة أبشر أفراد"
      subtitle="مستقبل المدفوعات الحكومية"
      footerText="وزارة الداخلية - المملكة العربية السعودية"
    />
  );
};

export default SingleSplashScreen;
