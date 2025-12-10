/**
 * Financial Reports Service
 *
 * Provides financial reports generation based on transactions and bills
 * Uses existing Firebase configuration from firebaseConfig.js
 */

import { ref, get, query, orderByChild } from "firebase/database";
import { getWalletTransactions } from "./transactionService";
import GOVERNMENT_SERVICES_DATA from "./firebase/governmentServicesData";

// ============================================================================
// DATE UTILITIES
// ============================================================================

/**
 * Get start and end of month
 * @param {Date} date - Date object
 * @returns {Object} { start, end } timestamps
 */
export const getMonthRange = (date = new Date()) => {
  const start = new Date(date.getFullYear(), date.getMonth(), 1).getTime();
  const end = new Date(
    date.getFullYear(),
    date.getMonth() + 1,
    0,
    23,
    59,
    59,
    999
  ).getTime();
  return { start, end };
};

/**
 * Get start and end of quarter
 * @param {Date} date - Date object
 * @returns {Object} { start, end } timestamps
 */
export const getQuarterRange = (date = new Date()) => {
  const quarter = Math.floor(date.getMonth() / 3);
  const start = new Date(date.getFullYear(), quarter * 3, 1).getTime();
  const end = new Date(
    date.getFullYear(),
    quarter * 3 + 3,
    0,
    23,
    59,
    59,
    999
  ).getTime();
  return { start, end };
};

/**
 * Get start and end of year
 * @param {Date} date - Date object
 * @returns {Object} { start, end } timestamps
 */
export const getYearRange = (date = new Date()) => {
  const start = new Date(date.getFullYear(), 0, 1).getTime();
  const end = new Date(date.getFullYear(), 11, 31, 23, 59, 59, 999).getTime();
  return { start, end };
};

/**
 * Get quick date ranges (7d, 30d, 90d)
 * @param {string} range - Range type ('7d', '30d', '90d')
 * @returns {Object} { start, end } timestamps
 */
export const getQuickRange = (range) => {
  const end = Date.now();
  const daysMap = {
    "7d": 7,
    "30d": 30,
    "90d": 90,
  };
  const days = daysMap[range] || 30;
  const start = end - days * 24 * 60 * 60 * 1000;
  return { start, end };
};

/**
 * Format date range label in Arabic
 * @param {number} start - Start timestamp
 * @param {number} end - End timestamp
 * @returns {string} Formatted label
 */
export const formatDateRangeLabel = (start, end) => {
  const startDate = new Date(start);
  const endDate = new Date(end);

  const startStr = startDate.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const endStr = endDate.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return `${startStr} - ${endStr}`;
};

/**
 * Get month name in Arabic
 * @param {number} monthIndex - Month index (0-11)
 * @returns {string} Month name in Arabic
 */
export const getArabicMonthName = (monthIndex) => {
  const months = [
    "يناير",
    "فبراير",
    "مارس",
    "أبريل",
    "مايو",
    "يونيو",
    "يوليو",
    "أغسطس",
    "سبتمبر",
    "أكتوبر",
    "نوفمبر",
    "ديسمبر",
  ];
  return months[monthIndex];
};

/**
 * Get quarter name in Arabic
 * @param {number} quarterIndex - Quarter index (0-3)
 * @returns {string} Quarter name in Arabic
 */
export const getArabicQuarterName = (quarterIndex) => {
  const quarters = [
    "الربع الأول",
    "الربع الثاني",
    "الربع الثالث",
    "الربع الرابع",
  ];
  return quarters[quarterIndex];
};

// ============================================================================
// REPORT GENERATION
// ============================================================================

/**
 * Generate monthly reports for all months with transactions
 * @param {string} walletId - Wallet ID
 * @returns {Promise<Object>} Array of monthly reports
 */
export const generateMonthlyReports = async (walletId) => {
  try {
    // Get all transactions
    const result = await getWalletTransactions(walletId, { limit: 10000 });

    if (!result.success || !result.data.length) {
      return { success: true, data: [] };
    }

    const transactions = result.data;

    // Group transactions by month
    const monthlyGroups = {};

    transactions.forEach((txn) => {
      const date = new Date(txn.timestamp);
      const monthKey = `${date.getFullYear()}-${String(
        date.getMonth() + 1
      ).padStart(2, "0")}`;

      if (!monthlyGroups[monthKey]) {
        monthlyGroups[monthKey] = {
          year: date.getFullYear(),
          month: date.getMonth(),
          transactions: [],
        };
      }

      monthlyGroups[monthKey].transactions.push(txn);
    });

    // Generate reports for each month
    const reports = Object.keys(monthlyGroups).map((monthKey) => {
      const group = monthlyGroups[monthKey];
      const { start, end } = getMonthRange(new Date(group.year, group.month));

      // Calculate totals
      let totalAmount = 0;
      let totalIncome = 0;
      let totalExpense = 0;
      let operationsCount = group.transactions.length;

      group.transactions.forEach((txn) => {
        totalAmount += txn.amount;
        if (txn.amount > 0) {
          totalIncome += txn.amount;
        } else {
          totalExpense += Math.abs(txn.amount);
        }
      });

      return {
        id: `monthly_${monthKey}`,
        type: "monthly",
        title: `تقرير ${getArabicMonthName(group.month)} ${group.year}`,
        periodLabel: `${getArabicMonthName(group.month)} ${group.year}`,
        fromDate: start,
        toDate: end,
        operationsCount,
        totalAmount: parseFloat(totalAmount.toFixed(2)),
        totalIncome: parseFloat(totalIncome.toFixed(2)),
        totalExpense: parseFloat(totalExpense.toFixed(2)),
        fileSize: Math.floor(245 + Math.random() * 100), // Mock KB size
        year: group.year,
        month: group.month,
      };
    });

    // Sort by date descending (newest first)
    reports.sort((a, b) => b.fromDate - a.fromDate);

    return { success: true, data: reports };
  } catch (error) {
    console.error("Error generating monthly reports:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Generate quarterly reports
 * @param {string} walletId - Wallet ID
 * @returns {Promise<Object>} Array of quarterly reports
 */
export const generateQuarterlyReports = async (walletId) => {
  try {
    const result = await getWalletTransactions(walletId, { limit: 10000 });

    if (!result.success || !result.data.length) {
      return { success: true, data: [] };
    }

    const transactions = result.data;
    const quarterlyGroups = {};

    transactions.forEach((txn) => {
      const date = new Date(txn.timestamp);
      const quarter = Math.floor(date.getMonth() / 3);
      const quarterKey = `${date.getFullYear()}-Q${quarter + 1}`;

      if (!quarterlyGroups[quarterKey]) {
        quarterlyGroups[quarterKey] = {
          year: date.getFullYear(),
          quarter,
          transactions: [],
        };
      }

      quarterlyGroups[quarterKey].transactions.push(txn);
    });

    const reports = Object.keys(quarterlyGroups).map((quarterKey) => {
      const group = quarterlyGroups[quarterKey];
      const { start, end } = getQuarterRange(
        new Date(group.year, group.quarter * 3)
      );

      let totalAmount = 0;
      let totalIncome = 0;
      let totalExpense = 0;
      let operationsCount = group.transactions.length;

      group.transactions.forEach((txn) => {
        totalAmount += txn.amount;
        if (txn.amount > 0) {
          totalIncome += txn.amount;
        } else {
          totalExpense += Math.abs(txn.amount);
        }
      });

      return {
        id: `quarterly_${quarterKey}`,
        type: "quarterly",
        title: `تقرير ${getArabicQuarterName(group.quarter)} ${group.year}`,
        periodLabel: `${getArabicQuarterName(group.quarter)} ${group.year}`,
        fromDate: start,
        toDate: end,
        operationsCount,
        totalAmount: parseFloat(totalAmount.toFixed(2)),
        totalIncome: parseFloat(totalIncome.toFixed(2)),
        totalExpense: parseFloat(totalExpense.toFixed(2)),
        fileSize: Math.floor(245 + Math.random() * 100),
        year: group.year,
        quarter: group.quarter,
      };
    });

    reports.sort((a, b) => b.fromDate - a.fromDate);
    return { success: true, data: reports };
  } catch (error) {
    console.error("Error generating quarterly reports:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Generate yearly reports
 * @param {string} walletId - Wallet ID
 * @returns {Promise<Object>} Array of yearly reports
 */
export const generateYearlyReports = async (walletId) => {
  try {
    const result = await getWalletTransactions(walletId, { limit: 10000 });

    if (!result.success || !result.data.length) {
      return { success: true, data: [] };
    }

    const transactions = result.data;
    const yearlyGroups = {};

    transactions.forEach((txn) => {
      const date = new Date(txn.timestamp);
      const year = date.getFullYear();

      if (!yearlyGroups[year]) {
        yearlyGroups[year] = {
          year,
          transactions: [],
        };
      }

      yearlyGroups[year].transactions.push(txn);
    });

    const reports = Object.keys(yearlyGroups).map((year) => {
      const group = yearlyGroups[year];
      const { start, end } = getYearRange(new Date(group.year, 0));

      let totalAmount = 0;
      let totalIncome = 0;
      let totalExpense = 0;
      let operationsCount = group.transactions.length;

      group.transactions.forEach((txn) => {
        totalAmount += txn.amount;
        if (txn.amount > 0) {
          totalIncome += txn.amount;
        } else {
          totalExpense += Math.abs(txn.amount);
        }
      });

      return {
        id: `yearly_${year}`,
        type: "yearly",
        title: `تقرير السنة ${year}`,
        periodLabel: `${year}`,
        fromDate: start,
        toDate: end,
        operationsCount,
        totalAmount: parseFloat(totalAmount.toFixed(2)),
        totalIncome: parseFloat(totalIncome.toFixed(2)),
        totalExpense: parseFloat(totalExpense.toFixed(2)),
        fileSize: Math.floor(567 + Math.random() * 200),
        year: group.year,
      };
    });

    reports.sort((a, b) => b.year - a.year);
    return { success: true, data: reports };
  } catch (error) {
    console.error("Error generating yearly reports:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Generate custom date range report
 * @param {string} walletId - Wallet ID
 * @param {number} startDate - Start timestamp
 * @param {number} endDate - End timestamp
 * @param {string} customTitle - Optional custom title for the report
 * @returns {Promise<Object>} Custom report
 */
export const generateCustomReport = async (
  walletId,
  startDate,
  endDate,
  customTitle = null
) => {
  try {
    const result = await getWalletTransactions(walletId, {
      startDate,
      endDate,
      limit: 10000,
    });

    if (!result.success) {
      return result;
    }

    const transactions = result.data;

    let totalAmount = 0;
    let totalIncome = 0;
    let totalExpense = 0;

    transactions.forEach((txn) => {
      totalAmount += txn.amount;
      if (txn.amount > 0) {
        totalIncome += txn.amount;
      } else {
        totalExpense += Math.abs(txn.amount);
      }
    });

    const report = {
      id: `custom_${startDate}_${endDate}`,
      type: "custom",
      title: customTitle || `تقرير مخصص`,
      periodLabel: formatDateRangeLabel(startDate, endDate),
      fromDate: startDate,
      toDate: endDate,
      operationsCount: transactions.length,
      totalAmount: parseFloat(totalAmount.toFixed(2)),
      totalIncome: parseFloat(totalIncome.toFixed(2)),
      totalExpense: parseFloat(totalExpense.toFixed(2)),
      fileSize: Math.floor(245 + Math.random() * 100),
    };

    return { success: true, data: report };
  } catch (error) {
    console.error("Error generating custom report:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Generate report for a specific service
 * @param {string} walletId - Wallet ID
 * @param {string} serviceType - Service type (e.g., 'traffic', 'passports')
 * @returns {Promise<Object>} Service report
 */
export const generateServiceReport = async (walletId, serviceType) => {
  try {
    // Get all transactions
    const result = await getWalletTransactions(walletId, { limit: 10000 });

    if (!result.success) {
      return result;
    }

    const transactions = result.data;
    const serviceInfo = GOVERNMENT_SERVICES_DATA[serviceType];

    if (!serviceInfo) {
      return { success: false, error: "Service not found" };
    }

    // Filter transactions for this service
    // Check both serviceType and category
    const serviceTransactions = transactions.filter((txn) => {
      return (
        txn.serviceType === serviceType ||
        txn.category === serviceInfo.category ||
        (txn.serviceSubType && txn.serviceSubType.startsWith(serviceType))
      );
    });

    if (serviceTransactions.length === 0) {
      return { success: true, data: null };
    }

    let totalAmount = 0;
    let totalIncome = 0;
    let totalExpense = 0;

    serviceTransactions.forEach((txn) => {
      totalAmount += txn.amount;
      if (txn.amount > 0) {
        totalIncome += txn.amount;
      } else {
        totalExpense += Math.abs(txn.amount);
      }
    });

    // Get date range from transactions
    const timestamps = serviceTransactions.map((t) => t.timestamp);
    const fromDate = Math.min(...timestamps);
    const toDate = Math.max(...timestamps);

    const report = {
      id: `service_${serviceType}`,
      type: "service",
      serviceType,
      title: `تقرير ${serviceInfo.nameAr}`,
      periodLabel: "الكل", // Or calculate based on range
      fromDate,
      toDate,
      operationsCount: serviceTransactions.length,
      totalAmount: parseFloat(totalAmount.toFixed(2)),
      totalIncome: parseFloat(totalIncome.toFixed(2)),
      totalExpense: parseFloat(totalExpense.toFixed(2)),
      fileSize: Math.floor(150 + Math.random() * 100),
      serviceInfo: {
        nameAr: serviceInfo.nameAr,
        nameEn: serviceInfo.nameEn,
        icon: serviceInfo.icon,
        category: serviceInfo.category,
      },
    };

    return { success: true, data: report };
  } catch (error) {
    console.error(`Error generating report for ${serviceType}:`, error);
    return { success: false, error: error.message };
  }
};

/**
 * Generate reports for all available services
 * @param {string} walletId - Wallet ID
 * @returns {Promise<Object>} Array of service reports
 */
export const generateAllServiceReports = async (walletId) => {
  try {
    const services = Object.keys(GOVERNMENT_SERVICES_DATA);
    const reports = [];

    // We can optimize this by fetching transactions once and then filtering
    // But for now, let's reuse generateServiceReport or implement optimized logic here
    // Optimized approach: Fetch once
    const result = await getWalletTransactions(walletId, { limit: 10000 });

    if (!result.success) {
      return { success: true, data: [] };
    }

    const transactions = result.data;

    services.forEach((serviceType) => {
      const serviceInfo = GOVERNMENT_SERVICES_DATA[serviceType];
      
      const serviceTransactions = transactions.filter((txn) => {
        return (
          txn.serviceType === serviceType ||
          txn.category === serviceInfo.category ||
          (txn.serviceSubType && txn.serviceSubType.startsWith(serviceType))
        );
      });

      if (serviceTransactions.length > 0) {
        let totalAmount = 0;
        let totalIncome = 0;
        let totalExpense = 0;

        serviceTransactions.forEach((txn) => {
          totalAmount += txn.amount;
          if (txn.amount > 0) {
            totalIncome += txn.amount;
          } else {
            totalExpense += Math.abs(txn.amount);
          }
        });

        const timestamps = serviceTransactions.map((t) => t.timestamp);
        const fromDate = Math.min(...timestamps);
        const toDate = Math.max(...timestamps);

        reports.push({
          id: `service_${serviceType}`,
          type: "service",
          serviceType,
          title: `تقرير ${serviceInfo.nameAr}`,
          periodLabel: "الكل",
          fromDate,
          toDate,
          operationsCount: serviceTransactions.length,
          totalAmount: parseFloat(totalAmount.toFixed(2)),
          totalIncome: parseFloat(totalIncome.toFixed(2)),
          totalExpense: parseFloat(totalExpense.toFixed(2)),
          fileSize: Math.floor(150 + Math.random() * 100),
          serviceInfo: {
            nameAr: serviceInfo.nameAr,
            nameEn: serviceInfo.nameEn,
            icon: serviceInfo.icon,
            category: serviceInfo.category,
          },
        });
      }
    });

    return { success: true, data: reports };
  } catch (error) {
    console.error("Error generating all service reports:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Get labels for all service types
 * @returns {Object} Service type labels
 */
export const getServiceTypeLabels = () => {
  const labels = {};
  Object.keys(GOVERNMENT_SERVICES_DATA).forEach((key) => {
    labels[key] = GOVERNMENT_SERVICES_DATA[key].nameAr;
  });
  return labels;
};

/**
 * Get all reports (monthly, quarterly, yearly, services)
 * @param {string} walletId - Wallet ID
 * @returns {Promise<Object>} All reports combined
 */
export const getAllReports = async (walletId) => {
  try {
    const [monthlyResult, quarterlyResult, yearlyResult, servicesResult] = await Promise.all([
      generateMonthlyReports(walletId),
      generateQuarterlyReports(walletId),
      generateYearlyReports(walletId),
      generateAllServiceReports(walletId),
    ]);

    const allReports = [
      ...(monthlyResult.success ? monthlyResult.data : []),
      ...(quarterlyResult.success ? quarterlyResult.data : []),
      ...(yearlyResult.success ? yearlyResult.data : []),
      ...(servicesResult.success ? servicesResult.data : []),
    ];

    // Sort by date descending
    allReports.sort((a, b) => b.fromDate - a.fromDate);

    return { success: true, data: allReports };
  } catch (error) {
    console.error("Error getting all reports:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Filter reports by type and date range
 * @param {Array} reports - Array of reports
 * @param {Object} filters - Filter options { type, startDate, endDate }
 * @returns {Array} Filtered reports
 */
export const filterReports = (reports, filters = {}) => {
  const { type = "all", startDate = null, endDate = null } = filters;

  return reports.filter((report) => {
    // Filter by type
    if (type !== "all" && report.type !== type) {
      return false;
    }

    // Filter by date range
    if (startDate && report.toDate < startDate) {
      return false;
    }

    if (endDate && report.fromDate > endDate) {
      return false;
    }

    return true;
  });
};

/**
 * Get report type label in Arabic
 * @param {string} type - Report type
 * @returns {string} Arabic label
 */
export const getReportTypeLabel = (type) => {
  const labels = {
    all: "الكل",
    monthly: "شهري",
    quarterly: "ربع سنوي",
    yearly: "سنوي",
    custom: "مخصص",
    service: "خدمات",
  };
  return labels[type] || "الكل";
};
