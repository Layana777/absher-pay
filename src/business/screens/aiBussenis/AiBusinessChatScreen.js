import { useState, useRef, useEffect, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  TextInput as RNTextInput,
  StatusBar,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useDispatch } from "react-redux";
import { useFocusEffect } from "@react-navigation/native";
import { hideTabBar, showTabBar } from "../../../store/slices";
import { CustomHeader } from "../../../common/components";
import { COLORS } from "../../../common/constants/colors";
import { useUser, useBusinessWallet } from "../../../store/hooks";
import { generateFinancialInsight } from "../../../common/services/aiService";
import {
  getWalletTransactions,
  getTransactionStats,
} from "../../../common/services/transactionService";
import {
  getWalletBills,
  getDaysUntilDue,
} from "../../../common/services/billsService";
import moment from "moment";
import SvgIcons from "../../../common/components/SvgIcons";

const QUICK_SUGGESTIONS = [
  "كم صرفت هذا الربع؟",
  "اعرض لي فواتيري القادمة",
  "ما أعلى فئة صرفت عليها؟",
];

// Animated typing indicator component
const AnimatedTypingIndicator = () => {
  const [dots, setDots] = useState("");

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => {
        if (prev === "...") return "";
        return prev + ".";
      });
    }, 500); // Change dots every 500ms

    return () => clearInterval(interval);
  }, []);

  return (
    <View className="mb-3 items-start">
      <View className="flex-row items-center mb-1">
        <View
          className="w-6 h-6 rounded-full items-center justify-center"
          style={{ backgroundColor: COLORS.businessPrimaryLight }}
        >
          <Feather name="cpu" size={12} color="white" />
        </View>
        <Text
          className="text-xs font-semibold mx-1"
          style={{ color: COLORS.businessPrimary }}
        >
          المساعدة الذكية للأعمال
        </Text>
      </View>
      <View
        className="rounded-2xl px-4 py-3 flex-row items-center"
        style={{ backgroundColor: COLORS.businessPrimaryLight }}
      >
        <Text className="text-white text-sm">جاري الكتابة{dots}</Text>
      </View>
    </View>
  );
};

// Component to render AI message with clickable bill references
const AIMessageWithBillLinks = ({
  text,
  billsData,
  onBillPress,
  primaryColor,
}) => {
  // Remove [BILL:id] tags from text for clean display
  const cleanText = text.replace(/\[BILL:[^\]]+\]/g, "").trim();

  // Parse text to find [BILL:id] references to extract mentioned bill IDs
  const billRefPattern = /\[BILL:([^\]]+)\]/g;
  const mentionedBillIds = [];
  let match;

  while ((match = billRefPattern.exec(text)) !== null) {
    mentionedBillIds.push(match[1]);
  }

  // Get all bills (upcoming + overdue)
  const allBills = [
    ...(billsData?.upcoming || []),
    ...(billsData?.overdue || []),
  ];

  // Only show bills if AI explicitly mentioned them with [BILL:id] tags
  const billsToShow =
    mentionedBillIds.length > 0
      ? allBills.filter((bill) => mentionedBillIds.includes(bill.id))
      : []; // Don't show any bills if no [BILL:id] tags found

  // Format date in Gregorian calendar with English month names
  const formatDateGregorian = (timestamp) => {
    if (!timestamp) return "غير محدد";
    return moment(timestamp).format("DD MMMM YYYY");
  };

  // Get remaining days text
  const getRemainingDaysText = (bill) => {
    const daysRemaining = getDaysUntilDue(bill);
    if (daysRemaining > 0) {
      return `${daysRemaining} يوم متبقي`;
    } else if (daysRemaining === 0) {
      return "اليوم آخر موعد";
    } else {
      return `متأخر ${Math.abs(daysRemaining)} يوم`;
    }
  };

  // Get status color
  const getStatusColor = (bill) => {
    const daysRemaining = getDaysUntilDue(bill);
    if (daysRemaining < 0) return "#EF4444"; // Red for overdue
    if (daysRemaining <= 3) return "#F59E0B"; // Orange for urgent
    return "#10B981"; // Green for normal
  };

  return (
    <View>
      <Text className="text-sm text-right leading-6 text-white">
        {cleanText}
      </Text>

      {/* Render bill cards at the bottom */}
      {billsToShow.length > 0 && (
        <View className="mt-3 gap-2">
          {billsToShow.map((bill, index) => {
            const daysText = getRemainingDaysText(bill);
            const statusColor = getStatusColor(bill);
            const dueDate = formatDateGregorian(bill.dueDate);

            return (
              <TouchableOpacity
                key={bill.id || index}
                onPress={() => onBillPress(bill)}
                className="bg-white rounded-xl p-4 shadow-sm"
                style={{ borderWidth: 1, borderColor: "#E5E7EB" }}
              >
                {/* Top row: Service name and amount */}
                <View className="flex-row items-start justify-between mb-2">
                  <View className="flex-row items-center">
                    <SvgIcons name={"SARBlack"} size={14} />
                    <Text className="text-gray-900 font-bold text-x1 mx-1">
                      {bill.amount?.toFixed(2) || "0.00"}
                    </Text>
                  </View>
                  <View className="">
                    <Text className="text-gray-900 font-bold text-x1 text-right">
                      {bill.serviceName?.ar || "فاتورة"}
                    </Text>
                    <Text className="text-gray-500 text-xs text-right mt-1">
                      {bill.ministryName?.ar || "غير محدد"}
                    </Text>
                  </View>
                </View>

                {/* Divider */}
                <View className="h-px bg-gray-200 my-2" />

                {/* Bottom row: Date and status */}
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center">
                    <Feather name="calendar" size={14} color="#6B7280" />
                    <Text className="text-gray-600 text-xs mx-1">
                      {dueDate}
                    </Text>
                  </View>
                  <View
                    className="px-3 py-1 rounded-full"
                    style={{ backgroundColor: `${statusColor}15` }}
                  >
                    <Text
                      className="text-xs font-semibold"
                      style={{ color: statusColor }}
                    >
                      {daysText}
                    </Text>
                  </View>
                </View>

                {/* Navigate icon */}
                <View
                  className="absolute left-3 top-1/2 my-1"
                  style={{ transform: [{ translateY: -10 }] }}
                >
                  <Feather name="chevron-left" size={20} color={primaryColor} />
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      )}
    </View>
  );
};

const AiBusinessChatScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const user = useUser();
  const businessWallet = useBusinessWallet();
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const scrollViewRef = useRef(null);

  // Hide tab bar when screen is focused and show it when unfocused
  useFocusEffect(
    useCallback(() => {
      dispatch(hideTabBar());

      return () => {
        dispatch(showTabBar());
      };
    }, [dispatch])
  );

  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  // Fetch financial data from Firebase
  const fetchFinancialData = async () => {
    try {
      if (!user?.uid || !businessWallet?.id) {
        throw new Error("User or wallet not found");
      }

      // Get last 30 days timestamp
      const startDate = Date.now() - 30 * 24 * 60 * 60 * 1000;

      // Parallel fetch for better performance
      const [transactionsResult, billsResult, statsResult] = await Promise.all([
        getWalletTransactions(businessWallet.id, { limit: 100 }),
        getWalletBills(user.uid, businessWallet.id, {}),
        getTransactionStats(businessWallet.id, {
          startDate,
          endDate: Date.now(),
        }),
      ]);

      return {
        transactions: transactionsResult.data || [],
        bills: billsResult || [],
        stats: statsResult.data || {},
        wallet: businessWallet,
      };
    } catch (error) {
      console.error("Error fetching financial data:", error);
      throw error;
    }
  };

  const handleSend = async () => {
    if (!message.trim()) return;

    // Add user message immediately
    const newUserMessage = {
      id: Date.now().toString(),
      sender: "user",
      text: message.trim(),
    };
    setMessages((prev) => [...prev, newUserMessage]);
    const userQuery = message.trim();
    setMessage("");
    setIsLoadingAI(true);

    try {
      // Fetch financial data
      const financialData = await fetchFinancialData();

      // Call AI service
      const result = await generateFinancialInsight(userQuery, financialData);

      if (result.success) {
        // Add AI response with bill data for navigation
        const aiMessage = {
          id: (Date.now() + 1).toString(),
          sender: "ai",
          text: result.response,
          billsData: result.billsData || null, // Store bill data for clickable references
        };
        setMessages((prev) => [...prev, aiMessage]);
      } else {
        // Error as AI message
        const errorMessage = {
          id: (Date.now() + 1).toString(),
          sender: "ai",
          text: result.error.userMessage,
          isError: true,
        };
        setMessages((prev) => [...prev, errorMessage]);
      }
    } catch (error) {
      console.error("Error in handleSend:", error);
      const errorMessage = {
        id: (Date.now() + 1).toString(),
        sender: "ai",
        text: "عذراً، حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.",
        isError: true,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoadingAI(false);
    }
  };

  const handleSuggestionPress = (suggestion) => {
    setMessage(suggestion);
  };

  // Handle bill press - Navigate to UpcomingPayDetailsScreen
  const handleBillPress = (bill) => {
    console.log("Bill pressed from AI chat:", bill);

    // Transform bill to payment format (similar to AllPaymentsScreen)
    const payment = {
      id: bill.id,
      title: bill.serviceName?.ar || "فاتورة",
      amount: bill.amount,
      dueDate: bill.dueDate,
      status: bill.status,
      referenceNumber: bill.referenceNumber || "N/A",
      isUrgent: bill.status === "overdue",
      billData: bill, // Pass full bill data
    };

    navigation.navigate("UpcomingPayDetails", {
      payment,
      primaryColor: COLORS.businessPrimary,
    });
  };

  return (
    <>
      <CustomHeader
        title="المساعد الذكي للأعمال"
        subtitle="مدعوم بالذكاء الاصطناعي"
        onBack={() => navigation.goBack()}
        statusBarBackgroundColor={COLORS.businessPrimary}
        rightElement={
          <View
            className="w-10 h-10 rounded-full items-center justify-center"
            style={{ backgroundColor: "rgba(255,255,255,0.2)" }}
          >
            <Feather name="cpu" size={20} color="white" />
          </View>
        }
      />
      <View className="flex-1 bg-gray-50" style={{ direction: "ltr" }}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          className="flex-1"
          keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
        >
          <ScrollView
            ref={scrollViewRef}
            className="flex-1"
            contentContainerStyle={{ padding: 16 }}
            showsVerticalScrollIndicator={false}
          >
            <View
              className="bg-gradient-to-br rounded-2xl p-5 mb-5 shadow-lg"
              style={{
                backgroundColor: COLORS.businessPrimary,
                direction: "ltr",
              }}
            >
              <View
                className="flex-row items-center mb-4"
                style={{
                  direction: "ltr",
                }}
              >
                <View className="flex-1 items-center">
                  <View className="bg-white rounded-full px-3 py-1 mb-2 self-end mx-2">
                    <Text
                      className="text-xs font-bold"
                      style={{ color: COLORS.businessPrimary }}
                    >
                      المساعد الذكي للأعمال{" "}
                    </Text>
                  </View>
                </View>
                <View
                  className="w-12 h-12 rounded-full items-center justify-center mr-3 "
                  style={{
                    backgroundColor: "rgba(255,255,255,0.2)",
                  }}
                >
                  <Feather name="cpu" size={24} color="white" />
                </View>
              </View>
              <Text className="text-white text-lg font-bold text-right">
                👋 أهلًا بك في مساعد أبشر للأعمال
              </Text>
              <Text className="text-white text-sm text-right mb-4 opacity-90">
                أنا مساعدك الذكي في محفظة أبشر أعمال، أقدر أساعدك في:
              </Text>
              <View className="space-y-2 mb-4">
                <View className="flex-row items-start">
                  <Text className="text-white text-sm text-right flex-1">
                    {" "}
                    التنبؤ بالفواتير والمدفوعات القادمة
                  </Text>
                </View>
                <View className="flex-row items-start">
                  <Text className="text-white text-sm text-right flex-1">
                    {" "}
                    التحليلات الذكية لمصاريف منشأتك
                  </Text>
                </View>
                <View className="flex-row items-start">
                  <Text className="text-white text-sm text-right flex-1">
                    {" "}
                    نظام إشعارات ذكي
                  </Text>
                </View>
                <View className="flex-row items-start">
                  <Text className="text-white text-sm text-right flex-1">
                    {" "}
                    تقارير مالية شهرية وربع سنوية
                  </Text>
                </View>
                <View className="flex-row items-start">
                  <Text className="text-white text-sm text-right flex-1">
                    {" "}
                    الإجابة على أسئلتك المالية بشكل فوري
                  </Text>
                </View>
              </View>
              <View
                className="bg-white rounded-xl p-3 mt-2"
                style={{ backgroundColor: "rgba(255,255,255,0.15)" }}
              >
                <Text className="text-white text-sm text-right font-semibold">
                  كيف يمكنني مساعدتك اليوم؟
                </Text>
              </View>
            </View>

            <View className="mb-20">
              {messages.map((msg, index) => (
                <View
                  key={msg.id}
                  className={`mb-3 ${
                    msg.sender === "user" ? "items-end" : "items-start"
                  }`}
                >
                  {msg.sender === "ai" && (
                    <View className="flex-row items-center mb-1">
                      <View
                        className="w-6 h-6 rounded-full items-center justify-center"
                        style={{ backgroundColor: COLORS.businessPrimaryLight }}
                      >
                        <Feather name="cpu" size={12} color="white" />
                      </View>
                      <Text
                        className="text-xs font-semibold mx-1"
                        style={{ color: COLORS.businessPrimary }}
                      >
                        المساعد الذكي للأعمال
                      </Text>
                    </View>
                  )}

                  <View
                    className={`rounded-2xl px-4 py-3 max-w-4/5 shadow-sm ${
                      msg.sender === "user" ? "rounded-tr-sm" : "rounded-tl-sm"
                    }`}
                    style={{
                      backgroundColor:
                        msg.sender === "user"
                          ? COLORS.white
                          : COLORS.businessPrimaryLight,
                      borderWidth: msg.sender === "user" ? 1 : 0,
                      borderColor: COLORS.borderLight,
                      maxWidth: "85%",
                    }}
                  >
                    {msg.sender === "ai" && msg.billsData ? (
                      <AIMessageWithBillLinks
                        text={msg.text}
                        billsData={msg.billsData}
                        onBillPress={handleBillPress}
                        primaryColor={COLORS.businessPrimary}
                      />
                    ) : (
                      <Text
                        className={`text-sm text-right leading-6 ${
                          msg.sender === "user" ? "text-gray-800" : "text-white"
                        }`}
                      >
                        {msg.text}
                      </Text>
                    )}
                  </View>

                  {msg.sender === "user" && (
                    <View className="flex-row items-center mt-1">
                      <Text className="text-xs text-gray-400 mx-1">أنا</Text>
                      <View className="w-5 h-5 rounded-full items-center justify-center bg-gray-300">
                        <Feather name="user" size={10} color="white" />
                      </View>
                    </View>
                  )}
                </View>
              ))}

              {isLoadingAI && <AnimatedTypingIndicator />}
            </View>
          </ScrollView>

          <View
            className="bg-white border-t border-gray-200 px-4 py-3"
            style={{ borderTopColor: COLORS.borderLight }}
          >
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              className="mb-3"
            >
              {QUICK_SUGGESTIONS.map((suggestion, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => handleSuggestionPress(suggestion)}
                  className="rounded-full px-4 py-2 mr-2 border"
                  style={{
                    backgroundColor: COLORS.white,
                    borderColor: COLORS.businessPrimaryLight,
                  }}
                >
                  <Text
                    className="text-sm"
                    style={{ color: COLORS.businessPrimary }}
                  >
                    {suggestion}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View className="flex-row items-center mb-5">
              <TouchableOpacity
                onPress={handleSend}
                disabled={!message.trim() || isLoadingAI}
                className="w-11 h-11 rounded-full items-center justify-center mx-2"
                style={{
                  backgroundColor:
                    message.trim() && !isLoadingAI
                      ? COLORS.businessPrimary
                      : COLORS.border,
                }}
              >
                <Feather name="send" size={18} color="white" />
              </TouchableOpacity>

              <View className="flex-1 flex-row items-center bg-gray-100 rounded-full px-4 py-2">
                <RNTextInput
                  value={message}
                  onChangeText={setMessage}
                  placeholder="اكتب سؤالك هنا..."
                  placeholderTextColor={COLORS.textSecondary}
                  className="flex-1 text-right text-base"
                  style={{ color: COLORS.text }}
                  multiline
                  maxLength={500}
                />
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>
    </>
  );
};

export default AiBusinessChatScreen;
