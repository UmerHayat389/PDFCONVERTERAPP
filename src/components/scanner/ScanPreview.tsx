import React from 'react';
import { View, Image, TouchableOpacity, Text } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

type Props = {
  uri: string;
  onRetake: () => void;
  onSave: () => void;
};

export default function ScanPreview({ uri, onRetake, onSave }: Props) {
  return (
    <View className="flex-1 bg-dark">
      <Image source={{ uri }} className="flex-1" resizeMode="contain" />
      <View className="flex-row justify-around p-6 bg-dark">
        <TouchableOpacity
          onPress={onRetake}
          className="flex-row items-center gap-2 bg-secondary px-6 py-3 rounded-full">
          <Icon name="camera-retake" size={20} color="white" />
          <Text className="text-white font-semibold">Retake</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={onSave}
          className="flex-row items-center gap-2 bg-primary px-6 py-3 rounded-full">
          <Icon name="content-save" size={20} color="white" />
          <Text className="text-white font-semibold">Save</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}