import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  user: null,
  authToken: null,
  userType: null,
  isAuthenticated: false,
  loading: false,
  error: null,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    // Set user data
    setUser: (state, action) => {
      const { user, authToken, userType } = action.payload;
      state.user = user || action.payload;
      state.authToken = authToken || null;
      state.userType = userType || null;
      state.isAuthenticated = !!(user || action.payload);
      state.error = null;
    },

    // Update user data (partial update)
    updateUser: (state, action) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    },

    // Clear user data (logout)
    clearUser: (state) => {
      state.user = null;
      state.authToken = null;
      state.userType = null;
      state.isAuthenticated = false;
      state.error = null;
    },

    // Set loading state
    setLoading: (state, action) => {
      state.loading = action.payload;
    },

    // Set error
    setError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },

    // Clear error
    clearError: (state) => {
      state.error = null;
    },
  },
});

// Export actions
export const {
  setUser,
  updateUser,
  clearUser,
  setLoading,
  setError,
  clearError,
} = userSlice.actions;

// Export selectors
export const selectUser = (state) => state.user.user;
export const selectAuthToken = (state) => state.user.authToken;
export const selectUserType = (state) => state.user.userType;
export const selectIsAuthenticated = (state) => state.user.isAuthenticated;
export const selectUserLoading = (state) => state.user.loading;
export const selectUserError = (state) => state.user.error;

// Export reducer
export default userSlice.reducer;
