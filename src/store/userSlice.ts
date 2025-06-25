import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// Define types for the state
interface UserState {
  isLoggedIn: boolean;
  isAuthModalOpen: boolean;
  userInfo: any | null; // Consider defining a proper User interface
  preferredState: string;
  isInboxModalOpen: boolean;
}

const initialState: UserState = {
  isLoggedIn: true, // change to false
  isAuthModalOpen: false,
  userInfo: null,
  preferredState: "",
  isInboxModalOpen: false,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setIsLoggedIn(state, action: PayloadAction<boolean>) {
      state.isLoggedIn = action.payload;
    },
    setIsAuthModalOpen(state, action: PayloadAction<boolean>) {
      state.isAuthModalOpen = action.payload;
    },
    setUser(state, action: PayloadAction<any>) {
      state.userInfo = action.payload;
    },
    setPreferredState(state, action: PayloadAction<string>) {
      state.preferredState = action.payload;
    },
    removePreferredState(state) {
      state.preferredState = "";
    },
    setIsInboxModalOpen(state, action: PayloadAction<boolean>) {
      state.isInboxModalOpen = action.payload;
    },
    // New action to reset auth state on logout
    resetAuthState(state) {
      state.isLoggedIn = false;
      state.userInfo = null;
    },
  },
});

export const {
  setIsLoggedIn,
  setIsAuthModalOpen,
  setUser,
  setPreferredState,
  removePreferredState,
  setIsInboxModalOpen,
  resetAuthState,
} = userSlice.actions;

export default userSlice.reducer;