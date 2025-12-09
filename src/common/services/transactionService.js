import {
  ref,
  set,
  get,
  update,
  push,
  query,
  orderByChild,
  limitToLast,
  startAt,
  endAt,
} from "firebase/database";
import { database } from "./firebase";
import { DB_PATHS } from "./firebase/databasePaths";

/**
 * Transaction Types:
 * - top_up: إيداع رصيد
 * - payment: دفع للخدمات الحكومية
 * - refund: استرجاع مبلغ
 * - transfer_in: تحويل وارد
 * - transfer_out: تحويل صادر
 * - withdrawal: سحب رصيد
 * - adjustment: تعديل إداري
 * - cashback: استرجاع نقدي
 * - bonus: مكافأة
 * - penalty: غرامة
 * - reversal: عكس معاملة
 * - fee: رسوم
 */

/**
 * Transaction Categories:
 * - deposit: إيداع
 * - government_service: خدمة حكومية
 * - refund: استرجاع
 * - transfer: تحويل
 * - withdrawal: سحب
 * - adjustment: تعديل
 * - reward: مكافأة
 * - penalty: غرامة
 * - reversal: عكس
 * - fee: رسوم
 */

/**
 * Transaction Status:
 * - completed: مكتملة
 * - pending: قيد الانتظار
 * - failed: فاشلة
 * - cancelled: ملغاة
 */

// Helper Functions

/**
 * Generates unique transaction ID
 * @returns {string} Transaction ID
 */
const generateTransactionId = () => {
  const year = new Date().getFullYear();
  const randomNumber = Math.floor(10000 + Math.random() * 90000);
  return `txn_${year}_${randomNumber}_${Date.now()}`;
};

/**
 * Generates unique reference number based on transaction type
 * @param {string} type - Transaction type
 * @returns {string} Reference number
 */
const generateReferenceNumber = (type) => {
  const year = new Date().getFullYear();
  const randomNumber = Math.floor(1000 + Math.random() * 9000);

  const prefixes = {
    top_up: "TOP",
    payment: "GOV",
    refund: "RFD",
    transfer_in: "TRF-IN",
    transfer_out: "TRF-OUT",
    withdrawal: "WTH",
    adjustment: "ADJ",
    cashback: "CSH",
    bonus: "BNS",
    penalty: "PEN",
    reversal: "REV",
    fee: "FEE",
  };

  const prefix = prefixes[type] || "TXN";
  return `${prefix}-${year}-${randomNumber}`;
};

// Database Functions

/**
 * Sanitizes an object by removing undefined and null values
 * @param {object} obj - Object to sanitize
 * @returns {object} Sanitized object
 */
const sanitizeObject = (obj) => {
  if (!obj || typeof obj !== 'object') return obj;

  const sanitized = {};
  Object.keys(obj).forEach((key) => {
    const value = obj[key];
    // Only include defined, non-null values
    if (value !== undefined && value !== null) {
      // Recursively sanitize nested objects
      if (typeof value === 'object' && !Array.isArray(value)) {
        sanitized[key] = sanitizeObject(value);
      } else {
        sanitized[key] = value;
      }
    }
  });
  return sanitized;
};

/**
 * Creates a new transaction in Firebase
 * @param {string} walletId - Wallet ID
 * @param {object} transactionData - Transaction data object
 * @returns {Promise<object>} Created transaction object
 */
export const createTransaction = async (walletId, transactionData) => {
  try {
    // Sanitize paymentDetails to remove undefined/null values
    if (transactionData.paymentDetails) {
      transactionData.paymentDetails = sanitizeObject(transactionData.paymentDetails);
    }

    const transactionId = generateTransactionId();
    const referenceNumber = generateReferenceNumber(transactionData.type);
    const timestamp = Date.now();

    const transaction = {
      id: transactionId,
      walletId,
      referenceNumber,
      timestamp,
      createdAt: timestamp,
      status: "completed",
      ...transactionData,
    };

    // Final sanitization of entire transaction object
    const sanitizedTransaction = sanitizeObject(transaction);

    // Write transaction to database
    const transactionRef = ref(
      database,
      DB_PATHS.TRANSACTION(walletId, transactionId)
    );
    await set(transactionRef, sanitizedTransaction);

    console.log("Transaction created successfully:", transactionId);
    return { success: true, data: sanitizedTransaction };
  } catch (error) {
    console.error("Error creating transaction:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Creates a top-up transaction
 * @param {string} walletId - Wallet ID
 * @param {string} userId - User ID
 * @param {number} amount - Amount to add
 * @param {number} balanceBefore - Balance before transaction
 * @param {string} paymentMethod - Payment method (mada, bank_transfer, etc.)
 * @param {object} paymentDetails - Payment details (lastFourDigits, transactionId)
 * @returns {Promise<object>} Transaction result
 */
export const createTopUpTransaction = async (
  walletId,
  userId,
  amount,
  balanceBefore,
  paymentMethod,
  paymentDetails = {}
) => {
  const transactionData = {
    userId,
    type: "top_up",
    category: "deposit",
    amount: parseFloat(amount.toFixed(2)),
    balanceBefore: parseFloat(balanceBefore.toFixed(2)),
    balanceAfter: parseFloat((balanceBefore + amount).toFixed(2)),
    paymentMethod,
    paymentDetails,
    descriptionAr: "إيداع رصيد",
    descriptionEn: "Top-up",
  };

  return await createTransaction(walletId, transactionData);
};

/**
 * Creates a payment transaction for government services
 * @param {string} walletId - Wallet ID
 * @param {string} userId - User ID
 * @param {number} amount - Amount to pay (will be negative)
 * @param {number} balanceBefore - Balance before transaction
 * @param {string} serviceType - Service type (driving_license_renewal, passport_renewal, etc.)
 * @param {string} descriptionAr - Arabic description
 * @param {string} descriptionEn - English description
 * @returns {Promise<object>} Transaction result
 */
export const createPaymentTransaction = async (
  walletId,
  userId,
  amount,
  balanceBefore,
  serviceType,
  descriptionAr,
  descriptionEn
) => {
  const transactionData = {
    userId,
    type: "payment",
    category: "government_service",
    serviceType,
    amount: -Math.abs(parseFloat(amount.toFixed(2))),
    balanceBefore: parseFloat(balanceBefore.toFixed(2)),
    balanceAfter: parseFloat((balanceBefore - Math.abs(amount)).toFixed(2)),
    descriptionAr,
    descriptionEn,
  };

  return await createTransaction(walletId, transactionData);
};

/**
 * Creates a refund transaction
 * @param {string} walletId - Wallet ID
 * @param {string} userId - User ID
 * @param {number} amount - Amount to refund
 * @param {number} balanceBefore - Balance before transaction
 * @param {string} relatedTransaction - Related transaction ID
 * @param {string} refundReason - Reason for refund
 * @param {string} descriptionAr - Arabic description
 * @param {string} descriptionEn - English description
 * @returns {Promise<object>} Transaction result
 */
export const createRefundTransaction = async (
  walletId,
  userId,
  amount,
  balanceBefore,
  relatedTransaction,
  refundReason,
  descriptionAr,
  descriptionEn
) => {
  const transactionData = {
    userId,
    type: "refund",
    category: "refund",
    relatedTransaction,
    amount: parseFloat(amount.toFixed(2)),
    balanceBefore: parseFloat(balanceBefore.toFixed(2)),
    balanceAfter: parseFloat((balanceBefore + amount).toFixed(2)),
    refundReason,
    descriptionAr,
    descriptionEn,
  };

  return await createTransaction(walletId, transactionData);
};

/**
 * Creates a transfer-in transaction (receiving money)
 * @param {string} walletId - Wallet ID
 * @param {string} userId - User ID
 * @param {number} amount - Amount received
 * @param {number} balanceBefore - Balance before transaction
 * @param {string} fromWallet - Sender's wallet ID
 * @param {string} fromUserId - Sender's user ID
 * @param {string} fromUserName - Sender's name
 * @param {string} transferNote - Transfer note
 * @returns {Promise<object>} Transaction result
 */
export const createTransferInTransaction = async (
  walletId,
  userId,
  amount,
  balanceBefore,
  fromWallet,
  fromUserId,
  fromUserName,
  transferNote = ""
) => {
  const transactionData = {
    userId,
    type: "transfer_in",
    category: "transfer",
    amount: parseFloat(amount.toFixed(2)),
    balanceBefore: parseFloat(balanceBefore.toFixed(2)),
    balanceAfter: parseFloat((balanceBefore + amount).toFixed(2)),
    fromWallet,
    fromUserId,
    fromUserName,
    transferNote,
    descriptionAr: `تحويل وارد من ${fromUserName}`,
    descriptionEn: `Transfer from ${fromUserName}`,
  };

  return await createTransaction(walletId, transactionData);
};

/**
 * Creates a transfer-out transaction (sending money)
 * @param {string} walletId - Wallet ID
 * @param {string} userId - User ID
 * @param {number} amount - Amount sent (will be negative)
 * @param {number} balanceBefore - Balance before transaction
 * @param {string} toWallet - Receiver's wallet ID
 * @param {string} toUserId - Receiver's user ID
 * @param {string} toUserName - Receiver's name
 * @param {string} transferNote - Transfer note
 * @returns {Promise<object>} Transaction result
 */
export const createTransferOutTransaction = async (
  walletId,
  userId,
  amount,
  balanceBefore,
  toWallet,
  toUserId,
  toUserName,
  transferNote = ""
) => {
  const transactionData = {
    userId,
    type: "transfer_out",
    category: "transfer",
    amount: -Math.abs(parseFloat(amount.toFixed(2))),
    balanceBefore: parseFloat(balanceBefore.toFixed(2)),
    balanceAfter: parseFloat((balanceBefore - Math.abs(amount)).toFixed(2)),
    toWallet,
    toUserId,
    toUserName,
    transferNote,
    descriptionAr: `تحويل صادر إلى ${toUserName}`,
    descriptionEn: `Transfer to ${toUserName}`,
  };

  return await createTransaction(walletId, transactionData);
};

/**
 * Creates a withdrawal transaction
 * @param {string} walletId - Wallet ID
 * @param {string} userId - User ID
 * @param {number} amount - Amount to withdraw (will be negative)
 * @param {number} balanceBefore - Balance before transaction
 * @param {object} withdrawalDetails - Bank details (bankName, accountNumber, accountHolderName)
 * @param {number} estimatedArrival - Estimated arrival timestamp
 * @returns {Promise<object>} Transaction result
 */
export const createWithdrawalTransaction = async (
  walletId,
  userId,
  amount,
  balanceBefore,
  withdrawalDetails,
  estimatedArrival = null
) => {
  const transactionData = {
    userId,
    type: "withdrawal",
    category: "withdrawal",
    amount: -Math.abs(parseFloat(amount.toFixed(2))),
    balanceBefore: parseFloat(balanceBefore.toFixed(2)),
    balanceAfter: parseFloat((balanceBefore - Math.abs(amount)).toFixed(2)),
    withdrawalDetails,
    estimatedArrival: estimatedArrival || Date.now() + 3 * 24 * 60 * 60 * 1000, // 3 days default
    descriptionAr: "سحب رصيد إلى الحساب البنكي",
    descriptionEn: "Withdrawal to Bank Account",
  };

  return await createTransaction(walletId, transactionData);
};

/**
 * Creates an adjustment transaction (admin correction)
 * @param {string} walletId - Wallet ID
 * @param {string} userId - User ID
 * @param {number} amount - Amount to adjust (positive or negative)
 * @param {number} balanceBefore - Balance before transaction
 * @param {string} adjustmentReason - Reason for adjustment
 * @param {string} adjustedBy - Admin user ID who made the adjustment
 * @returns {Promise<object>} Transaction result
 */
export const createAdjustmentTransaction = async (
  walletId,
  userId,
  amount,
  balanceBefore,
  adjustmentReason,
  adjustedBy
) => {
  const transactionData = {
    userId,
    type: "adjustment",
    category: "adjustment",
    amount: parseFloat(amount.toFixed(2)),
    balanceBefore: parseFloat(balanceBefore.toFixed(2)),
    balanceAfter: parseFloat((balanceBefore + amount).toFixed(2)),
    adjustmentReason,
    adjustedBy,
    descriptionAr: "تعديل إداري - " + adjustmentReason,
    descriptionEn: "Administrative Adjustment",
  };

  return await createTransaction(walletId, transactionData);
};

/**
 * Creates a cashback transaction
 * @param {string} walletId - Wallet ID
 * @param {string} userId - User ID
 * @param {number} amount - Cashback amount
 * @param {number} balanceBefore - Balance before transaction
 * @param {string} relatedTransaction - Related transaction ID
 * @param {number} cashbackRate - Cashback rate percentage
 * @returns {Promise<object>} Transaction result
 */
export const createCashbackTransaction = async (
  walletId,
  userId,
  amount,
  balanceBefore,
  relatedTransaction,
  cashbackRate
) => {
  const transactionData = {
    userId,
    type: "cashback",
    category: "reward",
    amount: parseFloat(amount.toFixed(2)),
    balanceBefore: parseFloat(balanceBefore.toFixed(2)),
    balanceAfter: parseFloat((balanceBefore + amount).toFixed(2)),
    relatedTransaction,
    cashbackRate,
    descriptionAr: `استرجاع نقدي ${cashbackRate}%`,
    descriptionEn: `${cashbackRate}% Cashback`,
  };

  return await createTransaction(walletId, transactionData);
};

/**
 * Creates a bonus transaction (referral, promotion, etc.)
 * @param {string} walletId - Wallet ID
 * @param {string} userId - User ID
 * @param {number} amount - Bonus amount
 * @param {number} balanceBefore - Balance before transaction
 * @param {string} bonusType - Bonus type (referral, promotion, etc.)
 * @param {string} bonusReason - Reason for bonus
 * @returns {Promise<object>} Transaction result
 */
export const createBonusTransaction = async (
  walletId,
  userId,
  amount,
  balanceBefore,
  bonusType,
  bonusReason
) => {
  const transactionData = {
    userId,
    type: "bonus",
    category: "reward",
    amount: parseFloat(amount.toFixed(2)),
    balanceBefore: parseFloat(balanceBefore.toFixed(2)),
    balanceAfter: parseFloat((balanceBefore + amount).toFixed(2)),
    bonusType,
    bonusReason,
    descriptionAr: bonusReason,
    descriptionEn: "Bonus",
  };

  return await createTransaction(walletId, transactionData);
};

/**
 * Creates a penalty transaction
 * @param {string} walletId - Wallet ID
 * @param {string} userId - User ID
 * @param {number} amount - Penalty amount (will be negative)
 * @param {number} balanceBefore - Balance before transaction
 * @param {string} penaltyReason - Reason for penalty
 * @returns {Promise<object>} Transaction result
 */
export const createPenaltyTransaction = async (
  walletId,
  userId,
  amount,
  balanceBefore,
  penaltyReason
) => {
  const transactionData = {
    userId,
    type: "penalty",
    category: "penalty",
    amount: -Math.abs(parseFloat(amount.toFixed(2))),
    balanceBefore: parseFloat(balanceBefore.toFixed(2)),
    balanceAfter: parseFloat((balanceBefore - Math.abs(amount)).toFixed(2)),
    penaltyReason,
    descriptionAr: "غرامة - " + penaltyReason,
    descriptionEn: "Penalty - " + penaltyReason,
  };

  return await createTransaction(walletId, transactionData);
};

/**
 * Creates a reversal transaction (undo a previous transaction)
 * @param {string} walletId - Wallet ID
 * @param {string} userId - User ID
 * @param {number} amount - Amount to reverse
 * @param {number} balanceBefore - Balance before transaction
 * @param {string} relatedTransaction - Transaction ID being reversed
 * @param {string} reversalReason - Reason for reversal
 * @returns {Promise<object>} Transaction result
 */
export const createReversalTransaction = async (
  walletId,
  userId,
  amount,
  balanceBefore,
  relatedTransaction,
  reversalReason
) => {
  const transactionData = {
    userId,
    type: "reversal",
    category: "reversal",
    relatedTransaction,
    amount: parseFloat(amount.toFixed(2)),
    balanceBefore: parseFloat(balanceBefore.toFixed(2)),
    balanceAfter: parseFloat((balanceBefore + amount).toFixed(2)),
    reversalReason,
    descriptionAr: "عكس معاملة - " + reversalReason,
    descriptionEn: "Transaction Reversal",
  };

  return await createTransaction(walletId, transactionData);
};

/**
 * Creates a fee transaction
 * @param {string} walletId - Wallet ID
 * @param {string} userId - User ID
 * @param {number} amount - Fee amount (will be negative)
 * @param {number} balanceBefore - Balance before transaction
 * @param {string} feeType - Fee type (withdrawal_fee, transfer_fee, etc.)
 * @param {string} relatedTransaction - Related transaction ID
 * @returns {Promise<object>} Transaction result
 */
export const createFeeTransaction = async (
  walletId,
  userId,
  amount,
  balanceBefore,
  feeType,
  relatedTransaction = null
) => {
  const feeDescriptions = {
    withdrawal_fee: { ar: "رسوم سحب رصيد", en: "Withdrawal Fee" },
    transfer_fee: { ar: "رسوم تحويل", en: "Transfer Fee" },
    service_fee: { ar: "رسوم خدمة", en: "Service Fee" },
  };

  const description = feeDescriptions[feeType] || { ar: "رسوم", en: "Fee" };

  const transactionData = {
    userId,
    type: "fee",
    category: "fee",
    amount: -Math.abs(parseFloat(amount.toFixed(2))),
    balanceBefore: parseFloat(balanceBefore.toFixed(2)),
    balanceAfter: parseFloat((balanceBefore - Math.abs(amount)).toFixed(2)),
    feeType,
    relatedTransaction,
    descriptionAr: description.ar,
    descriptionEn: description.en,
  };

  return await createTransaction(walletId, transactionData);
};

/**
 * Gets a single transaction by ID
 * @param {string} walletId - Wallet ID
 * @param {string} transactionId - Transaction ID
 * @returns {Promise<object>} Transaction data or null
 */
export const getTransactionById = async (walletId, transactionId) => {
  try {
    const transactionRef = ref(
      database,
      DB_PATHS.TRANSACTION(walletId, transactionId)
    );
    const snapshot = await get(transactionRef);

    if (snapshot.exists()) {
      return { success: true, data: snapshot.val() };
    }

    return { success: false, error: "Transaction not found" };
  } catch (error) {
    console.error("Error getting transaction:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Gets all transactions for a wallet
 * @param {string} walletId - Wallet ID
 * @param {object} options - Query options { limit, orderBy, startDate, endDate }
 * @returns {Promise<object>} Array of transactions
 */
export const getWalletTransactions = async (walletId, options = {}) => {
  try {
    const { limit = 50, startDate = null, endDate = null } = options;

    const transactionsRef = ref(
      database,
      DB_PATHS.WALLET_TRANSACTIONS(walletId)
    );
    let transactionsQuery = query(
      transactionsRef,
      orderByChild("timestamp"),
      limitToLast(limit)
    );

    const snapshot = await get(transactionsQuery);

    if (snapshot.exists()) {
      const transactions = [];
      snapshot.forEach((child) => {
        const transaction = child.val();

        // Apply date filters if provided
        if (startDate && transaction.timestamp < startDate) return;
        if (endDate && transaction.timestamp > endDate) return;

        transactions.push(transaction);
      });

      // Sort by timestamp descending (newest first)
      transactions.sort((a, b) => b.timestamp - a.timestamp);

      return { success: true, data: transactions };
    }

    return { success: true, data: [] };
  } catch (error) {
    console.error("Error getting wallet transactions:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Gets transactions filtered by type
 * @param {string} walletId - Wallet ID
 * @param {string} type - Transaction type
 * @param {number} limit - Maximum number of transactions
 * @returns {Promise<object>} Array of transactions
 */
export const getTransactionsByType = async (walletId, type, limit = 50) => {
  try {
    const result = await getWalletTransactions(walletId, { limit: 500 });

    if (result.success) {
      const filteredTransactions = result.data
        .filter((txn) => txn.type === type)
        .slice(0, limit);

      return { success: true, data: filteredTransactions };
    }

    return result;
  } catch (error) {
    console.error("Error getting transactions by type:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Gets transactions filtered by category
 * @param {string} walletId - Wallet ID
 * @param {string} category - Transaction category
 * @param {number} limit - Maximum number of transactions
 * @returns {Promise<object>} Array of transactions
 */
export const getTransactionsByCategory = async (
  walletId,
  category,
  limit = 50
) => {
  try {
    const result = await getWalletTransactions(walletId, { limit: 500 });

    if (result.success) {
      const filteredTransactions = result.data
        .filter((txn) => txn.category === category)
        .slice(0, limit);

      return { success: true, data: filteredTransactions };
    }

    return result;
  } catch (error) {
    console.error("Error getting transactions by category:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Gets transactions filtered by status
 * @param {string} walletId - Wallet ID
 * @param {string} status - Transaction status
 * @param {number} limit - Maximum number of transactions
 * @returns {Promise<object>} Array of transactions
 */
export const getTransactionsByStatus = async (walletId, status, limit = 50) => {
  try {
    const result = await getWalletTransactions(walletId, { limit: 500 });

    if (result.success) {
      const filteredTransactions = result.data
        .filter((txn) => txn.status === status)
        .slice(0, limit);

      return { success: true, data: filteredTransactions };
    }

    return result;
  } catch (error) {
    console.error("Error getting transactions by status:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Gets transactions within a date range
 * @param {string} walletId - Wallet ID
 * @param {number} startDate - Start timestamp
 * @param {number} endDate - End timestamp
 * @returns {Promise<object>} Array of transactions
 */
export const getTransactionsByDateRange = async (
  walletId,
  startDate,
  endDate
) => {
  try {
    return await getWalletTransactions(walletId, {
      startDate,
      endDate,
      limit: 1000,
    });
  } catch (error) {
    console.error("Error getting transactions by date range:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Updates transaction status
 * @param {string} walletId - Wallet ID
 * @param {string} transactionId - Transaction ID
 * @param {string} status - New status
 * @param {string} failureReason - Optional failure reason if status is 'failed'
 * @returns {Promise<object>} Update result
 */
export const updateTransactionStatus = async (
  walletId,
  transactionId,
  status,
  failureReason = null
) => {
  try {
    const transactionRef = ref(
      database,
      DB_PATHS.TRANSACTION(walletId, transactionId)
    );

    const updates = {
      status,
      updatedAt: Date.now(),
    };

    if (failureReason) {
      updates.failureReason = failureReason;
    }

    await update(transactionRef, updates);

    console.log("Transaction status updated successfully:", transactionId);
    return { success: true, data: { transactionId, status } };
  } catch (error) {
    console.error("Error updating transaction status:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Gets transaction statistics for a wallet
 * @param {string} walletId - Wallet ID
 * @param {object} options - Options { startDate, endDate }
 * @returns {Promise<object>} Transaction statistics
 */
export const getTransactionStats = async (walletId, options = {}) => {
  try {
    const { startDate = null, endDate = null } = options;
    const result = await getWalletTransactions(walletId, {
      limit: 1000,
      startDate,
      endDate,
    });

    if (!result.success) {
      return result;
    }

    const transactions = result.data;

    const stats = {
      totalTransactions: transactions.length,
      totalIncome: 0,
      totalExpense: 0,
      byType: {},
      byCategory: {},
      byStatus: {
        completed: 0,
        pending: 0,
        failed: 0,
        cancelled: 0,
      },
    };

    transactions.forEach((txn) => {
      // Calculate income and expense
      if (txn.amount > 0) {
        stats.totalIncome += txn.amount;
      } else {
        stats.totalExpense += Math.abs(txn.amount);
      }

      // Count by type
      stats.byType[txn.type] = (stats.byType[txn.type] || 0) + 1;

      // Count by category
      stats.byCategory[txn.category] =
        (stats.byCategory[txn.category] || 0) + 1;

      // Count by status
      stats.byStatus[txn.status] = (stats.byStatus[txn.status] || 0) + 1;
    });

    // Round to 2 decimal places
    stats.totalIncome = parseFloat(stats.totalIncome.toFixed(2));
    stats.totalExpense = parseFloat(stats.totalExpense.toFixed(2));
    stats.netAmount = parseFloat(
      (stats.totalIncome - stats.totalExpense).toFixed(2)
    );

    return { success: true, data: stats };
  } catch (error) {
    console.error("Error getting transaction stats:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Searches transactions by description or reference number
 * @param {string} walletId - Wallet ID
 * @param {string} searchTerm - Search term
 * @param {number} limit - Maximum number of results
 * @returns {Promise<object>} Array of matching transactions
 */
export const searchTransactions = async (walletId, searchTerm, limit = 50) => {
  try {
    const result = await getWalletTransactions(walletId, { limit: 500 });

    if (!result.success) {
      return result;
    }

    const searchLower = searchTerm.toLowerCase();
    const filteredTransactions = result.data
      .filter(
        (txn) =>
          txn.descriptionAr?.toLowerCase().includes(searchLower) ||
          txn.descriptionEn?.toLowerCase().includes(searchLower) ||
          txn.referenceNumber?.toLowerCase().includes(searchLower)
      )
      .slice(0, limit);

    return { success: true, data: filteredTransactions };
  } catch (error) {
    console.error("Error searching transactions:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Gets total payments for the current month
 * @param {string} walletId - Wallet ID
 * @returns {Promise<object>} Total payments amount
 */
export const getMonthlyTotalPayments = async (walletId) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999).getTime();

    const result = await getTransactionsByDateRange(walletId, startOfMonth, endOfMonth);

    if (!result.success) {
      return result;
    }

    const transactions = result.data;
    let totalPayments = 0;

    // Transaction types that are considered payments (money out)
    const paymentTypes = [
      "payment",
      "transfer_out",
      "withdrawal",
      "fee",
      "penalty"
    ];

    transactions.forEach((txn) => {
      if (paymentTypes.includes(txn.type) && txn.amount < 0) {
        totalPayments += Math.abs(txn.amount);
      }
    });

    return { success: true, data: parseFloat(totalPayments.toFixed(2)) };
  } catch (error) {
    console.error("Error getting monthly total payments:", error);
    return { success: false, error: error.message };
  }
};
