import { configureStore } from '@reduxjs/toolkit';
import settingsReducer from './slices/settingsSlice';
import fileReducer from './slices/fileSlice';
import scannerReducer from './slices/scannerSlice';   // ← add

export const store = configureStore({
  reducer: {
    settings: settingsReducer,
    files: fileReducer,
    scanner: scannerReducer,                           // ← add
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;