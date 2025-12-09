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
import { getWalletBills } from "../../../common/services/billsService";

const QUICK_SUGGESTIONS = [
  "كم صرفت هذا الربع؟",
  "هل لديّ مصاريف قادمة؟",
  "ما أعلى فئة صرفت عليها؟",
];

// Animated typing indicator component
const AnimatedTypingIndicator = () => {
  const [dots, setDots] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => {
        if (prev === '...') return '';
        return prev + '.';
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
          AI Assistant
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
        // Add AI response
        const aiMessage = {
          id: (Date.now() + 1).toString(),
          sender: "ai",
          text: result.response,
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
                className="flex-row items-end mb-4"
                style={{
                  direction: "ltr",
                  backgroundColor: "rgba(255,255,255,0.2)",
                }}
              >
                <View className="flex-1 items-center">
                  <View className="bg-white rounded-full px-3 py-1 mb-2 self-end mx-2">
                    <Text
                      className="text-xs font-bold"
                      style={{ color: COLORS.businessPrimary }}
                    >
                      AI Assistant
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
                        AI Assistant
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
                    <Text
                      className={`text-sm text-right leading-6 ${
                        msg.sender === "user" ? "text-gray-800" : "text-white"
                      }`}
                    >
                      {msg.text}
                    </Text>
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

            <View className="flex-row items-center">
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
