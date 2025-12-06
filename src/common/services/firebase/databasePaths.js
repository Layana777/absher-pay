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

  // Government Services
  GOVERNMENT_SERVICES: 'governmentServices',
  GOVERNMENT_SERVICE: (serviceId) => `governmentServices/${serviceId}`,
  GOVERNMENT_SERVICE_CATEGORY: (category) => `governmentServices/${category}`,
  GOVERNMENT_SERVICE_SUBTYPE: (serviceId, subTypeId) => `governmentServices/${serviceId}/subTypes/${subTypeId}`,

  // Government Bills
  GOVERNMENT_BILLS: 'governmentBills',
  USER_BILLS: (userId) => `governmentBills/${userId}`,
  BILL: (userId, billId) => `governmentBills/${userId}/${billId}`,
};
