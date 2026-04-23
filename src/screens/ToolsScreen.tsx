import React, { useState } from 'react';
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
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { CONVERSIONS } from '../utils/constants';
import { ConversionType } from '../types';
import { convertFile, ConversionResult } from '../services/conversionService';
import { getFileExtension } from '../utils/fileUtils';
import FilePickerModal from '../components/converter/FilePickerModal';
import ConversionResultModal from '../components/converter/ConversionResultModal';

const CATEGORIES = ['All', 'Image', 'PDF', 'Document'];

export default function ToolsScreen() {
  const [activeCategory, setActiveCategory] = useState('All');

  // Which conversion tool was tapped
  const [activeTool, setActiveTool] = useState<ConversionType | null>(null);

  // FilePickerModal — choose gallery vs files
  const [pickerVisible, setPickerVisible] = useState(false);

  // ConversionResultModal state
  const [resultVisible, setResultVisible] = useState(false);
  const [sourceFileName, setSourceFileName] = useState('');
  const [isConverting, setIsConverting] = useState(false);
  const [conversionError, setConversionError] = useState<string | null>(null);
  const [conversionResult, setConversionResult] = useState<ConversionResult | null>(null);

  const filtered = CONVERSIONS.filter(c =>
    activeCategory === 'All' ? true : c.category === activeCategory.toLowerCase(),
  );

  // Step 1: user taps a conversion card
  const handleCardPress = (tool: ConversionType) => {
    setActiveTool(tool);
    setPickerVisible(true);
  };

  // Step 2a: pick from Files
  const handlePickFile = async () => {
    setPickerVisible(false);
    if (!activeTool) return;

    try {
      const [picked] = await pick({ type: [types.allFiles] });

      const uri = picked.uri;
      const name = picked.name ?? uri.split('/').pop() ?? 'file';
      const mime = picked.type ?? 'application/octet-stream';

      await startConversion(uri, name, mime, activeTool);
    } catch (e: any) {
      if (e?.code !== errorCodes.OPERATION_CANCELED) {
        showError('Could not open file picker.');
      }
    }
  };

  // Step 2b: pick from Gallery
  const handlePickImage = async () => {
    setPickerVisible(false);
    if (!activeTool) return;

    launchImageLibrary(
      { mediaType: 'photo', quality: 1 },
      async response => {
        if (response.didCancel) return;
        if (response.errorCode) {
          showError(response.errorMessage ?? 'Gallery error');
          return;
        }

        const asset = response.assets?.[0];
        if (!asset?.uri) return;

        const uri = asset.uri;
        const name = asset.fileName ?? uri.split('/').pop() ?? 'image.jpg';
        const mime = asset.type ?? 'image/jpeg';

        await startConversion(uri, name, mime, activeTool);
      },
    );
  };

  // Step 3: call backend, show result modal
  const startConversion = async (
    uri: string,
    name: string,
    mime: string,
    tool: ConversionType,
  ) => {
    // Open modal immediately in "converting" state
    setSourceFileName(name);
    setIsConverting(true);
    setConversionError(null);
    setConversionResult(null);
    setResultVisible(true);

    try {
      const result = await convertFile(uri, tool.from, tool.to, mime);
      setConversionResult(result);
    } catch (err: any) {
      setConversionError(err.message ?? 'Conversion failed. Please try again.');
    } finally {
      setIsConverting(false);
    }
  };

  const showError = (msg: string) => {
    setConversionError(msg);
    setIsConverting(false);
    setResultVisible(true);
  };

  const handleResultClose = () => {
    setResultVisible(false);
    setConversionResult(null);
    setConversionError(null);
    setActiveTool(null);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
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

      {/* Conversion grid */}
      <FlatList
        data={filtered}
        keyExtractor={(item: ConversionType) => item.id}
        numColumns={2}
        contentContainerStyle={{ paddingHorizontal: 16, gap: 12 }}
        columnWrapperStyle={{ gap: 12 }}
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

      {/* Step 2: picker modal (gallery vs files) */}
      <FilePickerModal
        visible={pickerVisible}
        onClose={() => setPickerVisible(false)}
        onPickFile={handlePickFile}
        onPickImage={handlePickImage}
      />

      {/* Step 3: conversion result modal */}
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
  safeArea: {
    flex: 1,
    backgroundColor: '#0D1B2A',
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 16,
  },
  categories: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  categoryBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: '#1D3557',
  },
  categoryBtnActive: {
    backgroundColor: '#E63946',
  },
  categoryText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
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
  toolSub: {
    color: '#94a3b8',
    fontSize: 11,
    marginTop: 4,
  },
});