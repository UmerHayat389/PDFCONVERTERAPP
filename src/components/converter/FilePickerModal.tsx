import React from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

type Props = {
  visible: boolean;
  onClose: () => void;
  onPickFile: () => void;
  onPickImage: () => void;
};

export default function FilePickerModal({
  visible,
  onClose,
  onPickFile,
  onPickImage,
}: Props) {
  return (
    <Modal transparent animationType="slide" visible={visible}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <Text style={styles.title}>Pick Source</Text>

          <TouchableOpacity onPress={onPickFile} style={styles.option}>
            <Icon name="file-outline" size={24} color="#E63946" />
            <Text style={styles.optionText}>Pick from Files</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={onPickImage} style={styles.option}>
            <Icon name="image-outline" size={24} color="#E63946" />
            <Text style={styles.optionText}>Pick from Gallery</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={onClose} style={styles.cancel}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  sheet: {
    backgroundColor: '#1D3557',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
  },
  title: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#0D1B2A',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  optionText: {
    color: 'white',
    fontWeight: '600',
    marginLeft: 12,
  },
  cancel: {
    alignItems: 'center',
    paddingVertical: 12,
    marginTop: 8,
  },
  cancelText: {
    color: '#94a3b8',
    fontWeight: '600',
  },
});