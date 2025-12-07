import React, { useState } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { Feather } from "@expo/vector-icons";

const MonthPeriodPicker = ({ visible, onClose, onSelect, initialStartMonth, initialEndMonth }) => {
  const monthNames = [
    "يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو",
    "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"
  ];

  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth();
  const years = Array.from({ length: 7 }, (_, i) => currentYear - 5 + i).reverse();

  const [startMonth, setStartMonth] = useState(initialStartMonth !== undefined ? initialStartMonth : currentMonth - 1);
  const [startYear, setStartYear] = useState(currentYear);
  const [endMonth, setEndMonth] = useState(initialEndMonth !== undefined ? initialEndMonth : currentMonth);
  const [endYear, setEndYear] = useState(currentYear);
  const [selectingStart, setSelectingStart] = useState(true);
  const [selectedYear, setSelectedYear] = useState(currentYear);

  const handleMonthSelect = (monthIndex) => {
    if (selectingStart) {
      setStartMonth(monthIndex);
      setStartYear(selectedYear);
      setSelectingStart(false);
    } else {
      setEndMonth(monthIndex);
      setEndYear(selectedYear);
    }
  };

  const handleConfirm = () => {
    onSelect({
      startMonth,
      startYear,
      endMonth,
      endYear,
      startMonthName: monthNames[startMonth],
      endMonthName: monthNames[endMonth],
    });
    onClose();
  };

  const isMonthSelected = (monthIndex) => {
    if (selectingStart) {
      return startMonth === monthIndex && startYear === selectedYear;
    } else {
      return endMonth === monthIndex && endYear === selectedYear;
    }
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-end bg-black/50">
        <View className="bg-white rounded-t-3xl" style={{ maxHeight: "85%" }}>
          <View className="flex-row items-center justify-between px-6 py-4 border-b border-gray-200">
            <TouchableOpacity onPress={onClose}>
              <Feather name="x" size={24} color="#6b7280" />
            </TouchableOpacity>
            <Text className="text-lg font-bold text-gray-900">
              اختر الفترة الزمنية
            </Text>
            <View style={{ width: 24 }} />
          </View>

          <View className="px-6 py-4 bg-blue-50">
            <View className="flex-row items-center justify-between">
              <TouchableOpacity
                className="flex-1 py-2"
                onPress={() => {
                  setSelectingStart(true);
                  setSelectedYear(startYear);
                }}
              >
                <Text className="text-xs text-gray-500 text-right mb-1">من</Text>
                <Text className={`text-base font-semibold text-right ${selectingStart ? 'text-blue-600' : 'text-gray-900'}`}>
                  {monthNames[startMonth]} {startYear}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="flex-1 py-2"
                onPress={() => {
                  setSelectingStart(false);
                  setSelectedYear(endYear);
                }}
              >
                <Text className="text-xs text-gray-500 text-right mb-1">إلى</Text>
                <Text className={`text-base font-semibold text-right ${!selectingStart ? 'text-blue-600' : 'text-gray-900'}`}>
                  {monthNames[endMonth]} {endYear}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View className="flex-1 flex-row" style={{ height: 350 }}>
              <ScrollView className="w-1/3 bg-gray-50 border-r border-gray-200" showsVerticalScrollIndicator={false}>
                <View className="py-4">
                  {years.map((year) => (
                    <TouchableOpacity
                      key={year}
                      onPress={() => setSelectedYear(year)}
                      className="py-3 px-6"
                    >
                      <Text
                        className={`text-center text-base ${
                          selectedYear === year
                            ? "text-gray-900 font-bold"
                            : "text-gray-400 font-normal"
                        }`}
                      >
                        {year}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>

              <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false}>
                <View className="py-4">
                  {/* Display months in a 3x4 grid */}
                  {[0, 1, 2, 3].map((rowIndex) => (
                    <View key={rowIndex} className="flex-row justify-between mb-3">
                      {[0, 1, 2].map((colIndex) => {
                        const monthIndex = rowIndex * 3 + colIndex;
                        const isSelected = isMonthSelected(monthIndex);

                        return (
                          <TouchableOpacity
                            key={monthIndex}
                            onPress={() => handleMonthSelect(monthIndex)}
                            className={`rounded-xl py-3 px-2 ${
                              isSelected ? "bg-[#0055aa]" : "bg-gray-50"
                            }`}
                            style={{ width: '31%' }}
                          >
                            <Text
                              className={`text-center text-sm ${
                                isSelected
                                  ? "text-white font-bold"
                                  : "text-gray-600 font-normal"
                              }`}
                            >
                              {monthNames[monthIndex]}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  ))}
                </View>
              </ScrollView>
            </View>

          <View className="px-6 py-4 border-t border-gray-200">
            <TouchableOpacity
              onPress={handleConfirm}
              className="bg-[#0055aa] py-4 rounded-xl"
            >
              <Text className="text-white text-center font-semibold text-base">
                تأكيد
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default MonthPeriodPicker;
