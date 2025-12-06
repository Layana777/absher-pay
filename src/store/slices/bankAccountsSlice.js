import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  accounts: [], // Array of bank accounts
  selectedAccount: null, // Currently selected account for transfers
};

const bankAccountsSlice = createSlice({
  name: "bankAccounts",
  initialState,
  reducers: {
    // Add a new bank account
    addBankAccount: (state, action) => {
      const newAccount = {
        id: `account_${Date.now()}`,
        ...action.payload,
        createdAt: Date.now(),
        isVerified: true, // Auto-verify for now
      };
      state.accounts.push(newAccount);

      // If this is the first account, set it as selected
      if (state.accounts.length === 1) {
        state.selectedAccount = newAccount;
      }
    },

    // Remove a bank account
    removeBankAccount: (state, action) => {
      const accountId = action.payload;
      state.accounts = state.accounts.filter(
        (account) => account.id !== accountId
      );

      // If the removed account was selected, select the first remaining account
      if (state.selectedAccount?.id === accountId) {
        state.selectedAccount = state.accounts.length > 0 ? state.accounts[0] : null;
      }
    },

    // Select an account for transfers
    selectBankAccount: (state, action) => {
      const accountId = action.payload;
      const account = state.accounts.find((acc) => acc.id === accountId);
      if (account) {
        state.selectedAccount = account;
      }
    },

    // Update bank account details
    updateBankAccount: (state, action) => {
      const { id, ...updates } = action.payload;
      const accountIndex = state.accounts.findIndex((acc) => acc.id === id);
      if (accountIndex !== -1) {
        state.accounts[accountIndex] = {
          ...state.accounts[accountIndex],
          ...updates,
          updatedAt: Date.now(),
        };

        // Update selected account if it's the one being updated
        if (state.selectedAccount?.id === id) {
          state.selectedAccount = state.accounts[accountIndex];
        }
      }
    },

    // Set bank accounts from Firebase
    setBankAccounts: (state, action) => {
      state.accounts = action.payload;

      // Set the first account with isSelected: true as selected, or first account if none selected
      const selectedAccount = state.accounts.find(acc => acc.isSelected) || state.accounts[0] || null;
      state.selectedAccount = selectedAccount;
    },

    // Clear all bank accounts
    clearBankAccounts: (state) => {
      state.accounts = [];
      state.selectedAccount = null;
    },
  },
});

export const {
  addBankAccount,
  removeBankAccount,
  selectBankAccount,
  updateBankAccount,
  setBankAccounts,
  clearBankAccounts,
} = bankAccountsSlice.actions;

// Selectors
export const selectAllBankAccounts = (state) => state.bankAccounts.accounts;
export const selectSelectedBankAccount = (state) => state.bankAccounts.selectedAccount;
export const selectBankAccountsCount = (state) => state.bankAccounts.accounts.length;
export const selectHasBankAccounts = (state) => state.bankAccounts.accounts.length > 0;

export default bankAccountsSlice.reducer;
