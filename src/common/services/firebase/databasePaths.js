// Firebase Realtime Database paths constants
export const DB_PATHS = {
  // Authentication & Users
  USERS: 'users',
  USER: (uid) => `users/${uid}`,

  // Wallets
  WALLETS: 'wallets',
  WALLET: (walletId) => `wallets/${walletId}`,
  USER_WALLETS: (uid) => `users/${uid}/wallets`,

  // Transactions
  TRANSACTIONS: 'transactions',
  WALLET_TRANSACTIONS: (walletId) => `transactions/${walletId}`,
  TRANSACTION: (walletId, transactionId) => `transactions/${walletId}/${transactionId}`,
  USER_TRANSACTIONS: (userId) => `transactions/user/${userId}`,

  // Bank Accounts
  BANK_ACCOUNTS: 'bankAccounts',
  USER_BANK_ACCOUNTS: (userId) => `bankAccounts/${userId}`,
  BANK_ACCOUNT: (userId, accountId) => `bankAccounts/${userId}/${accountId}`,
};
