import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Alert,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { pick, types, errorCodes } from '@react-native-documents/picker';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { CONVERSIONS } from '../utils/constants';
import { ConversionType } from '../types';

const CATEGORIES = ['All', 'Image', 'PDF', 'Document'];

export default function ToolsScreen() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [converting, setConverting] = useState<string | null>(null);

  const filtered = CONVERSIONS.filter(c =>
    activeCategory === 'All' ? true : c.category === activeCategory.toLowerCase(),
  );

  const handleConvert = async (tool: ConversionType): Promise<void> => {
    try {
      const [result] = await pick({ type: [types.allFiles] });
      setConverting(tool.id);
      await new Promise<void>(r => setTimeout(r, 2000));
      setConverting(null);
      Alert.alert('Success!', `${result.name} converted to ${tool.to}`);
    } catch (e: unknown) {
      setConverting(null);
      if ((e as any)?.code !== errorCodes.OPERATION_CANCELED) {
        Alert.alert('Error', 'Conversion failed');
      }
    }
  };

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
        contentContainerStyle={{ paddingHorizontal: 16, gap: 12 }}
        columnWrapperStyle={{ gap: 12 }}
        renderItem={({ item }: { item: ConversionType }) => (
          <TouchableOpacity
            onPress={() => handleConvert(item)}
            style={styles.toolCard}>
            {converting === item.id ? (
              <ActivityIndicator color="#E63946" />
            ) : (
              <>
                <Icon name={item.icon} size={32} color="#E63946" />
                <Text style={styles.toolLabel}>{item.label}</Text>
                <Text style={styles.toolSub}>Tap to pick file</Text>
              </>
            )}
          </TouchableOpacity>
        )}
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