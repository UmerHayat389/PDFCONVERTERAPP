export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
};

export const getFileExtension = (filename: string): string => {
  return filename.split('.').pop()?.toUpperCase() || '';
};

export const getFileName = (uri: string): string => {
  return uri.split('/').pop() || 'Unknown';
};

export const generateFileName = (originalName: string, toFormat: string): string => {
  const baseName = originalName.replace(/\.[^/.]+$/, '');
  const timestamp = Date.now();
  return `${baseName}_converted_${timestamp}.${toFormat.toLowerCase()}`;
};