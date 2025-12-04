import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Feather } from "@expo/vector-icons";

const AmountKeypad = ({ onNumberPress, onDelete }) => {
  const keys = [
    ["1", "2", "3"],
    ["4", "5", "6"],
    ["7", "8", "9"],
    [".", "0", "delete"],
  ];

  const handlePress = (key) => {
    if (key === "delete") {
      onDelete();
    } else {
      onNumberPress(key);
    }
  };

  return (
    <View className="gap-3">
      {keys.map((row, rowIndex) => (
        <View key={rowIndex} className="flex-row gap-3 justify-center">
          {row.map((key) => (
            <TouchableOpacity
              key={key}
              onPress={() => handlePress(key)}
              className="bg-white rounded-2xl items-center justify-center shadow-sm"
              style={{
                width: 100,
                height: 65,
              }}
              activeOpacity={0.7}
            >
              {key === "delete" ? (
                <Feather name="delete" size={24} color="#374151" />
              ) : (
                <Text className="text-gray-900 text-2xl font-semibold">
                  {key}
                </Text>
              )}
            </TouchableOpacity>
          ))}
        </View>
      ))}
    </View>
  );
};

export default AmountKeypad;
