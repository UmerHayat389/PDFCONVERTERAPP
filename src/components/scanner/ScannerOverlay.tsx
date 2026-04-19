import React from 'react';
import { View } from 'react-native';

export default function ScannerOverlay() {
  return (
    <View className="absolute inset-0 items-center justify-center">
      {/* Corner markers */}
      <View className="w-72 h-96 relative">
        {/* Top Left */}
        <View className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-primary rounded-tl-lg" />
        {/* Top Right */}
        <View className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-primary rounded-tr-lg" />
        {/* Bottom Left */}
        <View className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-primary rounded-bl-lg" />
        {/* Bottom Right */}
        <View className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-primary rounded-br-lg" />
      </View>
    </View>
  );
}