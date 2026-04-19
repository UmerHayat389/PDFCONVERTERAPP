import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator } from 'react-native';

type Props = {
  label: string;
  onPress: () => void;
  loading?: boolean;
  variant?: 'primary' | 'secondary' | 'outline';
  disabled?: boolean;
};

export default function Button({
  label,
  onPress,
  loading = false,
  variant = 'primary',
  disabled = false,
}: Props) {
  const base = 'px-6 py-3 rounded-full items-center justify-center';
  const variants = {
    primary: 'bg-primary',
    secondary: 'bg-secondary',
    outline: 'border border-primary bg-transparent',
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      className={`${base} ${variants[variant]} ${disabled ? 'opacity-50' : ''}`}>
      {loading ? (
        <ActivityIndicator color="white" size="small" />
      ) : (
        <Text className="text-white font-bold text-sm">{label}</Text>
      )}
    </TouchableOpacity>
  );
}