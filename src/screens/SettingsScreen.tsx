import React, { useState } from 'react';
import { View, Text, Switch, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const SettingRow = ({ icon, label, value, onToggle, isSwitch }: any) => (
  <View style={styles.row}>
    <View style={styles.rowLeft}>
      <Icon name={icon} size={22} color="#E63946" />
      <Text style={styles.rowLabel}>{label}</Text>
    </View>
    {isSwitch ? (
      <Switch
        value={value}
        onValueChange={onToggle}
        thumbColor="#E63946"
        trackColor={{ true: '#7f1d1d', false: '#334155' }}
      />
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
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.scroll}>
        <Text style={styles.pageTitle}>Settings</Text>

        <Text style={styles.sectionLabel}>Conversion</Text>
        <View style={styles.section}>
          <SettingRow icon="content-save" label="Auto Save Output" value={autoSave} onToggle={setAutoSave} isSwitch />
          <SettingRow icon="quality-high" label="High Quality Output" value={highQuality} onToggle={setHighQuality} isSwitch />
          <SettingRow icon="folder" label="Output Folder" isSwitch={false} />
        </View>

        <Text style={styles.sectionLabel}>App</Text>
        <View style={styles.section}>
          <SettingRow icon="theme-light-dark" label="Dark Mode" value={darkMode} onToggle={setDarkMode} isSwitch />
          <SettingRow icon="translate" label="Language" isSwitch={false} />
          <SettingRow icon="delete-sweep" label="Clear Cache" isSwitch={false} />
        </View>

        <Text style={styles.sectionLabel}>About</Text>
        <View style={styles.section}>
          <SettingRow icon="information" label="Version 1.0.0" isSwitch={false} />
          <SettingRow icon="star" label="Rate the App" isSwitch={false} />
          <SettingRow icon="shield-lock" label="Privacy Policy" isSwitch={false} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0D1B2A',
  },
  scroll: {
    flex: 1,
    paddingHorizontal: 16,
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    paddingTop: 16,
    paddingBottom: 24,
  },
  sectionLabel: {
    color: '#94a3b8',
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  section: {
    backgroundColor: '#1D3557',
    borderRadius: 16,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  rowLabel: {
    color: 'white',
    fontSize: 16,
    marginLeft: 12,
  },
});