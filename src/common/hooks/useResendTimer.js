import { useState, useEffect } from "react";

/**
 * Custom hook for managing OTP resend timer
 * @param {number} initialTime - Initial time in seconds (default: 60)
 * @returns {Object} - { timer, canResend, resetTimer }
 */
export const useResendTimer = (initialTime = 60) => {
  const [timer, setTimer] = useState(initialTime);
  const [canResend, setCanResend] = useState(false);

  // Timer countdown
  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    } else {
      setCanResend(true);
    }
  }, [timer]);

  // Reset timer function
  const resetTimer = () => {
    setTimer(initialTime);
    setCanResend(false);
  };

  return { timer, canResend, resetTimer };
};
