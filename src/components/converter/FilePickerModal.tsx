import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

type Props = {
  visible:      boolean;
  onClose:      () => void;
  onPickFile:   () => void;
  onPickImage:  () => void;
};

export default function FilePickerModal({
  visible,
  onClose,
  onPickFile,
  onPickImage,
}: Props) {
  return (
    <Modal transparent animationType="slide" visible={visible} onRequestClose={onClose}>
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}>
        <TouchableOpacity activeOpacity={1} style={styles.sheet}>
          <View style={styles.handle} />
          <Text style={styles.title}>Choose Source</Text>

          <TouchableOpacity onPress={onPickFile} style={styles.option}>
            <View style={styles.optionIcon}>
              <Icon name="file-outline" size={22} color="#E63946" />
            </View>
            <View>
              <Text style={styles.optionText}>Pick from Files</Text>
              <Text style={styles.optionSub}>PDF, TXT, DOCX, images…</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity onPress={onPickImage} style={styles.option}>
            <View style={styles.optionIcon}>
              <Icon name="image-outline" size={22} color="#E63946" />
            </View>
            <View>
              <Text style={styles.optionText}>Pick from Gallery</Text>
              <Text style={styles.optionSub}>JPG, PNG, WEBP…</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity onPress={onClose} style={styles.cancel}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </TouchableOpacity>
      </TouchableOpacity>
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
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    paddingBottom: 40,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: '#457B9D',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  title: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0D1B2A',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
  },
  optionIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(230,57,70,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  optionText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 15,
    marginBottom: 2,
  },
  optionSub: {
    color: '#94a3b8',
    fontSize: 12,
  },
  cancel: {
    alignItems: 'center',
    paddingVertical: 14,
    marginTop: 4,
  },
  cancelText: {
    color: '#94a3b8',
    fontWeight: '600',
    fontSize: 15,
  },
});