import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Toast from 'react-native-toast-message';
import { launchCamera } from 'react-native-image-picker';

export default function ScannerScreen({ navigation }: any) {
  const [capturing, setCapturing] = useState(false);

  const handleCapture = async () => {
    try {
      setCapturing(true);
      const result = await launchCamera({
        mediaType: 'photo',
        quality: 1,
        saveToPhotos: false,
      });

      if (result.didCancel) return;

      if (result.errorCode) {
        Toast.show({
          type: 'error',
          text1: 'Camera Error',
          text2: result.errorMessage ?? 'Could not open camera',
        });
        return;
      }

      const asset = result.assets?.[0];
      if (!asset?.uri) {
        Toast.show({ type: 'error', text1: 'No photo captured' });
        return;
      }

      navigation.navigate('Tools', { scannedUri: asset.uri });

    } catch (e: any) {
      Toast.show({
        type: 'error',
        text1: 'Capture Failed',
        text2: e?.message ?? 'Could not capture photo',
      });
    } finally {
      setCapturing(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.title}>Document Scanner</Text>
        <Text style={styles.subtitle}>Tap the button to capture a document</Text>
      </View>

      <View style={styles.previewBox}>
        <Icon name="file-document-outline" size={100} color="#1D3557" />
        <Text style={styles.previewText}>Camera will open when you tap capture</Text>
      </View>

      <View style={styles.controls}>
        <View style={styles.controlBtn} />
        <TouchableOpacity
          onPress={handleCapture}
          style={[styles.captureBtn, capturing && { opacity: 0.6 }]}
          disabled={capturing}>
          <Icon name="camera" size={36} color="white" />
        </TouchableOpacity>
        <View style={styles.controlBtn} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea:      { flex: 1, backgroundColor: '#0D1B2A' },
  header:        { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8 },
  title:         { fontSize: 24, fontWeight: 'bold', color: 'white' },
  subtitle:      { color: '#94a3b8', fontSize: 14, marginTop: 4 },
  previewBox:    { flex: 1, marginHorizontal: 16, borderRadius: 24, backgroundColor: '#1D3557', alignItems: 'center', justifyContent: 'center' },
  previewText:   { color: '#94a3b8', fontSize: 14, marginTop: 16, textAlign: 'center', paddingHorizontal: 32 },
  controls:      { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', paddingVertical: 24, paddingHorizontal: 32 },
  controlBtn:    { backgroundColor: '#1D3557', padding: 16, borderRadius: 999 },
  captureBtn:    { backgroundColor: '#E63946', width: 80, height: 80, borderRadius: 40, alignItems: 'center', justifyContent: 'center' },
});