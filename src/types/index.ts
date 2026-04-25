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

  // ── Display fields used by HomeScreen recent list ──────────────────────
  size: string;        // human-readable e.g. "1.2 MB"
  date: string;        // e.g. "4/25/2026"
  type: string;        // "pdf" | "word" | "image" | "excel"

  // ── URIs / paths (optional — not all entries have all of these) ────────
  uri?: string;        // original source file URI
  path?: string;       // output path on disk
  outputUri?: string;  // alias kept for backward compat

  // ── Conversion metadata (optional for scan-only entries) ──────────────
  mimeType?: string;
  extension?: string;
  convertedAt?: string;
  fromFormat?: string;
  toFormat?: string;
}

export type TabParamList = {
  Home: undefined;
  Tools: { scannedUri?: string } | undefined;
  Scanner: undefined;
  Settings: undefined;
};