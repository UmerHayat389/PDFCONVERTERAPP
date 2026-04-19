import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { ConversionType } from '../../types';

type Props = {
  item: ConversionType;
  onPress: (item: ConversionType) => void;
  isConverting: boolean;
};

export default function ConversionCard({ item, onPress, isConverting }: Props) {
  return (
    <TouchableOpacity
      onPress={() => onPress(item)}
      className="flex-1 bg-secondary rounded-2xl p-4 items-center justify-center"
      style={{ minHeight: 110 }}>
      {isConverting ? (
        <ActivityIndicator color="#E63946" />
      ) : (
        <>
          <Icon name={item.icon} size={32} color="#E63946" />
          <Text className="text-white font-bold mt-2 text-center text-sm">
            {item.label}
          </Text>
          <Text className="text-slate-400 text-xs mt-1">Tap to pick file</Text>
        </>
      )}
    </TouchableOpacity>
  );
}