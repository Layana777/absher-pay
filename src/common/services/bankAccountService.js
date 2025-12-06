import { ref, set, get, update, remove, push } from "firebase/database";
import { database } from "./firebase";
import { DB_PATHS } from "./firebase/databasePaths";

/**
 * Generates unique bank account ID
 * @returns {string} Bank account ID
 */
const generateBankAccountId = () => {
  const timestamp = Date.now();
  const random = Math.floor(1000 + Math.random() * 9000);
  return `bank_${timestamp}_${random}`;
};

/**
 * Creates a new bank account in Firebase
 * @param {string} userId - User ID
 * @param {object} accountData - Bank account data
 * @returns {Promise<object>} Created bank account with ID
 */
export const createBankAccount = async (userId, accountData) => {
  try {
    const accountId = generateBankAccountId();
    const timestamp = Date.now();

    const bankAccount = {
      id: accountId,
      userId,
      ...accountData,
      createdAt: timestamp,
      updatedAt: timestamp,
      isVerified: accountData.isVerified || false,
    };

    // Write bank account to database
    const accountRef = ref(database, DB_PATHS.BANK_ACCOUNT(userId, accountId));
    await set(accountRef, bankAccount);

    console.log("Bank account created successfully:", accountId);
    return { success: true, data: bankAccount };
  } catch (error) {
    console.error("Error creating bank account:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Gets all bank accounts for a user
 * @param {string} userId - User ID
 * @returns {Promise<object>} Array of bank accounts
 */
export const getBankAccountsByUserId = async (userId) => {
  try {
    const accountsRef = ref(database, DB_PATHS.USER_BANK_ACCOUNTS(userId));
    const snapshot = await get(accountsRef);

    if (snapshot.exists()) {
      const accountsObj = snapshot.val();
      const accounts = Object.values(accountsObj);

      // Sort by createdAt descending (newest first)
      accounts.sort((a, b) => b.createdAt - a.createdAt);

      return { success: true, data: accounts };
    }

    return { success: true, data: [] };
  } catch (error) {
    console.error("Error getting bank accounts:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Gets a single bank account by ID
 * @param {string} userId - User ID
 * @param {string} accountId - Bank account ID
 * @returns {Promise<object>} Bank account data
 */
export const getBankAccountById = async (userId, accountId) => {
  try {
    const accountRef = ref(database, DB_PATHS.BANK_ACCOUNT(userId, accountId));
    const snapshot = await get(accountRef);

    if (snapshot.exists()) {
      return { success: true, data: snapshot.val() };
    }

    return { success: false, error: "Bank account not found" };
  } catch (error) {
    console.error("Error getting bank account:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Updates a bank account
 * @param {string} userId - User ID
 * @param {string} accountId - Bank account ID
 * @param {object} updates - Fields to update
 * @returns {Promise<object>} Update result
 */
export const updateBankAccount = async (userId, accountId, updates) => {
  try {
    const accountRef = ref(database, DB_PATHS.BANK_ACCOUNT(userId, accountId));

    const updateData = {
      ...updates,
      updatedAt: Date.now(),
    };

    await update(accountRef, updateData);

    console.log("Bank account updated successfully:", accountId);
    return { success: true, data: { accountId, ...updateData } };
  } catch (error) {
    console.error("Error updating bank account:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Deletes a bank account
 * @param {string} userId - User ID
 * @param {string} accountId - Bank account ID
 * @returns {Promise<object>} Delete result
 */
export const deleteBankAccount = async (userId, accountId) => {
  try {
    const accountRef = ref(database, DB_PATHS.BANK_ACCOUNT(userId, accountId));
    await remove(accountRef);

    console.log("Bank account deleted successfully:", accountId);
    return { success: true, data: { accountId } };
  } catch (error) {
    console.error("Error deleting bank account:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Sets a bank account as selected/default
 * @param {string} userId - User ID
 * @param {string} accountId - Bank account ID to set as selected
 * @returns {Promise<object>} Update result
 */
export const setSelectedBankAccount = async (userId, accountId) => {
  try {
    // Get all accounts
    const result = await getBankAccountsByUserId(userId);

    if (!result.success) {
      return result;
    }

    const accounts = result.data;

    // Update all accounts: set isSelected to false except for the selected one
    const updatePromises = accounts.map((account) => {
      const isSelected = account.id === accountId;
      return updateBankAccount(userId, account.id, { isSelected });
    });

    await Promise.all(updatePromises);

    console.log("Selected bank account updated:", accountId);
    return { success: true, data: { selectedAccountId: accountId } };
  } catch (error) {
    console.error("Error setting selected bank account:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Verifies a bank account
 * @param {string} userId - User ID
 * @param {string} accountId - Bank account ID
 * @returns {Promise<object>} Update result
 */
export const verifyBankAccount = async (userId, accountId) => {
  try {
    await updateBankAccount(userId, accountId, { isVerified: true });

    console.log("Bank account verified:", accountId);
    return { success: true, data: { accountId, isVerified: true } };
  } catch (error) {
    console.error("Error verifying bank account:", error);
    return { success: false, error: error.message };
  }
};
