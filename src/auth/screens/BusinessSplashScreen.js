import React, { useEffect } from "react";
import { SplashScreen } from "../../common/components";

const BusinessSplashScreen = ({ navigation }) => {
  useEffect(() => {
    // Navigate to Business flow after 3 seconds (placeholder for now)
    const timer = setTimeout(() => {
      // For now, go back to UserType
      // Later: navigation.replace("BusinessOnboarding");
      navigation.goBack();
    }, 2000);

    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <SplashScreen
      backgroundColor="#0055aa"
      title="محفظة أبشر أعمال"
      subtitle="إدارة ذكية للمدفوعات الحكومية"
      footerText="وزارة الداخلية - المملكة العربية السعودية"
    />
  );
};

export default BusinessSplashScreen;
