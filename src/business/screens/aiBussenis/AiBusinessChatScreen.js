import { useState, useRef, useEffect } from "react";
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
import { CustomHeader } from "../../../common/components";
import { COLORS } from "../../../common/constants/colors";

const MESSAGES = [
  { id: "1", sender: "user", text: "كم صرفت هذا الشهر؟" },
  {
    id: "2",
    sender: "ai",
    text: "إجمالي مصاريفك حتى اليوم هو 28,450 ريال سعودي. هذا يشمل المدفوعات للموظفين، الفواتير، ومشتريات المخزون.",
  },
  { id: "3", sender: "user", text: "هل عندي فواتير قريب استحقاقها؟" },
  {
    id: "4",
    sender: "ai",
    text: "نعم، لديك 3 فواتير تستحق الدفع خلال الأيام العشرة القادمة:\n\n• فاتورة كهرباء: 2,500 ريال (خلال 3 أيام)\n• إيجار المحل: 15,000 ريال (خلال 7 أيام)\n• اشتراك الإنترنت: 499 ريال (خلال 10 أيام)",
  },
];

const QUICK_SUGGESTIONS = [
  "كم صرفت هذا الربع؟",
  "هل لديّ مصاريف قادمة؟",
  "ما أعلى فئة صرفت عليها؟",
];

const AiBusinessChatScreen = ({ navigation }) => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState(MESSAGES);
  const scrollViewRef = useRef(null);

  // useEffect(() => {
  //   scrollViewRef.current?.scrollToEnd({ animated: true });
  // }, [messages]);

  const handleSend = () => {
    if (message.trim()) {
      const newMessage = {
        id: Date.now().toString(),
        sender: "user",
        text: message,
      };
      setMessages([...messages, newMessage]);
      setMessage("");
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
                disabled={!message.trim()}
                className="w-11 h-11 rounded-full items-center justify-center ml-2"
                style={{
                  backgroundColor: message.trim()
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
