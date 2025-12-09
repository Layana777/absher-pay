import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { CustomHeader } from "../../../common/components";
import { getUserCards, deleteCard } from "../../../common/services";
import { useUser } from "../../../store/hooks";

const CardSelectionScreen = ({ navigation, route }) => {
  const { primaryColor = "#0055aa" } = route.params || {};
  const user = useUser(); // جلب بيانات المستخدم من Redux

  const [cards, setCards] = useState([]);
  const [selectedCardId, setSelectedCardId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // جلب البطاقات من Firebase عند تحميل الشاشة
  useEffect(() => {
    loadCards();
  }, []);

  // جلب البطاقات من Firebase
  const loadCards = async () => {
    try {
      setLoading(true);

      if (!user?.uid) {
        console.log("❌ لا يوجد مستخدم مسجل دخول");
        setLoading(false);
        return;
      }

      console.log("📥 جلب البطاقات للمستخدم:", user.uid);
      const result = await getUserCards(user.uid);

      if (result.success) {
        setCards(result.data);
        // اختيار البطاقة الأولى تلقائياً
        if (result.data.length > 0) {
          setSelectedCardId(result.data[0].id);
        }
        console.log("✅ تم جلب", result.data.length, "بطاقة");
      } else {
        console.log("⚠️", result.message);
      }
    } catch (error) {
      console.error("❌ خطأ في جلب البطاقات:", error);
      Alert.alert("خطأ", "حدث خطأ في جلب البطاقات");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // تحديث القائمة
  const handleRefresh = () => {
    setRefreshing(true);
    loadCards();
  };

  // إضافة بطاقة جديدة
  const handleAddNewCard = () => {
    navigation.navigate("AddCard", {
      primaryColor,
      onCardAdded: () => {
        // تحديث القائمة بعد إضافة بطاقة جديدة
        loadCards();
      },
    });
  };

  // حذف بطاقة
  const handleDeleteCard = (cardId, cardNumber) => {
    Alert.alert(
      "حذف البطاقة",
      `هل أنت متأكد من حذف البطاقة •••• ${cardNumber}؟`,
      [
        {
          text: "إلغاء",
          style: "cancel",
        },
        {
          text: "حذف",
          style: "destructive",
          onPress: async () => {
            try {
              const result = await deleteCard(user.uid, cardId);
              if (result.success) {
                Alert.alert("تم بنجاح", "تم حذف البطاقة بنجاح");
                loadCards(); // تحديث القائمة
              } else {
                Alert.alert("خطأ", result.message);
              }
            } catch (error) {
              console.error("❌ خطأ في حذف البطاقة:", error);
              Alert.alert("خطأ", "حدث خطأ في حذف البطاقة");
            }
          },
        },
      ]
    );
  };

  // المتابعة للخطوة التالية
  const handleContinue = () => {
    const selectedCard = cards.find((card) => card.id === selectedCardId);

    if (!selectedCard) {
      Alert.alert("تنبيه", "يرجى اختيار بطاقة");
      return;
    }

    navigation.navigate("TopupAmount", {
      paymentMethod: "CARD",
      primaryColor,
      cardData: {
        cardNumber: selectedCard.cardNumber, // آخر 4 أرقام
        lastFourDigits: selectedCard.cardNumber,
        cardType: selectedCard.cardType || "mada",
        bankName: selectedCard.bankName,
        type: selectedCard.type,
        cardId: selectedCard.id,
      },
    });
  };

  // عرض شاشة التحميل
  if (loading) {
    return (
      <View className="flex-1 bg-white" style={{ direction: "ltr" }}>
        <CustomHeader title="اختر البطاقة" onBack={() => navigation.goBack()} />
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={primaryColor} />
          <Text className="text-gray-500 mt-4">جاري تحميل البطاقات...</Text>
        </View>
      </View>
    );
  }

  return (
    <>
      <CustomHeader title="اختر البطاقة" onBack={() => navigation.goBack()} />

      <View className="flex-1 bg-white" style={{ direction: "ltr" }}>
        {/* Header */}

        <ScrollView
          className="flex-1"
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={primaryColor}
            />
          }
        >
          <View className="px-4 py-6">
            {/* Saved Cards Section */}
            <Text className="text-gray-900 font-semibold text-base mb-4 text-right">
              البطاقات المحفوظة ({cards.length})
            </Text>

            {/* قائمة البطاقات */}
            {cards.length > 0 ? (
              cards.map((card) => (
                <TouchableOpacity
                  key={card.id}
                  onPress={() => setSelectedCardId(card.id)}
                  className="bg-white rounded-2xl p-4 mb-3 border-2"
                  style={{
                    borderColor:
                      selectedCardId === card.id ? primaryColor : "#e5e7eb",
                  }}
                >
                  <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center flex-1">
                      {/* Card Icon */}
                      <View
                        className="w-12 h-12 rounded-xl items-center justify-center"
                        style={{ backgroundColor: `${primaryColor}15` }}
                      >
                        <Feather
                          name="credit-card"
                          size={24}
                          color={primaryColor}
                        />
                      </View>

                      {/* Card Info */}
                      <View className="mr-3 flex-1">
                        <Text className="text-gray-900 font-semibold text-base text-right">
                          {card.bankName}
                        </Text>
                        <Text className="text-gray-500 text-sm text-right">
                          {card.type} •••• {card.cardNumber}
                        </Text>
                        {card.isDefault && (
                          <View
                            className="self-end mt-1 px-2 py-1 rounded"
                            style={{ backgroundColor: `${primaryColor}15` }}
                          >
                            <Text
                              className="text-xs font-semibold"
                              style={{ color: primaryColor }}
                            >
                              البطاقة الافتراضية
                            </Text>
                          </View>
                        )}
                      </View>
                    </View>

                    {/* Actions */}
                    <View className="flex-row items-center">
                      {/* Delete Button */}
                      <TouchableOpacity
                        onPress={() =>
                          handleDeleteCard(card.id, card.cardNumber)
                        }
                        className="p-2 mr-2"
                      >
                        <Feather name="trash-2" size={20} color="#ef4444" />
                      </TouchableOpacity>

                      {/* Check Icon */}
                      {selectedCardId === card.id && (
                        <View
                          className="w-6 h-6 rounded-full items-center justify-center"
                          style={{ backgroundColor: primaryColor }}
                        >
                          <Feather name="check" size={16} color="white" />
                        </View>
                      )}
                    </View>
                  </View>
                </TouchableOpacity>
              ))
            ) : (
              /* رسالة عدم وجود بطاقات */
              <View className="items-center py-12">
                <View
                  className="w-20 h-20 rounded-full items-center justify-center mb-4"
                  style={{ backgroundColor: `${primaryColor}15` }}
                >
                  <Feather name="credit-card" size={40} color={primaryColor} />
                </View>
                <Text className="text-gray-900 font-semibold text-lg mb-2">
                  لا توجد بطاقات محفوظة
                </Text>
                <Text className="text-gray-500 text-sm text-center px-8">
                  قم بإضافة بطاقة جديدة للبدء في استخدام خدمات الدفع
                </Text>
              </View>
            )}

            {/* Add New Card Button */}
            <TouchableOpacity
              onPress={handleAddNewCard}
              className="bg-white rounded-2xl p-4 border-2 border-dashed"
              style={{ borderColor: primaryColor }}
            >
              <View className="flex-row items-center justify-center">
                <Text
                  className="font-semibold text-base mr-3"
                  style={{ color: primaryColor }}
                >
                  إضافة بطاقة جديدة
                </Text>

                <View
                  className="w-12 h-12 rounded-xl items-center justify-center"
                  style={{ backgroundColor: `${primaryColor}15` }}
                >
                  <Feather name="plus" size={24} color={primaryColor} />
                </View>
              </View>
            </TouchableOpacity>

            {/* Info Card */}
            <View
              className="rounded-2xl p-4 mt-6"
              style={{ backgroundColor: `${primaryColor}08` }}
            >
              <View className="flex-row items-start">
                <Feather
                  name="shield"
                  size={20}
                  color={primaryColor}
                  style={{ marginLeft: 8, marginTop: 2 }}
                />
                <View className="flex-1">
                  <Text
                    className="font-semibold text-sm mb-1 text-right"
                    style={{ color: primaryColor }}
                  >
                    بياناتك محمية ومشفرة
                  </Text>
                  <Text className="text-gray-600 text-xs text-right">
                    جميع معلومات البطاقات مشفرة ومحمية بأعلى معايير الأمان في
                    Firebase
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </ScrollView>

        {/* Continue Button */}
        {cards.length > 0 && (
          <View className="px-4 pb-6 pt-4 bg-white border-t border-gray-200">
            <TouchableOpacity
              onPress={handleContinue}
              disabled={!selectedCardId}
              className="rounded-lg py-4"
              style={{
                backgroundColor: selectedCardId ? primaryColor : "#d1d5db",
              }}
            >
              <Text className="text-white text-center text-base font-semibold">
                متابعة
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </>
  );
};

export default CardSelectionScreen;
