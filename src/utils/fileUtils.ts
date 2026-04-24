import { MIME_TO_EXT } from './constants';

// ─── Size ─────────────────────────────────────────────────────────────────────
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
};

// ─── Extension from filename (returns UPPERCASE) ──────────────────────────────
export const getFileExtension = (filename: string): string =>
  (filename.split('.').pop() ?? '').toUpperCase();

// ─── Resolve extension from BOTH filename and mime-type ──────────────────────
// Mime wins when filename has no dot (Android content:// URIs often have no ext).
export const resolveExtension = (filename: string, mimeType: string): string => {
  const fromName = getFileExtension(filename);
  // Accept it only if it looks like a real extension (1-5 chars, no slashes)
  if (fromName && fromName.length <= 5 && !fromName.includes('/')) {
    // Normalise JPEG → JPG
    return fromName === 'JPEG' ? 'JPG' : fromName;
  }
  // Fall back to mime lookup
  const fromMime = MIME_TO_EXT[mimeType.toLowerCase()] ?? '';
  return fromMime;
};

// ─── Extension check BEFORE uploading ────────────────────────────────────────
// Returns:
//   'already'  – file is already the target format → show info toast, stop
//   'mismatch' – file type not accepted by this tool → show error toast, stop
//   'ok'       – proceed with conversion
export type ExtCheckResult = 'already' | 'mismatch' | 'ok';

export const checkExtension = (
  resolvedExt: string,             // e.g. "JPG"
  acceptedFromFormats: string[],   // e.g. ["JPG","JPEG"]
  targetFormat: string,            // e.g. "PNG"
): ExtCheckResult => {
  const ext    = resolvedExt.toUpperCase() === 'JPEG' ? 'JPG' : resolvedExt.toUpperCase();
  const target = targetFormat.toUpperCase() === 'JPEG' ? 'JPG' : targetFormat.toUpperCase();
  const accepted = acceptedFromFormats.map(f => (f.toUpperCase() === 'JPEG' ? 'JPG' : f.toUpperCase()));

  if (ext === target) return 'already';
  if (!accepted.includes(ext)) return 'mismatch';
  return 'ok';
};

// ─── Name helpers ─────────────────────────────────────────────────────────────
export const getFileName = (uri: string): string =>
  uri.split('/').pop() ?? 'Unknown';

export const generateFileName = (originalName: string, toFormat: string): string => {
  const base = originalName.replace(/\.[^/.]+$/, '');
  const timestamp = Date.now();
  return `${base}_converted_${timestamp}.${toFormat.toLowerCase()}`;
};