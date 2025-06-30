import { createSlice } from "@reduxjs/toolkit";
import en from '../locales/en.json'

const initialState = {
  label:"en",
  value:en,
};

const languageSlice = createSlice({
  name: "language",
  initialState,
  reducers: {
    setLanguage(_state,action) {
        switch(action.payload){
            case 'en':
                return {
                  label:"en",
                  value:en,
                }
            default:
                return {
                    label:"en",
                    value:en,
                  }
        }
    },
  },
});

export const { setLanguage } = languageSlice.actions;
export default languageSlice.reducer;
