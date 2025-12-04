import { useState, useRef, useEffect } from "react";
import { View, TextInput } from "react-native";

const OTPInput = ({
  length = 4,
  onComplete,
  onChangeOtp,
  primaryColor = "#0055aa",
  autoFocus = true,
}) => {
  const [otp, setOtp] = useState(Array(length).fill(""));
  const inputRefs = useRef([]);

  // Initialize refs array
  useEffect(() => {
    inputRefs.current = inputRefs.current.slice(0, length);
  }, [length]);

  // Auto-focus first input on mount
  useEffect(() => {
    if (autoFocus) {
      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 100);
    }
  }, [autoFocus]);

  // Check if OTP is complete
  useEffect(() => {
    const isComplete = otp.every((digit) => digit !== "");
    if (isComplete && onComplete) {
      onComplete(otp.join(""));
    }
    if (onChangeOtp) {
      onChangeOtp(otp.join(""));
    }
  }, [otp, onComplete, onChangeOtp]);

  const handleOtpChange = (index, value) => {
    // Only allow numbers
    if (value && !/^\d$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (index, key) => {
    // Handle backspace
    if (key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  return (
    <View
      className="flex-row justify-center"
      style={{ gap: 12, direction: "ltr" }}
    >
      {otp.map((digit, index) => (
        <TextInput
          key={index}
          ref={(ref) => (inputRefs.current[index] = ref)}
          className="w-16 h-16 text-center text-2xl font-bold rounded-xl border-2"
          style={{
            borderColor: digit ? primaryColor : "#d1d5db",
            color: primaryColor,
          }}
          value={digit}
          onChangeText={(value) => handleOtpChange(index, value)}
          onKeyPress={({ nativeEvent: { key } }) =>
            handleKeyPress(index, key)
          }
          keyboardType="number-pad"
          maxLength={1}
          selectTextOnFocus
        />
      ))}
    </View>
  );
};

export default OTPInput;
