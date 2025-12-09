/**
 * Government Bills Service
 *
 * Provides CRUD operations for government bills, including:
 * - Creating and managing bills
 * - Auto-generating bills from government services
 * - Bulk bill payment processing
 * - Bill queries and filtering
 */

import { database } from './firebase';
import { ref, set, get, update, remove, query, orderByChild, equalTo } from 'firebase/database';
import { DB_PATHS } from './firebase/databasePaths';
import GOVERNMENT_SERVICES_DATA, { getServicesForUserType } from './firebase/governmentServicesData';

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Sanitize bill data - remove undefined and null values
 * @param {Object} data - Raw bill data
 * @returns {Object} Sanitized data
 */
export const sanitizeBillData = (data) => {
  const sanitized = {};
  Object.keys(data).forEach((key) => {
    if (data[key] !== undefined && data[key] !== null) {
      sanitized[key] = data[key];
    }
  });
  return sanitized;
};

/**
 * Generate bill reference number
 * @param {string} serviceType - Service type (passports, traffic, etc.)
 * @returns {string} Reference number (e.g., PASS-2024-001)
 */
export const generateBillReferenceNumber = (serviceType) => {
  const prefixes = {
    passports: 'PASS',
    traffic: 'TRAF',
    civil_affairs: 'CIVIL',
    commerce: 'COM'
  };

  const prefix = prefixes[serviceType] || 'BILL';
  const year = new Date().getFullYear();
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');

  return `${prefix}-${year}-${random}`;
};

/**
 * Calculate if bill is overdue
 * @param {Object} bill - Bill object
 * @returns {boolean} True if overdue
 */
export const isBillOverdue = (bill) => {
  if (bill.status === 'paid') return false;
  const now = Date.now();
  return bill.dueDate < now;
};

/**
 * Calculate days until due
 * @param {Object} bill - Bill object
 * @returns {number} Days until due (negative if overdue)
 */
export const getDaysUntilDue = (bill) => {
  const now = Date.now();
  const diffMs = bill.dueDate - now;
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
};

/**
 * Calculate penalty for overdue bill
 * @param {Object} bill - Bill object
 * @param {number} lateFeeRate - Late fee rate (default: 0.1 = 10%)
 * @returns {Object|null} { lateFee, daysOverdue, totalWithPenalty } or null if not overdue
 */
export const calculatePenalty = (bill, lateFeeRate = 0.1) => {
  if (!isBillOverdue(bill)) return null;

  const daysOverdue = Math.abs(getDaysUntilDue(bill));
  const lateFee = bill.amount * lateFeeRate;
  const totalWithPenalty = bill.amount + lateFee;

  return {
    lateFee: parseFloat(lateFee.toFixed(2)),
    daysOverdue,
    totalWithPenalty: parseFloat(totalWithPenalty.toFixed(2))
  };
};

/**
 * Calculate total amount for multiple bills
 * @param {Array<Object>} bills - Array of bills
 * @returns {number} Total amount
 */
export const calculateBulkTotal = (bills) => {
  return bills.reduce((total, bill) => {
    // If bill has penalty info, use total with penalty, otherwise use base amount
    const amount = bill.penaltyInfo?.totalWithPenalty || bill.amount;
    return total + amount;
  }, 0);
};

// ============================================================================
// CREATE OPERATIONS
// ============================================================================

/**
 * Create a new government bill
 * @param {string} userId - User ID
 * @param {Object} billData - Bill data
 * @returns {Promise<Object>} Created bill with ID
 */
export const createBill = async (userId, billData) => {
  try {
    // Generate bill ID
    const billId = `bill_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    // Prepare bill object with metadata
    const now = Date.now();
    const bill = sanitizeBillData({
      id: billId,
      userId,
      ...billData,
      createdAt: now,
      updatedAt: now
    });

    // Save to Firebase
    const billRef = ref(database, DB_PATHS.BILL(userId, billId));
    await set(billRef, bill);

    console.log(`✅ Bill created: ${billId}`);
    return bill;
  } catch (error) {
    console.error('❌ Error creating bill:', error);
    throw error;
  }
};

/**
 * Batch create multiple bills
 * @param {string} userId - User ID
 * @param {Array<Object>} billsArray - Array of bill data
 * @returns {Promise<Array<Object>>} Created bills with IDs
 */
export const createBulkBills = async (userId, billsArray) => {
  try {
    const createdBills = [];

    for (const billData of billsArray) {
      const bill = await createBill(userId, billData);
      createdBills.push(bill);
    }

    console.log(`✅ Created ${createdBills.length} bills`);
    return createdBills;
  } catch (error) {
    console.error('❌ Error creating bulk bills:', error);
    throw error;
  }
};

// ============================================================================
// READ OPERATIONS
// ============================================================================

/**
 * Get all bills for a user
 * @param {string} userId - User ID
 * @param {Object} options - Query options { status?, limit?, orderBy? }
 * @returns {Promise<Array<Object>>} Array of bills
 */
export const getUserBills = async (userId, options = {}) => {
  try {
    const billsRef = ref(database, DB_PATHS.USER_BILLS(userId));
    const snapshot = await get(billsRef);

    if (!snapshot.exists()) {
      return [];
    }

    const billsData = snapshot.val();
    let bills = Object.values(billsData);

    // Filter by status if specified
    if (options.status) {
      bills = bills.filter(bill => bill.status === options.status);
    }

    // Apply limit if specified
    if (options.limit) {
      bills = bills.slice(0, options.limit);
    }

    return bills;
  } catch (error) {
    console.error('❌ Error fetching user bills:', error);
    throw error;
  }
};

/**
 * Get bills for a specific wallet
 * @param {string} userId - User ID
 * @param {string} walletId - Wallet ID
 * @param {Object} options - Query options { status?, limit? }
 * @returns {Promise<Array<Object>>} Array of bills
 */
export const getWalletBills = async (userId, walletId, options = {}) => {
  try {
    const allBills = await getUserBills(userId, {});

    // Filter by wallet ID
    let bills = allBills.filter(bill => bill.walletId === walletId);

    // Filter by status if specified
    if (options.status) {
      bills = bills.filter(bill => bill.status === options.status);
    }

    // Apply limit if specified
    if (options.limit) {
      bills = bills.slice(0, options.limit);
    }

    return bills;
  } catch (error) {
    console.error('❌ Error fetching wallet bills:', error);
    throw error;
  }
};

/**
 * Get a specific bill by ID
 * @param {string} userId - User ID
 * @param {string} billId - Bill ID
 * @returns {Promise<Object|null>} Bill object or null
 */
export const getBillById = async (userId, billId) => {
  try {
    const billRef = ref(database, DB_PATHS.BILL(userId, billId));
    const snapshot = await get(billRef);

    if (!snapshot.exists()) {
      return null;
    }

    return snapshot.val();
  } catch (error) {
    console.error('❌ Error fetching bill by ID:', error);
    throw error;
  }
};

/**
 * Get bills by status
 * @param {string} userId - User ID
 * @param {string} status - Bill status (paid, unpaid, overdue, upcoming)
 * @param {number} limit - Max results
 * @returns {Promise<Array<Object>>} Array of bills
 */
export const getBillsByStatus = async (userId, status, limit = 50) => {
  return await getUserBills(userId, { status, limit });
};

/**
 * Get bills by service type
 * @param {string} userId - User ID
 * @param {string} serviceType - Service type (passports, traffic, etc.)
 * @param {Object} options - Query options
 * @returns {Promise<Array<Object>>} Array of bills
 */
export const getBillsByServiceType = async (userId, serviceType, options = {}) => {
  try {
    const allBills = await getUserBills(userId, {});
    let bills = allBills.filter(bill => bill.serviceType === serviceType);

    if (options.status) {
      bills = bills.filter(bill => bill.status === options.status);
    }

    if (options.limit) {
      bills = bills.slice(0, options.limit);
    }

    return bills;
  } catch (error) {
    console.error('❌ Error fetching bills by service type:', error);
    throw error;
  }
};

/**
 * Get bills by ministry
 * @param {string} userId - User ID
 * @param {string} ministry - Ministry code (MOI, MHRSD, etc.)
 * @param {Object} options - Query options
 * @returns {Promise<Array<Object>>} Array of bills
 */
export const getBillsByMinistry = async (userId, ministry, options = {}) => {
  try {
    const allBills = await getUserBills(userId, {});
    let bills = allBills.filter(bill => bill.ministry === ministry);

    if (options.status) {
      bills = bills.filter(bill => bill.status === options.status);
    }

    if (options.limit) {
      bills = bills.slice(0, options.limit);
    }

    return bills;
  } catch (error) {
    console.error('❌ Error fetching bills by ministry:', error);
    throw error;
  }
};

/**
 * Get upcoming bills (bills due within next N days)
 * @param {string} userId - User ID
 * @param {number} days - Number of days to look ahead
 * @returns {Promise<Array<Object>>} Array of upcoming bills
 */
export const getUpcomingBills = async (userId, days = 30) => {
  try {
    const allBills = await getUserBills(userId, {});
    const now = Date.now();
    const futureDate = now + (days * 24 * 60 * 60 * 1000);

    const upcomingBills = allBills.filter(bill => {
      return (bill.status === 'unpaid' || bill.status === 'upcoming') &&
             bill.dueDate >= now &&
             bill.dueDate <= futureDate;
    });

    return upcomingBills;
  } catch (error) {
    console.error('❌ Error fetching upcoming bills:', error);
    throw error;
  }
};

/**
 * Get overdue bills
 * @param {string} userId - User ID
 * @returns {Promise<Array<Object>>} Array of overdue bills
 */
export const getOverdueBills = async (userId) => {
  try {
    const allBills = await getUserBills(userId, {});
    const overdueBills = allBills.filter(bill => isBillOverdue(bill));
    return overdueBills;
  } catch (error) {
    console.error('❌ Error fetching overdue bills:', error);
    throw error;
  }
};

/**
 * Search bills by reference number or description
 * @param {string} userId - User ID
 * @param {string} searchTerm - Search term
 * @returns {Promise<Array<Object>>} Filtered bills
 */
export const searchBills = async (userId, searchTerm) => {
  try {
    const allBills = await getUserBills(userId, {});
    const lowerSearch = searchTerm.toLowerCase();

    const filtered = allBills.filter(bill => {
      return (
        bill.referenceNumber?.toLowerCase().includes(lowerSearch) ||
        bill.description?.ar?.toLowerCase().includes(lowerSearch) ||
        bill.description?.en?.toLowerCase().includes(lowerSearch) ||
        bill.serviceName?.ar?.toLowerCase().includes(lowerSearch) ||
        bill.serviceName?.en?.toLowerCase().includes(lowerSearch)
      );
    });

    return filtered;
  } catch (error) {
    console.error('❌ Error searching bills:', error);
    throw error;
  }
};

/**
 * Get bill statistics
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Statistics object
 */
export const getBillStats = async (userId) => {
  try {
    const allBills = await getUserBills(userId, {});

    const stats = {
      totalBills: allBills.length,
      totalAmount: 0,
      paidAmount: 0,
      unpaidAmount: 0,
      overdueAmount: 0,
      upcomingAmount: 0,
      byStatus: {
        paid: 0,
        unpaid: 0,
        overdue: 0,
        upcoming: 0
      },
      byMinistry: {},
      byServiceType: {}
    };

    allBills.forEach(bill => {
      // Count by status
      if (bill.status) {
        stats.byStatus[bill.status] = (stats.byStatus[bill.status] || 0) + 1;
      }

      // Count by ministry
      if (bill.ministry) {
        stats.byMinistry[bill.ministry] = (stats.byMinistry[bill.ministry] || 0) + 1;
      }

      // Count by service type
      if (bill.serviceType) {
        stats.byServiceType[bill.serviceType] = (stats.byServiceType[bill.serviceType] || 0) + 1;
      }

      // Calculate amounts
      const amount = bill.penaltyInfo?.totalWithPenalty || bill.amount;
      stats.totalAmount += amount;

      if (bill.status === 'paid') {
        stats.paidAmount += amount;
      } else if (bill.status === 'unpaid') {
        stats.unpaidAmount += amount;
      } else if (bill.status === 'overdue') {
        stats.overdueAmount += amount;
      } else if (bill.status === 'upcoming') {
        stats.upcomingAmount += amount;
      }
    });

    // Round amounts to 2 decimal places
    stats.totalAmount = parseFloat(stats.totalAmount.toFixed(2));
    stats.paidAmount = parseFloat(stats.paidAmount.toFixed(2));
    stats.unpaidAmount = parseFloat(stats.unpaidAmount.toFixed(2));
    stats.overdueAmount = parseFloat(stats.overdueAmount.toFixed(2));
    stats.upcomingAmount = parseFloat(stats.upcomingAmount.toFixed(2));

    return stats;
  } catch (error) {
    console.error('❌ Error calculating bill stats:', error);
    throw error;
  }
};

/**
 * Get all bills for personal wallet
 * @param {string} userId - User ID
 * @param {string} walletId - Personal wallet ID
 * @returns {Promise<Array<Object>>} Personal bills filtered by isBusiness: false
 */
export const getPersonalWalletBills = async (userId, walletId) => {
  try {
    const bills = await getWalletBills(userId, walletId);
    return bills.filter(bill => bill.isBusiness === false);
  } catch (error) {
    console.error('❌ Error fetching personal wallet bills:', error);
    throw error;
  }
};

/**
 * Get all bills for business wallet
 * @param {string} userId - User ID
 * @param {string} walletId - Business wallet ID
 * @returns {Promise<Array<Object>>} Business bills filtered by isBusiness: true
 */
export const getBusinessWalletBills = async (userId, walletId) => {
  try {
    const bills = await getWalletBills(userId, walletId);
    return bills.filter(bill => bill.isBusiness === true);
  } catch (error) {
    console.error('❌ Error fetching business wallet bills:', error);
    throw error;
  }
};

/**
 * Fetch all bills for user's wallets (personal + business)
 * @param {string} userId - User ID
 * @param {Object} wallets - { personal, business }
 * @returns {Promise<Object>} { personal: [], business: [], all: [] }
 */
export const fetchAllUserBills = async (userId, wallets) => {
  try {
    const result = {
      personal: [],
      business: [],
      all: []
    };

    // Fetch all user bills
    const allBills = await getUserBills(userId, {});
    result.all = allBills;

    // Separate by wallet type
    if (wallets.personal) {
      result.personal = allBills.filter(bill =>
        bill.walletId === wallets.personal.id && bill.isBusiness === false
      );
    }

    if (wallets.business) {
      result.business = allBills.filter(bill =>
        bill.walletId === wallets.business.id && bill.isBusiness === true
      );
    }

    return result;
  } catch (error) {
    console.error('❌ Error fetching all user bills:', error);
    throw error;
  }
};

// ============================================================================
// UPDATE OPERATIONS
// ============================================================================

/**
 * Update bill status
 * @param {string} userId - User ID
 * @param {string} billId - Bill ID
 * @param {string} status - New status
 * @param {Object} additionalData - Additional data (paymentDate, paidWith, etc.)
 * @returns {Promise<boolean>} Success status
 */
export const updateBillStatus = async (userId, billId, status, additionalData = {}) => {
  try {
    const billRef = ref(database, DB_PATHS.BILL(userId, billId));

    const updates = {
      status,
      updatedAt: Date.now(),
      ...additionalData
    };

    await update(billRef, sanitizeBillData(updates));
    console.log(`✅ Bill ${billId} status updated to ${status}`);
    return true;
  } catch (error) {
    console.error('❌ Error updating bill status:', error);
    throw error;
  }
};

/**
 * Mark bill as paid
 * @param {string} userId - User ID
 * @param {string} billId - Bill ID
 * @param {string} transactionId - Associated transaction ID
 * @returns {Promise<boolean>} Success status
 */
export const markBillAsPaid = async (userId, billId, transactionId) => {
  return await updateBillStatus(userId, billId, 'paid', {
    paymentDate: Date.now(),
    paidWith: transactionId
  });
};

/**
 * Update bill amount (for violations or adjustments)
 * @param {string} userId - User ID
 * @param {string} billId - Bill ID
 * @param {number} newAmount - New amount
 * @param {Object} penaltyInfo - Penalty information if applicable
 * @returns {Promise<boolean>} Success status
 */
export const updateBillAmount = async (userId, billId, newAmount, penaltyInfo = null) => {
  try {
    const billRef = ref(database, DB_PATHS.BILL(userId, billId));

    const updates = {
      amount: newAmount,
      updatedAt: Date.now()
    };

    if (penaltyInfo) {
      updates.penaltyInfo = penaltyInfo;
    }

    await update(billRef, sanitizeBillData(updates));
    console.log(`✅ Bill ${billId} amount updated to ${newAmount}`);
    return true;
  } catch (error) {
    console.error('❌ Error updating bill amount:', error);
    throw error;
  }
};

/**
 * Update bill metadata
 * @param {string} userId - User ID
 * @param {string} billId - Bill ID
 * @param {Object} updates - Fields to update
 * @returns {Promise<boolean>} Success status
 */
export const updateBill = async (userId, billId, updates) => {
  try {
    const billRef = ref(database, DB_PATHS.BILL(userId, billId));

    const updateData = {
      ...updates,
      updatedAt: Date.now()
    };

    await update(billRef, sanitizeBillData(updateData));
    console.log(`✅ Bill ${billId} updated`);
    return true;
  } catch (error) {
    console.error('❌ Error updating bill:', error);
    throw error;
  }
};

// ============================================================================
// DELETE OPERATIONS
// ============================================================================

/**
 * Delete a bill
 * @param {string} userId - User ID
 * @param {string} billId - Bill ID
 * @returns {Promise<boolean>} Success status
 */
export const deleteBill = async (userId, billId) => {
  try {
    const billRef = ref(database, DB_PATHS.BILL(userId, billId));
    await remove(billRef);
    console.log(`✅ Bill ${billId} deleted`);
    return true;
  } catch (error) {
    console.error('❌ Error deleting bill:', error);
    throw error;
  }
};

/**
 * Delete multiple bills (bulk delete)
 * @param {string} userId - User ID
 * @param {Array<string>} billIds - Array of bill IDs
 * @returns {Promise<Object>} { success: count, failed: count }
 */
export const deleteBulkBills = async (userId, billIds) => {
  try {
    let success = 0;
    let failed = 0;

    for (const billId of billIds) {
      try {
        await deleteBill(userId, billId);
        success++;
      } catch (error) {
        failed++;
      }
    }

    console.log(`✅ Deleted ${success} bills, ${failed} failed`);
    return { success, failed };
  } catch (error) {
    console.error('❌ Error deleting bulk bills:', error);
    throw error;
  }
};

// ============================================================================
// AUTO-GENERATION FUNCTIONS
// ============================================================================

/**
 * Generate random bill for specific service type
 * @param {string} userId - User ID
 * @param {string} walletId - Wallet ID
 * @param {boolean} isBusiness - Is business wallet
 * @param {string} serviceType - Service type from government services
 * @param {string} status - Bill status (unpaid, paid, overdue, upcoming)
 * @returns {Object} Generated bill
 */
export const generateRandomBill = (userId, walletId, isBusiness, serviceType, status) => {
  const service = GOVERNMENT_SERVICES_DATA[serviceType];
  if (!service) {
    throw new Error(`Service type ${serviceType} not found`);
  }

  // Filter sub-types available for this user type
  const userType = isBusiness ? 'business' : 'personal';
  const availableSubTypes = Object.entries(service.subTypes).filter(([_, subType]) =>
    subType.availableFor.includes(userType)
  );

  if (availableSubTypes.length === 0) {
    throw new Error(`No sub-types available for ${serviceType} (${userType})`);
  }

  // Pick random sub-type
  const [subTypeKey, subType] = availableSubTypes[Math.floor(Math.random() * availableSubTypes.length)];

  // Generate dates based on status
  const now = Date.now();
  let issueDate, dueDate, paymentDate = null, paidWith = null;

  switch (status) {
    case 'paid':
      issueDate = now - (60 * 24 * 60 * 60 * 1000); // 60 days ago
      dueDate = now - (30 * 24 * 60 * 60 * 1000); // 30 days ago
      paymentDate = now - (35 * 24 * 60 * 60 * 1000); // Paid 35 days ago
      paidWith = `txn_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      break;
    case 'unpaid':
      issueDate = now - (15 * 24 * 60 * 60 * 1000); // 15 days ago
      dueDate = now + (15 * 24 * 60 * 60 * 1000); // Due in 15 days
      break;
    case 'overdue':
      issueDate = now - (45 * 24 * 60 * 60 * 1000); // 45 days ago
      dueDate = now - (5 * 24 * 60 * 60 * 1000); // 5 days overdue
      break;
    case 'upcoming':
      issueDate = now + (10 * 24 * 60 * 60 * 1000); // Will be issued in 10 days
      dueDate = now + (40 * 24 * 60 * 60 * 1000); // Due in 40 days
      break;
    default:
      issueDate = now;
      dueDate = now + (30 * 24 * 60 * 60 * 1000);
  }

  // Generate additional info based on service type
  const additionalInfo = {};

  if (serviceType === 'passports') {
    additionalInfo.passportNumber = `P${Math.floor(Math.random() * 100000000)}`;
    additionalInfo.expiryDate = dueDate;
    additionalInfo.holderName = 'فيصل عبدالله';
  } else if (serviceType === 'traffic') {
    additionalInfo.plateNumber = `أ ب ج ${Math.floor(Math.random() * 10000)}`;
    if (subTypeKey === 'traffic_violations') {
      additionalInfo.violationType = 'speeding_major';
      additionalInfo.location = 'طريق الملك فهد - الرياض';
      additionalInfo.violationDate = issueDate;
      additionalInfo.speed = '140 km/h';
      additionalInfo.speedLimit = '120 km/h';
    }
  } else if (serviceType === 'civil_affairs' &&
             (subTypeKey === 'issue_iqama' || subTypeKey === 'renew_iqama')) {
    additionalInfo.employeeName = 'أحمد محمد';
    additionalInfo.iqamaNumber = `${Math.floor(Math.random() * 10000000000)}`;
    additionalInfo.nationality = 'مصري';
    additionalInfo.occupation = 'محاسب';
  } else if (serviceType === 'civil_affairs' && subTypeKey === 'exit_reentry_visa') {
    additionalInfo.employeeName = 'أحمد محمد';
    additionalInfo.iqamaNumber = `${Math.floor(Math.random() * 10000000000)}`;
    additionalInfo.visaType = Math.random() > 0.5 ? 'single' : 'multiple';
    additionalInfo.validUntil = dueDate;
  } else if (serviceType === 'civil_affairs') {
    additionalInfo.nationalId = `${Math.floor(Math.random() * 10000000000)}`;
    additionalInfo.expiryDate = dueDate;
  }

  // Calculate penalty if overdue
  let penaltyInfo = null;
  if (status === 'overdue') {
    const daysOverdue = Math.abs(getDaysUntilDue({ dueDate }));
    const lateFee = subType.fee * 0.1; // 10% penalty
    penaltyInfo = {
      lateFee: parseFloat(lateFee.toFixed(2)),
      daysOverdue,
      totalWithPenalty: parseFloat((subType.fee + lateFee).toFixed(2))
    };
  }

  return {
    userId,
    walletId,
    isBusiness,
    serviceType,
    serviceSubType: subTypeKey,
    serviceName: {
      ar: subType.nameAr,
      en: subType.nameEn
    },
    category: service.category,
    ministry: service.ministry,
    ministryName: service.ministryName,
    amount: subType.fee,
    currency: 'SAR',
    status,
    issueDate,
    dueDate,
    paymentDate,
    paidWith,
    referenceNumber: generateBillReferenceNumber(serviceType),
    description: subType.description,
    additionalInfo,
    penaltyInfo
  };
};

/**
 * Auto-generate bills for a user based on government services
 * Simulates receiving bills from government APIs
 * @param {string} userId - User ID
 * @param {string} walletId - Wallet ID
 * @param {boolean} isBusiness - Is business wallet
 * @param {Object} options - Generation options { count?, serviceTypes?, statuses? }
 * @returns {Promise<Array<Object>>} Generated bills
 */
export const autoGenerateBills = async (userId, walletId, isBusiness, options = {}) => {
  try {
    const {
      count = 5,
      serviceTypes = null,
      statuses = ['unpaid', 'paid', 'overdue', 'upcoming']
    } = options;

    // Get available services for this user type
    const userType = isBusiness ? 'business' : 'personal';
    const availableServices = getServicesForUserType(userType);

    // Get service type keys
    let serviceTypeKeys = serviceTypes || Object.keys(availableServices);

    const generatedBills = [];

    for (let i = 0; i < count; i++) {
      // Pick random service type
      const serviceType = serviceTypeKeys[Math.floor(Math.random() * serviceTypeKeys.length)];

      // Pick random status
      const status = statuses[Math.floor(Math.random() * statuses.length)];

      // Generate bill
      const billData = generateRandomBill(userId, walletId, isBusiness, serviceType, status);

      // Create bill in Firebase
      const bill = await createBill(userId, billData);
      generatedBills.push(bill);
    }

    console.log(`✅ Auto-generated ${generatedBills.length} bills`);
    return generatedBills;
  } catch (error) {
    console.error('❌ Error auto-generating bills:', error);
    throw error;
  }
};

// ============================================================================
// BULK PAYMENT SUPPORT
// ============================================================================

/**
 * Validate bills for bulk payment
 * @param {Array<Object>} bills - Array of bill objects
 * @param {string} walletId - Wallet ID for payment
 * @returns {Object} { valid: boolean, errors: [], totalAmount: number }
 */
export const validateBulkPayment = (bills, walletId) => {
  const errors = [];
  let totalAmount = 0;

  bills.forEach((bill, index) => {
    // Check if bill belongs to the wallet
    if (bill.walletId !== walletId) {
      errors.push(`Bill ${index + 1} (${bill.id}) belongs to different wallet`);
    }

    // Check if bill is already paid
    if (bill.status === 'paid') {
      errors.push(`Bill ${index + 1} (${bill.id}) is already paid`);
    }

    // Check if bill is upcoming (can't pay before issue date)
    if (bill.status === 'upcoming') {
      errors.push(`Bill ${index + 1} (${bill.id}) is not yet issued`);
    }

    // Add to total (including penalties if any)
    const amount = bill.penaltyInfo?.totalWithPenalty || bill.amount;
    totalAmount += amount;
  });

  return {
    valid: errors.length === 0,
    errors,
    totalAmount: parseFloat(totalAmount.toFixed(2))
  };
};

/**
 * Process bulk bill payment
 * @param {string} userId - User ID
 * @param {Array<string>} billIds - Array of bill IDs to pay
 * @param {string} walletId - Wallet ID
 * @param {Object} paymentDetails - Payment method details
 * @returns {Promise<Object>} { success: true, updatedBills: [], totalAmount: number, transactionId: string }
 */
export const processBulkBillPayment = async (userId, billIds, walletId, paymentDetails = {}) => {
  try {
    // Fetch all bills
    const bills = [];
    for (const billId of billIds) {
      const bill = await getBillById(userId, billId);
      if (bill) {
        bills.push(bill);
      }
    }

    // Validate bulk payment
    const validation = validateBulkPayment(bills, walletId);
    if (!validation.valid) {
      throw new Error(`Bulk payment validation failed: ${validation.errors.join(', ')}`);
    }

    // Generate single transaction ID for bulk payment
    const transactionId = `bulk_payment_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    const paymentDate = Date.now();

    // Update all bills to paid status
    const updatedBills = [];
    for (const bill of bills) {
      await markBillAsPaid(userId, bill.id, transactionId);

      // Get updated bill
      const updatedBill = await getBillById(userId, bill.id);
      updatedBills.push(updatedBill);
    }

    console.log(`✅ Bulk payment processed: ${bills.length} bills, total: ${validation.totalAmount} SAR`);

    return {
      success: true,
      updatedBills,
      totalAmount: validation.totalAmount,
      transactionId,
      paymentDate,
      billCount: bills.length,
      paymentDetails
    };
  } catch (error) {
    console.error('❌ Error processing bulk bill payment:', error);
    throw error;
  }
};

// ============================================================================
// EXPORTS
// ============================================================================

export default {
  // Utility functions
  sanitizeBillData,
  generateBillReferenceNumber,
  isBillOverdue,
  getDaysUntilDue,
  calculatePenalty,
  calculateBulkTotal,

  // CREATE
  createBill,
  createBulkBills,

  // READ
  getUserBills,
  getWalletBills,
  getBillById,
  getBillsByStatus,
  getBillsByServiceType,
  getBillsByMinistry,
  getUpcomingBills,
  getOverdueBills,
  searchBills,
  getBillStats,
  getPersonalWalletBills,
  getBusinessWalletBills,
  fetchAllUserBills,

  // UPDATE
  updateBillStatus,
  markBillAsPaid,
  updateBillAmount,
  updateBill,

  // DELETE
  deleteBill,
  deleteBulkBills,

  // AUTO-GENERATION
  generateRandomBill,
  autoGenerateBills,

  // BULK PAYMENT
  validateBulkPayment,
  processBulkBillPayment
};
