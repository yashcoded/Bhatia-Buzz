import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type AppearancePreference = 'system' | 'light' | 'dark';

export const APPEARANCE_STORAGE_KEY = '@bhatia_buzz_appearance';

interface AppearanceState {
  preference: AppearancePreference;
}

const initialState: AppearanceState = {
  preference: 'system',
};

const appearanceSlice = createSlice({
  name: 'appearance',
  initialState,
  reducers: {
    setAppearance: (state, action: PayloadAction<AppearancePreference>) => {
      state.preference = action.payload;
    },
  },
});

export const { setAppearance } = appearanceSlice.actions;
export default appearanceSlice.reducer;
