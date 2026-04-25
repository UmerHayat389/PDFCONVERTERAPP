import AsyncStorage from '@react-native-async-storage/async-storage';
import { FileItem } from '../types';

const RECENT_KEY = 'recentFiles';

export async function loadRecentFiles(): Promise<FileItem[]> {
  try {
    const raw = await AsyncStorage.getItem(RECENT_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export async function saveRecentFiles(files: FileItem[]): Promise<void> {
  try {
    await AsyncStorage.setItem(RECENT_KEY, JSON.stringify(files));
  } catch {}
}