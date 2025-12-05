import { useState, useEffect, useRef, useCallback } from "react";

/**
 * Custom hook for managing OTP resend timer
 * @param {number} initialTime - Initial time in seconds (default: 60)
 * @returns {Object} - { timer, canResend, resetTimer }
 */
export const useResendTimer = (initialTime = 60) => {
  const [timer, setTimer] = useState(initialTime);
  const [canResend, setCanResend] = useState(false);
  const intervalRef = useRef(null);

  // Timer countdown
  useEffect(() => {
    // Clear any existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    if (timer > 0) {
      intervalRef.current = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            clearInterval(intervalRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      setCanResend(true);
    }

    // Cleanup on unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []); // Only run once on mount

  // Reset timer function
  const resetTimer = useCallback(() => {
    setTimer(initialTime);
    setCanResend(false);

    // Clear existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    // Start new countdown
    intervalRef.current = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          setCanResend(true);
          clearInterval(intervalRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [initialTime]);

  return { timer, canResend, resetTimer };
};
