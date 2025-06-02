import { configureStore } from "@reduxjs/toolkit";
import languageSlice from "./languageSlice";
import userSlice from "./userSlice";

const appStore = configureStore({
  reducer: {
    language: languageSlice,
    user: userSlice,
  },
});

export type RootState = ReturnType<typeof appStore.getState>;
export default appStore;
