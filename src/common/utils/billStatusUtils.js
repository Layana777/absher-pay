import { isBillOverdue } from "../services/billsService";

/**
 * Maps bill status to Arabic text
 * @param {Object} bill - Bill object with status field
 * @returns {string} Arabic status label
 */
export const getArabicStatus = (bill) => {
  if (bill.status === "paid") return "مدفوع";
  if (isBillOverdue(bill)) return "متأخر";
  if (bill.status === "upcoming") return "قادم";
  if (bill.status === "unpaid") return "غير مدفوع";
  return "الكل";
};

/**
 * Gets the color for a status badge
 * @param {string} arabicStatus - Arabic status label
 * @returns {string} Color hex code
 */
export const getStatusColor = (arabicStatus) => {
  const colorMap = {
    "متأخر": "#EF4444",      // Red for overdue
    "غير مدفوع": "#F59E0B",  // Orange for unpaid
    "قادم": "#3B82F6",       // Blue for upcoming
    "مدفوع": "#10B981",      // Green for paid
    "الكل": "#6B7280",       // Gray for all
  };
  return colorMap[arabicStatus] || "#6B7280";
};

/**
 * Gets the Tailwind background class for a status badge
 * @param {string} arabicStatus - Arabic status label
 * @returns {string} Tailwind background color class
 */
export const getStatusBgColor = (arabicStatus) => {
  const colorMap = {
    "متأخر": "bg-red-500",        // Red for overdue/delayed
    "غير مدفوع": "bg-orange-500",  // Orange for unpaid
    "قادم": "bg-blue-500",         // Blue for upcoming
    "مدفوع": "bg-green-500",       // Green for paid
    "الكل": "bg-gray-500",         // Gray for all
  };
  return colorMap[arabicStatus] || "bg-gray-500";
};

/**
 * Status labels in Arabic
 */
export const STATUS_LABELS = {
  PAID: "مدفوع",
  OVERDUE: "متأخر",
  UPCOMING: "قادم",
  UNPAID: "غير مدفوع",
  ALL: "الكل",
};
