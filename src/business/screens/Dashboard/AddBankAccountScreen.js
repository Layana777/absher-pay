import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Modal,
  FlatList,
  Image,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useDispatch } from "react-redux";
import CustomHeader from "../../../common/components/CustomHeader";
import Button from "../../../common/components/ui/Button";
import SvgIcons from "../../../common/components/SvgIcons";
import { useBusinessWallet, useUser } from "../../../store/hooks";
import { SIZES } from "../../../common/constants/sizes";
import { addBankAccount } from "../../../store/slices/bankAccountsSlice";
import { createBankAccount } from "../../../common/services/bankAccountService";

// Saudi Banks List with logos
const SAUDI_BANKS = [
  {
    id: "1",
    name: "مصرف الراجحي",
    nameEn: "Al Rajhi Bank",
    logo: require("../../../common/assets/icons/alrajhi-logo.png"),
  },
  {
    id: "2",
    name: "البنك الأهلي السعودي",
    nameEn: "SNB Bank",
    logo: require("../../../common/assets/icons/snb-logo.png"),
  },
  {
    id: "3",
    name: "بنك الرياض",
    nameEn: "Riyad Bank",
    logo: require("../../../common/assets/icons/riyad-bank-logo.png"),
  },
  {
    id: "4",
    name: "بنك السعودي الأول",
    nameEn: "SABB Bank",
    logo: require("../../../common/assets/icons/sabb-logo.png"),
  },
  {
    id: "5",
    name: "البنك العربي الوطني",
    nameEn: "Arab National Bank",
    logo: require("../../../common/assets/icons/anb-logo.png"),
  },
  {
    id: "6",
    name: "بنك البلاد",
    nameEn: "Bank Albilad",
    logo: require("../../../common/assets/icons/albilad-logo.png"),
  },
  {
    id: "7",
    name: "بنك الإنماء",
    nameEn: "Alinma Bank",
    logo: require("../../../common/assets/icons/alinma-logo.png"),
  },
  {
    id: "8",
    name: "بنك الجزيرة",
    nameEn: "Bank AlJazira",
    logo: require("../../../common/assets/icons/aljazira-logo.png"),
  },
];

const AddBankAccountScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const user = useUser();
  const [selectedBank, setSelectedBank] = useState(null);
  const [iban, setIban] = useState("");
  const [accountOwner, setAccountOwner] = useState("");
  const [showBankModal, setShowBankModal] = useState(false);
  const [ibanError, setIbanError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Get business wallet data
  const businessWallet = useBusinessWallet();
  const balance = businessWallet?.balance
    ? businessWallet.balance.toLocaleString("en-US", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      })
    : "0";

  const validateIban = (iban) => {
    // Remove spaces and convert to uppercase
    const cleanIban = iban.replace(/\s/g, "").toUpperCase();

    // If empty, no error
    if (cleanIban.length === 0) {
      return "";
    }

    // Check if IBAN has exactly 24 characters
    if (cleanIban.length !== 24) {
      return "رقم الايبان غير صحيح";
    }

    // Validate format: SA + 22 digits
    const formatRegex = /^SA\d{22}$/;
    if (!formatRegex.test(cleanIban)) {
      return "رقم الايبان غير صحيح";
    }

    return "";
  };

  const convertArabicToEnglish = (text) => {
    const arabicNumbers = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];
    const englishNumbers = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];

    let result = text;
    arabicNumbers.forEach((arabicNum, index) => {
      result = result.replace(
        new RegExp(arabicNum, "g"),
        englishNumbers[index]
      );
    });

    return result;
  };

  const formatIban = (cleanIban) => {
    // Format IBAN with spaces every 4 characters
    // Example: SA0380000000608010167519 -> SA03 8000 0000 6080 1016 7519
    if (!cleanIban) return "";

    const formatted = cleanIban.match(/.{1,4}/g)?.join(" ") || cleanIban;
    return formatted;
  };

  const handleIbanChange = (text) => {
    // Convert Arabic numbers to English
    let processedText = convertArabicToEnglish(text);

    // Convert to uppercase
    processedText = processedText.toUpperCase();

    // Remove any spaces
    processedText = processedText.replace(/\s/g, "");

    // Filter to only allow SA at start and numbers after
    if (processedText.length === 0) {
      setIban("");
      setIbanError("");
      return;
    }

    // Ensure it starts with SA
    if (processedText.length === 1 && processedText !== "S") {
      return; // Don't update if first character is not S
    }

    if (processedText.length === 2 && !processedText.startsWith("SA")) {
      return; // Don't update if first two characters are not SA
    }

    // After SA, only allow numbers
    if (processedText.length > 2) {
      const prefix = processedText.substring(0, 2);
      const rest = processedText.substring(2);

      // Check if prefix is SA and rest contains only numbers
      if (prefix !== "SA" || !/^\d*$/.test(rest)) {
        return; // Don't update if format is invalid
      }
    }

    // Format with spaces for display
    const formattedIban = formatIban(processedText);
    setIban(formattedIban);

    // Validate IBAN (using clean version without spaces)
    const error = validateIban(processedText);
    setIbanError(error);
  };

  const handleSave = async () => {
    try {
      setIsLoading(true);

      // Clean IBAN by removing spaces before saving
      const cleanIban = iban.replace(/\s/g, "");

      // Prepare bank account data
      const bankAccountData = {
        bankName: selectedBank?.name,
        bankNameEn: selectedBank?.nameEn,
        bankLogo: selectedBank?.logo,
        iban: cleanIban,
        ibanFormatted: iban, // Keep formatted version for display
        accountOwner,
        accountNumber: cleanIban.substring(cleanIban.length - 4), // Last 4 digits
        isVerified: true,
        isSelected: true, // Mark as selected by default
      };

      // Save to Firebase
      const firebaseResult = await createBankAccount(
        user?.uid,
        bankAccountData
      );

      if (firebaseResult.success) {
        console.log("Bank account saved to Firebase:", firebaseResult.data);

        // Dispatch action to add bank account to Redux store
        dispatch(addBankAccount(firebaseResult.data));

        console.log("Bank account added to Redux:", firebaseResult.data);

        // Navigate to success screen with bank details
        navigation.navigate("BankAccountSuccess", {
          bankName: selectedBank?.name,
          iban: iban, // Keep formatted version for display
        });
      } else {
        console.error(
          "Failed to save bank account to Firebase:",
          firebaseResult.error
        );
        alert("حدث خطأ أثناء حفظ الحساب البنكي. يرجى المحاولة مرة أخرى.");
      }
    } catch (error) {
      console.error("Error saving bank account:", error);
      alert("حدث خطأ أثناء حفظ الحساب البنكي. يرجى المحاولة مرة أخرى.");
    } finally {
      setIsLoading(false);
    }
  };

  const selectBank = (bank) => {
    setSelectedBank(bank);
    setShowBankModal(false);
  };

  return (
    <>
      <CustomHeader
        title="التحويل البنكي"
        onBack={() => navigation.goBack()}
        backgroundColor="#0055aa"
        textColor="#FFFFFF"
        statusBarStyle="light-content"
        statusBarBackgroundColor="#0055aa"
      />
      <View style={{ flex: 1, backgroundColor: "#f9fafb", direction: "ltr" }}>
        <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
          {/* Current Balance Card */}
          <View
            style={{
              backgroundColor: "white",
              marginHorizontal: 16,
              marginTop: 20,
              borderRadius: 16,
              padding: 20,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.05,
              shadowRadius: 2,
              elevation: 2,
            }}
          >
            <Text
              style={{
                color: "#6b7280",
                fontSize: 14,
                textAlign: "center",
                marginBottom: 8,
              }}
            >
              الرصيد المتاح
            </Text>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                direction: "ltr",
              }}
            >
              <SvgIcons name="SARBlack" size={28} />
              <Text
                style={{ color: "#1f2937", fontSize: 30, fontWeight: "bold" }}
              >
                {balance}
              </Text>
            </View>
          </View>

          {/* Form Card */}
          <View
            style={{
              backgroundColor: "white",
              marginHorizontal: 16,
              marginTop: 16,
              borderRadius: 16,
              padding: 20,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.05,
              shadowRadius: 2,
              elevation: 2,
            }}
          >
            <Text
              style={{
                color: "#374151",
                fontSize: 16,
                fontWeight: "600",
                marginBottom: 24,
                textAlign: "center",
              }}
            >
              تعبئة الحساب البنكي
            </Text>

            {/* Bank Selection */}
            <View style={{ marginBottom: 20 }}>
              <Text
                style={{
                  width: "100%",
                  color: "#6b7280",
                  fontSize: 14,
                  marginBottom: 8,
                  writingDirection: "rtl",
                  textAlign: "right",
                }}
              >
                إضافة
              </Text>
              <Text
                style={{
                  width: "100%",
                  color: "#374151",
                  fontSize: 14,
                  fontWeight: "600",
                  marginBottom: 8,
                  writingDirection: "rtl",
                  textAlign: "right",
                }}
              >
                اسم البنك
              </Text>
              <TouchableOpacity
                onPress={() => setShowBankModal(true)}
                style={{
                  backgroundColor: "#f9fafb",
                  borderRadius: 12,
                  padding: 16,
                  flexDirection: "row-reverse",
                  alignItems: "center",
                  justifyContent: "space-between",
                  width: "100%",
                }}
              >
                <Text
                  style={{
                    fontSize: 14,
                    color: selectedBank ? "#1f2937" : "#9ca3af",
                    flex: 1,
                    textAlign: "right",
                  }}
                >
                  {selectedBank ? selectedBank.name : "اختار البنك"}
                </Text>
                <Feather name="chevron-down" size={20} color="#6b7280" />
              </TouchableOpacity>
            </View>

            {/* IBAN Input */}
            <View style={{ marginBottom: 20, direction: "ltr" }}>
              <Text
                style={{
                  width: "100%",
                  color: "#374151",
                  fontSize: 14,
                  fontWeight: "600",
                  marginBottom: 8,
                  writingDirection: "rtl",
                  textAlign: "right",
                }}
              >
                رقم الايبان (IBAN)
              </Text>
              <TextInput
                style={{
                  backgroundColor: "#f9fafb",
                  borderRadius: 12,
                  padding: 16,
                  color: "#1f2937",
                  fontSize: SIZES.fontSize.base,
                  textAlign: "left",
                  width: "100%",
                }}
                value={iban}
                onChangeText={handleIbanChange}
                placeholder="SA03 8000 0000 6080 1016 7519"
                placeholderTextColor="#9ca3af"
                maxLength={29}
                autoCapitalize="characters"
              />
              {ibanError ? (
                <Text
                  style={{
                    width: "100%",
                    color: "#ef4444",
                    fontSize: 12,
                    marginTop: 4,
                    textAlign: "right",
                  }}
                >
                  {ibanError}
                </Text>
              ) : iban.length > 0 ? (
                <Text
                  style={{
                    width: "100%",
                    color: "#9ca3af",
                    fontSize: 12,
                    marginTop: 4,
                    textAlign: "right",
                  }}
                >
                  {iban.replace(/\s/g, "").length}/24 حرف
                </Text>
              ) : null}
            </View>

            {/* Account Owner Name */}
            <View style={{ marginBottom: 20 }}>
              <Text
                style={{
                  width: "100%",
                  color: "#374151",
                  fontSize: 14,
                  fontWeight: "600",
                  marginBottom: 8,
                  textAlign: "right",
                  writingDirection: "rtl",
                }}
              >
                اسم صاحب الحساب
              </Text>
              <TextInput
                style={{
                  backgroundColor: "#f9fafb",
                  borderRadius: 12,
                  padding: 16,
                  color: "#1f2937",
                  fontSize: SIZES.fontSize.base,
                  textAlign: "right",
                  width: "100%",
                }}
                value={accountOwner}
                onChangeText={setAccountOwner}
                placeholder="أدخل الأسم كما هو في البنك"
                placeholderTextColor="#9ca3af"
              />
            </View>

            {/* Save Button */}
            <Button
              title={isLoading ? "جاري الحفظ..." : "حفظ التغييرات"}
              onPress={handleSave}
              variant="business-primary"
              disabled={
                isLoading ||
                !selectedBank ||
                !iban ||
                !accountOwner ||
                iban.replace(/\s/g, "").length !== 24 ||
                !!ibanError
              }
              style={{ width: "100%" }}
            />
          </View>

          {/* Notice */}
          <View
            style={{
              backgroundColor: "#eff6ff",
              marginHorizontal: 16,
              marginTop: 16,
              marginBottom: 24,
              borderRadius: 12,
              padding: 16,
            }}
          >
            <Text
              style={{
                color: "#0055aa",
                fontSize: 12,
                textAlign: "center",
                lineHeight: 20,
              }}
            >
              سيتم تحويل المبالغ إلى حسابك البنكي خلال 24 ساعة من وقت تأكيد
              العملية
            </Text>
          </View>
        </ScrollView>

        {/* Bank Selection Modal */}
        <Modal
          visible={showBankModal}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowBankModal(false)}
        >
          <View
            style={{
              flex: 1,
              backgroundColor: "rgba(0, 0, 0, 0.5)",
              justifyContent: "flex-end",
            }}
          >
            <View
              style={{
                backgroundColor: "white",
                borderTopLeftRadius: 24,
                borderTopRightRadius: 24,
                maxHeight: "70%",
              }}
            >
              {/* Modal Header */}
              <View
                style={{
                  padding: 20,
                  borderBottomWidth: 1,
                  borderBottomColor: "#e5e7eb",
                  flexDirection: "row-reverse",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <View style={{ width: 24 }} />
                <Text
                  style={{
                    color: "#1f2937",
                    fontSize: 18,
                    fontWeight: "bold",
                    flex: 1,
                    textAlign: "center",
                  }}
                >
                  اختر البنك
                </Text>
                <TouchableOpacity onPress={() => setShowBankModal(false)}>
                  <Feather name="x" size={24} color="#6b7280" />
                </TouchableOpacity>
              </View>

              {/* Banks List */}
              <FlatList
                data={SAUDI_BANKS}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    onPress={() => selectBank(item)}
                    style={{
                      padding: 16,
                      borderBottomWidth: 1,
                      borderBottomColor: "#f3f4f6",
                      flexDirection: "row-reverse",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <View
                      style={{ flexDirection: "row", alignItems: "center" }}
                    >
                      {selectedBank?.id === item.id && (
                        <Feather name="check" size={20} color="#0055aa" />
                      )}
                    </View>
                    <View
                      style={{
                        flex: 1,
                        alignItems: "flex-end",
                        marginLeft: 12,
                      }}
                    >
                      <Text
                        style={{
                          color: "#1f2937",
                          fontSize: 16,
                          fontWeight: "600",
                          marginBottom: 4,
                          textAlign: "right",
                        }}
                      >
                        {item.name}
                      </Text>
                      <Text
                        style={{
                          color: "#9ca3af",
                          fontSize: 14,
                          textAlign: "right",
                        }}
                      >
                        {item.nameEn}
                      </Text>
                    </View>
                    <View
                      style={{
                        backgroundColor: "white",
                        borderRadius: 12,
                        borderWidth: 1,
                        borderColor: "#e5e7eb",
                        width: 44,
                        height: 44,
                        alignItems: "center",
                        justifyContent: "center",
                        overflow: "hidden",
                        direction: "rtl",
                      }}
                    >
                      {item.logo ? (
                        <Image
                          source={item.logo}
                          style={{ width: 32, height: 32, direction: "rtl" }}
                          resizeMode="contain"
                        />
                      ) : (
                        <Feather name="briefcase" size={20} color="#0055aa" />
                      )}
                    </View>
                  </TouchableOpacity>
                )}
              />
            </View>
          </View>
        </Modal>
      </View>
    </>
  );
};

export default AddBankAccountScreen;
