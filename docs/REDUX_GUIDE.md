# Redux State Management Guide

This guide explains how to use Redux and Redux Toolkit for state management in the Absher Pay application.

## Overview

Redux is configured with Redux Toolkit for managing application state. Currently, the user state is implemented and ready to use throughout the application.

## Project Structure

```
src/
└── store/
    ├── index.js                    # Store configuration
    ├── hooks.js                    # Custom Redux hooks
    └── slices/
        └── userSlice.js            # User state slice
```

## Getting User Data

### Method 1: Using Hooks (Recommended)

The easiest way to access user data in any component is using the `useAppSelector` hook:

```javascript
import { useAppSelector } from '../store/hooks';
import { selectUser, selectIsAuthenticated } from '../store/slices/userSlice';

function MyComponent() {
  // Get the entire user object
  const user = useAppSelector(selectUser);

  // Get authentication status
  const isAuthenticated = useAppSelector(selectIsAuthenticated);

  // Get loading state
  const isLoading = useAppSelector(state => state.user.loading);

  // Get error
  const error = useAppSelector(state => state.user.error);

  return (
    <View>
      {isAuthenticated ? (
        <Text>Welcome, {user?.name}!</Text>
      ) : (
        <Text>Please log in</Text>
      )}
    </View>
  );
}
```

### Method 2: Direct Selector Usage

You can also use the selectors directly:

```javascript
import { useSelector } from 'react-redux';
import { selectUser, selectIsAuthenticated } from '../store/slices/userSlice';

function MyComponent() {
  const user = useSelector(selectUser);
  const isAuthenticated = useSelector(selectIsAuthenticated);

  // ... rest of component
}
```

## Available Selectors

The user slice provides these pre-built selectors:

- `selectUser` - Returns the user object or null
- `selectIsAuthenticated` - Returns boolean indicating if user is authenticated
- `selectUserLoading` - Returns boolean indicating if user data is loading
- `selectUserError` - Returns error message or null

## Updating User Data

### Setting User Data (Login)

```javascript
import { useAppDispatch } from '../store/hooks';
import { setUser } from '../store/slices/userSlice';

function LoginScreen() {
  const dispatch = useAppDispatch();

  const handleLogin = async (credentials) => {
    try {
      // Your login API call
      const response = await loginAPI(credentials);

      // Set user data in Redux
      dispatch(setUser(response.user));
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  // ... rest of component
}
```

### Updating User Data (Partial Update)

```javascript
import { useAppDispatch } from '../store/hooks';
import { updateUser } from '../store/slices/userSlice';

function ProfileScreen() {
  const dispatch = useAppDispatch();

  const handleUpdateProfile = async (updates) => {
    try {
      // Your update API call
      await updateProfileAPI(updates);

      // Update user data in Redux (partial update)
      dispatch(updateUser(updates));
    } catch (error) {
      console.error('Update failed:', error);
    }
  };

  // ... rest of component
}
```

### Clearing User Data (Logout)

```javascript
import { useAppDispatch } from '../store/hooks';
import { clearUser } from '../store/slices/userSlice';

function SettingsScreen() {
  const dispatch = useAppDispatch();

  const handleLogout = () => {
    // Clear user data from Redux
    dispatch(clearUser());

    // Navigate to login screen
    // navigation.navigate('Login');
  };

  // ... rest of component
}
```

## Available Actions

The user slice provides these actions:

### `setUser(userData)`
Sets the complete user object and marks user as authenticated.

```javascript
dispatch(setUser({
  id: '123',
  name: 'John Doe',
  email: 'john@example.com',
  // ... other user properties
}));
```

### `updateUser(partialData)`
Updates specific fields of the user object without replacing the entire object.

```javascript
dispatch(updateUser({
  name: 'Jane Doe',
  // Only updates the name field
}));
```

### `clearUser()`
Clears all user data and sets authentication to false (logout).

```javascript
dispatch(clearUser());
```

### `setLoading(boolean)`
Sets the loading state.

```javascript
dispatch(setLoading(true));
```

### `setError(errorMessage)`
Sets an error message and sets loading to false.

```javascript
dispatch(setError('Failed to load user data'));
```

### `clearError()`
Clears any error message.

```javascript
dispatch(clearError());
```

## Complete Example: Login Flow

```javascript
import { View, TextInput, Button, Text } from 'react-native';
import { useState } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { setUser, setLoading, setError, clearError } from '../store/slices/userSlice';
import { selectUserLoading, selectUserError } from '../store/slices/userSlice';

function LoginScreen({ navigation }) {
  const dispatch = useAppDispatch();
  const loading = useAppSelector(selectUserLoading);
  const error = useAppSelector(selectUserError);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    // Clear any previous errors
    dispatch(clearError());

    // Set loading state
    dispatch(setLoading(true));

    try {
      // Your login API call
      const response = await fetch('YOUR_API/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        throw new Error('Login failed');
      }

      const data = await response.json();

      // Set user data in Redux
      dispatch(setUser(data.user));

      // Navigate to home screen
      navigation.navigate('Home');
    } catch (error) {
      dispatch(setError(error.message));
    } finally {
      dispatch(setLoading(false));
    }
  };

  return (
    <View>
      <TextInput
        value={email}
        onChangeText={setEmail}
        placeholder="Email"
      />
      <TextInput
        value={password}
        onChangeText={setPassword}
        placeholder="Password"
        secureTextEntry
      />

      {error && <Text style={{ color: 'red' }}>{error}</Text>}

      <Button
        title={loading ? "Logging in..." : "Login"}
        onPress={handleLogin}
        disabled={loading}
      />
    </View>
  );
}

export default LoginScreen;
```

## Complete Example: Using User Data in Any Screen

```javascript
import { View, Text } from 'react-native';
import { useAppSelector } from '../store/hooks';
import { selectUser, selectIsAuthenticated } from '../store/slices/userSlice';

function HomeScreen() {
  const user = useAppSelector(selectUser);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);

  if (!isAuthenticated) {
    return (
      <View>
        <Text>Please log in to continue</Text>
      </View>
    );
  }

  return (
    <View>
      <Text>Welcome back, {user.name}!</Text>
      <Text>Email: {user.email}</Text>
      {/* Use any user data you need */}
    </View>
  );
}

export default HomeScreen;
```

## State Structure

The user state has the following structure:

```javascript
{
  user: {
    user: null | {
      // Your user object properties
      id: string,
      name: string,
      email: string,
      // ... other user properties
    },
    isAuthenticated: boolean,
    loading: boolean,
    error: null | string,
  }
}
```

## Best Practices

1. **Always use selectors**: Use the provided selectors (`selectUser`, `selectIsAuthenticated`, etc.) instead of accessing state directly.

2. **Handle loading states**: Always check the loading state when performing async operations.

3. **Handle errors**: Use the error state to display error messages to users.

4. **Clear errors**: Clear errors before new operations using `clearError()`.

5. **Use hooks consistently**: Import hooks from `../store/hooks` for consistency.

6. **Don't mutate state directly**: Always use the provided actions to update state.

7. **Keep user data synchronized**: When making API calls that change user data, update Redux accordingly.

## Adding More State Slices (Future)

When you need to add more state (e.g., for products, cart, etc.), follow this pattern:

1. Create a new slice file in `src/store/slices/`
2. Add the reducer to `src/store/index.js`
3. Import and use actions/selectors as needed

Example for adding a cart slice:

```javascript
// In src/store/index.js
import userReducer from './slices/userSlice';
import cartReducer from './slices/cartSlice'; // New slice

export const store = configureStore({
  reducer: {
    user: userReducer,
    cart: cartReducer, // Add new reducer
  },
  // ... rest of configuration
});
```

## Troubleshooting

### "Cannot read property 'user' of undefined"

Make sure the Redux Provider is wrapping your app in `App.js`:

```javascript
<Provider store={store}>
  <NavigationContainer>
    {/* Your app */}
  </NavigationContainer>
</Provider>
```

### "useSelector/useDispatch hook may not be used"

Make sure you're using these hooks inside a component that's wrapped by the Provider.

### User data persists after app restart

Currently, Redux state is not persisted. If you need persistence, consider adding `redux-persist` to save state to AsyncStorage.

## Next Steps

- Add persistence with `redux-persist` if needed
- Add more slices for other parts of your app (cart, products, etc.)
- Consider adding TypeScript for better type safety
- Add middleware for API calls (Redux Thunk is already included with Redux Toolkit)
