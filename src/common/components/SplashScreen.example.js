import React from "react";
import SplashScreen from "./SplashScreen";

/**
 * Example Usage of SplashScreen Component
 *
 * This file shows how to use the SplashScreen component with different configurations
 */

// Example 1: Single User (Green) Splash Screen
export const SingleSplashExample = () => {
  return (
    <SplashScreen
      backgroundColor="#028550"
      title="محفظة أبشر الرقمية"
      subtitle="مستقبل المدفوعات الحكومية"
      footerText="وزارة الداخلية - المملكة العربية السعودية"
    />
  );
};

// Example 2: Business (Blue) Splash Screen
export const BusinessSplashExample = () => {
  return (
    <SplashScreen
      backgroundColor="#0055aa"
      title="محفظة أبشر أعمال"
      subtitle="إدارة ذكية للمدفوعات الحكومية"
      footerText="وزارة الداخلية - المملكة العربية السعودية"
    />
  );
};

// Example 3: Default Splash Screen (uses default props)
export const DefaultSplashExample = () => {
  return <SplashScreen />;
};

// Example 4: Custom Colors
export const CustomColorSplashExample = () => {
  return (
    <SplashScreen
      backgroundColor="#6B46C1"
      title="عنوان مخصص"
      subtitle="نص فرعي مخصص"
      footerText="نص التذييل المخصص"
    />
  );
};
