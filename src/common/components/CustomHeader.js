import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from "react-native";
import { Feather } from "@expo/vector-icons";

const CustomHeader = ({
  title,
  onBack,
  showBackButton = true,
  backgroundColor = "#FFFFFF",
  textColor = "#000000",
  statusBarStyle = "dark-content",
  statusBarBackgroundColor = "#FFFFFF",
  rightComponent = null,
}) => {
  return (
    <>
      <StatusBar
        barStyle={statusBarStyle}
        backgroundColor={statusBarBackgroundColor}
      />
      <SafeAreaView style={{ backgroundColor }}>
        <View
          className="flex-row items-center justify-between px-4 py-4 border-b border-gray-200"
          style={{ backgroundColor }}
        >
          {/* Left Side - Right Component or Empty Space */}
          <View style={{ width: 40 }}>
            {rightComponent ? rightComponent : null}
          </View>

          {/* Center - Title */}
          <Text className="text-lg font-semibold" style={{ color: textColor }}>
            {title}
          </Text>

          {/* Right Side - Back Button */}
          {showBackButton ? (
            <TouchableOpacity onPress={onBack} className="p-2">
              <Feather name="arrow-left" size={24} color={textColor} />
            </TouchableOpacity>
          ) : (
            <View style={{ width: 40 }} />
          )}
        </View>
      </SafeAreaView>
    </>
  );
};

export default CustomHeader;
