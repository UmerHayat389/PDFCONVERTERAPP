import { ConversionType } from '../types';

// ─── All conversion tool cards ────────────────────────────────────────────────
// `from` = array of accepted input extensions (UPPERCASE).
// `to`   = output extension (UPPERCASE).
// The extension check on the frontend uses these arrays before uploading anything.

export const CONVERSIONS: ConversionType[] = [
  // Image ↔ Image
  { id: '1',  from: ['PNG'],               to: 'JPG',  label: 'PNG → JPG',   icon: 'image',          category: 'image' },
  { id: '2',  from: ['JPG', 'JPEG'],       to: 'PNG',  label: 'JPG → PNG',   icon: 'image',          category: 'image' },
  { id: '3',  from: ['PNG'],               to: 'WEBP', label: 'PNG → WEBP',  icon: 'image',          category: 'image' },
  { id: '4',  from: ['JPG', 'JPEG'],       to: 'WEBP', label: 'JPG → WEBP',  icon: 'image',          category: 'image' },
  { id: '5',  from: ['WEBP'],              to: 'JPG',  label: 'WEBP → JPG',  icon: 'image',          category: 'image' },
  { id: '6',  from: ['WEBP'],              to: 'PNG',  label: 'WEBP → PNG',  icon: 'image',          category: 'image' },

  // Image → PDF
  { id: '9',  from: ['JPG','JPEG','PNG','WEBP','BMP'], to: 'PDF', label: 'Image → PDF', icon: 'file-pdf-box', category: 'pdf' },
  { id: '10', from: ['PNG'],               to: 'PDF',  label: 'PNG → PDF',   icon: 'file-pdf-box',   category: 'pdf' },
  { id: '11', from: ['JPG', 'JPEG'],       to: 'PDF',  label: 'JPG → PDF',   icon: 'file-pdf-box',   category: 'pdf' },

  // PDF → Image
  { id: '7',  from: ['PDF'],               to: 'PNG',  label: 'PDF → PNG',   icon: 'file-pdf-box',   category: 'pdf' },
  { id: '8',  from: ['PDF'],               to: 'JPG',  label: 'PDF → JPG',   icon: 'file-pdf-box',   category: 'pdf' },

  // Document
  { id: '12', from: ['PDF'],               to: 'TXT',  label: 'PDF → TXT',   icon: 'file-document',  category: 'document' },
];

// ─── Mime-type → uppercase extension ─────────────────────────────────────────
// Used when the filename has no extension (content:// URIs from Android picker).
export const MIME_TO_EXT: Record<string, string> = {
  'image/jpeg':        'JPG',
  'image/jpg':         'JPG',
  'image/png':         'PNG',
  'image/webp':        'WEBP',
  'image/bmp':         'BMP',
  'image/gif':         'GIF',
  'application/pdf':   'PDF',
  'text/plain':        'TXT',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'DOCX',
};

export const APP_COLORS = {
  primary:   '#E63946',
  secondary: '#1D3557',
  accent:    '#457B9D',
  dark:      '#0D1B2A',
  surface:   '#F1FAEE',
};