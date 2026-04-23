import { Platform } from 'react-native';

const BASE_URL = Platform.select({
  android: 'http://192.168.100.4:3000',
  ios: 'http://localhost:3000',
  default: 'http://192.168.100.4:3000',
});

export type ConversionResult = {
  downloadUrl: string;
  previewUrl: string | null;
  fileName: string;
  fileSize: number;
};

const resolveUrl = (path: string | null): string | null => {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  return `${BASE_URL}${path.startsWith('/') ? path : '/' + path}`;
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

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);

  let response: Response;
  try {
    response = await fetch(`${BASE_URL}/api/convert`, {
      method: 'POST',
      body: formData,
      signal: controller.signal,
    });
  } catch (err: any) {
    if (err.name === 'AbortError') {
      throw new Error('Request timed out. Check that your server is running.');
    }
    throw new Error(`Network error: ${err.message}`);
  } finally {
    clearTimeout(timeout);
  }

  let data: any;
  try {
    data = await response.json();
  } catch {
    throw new Error(`Server returned non-JSON response (status ${response.status})`);
  }

  if (!response.ok || !data.success) {
    throw new Error(data.error || `Conversion failed with status ${response.status}`);
  }

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