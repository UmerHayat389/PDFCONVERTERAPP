import RNFS from 'react-native-fs';
import { generateFileName } from '../utils/fileUtils';

export const convertImageFormat = async (
  sourceUri: string,
  fromFormat: string,
  toFormat: string,
): Promise<string> => {
  // Placeholder — wire up react-native-image-resizer or ffmpeg here
  const outputName = generateFileName(
    sourceUri.split('/').pop() || 'file',
    toFormat,
  );
  const outputPath = `${RNFS.CachesDirectoryPath}/${outputName}`;
  // TODO: actual conversion logic
  return outputPath;
};

export const convertImageToPDF = async (imageUri: string): Promise<string> => {
  const outputName = generateFileName(
    imageUri.split('/').pop() || 'image',
    'pdf',
  );
  const outputPath = `${RNFS.CachesDirectoryPath}/${outputName}`;
  // TODO: wire up react-native-html-to-pdf
  return outputPath;
};

export const convertPDFToImage = async (
  pdfUri: string,
  toFormat: string,
): Promise<string> => {
  const outputName = generateFileName(
    pdfUri.split('/').pop() || 'document',
    toFormat,
  );
  const outputPath = `${RNFS.CachesDirectoryPath}/${outputName}`;
  // TODO: wire up pdf-to-image library
  return outputPath;
};