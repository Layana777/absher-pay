import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  Platform,
} from "react-native";
import { Picker } from "@react-native-picker/picker";

const DatePickerModal = ({
  visible,
  onClose,
  onConfirm,
  initialDate = new Date(),
  minimumDate,
  maximumDate,
}) => {
  const arabicMonths = [
    "يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو",
    "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"
  ];

  const currentDate = new Date();
  const minDate = minimumDate || new Date(currentDate.getFullYear() - 1, 0, 1);
  const maxDate = maximumDate || new Date(currentDate.getFullYear() + 5, 11, 31);

  const [selectedMonth, setSelectedMonth] = useState(initialDate.getMonth());
  const [selectedDay, setSelectedDay] = useState(initialDate.getDate());
  const [selectedYear, setSelectedYear] = useState(initialDate.getFullYear());

  const getDaysInMonth = (month, year) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const daysInSelectedMonth = getDaysInMonth(selectedMonth, selectedYear);
  const days = Array.from({ length: daysInSelectedMonth }, (_, i) => i + 1);

  const years = Array.from(
    { length: maxDate.getFullYear() - minDate.getFullYear() + 1 },
    (_, i) => minDate.getFullYear() + i
  );

  // Adjust day if it exceeds the number of days in the selected month
  useEffect(() => {
    const maxDays = getDaysInMonth(selectedMonth, selectedYear);
    if (selectedDay > maxDays) {
      setSelectedDay(maxDays);
    }
  }, [selectedMonth, selectedYear]);

  const handleConfirm = () => {
    const selectedDate = new Date(selectedYear, selectedMonth, selectedDay);
    onConfirm(selectedDate);
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-end bg-black/50">
        <View className="bg-white rounded-t-3xl">
          {/* Header with Cancel and Confirm */}
          <View className="flex-row items-center justify-between px-5 py-4 border-b border-gray-200">
            <TouchableOpacity onPress={onClose}>
              <Text className="text-[#0055aa] text-base font-semibold">
                إلغاء
              </Text>
            </TouchableOpacity>
            <Text className="text-gray-800 text-lg font-bold">
              اختر التاريخ
            </Text>
            <TouchableOpacity onPress={handleConfirm}>
              <Text className="text-[#0055aa] text-base font-semibold">
                تأكيد
              </Text>
            </TouchableOpacity>
          </View>

          {/* Date Picker Wheels */}
          <View className="flex-row-reverse px-2 py-4" style={{ direction: "rtl" }}>
            {/* Month Picker */}
            <View className="flex-1">
              <Picker
                selectedValue={selectedMonth}
                onValueChange={(value) => setSelectedMonth(value)}
                style={{ height: 200 }}
                itemStyle={{ height: 200, fontSize: 18 }}
              >
                {arabicMonths.map((month, index) => (
                  <Picker.Item key={index} label={month} value={index} />
                ))}
              </Picker>
            </View>

            {/* Day Picker */}
            <View className="flex-1">
              <Picker
                selectedValue={selectedDay}
                onValueChange={(value) => setSelectedDay(value)}
                style={{ height: 200 }}
                itemStyle={{ height: 200, fontSize: 18 }}
              >
                {days.map((day) => (
                  <Picker.Item key={day} label={String(day)} value={day} />
                ))}
              </Picker>
            </View>

            {/* Year Picker */}
            <View className="flex-1">
              <Picker
                selectedValue={selectedYear}
                onValueChange={(value) => setSelectedYear(value)}
                style={{ height: 200 }}
                itemStyle={{ height: 200, fontSize: 18 }}
              >
                {years.map((year) => (
                  <Picker.Item key={year} label={String(year)} value={year} />
                ))}
              </Picker>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default DatePickerModal;
