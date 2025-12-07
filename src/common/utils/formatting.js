/**
 * Format amount with thousand separators and 2 decimal places
 * @param {string|number} value - The amount to format
 * @returns {string} Formatted amount string (e.g., "1,234.00")
 */
export const formatAmount = (value) => {
  if (!value) return "0.00";
  return parseFloat(value).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

/**
 * Format date in Gregorian calendar with Arabic locale
 * @param {number|Date} timestamp - The timestamp or Date object to format
 * @param {string} locale - The locale to use (default: "ar-SA" for Arabic)
 * @returns {string} Formatted date string (e.g., "٢٠٢٤/٠١/١٥" for ar-SA or "01/15/2024" for en-US)
 */
export const formatDate = (timestamp, locale = "en-US") => {
  if (!timestamp) return "غير محدد";
  const date = new Date(timestamp);
  return date.toLocaleDateString(locale, {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
};

/**
 * Format date in Gregorian calendar with long month name
 * @param {number|Date} timestamp - The timestamp or Date object to format
 * @param {string} locale - The locale to use (default: "ar-SA" for Arabic)
 * @returns {string} Formatted date string (e.g., "١٥ يناير ٢٠٢٤" for ar-SA or "January 15, 2024" for en-US)
 */
export const formatDateLong = (timestamp, locale = "en-US") => {
  if (!timestamp) return "غير محدد";
  const date = new Date(timestamp);
  return date.toLocaleDateString(locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

/**
 * Format time in 12-hour or 24-hour format
 * @param {number|Date} timestamp - The timestamp or Date object to format
 * @param {string} locale - The locale to use (default: "ar-SA" for Arabic)
 * @returns {string} Formatted time string (e.g., "٠٣:٣٠ م" for ar-SA or "03:30 PM" for en-US)
 */
export const formatTime = (timestamp, locale = "ar-SA") => {
  if (!timestamp) return "غير محدد";
  const date = new Date(timestamp);
  return date.toLocaleTimeString(locale, {
    hour: "2-digit",
    minute: "2-digit",
  });
};
