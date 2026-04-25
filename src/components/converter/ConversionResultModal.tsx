import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  StyleSheet,
  Platform,
  PermissionsAndroid,
  Animated,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Toast from 'react-native-toast-message';
import RNFS from 'react-native-fs';
import { formatFileSize } from '../../utils/fileUtils';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

type Props = {
  visible:        boolean;
  onClose:        () => void;
  sourceFileName: string;
  sourceUri:      string | null; // ✅ NEW: uri of the file the user picked (for thumbnail)
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
  sourceUri,
  toFormat,
  isConverting,
  error,
  downloadUrl,
  previewUrl,
  fileName,
  fileSize,
}: Props) {

  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const fadeAnim  = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // ✅ FIX: Reset to initial hidden state before animating in so every
      // open starts from the same position regardless of previous close.
      slideAnim.setValue(SCREEN_HEIGHT);
      fadeAnim.setValue(0);

      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 260,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          speed: 18,
          bounciness: 5,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: SCREEN_HEIGHT,
          duration: 220,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  // ─── Direct download to phone ─────────────────────────────────────────────
  const handleDownload = async () => {
    if (!downloadUrl) return;

    try {
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
      const isImage = ['jpg', 'jpeg', 'png', 'webp', 'bmp'].includes(toFormat.toLowerCase());
      const destDir  = isImage ? RNFS.PicturesDirectoryPath : RNFS.DownloadDirectoryPath;
      const destPath = `${destDir}/${destFileName}`;

      onClose();
      Toast.show({ type: 'info', text1: '⏳ Downloading…', visibilityTime: 2000 });

      const result = await RNFS.downloadFile({
        fromUrl: downloadUrl,
        toFile: destPath,
        background: true,
        discretionary: true,
        cacheable: false,
      }).promise;

      if (result.statusCode === 200) {
        if (Platform.OS === 'android') await RNFS.scanFile(destPath);
        Toast.show({
          type: 'success',
          text1: '✓ Downloaded!',
          text2: isImage ? 'Saved to Gallery' : `Saved to Downloads/${destFileName}`,
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

  // ─── Shared image thumbnail (dimmed with spinner overlay while converting) ─
  const renderImageThumb = (uri: string, dimmed = false) => (
    <View style={styles.thumbWrap}>
      <Image
        source={{ uri }}
        style={[styles.thumbImage, dimmed && styles.thumbDimmed]}
        resizeMode="cover"
      />
      {dimmed && (
        <View style={styles.thumbOverlay}>
          <ActivityIndicator size="small" color="#7C5CFC" />
        </View>
      )}
    </View>
  );

  // ─── Converting spinner ───────────────────────────────────────────────────
  const renderConverting = () => (
    <View style={styles.stateContainer}>
      {/*
        ✅ Show selected image thumbnail while converting (dimmed + spinner).
        Falls back to the plain purple spinner ring if no image was picked
        (e.g. when a PDF or DOCX file was selected instead of an image).
      */}
      {sourceUri
        ? renderImageThumb(sourceUri, true)
        : (
          <View style={styles.spinnerRing}>
            <ActivityIndicator size="large" color="#7C5CFC" />
          </View>
        )
      }

      <Text style={styles.stateTitle}>Converting…</Text>
      <Text style={styles.stateSub}>
        <Text style={styles.bold}>{sourceFileName}</Text>
        {'  →  '}
        <Text style={styles.bold}>.{toFormat.toUpperCase()}</Text>
      </Text>
      <View style={styles.progressTrack}>
        <View style={styles.progressBar} />
      </View>
    </View>
  );

  // ─── Error state ──────────────────────────────────────────────────────────
  const renderError = () => (
    <View style={styles.stateContainer}>
      <View style={[styles.iconCircle, { backgroundColor: '#FEE2E2' }]}>
        <Icon name="alert-circle-outline" size={38} color="#EF4444" />
      </View>
      <Text style={styles.stateTitle}>Conversion Failed</Text>
      <Text style={styles.errorText}>{error}</Text>
      <TouchableOpacity style={styles.primaryBtn} onPress={onClose} activeOpacity={0.85}>
        <Text style={styles.primaryBtnText}>Try Again</Text>
      </TouchableOpacity>
    </View>
  );

  // ─── Success state ────────────────────────────────────────────────────────
  const renderSuccess = () => (
    <View style={styles.successContainer}>
      {/* Success header */}
      <View style={styles.successHeader}>
        <View style={[styles.iconCircle, { backgroundColor: '#D1FAE5' }]}>
          <Icon name="check-circle" size={34} color="#10B981" />
        </View>
        <View style={styles.successTextBlock}>
          <Text style={styles.stateTitle}>Done!</Text>
          <Text style={styles.stateSub}>Your file is ready to download</Text>
        </View>
      </View>

      {/* Info card */}
      <View style={styles.infoBox}>
        <View style={styles.infoRow}>
          <View style={[styles.infoIconWrap, { backgroundColor: '#EEF2FF' }]}>
            <Icon name="file-outline" size={14} color="#7C5CFC" />
          </View>
          <Text style={styles.infoValue} numberOfLines={1}>
            {fileName ?? sourceFileName}
          </Text>
        </View>

        <View style={styles.infoSep} />

        <View style={styles.infoRow}>
          {fileSize != null && (
            <>
              <View style={[styles.infoIconWrap, { backgroundColor: '#FEF3C7' }]}>
                <Icon name="weight" size={14} color="#D97706" />
              </View>
              <Text style={styles.infoValue}>{formatFileSize(fileSize)}</Text>
              <View style={styles.infoSepV} />
            </>
          )}
          <View style={[styles.infoIconWrap, { backgroundColor: '#D1FAE5' }]}>
            <Icon name="swap-horizontal" size={14} color="#10B981" />
          </View>
          <Text style={[styles.infoValue, { color: '#10B981', fontWeight: '800' }]}>
            .{toFormat.toUpperCase()}
          </Text>
        </View>
      </View>

      {/*
        ✅ Preview priority:
          1. previewUrl → converted result image returned by the API
          2. sourceUri  → original picked image as a fallback
        This means there is always something to show when an image was selected.
      */}
      {(previewUrl || sourceUri) && (
        <Image
          source={{ uri: (previewUrl ?? sourceUri)! }}
          style={styles.previewImage}
          resizeMode="contain"
        />
      )}

      {/* Download button */}
      <TouchableOpacity style={styles.primaryBtn} onPress={handleDownload} activeOpacity={0.85}>
        <Icon name="download" size={18} color="white" style={styles.btnIcon} />
        <Text style={styles.primaryBtnText}>Download to Phone</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.secondaryBtn} onPress={onClose} activeOpacity={0.7}>
        <Text style={styles.secondaryBtnText}>Convert Another File</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <Modal
      transparent
      animationType="none"
      visible={visible}
      onRequestClose={onClose}>
      <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          activeOpacity={1}
          onPress={!isConverting ? onClose : undefined}
        />
        <Animated.View style={[styles.sheet, { transform: [{ translateY: slideAnim }] }]}>
          {/* Drag handle */}
          <View style={styles.handle} />

          {/* Close button */}
          {!isConverting && (
            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <View style={styles.closeBtnInner}>
                <Icon name="close" size={16} color="#6B7280" />
              </View>
            </TouchableOpacity>
          )}

          {isConverting                            && renderConverting()}
          {!isConverting && error                  && renderError()}
          {!isConverting && !error && downloadUrl  && renderSuccess()}
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.38)',
  },
  sheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 18,
    paddingTop: 10,
    paddingBottom: 36,
  },
  handle: {
    width: 38,
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 6,
  },
  closeBtn: { alignSelf: 'flex-end', padding: 2, marginBottom: 2 },
  closeBtnInner: {
    width: 28,
    height: 28,
    borderRadius: 9,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },

  stateContainer:   { alignItems: 'center', paddingVertical: 16 },
  successContainer: { paddingVertical: 4 },

  successHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 14,
  },
  successTextBlock: { flex: 1 },

  iconCircle: {
    width: 66,
    height: 66,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  spinnerRing: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#F0EDFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },

  // ─── Thumbnail shown while converting ─────────────────────────────────────
  thumbWrap: {
    width: 100,
    height: 100,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
    backgroundColor: '#F3F4F6',
  },
  thumbImage: {
    width: '100%',
    height: '100%',
  },
  thumbDimmed: {
    opacity: 0.45,
  },
  thumbOverlay: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.3)',
  },

  stateTitle: {
    fontSize: 19,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 4,
  },
  stateSub: {
    fontSize: 12.5,
    color: '#9CA3AF',
    lineHeight: 18,
  },
  bold: { color: '#111827', fontWeight: '700' },

  progressTrack: {
    width: '65%',
    height: 3,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
    marginTop: 14,
    overflow: 'hidden',
  },
  progressBar: {
    width: '60%',
    height: '100%',
    backgroundColor: '#7C5CFC',
    borderRadius: 2,
  },

  errorText: {
    fontSize: 13.5,
    color: '#EF4444',
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 20,
    lineHeight: 20,
  },

  infoBox: {
    backgroundColor: '#F9FAFB',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#F0F1F5',
    gap: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  infoIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#111827',
    flexShrink: 1,
  },
  infoSep:  { height: 1, backgroundColor: '#F0F1F5' },
  infoSepV: { width: 1, height: 16, backgroundColor: '#E5E7EB', marginHorizontal: 2 },

  previewImage: {
    width: '100%',
    height: 140,
    borderRadius: 14,
    backgroundColor: '#F3F4F6',
    marginBottom: 14,
  },

  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#7C5CFC',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 24,
    width: '100%',
    marginBottom: 10,
    shadowColor: '#7C5CFC',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  primaryBtnText: { color: 'white', fontWeight: '800', fontSize: 14.5 },
  btnIcon:        { marginRight: 7 },

  secondaryBtn: { alignItems: 'center', paddingVertical: 10 },
  secondaryBtnText: {
    color: '#9CA3AF',
    fontWeight: '600',
    fontSize: 13.5,
  },
});