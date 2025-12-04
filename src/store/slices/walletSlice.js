import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  personalWallet: null,
  businessWallet: null,
  loading: false,
  error: null,
  walletsInitialized: false,
};

const walletSlice = createSlice({
  name: "wallet",
  initialState,
  reducers: {
    // Set both wallets at once
    setWallets: (state, action) => {
      state.personalWallet = action.payload.personal;
      state.businessWallet = action.payload.business;
      state.walletsInitialized = true;
      state.error = null;
    },

    // Set personal wallet
    setPersonalWallet: (state, action) => {
      state.personalWallet = action.payload;
      state.error = null;
      // Only mark as initialized if business wallet is not expected
      if (!state.businessWallet) {
        state.walletsInitialized = true;
      }
    },

    // Set business wallet
    setBusinessWallet: (state, action) => {
      state.businessWallet = action.payload;
      state.walletsInitialized = true;
      state.error = null;
    },

    // Update personal wallet balance
    updatePersonalWalletBalance: (state, action) => {
      if (state.personalWallet) {
        state.personalWallet.balance = action.payload;
        state.personalWallet.updatedAt = Date.now();
      }
    },

    // Update business wallet balance
    updateBusinessWalletBalance: (state, action) => {
      if (state.businessWallet) {
        state.businessWallet.balance = action.payload;
        state.businessWallet.updatedAt = Date.now();
      }
    },

    // Clear all wallets (for logout)
    clearWallets: (state) => {
      state.personalWallet = null;
      state.businessWallet = null;
      state.loading = false;
      state.error = null;
      state.walletsInitialized = false;
    },

    // Set loading state
    setLoading: (state, action) => {
      state.loading = action.payload;
    },

    // Set error
    setError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },

    // Clear error
    clearError: (state) => {
      state.error = null;
    },
  },
});

// Export actions
export const {
  setWallets,
  setPersonalWallet,
  setBusinessWallet,
  updatePersonalWalletBalance,
  updateBusinessWalletBalance,
  clearWallets,
  setLoading,
  setError,
  clearError,
} = walletSlice.actions;

// Selectors
export const selectPersonalWallet = (state) => state.wallet.personalWallet;
export const selectBusinessWallet = (state) => state.wallet.businessWallet;
export const selectWalletsLoading = (state) => state.wallet.loading;
export const selectWalletsError = (state) => state.wallet.error;
export const selectWalletsInitialized = (state) =>
  state.wallet.walletsInitialized;

// Computed selectors
export const selectHasPersonalWallet = (state) =>
  !!state.wallet.personalWallet;
export const selectHasBusinessWallet = (state) =>
  !!state.wallet.businessWallet;
export const selectTotalBalance = (state) => {
  const personal = state.wallet.personalWallet?.balance || 0;
  const business = state.wallet.businessWallet?.balance || 0;
  return personal + business;
};

// Export reducer
export default walletSlice.reducer;
