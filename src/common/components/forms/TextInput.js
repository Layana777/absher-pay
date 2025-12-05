import React from "react";
import { View, Text, TextInput as RNTextInput } from "react-native";

const TextInput = ({
  label,
  placeholder,
  value,
  onChangeText,
  secureTextEntry = false,
  icon,
  keyboardType = "default",
  className,
  inputClassName,
  error,
  ...props
}) => {
  return (
    <View className={`mb-4 ${className || ""}`}>
      {/* Label */}
      {label && (
        <Text className="text-sm font-medium text-gray-700 mb-2 text-right">
          {label}
        </Text>
      )}

      {/* Input Container */}
      <View
        className={`flex-row items-center bg-white border-2 rounded-lg px-4 py-3 ${
          error ? "border-red-500" : "border-gray-200"
        }`}
      >
        {/* Icon placeholder (left side for RTL) */}
        {icon && <View className="ml-3">{icon}</View>}

        {/* Text Input */}
        <RNTextInput
          className={`flex-1 text-right text-base text-gray-800 ${
            inputClassName || ""
          }`}
          placeholder={placeholder}
          placeholderTextColor="#9CA3AF"
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          {...props}
        />
      </View>

      {/* Error Message */}
      {error && (
        <Text className="text-red-500 text-xs mt-1 text-right">{error}</Text>
      )}
    </View>
  );
};

export default TextInput;
