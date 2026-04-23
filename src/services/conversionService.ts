import RNFS from 'react-native-fs';

const BASE_URL = 'http://192.168.100.4:3000';

export type ConversionResult = {
  downloadUrl: string;
  previewUrl: string | null;
  fileName: string;
  fileSize: number;
};

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
    headers: { 'Content-Type': 'multipart/form-data' },
  });

  const data = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(data.error || 'Conversion failed');
  }

  // ✅ Fix: only prepend BASE_URL if path starts with /
  const resolveUrl = (path: string | null) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    return `${BASE_URL}${path.startsWith('/') ? path : '/' + path}`;
  };

  return {
    downloadUrl: resolveUrl(data.downloadUrl)!,
    previewUrl: resolveUrl(data.previewUrl),
    fileName: data.fileName,
    fileSize: data.fileSize,
  };
};

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