import React, { useState } from "react";
import { View, TouchableOpacity, Text, Modal, Platform } from "react-native";
import { Feather } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";

/**
 * Payment Action Buttons Component
 * Provides action buttons for payment operations
 *
 * @param {Function} onPayNow - Callback for "Pay Now" button
 * @param {Function} onSchedule - Callback for "Schedule Payment" button with payment date
 * @param {Function} onRemindLater - Callback for "Remind Later" button
 * @param {string} primaryColor - Primary brand color (default: "#0055aa")
 * @param {boolean} isUrgent - Whether the payment is urgent (affects button styling)
 * @param {string} serviceName - Name of the service to be scheduled
 * @param {string|number} amount - Amount to be paid
 */
const PaymentActionButtons = ({
  onPayNow,
  onSchedule,
  onRemindLater,
  primaryColor = "#0055aa",
  isUrgent = false,
  serviceName = "",
  amount = "",
}) => {
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [paymentDate, setPaymentDate] = useState("");

  const handleScheduleClick = () => {
    setShowScheduleModal(true);
  };

  const handleDateChange = (event, date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }

    if (date) {
      setSelectedDate(date);
      // Format date as YYYY-MM-DD
      const formattedDate = date.toISOString().split('T')[0];
      setPaymentDate(formattedDate);
    }
  };

  const handleCalendarPress = () => {
    setShowDatePicker(true);
  };

  const handleConfirmSchedule = () => {
    if (onSchedule) {
      onSchedule(paymentDate);
    }
    setShowScheduleModal(false);
    setPaymentDate("");
    setSelectedDate(new Date());
  };

  const handleCancelSchedule = () => {
    setShowScheduleModal(false);
    setPaymentDate("");
    setSelectedDate(new Date());
    setShowDatePicker(false);
  };
  return (
    <View
      className=" rounded-1xl  p-5 mx-4 mb-9 shadow-sm"
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
        {/* Schedule Payment */}
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
            جدولة
          </Text>
        </TouchableOpacity>

        {/* Remind Later */}
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
            {/* Handle Bar */}
            <View className="items-center py-3">
              <View className="w-12 h-1 bg-gray-300 rounded-full" />
            </View>

            {/* Title */}
            <Text className="text-gray-800 text-xl font-bold text-center mb-6">
              جدولة المدفوعات
            </Text>

            {/* Service Name */}
            <View className="flex-row justify-between items-center mb-4 py-3 px-4 bg-gray-50 rounded-xl" style={{direction: "ltr"}}>
              <View className="flex-1 items-center">
                <Text className="text-gray-800 text-base font-bold">{serviceName}</Text>
              </View>
              <Text className="text-gray-700 text-sm font-semibold">الخدمة</Text>
            </View>

            {/* Amount */}
            <View className="flex-row items-center justify-between mb-4 py-3 px-4 bg-gray-50 rounded-xl" style={{direction: "ltr"}}>
              <View className="flex-1 items-center">
                <Text className="text-gray-800 text-base font-bold">{amount}</Text>
              </View>
              <Text className="text-gray-700 text-sm font-semibold">المبلغ</Text>
            </View>

            {/* Payment Date */}
            <TouchableOpacity
              onPress={handleCalendarPress}
              className="flex-row items-center justify-between mb-6 py-3 px-4 bg-gray-50 rounded-xl"
              style={{direction: "ltr"}}
            >
              <View className="flex-row items-center">
                <Feather name="calendar" size={20} color="#0055aa" style={{ marginLeft: 8 }} />
                <Text className="text-gray-800 text-base font-bold">
                  {paymentDate}
                </Text>
              </View>
              <Text className="text-gray-700 text-sm font-semibold">تاريخ الدفع</Text>
            </TouchableOpacity>

            {/* Date Picker */}
            {showDatePicker && (
              <DateTimePicker
                value={selectedDate}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={handleDateChange}
                minimumDate={new Date()}
              />
            )}

            {/* iOS Date Picker Done Button */}
            {showDatePicker && Platform.OS === 'ios' && (
              <TouchableOpacity
                onPress={() => setShowDatePicker(false)}
                className="bg-gray-100 rounded-xl py-2 mb-4"
              >
                <Text className="text-center text-gray-700 font-semibold">تم</Text>
              </TouchableOpacity>
            )}

            {/* Confirm Button */}
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

            {/* Back Button */}
            <TouchableOpacity
              onPress={handleCancelSchedule}
              className="py-3"
            >
              <Text className="text-gray-600 text-center text-base">رجوع</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default PaymentActionButtons;
