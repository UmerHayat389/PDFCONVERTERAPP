import React, { useState, useRef, useEffect } from 'react';
import {
  View, TouchableOpacity, Text, StyleSheet,
  Alert, PermissionsAndroid, Platform, Animated,
  SafeAreaView,
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

  // ✅ FIX: Use a single ref that tracks whether a scan session is already
  // in-flight. We set it true the moment the button is pressed and only
  // reset it when the session fully ends (success OR error), never mid-flow.
  const isScanning = useRef(false);

  // Animations
  const fadeIn   = useRef(new Animated.Value(0)).current;
  const slideUp  = useRef(new Animated.Value(40)).current;
  const btnScale = useRef(new Animated.Value(1)).current;
  const scanLineY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeIn,  { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.spring(slideUp, { toValue: 0, useNativeDriver: true, damping: 18, stiffness: 100 }),
    ]).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(scanLineY, { toValue: 160, duration: 2000, useNativeDriver: true }),
        Animated.timing(scanLineY, { toValue: 0,   duration: 2000, useNativeDriver: true }),
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
    // ✅ FIX: Guard with ref (not state) so the check is synchronous and
    // never stale. State updates are async — two rapid presses could both
    // pass the `capturing` check before the re-render happens.
    if (isScanning.current) return;
    isScanning.current = true;

    animateBtn();
    setCapturing(true);

    try {
      const hasPermission = await requestCameraPermission();
      if (!hasPermission) {
        Alert.alert(
          'Permission Denied',
          'Camera permission is required to scan documents. Please enable it in Settings.',
        );
        return; // finally block will reset flags
      }

      const { scannedImages } = await DocumentScanner.scanDocument();

      // ✅ FIX: User cancelled (empty array) — treat as a normal cancellation,
      // not an error. Reset flags so they can try again immediately.
      if (!scannedImages || scannedImages.length === 0) {
        return; // finally block resets everything
      }

      // ✅ FIX: Dispatch and navigate BEFORE resetting isScanning so there is
      // no window where a second tap could sneak in while navigation is pending.
      dispatch(setCurrentScan({
        id: uuid.v4() as string,
        uri: scannedImages[0],
        createdAt: Date.now(),
      }));

      navigation.navigate('Crop');

    } catch {
      Alert.alert('Error', 'Failed to scan document. Please try again.');
    } finally {
      // ✅ FIX: Always reset both flags here — this is the single exit point
      // for every path (success, cancel, error, permission denied).
      // Previously the early `return` after checking scannedImages.length
      // did reach finally, but setting capturing=true happened AFTER
      // requestCameraPermission, meaning there was a gap where a second
      // press could slip through while awaiting the permission dialog.
      setCapturing(false);
      isScanning.current = false;
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Animated.View style={[styles.container, { opacity: fadeIn, transform: [{ translateY: slideUp }] }]}>

        {/* ── Header ── */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>Document Scanner</Text>
            <Text style={styles.headerSub}>Scan anything. Save everything.</Text>
          </View>
          <TouchableOpacity style={styles.historyBtn}>
            <Icon name="history" size={20} color="#4B5563" />
          </TouchableOpacity>
        </View>

        {/* ── Scan Frame ── */}
        <View style={styles.frameWrap}>
          <View style={styles.bgGlow} />
          <View style={styles.scanFrame}>
            <CornerMarker style={styles.cornerTL} />
            <CornerMarker style={styles.cornerTR} />
            <CornerMarker style={styles.cornerBL} />
            <CornerMarker style={styles.cornerBR} />

            {/* Centered content inside frame */}
            <View style={styles.frameCenterContent}>
              <Icon name="file-document-outline" size={44} color="rgba(63,97,254,0.28)" />
              {/* Dashed divider */}
              <View style={styles.dashedDividerRow}>
                {Array.from({ length: 12 }).map((_, i) => (
                  <View key={i} style={styles.dash} />
                ))}
              </View>
            </View>

            {/* Animated scan line */}
            <Animated.View style={[styles.scanLine, { transform: [{ translateY: scanLineY }] }]} />
          </View>
        </View>

        {/* ── Bottom group: stacked tight ── */}
        <View style={styles.bottomGroup}>

          {/* Info card */}
          <View style={styles.infoCard}>
            <View style={styles.infoIconBox}>
              <Icon name="lightbulb-on-outline" size={20} color="#3F61FE" />
            </View>
            <View style={styles.infoTextWrap}>
              <Text style={styles.infoTitle}>Position your document in good lighting</Text>
              <Text style={styles.infoDesc}>Tap the capture button to scan and auto-crop.</Text>
            </View>
          </View>

          {/* Feature cards */}
          <View style={styles.featureRow}>
            {[
              { icon: 'weather-sunny', label: 'Good Lighting', sub: 'Bright is best', color: '#3F61FE' },
              { icon: 'crop-free',     label: 'Flat Surface',  sub: 'Avoid wrinkles', color: '#22C55E' },
              { icon: 'auto-fix',      label: 'Auto-crop',     sub: 'Detect edges',   color: '#A855F7' },
            ].map((f, i) => (
              <View key={i} style={styles.featureCard}>
                <Icon name={f.icon} size={20} color={f.color} />
                <Text style={styles.featureLabel}>{f.label}</Text>
                <Text style={styles.featureSub}>{f.sub}</Text>
              </View>
            ))}
          </View>

          {/* CTA Button */}
          <Animated.View style={[styles.btnWrap, { transform: [{ scale: btnScale }] }]}>
            <TouchableOpacity
              style={[styles.btn, capturing && styles.btnDisabled]}
              onPress={capturePhoto}
              disabled={capturing}
              activeOpacity={0.85}>
              <Icon name="camera" size={20} color="#fff" />
              <Text style={styles.btnText}>{capturing ? 'Opening…' : 'Open Camera'}</Text>
            </TouchableOpacity>
          </Animated.View>

        </View>

      </Animated.View>
    </SafeAreaView>
  );
}

// Inline Icon shim to avoid extra import (uses the same package)
function Icon({ name, size, color }: { name: string; size: number; color: string }) {
  const VIcon = require('react-native-vector-icons/MaterialCommunityIcons').default;
  return <VIcon name={name} size={size} color={color} />;
}

const CORNER_SIZE  = 20;
const CORNER_THICK = 3;
const ACCENT       = '#3F61FE';

const styles = StyleSheet.create({
  safeArea: {
    flex: 1, backgroundColor: '#F3F5FB',
  },
  container: {
    flex: 1, backgroundColor: '#F3F5FB',
    paddingHorizontal: 20,
    paddingTop: 6,
    paddingBottom: 24,
  },

  // ── Header ──
  header: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 10, paddingBottom: 10,
  },
  headerTitle: {
    fontSize: 20, fontWeight: '800', color: '#111827', letterSpacing: -0.4,
  },
  headerSub: {
    fontSize: 12, color: '#9CA3AF', marginTop: 1, fontWeight: '500',
  },
  historyBtn: {
    width: 34, height: 34, borderRadius: 17,
    backgroundColor: '#FFFFFF',
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 6, elevation: 3,
  },

  // ── Scan Frame ──
  frameWrap: {
    flex: 1,
    marginBottom: 12,
  },
  bgGlow: {
    position: 'absolute', top: '15%', alignSelf: 'center',
    width: 160, height: 160, borderRadius: 80,
    backgroundColor: 'rgba(63,97,254,0.07)',
  },
  scanFrame: {
    flex: 1, borderRadius: 10,
    backgroundColor: '#EAEDFA',
    overflow: 'hidden',
    alignItems: 'center', justifyContent: 'center',
  },
  corner: {
    position: 'absolute', width: CORNER_SIZE, height: CORNER_SIZE,
    borderColor: ACCENT, borderRadius: 3,
  },
  cornerTL: { top: 0, left: 0, borderTopWidth: CORNER_THICK, borderLeftWidth: CORNER_THICK },
  cornerTR: { top: 0, right: 0, borderTopWidth: CORNER_THICK, borderRightWidth: CORNER_THICK },
  cornerBL: { bottom: 0, left: 0, borderBottomWidth: CORNER_THICK, borderLeftWidth: CORNER_THICK },
  cornerBR: { bottom: 0, right: 0, borderBottomWidth: CORNER_THICK, borderRightWidth: CORNER_THICK },

  frameCenterContent: {
    alignItems: 'center', gap: 14,
  },
  dashedDividerRow: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
  },
  dash: {
    width: 11, height: 2, borderRadius: 1,
    backgroundColor: 'rgba(63,97,254,0.35)',
  },
  scanLine: {
    position: 'absolute', top: 0, left: 0, right: 0, height: 2,
    backgroundColor: ACCENT, opacity: 0.5,
    shadowColor: ACCENT, shadowRadius: 6, shadowOpacity: 0.6, elevation: 4,
  },

  // ── Bottom group ──
  bottomGroup: {
    gap: 10,
  },

  // ── Info card ──
  infoCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#FFFFFF', borderRadius: 14,
    padding: 10,
    shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 6,
    elevation: 2, gap: 10,
  },
  infoIconBox: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: 'rgba(63,97,254,0.10)',
    alignItems: 'center', justifyContent: 'center',
  },
  infoTextWrap: { flex: 1 },
  infoTitle: {
    fontSize: 12, fontWeight: '700', color: '#111827', lineHeight: 17,
  },
  infoDesc: {
    fontSize: 11, color: '#9CA3AF', marginTop: 1, lineHeight: 15,
  },

  // ── Feature cards ──
  featureRow: {
    flexDirection: 'row', gap: 8,
  },
  featureCard: {
    flex: 1, backgroundColor: '#FFFFFF',
    borderRadius: 14, paddingVertical: 12, paddingHorizontal: 8,
    alignItems: 'center', gap: 5,
    shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 6, elevation: 2,
  },
  featureLabel: {
    fontSize: 11, fontWeight: '700', color: '#111827', textAlign: 'center',
  },
  featureSub: {
    fontSize: 10, color: '#9CA3AF', textAlign: 'center',
  },

  // ── CTA ──
  btnWrap: { width: '100%' },
  btn: {
    backgroundColor: ACCENT, borderRadius: 16,
    paddingVertical: 15, width: '100%',
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', gap: 10,
    shadowColor: ACCENT, shadowRadius: 14,
    shadowOpacity: 0.35, shadowOffset: { width: 0, height: 5 }, elevation: 10,
  },
  btnDisabled: { opacity: 0.5, shadowOpacity: 0 },
  btnText: { color: '#fff', fontSize: 15, fontWeight: '800', letterSpacing: 0.2 },
});