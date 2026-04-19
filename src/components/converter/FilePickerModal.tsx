import React from 'react';
import { View, Text, TouchableOpacity, Modal } from 'react-native';
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
      <View className="flex-1 justify-end bg-black/60">
        <View className="bg-secondary rounded-t-3xl p-6">
          <Text className="text-white text-lg font-bold mb-4 text-center">
            Pick Source
          </Text>

          <TouchableOpacity
            onPress={onPickFile}
            className="flex-row items-center gap-3 bg-dark rounded-xl p-4 mb-3">
            <Icon name="file-outline" size={24} color="#E63946" />
            <Text className="text-white font-semibold">Pick from Files</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={onPickImage}
            className="flex-row items-center gap-3 bg-dark rounded-xl p-4 mb-3">
            <Icon name="image-outline" size={24} color="#E63946" />
            <Text className="text-white font-semibold">Pick from Gallery</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={onClose}
            className="items-center py-3 mt-2">
            <Text className="text-slate-400 font-semibold">Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}