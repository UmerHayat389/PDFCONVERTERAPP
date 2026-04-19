import RNFS from 'react-native-fs';

export const saveScannedImage = async (photoPath: string): Promise<string> => {
  const fileName = `scan_${Date.now()}.jpg`;
  const destPath = `${RNFS.DownloadDirectoryPath}/${fileName}`;
  await RNFS.copyFile(photoPath, destPath);
  return destPath;
};

export const saveScannedAsPDF = async (photoPath: string): Promise<string> => {
  const fileName = `scan_${Date.now()}.pdf`;
  const destPath = `${RNFS.CachesDirectoryPath}/${fileName}`;
  // TODO: wire up react-native-html-to-pdf for actual PDF creation
  return destPath;
};