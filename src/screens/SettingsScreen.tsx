import React, { useState } from 'react';
import { View, Text, Switch, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const SettingRow = ({ icon, label, value, onToggle, isSwitch }: any) => (
  <View className="flex-row items-center justify-between py-4 border-b border-slate-800">
    <View className="flex-row items-center gap-3">
      <Icon name={icon} size={22} color="#E63946" />
      <Text className="text-white text-base">{label}</Text>
    </View>
    {isSwitch ? (
      <Switch value={value} onValueChange={onToggle} thumbColor="#E63946" trackColor={{ true: '#7f1d1d', false: '#334155' }} />
    ) : (
      <Icon name="chevron-right" size={20} color="#64748b" />
    )}
  </View>
);

export default function SettingsScreen() {
  const [autoSave, setAutoSave] = useState(true);
  const [highQuality, setHighQuality] = useState(false);
  const [darkMode, setDarkMode] = useState(true);

  return (
    <SafeAreaView className="flex-1 bg-dark">
      <ScrollView className="flex-1 px-4">
        <Text className="text-2xl font-bold text-white pt-4 pb-6">Settings</Text>

        <Text className="text-slate-400 text-xs uppercase tracking-widest mb-2">Conversion</Text>
        <View className="bg-secondary rounded-2xl px-4 mb-4">
          <SettingRow icon="content-save" label="Auto Save Output" value={autoSave} onToggle={setAutoSave} isSwitch />
          <SettingRow icon="quality-high" label="High Quality Output" value={highQuality} onToggle={setHighQuality} isSwitch />
          <SettingRow icon="folder" label="Output Folder" isSwitch={false} />
        </View>

        <Text className="text-slate-400 text-xs uppercase tracking-widest mb-2">App</Text>
        <View className="bg-secondary rounded-2xl px-4 mb-4">
          <SettingRow icon="theme-light-dark" label="Dark Mode" value={darkMode} onToggle={setDarkMode} isSwitch />
          <SettingRow icon="translate" label="Language" isSwitch={false} />
          <SettingRow icon="delete-sweep" label="Clear Cache" isSwitch={false} />
        </View>

        <Text className="text-slate-400 text-xs uppercase tracking-widest mb-2">About</Text>
        <View className="bg-secondary rounded-2xl px-4 mb-4">
          <SettingRow icon="information" label="Version 1.0.0" isSwitch={false} />
          <SettingRow icon="star" label="Rate the App" isSwitch={false} />
          <SettingRow icon="shield-lock" label="Privacy Policy" isSwitch={false} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}