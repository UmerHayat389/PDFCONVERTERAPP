import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { FileItem } from '../../types';

interface FileState {
  files: FileItem[];
  recentFiles: FileItem[];
  isConverting: boolean;
}

const initialState: FileState = {
  files: [],
  recentFiles: [],
  isConverting: false,
};

const fileSlice = createSlice({
  name: 'files',
  initialState,
  reducers: {
    addFile: (state, action: PayloadAction<FileItem>) => {
      state.files.push(action.payload);
    },
    removeFile: (state, action: PayloadAction<string>) => {
      state.files = state.files.filter(f => f.id !== action.payload);
    },

    // Deduplicate by id, prepend newest, keep last 20
    addRecentFile: (state, action: PayloadAction<FileItem>) => {
      state.recentFiles = [
        action.payload,
        ...state.recentFiles.filter(f => f.id !== action.payload.id),
      ].slice(0, 20);
    },

    // Hydrate from AsyncStorage on app launch
    setRecentFiles: (state, action: PayloadAction<FileItem[]>) => {
      state.recentFiles = action.payload;
    },

    // Remove a single entry (⋮ menu in HomeScreen)
    removeRecentFile: (state, action: PayloadAction<string>) => {
      state.recentFiles = state.recentFiles.filter(f => f.id !== action.payload);
    },

    setConverting: (state, action: PayloadAction<boolean>) => {
      state.isConverting = action.payload;
    },
    clearFiles: state => {
      state.files = [];
    },
  },
});

export const {
  addFile,
  removeFile,
  addRecentFile,
  setRecentFiles,
  removeRecentFile,
  setConverting,
  clearFiles,
} = fileSlice.actions;
export default fileSlice.reducer;