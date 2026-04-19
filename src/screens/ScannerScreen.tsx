import React, { useRef, useState } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export default function ScannerScreen() {
  const [hasPermission, setHasPermission] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);

  React.useEffect(() => {
    requestPermission();
  }, []);

  const requestPermission = async () => {
    try {
      const { check, request, PERMISSIONS, RESULTS } = await import('react-native-permissions');
      const result = await request(PERMISSIONS.ANDROID.CAMERA);
      setHasPermission(result === RESULTS.GRANTED);
    } catch {
      setHasPermission(false);
    }
  };

  if (!hasPermission) {
    return (
      <SafeAreaView className="flex-1 bg-dark items-center justify-center px-6">
        <Icon name="camera-off" size={70} color="#E63946" />
        <Text className="text-white text-xl font-bold mt-6 text-center">
          Camera Permission Required
        </Text>
        <Text className="text-slate-400 text-sm mt-2 text-center">
          We need camera access to scan documents
        </Text>
        <TouchableOpacity
          className="bg-primary px-8 py-4 rounded-full mt-6"
          onPress={requestPermission}>
          <Text className="text-white font-bold text-base">Grant Permission</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-dark">
      {/* Header */}
      <View className="px-4 pt-4 pb-2">
        <Text className="text-2xl font-bold text-white">Document Scanner</Text>
        <Text className="text-slate-400 text-sm mt-1">
          Align document in frame and capture
        </Text>
      </View>

      {/* Camera Placeholder */}
      <View className="flex-1 mx-4 rounded-3xl overflow-hidden bg-secondary items-center justify-center">
        <Icon name="camera-outline" size={80} color="#457B9D" />
        <Text className="text-slate-400 mt-4 text-base">Camera Preview</Text>
        <Text className="text-slate-500 text-xs mt-1">
          Install vision-camera to enable
        </Text>

        {/* Scanner Frame Overlay */}
        <View className="absolute inset-0 items-center justify-center">
          <View className="w-72 h-96 relative">
            <View className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-primary rounded-tl-lg" />
            <View className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-primary rounded-tr-lg" />
            <View className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-primary rounded-bl-lg" />
            <View className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-primary rounded-br-lg" />
          </View>
        </View>
      </View>

      {/* Controls */}
      <View className="flex-row items-center justify-around py-6 px-8">
        <TouchableOpacity
          className="bg-secondary p-4 rounded-full"
          onPress={() => Alert.alert('Gallery', 'Pick from gallery')}>
          <Icon name="image-multiple" size={24} color="white" />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => Alert.alert('Scanned!', 'Document captured successfully')}
          className="bg-primary w-20 h-20 rounded-full items-center justify-center">
          <Icon name="camera" size={36} color="white" />
        </TouchableOpacity>

        <TouchableOpacity
          className="bg-secondary p-4 rounded-full"
          onPress={() => Alert.alert('Flash', 'Toggle flash')}>
          <Icon name="flash" size={24} color="white" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}