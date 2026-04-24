import React, { useState, useEffect, useRef } from 'react';
import {
  View, Image, TouchableOpacity, Text,
  StyleSheet, ActivityIndicator, Animated,
} from 'react-native';
import DocumentScanner from 'react-native-document-scanner-plugin';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { setCurrentScan } from '../store/slices/scannerSlice';
import { RootState } from '../store';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export default function CropScreen() {
  const dispatch = useDispatch();
  const navigation = useNavigation<any>();
  const currentScan = useSelector((s: RootState) => s.scanner.currentScan);
  const [croppedUri, setCroppedUri] = useState<string | null>(null);
  const [scanning, setScanning] = useState(true);

  const fadeIn = useRef(new Animated.Value(0)).current;
  const btnSlide = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    if (currentScan?.uri) runScan(currentScan.uri);
  }, []);

  const runScan = async (uri: string) => {
    setScanning(true);
    try {
      const { scannedImages } = await DocumentScanner.scanDocument({
        croppedImageQuality: 90,
      });
      if (scannedImages && scannedImages.length > 0) {
        setCroppedUri(scannedImages[0]);
      } else {
        setCroppedUri(uri);
      }
    } catch {
      setCroppedUri(uri);
    } finally {
      setScanning(false);
      Animated.parallel([
        Animated.timing(fadeIn, { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.spring(btnSlide, { toValue: 0, useNativeDriver: true, damping: 16 }),
      ]).start();
    }
  };

  const onConfirm = () => {
    if (!croppedUri || !currentScan) return;
    dispatch(setCurrentScan({ ...currentScan, croppedUri }));
    navigation.navigate('Preview');
  };

  const onRetake = () => navigation.goBack();

  return (
    <View style={styles.container}>
      {scanning ? (
        <View style={styles.center}>
          <View style={styles.loaderCard}>
            <ActivityIndicator size="large" color="#E63946" />
            <Text style={styles.loaderTitle}>Processing</Text>
            <Text style={styles.loaderSub}>Detecting document edges…</Text>
          </View>
        </View>
      ) : (
        <>
          <Animated.View style={[styles.imageWrap, { opacity: fadeIn }]}>
            <Image
              source={{ uri: croppedUri || currentScan?.uri }}
              style={styles.preview}
              resizeMode="contain"
            />
            {/* Quality badge */}
            <View style={styles.badge}>
              <Icon name="check-circle" size={12} color="#22c55e" />
              <Text style={styles.badgeText}>Auto-cropped</Text>
            </View>
          </Animated.View>

          <Animated.View style={[styles.actions, { opacity: fadeIn, transform: [{ translateY: btnSlide }] }]}>
            <TouchableOpacity style={styles.btnSecondary} onPress={onRetake} activeOpacity={0.8}>
              <Icon name="camera-retake" size={17} color="#94a3b8" />
              <Text style={styles.btnSecondaryText}>Retake</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.btnPrimary} onPress={onConfirm} activeOpacity={0.85}>
              <Icon name="check" size={17} color="#111" />
              <Text style={styles.btnPrimaryText}>Looks Good</Text>
            </TouchableOpacity>
          </Animated.View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#080F1A' },

  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  loaderCard: {
    backgroundColor: '#0F1E32', borderRadius: 24, padding: 36,
    alignItems: 'center', gap: 12,
    borderWidth: 1, borderColor: '#1E2D40',
    width: '100%',
  },
  loaderTitle: { color: '#F1F5F9', fontSize: 18, fontWeight: '800', marginTop: 8 },
  loaderSub: { color: '#64748b', fontSize: 13 },

  imageWrap: { flex: 1, position: 'relative' },
  preview: { flex: 1, width: '100%' },
  badge: {
    position: 'absolute', top: 16, right: 16,
    backgroundColor: 'rgba(0,0,0,0.7)',
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20,
    borderWidth: 1, borderColor: 'rgba(34,197,94,0.3)',
  },
  badgeText: { color: '#22c55e', fontSize: 11, fontWeight: '700' },

  actions: {
    flexDirection: 'row', gap: 12,
    padding: 20, paddingBottom: 36,
    backgroundColor: '#080F1A',
    borderTopWidth: 1, borderTopColor: '#0F1E32',
  },
  btnSecondary: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, paddingVertical: 15, borderRadius: 14,
    borderWidth: 1, borderColor: '#1E2D40',
    backgroundColor: '#0F1E32',
  },
  btnSecondaryText: { color: '#94a3b8', fontWeight: '700', fontSize: 15 },
  btnPrimary: {
    flex: 2, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, paddingVertical: 15, borderRadius: 14,
    backgroundColor: '#F1F5F9',
    shadowColor: '#fff', shadowRadius: 10, shadowOpacity: 0.1, elevation: 4,
  },
  btnPrimaryText: { color: '#080F1A', fontWeight: '800', fontSize: 15 },
});