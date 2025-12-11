import React, { useState } from "react";
import { View } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";

/**
 * Single (Customer) Date Picker Wheels Component
 * Copied from common pattern for Single interface use only
 */
const DatePickerWheels = ({
  onDateChange,
  initialDate = new Date(),
  minimumDate,
}) => {
  const [selectedDate, setSelectedDate] = useState(initialDate);

  const handleChange = (event, date) => {
    if (date) {
      setSelectedDate(date);
      if (onDateChange) {
        onDateChange(date);
      }
    }
  };

  return (
    <View style={{ alignItems: 'center', justifyContent: 'center' }}>
      <DateTimePicker
        value={selectedDate}
        mode="date"
        display="spinner"
        onChange={handleChange}
        minimumDate={minimumDate || new Date()}
        textColor="#000000"
        locale="ar"
        style={{
          width: '100%',
          height: 180,
        }}
      />
    </View>
  );
};

export default DatePickerWheels;
