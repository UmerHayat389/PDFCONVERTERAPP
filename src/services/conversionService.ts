import { Platform } from 'react-native';
import { resolveExtension, checkExtension } from '../utils/fileUtils';

const BASE_URL = Platform.select({
  android: 'http://192.168.100.4:3000',
  ios:     'http://localhost:3000',
  default: 'http://192.168.100.4:3000',
});

export type ConversionResult = {
  downloadUrl: string;
  previewUrl:  string | null;
  fileName:    string;
  fileSize:    number;
};

const resolveUrl = (path: string | null): string | null => {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  return `${BASE_URL}${path.startsWith('/') ? path : '/' + path}`;
};

// ─── Main convert function ────────────────────────────────────────────────────
export const convertFile = async (
  sourceUri:    string,
  fromFormats:  string[],   // accepted input formats array from ConversionType.from
  toFormat:     string,     // target format from ConversionType.to
  mimeType:     string = 'application/octet-stream',
): Promise<ConversionResult> => {

  const fileName = sourceUri.split('/').pop() ?? 'file';

  // ── STEP 1: Resolve actual extension ────────────────────────────────────────
  const resolvedExt = resolveExtension(fileName, mimeType);

  // ── STEP 2: Check extension BEFORE touching the network ─────────────────────
  const check = checkExtension(resolvedExt, fromFormats, toFormat);

  if (check === 'already') {
    throw new Error(
      `This file is already a .${toFormat.toUpperCase()} file.\nNo conversion needed.`,
    );
  }

  if (check === 'mismatch') {
    const accepted = fromFormats
      .map(f => f.toUpperCase())
      .filter((v, i, a) => a.indexOf(v) === i)   // dedupe
      .join(', ');
    throw new Error(
      `Wrong file type!\n` +
      `This tool converts: ${accepted} → ${toFormat.toUpperCase()}.\n` +
      `You selected a .${resolvedExt || 'unknown'} file.`,
    );
  }

  // ── STEP 3: Upload to backend ────────────────────────────────────────────────
  const formData = new FormData();
  formData.append('file', {
    uri:  sourceUri,
    name: fileName,
    type: mimeType,
  } as any);
  // Send the actual resolved extension so backend knows exact input type
  formData.append('fromFormat', resolvedExt || fromFormats[0]);
  formData.append('toFormat',   toFormat);

  const controller = new AbortController();
  // 60 s timeout — large PDFs and images can be slow on mobile networks
  const timeout = setTimeout(() => controller.abort(), 60_000);

  let response: Response;
  try {
    response = await fetch(`${BASE_URL}/api/convert`, {
      method: 'POST',
      body:   formData,
      signal: controller.signal,
    });
  } catch (err: any) {
    if (err.name === 'AbortError') {
      throw new Error('Request timed out. Check that your server is running and reachable.');
    }
    throw new Error(
      `Cannot reach the server.\nMake sure your PC and phone are on the same Wi-Fi.\n(${err.message})`,
    );
  } finally {
    clearTimeout(timeout);
  }

  let data: any;
  try {
    data = await response.json();
  } catch {
    throw new Error(`Server returned an invalid response (status ${response.status}).`);
  }

  if (!response.ok || !data.success) {
    throw new Error(data.error ?? `Conversion failed (status ${response.status}).`);
  }

  return {
    downloadUrl: resolveUrl(data.downloadUrl)!,
    previewUrl:  resolveUrl(data.previewUrl),
    fileName:    data.fileName,
    fileSize:    data.fileSize,
  };
};