import React from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";

const ReportTypeFilter = ({ activeType, onTypeSelect }) => {
  const types = [
    { id: "all", label: "الكل" },
    { id: "monthly", label: "شهري" },
    { id: "quarterly", label: "ربع سنوي" },
    { id: "yearly", label: "سنوي" },
  ];

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      className="mb-4"
      contentContainerStyle={{ gap: 8 }}
      style={{ direction: "rtl" }}
    >
      {types.map((type) => (
        <TouchableOpacity
          key={type.id}
          onPress={() => onTypeSelect(type.id)}
          className={`px-4 py-2 rounded-xl border flex-row items-center ${
            activeType === type.id
              ? "bg-[#0055aa] border-[#0055aa]"
              : "bg-white border-gray-200"
          }`}
        >
          <Text className="text-base mr-2">{type.icon}</Text>
          <Text
            className={`text-sm font-medium ${
              activeType === type.id ? "text-white" : "text-gray-700"
            }`}
          >
            {type.label}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
};

export default ReportTypeFilter;
