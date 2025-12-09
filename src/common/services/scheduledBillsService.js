/**
 * Scheduled Bills Service
 *
 * Provides CRUD operations for scheduled bill payments, including:
 * - Creating and managing scheduled payments
 * - Processing scheduled bills on due date
 * - Cancelling and updating schedules
 * - Querying scheduled bills by various criteria
 */

import { database } from './firebase';
import { ref, set, get, update, remove } from 'firebase/database';
import { DB_PATHS } from './firebase/databasePaths';
import { getBillById, markBillAsPaid } from './billsService';
import { getWalletById, updateWalletBalance } from './walletService';

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Convert date to start of day timestamp (midnight)
 * @param {Date|string|number} date - Date to convert
 * @returns {number} Timestamp at midnight (00:00:00)
 */
export const getDateOnlyTimestamp = (date) => {
  console.log("📅 getDateOnlyTimestamp input:", date);
  console.log("📅 Input type:", typeof date);
  const dateObj = new Date(date);
  console.log("📅 After new Date():", dateObj);
  console.log("📅 Date ISO:", dateObj.toISOString());
  dateObj.setHours(0, 0, 0, 0);
  console.log("📅 After setHours(0,0,0,0):", dateObj.toISOString());
  const timestamp = dateObj.getTime();
  console.log("📅 Final timestamp:", timestamp);
  return timestamp;
};

/**
 * Sanitize scheduled bill data - remove undefined and null values
 * @param {Object} data - Raw scheduled bill data
 * @returns {Object} Sanitized data
 */
export const sanitizeScheduledBillData = (data) => {
  const sanitized = {};
  Object.keys(data).forEach((key) => {
    if (data[key] !== undefined && data[key] !== null) {
      sanitized[key] = data[key];
    }
  });
  return sanitized;
};

/**
 * Check if scheduled bill is due
 * @param {Object} scheduledBill - Scheduled bill object
 * @returns {boolean} True if due
 */
export const isScheduledBillDue = (scheduledBill) => {
  if (scheduledBill.status !== 'scheduled') return false;
  // Compare date only (midnight to midnight)
  const todayMidnight = getDateOnlyTimestamp(new Date());
  return scheduledBill.scheduledDate <= todayMidnight;
};

/**
 * Calculate days until scheduled date
 * @param {Object} scheduledBill - Scheduled bill object
 * @returns {number} Days until scheduled (negative if past due)
 */
export const getDaysUntilScheduled = (scheduledBill) => {
  const now = Date.now();
  const diffMs = scheduledBill.scheduledDate - now;
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
};

// ============================================================================
// CREATE OPERATIONS
// ============================================================================

/**
 * Create a new scheduled bill
 * @param {string} userId - User ID
 * @param {Object} scheduledBillData - Scheduled bill data
 * @returns {Promise<Object>} Created scheduled bill with ID
 */
export const createScheduledBill = async (userId, scheduledBillData) => {
  try {
    // Generate scheduled bill ID
    const scheduledBillId = `scheduled_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    // Prepare scheduled bill object with metadata
    const now = Date.now();
    const scheduledBill = sanitizeScheduledBillData({
      id: scheduledBillId,
      userId,
      ...scheduledBillData,
      status: 'scheduled',
      completedAt: null,
      completedTransactionId: null,
      createdAt: now,
      updatedAt: now
    });

    // Save to Firebase
    const scheduledBillRef = ref(database, DB_PATHS.SCHEDULED_BILL(userId, scheduledBillId));
    await set(scheduledBillRef, scheduledBill);

    console.log(`✅ Scheduled bill created: ${scheduledBillId}`);
    return scheduledBill;
  } catch (error) {
    console.error('❌ Error creating scheduled bill:', error);
    throw error;
  }
};

// ============================================================================
// READ OPERATIONS
// ============================================================================

/**
 * Get all scheduled bills for a user
 * @param {string} userId - User ID
 * @param {Object} options - Query options { status?, limit? }
 * @returns {Promise<Array<Object>>} Array of scheduled bills
 */
export const getUserScheduledBills = async (userId, options = {}) => {
  try {
    const scheduledBillsRef = ref(database, DB_PATHS.USER_SCHEDULED_BILLS(userId));
    const snapshot = await get(scheduledBillsRef);

    if (!snapshot.exists()) {
      return [];
    }

    const scheduledBillsData = snapshot.val();
    let scheduledBills = Object.values(scheduledBillsData);

    // Filter by status if specified
    if (options.status) {
      scheduledBills = scheduledBills.filter(sb => sb.status === options.status);
    }

    // Sort by scheduled date (earliest first)
    scheduledBills.sort((a, b) => a.scheduledDate - b.scheduledDate);

    // Apply limit if specified
    if (options.limit) {
      scheduledBills = scheduledBills.slice(0, options.limit);
    }

    return scheduledBills;
  } catch (error) {
    console.error('❌ Error fetching user scheduled bills:', error);
    throw error;
  }
};

/**
 * Get scheduled bills for a specific wallet
 * @param {string} userId - User ID
 * @param {string} walletId - Wallet ID
 * @param {Object} options - Query options { status?, limit? }
 * @returns {Promise<Array<Object>>} Array of scheduled bills
 */
export const getWalletScheduledBills = async (userId, walletId, options = {}) => {
  try {
    const allScheduledBills = await getUserScheduledBills(userId, {});

    // Filter by wallet ID
    let scheduledBills = allScheduledBills.filter(sb => sb.walletId === walletId);

    // Filter by status if specified
    if (options.status) {
      scheduledBills = scheduledBills.filter(sb => sb.status === options.status);
    }

    // Apply limit if specified
    if (options.limit) {
      scheduledBills = scheduledBills.slice(0, options.limit);
    }

    return scheduledBills;
  } catch (error) {
    console.error('❌ Error fetching wallet scheduled bills:', error);
    throw error;
  }
};

/**
 * Get a specific scheduled bill by ID
 * @param {string} userId - User ID
 * @param {string} scheduledBillId - Scheduled bill ID
 * @returns {Promise<Object|null>} Scheduled bill object or null
 */
export const getScheduledBillById = async (userId, scheduledBillId) => {
  try {
    const scheduledBillRef = ref(database, DB_PATHS.SCHEDULED_BILL(userId, scheduledBillId));
    const snapshot = await get(scheduledBillRef);

    if (!snapshot.exists()) {
      return null;
    }

    return snapshot.val();
  } catch (error) {
    console.error('❌ Error fetching scheduled bill by ID:', error);
    throw error;
  }
};

/**
 * Get scheduled bills by status
 * @param {string} userId - User ID
 * @param {string} status - Status (scheduled, completed, cancelled, failed)
 * @param {number} limit - Max results
 * @returns {Promise<Array<Object>>} Array of scheduled bills
 */
export const getScheduledBillsByStatus = async (userId, status, limit = 50) => {
  return await getUserScheduledBills(userId, { status, limit });
};

/**
 * Get scheduled bills for a specific bill
 * @param {string} userId - User ID
 * @param {string} billId - Original bill ID
 * @returns {Promise<Array<Object>>} Array of scheduled bills for this bill
 */
export const getScheduledBillsByBillId = async (userId, billId) => {
  try {
    const allScheduledBills = await getUserScheduledBills(userId, {});
    return allScheduledBills.filter(sb => sb.billId === billId);
  } catch (error) {
    console.error('❌ Error fetching scheduled bills by bill ID:', error);
    throw error;
  }
};

/**
 * Get upcoming scheduled bills (due within next N days)
 * @param {string} userId - User ID
 * @param {number} days - Number of days to look ahead
 * @returns {Promise<Array<Object>>} Array of upcoming scheduled bills
 */
export const getUpcomingScheduledBills = async (userId, days = 7) => {
  try {
    const allScheduledBills = await getUserScheduledBills(userId, { status: 'scheduled' });
    const todayMidnight = getDateOnlyTimestamp(new Date());
    const futureDate = todayMidnight + (days * 24 * 60 * 60 * 1000);

    const upcomingScheduledBills = allScheduledBills.filter(sb => {
      return sb.scheduledDate >= todayMidnight && sb.scheduledDate <= futureDate;
    });

    return upcomingScheduledBills;
  } catch (error) {
    console.error('❌ Error fetching upcoming scheduled bills:', error);
    throw error;
  }
};

/**
 * Get overdue scheduled bills (scheduled date has passed but not completed)
 * @param {string} userId - User ID
 * @returns {Promise<Array<Object>>} Array of overdue scheduled bills
 */
export const getOverdueScheduledBills = async (userId) => {
  try {
    const allScheduledBills = await getUserScheduledBills(userId, { status: 'scheduled' });
    const todayMidnight = getDateOnlyTimestamp(new Date());

    const overdueScheduledBills = allScheduledBills.filter(sb => {
      return sb.scheduledDate < todayMidnight;
    });

    return overdueScheduledBills;
  } catch (error) {
    console.error('❌ Error fetching overdue scheduled bills:', error);
    throw error;
  }
};

/**
 * Get scheduled bill statistics
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Statistics object
 */
export const getScheduledBillStats = async (userId) => {
  try {
    const allScheduledBills = await getUserScheduledBills(userId, {});

    const stats = {
      totalScheduled: 0,
      totalPaid: 0,
      totalCancelled: 0,
      totalFailed: 0,
      totalScheduledAmount: 0,
      totalPaidAmount: 0,
      upcomingCount: 0,
      overdueCount: 0,
      byStatus: {
        scheduled: 0,
        paid: 0,
        cancelled: 0,
        failed: 0
      }
    };

    const todayMidnight = getDateOnlyTimestamp(new Date());

    allScheduledBills.forEach(sb => {
      // Count by status
      if (sb.status) {
        stats.byStatus[sb.status] = (stats.byStatus[sb.status] || 0) + 1;
      }

      // Calculate amounts
      if (sb.status === 'scheduled') {
        stats.totalScheduled++;
        stats.totalScheduledAmount += sb.scheduledAmount;

        // Check if upcoming or overdue
        if (sb.scheduledDate >= todayMidnight) {
          stats.upcomingCount++;
        } else {
          stats.overdueCount++;
        }
      } else if (sb.status === 'paid') {
        stats.totalPaid++;
        stats.totalPaidAmount += sb.scheduledAmount;
      } else if (sb.status === 'cancelled') {
        stats.totalCancelled++;
      } else if (sb.status === 'failed') {
        stats.totalFailed++;
      }
    });

    // Round amounts to 2 decimal places
    stats.totalScheduledAmount = parseFloat(stats.totalScheduledAmount.toFixed(2));
    stats.totalPaidAmount = parseFloat(stats.totalPaidAmount.toFixed(2));

    return stats;
  } catch (error) {
    console.error('❌ Error calculating scheduled bill stats:', error);
    throw error;
  }
};

// ============================================================================
// UPDATE OPERATIONS
// ============================================================================

/**
 * Update scheduled bill status
 * @param {string} userId - User ID
 * @param {string} scheduledBillId - Scheduled bill ID
 * @param {string} status - New status
 * @param {Object} additionalData - Additional data to update
 * @returns {Promise<boolean>} Success status
 */
export const updateScheduledBillStatus = async (userId, scheduledBillId, status, additionalData = {}) => {
  try {
    const scheduledBillRef = ref(database, DB_PATHS.SCHEDULED_BILL(userId, scheduledBillId));

    const updates = {
      status,
      updatedAt: Date.now(),
      ...additionalData
    };

    await update(scheduledBillRef, sanitizeScheduledBillData(updates));
    console.log(`✅ Scheduled bill ${scheduledBillId} status updated to ${status}`);
    return true;
  } catch (error) {
    console.error('❌ Error updating scheduled bill status:', error);
    throw error;
  }
};

/**
 * Cancel a scheduled bill
 * @param {string} userId - User ID
 * @param {string} scheduledBillId - Scheduled bill ID
 * @returns {Promise<boolean>} Success status
 */
export const cancelScheduledBill = async (userId, scheduledBillId) => {
  return await updateScheduledBillStatus(userId, scheduledBillId, 'cancelled');
};

/**
 * Update scheduled date
 * @param {string} userId - User ID
 * @param {string} scheduledBillId - Scheduled bill ID
 * @param {number} newScheduledDate - New scheduled date timestamp
 * @returns {Promise<boolean>} Success status
 */
export const updateScheduledDate = async (userId, scheduledBillId, newScheduledDate) => {
  try {
    const scheduledBillRef = ref(database, DB_PATHS.SCHEDULED_BILL(userId, scheduledBillId));

    const updates = {
      scheduledDate: newScheduledDate,
      updatedAt: Date.now()
    };

    await update(scheduledBillRef, updates);
    console.log(`✅ Scheduled bill ${scheduledBillId} date updated`);
    return true;
  } catch (error) {
    console.error('❌ Error updating scheduled date:', error);
    throw error;
  }
};

// ============================================================================
// DELETE OPERATIONS
// ============================================================================

/**
 * Delete a scheduled bill
 * @param {string} userId - User ID
 * @param {string} scheduledBillId - Scheduled bill ID
 * @returns {Promise<boolean>} Success status
 */
export const deleteScheduledBill = async (userId, scheduledBillId) => {
  try {
    const scheduledBillRef = ref(database, DB_PATHS.SCHEDULED_BILL(userId, scheduledBillId));
    await remove(scheduledBillRef);
    console.log(`✅ Scheduled bill ${scheduledBillId} deleted`);
    return true;
  } catch (error) {
    console.error('❌ Error deleting scheduled bill:', error);
    throw error;
  }
};

// ============================================================================
// PROCESSING OPERATIONS
// ============================================================================

/**
 * Process a scheduled bill (execute the payment)
 * @param {string} userId - User ID
 * @param {string} scheduledBillId - Scheduled bill ID
 * @returns {Promise<Object>} Processing result
 */
export const processScheduledBill = async (userId, scheduledBillId) => {
  try {
    // Get scheduled bill
    const scheduledBill = await getScheduledBillById(userId, scheduledBillId);
    if (!scheduledBill) {
      throw new Error('Scheduled bill not found');
    }

    // Check if already processed
    if (scheduledBill.status !== 'scheduled') {
      throw new Error(`Scheduled bill already ${scheduledBill.status}`);
    }

    // Get the original bill
    const bill = await getBillById(userId, scheduledBill.billId);
    if (!bill) {
      throw new Error('Original bill not found');
    }

    // Check if bill is already paid
    if (bill.status === 'paid') {
      await updateScheduledBillStatus(userId, scheduledBillId, 'failed', {
        failureReason: 'Bill already paid'
      });
      return {
        success: false,
        error: 'Bill already paid'
      };
    }

    // Get wallet
    const wallet = await getWalletById(scheduledBill.walletId);
    if (!wallet) {
      throw new Error('Wallet not found');
    }

    // Check sufficient balance
    const amount = scheduledBill.scheduledAmount;
    if (wallet.balance < amount) {
      await updateScheduledBillStatus(userId, scheduledBillId, 'failed', {
        failureReason: 'Insufficient balance'
      });
      return {
        success: false,
        error: 'Insufficient balance'
      };
    }

    // Create transaction ID
    const transactionId = `scheduled_payment_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    // Update wallet balance
    const newBalance = wallet.balance - amount;
    await updateWalletBalance(scheduledBill.walletId, newBalance);

    // Mark bill as paid
    await markBillAsPaid(userId, scheduledBill.billId, transactionId);

    // Update scheduled bill as paid
    await updateScheduledBillStatus(userId, scheduledBillId, 'paid', {
      completedAt: Date.now(),
      completedTransactionId: transactionId
    });

    console.log(`✅ Scheduled bill ${scheduledBillId} processed successfully`);
    return {
      success: true,
      transactionId,
      scheduledBillId,
      billId: scheduledBill.billId,
      amount
    };
  } catch (error) {
    console.error('❌ Error processing scheduled bill:', error);

    // Mark as failed
    try {
      await updateScheduledBillStatus(userId, scheduledBillId, 'failed', {
        failureReason: error.message
      });
    } catch (updateError) {
      console.error('❌ Error updating failed status:', updateError);
    }

    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Process all due scheduled bills for a user
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Processing results
 */
export const processAllDueScheduledBills = async (userId) => {
  try {
    const overdueScheduledBills = await getOverdueScheduledBills(userId);

    const results = {
      processed: 0,
      failed: 0,
      total: overdueScheduledBills.length,
      details: []
    };

    for (const scheduledBill of overdueScheduledBills) {
      const result = await processScheduledBill(userId, scheduledBill.id);

      if (result.success) {
        results.processed++;
      } else {
        results.failed++;
      }

      results.details.push({
        scheduledBillId: scheduledBill.id,
        billId: scheduledBill.billId,
        ...result
      });
    }

    console.log(`✅ Processed ${results.processed}/${results.total} scheduled bills`);
    return results;
  } catch (error) {
    console.error('❌ Error processing all due scheduled bills:', error);
    throw error;
  }
};

// ============================================================================
// EXPORTS
// ============================================================================

export default {
  // Utility functions
  sanitizeScheduledBillData,
  getDateOnlyTimestamp,
  isScheduledBillDue,
  getDaysUntilScheduled,

  // CREATE
  createScheduledBill,

  // READ
  getUserScheduledBills,
  getWalletScheduledBills,
  getScheduledBillById,
  getScheduledBillsByStatus,
  getScheduledBillsByBillId,
  getUpcomingScheduledBills,
  getOverdueScheduledBills,
  getScheduledBillStats,

  // UPDATE
  updateScheduledBillStatus,
  cancelScheduledBill,
  updateScheduledDate,

  // DELETE
  deleteScheduledBill,

  // PROCESSING
  processScheduledBill,
  processAllDueScheduledBills
};
