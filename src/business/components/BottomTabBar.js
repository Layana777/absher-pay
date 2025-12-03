import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Feather } from "@expo/vector-icons";

const BottomTabBar = ({ activeTab = "home", onTabPress }) => {
  const tabs = [
    { id: "home", icon: "home", label: "الرئيسية", color: "#0055aa" },
    { id: "payments", icon: "credit-card", label: "المدفوعات", color: "#6b7280" },
    { id: "analytics", icon: "bar-chart-2", label: "التحليلات", color: "#6b7280" },
    { id: "support", icon: "message-circle", label: "المساعد", color: "#6b7280" },
    { id: "reports", icon: "file-text", label: "الإيصالات", color: "#6b7280" },
    { id: "settings", icon: "settings", label: "الإعدادات", color: "#6b7280" },
  ];

  return (
    <View className="bg-white border-t border-gray-200">
      <View className="flex-row justify-around items-center px-2 py-3">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <TouchableOpacity
              key={tab.id}
              onPress={() => onTabPress?.(tab.id)}
              className="flex-1 items-center py-2"
            >
              <Feather
                name={tab.icon}
                size={22}
                color={isActive ? "#0055aa" : "#9ca3af"}
              />
              <Text
                className={`text-xs mt-1 ${
                  isActive ? "text-[#0055aa] font-bold" : "text-gray-400"
                }`}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

export default BottomTabBar;
