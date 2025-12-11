import React from "react";
import { View, Text } from "react-native";
import { Feather } from "@expo/vector-icons";
import SvgIcons from "../../../common/components/SvgIcons";
import { formatAmount } from "../../../common/utils";
import { COLORS } from "../../../common/constants/colors";

/**
 * Single (Customer) Header component for payment details screen
 * Shows main payment information with icon, title, and amount
 *
 * @param {Object} payment - Payment data object
 * @param {string} primaryColor - Primary brand color (Single green)
 */
const UpcomingPayHeaderDetails = ({
  payment,
  primaryColor = COLORS.singlePrimary,
}) => {
  const {
    title,
    description,
    amount,
    ministryIconName = "MOI",
    isUrgent = false,
  } = payment;

  return (
    <View
      className="rounded-b-3xl pb-8 mb-4"
      style={{
        backgroundColor: primaryColor,
        direction: "rtl",
      }}
    >
      {/* Icon Section */}
      <View className="items-center mb-6 mt-4">
        <View
          className="w-20 h-20 rounded-2xl items-center justify-center mb-3"
          style={{ backgroundColor: "rgba(255, 255, 255)" }}
        >
          <SvgIcons name={ministryIconName} size={60} />
        </View>
      </View>
      <View className="absolute top-[39%] right-[-18%] w-40 h-40 rounded-full opacity-10 bg-white" />

      {/* Title */}
      <View className="items-center mb-6">
        <Text className="text-white text-lg font-bold mb-2 text-center">
          {title}
        </Text>
        <Text className="text-white/70 text-xs text-center">{description}</Text>
      </View>

      {/* Amount Display */}
      <View className="items-center px-4">
        <View
          className="bg-white/10 rounded-2xl px-6 py-4 flex-row items-center justify-center"
          style={{ minWidth: "70%" }}
        >
          <View className="flex-row items-center">
            <Text className="text-white text-3xl font-bold ml-2">
              {formatAmount(amount)}
            </Text>
            <Text className="text-white text-m">
              <SvgIcons name={"SAR"} size={30} />
            </Text>
          </View>
        </View>

        {/* Urgent Badge */}
        {isUrgent && (
          <View className="bg-white/20 px-4 py-2 rounded-full mt-3 flex-row items-center">
            <Feather
              name="alert-circle"
              size={14}
              color="white"
              style={{ marginLeft: 6 }}
            />
            <Text className="text-white text-xs font-bold">{description}</Text>
          </View>
        )}
      </View>
    </View>
  );
};

export default UpcomingPayHeaderDetails;
