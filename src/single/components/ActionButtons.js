import { View, Text, TouchableOpacity } from "react-native";

const ActionButtons = ({
  primaryText = "شحن المحفظة",
  secondaryText = "+ تحويل",
  onPrimaryPress,
  onSecondaryPress,
  size = "medium", // "small" | "medium" | "large"
}) => {
  const sizeStyles = {
    small: "py-3",
    medium: "py-3.5",
    large: "py-4",
  };

  const textSizeStyles = {
    small: "text-xs",
    medium: "text-sm",
    large: "text-base",
  };

  return (
    <View className="flex-row gap-3">
      <TouchableOpacity
        className={`flex-1 bg-white/20 backdrop-blur rounded-2xl ${sizeStyles[size]} items-center`}
        onPress={onSecondaryPress}
      >
        <Text className={`text-white ${textSizeStyles[size]} font-bold`}>
          {secondaryText}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        className={`flex-1 bg-white rounded-2xl ${sizeStyles[size]} items-center`}
        onPress={onPrimaryPress}
      >
        <Text className={`text-[#028550] ${textSizeStyles[size]} font-bold`}>
          {primaryText}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default ActionButtons;
