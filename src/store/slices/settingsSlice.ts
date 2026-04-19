import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface SettingsState {
  autoSave: boolean;
  highQuality: boolean;
  darkMode: boolean;
  outputFolder: string;
  language: string;
}

const initialState: SettingsState = {
  autoSave: true,
  highQuality: false,
  darkMode: true,
  outputFolder: 'Downloads',
  language: 'English',
};

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    toggleAutoSave: state => { state.autoSave = !state.autoSave; },
    toggleHighQuality: state => { state.highQuality = !state.highQuality; },
    toggleDarkMode: state => { state.darkMode = !state.darkMode; },
    setOutputFolder: (state, action: PayloadAction<string>) => {
      state.outputFolder = action.payload;
    },
    setLanguage: (state, action: PayloadAction<string>) => {
      state.language = action.payload;
    },
  },
});

export const {
  toggleAutoSave,
  toggleHighQuality,
  toggleDarkMode,
  setOutputFolder,
  setLanguage,
} = settingsSlice.actions;
export default settingsSlice.reducer;