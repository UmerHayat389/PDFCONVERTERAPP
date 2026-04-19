import { ConversionType } from '../types';

export const CONVERSIONS: ConversionType[] = [
  { id: '1',  from: 'PNG',  to: 'JPG',  label: 'PNG → JPG',    icon: 'image',         category: 'image' },
  { id: '2',  from: 'JPG',  to: 'PNG',  label: 'JPG → PNG',    icon: 'image',         category: 'image' },
  { id: '3',  from: 'PNG',  to: 'WEBP', label: 'PNG → WEBP',   icon: 'image',         category: 'image' },
  { id: '4',  from: 'JPG',  to: 'WEBP', label: 'JPG → WEBP',   icon: 'image',         category: 'image' },
  { id: '5',  from: 'WEBP', to: 'JPG',  label: 'WEBP → JPG',   icon: 'image',         category: 'image' },
  { id: '6',  from: 'WEBP', to: 'PNG',  label: 'WEBP → PNG',   icon: 'image',         category: 'image' },
  { id: '7',  from: 'PDF',  to: 'PNG',  label: 'PDF → PNG',    icon: 'file-pdf-box',  category: 'pdf' },
  { id: '8',  from: 'PDF',  to: 'JPG',  label: 'PDF → JPG',    icon: 'file-pdf-box',  category: 'pdf' },
  { id: '9',  from: 'IMG',  to: 'PDF',  label: 'Image → PDF',  icon: 'file-pdf-box',  category: 'pdf' },
  { id: '10', from: 'PNG',  to: 'PDF',  label: 'PNG → PDF',    icon: 'file-pdf-box',  category: 'pdf' },
  { id: '11', from: 'JPG',  to: 'PDF',  label: 'JPG → PDF',    icon: 'file-pdf-box',  category: 'pdf' },
  { id: '12', from: 'PDF',  to: 'TXT',  label: 'PDF → TXT',    icon: 'file-document', category: 'document' },
];

export const APP_COLORS = {
  primary: '#E63946',
  secondary: '#1D3557',
  accent: '#457B9D',
  dark: '#0D1B2A',
  surface: '#F1FAEE',
};