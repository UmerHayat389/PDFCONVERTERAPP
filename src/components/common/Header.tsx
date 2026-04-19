import React from 'react';
import { View, Text } from 'react-native';

type Props = {
  title: string;
  subtitle?: string;
};

export default function Header({ title, subtitle }: Props) {
  return (
    <View className="pt-4 pb-6">
      <Text className="text-3xl font-bold text-white">{title}</Text>
      {subtitle && (
        <Text className="text-slate-400 mt-1 text-sm">{subtitle}</Text>
      )}
    </View>
  );
}