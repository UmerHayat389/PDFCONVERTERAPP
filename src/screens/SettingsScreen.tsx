import React from 'react';
import {
  View, Text, Switch, TouchableOpacity,
  ScrollView, StyleSheet, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../store';  // ← Added AppDispatch
import {
  toggleAutoSave, toggleHighQuality, toggleDarkMode,
} from '../store/slices/settingsSlice';
import RNFS from 'react-native-fs';

export default function SettingsScreen() {
  const dispatch = useDispatch<AppDispatch>();  // ← Typed dispatch
  const { autoSave, highQuality, darkMode } = useSelector((s: RootState) => s.settings);

  const handleClearCache = async () => {
    Alert.alert('Clear Cache', 'This will delete all temporary files. Continue?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Clear', style: 'destructive', onPress: async () => {
          try {
            const cachePath = RNFS.CachesDirectoryPath;
            const files = await RNFS.readDir(cachePath);
            await Promise.all(files.map(f => RNFS.unlink(f.path).catch(() => {})));
            Alert.alert('Done', 'Cache cleared successfully');
          } catch {
            Alert.alert('Error', 'Could not clear cache');
          }
        },
      },
    ]);
  };

  const handleOutputFolder = () => {
    Alert.alert('Output Folder', 'Files are saved to your Downloads folder automatically.');
  };

  const handleLanguage = () => {
    Alert.alert('Language', 'Only English is supported in this version.');
  };

  const handleRateApp = () => {
    Alert.alert('Rate the App', 'Thank you for using PDF Converter! Rating will be available on Play Store.');
  };

  const handlePrivacyPolicy = () => {
    Alert.alert('Privacy Policy', 'This app does not collect or share any personal data. All conversions happen on-device or on your local server.');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.scroll}>
        <Text style={styles.pageTitle}>Settings</Text>

        {/* Conversion */}
        <Text style={styles.sectionLabel}>CONVERSION</Text>
        <View style={styles.section}>
          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <Icon name="content-save-outline" size={22} color="#E63946" />
              <Text style={styles.rowLabel}>Auto Save Output</Text>
            </View>
            <Switch
              value={autoSave}
              onValueChange={() => { dispatch(toggleAutoSave()); }}  // ← Fixed
              thumbColor={autoSave ? '#E63946' : '#94a3b8'}
              trackColor={{ true: '#7f1d1d', false: '#334155' }}
            />
          </View>
          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <Icon name="quality-high" size={22} color="#E63946" />
              <Text style={styles.rowLabel}>High Quality Output</Text>
            </View>
            <Switch
              value={highQuality}
              onValueChange={() => { dispatch(toggleHighQuality()); }}  // ← Fixed
              thumbColor={highQuality ? '#E63946' : '#94a3b8'}
              trackColor={{ true: '#7f1d1d', false: '#334155' }}
            />
          </View>
          <TouchableOpacity style={[styles.row, { borderBottomWidth: 0 }]} onPress={handleOutputFolder}>
            <View style={styles.rowLeft}>
              <Icon name="folder-outline" size={22} color="#E63946" />
              <Text style={styles.rowLabel}>Output Folder</Text>
            </View>
            <View style={styles.rowRight}>
              <Text style={styles.rowValue}>Downloads</Text>
              <Icon name="chevron-right" size={20} color="#64748b" />
            </View>
          </TouchableOpacity>
        </View>

        {/* App */}
        <Text style={styles.sectionLabel}>APP</Text>
        <View style={styles.section}>
          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <Icon name="theme-light-dark" size={22} color="#E63946" />
              <Text style={styles.rowLabel}>Dark Mode</Text>
            </View>
            <Switch
              value={darkMode}
              onValueChange={() => { dispatch(toggleDarkMode()); }}  // ← Fixed
              thumbColor={darkMode ? '#E63946' : '#94a3b8'}
              trackColor={{ true: '#7f1d1d', false: '#334155' }}
            />
          </View>
          <TouchableOpacity style={styles.row} onPress={handleLanguage}>
            <View style={styles.rowLeft}>
              <Icon name="translate" size={22} color="#E63946" />
              <Text style={styles.rowLabel}>Language</Text>
            </View>
            <View style={styles.rowRight}>
              <Text style={styles.rowValue}>English</Text>
              <Icon name="chevron-right" size={20} color="#64748b" />
            </View>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.row, { borderBottomWidth: 0 }]} onPress={handleClearCache}>
            <View style={styles.rowLeft}>
              <Icon name="delete-sweep-outline" size={22} color="#E63946" />
              <Text style={styles.rowLabel}>Clear Cache</Text>
            </View>
            <Icon name="chevron-right" size={20} color="#64748b" />
          </TouchableOpacity>
        </View>

        {/* About */}
        <Text style={styles.sectionLabel}>ABOUT</Text>
        <View style={styles.section}>
          <View style={[styles.row]}>
            <View style={styles.rowLeft}>
              <Icon name="information-outline" size={22} color="#E63946" />
              <Text style={styles.rowLabel}>Version</Text>
            </View>
            <Text style={styles.rowValue}>1.0.0</Text>
          </View>
          <TouchableOpacity style={styles.row} onPress={handleRateApp}>
            <View style={styles.rowLeft}>
              <Icon name="star-outline" size={22} color="#E63946" />
              <Text style={styles.rowLabel}>Rate the App</Text>
            </View>
            <Icon name="chevron-right" size={20} color="#64748b" />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.row, { borderBottomWidth: 0 }]} onPress={handlePrivacyPolicy}>
            <View style={styles.rowLeft}>
              <Icon name="shield-lock-outline" size={22} color="#E63946" />
              <Text style={styles.rowLabel}>Privacy Policy</Text>
            </View>
            <Icon name="chevron-right" size={20} color="#64748b" />
          </TouchableOpacity>
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#0D1B2A' },
  scroll: { flex: 1, paddingHorizontal: 16 },
  pageTitle: { fontSize: 24, fontWeight: 'bold', color: 'white', paddingTop: 16, paddingBottom: 24 },
  sectionLabel: { color: '#64748b', fontSize: 11, fontWeight: '700', letterSpacing: 1.5, marginBottom: 8, marginLeft: 4 },
  section: { backgroundColor: '#1D3557', borderRadius: 16, paddingHorizontal: 16, marginBottom: 20 },
  row: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#0D1B2A',
  },
  rowLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  rowRight: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  rowLabel: { color: 'white', fontSize: 15 },
  rowValue: { color: '#64748b', fontSize: 14 },
});