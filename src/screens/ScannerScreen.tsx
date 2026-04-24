import React, { useState, useRef, useEffect } from 'react';
import {
  View, TouchableOpacity, Text, StyleSheet,
  Alert, PermissionsAndroid, Platform, Animated,
} from 'react-native';
import DocumentScanner from 'react-native-document-scanner-plugin';
import { useNavigation } from '@react-navigation/native';
import { useDispatch } from 'react-redux';
import { setCurrentScan } from '../store/slices/scannerSlice';
import uuid from 'react-native-uuid';

const requestCameraPermission = async (): Promise<boolean> => {
  if (Platform.OS !== 'android') return true;
  try {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.CAMERA,
      {
        title: 'Camera Permission',
        message: 'This app needs camera access to scan documents.',
        buttonNeutral: 'Ask Me Later',
        buttonNegative: 'Cancel',
        buttonPositive: 'OK',
      },
    );
    return granted === PermissionsAndroid.RESULTS.GRANTED;
  } catch {
    return false;
  }
};

function CornerMarker({ style }: { style: any }) {
  return <View style={[styles.corner, style]} />;
}

export default function ScannerScreen() {
  const navigation = useNavigation<any>();
  const dispatch = useDispatch();
  const [capturing, setCapturing] = useState(false);
  const handledRef = useRef(false);

  // Animations
  const fadeIn = useRef(new Animated.Value(0)).current;
  const slideUp = useRef(new Animated.Value(40)).current;
  const btnScale = useRef(new Animated.Value(1)).current;
  const scanLineY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeIn, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.spring(slideUp, { toValue: 0, useNativeDriver: true, damping: 18, stiffness: 100 }),
    ]).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(scanLineY, { toValue: 200, duration: 2000, useNativeDriver: true }),
        Animated.timing(scanLineY, { toValue: 0, duration: 2000, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const animateBtn = () => {
    Animated.sequence([
      Animated.timing(btnScale, { toValue: 0.93, duration: 100, useNativeDriver: true }),
      Animated.spring(btnScale, { toValue: 1, useNativeDriver: true, damping: 12 }),
    ]).start();
  };

  const capturePhoto = async () => {
    if (capturing || handledRef.current) return;
    animateBtn();

    const hasPermission = await requestCameraPermission();
    if (!hasPermission) {
      Alert.alert(
        'Permission Denied',
        'Camera permission is required to scan documents. Please enable it in Settings.',
      );
      return;
    }

    setCapturing(true);
    handledRef.current = true;

    try {
      const { scannedImages } = await DocumentScanner.scanDocument();
      if (!scannedImages || scannedImages.length === 0) return;

      dispatch(setCurrentScan({
        id: uuid.v4() as string,
        uri: scannedImages[0],
        createdAt: Date.now(),
      }));

      navigation.navigate('Crop');
    } catch {
      Alert.alert('Error', 'Failed to scan document. Please try again.');
    } finally {
      setCapturing(false);
      handledRef.current = false;
    }
  };

  return (
    <View style={styles.container}>

      {/* Background glow */}
      <View style={styles.bgGlow} />

      <Animated.View style={[styles.content, { opacity: fadeIn, transform: [{ translateY: slideUp }] }]}>

        {/* Label */}
        <Text style={styles.eyebrow}>DOCUMENT SCANNER</Text>
        <Text style={styles.title}>Ready to Scan</Text>

        {/* Scan frame preview */}
        <View style={styles.frameWrap}>
          <View style={styles.scanFrame}>
            <CornerMarker style={styles.cornerTL} />
            <CornerMarker style={styles.cornerTR} />
            <CornerMarker style={styles.cornerBL} />
            <CornerMarker style={styles.cornerBR} />

            {/* Animated scan line */}
            <Animated.View style={[styles.scanLine, { transform: [{ translateY: scanLineY }] }]} />

            {/* Centre icon */}
            <View style={styles.frameCenter}>
              <Icon name="file-document-outline" size={40} color="rgba(230,57,70,0.25)" />
            </View>
          </View>
        </View>

        <Text style={styles.subtitle}>
          Position your document in good lighting, then tap the button to capture and auto-crop.
        </Text>

        {/* Steps */}
        <View style={styles.steps}>
          {[
            { icon: 'lightbulb-on-outline', text: 'Good lighting' },
            { icon: 'crop-free', text: 'Flat surface' },
            { icon: 'auto-fix', text: 'Auto-crop' },
          ].map((s, i) => (
            <View key={i} style={styles.step}>
              <View style={styles.stepIconBox}>
                <Icon name={s.icon} size={15} color="#E63946" />
              </View>
              <Text style={styles.stepText}>{s.text}</Text>
            </View>
          ))}
        </View>

        {/* CTA Button */}
        <Animated.View style={{ transform: [{ scale: btnScale }], width: '100%' }}>
          <TouchableOpacity
            style={[styles.btn, capturing && styles.btnDisabled]}
            onPress={capturePhoto}
            disabled={capturing}
            activeOpacity={0.85}>
            <View style={styles.btnInner}>
              <Icon name="camera" size={20} color="#fff" />
              <Text style={styles.btnText}>{capturing ? 'Opening…' : 'Open Camera'}</Text>
            </View>
          </TouchableOpacity>
        </Animated.View>

      </Animated.View>
    </View>
  );
}

// Inline Icon shim to avoid extra import (uses the same package)
function Icon({ name, size, color }: { name: string; size: number; color: string }) {
  const VIcon = require('react-native-vector-icons/MaterialCommunityIcons').default;
  return <VIcon name={name} size={size} color={color} />;
}

const CORNER_SIZE = 22;
const CORNER_THICK = 3;

const styles = StyleSheet.create({
  container: {
    flex: 1, backgroundColor: '#080F1A',
    alignItems: 'center', justifyContent: 'center',
  },
  bgGlow: {
    position: 'absolute', top: '20%', alignSelf: 'center',
    width: 280, height: 280, borderRadius: 140,
    backgroundColor: 'rgba(230,57,70,0.07)',
  },
  content: { width: '100%', alignItems: 'center', paddingHorizontal: 28 },

  eyebrow: {
    color: '#E63946', fontSize: 10, fontWeight: '800',
    letterSpacing: 3, marginBottom: 6,
  },
  title: {
    color: '#F1F5F9', fontSize: 28, fontWeight: '800',
    letterSpacing: -0.5, marginBottom: 32,
  },

  frameWrap: { marginBottom: 28 },
  scanFrame: {
    width: 220, height: 240, borderRadius: 4,
    backgroundColor: 'rgba(14,27,44,0.6)',
    overflow: 'hidden',
    alignItems: 'center', justifyContent: 'center',
  },
  corner: {
    position: 'absolute', width: CORNER_SIZE, height: CORNER_SIZE,
    borderColor: '#E63946', borderRadius: 2,
  },
  cornerTL: { top: 0, left: 0, borderTopWidth: CORNER_THICK, borderLeftWidth: CORNER_THICK },
  cornerTR: { top: 0, right: 0, borderTopWidth: CORNER_THICK, borderRightWidth: CORNER_THICK },
  cornerBL: { bottom: 0, left: 0, borderBottomWidth: CORNER_THICK, borderLeftWidth: CORNER_THICK },
  cornerBR: { bottom: 0, right: 0, borderBottomWidth: CORNER_THICK, borderRightWidth: CORNER_THICK },

  scanLine: {
    position: 'absolute', top: 0, left: 0, right: 0, height: 2,
    backgroundColor: '#E63946', opacity: 0.7,
    shadowColor: '#E63946', shadowRadius: 6, shadowOpacity: 0.8,
    elevation: 4,
  },
  frameCenter: { opacity: 0.4 },

  subtitle: {
    color: '#475569', fontSize: 13, textAlign: 'center',
    lineHeight: 20, marginBottom: 24,
  },

  steps: {
    flexDirection: 'row', gap: 12, marginBottom: 36,
    flexWrap: 'wrap', justifyContent: 'center',
  },
  step: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  stepIconBox: {
    backgroundColor: 'rgba(230,57,70,0.1)',
    padding: 6, borderRadius: 8,
    borderWidth: 1, borderColor: 'rgba(230,57,70,0.2)',
  },
  stepText: { color: '#64748b', fontSize: 12, fontWeight: '600' },

  btn: {
    backgroundColor: '#E63946', borderRadius: 16,
    paddingVertical: 17, width: '100%',
    shadowColor: '#E63946', shadowRadius: 20,
    shadowOpacity: 0.4, shadowOffset: { width: 0, height: 6 },
    elevation: 10,
  },
  btnDisabled: { opacity: 0.5, shadowOpacity: 0 },
  btnInner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '800', letterSpacing: 0.3 },
});