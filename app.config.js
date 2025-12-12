import "dotenv/config";

export default {
  expo: {
    name: "absher-pay",
    slug: "absher-pay",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "light",
    newArchEnabled: true,
    splash: {
      image: "./assets/splash-icon.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff",
    },
    ios: {
      supportsTablet: true,
      infoPlist: {
        NSFaceIDUsageDescription:
          "نحتاج إلى صلاحية الوصول إلى Face ID أو Touch ID لتمكينك من تسجيل الدخول السريع والآمن إلى التطبيق",
      },
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#ffffff",
      },
      edgeToEdgeEnabled: true,
      supportsRtl: true,
      permissions: ["USE_BIOMETRIC", "USE_FINGERPRINT"],
    },
    web: {
      favicon: "./assets/favicon.png",
    },
    plugins: [
      [
        "expo-local-authentication",
        {
          faceIDPermission:
            "السماح لتطبيق محفظة أبشر باستخدام Face ID أو Touch ID لتسجيل الدخول الآمن",
        },
      ],
      "expo-secure-store",
      "expo-asset",
    ],
    extra: {
      // Firebase configuration from environment variables
      FIREBASE_API_KEY: process.env.FIREBASE_API_KEY,
      FIREBASE_AUTH_DOMAIN: process.env.FIREBASE_AUTH_DOMAIN,
      FIREBASE_DATABASE_URL: process.env.FIREBASE_DATABASE_URL,
      FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID,
      FIREBASE_STORAGE_BUCKET: process.env.FIREBASE_STORAGE_BUCKET,
      FIREBASE_MESSAGING_SENDER_ID: process.env.FIREBASE_MESSAGING_SENDER_ID,
      FIREBASE_APP_ID: process.env.FIREBASE_APP_ID,
      FIREBASE_MEASUREMENT_ID: process.env.FIREBASE_MEASUREMENT_ID,

      // OpenAI configuration from environment variables
      OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    },
  },
};
