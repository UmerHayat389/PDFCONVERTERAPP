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

const ACCENT = '#3F61FE';

function AnimatedSection({ children, delay }: { children: React.ReactNode; delay: number }) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 400, delay, useNativeDriver: true }),
      Animated.spring(translateY, { toValue: 0, delay, useNativeDriver: true, damping: 18, stiffness: 100 }),
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

interface RowItem {
  icon: string;
  iconColor: string;
  iconBg: string;
  label: string;
  desc?: string;
  type: 'toggle' | 'nav';
  value?: boolean;
  navValue?: string;
  onToggle?: () => void;
  onPress?: () => void;
}

function SettingsRow({ item, isLast }: { item: RowItem; isLast: boolean }) {
  const Wrapper: any = item.type === 'nav' ? TouchableOpacity : View;
  const wrapperProps = item.type === 'nav'
    ? { onPress: item.onPress, activeOpacity: 0.7 }
    : {};

  return (
    <>
      <Wrapper style={styles.row} {...wrapperProps}>
        {/* Icon box */}
        <View style={[styles.rowIconBox, { backgroundColor: item.iconBg }]}>
          <Icon name={item.icon} size={18} color={item.iconColor} />
        </View>

        {/* Label + desc */}
        <View style={styles.rowTextWrap}>
          <Text style={styles.rowLabel}>{item.label}</Text>
          {item.desc ? <Text style={styles.rowDesc}>{item.desc}</Text> : null}
        </View>

        {/* Right side */}
        {item.type === 'toggle' ? (
          <Switch
            value={item.value}
            onValueChange={item.onToggle}
            thumbColor="#FFFFFF"
            trackColor={{ true: ACCENT, false: '#D1D5DB' }}
          />
        ) : (
          <View style={styles.rowRight}>
            {item.navValue ? (
              <Text style={[styles.rowValue, { color: item.iconColor }]}>{item.navValue}</Text>
            ) : null}
            <Icon name="chevron-right" size={18} color="#CBD5E1" />
          </View>
        )}
      </Wrapper>
      {!isLast && <RowSeparator />}
    </>
  );
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

  const scanSettingsRows: RowItem[] = [
    {
      icon: 'quality-high',
      iconColor: ACCENT,
      iconBg: 'rgba(63,97,254,0.10)',
      label: 'High Quality Output',
      desc: 'Larger file size, better quality',
      type: 'toggle',
      value: highQuality,
      onToggle: () => dispatch(toggleHighQuality()),
    },
    {
      icon: 'crop-free',
      iconColor: '#22C55E',
      iconBg: 'rgba(34,197,94,0.10)',
      label: 'Auto Crop',
      desc: 'Automatically detect and crop edges',
      type: 'toggle',
      value: autoSave,
      onToggle: () => dispatch(toggleAutoSave()),
    },
    {
      icon: 'folder-open-outline',
      iconColor: '#F59E0B',
      iconBg: 'rgba(245,158,11,0.10)',
      label: 'Output Folder',
      desc: 'Where converted files are saved',
      type: 'nav',
      navValue: 'Downloads',
      onPress: handleOutputFolder,
    },
  ];

  const generalRows: RowItem[] = [
    {
      icon: 'theme-light-dark',
      iconColor: '#A855F7',
      iconBg: 'rgba(168,85,247,0.10)',
      label: 'Dark Mode',
      desc: 'Use dark theme throughout the app',
      type: 'toggle',
      value: darkMode,
      onToggle: () => dispatch(toggleDarkMode()),
    },
    {
      icon: 'delete-sweep-outline',
      iconColor: '#EF4444',
      iconBg: 'rgba(239,68,68,0.10)',
      label: 'Clear Cache',
      desc: 'Remove all temporary files',
      type: 'nav',
      onPress: handleClearCache,
    },
  ];

  const aboutRows: RowItem[] = [
    {
      icon: 'tag-outline',
      iconColor: ACCENT,
      iconBg: 'rgba(63,97,254,0.10)',
      label: 'Version',
      type: 'nav',
      navValue: '1.0.0',
    },
    {
      icon: 'shield-lock-outline',
      iconColor: '#22C55E',
      iconBg: 'rgba(34,197,94,0.10)',
      label: 'Privacy Policy',
      desc: 'All data processed on-device',
      type: 'nav',
      onPress: handlePrivacyPolicy,
    },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>

        {/* Header */}
        <AnimatedSection delay={0}>
          <View style={styles.pageHeader}>
            <Text style={styles.pageTitle}>Settings</Text>
            <Text style={styles.pageSub}>Customize your scanning experience</Text>
          </View>
        </AnimatedSection>

        {/* Scan Settings */}
        <AnimatedSection delay={80}>
          <Text style={styles.sectionLabel}>SCAN SETTINGS</Text>
          <View style={styles.section}>
            {scanSettingsRows.map((item, i) => (
              <SettingsRow key={item.label} item={item} isLast={i === scanSettingsRows.length - 1} />
            ))}
          </View>
        </AnimatedSection>

        {/* General */}
        <AnimatedSection delay={160}>
          <Text style={styles.sectionLabel}>GENERAL</Text>
          <View style={styles.section}>
            {generalRows.map((item, i) => (
              <SettingsRow key={item.label} item={item} isLast={i === generalRows.length - 1} />
            ))}
          </View>
        </AnimatedSection>

        {/* About */}
        <AnimatedSection delay={240}>
          <Text style={styles.sectionLabel}>ABOUT</Text>
          <View style={styles.section}>
            {aboutRows.map((item, i) => (
              <SettingsRow key={item.label} item={item} isLast={i === aboutRows.length - 1} />
            ))}
          </View>
        </AnimatedSection>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F3F5FB' },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 18, paddingBottom: 48 },

  // Header
  pageHeader: { paddingTop: 16, paddingBottom: 20 },
  pageTitle: {
    fontSize: 26, fontWeight: '800', color: '#111827', letterSpacing: -0.5,
  },
  pageSub: {
    fontSize: 13, color: '#9CA3AF', marginTop: 3, fontWeight: '500',
  },

  // Section
  sectionLabel: {
    fontSize: 11, fontWeight: '800', color: '#9CA3AF',
    letterSpacing: 1.5, marginBottom: 8, marginLeft: 2,
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 14,
    marginBottom: 22,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  separator: {
    height: 1, backgroundColor: '#F1F5F9', marginLeft: 48,
  },

  // Row
  row: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 14, gap: 12,
  },
  rowIconBox: {
    width: 36, height: 36, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center',
  },
  rowTextWrap: { flex: 1 },
  rowLabel: { fontSize: 14, fontWeight: '700', color: '#111827' },
  rowDesc: { fontSize: 12, color: '#9CA3AF', marginTop: 2 },
  rowRight: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  rowValue: { fontSize: 13, fontWeight: '600' },
});