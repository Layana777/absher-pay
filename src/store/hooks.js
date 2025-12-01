import { useDispatch, useSelector } from 'react-redux';

// Custom hooks for better TypeScript support (even in JavaScript, these are helpful)
export const useAppDispatch = () => useDispatch();
export const useAppSelector = useSelector;
