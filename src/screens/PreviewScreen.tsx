import React, { useRef, useEffect } from 'react';
import {
  View, Image, TouchableOpacity, Text,
  StyleSheet, Alert, Share, Animated,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import RNFS from 'react-native-fs';
import { saveScan, clearCurrentScan } from '../store/slices/scannerSlice';
import { RootState } from '../store';
import Toast from 'react-native-toast-message';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export default function PreviewScreen() {
  const dispatch = useDispatch();
  const navigation = useNavigation<any>();
  const currentScan = useSelector((s: RootState) => s.scanner.currentScan);
  const imageUri = currentScan?.croppedUri || currentScan?.uri;

  const fadeIn = useRef(new Animated.Value(0)).current;
  const footerSlide = useRef(new Animated.Value(40)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeIn, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.spring(footerSlide, { toValue: 0, useNativeDriver: true, damping: 18 }),
    ]).start();
  }, []);

  const saveToGallery = async () => {
    if (!imageUri) return;
    try {
      const destPath = `${RNFS.PicturesDirectoryPath}/scan_${Date.now()}.jpg`;
      await RNFS.copyFile(imageUri.replace('file://', ''), destPath);
      dispatch(saveScan(currentScan!));
      Toast.show({ type: 'success', text1: '✓ Saved to gallery', text2: 'Your scan has been saved successfully' });
      navigation.popToTop();
    } catch {
      Alert.alert('Error', 'Could not save image.');
    }
  };

  const shareImage = async () => {
    if (!imageUri) return;
    try {
      await Share.share({ url: imageUri, title: 'Scanned document' });
    } catch {
      Alert.alert('Error', 'Could not share image.');
    }
  };

  const onRetake = () => {
    dispatch(clearCurrentScan());
    navigation.popToTop();
  };

  return (
    <View style={styles.container}>

      {/* Image */}
      <Animated.View style={[styles.imageWrap, { opacity: fadeIn }]}>
        <Image source={{ uri: imageUri }} style={styles.image} resizeMode="contain" />
        <View style={styles.previewLabel}>
          <Icon name="eye-outline" size={12} color="#94a3b8" />
          <Text style={styles.previewLabelText}>Preview</Text>
        </View>
      </Animated.View>

      {/* Footer */}
      <Animated.View style={[styles.footer, { opacity: fadeIn, transform: [{ translateY: footerSlide }] }]}>

        <TouchableOpacity style={styles.iconBtn} onPress={onRetake} activeOpacity={0.8}>
          <Icon name="camera-retake" size={20} color="#94a3b8" />
          <Text style={styles.iconBtnText}>Retake</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.iconBtn} onPress={shareImage} activeOpacity={0.8}>
          <Icon name="share-variant-outline" size={20} color="#94a3b8" />
          <Text style={styles.iconBtnText}>Share</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.saveBtn} onPress={saveToGallery} activeOpacity={0.85}>
          <Icon name="content-save-outline" size={18} color="#080F1A" />
          <Text style={styles.saveBtnText}>Save to Gallery</Text>
        </TouchableOpacity>

      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#080F1A' },

  imageWrap: { flex: 1, position: 'relative' },
  image: { flex: 1, width: '100%' },
  previewLabel: {
    position: 'absolute', top: 16, left: 16,
    backgroundColor: 'rgba(0,0,0,0.6)',
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 10, paddingVertical: 5, borderRadius: 16,
    borderWidth: 1, borderColor: '#1E2D40',
  },
  previewLabelText: { color: '#94a3b8', fontSize: 11, fontWeight: '600' },

  footer: {
    flexDirection: 'row', gap: 10, alignItems: 'center',
    padding: 20, paddingBottom: 40,
    backgroundColor: '#080F1A',
    borderTopWidth: 1, borderTopColor: '#0F1E32',
  },
  iconBtn: {
    alignItems: 'center', justifyContent: 'center', gap: 4,
    paddingVertical: 12, paddingHorizontal: 14,
    backgroundColor: '#0F1E32', borderRadius: 14,
    borderWidth: 1, borderColor: '#1E2D40',
  },
  iconBtnText: { color: '#64748b', fontSize: 10, fontWeight: '700' },

  saveBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', gap: 8,
    paddingVertical: 15, borderRadius: 14,
    backgroundColor: '#F1F5F9',
    shadowColor: '#fff', shadowRadius: 12, shadowOpacity: 0.12, elevation: 4,
  },
  saveBtnText: { color: '#080F1A', fontWeight: '800', fontSize: 15 },
});