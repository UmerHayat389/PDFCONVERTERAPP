import React, { useRef, useEffect } from 'react';
import {
  View, Text, Switch, TouchableOpacity,
  ScrollView, StyleSheet, Alert, Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import {
  toggleAutoSave, toggleHighQuality, toggleDarkMode,
} from '../store/slices/settingsSlice';
import RNFS from 'react-native-fs';

function AnimatedSection({ children, delay }: { children: React.ReactNode; delay: number }) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(16)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 450, delay, useNativeDriver: true }),
      Animated.spring(translateY, { toValue: 0, delay, useNativeDriver: true, damping: 18 }),
    ]).start();
  }, []);

  return (
    <Animated.View style={{ opacity, transform: [{ translateY }] }}>
      {children}
    </Animated.View>
  );
}

function RowSeparator() {
  return <View style={styles.separator} />;
}

export default function SettingsScreen() {
  const dispatch = useDispatch<AppDispatch>();
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

  const handlePrivacyPolicy = () => {
    Alert.alert('Privacy Policy', 'This app does not collect or share any personal data. All conversions happen on-device or on your local server.');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 48 }}>

        {/* Header */}
        <AnimatedSection delay={0}>
          <View style={styles.pageHeader}>
            <Text style={styles.eyebrow}>PREFERENCES</Text>
            <Text style={styles.pageTitle}>Settings</Text>
          </View>
        </AnimatedSection>

        {/* Conversion Section */}
        <AnimatedSection delay={80}>
          <View style={styles.sectionLabelRow}>
            <Icon name="swap-horizontal" size={13} color="#E63946" />
            <Text style={styles.sectionLabel}>CONVERSION</Text>
          </View>
          <View style={styles.section}>

            <View style={styles.row}>
              <View style={styles.rowLeft}>
                <View style={styles.rowIconBox}>
                  <Icon name="content-save-outline" size={18} color="#E63946" />
                </View>
                <View>
                  <Text style={styles.rowLabel}>Auto Save Output</Text>
                  <Text style={styles.rowDesc}>Save files automatically after conversion</Text>
                </View>
              </View>
              <Switch
                value={autoSave}
                onValueChange={() => { dispatch(toggleAutoSave()); }}
                thumbColor={autoSave ? '#E63946' : '#475569'}
                trackColor={{ true: 'rgba(230,57,70,0.35)', false: '#1E2D40' }}
              />
            </View>

            <RowSeparator />

            <View style={styles.row}>
              <View style={styles.rowLeft}>
                <View style={styles.rowIconBox}>
                  <Icon name="quality-high" size={18} color="#E63946" />
                </View>
                <View>
                  <Text style={styles.rowLabel}>High Quality Output</Text>
                  <Text style={styles.rowDesc}>Larger file size, better quality</Text>
                </View>
              </View>
              <Switch
                value={highQuality}
                onValueChange={() => { dispatch(toggleHighQuality()); }}
                thumbColor={highQuality ? '#E63946' : '#475569'}
                trackColor={{ true: 'rgba(230,57,70,0.35)', false: '#1E2D40' }}
              />
            </View>

            <RowSeparator />

            <TouchableOpacity style={[styles.row, styles.rowLast]} onPress={handleOutputFolder} activeOpacity={0.75}>
              <View style={styles.rowLeft}>
                <View style={styles.rowIconBox}>
                  <Icon name="folder-open-outline" size={18} color="#E63946" />
                </View>
                <View>
                  <Text style={styles.rowLabel}>Output Folder</Text>
                  <Text style={styles.rowDesc}>Where converted files are saved</Text>
                </View>
              </View>
              <View style={styles.rowRight}>
                <Text style={styles.rowValue}>Downloads</Text>
                <Icon name="chevron-right" size={18} color="#334155" />
              </View>
            </TouchableOpacity>

          </View>
        </AnimatedSection>

        {/* App Section */}
        <AnimatedSection delay={160}>
          <View style={styles.sectionLabelRow}>
            <Icon name="cellphone-cog" size={13} color="#E63946" />
            <Text style={styles.sectionLabel}>APP</Text>
          </View>
          <View style={styles.section}>

            <View style={styles.row}>
              <View style={styles.rowLeft}>
                <View style={styles.rowIconBox}>
                  <Icon name="theme-light-dark" size={18} color="#E63946" />
                </View>
                <View>
                  <Text style={styles.rowLabel}>Dark Mode</Text>
                  <Text style={styles.rowDesc}>Use dark theme throughout the app</Text>
                </View>
              </View>
              <Switch
                value={darkMode}
                onValueChange={() => { dispatch(toggleDarkMode()); }}
                thumbColor={darkMode ? '#E63946' : '#475569'}
                trackColor={{ true: 'rgba(230,57,70,0.35)', false: '#1E2D40' }}
              />
            </View>

            <RowSeparator />

            <TouchableOpacity style={[styles.row, styles.rowLast]} onPress={handleClearCache} activeOpacity={0.75}>
              <View style={styles.rowLeft}>
                <View style={styles.rowIconBox}>
                  <Icon name="delete-sweep-outline" size={18} color="#E63946" />
                </View>
                <View>
                  <Text style={styles.rowLabel}>Clear Cache</Text>
                  <Text style={styles.rowDesc}>Remove all temporary files</Text>
                </View>
              </View>
              <Icon name="chevron-right" size={18} color="#334155" />
            </TouchableOpacity>

          </View>
        </AnimatedSection>

        {/* About Section */}
        <AnimatedSection delay={240}>
          <View style={styles.sectionLabelRow}>
            <Icon name="information" size={13} color="#E63946" />
            <Text style={styles.sectionLabel}>ABOUT</Text>
          </View>
          <View style={styles.section}>

            <View style={styles.row}>
              <View style={styles.rowLeft}>
                <View style={styles.rowIconBox}>
                  <Icon name="tag-outline" size={18} color="#E63946" />
                </View>
                <Text style={styles.rowLabel}>Version</Text>
              </View>
              <View style={styles.versionBadge}>
                <Text style={styles.versionText}>1.0.0</Text>
              </View>
            </View>

            <RowSeparator />

            <TouchableOpacity style={[styles.row, styles.rowLast]} onPress={handlePrivacyPolicy} activeOpacity={0.75}>
              <View style={styles.rowLeft}>
                <View style={styles.rowIconBox}>
                  <Icon name="shield-lock-outline" size={18} color="#E63946" />
                </View>
                <View>
                  <Text style={styles.rowLabel}>Privacy Policy</Text>
                  <Text style={styles.rowDesc}>All data processed on-device</Text>
                </View>
              </View>
              <Icon name="chevron-right" size={18} color="#334155" />
            </TouchableOpacity>

          </View>
        </AnimatedSection>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#080F1A' },
  scroll: { flex: 1, paddingHorizontal: 16 },

  pageHeader: { paddingTop: 20, paddingBottom: 24 },
  eyebrow: { color: '#E63946', fontSize: 10, fontWeight: '800', letterSpacing: 2, marginBottom: 4 },
  pageTitle: { fontSize: 26, fontWeight: '800', color: '#F1F5F9', letterSpacing: -0.5 },

  sectionLabelRow: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    marginBottom: 8, marginLeft: 4,
  },
  sectionLabel: {
    color: '#475569', fontSize: 10, fontWeight: '800', letterSpacing: 2,
  },

  section: {
    backgroundColor: '#0F1E32', borderRadius: 18,
    paddingHorizontal: 16, marginBottom: 20,
    borderWidth: 1, borderColor: '#1E2D40',
  },
  separator: { height: 1, backgroundColor: '#111D2E' },

  row: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', paddingVertical: 16,
  },
  rowLast: { paddingBottom: 16 },
  rowLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1, marginRight: 8 },
  rowRight: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  rowIconBox: {
    backgroundColor: 'rgba(230,57,70,0.1)',
    padding: 8, borderRadius: 10,
    borderWidth: 1, borderColor: 'rgba(230,57,70,0.15)',
  },
  rowLabel: { color: '#E2E8F0', fontSize: 14, fontWeight: '700' },
  rowDesc: { color: '#475569', fontSize: 11, marginTop: 1 },
  rowValue: { color: '#64748b', fontSize: 13, fontWeight: '600' },

  versionBadge: {
    backgroundColor: 'rgba(230,57,70,0.1)',
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8,
    borderWidth: 1, borderColor: 'rgba(230,57,70,0.2)',
  },
  versionText: { color: '#E63946', fontSize: 12, fontWeight: '700' },
});