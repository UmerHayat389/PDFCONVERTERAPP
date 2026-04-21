import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, StyleSheet } from 'react-native';
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
      style={styles.card}>
      {isConverting ? (
        <ActivityIndicator color="#E63946" />
      ) : (
        <>
          <Icon name={item.icon} size={32} color="#E63946" />
          <Text style={styles.label}>{item.label}</Text>
          <Text style={styles.sub}>Tap to pick file</Text>
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: '#1D3557',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 110,
  },
  label: {
    color: 'white',
    fontWeight: 'bold',
    marginTop: 8,
    textAlign: 'center',
    fontSize: 13,
  },
  sub: {
    color: '#94a3b8',
    fontSize: 12,
    marginTop: 4,
  },
});