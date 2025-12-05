// Firebase Realtime Database paths constants
export const DB_PATHS = {
  // Authentication & Users
  USERS: 'users',
  USER: (uid) => `users/${uid}`,

  // Wallets
  WALLETS: 'wallets',
  WALLET: (walletId) => `wallets/${walletId}`,
  USER_WALLETS: (uid) => `users/${uid}/wallets`,
};
