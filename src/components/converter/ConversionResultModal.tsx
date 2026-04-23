import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Toast from 'react-native-toast-message';
import {
  Camera, useCameraDevice, useCameraPermission,
} from 'react-native-vision-camera';
import { pick, types } from '@react-native-documents/picker';

export default function ScannerScreen({ navigation }: any) {
  const { hasPermission, requestPermission } = useCameraPermission();
  const device = useCameraDevice('back');
  const camera = useRef<any>(null);
  const [flash, setFlash] = useState<'off' | 'on'>('off');
  const [capturing, setCapturing] = useState(false);

  useEffect(() => {
    if (!hasPermission) requestPermission();
  }, []);

  const handleCapture = async () => {
    if (!camera.current) {
      Toast.show({ type: 'error', text1: 'Camera not ready', text2: 'Please wait and try again' });
      return;
    }
    try {
      setCapturing(true);
      const photo = await camera.current.takePhoto({ flash });
      const photoUri = `file://${photo.path}`;
      navigation.navigate('Tools', { scannedUri: photoUri });
    } catch (e: any) {
      Toast.show({ type: 'error', text1: 'Capture Failed', text2: 'Could not capture photo' });
    } finally {
      setCapturing(false);
    }
  };

  const handlePickFromGallery = async () => {
    try {
      const [file] = await pick({ type: [types.images] });
      if (!file?.uri) {
        Toast.show({ type: 'info', text1: 'No file selected' });
        return;
      }
      navigation.navigate('Tools', { scannedUri: file.uri });
    } catch {
      Toast.show({ type: 'info', text1: 'No file selected' });
    }
  };

  if (!hasPermission) {
    return (
      <SafeAreaView style={styles.permissionScreen}>
        <Icon name="camera-off" size={70} color="#E63946" />
        <Text style={styles.permissionTitle}>Camera Permission Required</Text>
        <Text style={styles.permissionSub}>We need camera access to scan documents</Text>
        <TouchableOpacity style={styles.grantBtn} onPress={requestPermission}>
          <Text style={styles.grantBtnText}>Grant Permission</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  if (!device) {
    return (
      <SafeAreaView style={styles.permissionScreen}>
        <Icon name="camera-off" size={70} color="#E63946" />
        <Text style={styles.permissionTitle}>No Camera Found</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.title}>Document Scanner</Text>
        <Text style={styles.subtitle}>Align document in frame and capture</Text>
      </View>

      <View style={styles.cameraBox}>
        <Camera
          ref={camera}
          style={StyleSheet.absoluteFill}
          device={device}
          isActive={true}
          // ✅ photo={true} removed — not a valid prop in vision-camera v4
        />
        <View style={styles.overlayContainer}>
          <View style={styles.frame}>
            <View style={[styles.corner, styles.topLeft]} />
            <View style={[styles.corner, styles.topRight]} />
            <View style={[styles.corner, styles.bottomLeft]} />
            <View style={[styles.corner, styles.bottomRight]} />
          </View>
        </View>
      </View>

      <View style={styles.controls}>
        <TouchableOpacity style={styles.controlBtn} onPress={handlePickFromGallery}>
          <Icon name="image-multiple" size={24} color="white" />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleCapture}
          style={[styles.captureBtn, capturing && { opacity: 0.6 }]}
          disabled={capturing}>
          <Icon name="camera" size={36} color="white" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.controlBtn}
          onPress={() => setFlash(f => (f === 'off' ? 'on' : 'off'))}>
          <Icon name={flash === 'on' ? 'flash' : 'flash-off'} size={24} color="white" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#0D1B2A' },
  permissionScreen: {
    flex: 1, backgroundColor: '#0D1B2A',
    alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24,
  },
  permissionTitle: { color: 'white', fontSize: 20, fontWeight: 'bold', marginTop: 24, textAlign: 'center' },
  permissionSub: { color: '#94a3b8', fontSize: 14, marginTop: 8, textAlign: 'center' },
  grantBtn: { backgroundColor: '#E63946', paddingHorizontal: 32, paddingVertical: 16, borderRadius: 999, marginTop: 24 },
  grantBtnText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
  header: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8 },
  title: { fontSize: 24, fontWeight: 'bold', color: 'white' },
  subtitle: { color: '#94a3b8', fontSize: 14, marginTop: 4 },
  cameraBox: { flex: 1, marginHorizontal: 16, borderRadius: 24, overflow: 'hidden', backgroundColor: '#1D3557' },
  overlayContainer: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center' },
  frame: { width: 288, height: 384, position: 'relative' },
  corner: { position: 'absolute', width: 32, height: 32, borderColor: '#E63946', borderWidth: 2 },
  topLeft: { top: 0, left: 0, borderRightWidth: 0, borderBottomWidth: 0, borderTopLeftRadius: 8 },
  topRight: { top: 0, right: 0, borderLeftWidth: 0, borderBottomWidth: 0, borderTopRightRadius: 8 },
  bottomLeft: { bottom: 0, left: 0, borderRightWidth: 0, borderTopWidth: 0, borderBottomLeftRadius: 8 },
  bottomRight: { bottom: 0, right: 0, borderLeftWidth: 0, borderTopWidth: 0, borderBottomRightRadius: 8 },
  controls: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', paddingVertical: 24, paddingHorizontal: 32 },
  controlBtn: { backgroundColor: '#1D3557', padding: 16, borderRadius: 999 },
  captureBtn: { backgroundColor: '#E63946', width: 80, height: 80, borderRadius: 40, alignItems: 'center', justifyContent: 'center' },
});