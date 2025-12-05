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
};
