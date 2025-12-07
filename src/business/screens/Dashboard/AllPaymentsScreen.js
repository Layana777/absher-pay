import React, { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { Feather } from "@expo/vector-icons";
import { CustomHeader } from "../../../common/components";
import UpcomingPaymentCard from "../../../common/components/UpcomingPaymentCard";
import SvgIcons from "../../../common/components/SvgIcons";

const AllPaymentsScreen = ({ navigation, route }) => {
  const { primaryColor = "#0055aa" } = route.params || {};

  // الحالة النشطة للفلاتر
  const [activeStatusFilter, setActiveStatusFilter] = useState("الكل");
  const [activeServiceFilter, setActiveServiceFilter] = useState("الكل");

  // بيانات وهمية للمدفوعات (reusable data)
  const allPayments = [
    {
      id: "1",
      title: "تجديد إقامة العمالة",
      description: "آخر دفعة: 6,500 ريال | التاريخ: 12 نوفمبر 2024",
      amount: 6500,
      icon: "users",
      iconColor: "#8B5CF6",
      iconBgColor: "bg-purple-50",
      isUrgent: false,
      dueDate: "12 نوفمبر 2024",
      status: "مستحق",
      category: "الكل",
      serviceType: "تجديد الإقامة",
      aiSuggestion: "متوقع بنفس قيمة آخر دفعة",
    },
    {
      id: "2",
      title: "رسوم البلدية السنوية",
      description: "آخر دفعة: 2,800 ريال | التاريخ: 5 ديسمبر 2024",
      amount: 2800,
      icon: "home",
      iconColor: "#10B981",
      iconBgColor: "bg-green-50",
      isUrgent: false,
      dueDate: "5 ديسمبر 2024",
      status: "متوقع",
      category: "متوقع",
      serviceType: "رسوم البلدية",
      aiSuggestion: "متوقع خلال 15 يوم أو أقل",
    },
    {
      id: "3",
      title: "مخالفات المركبات",
      description: "آخر دفعة: 450 ريال | التاريخ: 18 ديسمبر 2024",
      amount: 450,
      icon: "truck",
      iconColor: "#EF4444",
      iconBgColor: "bg-red-50",
      isUrgent: false,
      dueDate: "18 ديسمبر 2024",
      status: "متأخر",
      category: "متأخر",
      serviceType: "مخالفات المركبات",
      aiSuggestion: "لا يوجد",
    },
    {
      id: "4",
      title: "تجديد جوازات العمالة",
      description: "آخر دفعة: 3,200 ريال | التاريخ: 28 أكتوبر 2024",
      amount: 3200,
      icon: "file-text",
      iconColor: "#8B5CF6",
      iconBgColor: "bg-purple-50",
      isUrgent: false,
      dueDate: "28 أكتوبر 2024",
      status: "مستحق",
      category: "مستحق",
      serviceType: "تجديد الإقامة",
      aiSuggestion: "متأخر 5 أيام",
    },
    {
      id: "5",
      title: "رسوم جمركية",
      description: "آخر دفعة: 8,900 ريال | التاريخ: 3 ديسمبر 2024",
      amount: 8900,
      icon: "package",
      iconColor: "#F97316",
      iconBgColor: "bg-orange-50",
      isUrgent: false,
      dueDate: "3 ديسمبر 2024",
      status: "الكل",
      category: "الكل",
      serviceType: "رسوم جمركية",
      aiSuggestion: "حسب الشحنات",
    },
  ];

  // الفلاتر المتاحة
  const statusFilters = ["الكل", "مستحق", "متوقع", "متأخر"];
  const serviceFilters = [
    "الكل",
    "تجديد الإقامة",
    "رسوم البلدية",
    "مخالفات المركبات",
    "رسوم جمركية",
  ];

  // فلترة المدفوعات حسب الفلاتر النشطة
  const filteredPayments = allPayments.filter((payment) => {
    const matchesStatus =
      activeStatusFilter === "الكل" || payment.status === activeStatusFilter;
    const matchesService =
      activeServiceFilter === "الكل" ||
      payment.serviceType === activeServiceFilter;
    return matchesStatus && matchesService;
  });

  // معالج الضغط على كرت المدفوعة
  const handlePaymentPress = (payment) => {
    console.log("Payment pressed:", payment);
    // يمكن الانتقال لشاشة تفاصيل الدفعة
    navigation.navigate("UpcomingPayDetails", {
      payment,
      primaryColor,
    });
  };

  return (
    <>
      <CustomHeader title="مركز المدفوعات" onBack={() => navigation.goBack()} />
      <View className="flex-1 bg-gray-50" style={{ direction: "ltr" }}>
        {/* Main ScrollView - Everything scrolls together */}
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          {/* الجزء العلوي بالكامل - كرت + فلاتر بخلفية واحدة */}
          <View className="bg-[#ffffff] p-3 mb-6 pb-4 rounded-b-[30px]">
            {/* إجمالي المدفوعات المستحقة */}
            <View className="px-4 pt-6 pb-4">
              <View
                className="rounded-3xl p-9"
                style={{ backgroundColor: primaryColor }}
              >
                <Text className="text-white text-sm mb-2 text-center opacity-90">
                  إجمالي المدفوعات المستحقة
                </Text>

                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "center",
                    direction: "ltr",
                    padding: 13,
                  }}
                >
                  <SvgIcons name="SAR" size={28} />
                  <Text className="text-white text-4xl font-bold text-center">
                    1000
                  </Text>
                </View>

                <TouchableOpacity
                  className="bg-white rounded-xl py-3"
                  onPress={() => console.log("دفع الكل")}
                >
                  <Text
                    className="text-center font-semibold"
                    style={{ color: primaryColor }}
                  >
                    دفع الكل
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* فلتر نوع الخدمة */}
            <View className="mb-6" style={{ direction: "rtl" }}>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 16 }}
              >
                {serviceFilters.map((filter, index) => (
                  <TouchableOpacity
                    key={filter}
                    onPress={() => setActiveServiceFilter(filter)}
                    className="px-6 py-2 rounded-lg"
                    style={{
                      backgroundColor:
                        activeServiceFilter === filter ? primaryColor : "white",
                      marginLeft: index < serviceFilters.length - 1 ? 8 : 0,
                    }}
                  >
                    <Text
                      className={`font-semibold ${
                        activeServiceFilter === filter
                          ? "text-white"
                          : "text-gray-700"
                      }`}
                    >
                      {filter}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* فلتر الحالة */}
            <View className="mb-5" style={{ direction: "rtl" }}>
              <View className="flex-row items-center bg-[#f8f8f8] rounded-lg py-2">
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{ paddingHorizontal: 3 }}
                >
                  {statusFilters.map((filter, index) => (
                    <TouchableOpacity
                      key={filter}
                      onPress={() => setActiveStatusFilter(filter)}
                      className="px-6 py-2 rounded-lg"
                      style={{
                        backgroundColor:
                          activeStatusFilter === filter
                            ? primaryColor
                            : "white",
                        marginLeft: index < statusFilters.length - 1 ? 8 : 0,
                      }}
                    >
                      <Text
                        className={`font-semibold ${
                          activeStatusFilter === filter
                            ? "text-white"
                            : "text-gray-700"
                        }`}
                      >
                        {filter}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </View>
          </View>

          {/* قائمة المدفوعات */}
          <View className="px-4 pb-6">
            {filteredPayments.map((payment) => (
              <UpcomingPaymentCard
                key={payment.id}
                payment={payment}
                onPress={() => handlePaymentPress(payment)}
              />
            ))}

            {/* رسالة فارغة */}
            {filteredPayments.length === 0 && (
              <View className="items-center justify-center py-12">
                <Feather name="inbox" size={48} color="#D1D5DB" />
                <Text className="text-gray-500 text-base mt-4">
                  لا توجد مدفوعات في هذا القسم
                </Text>
              </View>
            )}
          </View>
        </ScrollView>
      </View>
    </>
  );
};

export default AllPaymentsScreen;
