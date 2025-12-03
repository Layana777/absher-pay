import { useDispatch, useSelector } from 'react-redux';
import { selectUser, selectIsAuthenticated, selectUserLoading, selectUserError } from './slices/userSlice';

// Custom hooks for better TypeScript support (even in JavaScript, these are helpful)
export const useAppDispatch = () => useDispatch();
export const useAppSelector = useSelector;

// Convenience hooks for common selectors
export const useUser = () => useAppSelector(selectUser);
export const useIsAuthenticated = () => useAppSelector(selectIsAuthenticated);
export const useUserLoading = () => useAppSelector(selectUserLoading);
export const useUserError = () => useAppSelector(selectUserError);
