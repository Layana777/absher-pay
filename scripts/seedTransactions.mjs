/**
 * Seed Wallet Transactions Script
 *
 * This script generates and populates test transactions in Firebase for specific wallets.
 * Transactions are distributed across the past year with realistic patterns.
 *
 * IMPORTANT: Only generates EXPENSE transactions (payment, transfer_out, withdrawal, fee, penalty)
 * This matches the transaction types used in getMonthlyTotalPayments and financial analysis.
 *
 * Usage:
 *   node scripts/seedTransactions.mjs --userId="YOUR_USER_ID" --walletId="YOUR_WALLET_ID"
 *   node scripts/seedTransactions.mjs --userId="abc123" --walletId="wallet_personal_1234567890" --count=50
 *   node scripts/seedTransactions.mjs --userId="abc123" --walletId="wallet_business_7001234567890" --types="payment,fee"
 *
 * Options:
 *   --userId          Firebase user ID (required)
 *   --walletId        Wallet ID (required)
 *   --count           Number of transactions to generate (default: 30)
 *   --types           Comma-separated transaction types (default: all expense types)
 *                     Available: payment,transfer_out,withdrawal,fee,penalty
 *   --months          Number of months back to generate data (default: 12)
 *   --startBalance    Starting wallet balance for calculations (default: 5000)
 *                     Ensure balance is high enough to cover all expenses!
 */ 

import { initializeApp } from "firebase/app";
import { getDatabase, ref, get, set } from "firebase/database";

// ============================================================================
// FIREBASE CONFIGURATION
// ============================================================================

const firebaseConfig = {
  apiKey: "AIzaSyCx0GXCgSaNJlrg1a_goaLHp58IuwviL3M",
  authDomain: "absher-pay.firebaseapp.com",
  databaseURL:
    "https://absher-pay-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "absher-pay",
  storageBucket: "absher-pay.firebasestorage.app",
  messagingSenderId: "523633067316",
  appId: "1:523633067316:web:862ec426fee4e8abb85161",
  measurementId: "G-NGTKK52CB7",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// ============================================================================
// COMMAND-LINE ARGUMENT PARSING
// ============================================================================

const parseArgs = () => {
  const args = process.argv.slice(2);
  const params = {};

  args.forEach((arg) => {
    const [key, value] = arg.split("=");
    if (key && value) {
      const cleanKey = key.replace("--", "");
      params[cleanKey] = value.replace(/['"]/g, ""); // Remove quotes
    }
  });

  return params;
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Validates required parameters
 */
const validateParams = (params) => {
  const errors = [];

  if (!params.userId) {
    errors.push("--userId is required");
  }

  if (!params.walletId) {
    errors.push("--walletId is required");
  }

  return errors;
};

/**
 * Fetch wallet data from Firebase
 */
const getWalletData = async (walletId) => {
  try {
    const walletRef = ref(database, `wallets/${walletId}`);
    const snapshot = await get(walletRef);

    if (!snapshot.exists()) {
      return null;
    }

    return snapshot.val();
  } catch (error) {
    console.error("❌ Error fetching wallet:", error);
    return null;
  }
};

/**
 * Fetch user's bills from Firebase
 */
const getUserBills = async (userId) => {
  try {
    const billsRef = ref(database, `governmentBills/${userId}`);
    const snapshot = await get(billsRef);

    if (!snapshot.exists()) {
      return [];
    }

    const bills = [];
    snapshot.forEach((child) => {
      bills.push(child.val());
    });

    return bills;
  } catch (error) {
    console.error("❌ Error fetching bills:", error);
    return [];
  }
};

/**
 * Generate transaction ID
 */
const generateTransactionId = () => {
  const year = new Date().getFullYear();
  const randomNumber = Math.floor(10000 + Math.random() * 90000);
  return `txn_${year}_${randomNumber}_${Date.now()}`;
};

/**
 * Generate reference number
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

/**
 * Generate random date in the past
 */
const generatePastDate = (monthsBack) => {
  const now = Date.now();
  const maxDaysBack = monthsBack * 30;
  const daysBack = Math.floor(Math.random() * maxDaysBack);
  return now - daysBack * 24 * 60 * 60 * 1000;
};

/**
 * Sanitize object by removing undefined/null values
 */
const sanitizeObject = (obj) => {
  if (!obj || typeof obj !== "object") return obj;

  const sanitized = {};
  Object.keys(obj).forEach((key) => {
    const value = obj[key];
    if (value !== undefined && value !== null) {
      if (typeof value === "object" && !Array.isArray(value)) {
        sanitized[key] = sanitizeObject(value);
      } else {
        sanitized[key] = value;
      }
    }
  });
  return sanitized;
};

/**
 * Generate random Saudi name
 */
const generateRandomName = () => {
  const firstNames = [
    "محمد",
    "أحمد",
    "عبدالله",
    "خالد",
    "سعود",
    "فهد",
    "عبدالعزيز",
    "فيصل",
    "سلطان",
    "ناصر",
  ];
  const lastNames = [
    "العتيبي",
    "الدوسري",
    "القحطاني",
    "الغامدي",
    "الشمري",
    "العنزي",
    "الحربي",
    "المطيري",
    "الزهراني",
    "السهلي",
  ];

  return `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${
    lastNames[Math.floor(Math.random() * lastNames.length)]
  }`;
};

// ============================================================================
// TRANSACTION GENERATORS
// ============================================================================

/**
 * Generate top-up transaction
 */
const generateTopUpTransaction = (
  userId,
  walletId,
  balanceBefore,
  timestamp
) => {
  const amounts = [100, 200, 500, 1000, 2000, 5000];
  const amount = amounts[Math.floor(Math.random() * amounts.length)];

  const paymentMethods = ["mada", "bank_transfer", "credit_card"];
  const paymentMethod =
    paymentMethods[Math.floor(Math.random() * paymentMethods.length)];

  const paymentDetails = {};
  if (paymentMethod === "mada" || paymentMethod === "credit_card") {
    paymentDetails.lastFourDigits = Math.floor(
      1000 + Math.random() * 9000
    ).toString();
    paymentDetails.cardType = paymentMethod === "mada" ? "mada" : "visa";
  }

  return {
    id: generateTransactionId(),
    walletId,
    userId,
    type: "top_up",
    category: "deposit",
    amount: parseFloat(amount.toFixed(2)),
    balanceBefore: parseFloat(balanceBefore.toFixed(2)),
    balanceAfter: parseFloat((balanceBefore + amount).toFixed(2)),
    paymentMethod,
    paymentDetails: sanitizeObject(paymentDetails),
    descriptionAr: "إيداع رصيد",
    descriptionEn: "Top-up",
    referenceNumber: generateReferenceNumber("top_up"),
    timestamp,
    createdAt: timestamp,
    status: "completed",
  };
};

/**
 * Generate payment transaction
 */
const generatePaymentTransaction = (
  userId,
  walletId,
  balanceBefore,
  timestamp,
  bill = null
) => {
  // If no bill provided, generate random payment data
  if (!bill) {
    const serviceTypes = ["passports", "traffic", "civil_affairs", "commerce"];
    const serviceType =
      serviceTypes[Math.floor(Math.random() * serviceTypes.length)];

    const serviceData = {
      passports: {
        ar: "تجديد جواز السفر",
        en: "Renew Passport",
        amount: 300,
        ministry: "MOI",
        ministryName: { ar: "وزارة الداخلية", en: "Ministry of Interior" },
      },
      traffic: {
        ar: "مخالفة مرورية",
        en: "Traffic Violation",
        amount: 500,
        ministry: "MOI",
        ministryName: { ar: "وزارة الداخلية", en: "Ministry of Interior" },
      },
      civil_affairs: {
        ar: "تجديد بطاقة الهوية",
        en: "Renew National ID",
        amount: 100,
        ministry: "MOI",
        ministryName: { ar: "وزارة الداخلية", en: "Ministry of Interior" },
      },
      commerce: {
        ar: "تجديد السجل التجاري",
        en: "Renew Commercial Registration",
        amount: 200,
        ministry: "MOC",
        ministryName: { ar: "وزارة التجارة", en: "Ministry of Commerce" },
      },
    };

    const service = serviceData[serviceType];
    const amount = service.amount;

    return {
      id: generateTransactionId(),
      walletId,
      userId,
      type: "payment",
      category: "government_service",
      serviceType,
      amount: -Math.abs(parseFloat(amount.toFixed(2))),
      balanceBefore: parseFloat(balanceBefore.toFixed(2)),
      balanceAfter: parseFloat((balanceBefore - amount).toFixed(2)),
      descriptionAr: `دفع ${service.ar}`,
      descriptionEn: `Payment for ${service.en}`,
      serviceName: { ar: service.ar, en: service.en },
      ministry: service.ministry,
      ministryName: service.ministryName,
      referenceNumber: generateReferenceNumber("payment"),
      timestamp,
      createdAt: timestamp,
      status: "completed",
    };
  }

  // Use bill data
  const amount = bill.penaltyInfo?.totalWithPenalty || bill.amount;

  return {
    id: generateTransactionId(),
    walletId,
    userId,
    type: "payment",
    category: "government_service",
    serviceType: bill.serviceType,
    serviceSubType: bill.serviceSubType,
    amount: -Math.abs(parseFloat(amount.toFixed(2))),
    balanceBefore: parseFloat(balanceBefore.toFixed(2)),
    balanceAfter: parseFloat((balanceBefore - amount).toFixed(2)),
    descriptionAr: `دفع ${bill.serviceName.ar}`,
    descriptionEn: `Payment for ${bill.serviceName.en}`,
    serviceName: bill.serviceName,
    ministry: bill.ministry,
    ministryName: bill.ministryName,
    linkedBillIds: [bill.id],
    penaltyInfo: bill.penaltyInfo || null,
    referenceNumber: generateReferenceNumber("payment"),
    timestamp,
    createdAt: timestamp,
    status: "completed",
  };
};

/**
 * Generate transfer-in transaction
 */
const generateTransferInTransaction = (
  userId,
  walletId,
  balanceBefore,
  timestamp
) => {
  const amounts = [50, 100, 200, 500, 1000];
  const amount = amounts[Math.floor(Math.random() * amounts.length)];
  const fromUserName = generateRandomName();
  const fromUserId = `user_${Math.floor(Math.random() * 10000)}`;
  const fromWallet = `wallet_${Math.floor(Math.random() * 10000)}`;

  return {
    id: generateTransactionId(),
    walletId,
    userId,
    type: "transfer_in",
    category: "transfer",
    amount: parseFloat(amount.toFixed(2)),
    balanceBefore: parseFloat(balanceBefore.toFixed(2)),
    balanceAfter: parseFloat((balanceBefore + amount).toFixed(2)),
    fromWallet,
    fromUserId,
    fromUserName,
    transferNote: "تحويل مبلغ",
    descriptionAr: `تحويل وارد من ${fromUserName}`,
    descriptionEn: `Transfer from ${fromUserName}`,
    referenceNumber: generateReferenceNumber("transfer_in"),
    timestamp,
    createdAt: timestamp,
    status: "completed",
  };
};

/**
 * Generate transfer-out transaction
 */
const generateTransferOutTransaction = (
  userId,
  walletId,
  balanceBefore,
  timestamp
) => {
  const amounts = [50, 100, 200, 500, 1000];
  const amount = amounts[Math.floor(Math.random() * amounts.length)];
  const toUserName = generateRandomName();
  const toUserId = `user_${Math.floor(Math.random() * 10000)}`;
  const toWallet = `wallet_${Math.floor(Math.random() * 10000)}`;

  return {
    id: generateTransactionId(),
    walletId,
    userId,
    type: "transfer_out",
    category: "transfer",
    amount: -Math.abs(parseFloat(amount.toFixed(2))),
    balanceBefore: parseFloat(balanceBefore.toFixed(2)),
    balanceAfter: parseFloat((balanceBefore - amount).toFixed(2)),
    toWallet,
    toUserId,
    toUserName,
    transferNote: "تحويل مبلغ",
    descriptionAr: `تحويل صادر إلى ${toUserName}`,
    descriptionEn: `Transfer to ${toUserName}`,
    referenceNumber: generateReferenceNumber("transfer_out"),
    timestamp,
    createdAt: timestamp,
    status: "completed",
  };
};

/**
 * Generate withdrawal transaction
 */
const generateWithdrawalTransaction = (
  userId,
  walletId,
  balanceBefore,
  timestamp
) => {
  const amounts = [500, 1000, 2000, 5000];
  const amount = amounts[Math.floor(Math.random() * amounts.length)];

  const banks = [
    "الراجحي",
    "الأهلي السعودي",
    "الرياض",
    "سامبا",
    "العربي الوطني",
  ];
  const bankName = banks[Math.floor(Math.random() * banks.length)];

  return {
    id: generateTransactionId(),
    walletId,
    userId,
    type: "withdrawal",
    category: "withdrawal",
    amount: -Math.abs(parseFloat(amount.toFixed(2))),
    balanceBefore: parseFloat(balanceBefore.toFixed(2)),
    balanceAfter: parseFloat((balanceBefore - amount).toFixed(2)),
    withdrawalDetails: {
      bankName,
      accountNumber: `SA${Math.floor(
        1000000000000000 + Math.random() * 9000000000000000
      )}`,
      accountHolderName: generateRandomName(),
    },
    estimatedArrival: timestamp + 3 * 24 * 60 * 60 * 1000,
    descriptionAr: "سحب رصيد إلى الحساب البنكي",
    descriptionEn: "Withdrawal to Bank Account",
    referenceNumber: generateReferenceNumber("withdrawal"),
    timestamp,
    createdAt: timestamp,
    status: "completed",
  };
};

/**
 * Generate refund transaction
 */
const generateRefundTransaction = (
  userId,
  walletId,
  balanceBefore,
  timestamp
) => {
  const amounts = [50, 100, 200, 300];
  const amount = amounts[Math.floor(Math.random() * amounts.length)];

  const reasons = ["إلغاء طلب", "خطأ في الدفع", "استرجاع رسوم", "تعويض"];
  const reason = reasons[Math.floor(Math.random() * reasons.length)];

  return {
    id: generateTransactionId(),
    walletId,
    userId,
    type: "refund",
    category: "refund",
    amount: parseFloat(amount.toFixed(2)),
    balanceBefore: parseFloat(balanceBefore.toFixed(2)),
    balanceAfter: parseFloat((balanceBefore + amount).toFixed(2)),
    refundReason: reason,
    descriptionAr: `استرجاع مبلغ - ${reason}`,
    descriptionEn: "Refund",
    referenceNumber: generateReferenceNumber("refund"),
    timestamp,
    createdAt: timestamp,
    status: "completed",
  };
};

/**
 * Generate cashback transaction
 */
const generateCashbackTransaction = (
  userId,
  walletId,
  balanceBefore,
  timestamp
) => {
  const cashbackRates = [1, 2, 3, 5];
  const cashbackRate =
    cashbackRates[Math.floor(Math.random() * cashbackRates.length)];
  const baseAmount = Math.floor(Math.random() * 1000) + 100;
  const amount = (baseAmount * cashbackRate) / 100;

  return {
    id: generateTransactionId(),
    walletId,
    userId,
    type: "cashback",
    category: "reward",
    amount: parseFloat(amount.toFixed(2)),
    balanceBefore: parseFloat(balanceBefore.toFixed(2)),
    balanceAfter: parseFloat((balanceBefore + amount).toFixed(2)),
    cashbackRate,
    descriptionAr: `استرجاع نقدي ${cashbackRate}%`,
    descriptionEn: `${cashbackRate}% Cashback`,
    referenceNumber: generateReferenceNumber("cashback"),
    timestamp,
    createdAt: timestamp,
    status: "completed",
  };
};

/**
 * Generate bonus transaction
 */
const generateBonusTransaction = (
  userId,
  walletId,
  balanceBefore,
  timestamp
) => {
  const amounts = [10, 25, 50, 100];
  const amount = amounts[Math.floor(Math.random() * amounts.length)];

  const bonusTypes = [
    { type: "referral", ar: "مكافأة إحالة صديق", en: "Referral Bonus" },
    { type: "promotion", ar: "مكافأة ترويجية", en: "Promotional Bonus" },
    { type: "welcome", ar: "مكافأة الترحيب", en: "Welcome Bonus" },
  ];
  const bonus = bonusTypes[Math.floor(Math.random() * bonusTypes.length)];

  return {
    id: generateTransactionId(),
    walletId,
    userId,
    type: "bonus",
    category: "reward",
    amount: parseFloat(amount.toFixed(2)),
    balanceBefore: parseFloat(balanceBefore.toFixed(2)),
    balanceAfter: parseFloat((balanceBefore + amount).toFixed(2)),
    bonusType: bonus.type,
    bonusReason: bonus.ar,
    descriptionAr: bonus.ar,
    descriptionEn: bonus.en,
    referenceNumber: generateReferenceNumber("bonus"),
    timestamp,
    createdAt: timestamp,
    status: "completed",
  };
};

/**
 * Generate fee transaction
 */
const generateFeeTransaction = (userId, walletId, balanceBefore, timestamp) => {
  const feeTypes = [
    {
      type: "withdrawal_fee",
      ar: "رسوم سحب رصيد",
      en: "Withdrawal Fee",
      amount: 10,
    },
    { type: "transfer_fee", ar: "رسوم تحويل", en: "Transfer Fee", amount: 5 },
    { type: "service_fee", ar: "رسوم خدمة", en: "Service Fee", amount: 15 },
  ];
  const fee = feeTypes[Math.floor(Math.random() * feeTypes.length)];
  const amount = fee.amount;

  return {
    id: generateTransactionId(),
    walletId,
    userId,
    type: "fee",
    category: "fee",
    amount: -Math.abs(parseFloat(amount.toFixed(2))),
    balanceBefore: parseFloat(balanceBefore.toFixed(2)),
    balanceAfter: parseFloat((balanceBefore - amount).toFixed(2)),
    feeType: fee.type,
    descriptionAr: fee.ar,
    descriptionEn: fee.en,
    referenceNumber: generateReferenceNumber("fee"),
    timestamp,
    createdAt: timestamp,
    status: "completed",
  };
};

/**
 * Generate penalty transaction
 */
const generatePenaltyTransaction = (
  userId,
  walletId,
  balanceBefore,
  timestamp
) => {
  const penalties = [
    { ar: "غرامة تأخير سداد", en: "Late Payment Penalty", amount: 50 },
    { ar: "غرامة إلغاء خدمة", en: "Service Cancellation Penalty", amount: 100 },
    { ar: "غرامة إدارية", en: "Administrative Penalty", amount: 75 },
    { ar: "غرامة مخالفة شروط", en: "Terms Violation Penalty", amount: 150 },
  ];
  const penalty = penalties[Math.floor(Math.random() * penalties.length)];
  const amount = penalty.amount;

  return {
    id: generateTransactionId(),
    walletId,
    userId,
    type: "penalty",
    category: "penalty",
    amount: -Math.abs(parseFloat(amount.toFixed(2))),
    balanceBefore: parseFloat(balanceBefore.toFixed(2)),
    balanceAfter: parseFloat((balanceBefore - amount).toFixed(2)),
    penaltyReason: penalty.ar,
    descriptionAr: `غرامة - ${penalty.ar}`,
    descriptionEn: `Penalty - ${penalty.en}`,
    referenceNumber: generateReferenceNumber("penalty"),
    timestamp,
    createdAt: timestamp,
    status: "completed",
  };
};

// ============================================================================
// MAIN TRANSACTION GENERATION LOGIC
// ============================================================================

/**
 * Generate balanced mix of transactions
 */
const generateTransactions = (
  userId,
  walletId,
  count,
  monthsBack,
  startBalance,
  allowedTypes,
  paidBills = []
) => {
  const transactions = [];
  let currentBalance = startBalance;

  // Define transaction type weights for realistic distribution
  // Only expense transactions: payment, transfer_out, withdrawal, fee, penalty
  const typeWeights = {
    payment: 50, // Most common - government service payments
    transfer_out: 20, // Transfers to others
    withdrawal: 15, // Withdrawals to bank
    fee: 10, // Service fees
    penalty: 5, // Penalties (least common)
  };

  // Filter weights based on allowed types
  const filteredWeights = {};
  allowedTypes.forEach((type) => {
    if (typeWeights[type]) {
      filteredWeights[type] = typeWeights[type];
    }
  });

  // Create weighted array of transaction types
  const weightedTypes = [];
  Object.entries(filteredWeights).forEach(([type, weight]) => {
    for (let i = 0; i < weight; i++) {
      weightedTypes.push(type);
    }
  });

  // Generate timestamps distributed across the time period
  const timestamps = [];
  for (let i = 0; i < count; i++) {
    timestamps.push(generatePastDate(monthsBack));
  }
  timestamps.sort((a, b) => a - b); // Sort chronologically

  // Generate transactions
  for (let i = 0; i < count; i++) {
    const type =
      weightedTypes[Math.floor(Math.random() * weightedTypes.length)];
    const timestamp = timestamps[i];

    let transaction;

    switch (type) {
      case "payment":
        // Use paid bills occasionally if available
        const useBill =
          paidBills.length > 0 &&
          Math.random() > 0.7 &&
          timestamp >= Date.now() - 365 * 24 * 60 * 60 * 1000;
        const bill = useBill
          ? paidBills[Math.floor(Math.random() * paidBills.length)]
          : null;
        transaction = generatePaymentTransaction(
          userId,
          walletId,
          currentBalance,
          timestamp,
          bill
        );
        break;

      case "transfer_out":
        transaction = generateTransferOutTransaction(
          userId,
          walletId,
          currentBalance,
          timestamp
        );
        break;

      case "withdrawal":
        transaction = generateWithdrawalTransaction(
          userId,
          walletId,
          currentBalance,
          timestamp
        );
        break;

      case "fee":
        transaction = generateFeeTransaction(
          userId,
          walletId,
          currentBalance,
          timestamp
        );
        break;

      case "penalty":
        transaction = generatePenaltyTransaction(
          userId,
          walletId,
          currentBalance,
          timestamp
        );
        break;

      default:
        continue;
    }

    // Update balance for next transaction
    currentBalance = transaction.balanceAfter;

    // Ensure balance doesn't go negative - skip transaction if it would cause negative balance
    if (currentBalance < 0) {
      // Skip this transaction and restore previous balance
      currentBalance = transaction.balanceBefore;
      console.log(
        `   ⚠️  Skipped transaction (would cause negative balance: ${currentBalance.toFixed(
          2
        )} SAR)`
      );
      continue;
    }

    transactions.push(sanitizeObject(transaction));
  }

  return transactions;
};

/**
 * Seed transactions to Firebase
 */
const seedTransactions = async (walletId, transactions) => {
  try {
    let success = 0;
    let failed = 0;

    for (const transaction of transactions) {
      try {
        const transactionRef = ref(
          database,
          `transactions/${walletId}/${transaction.id}`
        );
        await set(transactionRef, transaction);
        success++;
        console.log(
          `   ✅ Transaction ${transaction.id} created (${transaction.type})`
        );
      } catch (error) {
        failed++;
        console.error(`   ❌ Failed to create transaction:`, error.message);
      }

      // Small delay to avoid rate limiting
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    return { success, failed };
  } catch (error) {
    console.error("❌ Error seeding transactions:", error);
    throw error;
  }
};

// ============================================================================
// MAIN SCRIPT
// ============================================================================

async function main() {
  console.log("🌱 Starting Wallet Transactions seeding process...");
  console.log("=".repeat(70));

  // Parse arguments
  const params = parseArgs();

  // Validate parameters
  const errors = validateParams(params);
  if (errors.length > 0) {
    console.error("\n❌ Missing required parameters:\n");
    errors.forEach((error) => console.error(`   - ${error}`));
    console.log("\n📖 Usage:");
    console.log(
      '   node scripts/seedTransactions.mjs --userId="YOUR_ID" --walletId="YOUR_WALLET_ID"'
    );
    console.log("\n📋 Options:");
    console.log("   --userId        Firebase user ID (required)");
    console.log("   --walletId      Wallet ID (required)");
    console.log(
      "   --count         Number of transactions to generate (default: 30)"
    );
    console.log(
      "   --types         Comma-separated expense transaction types (default: all)"
    );
    console.log(
      "                   Available: payment,transfer_out,withdrawal,fee,penalty"
    );
    console.log(
      "   --months        Number of months back to generate data (default: 12)"
    );
    console.log(
      "   --startBalance  Starting balance for calculations (default: 5000)"
    );
    console.log(
      "                   Ensure balance is high enough to cover expenses!"
    );
    process.exit(1);
  }

  const userId = params.userId;
  const walletId = params.walletId;
  const count = parseInt(params.count) || 30;
  const monthsBack = parseInt(params.months) || 12;
  const startBalance = parseFloat(params.startBalance) || 5000;

  // Only expense transaction types (matching getMonthlyTotalPayments)
  const allTypes = ["payment", "transfer_out", "withdrawal", "fee", "penalty"];
  const allowedTypes = params.types
    ? params.types.split(",").map((t) => t.trim())
    : allTypes;

  console.log("\n📊 CONFIGURATION");
  console.log("=".repeat(70));
  console.log(`   User ID: ${userId}`);
  console.log(`   Wallet ID: ${walletId}`);
  console.log(`   Transactions to generate: ${count}`);
  console.log(`   Time period: Past ${monthsBack} months`);
  console.log(`   Starting balance: ${startBalance} SAR`);
  console.log(`   Transaction types: ${allowedTypes.join(", ")}`);

  // Fetch wallet data
  console.log("\n🔍 Fetching wallet data...");
  const wallet = await getWalletData(walletId);

  if (!wallet) {
    console.error(`\n❌ Wallet not found: ${walletId}`);
    console.log("   Please check the wallet ID and try again.");
    process.exit(1);
  }

  console.log(`   ✅ Wallet found: ${wallet.type} wallet`);

  // Fetch user bills for linking
  console.log("\n🔍 Fetching user bills for payment linking...");
  const bills = await getUserBills(userId);
  const paidBills = bills.filter((b) => b.status === "paid");
  console.log(
    `   ✅ Found ${bills.length} bills (${paidBills.length} paid bills for linking)`
  );

  // Generate transactions
  console.log("\n🎲 Generating transactions...");
  const transactions = generateTransactions(
    userId,
    walletId,
    count,
    monthsBack,
    startBalance,
    allowedTypes,
    paidBills
  );

  console.log(`   ✅ Generated ${transactions.length} transactions`);

  // Display transaction summary
  console.log("\n📋 TRANSACTION SUMMARY");
  console.log("=".repeat(70));

  const summary = {
    total: transactions.length,
    byType: {},
    totalIncome: 0,
    totalExpense: 0,
    finalBalance: 0,
  };

  transactions.forEach((txn) => {
    summary.byType[txn.type] = (summary.byType[txn.type] || 0) + 1;
    if (txn.amount > 0) {
      summary.totalIncome += txn.amount;
    } else {
      summary.totalExpense += Math.abs(txn.amount);
    }
    summary.finalBalance = txn.balanceAfter;
  });

  console.log(`   Total Transactions: ${summary.total}`);
  console.log(`   Total Income: ${summary.totalIncome.toFixed(2)} SAR`);
  console.log(`   Total Expense: ${summary.totalExpense.toFixed(2)} SAR`);
  console.log(`   Final Balance: ${summary.finalBalance.toFixed(2)} SAR`);
  console.log("   By Type:");
  Object.entries(summary.byType).forEach(([type, count]) => {
    console.log(`      - ${type}: ${count}`);
  });

  // Seed transactions to Firebase
  console.log("\n🌱 Seeding transactions to Firebase...\n");
  const result = await seedTransactions(walletId, transactions);

  // Print final summary
  console.log("\n" + "=".repeat(70));
  console.log("📈 SEEDING SUMMARY");
  console.log("=".repeat(70));
  console.log(`✅ Seeded: ${result.success}`);
  console.log(`❌ Failed: ${result.failed}`);
  console.log(`📊 Total: ${transactions.length}`);
  console.log("=".repeat(70));

  if (result.success > 0) {
    console.log("\n✨ Transactions successfully seeded to Firebase!");
    console.log("🔍 Check Firebase Console to verify the data.");
    console.log(`📂 Path: transactions/${walletId}`);
  }

  if (result.failed > 0) {
    console.log("\n⚠️  Some transactions failed to seed. Check errors above.");
    process.exit(1);
  }

  process.exit(0);
}

// Run the script
main().catch((error) => {
  console.error("\n💥 Fatal error:", error);
  process.exit(1);
});
