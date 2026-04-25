import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { pick, types, errorCodes } from '@react-native-documents/picker';
import { launchImageLibrary } from 'react-native-image-picker';
import Toast from 'react-native-toast-message';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useDispatch, useSelector } from 'react-redux';
import uuid from 'react-native-uuid';

import { CONVERSIONS } from '../utils/constants';
import { ConversionType } from '../types';
import { convertFile, ConversionResult } from '../services/conversionService';
import FilePickerModal from '../components/converter/FilePickerModal';
import ConversionResultModal from '../components/converter/ConversionResultModal';
import { addRecentFile } from '../store/slices/fileSlice';
import { RootState, AppDispatch } from '../store';
import { saveRecentFiles } from '../utils/storage';

// ── Helper: derive FileItem.type from output format string ───────────────────
function formatToType(fmt: string): string {
  const f = fmt.toLowerCase();
  if (f === 'pdf')                                return 'pdf';
  if (f === 'docx' || f === 'doc')                return 'word';
  if (f === 'xlsx' || f === 'xls')                return 'excel';
  if (['jpg', 'jpeg', 'png', 'webp'].includes(f)) return 'image';
  return 'pdf';
}

// ── Helper: human-readable file size from bytes ──────────────────────────────
function formatBytes(bytes?: number | null): string {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// ── ONLY valid MaterialCommunityIcons names used here ────────────────────────
const TOOL_CONFIG: Record<string, { icon: string; iconColor: string; bgColor: string }> = {
  '1':  { icon: 'file-image',       iconColor: '#7C5CFC', bgColor: '#EEE8FF' },
  '2':  { icon: 'file-image',       iconColor: '#2563EB', bgColor: '#DBEAFE' },
  '3':  { icon: 'image-edit',       iconColor: '#059669', bgColor: '#D1FAE5' },
  '4':  { icon: 'image-edit',       iconColor: '#D97706', bgColor: '#FEF3C7' },
  '5':  { icon: 'swap-horizontal',  iconColor: '#DC2626', bgColor: '#FEE2E2' },
  '6':  { icon: 'swap-horizontal',  iconColor: '#7C3AED', bgColor: '#EDE9FE' },
  '7':  { icon: 'file-pdf-box',     iconColor: '#D97706', bgColor: '#FEF3C7' },
  '8':  { icon: 'file-pdf-box',     iconColor: '#EF4444', bgColor: '#FEE2E2' },
  '9':  { icon: 'image-multiple',   iconColor: '#7C5CFC', bgColor: '#EEE8FF' },
  '10': { icon: 'file-image',       iconColor: '#2563EB', bgColor: '#DBEAFE' },
  '11': { icon: 'file-image',       iconColor: '#059669', bgColor: '#D1FAE5' },
  '12': { icon: 'file-document',    iconColor: '#7C3AED', bgColor: '#EDE9FE' },
};

// ── Sections ──────────────────────────────────────────────────────────────────
const SECTIONS = [
  { title: 'Image to PDF',      ids: ['9', '10', '11']          },
  { title: 'PDF to Image',      ids: ['7', '8']                 },
  { title: 'Image Conversions', ids: ['1', '2', '3', '4', '5', '6'] },
  { title: 'Document',          ids: ['12']                     },
];

// ── ToolCard ──────────────────────────────────────────────────────────────────
function ToolCard({ item, onPress }: { item: ConversionType; onPress: () => void }) {
  const cfg = TOOL_CONFIG[item.id] ?? {
    icon: 'file-outline',
    iconColor: '#6B7280',
    bgColor: '#F3F4F6',
  };

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.75}>
      <View style={[styles.iconCircle, { backgroundColor: cfg.bgColor }]}>
        <Icon name={cfg.icon} size={32} color={cfg.iconColor} />
      </View>
      <Text style={styles.cardLabel} numberOfLines={2} textBreakStrategy="simple">
        {item.label}
      </Text>
    </TouchableOpacity>
  );
}

// ── Section header ────────────────────────────────────────────────────────────
function SectionHeader({ title }: { title: string }) {
  return (
    <View style={styles.sectionHeader}>
      <View style={styles.sectionLine} />
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionLine} />
    </View>
  );
}

// ── Main Screen ───────────────────────────────────────────────────────────────
export default function ToolsScreen({ route }: any) {
  const dispatch    = useDispatch<AppDispatch>();
  const recentFiles = useSelector((s: RootState) => s.files.recentFiles);

  const [activeTool,       setActiveTool]      = useState<ConversionType | null>(null);
  const [pickerVisible,    setPickerVisible]    = useState(false);
  const [resultVisible,    setResultVisible]    = useState(false);
  const [sourceFileName,   setSourceFileName]   = useState('');
  const [sourceUri,        setSourceUri]        = useState<string | null>(null); // ✅ NEW
  const [isConverting,     setIsConverting]     = useState(false);
  const [conversionError,  setConversionError]  = useState<string | null>(null);
  const [conversionResult, setConversionResult] = useState<ConversionResult | null>(null);

  // ── Auto-open when coming from ScannerScreen ─────────────────────────────
  useEffect(() => {
    const scannedUri: string | undefined = route?.params?.scannedUri;
    if (scannedUri) {
      const imgToPdfTool = CONVERSIONS.find(c => c.id === '9');
      if (imgToPdfTool) {
        setActiveTool(imgToPdfTool);
        const name = scannedUri.split('/').pop() ?? 'scanned.jpg';
        startConversion(scannedUri, name, 'image/jpeg', imgToPdfTool);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [route?.params?.scannedUri]);

  const handleCardPress = (tool: ConversionType) => {
    setActiveTool(tool);
    setPickerVisible(true);
  };

  const handlePickFile = async () => {
    setPickerVisible(false);
    if (!activeTool) return;
    try {
      const [picked] = await pick({ type: [types.allFiles] });
      await startConversion(
        picked.uri,
        picked.name ?? picked.uri.split('/').pop() ?? 'file',
        picked.type ?? 'application/octet-stream',
        activeTool,
      );
    } catch (e: any) {
      if (e?.code !== errorCodes.OPERATION_CANCELED) {
        Toast.show({ type: 'error', text1: 'Could not open file picker.' });
      }
    }
  };

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
      await startConversion(
        asset.uri,
        asset.fileName ?? asset.uri.split('/').pop() ?? 'image.jpg',
        asset.type ?? 'image/jpeg',
        activeTool,
      );
    });
  };

  const startConversion = async (
    uri:  string,
    name: string,
    mime: string,
    tool: ConversionType,
  ) => {
    setSourceFileName(name);
    setSourceUri(uri);           // ✅ NEW: store the picked file uri for the thumbnail
    setConversionError(null);
    setConversionResult(null);
    setIsConverting(true);
    setResultVisible(true);

    try {
      const result = await convertFile(uri, tool.from, tool.to, mime);
      setConversionResult(result);

      const newFile = {
        id:   uuid.v4() as string,
        name: result.fileName ?? name,
        size: formatBytes(result.fileSize ?? undefined),
        date: new Date().toLocaleDateString(),
        type: formatToType(tool.to),
        ...(result.downloadUrl ? { path: result.downloadUrl } : {}),
      };

      dispatch(addRecentFile(newFile));
      const updated = [newFile, ...recentFiles.filter(f => f.id !== newFile.id)].slice(0, 20);
      saveRecentFiles(updated);

    } catch (err: any) {
      const msg: string = err.message ?? 'Conversion failed. Please try again.';

      if (msg.toLowerCase().includes('already')) {
        setResultVisible(false);
        Toast.show({ type: 'info', text1: 'Already converted ✓', text2: msg, visibilityTime: 4000 });
        return;
      }
      if (msg.toLowerCase().includes('wrong file type')) {
        setResultVisible(false);
        Toast.show({ type: 'error', text1: 'Wrong file type', text2: msg, visibilityTime: 5000 });
        return;
      }
      setConversionError(msg);
    } finally {
      setIsConverting(false);
    }
  };

  const handleResultClose = () => {
    setResultVisible(false);
    setConversionResult(null);
    setConversionError(null);
    setSourceUri(null);          // ✅ NEW: clear uri on close
    setActiveTool(null);
  };

  const renderSection = (section: { title: string; ids: string[] }) => {
    const tools = section.ids
      .map(id => CONVERSIONS.find(c => c.id === id))
      .filter((c): c is ConversionType => Boolean(c));
    if (!tools.length) return null;

    return (
      <View key={section.title}>
        <SectionHeader title={section.title} />
        <View style={styles.grid}>
          {tools.map(tool => (
            <ToolCard key={tool.id} item={tool} onPress={() => handleCardPress(tool)} />
          ))}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.pageTitle}>Tools</Text>
          <Text style={styles.pageSubtitle}>All the tools you need in one place</Text>
        </View>

        {SECTIONS.map(renderSection)}
      </ScrollView>

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
        sourceUri={sourceUri}         // ✅ NEW
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
  safeArea:      { flex: 1, backgroundColor: '#F0F2F8' },
  scrollContent: { paddingBottom: 40 },

  header: {
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 8,
  },
  pageTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#111827',
    letterSpacing: -0.4,
  },
  pageSubtitle: {
    fontSize: 13,
    color: '#9CA3AF',
    marginTop: 3,
  },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 28,
    marginBottom: 16,
    paddingHorizontal: 20,
    gap: 10,
  },
  sectionLine: {
    height: 1,
    backgroundColor: '#E5E7EB',
    flex: 1,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#6B7280',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },

  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    gap: 12,
  },

  card: {
    width: '30%',
    flexGrow: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingTop: 20,
    paddingBottom: 16,
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#8B9DB5',
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },

  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },

  cardLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1F2937',
    textAlign: 'center',
    lineHeight: 17,
  },
});