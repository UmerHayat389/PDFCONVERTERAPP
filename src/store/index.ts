import { configureStore } from '@reduxjs/toolkit';
import fileReducer from './slices/fileSlice';
import settingsReducer from './slices/settingsSlice';

export const store = configureStore({
  reducer: {
    files: fileReducer,
    settings: settingsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;