import React, { useState, useEffect } from "react";
import { View, ActivityIndicator } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useDispatch, useSelector } from "react-redux";
import { setUser } from "../store/slices/userSlice";
import { setWallets } from "../store/slices/walletSlice";
import {
  selectIsAuthenticated,
  selectUserType,
} from "../store/slices/userSlice";
import { getUserByUid, getWalletsByUserId } from "../common/services";
import { AuthNavigator } from "../auth/navigation";
import { BusinessNavigator } from "../business/navigation";
// import { SingleNavigator } from '../single/navigation';

const RootNavigator = () => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);

  // Get auth state from Redux
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const userType = useSelector(selectUserType);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = await AsyncStorage.getItem("authToken");
      const storedUserType = await AsyncStorage.getItem("userType");

      if (token && storedUserType) {
        // Restore user data from AsyncStorage to Redux
        try {
          const userData = await getUserByUid(token);
          if (userData) {
            dispatch(
              setUser({
                user: { ...userData, uid: token }, // Add uid to user object
                authToken: token,
                userType: storedUserType,
              })
            );

            // Fetch and dispatch wallet data
            try {
              const wallets = await getWalletsByUserId(token);
              dispatch(setWallets(wallets));
              console.log("Wallets loaded on app start:", wallets);
            } catch (walletError) {
              console.error("Error fetching wallet data:", walletError);
              // Continue anyway - wallets will be created on next interaction
            }
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
          // If user data fetch fails, clear AsyncStorage
          await AsyncStorage.removeItem("authToken");
          await AsyncStorage.removeItem("userType");
        }
      }
    } catch (error) {
      console.error("Error checking auth status:", error);
    } finally {
      setLoading(false);
    }
  };

  const getNavigator = () => {
    if (!isAuthenticated) {
      return <AuthNavigator />;
    }

    switch (userType) {
      case "business":
        return <BusinessNavigator />;
      case "single":
        // return <SingleNavigator />;
        return <AuthNavigator />; // Temporary fallback until SingleNavigator is ready
      default:
        return <AuthNavigator />; // Fallback
    }
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-background">
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return getNavigator();
};

export default RootNavigator;
