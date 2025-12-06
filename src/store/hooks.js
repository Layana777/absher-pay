import { useDispatch, useSelector } from 'react-redux';
import { selectUser, selectIsAuthenticated, selectUserLoading, selectUserError } from './slices/userSlice';
import {
  selectPersonalWallet,
  selectBusinessWallet,
  selectWalletsLoading,
  selectWalletsError,
  selectWalletsInitialized,
  selectTotalBalance
} from './slices/walletSlice';
import {
  selectAllBankAccounts,
  selectSelectedBankAccount,
  selectBankAccountsCount,
  selectHasBankAccounts,
  setBankAccounts
} from './slices/bankAccountsSlice';

// Custom hooks for better TypeScript support (even in JavaScript, these are helpful)
export const useAppDispatch = () => useDispatch();
export const useAppSelector = useSelector;

// User hooks
export const useUser = () => useAppSelector(selectUser);
export const useIsAuthenticated = () => useAppSelector(selectIsAuthenticated);
export const useUserLoading = () => useAppSelector(selectUserLoading);
export const useUserError = () => useAppSelector(selectUserError);

// Wallet hooks
export const usePersonalWallet = () => useAppSelector(selectPersonalWallet);
export const useBusinessWallet = () => useAppSelector(selectBusinessWallet);
export const useWalletsLoading = () => useAppSelector(selectWalletsLoading);
export const useWalletsError = () => useAppSelector(selectWalletsError);
export const useWalletsInitialized = () => useAppSelector(selectWalletsInitialized);
export const useTotalBalance = () => useAppSelector(selectTotalBalance);

// Bank Accounts hooks
export const useBankAccounts = () => useAppSelector(selectAllBankAccounts);
export const useSelectedBankAccount = () => useAppSelector(selectSelectedBankAccount);
export const useBankAccountsCount = () => useAppSelector(selectBankAccountsCount);
export const useHasBankAccounts = () => useAppSelector(selectHasBankAccounts);
