import { configureStore } from '@reduxjs/toolkit';
import settingsReducer from './slices/settingsSlice';
import fileReducer from './slices/fileSlice';

export const store = configureStore({
  reducer: {
    settings: settingsReducer,
    files: fileReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;