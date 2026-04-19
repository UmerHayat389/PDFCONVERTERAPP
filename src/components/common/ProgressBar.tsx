import React from 'react';
import { View, Text } from 'react-native';

type Props = {
  progress: number; // 0 to 100
  label?: string;
};

export default function ProgressBar({ progress, label }: Props) {
  return (
    <View className="w-full">
      {label && (
        <Text className="text-slate-400 text-xs mb-1">{label}</Text>
      )}
      <View className="w-full bg-slate-700 rounded-full h-2">
        <View
          className="bg-primary h-2 rounded-full"
          style={{ width: `${Math.min(progress, 100)}%` }}
        />
      </View>
      <Text className="text-slate-400 text-xs mt-1 text-right">
        {Math.round(progress)}%
      </Text>
    </View>
  );
}