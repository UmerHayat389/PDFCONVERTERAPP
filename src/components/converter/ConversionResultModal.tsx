import React from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Platform,
  PermissionsAndroid,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Toast from 'react-native-toast-message';
import RNFS from 'react-native-fs';
import { formatFileSize } from '../../utils/fileUtils';

type Props = {
  visible:        boolean;
  onClose:        () => void;
  sourceFileName: string;
  toFormat:       string;
  isConverting:   boolean;
  error:          string | null;
  downloadUrl:    string | null;
  previewUrl:     string | null;
  fileName:       string | null;
  fileSize:       number | null;
};

export default function ConversionResultModal({
  visible,
  onClose,
  sourceFileName,
  toFormat,
  isConverting,
  error,
  downloadUrl,
  previewUrl,
  fileName,
  fileSize,
}: Props) {

  // ─── Direct download to phone ─────────────────────────────────────────────
  const handleDownload = async () => {
    if (!downloadUrl) return;

    try {
      // ✅ Request storage permission on Android < 13
      if (Platform.OS === 'android' && Platform.Version < 33) {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
        );
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          Toast.show({ type: 'error', text1: 'Storage permission denied.' });
          return;
        }
      }

      const destFileName = fileName ?? `converted_${Date.now()}.${toFormat.toLowerCase()}`;

      // ✅ Images → Pictures folder (shows in Gallery)
      // ✅ Other files → Downloads folder
      const isImage = ['jpg', 'jpeg', 'png', 'webp', 'bmp'].includes(
        toFormat.toLowerCase(),
      );
      const destDir = isImage
        ? RNFS.PicturesDirectoryPath
        : RNFS.DownloadDirectoryPath;

      const destPath = `${destDir}/${destFileName}`;

      Toast.show({ type: 'info', text1: '⏳ Downloading…', visibilityTime: 2000 });

      const result = await RNFS.downloadFile({
        fromUrl: downloadUrl,
        toFile: destPath,
        background: true,
        discretionary: true,
        cacheable: false,
      }).promise;

      if (result.statusCode === 200) {
        // ✅ Trigger media scan so file appears in Gallery immediately
        if (Platform.OS === 'android') {
          await RNFS.scanFile(destPath);
        }
        Toast.show({
          type: 'success',
          text1: '✓ Downloaded!',
          text2: isImage
            ? `Saved to Gallery`
            : `Saved to Downloads/${destFileName}`,
          visibilityTime: 4000,
        });
      } else {
        throw new Error(`Download failed with status ${result.statusCode}`);
      }
    } catch (err: any) {
      Toast.show({
        type: 'error',
        text1: 'Download failed',
        text2: err.message ?? 'Please try again.',
      });
    }
  };

  // ─── Converting spinner ───────────────────────────────────────────────────
  const renderConverting = () => (
    <View style={styles.stateContainer}>
      <ActivityIndicator size="large" color="#E63946" />
      <Text style={styles.stateTitle}>Converting…</Text>
      <Text style={styles.stateSub}>
        Converting <Text style={styles.bold}>{sourceFileName}</Text> to{' '}
        <Text style={styles.bold}>.{toFormat.toUpperCase()}</Text>
      </Text>
    </View>
  );

  // ─── Error state ──────────────────────────────────────────────────────────
  const renderError = () => (
    <View style={styles.stateContainer}>
      <View style={styles.iconCircle}>
        <Icon name="alert-circle-outline" size={48} color="#E63946" />
      </View>
      <Text style={styles.stateTitle}>Conversion Failed</Text>
      <Text style={styles.errorText}>{error}</Text>
      <TouchableOpacity style={styles.primaryBtn} onPress={onClose}>
        <Text style={styles.primaryBtnText}>Try Again</Text>
      </TouchableOpacity>
    </View>
  );

  // ─── Success state ────────────────────────────────────────────────────────
  const renderSuccess = () => (
    <ScrollView contentContainerStyle={styles.successContainer}>
      <View style={[styles.iconCircle, styles.iconCircleSuccess]}>
        <Icon name="check-circle-outline" size={48} color="#22c55e" />
      </View>

      <Text style={styles.stateTitle}>Conversion Complete!</Text>

      <View style={styles.infoBox}>
        <View style={styles.infoRow}>
          <Icon name="file-outline" size={18} color="#94a3b8" />
          <Text style={styles.infoLabel}>File</Text>
          <Text style={styles.infoValue} numberOfLines={1}>
            {fileName ?? sourceFileName}
          </Text>
        </View>
        {fileSize != null && (
          <View style={styles.infoRow}>
            <Icon name="scale" size={18} color="#94a3b8" />
            <Text style={styles.infoLabel}>Size</Text>
            <Text style={styles.infoValue}>{formatFileSize(fileSize)}</Text>
          </View>
        )}
        <View style={styles.infoRow}>
          <Icon name="arrow-right-circle-outline" size={18} color="#94a3b8" />
          <Text style={styles.infoLabel}>Format</Text>
          <Text style={styles.infoValue}>.{toFormat.toUpperCase()}</Text>
        </View>
      </View>

      {previewUrl && (
        <View style={styles.previewContainer}>
          <Text style={styles.previewLabel}>Preview</Text>
          <Image
            source={{ uri: previewUrl }}
            style={styles.previewImage}
            resizeMode="contain"
          />
        </View>
      )}

      <TouchableOpacity style={styles.primaryBtn} onPress={handleDownload}>
        <Icon name="download" size={20} color="white" style={styles.btnIcon} />
        <Text style={styles.primaryBtnText}>Download to Phone</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.secondaryBtn} onPress={onClose}>
        <Text style={styles.secondaryBtnText}>Convert Another File</Text>
      </TouchableOpacity>
    </ScrollView>
  );

  return (
    <Modal
      transparent
      animationType="slide"
      visible={visible}
      onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          {!isConverting && (
            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <Icon name="close" size={22} color="#94a3b8" />
            </TouchableOpacity>
          )}
          {isConverting && renderConverting()}
          {!isConverting && error && renderError()}
          {!isConverting && !error && downloadUrl && renderSuccess()}
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
    paddingTop: 12,
    paddingBottom: 40,
    minHeight: 320,
  },
  closeBtn:         { alignSelf: 'flex-end', padding: 8, marginBottom: 4 },
  stateContainer:   { alignItems: 'center', paddingVertical: 24 },
  successContainer: { alignItems: 'center', paddingVertical: 8 },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#0D1B2A',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  iconCircleSuccess: { backgroundColor: 'rgba(34,197,94,0.1)' },
  stateTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  stateSub:  { color: '#94a3b8', fontSize: 14, textAlign: 'center', marginTop: 8 },
  bold:      { color: 'white', fontWeight: '600' },
  errorText: {
    color: '#f87171',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 24,
    lineHeight: 22,
  },
  infoBox: {
    width: '100%',
    backgroundColor: '#0D1B2A',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    gap: 12,
  },
  infoRow:   { flexDirection: 'row', alignItems: 'center', gap: 8 },
  infoLabel: { color: '#94a3b8', fontSize: 13, width: 52 },
  infoValue: { color: 'white', fontSize: 13, flex: 1, fontWeight: '600' },
  previewContainer: { width: '100%', marginBottom: 20 },
  previewLabel:     { color: '#94a3b8', fontSize: 12, marginBottom: 8 },
  previewImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    backgroundColor: '#0D1B2A',
  },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E63946',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 24,
    width: '100%',
    marginBottom: 12,
  },
  primaryBtnText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
  btnIcon:        { marginRight: 8 },
  secondaryBtn:   { alignItems: 'center', paddingVertical: 12 },
  secondaryBtnText: { color: '#94a3b8', fontWeight: '600', fontSize: 14 },
});