import React, { useState } from "react";
import { View, Text, TouchableOpacity, Modal } from "react-native";
import { Feather } from "@expo/vector-icons";
import DatePickerWheels from "../../../components/DatePickerWheels";
import { formatGregorianDate } from "../../../../common/utils/dateUtils";

const DateRangeSelector = ({
  startDate,
  endDate,
  onDateRangeChange,
  primaryColor = "#0055aa",
}) => {
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [tempStartDate, setTempStartDate] = useState(null);
  const [tempEndDate, setTempEndDate] = useState(null);

  // Format date for display
  const formatDate = (date) => {
    if (!date) return "اختر التاريخ";
    return formatGregorianDate(date);
  };

  // Open start date picker
  const openStartDatePicker = () => {
    setTempStartDate(startDate || Date.now());
    setShowStartDatePicker(true);
  };

  // Open end date picker
  const openEndDatePicker = () => {
    setTempEndDate(endDate || Date.now());
    setShowEndDatePicker(true);
  };

  // Handle start date change
  const handleStartDateChange = (date) => {
    setTempStartDate(date.getTime());
  };

  // Handle end date change
  const handleEndDateChange = (date) => {
    setTempEndDate(date.getTime());
  };

  // Confirm start date
  const confirmStartDate = () => {
    onDateRangeChange(tempStartDate, endDate);
    setShowStartDatePicker(false);
  };

  // Confirm end date
  const confirmEndDate = () => {
    onDateRangeChange(startDate, tempEndDate);
    setShowEndDatePicker(false);
  };

  // Cancel date picker
  const cancelDatePicker = () => {
    setShowStartDatePicker(false);
    setShowEndDatePicker(false);
    setTempStartDate(null);
    setTempEndDate(null);
  };

  // Clear date range
  const handleClear = () => {
    onDateRangeChange(null, null);
  };

  const hasDateRange = startDate && endDate;

  return (
    <View className="mb-4" style={{ direction: "rtl" }}>
      <View className="flex-row items-center justify-between mb-2">
        <Text className="text-base font-bold text-gray-900 text-right">
          فترة مخصصة
        </Text>
        {hasDateRange && (
          <TouchableOpacity
            onPress={handleClear}
            className="flex-row items-center"
          >
            <Feather name="x-circle" size={16} color="#EF4444" />
            <Text className="text-sm text-red-500 mr-1">مسح</Text>
          </TouchableOpacity>
        )}
      </View>

      <View className="flex-row gap-3">
        {/* Start Date */}
        <View className="flex-1">
          <Text className="text-xs text-gray-600 mb-1.5 text-left font-medium">
            من تاريخ
          </Text>
          <TouchableOpacity
            onPress={openStartDatePicker}
            className="bg-white border border-gray-200 rounded-xl p-3"
          >
            <View className="flex-row items-center">
              <Feather name="calendar" size={16} color={primaryColor} />
              <Text
                className={`text-sm mx-1 ${
                  startDate ? "text-gray-900" : "text-gray-400"
                }`}
              >
                {formatDate(startDate)}
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* End Date */}
        <View className="flex-1">
          <Text className="text-xs text-gray-600 mb-1.5 text-left font-medium">
            إلى تاريخ
          </Text>
          <TouchableOpacity
            onPress={openEndDatePicker}
            className="bg-white border border-gray-200 rounded-xl p-3"
          >
            <View className="flex-row items-center">
              <Feather name="calendar" size={16} color={primaryColor} />
              <Text
                className={`text-sm mx-1 ${
                  endDate ? "text-gray-900" : "text-gray-400"
                }`}
              >
                {formatDate(endDate)}
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {/* Validation Message */}
      {startDate && endDate && startDate > endDate && (
        <View className="flex-row items-center mt-2 bg-red-50 p-2 rounded-xl">
          <Feather name="alert-circle" size={16} color="#EF4444" />
          <Text className="text-xs text-red-600 mr-2">
            تاريخ البداية يجب أن يكون قبل تاريخ النهاية
          </Text>
        </View>
      )}

      {/* Start Date Picker Modal */}
      <Modal
        visible={showStartDatePicker}
        transparent={true}
        animationType="slide"
        onRequestClose={cancelDatePicker}
      >
        <View className="flex-1 justify-end bg-black/50">
          <View className="bg-white rounded-t-3xl">
            {/* Header */}
            <View className="flex-row items-center justify-between px-5 py-4 border-b border-gray-200">
              <TouchableOpacity onPress={cancelDatePicker}>
                <Text className="text-gray-500 text-base font-semibold">
                  إلغاء
                </Text>
              </TouchableOpacity>
              <Text className="text-gray-800 text-lg font-bold">من تاريخ</Text>
              <TouchableOpacity onPress={confirmStartDate}>
                <Text
                  className="text-base font-semibold"
                  style={{ color: primaryColor }}
                >
                  تأكيد
                </Text>
              </TouchableOpacity>
            </View>

            {/* Date Picker */}
            <View className="py-4">
              <DatePickerWheels
                onDateChange={handleStartDateChange}
                initialDate={
                  tempStartDate ? new Date(tempStartDate) : new Date()
                }
                minimumDate={new Date(2020, 0, 1)}
              />
            </View>
          </View>
        </View>
      </Modal>

      {/* End Date Picker Modal */}
      <Modal
        visible={showEndDatePicker}
        transparent={true}
        animationType="slide"
        onRequestClose={cancelDatePicker}
      >
        <View className="flex-1 justify-end bg-black/50">
          <View className="bg-white rounded-t-3xl">
            {/* Header */}
            <View className="flex-row items-center justify-between px-5 py-4 border-b border-gray-200">
              <TouchableOpacity onPress={cancelDatePicker}>
                <Text className="text-gray-500 text-base font-semibold">
                  إلغاء
                </Text>
              </TouchableOpacity>
              <Text className="text-gray-800 text-lg font-bold">إلى تاريخ</Text>
              <TouchableOpacity onPress={confirmEndDate}>
                <Text
                  className="text-base font-semibold"
                  style={{ color: primaryColor }}
                >
                  تأكيد
                </Text>
              </TouchableOpacity>
            </View>

            {/* Date Picker */}
            <View className="py-4">
              <DatePickerWheels
                onDateChange={handleEndDateChange}
                initialDate={tempEndDate ? new Date(tempEndDate) : new Date()}
                minimumDate={
                  startDate ? new Date(startDate) : new Date(2020, 0, 1)
                }
              />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default DateRangeSelector;
