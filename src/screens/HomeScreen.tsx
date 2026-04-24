import React, { useEffect, useRef } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, FlatList,
  StyleSheet, Animated, Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { CONVERSIONS } from '../utils/constants';

const { width } = Dimensions.get('window');
const POPULAR = CONVERSIONS.slice(0, 6);

const ICON_MAP: Record<string, string> = {
  image:            'image-multiple',
  'file-pdf-box':   'file-pdf-box',
  'file-document':  'file-document-outline',
};

function AnimatedCard({ children, delay, style }: { children: React.ReactNode; delay: number; style?: any }) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(24)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1, duration: 500, delay,
        useNativeDriver: true,
      }),
      Animated.spring(translateY, {
        toValue: 0, delay,
        useNativeDriver: true,
        damping: 18, stiffness: 120,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View style={[{ opacity, transform: [{ translateY }] }, style]}>
      {children}
    </Animated.View>
  );
}

function PulseIcon() {
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(scale, { toValue: 1.15, duration: 900, useNativeDriver: true }),
        Animated.timing(scale, { toValue: 1, duration: 900, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <Icon name="scan-helper" size={30} color="#fff" />
    </Animated.View>
  );
}

export default function HomeScreen({ navigation }: any) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}>

        {/* Header */}
        <AnimatedCard delay={0}>
          <View style={styles.header}>
            <View>
              <Text style={styles.greeting}>Good day 👋</Text>
              <Text style={styles.title}>
                PDF <Text style={styles.accent}>Converter</Text>
              </Text>
            </View>
            <TouchableOpacity
              style={styles.settingsBtn}
              onPress={() => navigation.navigate('Settings')}>
              <Icon name="cog-outline" size={22} color="#94a3b8" />
            </TouchableOpacity>
          </View>
        </AnimatedCard>

        {/* Scan Banner */}
        <AnimatedCard delay={80}>
          <TouchableOpacity
            style={styles.banner}
            onPress={() => navigation.navigate('Scanner')}
            activeOpacity={0.88}>
            <View style={styles.bannerGlow} />
            <View style={styles.bannerIconBox}>
              <PulseIcon />
            </View>
            <View style={styles.bannerText}>
              <Text style={styles.bannerTitle}>Scan Document</Text>
              <Text style={styles.bannerSub}>Camera scan · Auto-crop · Instant</Text>
            </View>
            <View style={styles.bannerArrow}>
              <Icon name="arrow-right" size={18} color="#E63946" />
            </View>
          </TouchableOpacity>
        </AnimatedCard>

        {/* Stats Row */}
        <AnimatedCard delay={160}>
          <View style={styles.statsRow}>
            {[
              { icon: 'swap-horizontal', num: '12+', label: 'Formats' },
              { icon: 'lightning-bolt', num: 'Fast', label: 'Processing' },
              { icon: 'shield-check-outline', num: '100%', label: 'Private' },
            ].map((s, i) => (
              <View key={i} style={styles.statCard}>
                <View style={styles.statIconWrap}>
                  <Icon name={s.icon} size={18} color="#E63946" />
                </View>
                <Text style={styles.statNum}>{s.num}</Text>
                <Text style={styles.statLabel}>{s.label}</Text>
              </View>
            ))}
          </View>
        </AnimatedCard>

        {/* Popular Conversions */}
        <AnimatedCard delay={240}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <View style={styles.sectionAccentBar} />
              <Text style={styles.sectionTitle}>Popular Conversions</Text>
            </View>
            <TouchableOpacity
              style={styles.seeAllBtn}
              onPress={() => navigation.navigate('Tools')}>
              <Text style={styles.seeAll}>See all</Text>
              <Icon name="chevron-right" size={14} color="#E63946" />
            </TouchableOpacity>
          </View>
        </AnimatedCard>

        <FlatList
          data={POPULAR}
          numColumns={2}
          scrollEnabled={false}
          keyExtractor={item => item.id}
          columnWrapperStyle={{ gap: 12 }}
          contentContainerStyle={{ gap: 12, paddingHorizontal: 16 }}
          renderItem={({ item, index }) => (
            <AnimatedCard delay={300 + index * 60} style={{ flex: 1 }}>
              <TouchableOpacity
                onPress={() => navigation.navigate('Tools')}
                style={styles.toolCard}
                activeOpacity={0.8}>
                <View style={styles.toolIconBox}>
                  <Icon
                    name={ICON_MAP[item.icon] || 'file-outline'}
                    size={26}
                    color="#E63946"
                  />
                </View>
                <Text style={styles.toolLabel}>{item.label}</Text>
                <View style={styles.toolChip}>
                  <Text style={styles.toolChipText}>Convert</Text>
                </View>
              </TouchableOpacity>
            </AnimatedCard>
          )}
        />

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#080F1A' },
  scroll: { flex: 1 },

  header: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: 16, paddingBottom: 20,
  },
  greeting: { color: '#64748b', fontSize: 12, fontWeight: '500', letterSpacing: 0.5 },
  title: { fontSize: 26, fontWeight: '800', color: '#F1F5F9', letterSpacing: -0.5 },
  accent: { color: '#E63946' },
  settingsBtn: {
    backgroundColor: '#111D2E',
    padding: 10, borderRadius: 14,
    borderWidth: 1, borderColor: '#1E2D40',
  },

  banner: {
    marginHorizontal: 16, marginBottom: 16,
    backgroundColor: '#0F1E32',
    borderRadius: 22, padding: 20,
    flexDirection: 'row', alignItems: 'center', gap: 14,
    borderWidth: 1, borderColor: '#E63946',
    overflow: 'hidden',
  },
  bannerGlow: {
    position: 'absolute', top: -30, left: -30,
    width: 100, height: 100, borderRadius: 50,
    backgroundColor: 'rgba(230,57,70,0.12)',
  },
  bannerIconBox: {
    backgroundColor: '#E63946',
    padding: 12, borderRadius: 16,
    shadowColor: '#E63946', shadowRadius: 12,
    shadowOpacity: 0.5, shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  bannerText: { flex: 1 },
  bannerTitle: { color: '#F1F5F9', fontSize: 16, fontWeight: '800', letterSpacing: -0.3 },
  bannerSub: { color: '#64748b', fontSize: 12, marginTop: 3 },
  bannerArrow: {
    backgroundColor: 'rgba(230,57,70,0.12)',
    padding: 8, borderRadius: 10,
    borderWidth: 1, borderColor: 'rgba(230,57,70,0.25)',
  },

  statsRow: {
    flexDirection: 'row', gap: 10,
    marginBottom: 24, paddingHorizontal: 16,
  },
  statCard: {
    flex: 1, backgroundColor: '#0F1E32',
    borderRadius: 16, padding: 14, alignItems: 'center', gap: 4,
    borderWidth: 1, borderColor: '#1E2D40',
  },
  statIconWrap: {
    backgroundColor: 'rgba(230,57,70,0.1)',
    padding: 7, borderRadius: 10, marginBottom: 4,
  },
  statNum: { color: '#F1F5F9', fontSize: 15, fontWeight: '800' },
  statLabel: { color: '#475569', fontSize: 10, fontWeight: '600', letterSpacing: 0.3 },

  sectionHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 14, paddingHorizontal: 16,
  },
  sectionTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  sectionAccentBar: {
    width: 3, height: 16, backgroundColor: '#E63946', borderRadius: 2,
  },
  sectionTitle: { color: '#F1F5F9', fontSize: 16, fontWeight: '800' },
  seeAllBtn: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  seeAll: { color: '#E63946', fontSize: 12, fontWeight: '700' },

  toolCard: {
    flex: 1, backgroundColor: '#0F1E32',
    borderRadius: 18, padding: 16, alignItems: 'center',
    borderWidth: 1, borderColor: '#1E2D40',
  },
  toolIconBox: {
    backgroundColor: 'rgba(230,57,70,0.1)',
    padding: 12, borderRadius: 14, marginBottom: 10,
    borderWidth: 1, borderColor: 'rgba(230,57,70,0.2)',
  },
  toolLabel: {
    color: '#CBD5E1', fontSize: 12, fontWeight: '700',
    textAlign: 'center', marginBottom: 8,
  },
  toolChip: {
    backgroundColor: 'rgba(230,57,70,0.1)',
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8,
    borderWidth: 1, borderColor: 'rgba(230,57,70,0.2)',
  },
  toolChipText: { color: '#E63946', fontSize: 10, fontWeight: '700' },
});