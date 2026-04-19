import RNFS from 'react-native-fs';
import { FileItem } from '../types';
import { generateFileName } from '../utils/fileUtils';

export const saveFile = async (
  sourceUri: string,
  fileName: string,
): Promise<string> => {
  const destPath = `${RNFS.DownloadDirectoryPath}/${fileName}`;
  await RNFS.copyFile(sourceUri, destPath);
  return destPath;
};

export const deleteFile = async (uri: string): Promise<void> => {
  const exists = await RNFS.exists(uri);
  if (exists) await RNFS.unlink(uri);
};

export const getFileInfo = async (uri: string): Promise<FileItem | null> => {
  try {
    const stat = await RNFS.stat(uri);
    return {
      id: Date.now().toString(),
      name: uri.split('/').pop() || 'Unknown',
      uri,
      size: stat.size,
      type: uri.split('.').pop() || '',
      createdAt: new Date().toISOString(),
    };
  } catch {
    return null;
  }
};