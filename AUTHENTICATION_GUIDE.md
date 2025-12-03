# Authentication Flow Guide

## Overview
This guide explains the complete authentication flow and how to access user data from Redux throughout your application.

## Authentication Flow

### 1. Login Process
1. User selects "Business" user type
2. User enters credentials on `BusinessLoginScreen`
3. On successful validation, navigate to `OtpBusinessScreen` with uid
4. User enters 4-digit OTP
5. System verifies OTP and fetches full user data
6. Auth data stored in both Redux and AsyncStorage
7. RootNavigator automatically switches to `BusinessNavigator`
8. User sees `BusinessHomeScreen`

### 2. Persistent Login
On app restart:
1. `RootNavigator` checks AsyncStorage for authToken and userType
2. If found, fetches user data using `getUserByUid(authToken)`
3. Restores full auth state to Redux
4. User automatically logged in to `BusinessNavigator`

## Accessing User Data

### Using Redux Hooks

Import the convenience hooks from the store:

```javascript
import { useUser, useIsAuthenticated } from '../../../store/hooks';

const MyComponent = () => {
  const user = useUser();
  const isAuthenticated = useIsAuthenticated();

  return (
    <View>
      <Text>Welcome, {user?.firstName} {user?.lastName}</Text>
      <Text>Business: {user?.businessName}</Text>
      <Text>Balance: {user?.balance}</Text>
    </View>
  );
};
```

### Available Hooks

```javascript
import {
  useUser,              // Get full user object
  useIsAuthenticated,   // Get authentication status
  useUserLoading,       // Get loading state
  useUserError,         // Get error state
} from '../store/hooks';
```

### Using Redux Selectors

For more control, use selectors directly:

```javascript
import { useSelector } from 'react-redux';
import {
  selectUser,
  selectAuthToken,
  selectUserType,
  selectIsAuthenticated
} from '../store/slices/userSlice';

const MyComponent = () => {
  const user = useSelector(selectUser);
  const authToken = useSelector(selectAuthToken);
  const userType = useSelector(selectUserType);
  const isAuthenticated = useSelector(selectIsAuthenticated);

  // Your component logic
};
```

## Redux State Structure

```javascript
{
  user: {
    user: {
      uid: "user123",
      firstName: "محمد",
      lastName: "أحمد",
      nationalId: "1234567890",
      phoneNumber: "+966501234567",
      businessName: "مؤسسة النجاح التجارية",
      crNumber: "1010567890",
      balance: "45230",
      // ... other user fields
    },
    authToken: "user123",  // uid used as token
    userType: "business",   // "business" or "single"
    isAuthenticated: true,
    loading: false,
    error: null
  }
}
```

## Updating User Data

### Update Full User
```javascript
import { useDispatch } from 'react-redux';
import { setUser } from '../store/slices/userSlice';

const dispatch = useDispatch();
dispatch(setUser({
  user: updatedUserData,
  authToken: "token123",
  userType: "business"
}));
```

### Update Partial User Data
```javascript
import { updateUser } from '../store/slices/userSlice';

dispatch(updateUser({
  balance: "50000",
  // Only fields that changed
}));
```

## Logout Implementation

To implement logout functionality:

```javascript
import { useDispatch } from 'react-redux';
import { clearUser } from '../store/slices/userSlice';
import AsyncStorage from '@react-native-async-storage/async-storage';

const handleLogout = async () => {
  try {
    // Clear Redux state
    dispatch(clearUser());

    // Clear AsyncStorage
    await AsyncStorage.removeItem('authToken');
    await AsyncStorage.removeItem('userType');

    // RootNavigator will automatically show AuthNavigator
  } catch (error) {
    console.error('Logout error:', error);
  }
};
```

## Example: Settings Screen with User Data

```javascript
import React from 'react';
import { View, Text, Button } from 'react-native';
import { useUser, useAppDispatch } from '../../../store/hooks';
import { clearUser } from '../../../store/slices/userSlice';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SettingsScreen = () => {
  const user = useUser();
  const dispatch = useAppDispatch();

  const handleLogout = async () => {
    dispatch(clearUser());
    await AsyncStorage.removeItem('authToken');
    await AsyncStorage.removeItem('userType');
  };

  return (
    <View>
      <Text>Name: {user?.firstName} {user?.lastName}</Text>
      <Text>Business: {user?.businessName}</Text>
      <Text>CR Number: {user?.crNumber}</Text>
      <Text>Phone: {user?.phoneNumber}</Text>
      <Button title="Logout" onPress={handleLogout} />
    </View>
  );
};
```

## Files Modified

1. **src/store/hooks.js** - Added convenience hooks
2. **src/store/slices/userSlice.js** - Added authToken and userType
3. **src/auth/screens/OtpBusinessScreen.js** - Added persistence and state management
4. **src/navigation/RootNavigator.js** - Integrated Redux for auth state
5. **src/business/screens/Dashboard/BusinessHomeScreen.js** - Display user data from Redux

## Testing the Flow

1. Start the app
2. Select "Business" user type
3. Login with credentials
4. Enter OTP (any 4 digits for testing)
5. Should automatically navigate to BusinessHomeScreen
6. Close and reopen the app
7. Should stay logged in and show BusinessHomeScreen directly

## Troubleshooting

### User not staying logged in
- Check AsyncStorage permissions
- Verify getUserByUid service is working
- Check console logs in RootNavigator.checkAuthStatus

### Navigation not working
- Ensure Redux Provider wraps NavigationContainer in App.js
- Check that isAuthenticated is updating in Redux state
- Verify RootNavigator is using Redux selectors

### User data not showing
- Check that user object structure matches your database
- Verify field names (businessName, crNumber, etc.)
- Add null checks when accessing nested user properties
