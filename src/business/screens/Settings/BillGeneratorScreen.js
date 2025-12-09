import { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useAppSelector } from "../../../store/hooks";
import { selectUser } from "../../../store/slices/userSlice";
import CustomHeader from "../../../common/components/CustomHeader";
import { autoGenerateBills } from "../../../common/services/billsService";

const PRIMARY_COLOR = "#0055aa";

const BillGeneratorScreen = ({ navigation }) => {
  const user = useAppSelector(selectUser);

  // Form state
  const [selectedWallet, setSelectedWallet] = useState("personal");
  const [billCount, setBillCount] = useState("5");
  const [selectedStatuses, setSelectedStatuses] = useState([
    "unpaid",
    "paid",
    "overdue",
    "upcoming",
  ]);
  const [selectedServices, setSelectedServices] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);

  // Service definitions
  const personalServices = [
    { key: "passports", label: "جوازات السفر", labelEn: "Passports" },
    { key: "traffic", label: "المرور", labelEn: "Traffic" },
    {
      key: "civil_affairs",
      label: "الأحوال المدنية",
      labelEn: "Civil Affairs",
    },
  ];

  const businessServices = [
    {
      key: "civil_affairs",
      label: "الأحوال المدنية",
      labelEn: "Civil Affairs",
    },
    { key: "commerce", label: "التجارة", labelEn: "Commerce" },
    { key: "traffic", label: "المرور", labelEn: "Traffic" },
  ];

  const statusOptions = [
    { key: "unpaid", label: "غير مدفوعة", color: "#EF4444" },
    { key: "paid", label: "مدفوعة", color: "#10B981" },
    { key: "overdue", label: "متأخرة", color: "#F59E0B" },
    { key: "upcoming", label: "قادمة", color: "#3B82F6" },
  ];

  // Get available services based on wallet type
  const availableServices =
    selectedWallet === "business" ? businessServices : personalServices;

  // Reset selected services when wallet changes
  useEffect(() => {
    setSelectedServices([]);
  }, [selectedWallet]);

  // Toggle status selection
  const toggleStatus = (statusKey) => {
    if (selectedStatuses.includes(statusKey)) {
      setSelectedStatuses(selectedStatuses.filter((s) => s !== statusKey));
    } else {
      setSelectedStatuses([...selectedStatuses, statusKey]);
    }
  };

  // Toggle service selection
  const toggleService = (serviceKey) => {
    if (selectedServices.includes(serviceKey)) {
      setSelectedServices(selectedServices.filter((s) => s !== serviceKey));
    } else {
      setSelectedServices([...selectedServices, serviceKey]);
    }
  };

  // Select all services
  const selectAllServices = () => {
    setSelectedServices(availableServices.map((s) => s.key));
  };

  // Clear all services
  const clearAllServices = () => {
    setSelectedServices([]);
  };

  // Select all statuses
  const selectAllStatuses = () => {
    setSelectedStatuses(statusOptions.map((s) => s.key));
  };

  // Clear all statuses
  const clearAllStatuses = () => {
    setSelectedStatuses([]);
  };

  // Handle bill generation
  const handleGenerateBills = async () => {
    // Validation
    const count = parseInt(billCount);
    if (isNaN(count) || count < 1 || count > 50) {
      Alert.alert("خطأ", "الرجاء إدخال عدد صحيح بين 1 و 50");
      return;
    }

    if (selectedStatuses.length === 0) {
      Alert.alert("خطأ", "الرجاء اختيار حالة واحدة على الأقل");
      return;
    }

    if (!user?.uid) {
      Alert.alert("خطأ", "لم يتم العثور على معلومات المستخدم");
      return;
    }

    // Get wallet ID (you'll need to get this from your wallet state/store)
    // For now, using a mock wallet ID - you should replace this with actual wallet data
    const walletId =
      selectedWallet === "personal"
        ? `wallet_personal_${user.uid}`
        : `wallet_business_${user.uid}`;

    const isBusiness = selectedWallet === "business";

    try {
      setIsGenerating(true);

      // Prepare options
      const options = {
        count,
        statuses: selectedStatuses,
      };

      // Add service types if any selected
      if (selectedServices.length > 0) {
        options.serviceTypes = selectedServices;
      }

      // Generate bills using the service
      const generatedBills = await autoGenerateBills(
        user.uid,
        walletId,
        isBusiness,
        options
      );

      // Success
      setIsGenerating(false);
      Alert.alert("نجح!", `تم إنشاء ${generatedBills.length} فاتورة بنجاح`, [
        {
          text: "إنشاء المزيد",
          style: "default",
        },
        {
          text: "العودة",
          style: "cancel",
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error) {
      setIsGenerating(false);
      console.error("Error generating bills:", error);
      Alert.alert("خطأ", `فشل إنشاء الفواتير: ${error.message}`);
    }
  };

  return (
    <>
      <CustomHeader
        title="مولد الفواتير"
        onBack={() => navigation.goBack()}
        showBackButton={true}
        backgroundColor={PRIMARY_COLOR}
        textColor="#FFFFFF"
        statusBarStyle="light-content"
        statusBarBackgroundColor={PRIMARY_COLOR}
      />
      <View className="flex-1 bg-gray-50" style={{ direction: "ltr" }}>
        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 20 }}
        >
          {/* Info Banner */}
          <View className="bg-blue-50 p-4 m-4 rounded-2xl border border-blue-200">
            <View className="flex-row items-start">
              <Feather name="info" size={20} color="#0055aa" />
              <Text className="flex-1 text-gray-700 text-sm text-right mr-3 leading-5">
                هذه الأداة تساعدك في إنشاء فواتير حكومية تجريبية لاختبار التطبيق
              </Text>
            </View>
          </View>

          {/* Wallet Type Selection */}
          <View className="px-4 mb-6">
            <Text className="text-gray-900 text-base font-bold mb-3 text-right">
              نوع المحفظة
            </Text>
            <View className="flex-row gap-3">
              <TouchableOpacity
                onPress={() => setSelectedWallet("personal")}
                className={`flex-1 p-4 rounded-2xl border-2 ${
                  selectedWallet === "personal"
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 bg-white"
                }`}
              >
                <View className="items-center">
                  <Feather
                    name="user"
                    size={24}
                    color={
                      selectedWallet === "personal" ? "#0055aa" : "#9CA3AF"
                    }
                  />
                  <Text
                    className={`mt-2 font-semibold ${
                      selectedWallet === "personal"
                        ? "text-blue-600"
                        : "text-gray-600"
                    }`}
                  >
                    شخصية
                  </Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setSelectedWallet("business")}
                className={`flex-1 p-4 rounded-2xl border-2 ${
                  selectedWallet === "business"
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 bg-white"
                }`}
              >
                <View className="items-center">
                  <Feather
                    name="briefcase"
                    size={24}
                    color={
                      selectedWallet === "business" ? "#0055aa" : "#9CA3AF"
                    }
                  />
                  <Text
                    className={`mt-2 font-semibold ${
                      selectedWallet === "business"
                        ? "text-blue-600"
                        : "text-gray-600"
                    }`}
                  >
                    تجارية
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>

          {/* Bill Count */}
          <View className="px-4 mb-6">
            <Text className="text-gray-900 text-base font-bold mb-3 text-right">
              عدد الفواتير
            </Text>
            <View className="bg-white rounded-2xl border border-gray-200 px-4 py-3">
              <TextInput
                value={billCount}
                onChangeText={setBillCount}
                keyboardType="number-pad"
                placeholder="أدخل العدد (1-50)"
                placeholderTextColor="#9CA3AF"
                className="text-gray-900 text-base text-right"
                maxLength={2}
              />
            </View>
            <Text className="text-gray-500 text-xs mt-2 text-right">
              الحد الأقصى: 50 فاتورة
            </Text>
          </View>

          {/* Service Types */}
          <View className="px-4 mb-6">
            <View className="flex-row items-center justify-between mb-3">
              <View className="flex-row gap-2">
                <TouchableOpacity
                  onPress={clearAllServices}
                  className="px-3 py-1 bg-gray-100 rounded-full"
                >
                  <Text className="text-gray-600 text-xs">إلغاء الكل</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={selectAllServices}
                  className="px-3 py-1 bg-blue-100 rounded-full"
                >
                  <Text className="text-blue-600 text-xs">تحديد الكل</Text>
                </TouchableOpacity>
              </View>
              <Text className="text-gray-900 text-base font-bold text-right">
                أنواع الخدمات
              </Text>
            </View>

            <View className="bg-white rounded-2xl border border-gray-200 p-2">
              {availableServices.map((service) => (
                <TouchableOpacity
                  key={service.key}
                  onPress={() => toggleService(service.key)}
                  className="flex-row items-center justify-between p-3 border-b border-gray-100"
                >
                  <View
                    className={`w-5 h-5 rounded items-center justify-center border-2 ${
                      selectedServices.includes(service.key)
                        ? "bg-blue-500 border-blue-500"
                        : "border-gray-300"
                    }`}
                  >
                    {selectedServices.includes(service.key) && (
                      <Feather name="check" size={14} color="white" />
                    )}
                  </View>
                  <View className="flex-1 mx-3">
                    <Text className="text-gray-900 text-sm text-right">
                      {service.label}
                    </Text>
                    <Text className="text-gray-500 text-xs text-right">
                      {service.labelEn}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
            <Text className="text-gray-500 text-xs mt-2 text-right">
              اترك فارغاً لاختيار جميع الخدمات المتاحة
            </Text>
          </View>

          {/* Status Selection */}
          <View className="px-4 mb-6">
            <View className="flex-row items-center justify-between mb-3">
              <View className="flex-row gap-2">
                <TouchableOpacity
                  onPress={clearAllStatuses}
                  className="px-3 py-1 bg-gray-100 rounded-full"
                >
                  <Text className="text-gray-600 text-xs">إلغاء الكل</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={selectAllStatuses}
                  className="px-3 py-1 bg-blue-100 rounded-full"
                >
                  <Text className="text-blue-600 text-xs">تحديد الكل</Text>
                </TouchableOpacity>
              </View>
              <Text className="text-gray-900 text-base font-bold text-right">
                حالة الفواتير
              </Text>
            </View>

            <View className="bg-white rounded-2xl border border-gray-200 p-2">
              {statusOptions.map((status) => (
                <TouchableOpacity
                  key={status.key}
                  onPress={() => toggleStatus(status.key)}
                  className="flex-row items-center justify-between p-3 border-b border-gray-100"
                >
                  <View
                    className={`w-5 h-5 rounded items-center justify-center border-2 ${
                      selectedStatuses.includes(status.key)
                        ? "border-blue-500"
                        : "border-gray-300"
                    }`}
                    style={{
                      backgroundColor: selectedStatuses.includes(status.key)
                        ? status.color
                        : "transparent",
                    }}
                  >
                    {selectedStatuses.includes(status.key) && (
                      <Feather name="check" size={14} color="white" />
                    )}
                  </View>
                  <View className="flex-1 mx-3">
                    <View className="flex-row items-center justify-end">
                      <Text className="text-gray-900 text-sm text-right">
                        {status.label}
                      </Text>
                      <View
                        className="w-3 h-3 rounded-full mr-2"
                        style={{ backgroundColor: status.color }}
                      />
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Summary */}
          <View className="px-4 mb-6">
            <View
              className="bg-gradient-to-br rounded-2xl p-4 border border-blue-200"
              style={{ backgroundColor: "#EFF6FF" }}
            >
              <Text className="text-gray-900 text-base font-bold mb-3 text-right">
                ملخص الإنشاء
              </Text>
              <View className="space-y-2">
                <View className="flex-row justify-between items-center mb-2">
                  <Text className="text-gray-700 text-sm">
                    {parseInt(billCount) || 0}
                  </Text>
                  <Text className="text-gray-600 text-sm">عدد الفواتير:</Text>
                </View>
                <View className="flex-row justify-between items-center mb-2">
                  <Text className="text-gray-700 text-sm">
                    {selectedWallet === "personal" ? "شخصية" : "تجارية"}
                  </Text>
                  <Text className="text-gray-600 text-sm">نوع المحفظة:</Text>
                </View>
                <View className="flex-row justify-between items-center mb-2">
                  <Text className="text-gray-700 text-sm">
                    {selectedServices.length > 0
                      ? selectedServices.length
                      : availableServices.length}{" "}
                    خدمة
                  </Text>
                  <Text className="text-gray-600 text-sm">أنواع الخدمات:</Text>
                </View>
                <View className="flex-row justify-between items-center">
                  <Text className="text-gray-700 text-sm">
                    {selectedStatuses.length} حالة
                  </Text>
                  <Text className="text-gray-600 text-sm">الحالات:</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Generate Button */}
          <View className="px-4">
            <TouchableOpacity
              onPress={handleGenerateBills}
              disabled={isGenerating}
              className="rounded-2xl py-4 flex-row items-center justify-center"
              style={{
                backgroundColor: isGenerating ? "#9CA3AF" : PRIMARY_COLOR,
              }}
            >
              {isGenerating ? (
                <>
                  <ActivityIndicator color="white" size="small" />
                  <Text className="text-white text-base font-bold mr-2">
                    جاري الإنشاء...
                  </Text>
                </>
              ) : (
                <>
                  <Feather name="plus-circle" size={20} color="white" />
                  <Text className="text-white text-base font-bold mr-2">
                    إنشاء الفواتير
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </>
  );
};

export default BillGeneratorScreen;
