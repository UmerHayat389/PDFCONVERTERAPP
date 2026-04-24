import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { pick, types, errorCodes } from '@react-native-documents/picker';
import { launchImageLibrary } from 'react-native-image-picker';
import Toast from 'react-native-toast-message';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { CONVERSIONS } from '../utils/constants';
import { ConversionType } from '../types';
import { convertFile, ConversionResult } from '../services/conversionService';
import FilePickerModal from '../components/converter/FilePickerModal';
import ConversionResultModal from '../components/converter/ConversionResultModal';

const CATEGORIES = ['All', 'Image', 'PDF', 'Document'];

export default function ToolsScreen({ route }: any) {
  const [activeCategory, setActiveCategory] = useState('All');
  const [activeTool, setActiveTool] = useState<ConversionType | null>(null);
  const [pickerVisible, setPickerVisible] = useState(false);
  const [resultVisible, setResultVisible] = useState(false);
  const [sourceFileName, setSourceFileName] = useState('');
  const [isConverting, setIsConverting] = useState(false);
  const [conversionError, setConversionError] = useState<string | null>(null);
  const [conversionResult, setConversionResult] = useState<ConversionResult | null>(null);

  // ✅ FIX: consume scannedUri that ScannerScreen passes via navigation.navigate('Tools', {...})
  // When user scans a doc and lands here, open the file picker modal automatically.
  useEffect(() => {
    const scannedUri: string | undefined = route?.params?.scannedUri;
    if (scannedUri) {
      // Pre-select Image→PDF as the most logical tool for a scanned document
      const imgToPdfTool = CONVERSIONS.find(c => c.id === '9');
      if (imgToPdfTool) {
        setActiveTool(imgToPdfTool);
        // Auto-start conversion with the scanned image (it's already a local file URI)
        const name = scannedUri.split('/').pop() ?? 'scanned.jpg';
        startConversion(scannedUri, name, 'image/jpeg', imgToPdfTool);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [route?.params?.scannedUri]);

  const filtered = CONVERSIONS.filter(c =>
    activeCategory === 'All' ? true : c.category === activeCategory.toLowerCase(),
  );

  const handleCardPress = (tool: ConversionType) => {
    setActiveTool(tool);
    setPickerVisible(true);
  };

  // ─── Pick file from Files app ───────────────────────────────────────────────
  const handlePickFile = async () => {
    setPickerVisible(false);
    if (!activeTool) return;

    try {
      const [picked] = await pick({ type: [types.allFiles] });
      const uri  = picked.uri;
      const name = picked.name ?? uri.split('/').pop() ?? 'file';
      const mime = picked.type ?? 'application/octet-stream';
      await startConversion(uri, name, mime, activeTool);
    } catch (e: any) {
      if (e?.code !== errorCodes.OPERATION_CANCELED) {
        Toast.show({ type: 'error', text1: 'Could not open file picker.' });
      }
    }
  };

  // ─── Pick from Gallery ──────────────────────────────────────────────────────
  const handlePickImage = async () => {
    setPickerVisible(false);
    if (!activeTool) return;

    launchImageLibrary({ mediaType: 'photo', quality: 1 }, async response => {
      if (response.didCancel) return;
      if (response.errorCode) {
        Toast.show({ type: 'error', text1: response.errorMessage ?? 'Gallery error' });
        return;
      }
      const asset = response.assets?.[0];
      if (!asset?.uri) return;

      const uri  = asset.uri;
      const name = asset.fileName ?? uri.split('/').pop() ?? 'image.jpg';
      const mime = asset.type ?? 'image/jpeg';
      await startConversion(uri, name, mime, activeTool);
    });
  };

  // ─── Core conversion flow ───────────────────────────────────────────────────
  const startConversion = async (
    uri: string,
    name: string,
    mime: string,
    tool: ConversionType,
  ) => {
    setSourceFileName(name);
    setConversionError(null);
    setConversionResult(null);
    setIsConverting(true);
    setResultVisible(true);

    try {
      // convertFile now does the extension check internally and throws
      // with a user-readable message for 'already' and 'mismatch' cases.
      const result = await convertFile(uri, tool.from, tool.to, mime);
      setConversionResult(result);
    } catch (err: any) {
      const msg: string = err.message ?? 'Conversion failed. Please try again.';

      // ✅ If it's an "already in this format" error, show a friendly toast
      // instead of the full error modal.
      if (msg.toLowerCase().includes('already')) {
        setResultVisible(false);
        Toast.show({
          type: 'info',
          text1: 'Already converted ✓',
          text2: msg,
          visibilityTime: 4000,
        });
        return;
      }

      // ✅ Wrong file type — also show as toast (user-friendly)
      if (msg.toLowerCase().includes('wrong file type')) {
        setResultVisible(false);
        Toast.show({
          type: 'error',
          text1: 'Wrong file type',
          text2: msg,
          visibilityTime: 5000,
        });
        return;
      }

      // All other errors go in the result modal
      setConversionError(msg);
    } finally {
      setIsConverting(false);
    }
  };

  const handleResultClose = () => {
    setResultVisible(false);
    setConversionResult(null);
    setConversionError(null);
    setActiveTool(null);
  };

  // ─── UI ─────────────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.title}>Conversion Tools</Text>
        <View style={styles.categories}>
          {CATEGORIES.map(cat => (
            <TouchableOpacity
              key={cat}
              onPress={() => setActiveCategory(cat)}
              style={[
                styles.categoryBtn,
                activeCategory === cat && styles.categoryBtnActive,
              ]}>
              <Text style={styles.categoryText}>{cat}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item: ConversionType) => item.id}
        numColumns={2}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}
        columnWrapperStyle={{ gap: 12, marginBottom: 12 }}
        renderItem={({ item }: { item: ConversionType }) => (
          <TouchableOpacity
            onPress={() => handleCardPress(item)}
            style={styles.toolCard}>
            <Icon name={item.icon} size={32} color="#E63946" />
            <Text style={styles.toolLabel}>{item.label}</Text>
            <Text style={styles.toolSub}>Tap to pick file</Text>
          </TouchableOpacity>
        )}
      />

      <FilePickerModal
        visible={pickerVisible}
        onClose={() => setPickerVisible(false)}
        onPickFile={handlePickFile}
        onPickImage={handlePickImage}
      />

      <ConversionResultModal
        visible={resultVisible}
        onClose={handleResultClose}
        sourceFileName={sourceFileName}
        toFormat={activeTool?.to ?? ''}
        isConverting={isConverting}
        error={conversionError}
        downloadUrl={conversionResult?.downloadUrl ?? null}
        previewUrl={conversionResult?.previewUrl ?? null}
        fileName={conversionResult?.fileName ?? null}
        fileSize={conversionResult?.fileSize ?? null}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#0D1B2A' },
  header: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8 },
  title: { fontSize: 24, fontWeight: 'bold', color: 'white', marginBottom: 16 },
  categories: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  categoryBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: '#1D3557',
  },
  categoryBtnActive: { backgroundColor: '#E63946' },
  categoryText: { color: 'white', fontSize: 12, fontWeight: '600' },
  toolCard: {
    flex: 1,
    backgroundColor: '#1D3557',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 110,
  },
  toolLabel: {
    color: 'white',
    fontWeight: 'bold',
    marginTop: 8,
    textAlign: 'center',
    fontSize: 13,
  },
  toolSub: { color: '#94a3b8', fontSize: 11, marginTop: 4 },
});