import React, { useState } from "react";
import { View, TouchableOpacity, Text, Modal } from "react-native";
import { Feather } from "@expo/vector-icons";
import DatePickerWheels from "../DatePickerWheels";
import { COLORS } from "../../../common/constants/colors";

/**
 * Single (Customer) Payment Action Buttons Component
 */
const PaymentActionButtons = ({
  onPayNow,
  onSchedule,
  onRemindLater,
  primaryColor = COLORS.singlePrimary,
  isUrgent = false,
  serviceName = "",
  amount = "",
  isScheduled = false,
  existingScheduledBill = null,
}) => {
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const getInitialDate = () => {
    if (existingScheduledBill?.scheduledDate) {
      return new Date(existingScheduledBill.scheduledDate);
    }
    return new Date();
  };

  const [selectedDate, setSelectedDate] = useState(getInitialDate());
  const [paymentDate, setPaymentDate] = useState("");

  const handleScheduleClick = () => {
    if (isScheduled && existingScheduledBill?.scheduledDate) {
      const existingDate = new Date(existingScheduledBill.scheduledDate);
      setSelectedDate(existingDate);

      const day = String(existingDate.getDate()).padStart(2, '0');
      const month = String(existingDate.getMonth() + 1).padStart(2, '0');
      const year = existingDate.getFullYear();
      const formattedDate = `${day}-${month}-${year}`;
      setPaymentDate(formattedDate);
    }

    setShowScheduleModal(true);
    setShowDatePicker(false);
  };

  const handleDateChange = (date) => {
    setSelectedDate(date);
  };

  const handleDateDone = () => {
    const day = String(selectedDate.getDate()).padStart(2, '0');
    const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
    const year = selectedDate.getFullYear();
    const formattedDate = `${day}-${month}-${year}`;
    setPaymentDate(formattedDate);
    setShowDatePicker(false);
  };

  const handleCalendarPress = () => {
    setShowDatePicker(true);
  };

  const handleConfirmSchedule = () => {
    if (onSchedule && paymentDate) {
      onSchedule(selectedDate);
      setShowScheduleModal(false);
      setPaymentDate("");
      setSelectedDate(new Date());
      setShowDatePicker(false);
    }
  };

  const handleCancelSchedule = () => {
    setShowScheduleModal(false);
    setPaymentDate("");
    setSelectedDate(new Date());
    setShowDatePicker(false);
  };

  return (
    <View
      className="rounded-1xl p-5 mx-4 mb-9 shadow-sm"
      style={{ direction: "rtl" }}
    >
      {/* Primary Action Button - Pay Now */}
      <TouchableOpacity
        className="rounded-2xl py-4 mb-3 flex-row items-center justify-center"
        style={{ backgroundColor: primaryColor }}
        onPress={onPayNow}
        activeOpacity={0.8}
      >
        <Feather
          name="check-circle"
          size={20}
          color="white"
          style={{ marginLeft: 8 }}
        />
        <Text className="text-white text-base font-bold">ادفع الآن</Text>
      </TouchableOpacity>

      {/* Secondary Actions Row */}
      <View className="flex-row gap-3">
        <TouchableOpacity
          className="flex-1 rounded-2xl py-3 flex-row items-center justify-center border"
          style={{ borderColor: primaryColor }}
          onPress={handleScheduleClick}
          activeOpacity={0.7}
        >
          <Feather
            name="calendar"
            size={18}
            color={primaryColor}
            style={{ marginLeft: 6 }}
          />
          <Text className="text-sm font-bold" style={{ color: primaryColor }}>
            {isScheduled ? "تعديل" : "جدولة"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="flex-1 rounded-2xl py-3 flex-row items-center justify-center bg-gray-100"
          onPress={onRemindLater}
          activeOpacity={0.7}
        >
          <Feather
            name="bell"
            size={18}
            color="#6B7280"
            style={{ marginLeft: 6 }}
          />
          <Text className="text-gray-700 text-sm font-bold">تذكير</Text>
        </TouchableOpacity>
      </View>

      {/* Schedule Payment Modal */}
      <Modal
        visible={showScheduleModal}
        transparent={true}
        animationType="slide"
        onRequestClose={handleCancelSchedule}
      >
        <View className="flex-1 justify-end bg-black/50">
          <View className="bg-white rounded-t-3xl px-5 pb-8">
            <View className="items-center py-3">
              <View className="w-12 h-1 bg-gray-300 rounded-full" />
            </View>

            <Text className="text-gray-800 text-xl font-bold text-center mb-6">
              {isScheduled ? "تعديل الجدولة" : "جدولة المدفوعات"}
            </Text>

            <View className="flex-row justify-between items-center mb-4 py-3 px-4 bg-gray-50 rounded-xl" style={{direction: "ltr"}}>
              <View className="flex-1 items-center">
                <Text className="text-gray-800 text-base font-bold">{serviceName}</Text>
              </View>
              <Text className="text-gray-700 text-sm font-semibold">الخدمة</Text>
            </View>

            <View className="flex-row items-center justify-between mb-4 py-3 px-4 bg-gray-50 rounded-xl" style={{direction: "ltr"}}>
              <View className="flex-1 items-center">
                <Text className="text-gray-800 text-base font-bold">{amount}</Text>
              </View>
              <Text className="text-gray-700 text-sm font-semibold">المبلغ</Text>
            </View>

            {!showDatePicker ? (
              <TouchableOpacity
                onPress={handleCalendarPress}
                className="mb-6 py-3 px-4 bg-gray-50 rounded-xl"
              >
                <View className="flex-row items-center" style={{direction: "rtl"}}>
                  <Text className="text-gray-700 text-sm font-semibold">تاريخ الدفع</Text>
                  <View className="flex-1 items-center">
                    <Text className="text-gray-800 text-base font-bold">
                      {paymentDate || ""}
                    </Text>
                  </View>
                  <Feather name="calendar" size={20} color={primaryColor} />
                </View>
              </TouchableOpacity>
            ) : (
              <View className="mb-6">
                <View className="flex-row items-center justify-between mb-2 px-2">
                  <TouchableOpacity
                    onPress={() => setShowDatePicker(false)}
                    className="w-8 h-8 items-center justify-center"
                  >
                    <Feather name="x" size={18} color="#6B7280" />
                  </TouchableOpacity>
                  <Text className="text-gray-700 text-sm font-semibold">اختر التاريخ</Text>
                  <View style={{ width: 32 }} />
                </View>
                <DatePickerWheels
                  onDateChange={handleDateChange}
                  initialDate={selectedDate}
                  minimumDate={new Date()}
                />

                <TouchableOpacity
                  onPress={handleDateDone}
                  className="rounded-xl py-3 mt-4"
                  style={{ backgroundColor: primaryColor }}
                >
                  <Text className="text-white text-base font-semibold text-center">
                    تم
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {!showDatePicker && (
              <>
                <TouchableOpacity
                  onPress={handleConfirmSchedule}
                  disabled={!paymentDate}
                  className="rounded-xl py-4 mb-3"
                  style={{
                    backgroundColor: primaryColor,
                    opacity: paymentDate ? 1 : 0.5
                  }}
                >
                  <Text className="text-white text-base font-semibold text-center">
                    تأكيد
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleCancelSchedule}
                  className="py-3"
                >
                  <Text className="text-gray-600 text-center text-base">رجوع</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default PaymentActionButtons;
