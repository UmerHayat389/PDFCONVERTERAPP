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
    addRecentFile: (state, action: PayloadAction<FileItem>) => {
      state.recentFiles.unshift(action.payload);
      if (state.recentFiles.length > 10) state.recentFiles.pop();
    },
    setConverting: (state, action: PayloadAction<boolean>) => {
      state.isConverting = action.payload;
    },
    clearFiles: state => {
      state.files = [];
    },
  },
});

export const { addFile, removeFile, addRecentFile, setConverting, clearFiles } = fileSlice.actions;
export default fileSlice.reducer;