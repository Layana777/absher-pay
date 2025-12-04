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
