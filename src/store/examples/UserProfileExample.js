// This is an example component showing how to use Redux for user management
// You can copy this pattern to your actual components

import { View, Text, Button, StyleSheet } from 'react-native';
import { useAppDispatch, useAppSelector } from '../hooks';
import {
  selectUser,
  selectIsAuthenticated,
  selectUserLoading,
  selectUserError,
  setUser,
  updateUser,
  clearUser,
  setLoading,
  setError,
  clearError,
} from '../slices/userSlice';

function UserProfileExample() {
  const dispatch = useAppDispatch();

  // Get user data from Redux
  const user = useAppSelector(selectUser);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const loading = useAppSelector(selectUserLoading);
  const error = useAppSelector(selectUserError);

  // Example: Login function
  const handleLogin = async () => {
    dispatch(setLoading(true));
    dispatch(clearError());

    try {
      // Simulate API call
      const userData = {
        id: '123',
        name: 'John Doe',
        email: 'john@example.com',
        phone: '+966501234567',
      };

      dispatch(setUser(userData));
    } catch (err) {
      dispatch(setError(err.message));
    } finally {
      dispatch(setLoading(false));
    }
  };

  // Example: Update user profile
  const handleUpdateProfile = async () => {
    dispatch(setLoading(true));
    dispatch(clearError());

    try {
      // Simulate API call
      const updates = {
        name: 'Jane Doe',
      };

      dispatch(updateUser(updates));
    } catch (err) {
      dispatch(setError(err.message));
    } finally {
      dispatch(setLoading(false));
    }
  };

  // Example: Logout function
  const handleLogout = () => {
    dispatch(clearUser());
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  if (!isAuthenticated) {
    return (
      <View style={styles.container}>
        <Text>Not logged in</Text>
        <Button title="Login" onPress={handleLogin} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>User Profile</Text>

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      <View style={styles.infoContainer}>
        <Text>Name: {user?.name}</Text>
        <Text>Email: {user?.email}</Text>
        <Text>Phone: {user?.phone}</Text>
      </View>

      <Button title="Update Profile" onPress={handleUpdateProfile} />
      <Button title="Logout" onPress={handleLogout} color="red" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  infoContainer: {
    marginVertical: 20,
  },
  errorContainer: {
    backgroundColor: '#ffebee',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  errorText: {
    color: '#c62828',
  },
});

export default UserProfileExample;
