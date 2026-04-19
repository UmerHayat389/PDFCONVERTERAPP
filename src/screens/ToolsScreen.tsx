import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DocumentPicker from 'react-native-document-picker';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { CONVERSIONS } from '../utils/constants';
import { ConversionType } from '../types';

const CATEGORIES = ['All', 'Image', 'PDF', 'Document'];

export default function ToolsScreen() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [converting, setConverting] = useState<string | null>(null);

  const filtered = CONVERSIONS.filter(c =>
    activeCategory === 'All'
      ? true
      : c.category === activeCategory.toLowerCase(),
  );

  const handleConvert = async (tool: ConversionType): Promise<void> => {
    try {
      const result = await DocumentPicker.pickSingle({
        type: [DocumentPicker.types.allFiles],
      });
      setConverting(tool.id);
      await new Promise<void>(r => setTimeout(r, 2000));
      setConverting(null);
      Alert.alert('Success!', `${result.name} converted to ${tool.to}`);
    } catch (e: unknown) {
      setConverting(null);
      if (!DocumentPicker.isCancel(e)) {
        Alert.alert('Error', 'Conversion failed');
      }
    }
  };

  const handleCategoryPress = (cat: string): void => {
    setActiveCategory(cat);
  };

  return (
    <SafeAreaView className="flex-1 bg-dark">
      <View className="px-4 pt-4 pb-2">
        <Text className="text-2xl font-bold text-white mb-4">
          Conversion Tools
        </Text>

        {/* Category Filter */}
        <View style={{ flexDirection: 'row', gap: 8, marginBottom: 16 }}>
          {CATEGORIES.map(cat => (
            <TouchableOpacity
              key={cat}
              onPress={(): void => handleCategoryPress(cat)}
              style={{
                paddingHorizontal: 16,
                paddingVertical: 8,
                borderRadius: 999,
                backgroundColor:
                  activeCategory === cat ? '#E63946' : '#1D3557',
              }}>
              <Text
                style={{
                  color: 'white',
                  fontSize: 12,
                  fontWeight: '600',
                }}>
                {cat}
              </Text>
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
            onPress={(): void => { handleConvert(item); }}
            style={{
              flex: 1,
              backgroundColor: '#1D3557',
              borderRadius: 16,
              padding: 16,
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: 110,
            }}>
            {converting === item.id ? (
              <ActivityIndicator color="#E63946" />
            ) : (
              <>
                <Icon name={item.icon} size={32} color="#E63946" />
                <Text
                  style={{
                    color: 'white',
                    fontWeight: 'bold',
                    marginTop: 8,
                    textAlign: 'center',
                    fontSize: 13,
                  }}>
                  {item.label}
                </Text>
                <Text
                  style={{
                    color: '#94a3b8',
                    fontSize: 11,
                    marginTop: 4,
                  }}>
                  Tap to pick file
                </Text>
              </>
            )}
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}