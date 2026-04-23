import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Alert,
  Platform,
} from 'react-native';
import RNFS from 'react-native-fs';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { formatFileSize } from '../../utils/fileUtils';

type Props = {
  visible: boolean;
  onClose: () => void;
  // The original picked file info
  sourceFileName: string;
  // Result from backend
  downloadUrl: string | null;
  previewUrl: string | null;   // null for PDF outputs
  fileName: string | null;
  fileSize: number | null;
  toFormat: string;
  // State
  isConverting: boolean;
  error: string | null;
};

export default function ConversionResultModal({
  visible,
  onClose,
  sourceFileName,
  downloadUrl,
  previewUrl,
  fileName,
  fileSize,
  toFormat,
  isConverting,
  error,
}: Props) {
  const [downloading, setDownloading] = useState(false);
  const [downloaded, setDownloaded] = useState(false);

  // Reset downloaded state when modal closes/opens
  React.useEffect(() => {
    if (!visible) setDownloaded(false);
  }, [visible]);

  const handleDownload = async () => {
    if (!downloadUrl || !fileName) return;
    setDownloading(true);
    try {
      // Save to Downloads folder
      const destPath = `${RNFS.DownloadDirectoryPath}/${fileName}`;
      const result = await RNFS.downloadFile({
        fromUrl: downloadUrl,
        toFile: destPath,
      }).promise;

      if (result.statusCode === 200) {
        // Scan file into gallery (Android)
        if (Platform.OS === 'android') {
          await RNFS.scanFile(destPath);
        }
        setDownloaded(true);
        Alert.alert(
          'Saved!',
          `File saved to Downloads:\n${fileName}`,
          [{ text: 'OK' }]
        );
      } else {
        throw new Error('Download failed with status ' + result.statusCode);
      }
    } catch (err: any) {
      Alert.alert('Download Failed', err.message || 'Could not save file');
    } finally {
      setDownloading(false);
    }
  };

  const isPDF = toFormat.toUpperCase() === 'PDF';

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      statusBarTranslucent
      onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>

          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Conversion Result</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Icon name="close" size={20} color="#94a3b8" />
            </TouchableOpacity>
          </View>

          {/* Source info */}
          <View style={styles.sourceRow}>
            <Icon name="file-outline" size={16} color="#94a3b8" />
            <Text style={styles.sourceName} numberOfLines={1}>
              {sourceFileName}
            </Text>
            <Icon name="arrow-right" size={16} color="#E63946" />
            <View style={styles.formatBadge}>
              <Text style={styles.formatBadgeText}>{toFormat.toUpperCase()}</Text>
            </View>
          </View>

          {/* ── CONVERTING STATE ── */}
          {isConverting && (
            <View style={styles.centerBox}>
              <ActivityIndicator size="large" color="#E63946" />
              <Text style={styles.convertingText}>Converting your file…</Text>
              <Text style={styles.convertingSubText}>This usually takes a few seconds</Text>
            </View>
          )}

          {/* ── ERROR STATE ── */}
          {!isConverting && error && (
            <View style={styles.centerBox}>
              <Icon name="alert-circle-outline" size={56} color="#E63946" />
              <Text style={styles.errorTitle}>Conversion Failed</Text>
              <Text style={styles.errorMsg}>{error}</Text>
              <TouchableOpacity style={styles.retryBtn} onPress={onClose}>
                <Text style={styles.retryText}>Try Again</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* ── SUCCESS STATE ── */}
          {!isConverting && !error && downloadUrl && (
            <>
              {/* Preview */}
              <View style={styles.previewBox}>
                {previewUrl && !isPDF ? (
                  <Image
                    source={{ uri: previewUrl }}
                    style={styles.previewImage}
                    resizeMode="contain"
                  />
                ) : (
                  // PDF or no preview — show icon
                  <View style={styles.pdfPreview}>
                    <Icon name="file-pdf-box" size={72} color="#E63946" />
                    <Text style={styles.pdfPreviewText}>PDF Document</Text>
                    {fileName && (
                      <Text style={styles.pdfFileName} numberOfLines={2}>
                        {fileName}
                      </Text>
                    )}
                  </View>
                )}
              </View>

              {/* File info */}
              {fileSize !== null && (
                <View style={styles.infoRow}>
                  <View style={styles.infoItem}>
                    <Icon name="file-check-outline" size={18} color="#1D9E75" />
                    <Text style={styles.infoLabel}>Converted</Text>
                  </View>
                  <View style={styles.infoItem}>
                    <Icon name="database-outline" size={18} color="#457B9D" />
                    <Text style={styles.infoLabel}>{formatFileSize(fileSize)}</Text>
                  </View>
                  <View style={styles.infoItem}>
                    <Icon name="image-outline" size={18} color="#94a3b8" />
                    <Text style={styles.infoLabel}>{toFormat.toUpperCase()}</Text>
                  </View>
                </View>
              )}

              {/* Download button */}
              <TouchableOpacity
                style={[styles.downloadBtn, downloaded && styles.downloadedBtn]}
                onPress={handleDownload}
                disabled={downloading || downloaded}>
                {downloading ? (
                  <ActivityIndicator color="white" size="small" />
                ) : downloaded ? (
                  <>
                    <Icon name="check-circle" size={20} color="white" />
                    <Text style={styles.downloadBtnText}>Saved to Gallery</Text>
                  </>
                ) : (
                  <>
                    <Icon name="download" size={20} color="white" />
                    <Text style={styles.downloadBtnText}>Download & Save to Gallery</Text>
                  </>
                )}
              </TouchableOpacity>

              <TouchableOpacity style={styles.convertAnotherBtn} onPress={onClose}>
                <Text style={styles.convertAnotherText}>Convert Another File</Text>
              </TouchableOpacity>
            </>
          )}

        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  sheet: {
    backgroundColor: '#1D3557',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 24,
    paddingBottom: 40,
    paddingTop: 20,
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  title: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  closeBtn: {
    backgroundColor: '#0D1B2A',
    padding: 8,
    borderRadius: 99,
  },
  sourceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0D1B2A',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    gap: 8,
  },
  sourceName: {
    color: '#94a3b8',
    fontSize: 13,
    flex: 1,
  },
  formatBadge: {
    backgroundColor: '#E63946',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  formatBadgeText: {
    color: 'white',
    fontSize: 11,
    fontWeight: 'bold',
  },
  centerBox: {
    alignItems: 'center',
    paddingVertical: 40,
    gap: 12,
  },
  convertingText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 8,
  },
  convertingSubText: {
    color: '#94a3b8',
    fontSize: 13,
  },
  errorTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 8,
  },
  errorMsg: {
    color: '#94a3b8',
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 20,
  },
  retryBtn: {
    backgroundColor: '#E63946',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 99,
    marginTop: 8,
  },
  retryText: {
    color: 'white',
    fontWeight: 'bold',
  },
  previewBox: {
    backgroundColor: '#0D1B2A',
    borderRadius: 16,
    overflow: 'hidden',
    height: 240,
    marginBottom: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  pdfPreview: {
    alignItems: 'center',
    gap: 8,
  },
  pdfPreviewText: {
    color: '#94a3b8',
    fontSize: 14,
  },
  pdfFileName: {
    color: '#64748b',
    fontSize: 12,
    textAlign: 'center',
    paddingHorizontal: 24,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#0D1B2A',
    borderRadius: 12,
    paddingVertical: 14,
    marginBottom: 16,
  },
  infoItem: {
    alignItems: 'center',
    gap: 4,
  },
  infoLabel: {
    color: '#94a3b8',
    fontSize: 12,
    marginTop: 4,
  },
  downloadBtn: {
    backgroundColor: '#E63946',
    borderRadius: 14,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 12,
  },
  downloadedBtn: {
    backgroundColor: '#1D9E75',
  },
  downloadBtnText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 15,
  },
  convertAnotherBtn: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  convertAnotherText: {
    color: '#94a3b8',
    fontWeight: '600',
    fontSize: 14,
  },
});