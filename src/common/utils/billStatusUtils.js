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
    "قادم": "#6B7280",       // Gray for upcoming
    "مدفوع": "#10B981",      // Green for paid
    "الكل": "#6B7280",       // Gray for all
  };
  return colorMap[arabicStatus] || "#6B7280";
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
