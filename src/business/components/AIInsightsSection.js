import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { getAIInsights } from "../../common/services/aiInsightsService";
import SvgIcons from "../../common/components/SvgIcons";

/**
 * AI Insights Section Component
 *
 * Displays personalized AI-powered insights for business users.
 * Insights are generated once per login and cached for the session.
 *
 * @param {string} userId - User ID to fetch insights for
 * @param {Function} onInsightPress - Callback when insight card is pressed (receives billId)
 * @param {string} title - Section title (default: "رؤى ذكية")
 */
const AIInsightsSection = ({ userId, onInsightPress, title = "رؤى ذكية" }) => {
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userId) {
      fetchInsights();
    }
  }, [userId]);

  const fetchInsights = async () => {
    try {
      setLoading(true);
      const data = await getAIInsights(userId);
      setInsights(data || []);
    } catch (error) {
      console.error("Error fetching AI insights:", error);
      setInsights([]);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Get style configuration based on insight type
   * @param {string} type - Insight type
   * @returns {Object} Style configuration with icon, colors, and background
   */
  const getInsightStyle = (type) => {
    const styles = {
      expense_prediction: {
        icon: "trending-up",
        iconFamily: "Feather",
        iconColor: "#8B5CF6", // Purple
        iconBgColor: "#F3E8FF", // Light purple
        badgeBg: "#F3E8FF",
        badgeText: "#8B5CF6",
      },
      optimization_tip: {
        icon: "lightbulb-on",
        iconFamily: "MaterialCommunityIcons",
        iconColor: "#3B82F6", // Blue
        iconBgColor: "#DBEAFE", // Light blue
        badgeBg: "#DBEAFE",
        badgeText: "#3B82F6",
      },
      bill_warning: {
        icon: "alert-circle",
        iconFamily: "Feather",
        iconColor: "#EF4444", // Red
        iconBgColor: "#FEE2E2", // Light red
        badgeBg: "#FEE2E2",
        badgeText: "#EF4444",
      },
      spending_pattern: {
        icon: "trending-up",
        iconFamily: "Feather",
        iconColor: "#10B981", // Green
        iconBgColor: "#D1FAE5", // Light green
        badgeBg: "#D1FAE5",
        badgeText: "#10B981",
      },
    };
    return styles[type] || styles.expense_prediction;
  };

  /**
   * Handle insight card press
   * Navigates to bill details if insight is actionable
   */
  const handleInsightPress = (insight) => {
    if (insight.billId && insight.actionable && onInsightPress) {
      onInsightPress(insight.billId);
    }
  };

  return (
    <View className="px-5 mb-6" style={{ direction: "rtl" }}>
      {/* Header */}
      <View className="flex-row items-center mb-4">
        <SvgIcons name="AI" size={25} />
        <Text className="text-gray-800 text-lg font-bold ml-2">{title}</Text>
        <View className="ml-2 bg-purple-100 px-2 py-1 rounded-full">
          <Text className="text-purple-600 text-xs font-bold">AI</Text>
        </View>
      </View>

      {/* Loading State */}
      {loading && (
        <View className="py-8 items-center">
          <ActivityIndicator size="large" color="#0055aa" />
          <Text className="text-gray-500 text-sm mt-2">
            جاري تحليل بياناتك المالية...
          </Text>
        </View>
      )}

      {/* Insight Cards */}
      {!loading &&
        insights.map((insight, index) => {
          const style = getInsightStyle(insight.type);
          const IconComponent =
            style.iconFamily === "MaterialCommunityIcons"
              ? MaterialCommunityIcons
              : Feather;

          return (
            <TouchableOpacity
              key={index}
              onPress={() => handleInsightPress(insight)}
              disabled={!insight.actionable}
              className="bg-white rounded-2xl p-4 mb-3 flex-row items-start"
              style={{
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.08,
                shadowRadius: 8,
                elevation: 3,
              }}
            >
              {/* Icon */}
              <View
                className="w-12 h-12 rounded-full items-center justify-center"
                style={{ backgroundColor: style.iconBgColor }}
              >
                <IconComponent
                  name={style.icon}
                  size={22}
                  color={style.iconColor}
                />
              </View>

              {/* Content */}
              <View className="flex-1 mx-3">
                <View className="flex-row-reverse items-center mb-2">
                  {insight.priority === "high" && (
                    <View
                      className="px-2 py-1 rounded-full mr-2"
                      style={{ backgroundColor: style.badgeBg }}
                    >
                      <Text
                        className="text-xs font-bold"
                        style={{ color: style.badgeText }}
                      >
                        عاجل
                      </Text>
                    </View>
                  )}
                  <Text className="text-gray-800 font-bold text-sm flex-1 text-left">
                    {insight.titleAr}
                  </Text>
                </View>
                <Text className="text-gray-600 text-xs leading-5 text-left">
                  {insight.messageAr}
                </Text>
              </View>

              {/* Action Indicator (if actionable) */}
              {insight.actionable && (
                <View className="ml-2 justify-center">
                  <Feather name="chevron-left" size={18} color="#9CA3AF" />
                </View>
              )}
            </TouchableOpacity>
          );
        })}

      {/* Empty State */}
      {!loading && insights.length === 0 && (
        <View className="py-8 items-center">
          <Text className="text-gray-500 text-center">
            لا توجد نصائح متاحة حالياً
          </Text>
        </View>
      )}
    </View>
  );
};

export default AIInsightsSection;
