import RNFS from 'react-native-fs';
import { Platform } from 'react-native';
import { FileItem } from '../types';

/**
 * Download a file from a URL and save it to the device Downloads folder.
 * On Android it also triggers a media scan so it appears in Gallery.
 */
export const downloadAndSaveFile = async (
  downloadUrl: string,
  fileName: string,
): Promise<string> => {
  const destPath = `${RNFS.DownloadDirectoryPath}/${fileName}`;

  const result = await RNFS.downloadFile({
    fromUrl: downloadUrl,
    toFile: destPath,
    background: true,
    discretionary: true,
    progressDivider: 10,
  }).promise;

  if (result.statusCode !== 200) {
    throw new Error(`Download failed: HTTP ${result.statusCode}`);
  }

  // Make file visible in Android Gallery
  if (Platform.OS === 'android') {
    await RNFS.scanFile(destPath);
  }

  return destPath;
};

/**
 * Save a file that is already on-device to the Downloads folder.
 */
export const saveFile = async (
  sourceUri: string,
  fileName: string,
): Promise<string> => {
  const destPath = `${RNFS.DownloadDirectoryPath}/${fileName}`;
  await RNFS.copyFile(sourceUri, destPath);

  if (Platform.OS === 'android') {
    await RNFS.scanFile(destPath);
  }

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