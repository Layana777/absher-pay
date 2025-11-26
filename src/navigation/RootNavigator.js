import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
// import { BusinessNavigator } from '../business/navigation';
// import { SingleNavigator } from '../single/navigation';

const RootNavigator = () => {
  const [userType, setUserType] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkUserType();
  }, []);

  const checkUserType = async () => {
    try {
      const storedUserType = await AsyncStorage.getItem('userType');
      const token = await AsyncStorage.getItem('authToken');

      if (storedUserType && token) {
        setUserType(storedUserType);
      }
    } catch (error) {
      console.error('Error checking user type:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-background">
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  // TODO: Implement navigation based on user type
  // if (userType === 'business') {
  //   return <BusinessNavigator />;
  // }
  // return <SingleNavigator />;

  return (
    <View className="flex-1 justify-center items-center bg-background">
      <Text className="text-lg font-semibold text-text">
        App Ready - Add Navigation
      </Text>
    </View>
  );
};

export default RootNavigator;
