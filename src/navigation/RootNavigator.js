import React, { useState, useEffect } from "react";
import { View, ActivityIndicator } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AuthNavigator } from "../auth/navigation";
// import { BusinessNavigator } from '../business/navigation';
// import { SingleNavigator } from '../single/navigation';

const RootNavigator = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userType, setUserType] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = await AsyncStorage.getItem("authToken");
      const storedUserType = await AsyncStorage.getItem("userType");

      if (token && storedUserType) {
        setIsAuthenticated(true);
        setUserType(storedUserType);
      } else {
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error("Error checking auth status:", error);
      setIsAuthenticated(false);
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
        // return <BusinessNavigator />;
        return <AuthNavigator />; // Temporary fallback until BusinessNavigator is ready
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
