// Firebase Realtime Database paths constants
export const DB_PATHS = {
  // Authentication & Users
  USERS: 'users',
  USER: (uid) => `users/${uid}`,
  USER_PROFILE: (uid) => `users/${uid}/profile`,

  // Business paths
  BUSINESS: {
    ORDERS: 'business/orders',
    ORDER: (orderId) => `business/orders/${orderId}`,
    ORDER_STATUS: (orderId) => `business/orders/${orderId}/status`,
    PRODUCTS: 'business/products',
    PRODUCT: (productId) => `business/products/${productId}`,
    INVENTORY: 'business/inventory',
    INVENTORY_ITEM: (itemId) => `business/inventory/${itemId}`,
    ANALYTICS: 'business/analytics',
    STATS: 'business/stats',
  },

  // Customer paths
  CUSTOMER: {
    PRODUCTS: 'products',
    PRODUCT: (productId) => `products/${productId}`,
    CATEGORIES: 'categories',
    CART: (userId) => `carts/${userId}`,
    CART_ITEM: (userId, itemId) => `carts/${userId}/${itemId}`,
    WISHLIST: (userId) => `wishlists/${userId}`,
    WISHLIST_ITEM: (userId, productId) => `wishlists/${userId}/${productId}`,
    ORDERS: (userId) => `orders/${userId}`,
    ORDER: (userId, orderId) => `orders/${userId}/${orderId}`,
  },

  // Shared
  NOTIFICATIONS: (userId) => `notifications/${userId}`,
  NOTIFICATION: (userId, notificationId) => `notifications/${userId}/${notificationId}`,
};
