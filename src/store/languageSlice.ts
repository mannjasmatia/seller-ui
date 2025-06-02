import { createSlice } from "@reduxjs/toolkit";
import en from '../locales/en.json'
import hi from '../locales/hi.json'
import fr from '../locales/fr.json'

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
            case 'hi':
                return {
                  label:"hi",
                  value:hi,
                }
            case 'fr':
                return {
                  label:"fr",
                  value:fr,
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
