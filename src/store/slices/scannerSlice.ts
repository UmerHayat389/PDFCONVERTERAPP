import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface ScannedImage {
  id: string;
  uri: string;
  croppedUri?: string;
  createdAt: number;
}

interface ScannerState {
  scannedImages: ScannedImage[];
  currentScan: ScannedImage | null;
}

const initialState: ScannerState = {
  scannedImages: [],
  currentScan: null,
};

const scannerSlice = createSlice({
  name: 'scanner',
  initialState,
  reducers: {
    setCurrentScan(state, action: PayloadAction<ScannedImage>) {
      state.currentScan = action.payload;
    },
    saveScan(state, action: PayloadAction<ScannedImage>) {
      state.scannedImages.push(action.payload);
      state.currentScan = null;
    },
    clearCurrentScan(state) {
      state.currentScan = null;
    },
  },
});

export const { setCurrentScan, saveScan, clearCurrentScan } = scannerSlice.actions;
export default scannerSlice.reducer;