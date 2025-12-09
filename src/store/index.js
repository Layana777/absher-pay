import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./slices/userSlice";
import walletReducer from "./slices/walletSlice";
import bankAccountsReducer from "./slices/bankAccountsSlice";
import tabBarReducer from "./slices/tabBarSlice";

export const store = configureStore({
  reducer: {
    user: userReducer,
    wallet: walletReducer,
    bankAccounts: bankAccountsReducer,
    tabBar: tabBarReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types if needed
        ignoredActions: [],
        // Ignore these field paths in all actions
        ignoredActionPaths: [],
        // Ignore these paths in the state
        ignoredPaths: [],
      },
    }),
});

// Export types for TypeScript (if you migrate to TypeScript later)
export const RootState = store.getState;
export const AppDispatch = store.dispatch;
