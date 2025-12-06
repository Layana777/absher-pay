import { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useAppSelector, useAppDispatch } from "../../../store/hooks";
import { selectUser, clearUser } from "../../../store/slices/userSlice";
import CustomHeader from "../../../common/components/CustomHeader";
import BiometricService from "../../../common/services/BiometricService";

const SettingsScreen = () => {
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectUser);

  // Toggle states
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [biometricSupported, setBiometricSupported] = useState(false);
  const [biometricType, setBiometricType] = useState("بصمة");
  const [paymentFacilitiesEnabled, setPaymentFacilitiesEnabled] =
    useState(true);
  const [smartPoliciesEnabled, setSmartPoliciesEnabled] = useState(true);
  const [rewardsEnabled, setRewardsEnabled] = useState(true);
  const [instantPaymentEnabled, setInstantPaymentEnabled] = useState(false);
  const [darkModeEnabled, setDarkModeEnabled] = useState(false);

  // فحص حالة البصمة عند تحميل الشاشة
  useEffect(() => {
    checkBiometricStatus();
  }, []);

  const checkBiometricStatus = async () => {
    try {
      // فحص دعم الجهاز للبصمة
      const support = await BiometricService.checkBiometricSupport();
      setBiometricSupported(support.isSupported);

      if (support.isSupported) {
        setBiometricType(support.biometricType);

        // فحص ما إذا كانت البصمة مفعلة
        const enabled = await BiometricService.isBiometricEnabled();
        setBiometricEnabled(enabled);
      }
    } catch (error) {
      console.error("خطأ في فحص حالة البصمة:", error);
    }
  };

  const handleBiometricToggle = async (value) => {
    if (!biometricSupported) {
      Alert.alert(
        "غير متاح",
        "الجهاز لا يدعم البصمة أو لم يتم تسجيل بصمات على الجهاز"
      );
      return;
    }

    if (value) {
      // تفعيل البصمة
      if (!user?.uid) {
        Alert.alert("خطأ", "لم يتم العثور على معلومات المستخدم");
        return;
      }

      const result = await BiometricService.enableBiometric(user.uid, "business");

      if (result.success) {
        setBiometricEnabled(true);
        Alert.alert(
          "تم بنجاح",
          `تم تفعيل ${biometricType} بنجاح. يمكنك الآن استخدامها لتسجيل الدخول`
        );
      } else {
        Alert.alert("فشل التفعيل", result.message);
      }
    } else {
      // إلغاء البصمة
      Alert.alert(
        "إلغاء البصمة",
        `هل أنت متأكد من إلغاء تفعيل ${biometricType}؟ ستحتاج لإدخال كلمة المرور في المرات القادمة`,
        [
          {
            text: "إلغاء",
            style: "cancel",
          },
          {
            text: "تأكيد",
            style: "destructive",
            onPress: async () => {
              const result = await BiometricService.disableBiometric();
              if (result.success) {
                setBiometricEnabled(false);
                Alert.alert("تم بنجاح", `تم إلغاء تفعيل ${biometricType}`);
              } else {
                Alert.alert("خطأ", result.message);
              }
            },
          },
        ]
      );
    }
  };

  const handleLogout = () => {
    Alert.alert(
      "تسجيل الخروج",
      "هل أنت متأكد من تسجيل الخروج؟",
      [
        {
          text: "إلغاء",
          style: "cancel",
        },
        {
          text: "تسجيل الخروج",
          style: "destructive",
          onPress: async () => {
            // حذف بيانات البصمة عند تسجيل الخروج
            await BiometricService.disableBiometric();
            dispatch(clearUser());
            // Navigate to login or auth screen
            // navigation.navigate('Auth');
          },
        },
      ],
      { cancelable: true }
    );
  };

  const MenuItem = ({ icon, title, onPress, rightElement, isLast = false }) => (
    <TouchableOpacity
      onPress={onPress}
      className={`flex-row-reverse items-center justify-between py-4 px-5 bg-white ${
        !isLast ? "border-b border-gray-100" : ""
      }`}
    >
      {/* Left Side - Chevron or custom element */}
      <View>
        {rightElement || (
          <Feather name="chevron-left" size={20} color="#9CA3AF" />
        )}
      </View>

      {/* Right Side - Title and Icon */}
      <View className="flex-row items-center flex-1 justify-start">
        <View className="w-5 h-5 items-center justify-center">
          <Feather name={icon} size={20} color="#6B7280" />
        </View>
        <Text className="text-gray-800 text-base mx-3">{title}</Text>
      </View>
    </TouchableOpacity>
  );

  const MenuItemWithToggle = ({ icon, title, value, onValueChange }) => (
    <View className="flex-row-reverse items-center justify-between py-4 px-5 bg-white border-b border-gray-100">
      {/* Left Side - Toggle */}
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: "#D1D5DB", true: "#0055aa" }}
        thumbColor="#FFFFFF"
        style={{ transform: [{ scaleX: 0.9 }, { scaleY: 0.9 }] }}
      />

      {/* Right Side - Title and Icon */}
      <View className="flex-row items-center flex-1 justify-start">
        <View className="w-5 h-5 items-center justify-center">
          <Feather name={icon} size={20} color="#6B7280" />
        </View>
        <Text className="text-gray-800 text-base mx-3">{title}</Text>
      </View>
    </View>
  );

  const SectionHeader = ({ title }) => (
    <View className="px-5 py-2 bg-gray-50">
      <Text className="text-gray-500 text-sm text-left">{title}</Text>
    </View>
  );

  return (
    <View className="flex-1 bg-gray-50">
      <CustomHeader
        title="الإعدادات"
        showBackButton={false}
        backgroundColor="#0055aa"
        textColor="#FFFFFF"
        statusBarStyle="light-content"
        statusBarBackgroundColor="#0055aa"
      />

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* User Profile Section */}
        <View className="bg-white mt-3 py-6 px-5 items-center">
          <View className="w-20 h-20 rounded-full bg-gray-200 items-center justify-center mb-3">
            <Feather name="user" size={40} color="#0055aa" />
          </View>
          <Text className="text-gray-900 text-lg font-bold">
            {user?.name || "أحمد محمد العتيبي"}
          </Text>
          <Text className="text-gray-500 text-sm mt-1">
            {user?.email || "ahmed.alotaibi@example.com"}
          </Text>
          <View className="mt-2 bg-blue-50 px-3 py-1 rounded-full">
            <Text className="text-[#0055aa] text-xs font-semibold">
              حساب تجاري
            </Text>
          </View>
        </View>

        {/* Account Section */}
        <View className="mt-3">
          <MenuItem icon="user" title="الملف الشخصي" onPress={() => {}} />
          <MenuItem
            icon="credit-card"
            title="وسائل الدفع"
            onPress={() => {}}
            isLast
          />
        </View>

        {/* Notifications Section */}
        <SectionHeader title="الإشعارات" />
        <View className="bg-white">
          {biometricSupported && (
            <MenuItemWithToggle
              icon="shield"
              title={`التحقق ب${biometricType}`}
              value={biometricEnabled}
              onValueChange={handleBiometricToggle}
            />
          )}
          <MenuItemWithToggle
            icon="bell"
            title="تسهيلات المدفوعات"
            value={paymentFacilitiesEnabled}
            onValueChange={setPaymentFacilitiesEnabled}
          />
          <MenuItemWithToggle
            icon="bell"
            title="السياسات الذكية"
            value={smartPoliciesEnabled}
            onValueChange={setSmartPoliciesEnabled}
          />
          <MenuItemWithToggle
            icon="bell"
            title="المكافآت والنقاط"
            value={rewardsEnabled}
            onValueChange={setRewardsEnabled}
          />
        </View>

        {/* Settings Section */}
        <SectionHeader title="الإعدادات" />
        <View className="bg-white">
          <MenuItemWithToggle
            icon="credit-card"
            title="تفعيل الدفع الفوري"
            value={instantPaymentEnabled}
            onValueChange={setInstantPaymentEnabled}
          />
          <MenuItem
            icon="file-text"
            title="إدارة الفواتير والحدود"
            onPress={() => {}}
            isLast
          />
        </View>

        {/* Privacy & Language Section */}
        <SectionHeader title="اللغة والخصوصية" />
        <View className="bg-white">
          <MenuItem icon="lock" title="تغيير رمز المرور" onPress={() => {}} />
          <MenuItem
            icon="smartphone"
            title="الأجهزة المرتبطة"
            onPress={() => {}}
          />
          <MenuItem icon="clock" title="سجل الدخول" onPress={() => {}} isLast />
        </View>

        {/* Preferences Section */}
        <SectionHeader title="التفضيلات" />
        <View className="bg-white">
          <MenuItem
            icon="globe"
            title="اللغة"
            onPress={() => {}}
            rightElement={
              <View className="flex-row-reverse items-center">
                <Feather name="chevron-left" size={20} color="#9CA3AF" />
                <Text className="text-gray-500 text-sm mx-2">العربية</Text>
              </View>
            }
          />
          <MenuItemWithToggle
            icon="moon"
            title="الوضع الليلي"
            value={darkModeEnabled}
            onValueChange={setDarkModeEnabled}
          />
        </View>

        {/* Support Section */}
        <SectionHeader title="الدعم" />
        <View className="bg-white">
          <MenuItem
            icon="help-circle"
            title="مركز المساعدة"
            onPress={() => {}}
          />
          <MenuItem
            icon="file-text"
            title="الشروط والأحكام"
            onPress={() => {}}
          />
          <MenuItem
            icon="file-text"
            title="سياسة الخصوصية"
            onPress={() => {}}
            isLast
          />
        </View>

        {/* Logout Section */}
        <TouchableOpacity
          onPress={handleLogout}
          className="bg-white mt-3 py-4 px-5 flex-row-reverse items-center justify-center mb-8"
        >
          <Feather name="log-out" size={20} color="#EF4444" />
          <Text className="text-red-500 text-base font-semibold mx-2">
            تسجيل الخروج
          </Text>
        </TouchableOpacity>

        {/* Version Info */}
        <View className="items-center pb-8">
          <Text className="text-gray-400 text-xs">Absher Pay v1.0.0</Text>
        </View>
      </ScrollView>
    </View>
  );
};

export default SettingsScreen;
