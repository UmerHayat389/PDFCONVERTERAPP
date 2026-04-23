import RNFS from 'react-native-fs';
import { generateFileName } from '../utils/fileUtils';

// ─── Change this to your machine's local IP when testing on a real device ───
// e.g. 'http://192.168.1.10:3000'  (find it with: ipconfig / ifconfig)
// For Android Emulator use: 'http://10.0.2.2:3000'
const BASE_URL = 'http://10.0.2.2:3000';

export type ConversionResult = {
  downloadUrl: string;
  previewUrl: string | null;
  fileName: string;
  fileSize: number;
};

/**
 * Upload a file to the backend and get back the converted file info.
 */
export const convertFile = async (
  sourceUri: string,
  fromFormat: string,
  toFormat: string,
  mimeType: string = 'application/octet-stream',
): Promise<ConversionResult> => {
  const fileName = sourceUri.split('/').pop() || 'file';

  const formData = new FormData();
  formData.append('file', {
    uri: sourceUri,
    name: fileName,
    type: mimeType,
  } as any);
  formData.append('fromFormat', fromFormat);
  formData.append('toFormat', toFormat);

  const response = await fetch(`${BASE_URL}/api/convert`, {
    method: 'POST',
    body: formData,
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  const data = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(data.error || 'Conversion failed');
  }

  return {
    downloadUrl: data.downloadUrl,
    previewUrl: data.previewUrl,
    fileName: data.fileName,
    fileSize: data.fileSize,
  };
};

// ─── Legacy placeholders kept for scanner (not removed) ───

export const convertImageFormat = async (
  sourceUri: string,
  fromFormat: string,
  toFormat: string,
): Promise<string> => {
  const result = await convertFile(sourceUri, fromFormat, toFormat, 'image/jpeg');
  return result.downloadUrl;
};

export const convertImageToPDF = async (imageUri: string): Promise<string> => {
  const result = await convertFile(imageUri, 'IMG', 'PDF', 'image/jpeg');
  return result.downloadUrl;
};

export const convertPDFToImage = async (
  pdfUri: string,
  toFormat: string,
): Promise<string> => {
  const result = await convertFile(pdfUri, 'PDF', toFormat, 'application/pdf');
  return result.downloadUrl;
};