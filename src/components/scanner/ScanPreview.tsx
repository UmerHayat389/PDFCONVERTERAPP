import React from 'react';
import { View, Image, TouchableOpacity, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

type Props = {
  uri: string;
  onRetake: () => void;
  onSave: () => void;
};

export default function ScanPreview({ uri, onRetake, onSave }: Props) {
  return (
    <View style={styles.container}>
      <Image source={{ uri }} style={styles.image} resizeMode="contain" />
      <View style={styles.controls}>
        <TouchableOpacity onPress={onRetake} style={styles.retakeBtn}>
          <Icon name="camera-retake" size={20} color="white" />
          <Text style={styles.btnText}>Retake</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={onSave} style={styles.saveBtn}>
          <Icon name="content-save" size={20} color="white" />
          <Text style={styles.btnText}>Save</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0D1B2A',
  },
  image: {
    flex: 1,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 24,
    backgroundColor: '#0D1B2A',
  },
  retakeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#1D3557',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 999,
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#E63946',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 999,
  },
  btnText: {
    color: 'white',
    fontWeight: '600',
    marginLeft: 8,
  },
});