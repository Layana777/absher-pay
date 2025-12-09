import { createSlice } from "@reduxjs/toolkit";

/**
 * Tab Bar Visibility Slice
 * Controls the visibility of the bottom tab bar across the application
 */
const initialState = {
  isVisible: true,
};

const tabBarSlice = createSlice({
  name: "tabBar",
  initialState,
  reducers: {
    /**
     * Hide the tab bar
     */
    hideTabBar: (state) => {
      state.isVisible = false;
    },
    /**
     * Show the tab bar
     */
    showTabBar: (state) => {
      state.isVisible = true;
    },
    /**
     * Toggle the tab bar visibility
     */
    toggleTabBar: (state) => {
      state.isVisible = !state.isVisible;
    },
  },
});

export const { hideTabBar, showTabBar, toggleTabBar } = tabBarSlice.actions;
export default tabBarSlice.reducer;
