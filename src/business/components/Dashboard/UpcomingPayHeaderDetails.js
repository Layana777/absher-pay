import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  SafeAreaView,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import SvgIcons from "../../../common/components/SvgIcons";
import { formatAmount } from "../../../common/utils";

/**
 * Header component for payment details screen
 * Shows main payment information with icon, title, and amount
 * Includes navigation header
 *
 * @param {Object} payment - Payment data object
 * @param {string} payment.title - Payment title
 * @param {string} payment.description - Payment description
 * @param {number} payment.amount - Payment amount in SAR
 * @param {string} payment.icon - Feather icon name
 * @param {string} payment.iconColor - Icon color hex
 * @param {string} payment.iconBgColor - Icon background Tailwind class
 * @param {string} payment.ministryIconName - Ministry icon name for SvgIcons
 * @param {number} payment.ministryIconSize - Size of ministry icon
 * @param {boolean} payment.isUrgent - Urgency flag
 * @param {string} primaryColor - Primary brand color (default: "#0055aa")
 * @param {Function} onBack - Back button callback
 */
const UpcomingPayHeaderDetails = ({
  payment,
  primaryColor = "#0055aa",
  onBack,
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

      {/* Amount Display with Badge */}
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

        {/* Urgent Badge Below Amount */}
        {isUrgent && (
          <View className="bg-white/20 px-4 py-2 rounded-full mt-3 flex-row items-center">
            <Feather
              name="users"
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
