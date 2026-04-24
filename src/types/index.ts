export type SupportedExt =
  | 'JPG' | 'JPEG' | 'PNG' | 'WEBP' | 'BMP' | 'GIF'
  | 'PDF'
  | 'TXT' | 'DOCX';

export interface ConversionType {
  id: string;
  label: string;
  icon: string;
  from: string[];
  to: string;
  category: 'image' | 'pdf' | 'document';
}

export interface FileItem {
  id: string;
  name: string;
  uri: string;
  size: number;
  mimeType: string;
  extension: string;
  convertedAt: string;
  fromFormat: string;
  toFormat: string;
  outputUri: string;
}

export type TabParamList = {
  Home: undefined;
  Tools: { scannedUri?: string } | undefined;
  Scanner: undefined;
  Settings: undefined;
};