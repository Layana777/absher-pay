import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Feather } from "@expo/vector-icons";

const AmountKeypad = ({ onKeyPress, primaryColor = "#0055aa" }) => {
  const keys = [
    ["1", "2", "3"],
    ["4", "5", "6"],
    ["7", "8", "9"],
    [".", "0", "delete"],
  ];

  const handlePress = (key) => {
    onKeyPress(key);
  };

  return (
    <View className="gap-3">
      {keys.map((row, rowIndex) => (
        <View key={rowIndex} className="flex-row gap-3 justify-center">
          {row.map((key) => (
            <TouchableOpacity
              key={key}
              onPress={() => handlePress(key)}
              className="bg-white items-center justify-center shadow-sm"
              style={{
                width: 100,
                height: 65,
                borderRadius: 50,
                borderWidth: key === "delete" ? 0 : 1,
                borderColor: "#e5e7eb",
              }}
              activeOpacity={0.7}
            >
              {key === "delete" ? (
                <Feather name="delete" size={24} color={primaryColor} />
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
