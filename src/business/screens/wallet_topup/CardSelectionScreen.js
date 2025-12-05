import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { CustomHeader } from "../../../common/components";

const CardSelectionScreen = ({ navigation, route }) => {
  const { primaryColor = "#0055aa", savedCards = [] } = route.params || {};

  const [selectedCardId, setSelectedCardId] = useState(
    savedCards[0]?.id || null
  );

  // Mock saved cards - في المستقبل ستأتي من API أو Redux
  const defaultCards =
    savedCards.length > 0
      ? savedCards
      : [
          {
            id: "1",
            cardNumber: "9012",
            bankName: "مصرف الراجحي",
            type: "مدى",
          },
        ];

  const handleAddNewCard = () => {
    navigation.navigate("AddCard", {
      primaryColor,
    });
  };

  const handleContinue = () => {
    const selectedCard = defaultCards.find(
      (card) => card.id === selectedCardId
    );
    navigation.navigate("TopupAmount", {
      paymentMethod: "CARD",
      primaryColor,
      cardData: {
        cardNumber: selectedCard.cardNumber, // Already last 4 digits
        lastFourDigits: selectedCard.cardNumber, // Same as cardNumber (last 4)
        cardType: selectedCard.cardType || selectedCard.type || "mada", // Support both formats
        bankName: selectedCard.bankName,
        type: selectedCard.type,
      },
    });
  };

  return (
    <View className="flex-1 bg-white " style={{ direction: "ltr" }}>
      {/* Header */}
      <CustomHeader
        title="اختر البطاقة"
        onBack={() => navigation.goBack()}
      />

      <ScrollView className="flex-1">
        <View className="px-4 py-6">
          {/* Saved Cards Section */}
          <Text className="text-gray-900 font-semibold text-base mb-4 text-right">
            البطاقات المحفوظة
          </Text>

          {defaultCards.map((card) => (
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
                  </View>
                </View>

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
            </TouchableOpacity>
          ))}

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
                  جميع معلومات البطاقات مشفرة ومحمية بأعلى معايير الأمان
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Continue Button */}
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
    </View>
  );
};

export default CardSelectionScreen;
