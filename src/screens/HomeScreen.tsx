import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { CONVERSIONS } from '../utils/constants';

const POPULAR = CONVERSIONS.slice(0, 6);

const ICON_MAP: Record<string, string> = {
  image: 'image-multiple',
  'file-pdf-box': 'file-pdf-box',
  'file-document': 'file-document-outline',
};

export default function HomeScreen({ navigation }: any) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>
              PDF <Text style={styles.accent}>Converter</Text>
            </Text>
            <Text style={styles.subtitle}>Convert, compress & scan documents</Text>
          </View>
          <TouchableOpacity
            style={styles.settingsBtn}
            onPress={() => navigation.navigate('Settings')}>
            <Icon name="cog-outline" size={24} color="#94a3b8" />
          </TouchableOpacity>
        </View>

        {/* Scan Banner */}
        <TouchableOpacity
          style={styles.banner}
          onPress={() => navigation.navigate('Scanner')}
          activeOpacity={0.85}>
          <View style={styles.bannerIconBox}>
            <Icon name="scan-helper" size={32} color="white" />
          </View>
          <View style={styles.bannerText}>
            <Text style={styles.bannerTitle}>Scan Document</Text>
            <Text style={styles.bannerSub}>Use camera to scan & convert instantly</Text>
          </View>
          <Icon name="chevron-right" size={22} color="rgba(255,255,255,0.7)" />
        </TouchableOpacity>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Icon name="swap-horizontal" size={22} color="#E63946" />
            <Text style={styles.statNum}>12</Text>
            <Text style={styles.statLabel}>Formats</Text>
          </View>
          <View style={styles.statCard}>
            <Icon name="lightning-bolt" size={22} color="#E63946" />
            <Text style={styles.statNum}>Fast</Text>
            <Text style={styles.statLabel}>Conversion</Text>
          </View>
          <View style={styles.statCard}>
            <Icon name="shield-check" size={22} color="#E63946" />
            <Text style={styles.statNum}>100%</Text>
            <Text style={styles.statLabel}>Private</Text>
          </View>
        </View>

        {/* Popular Conversions */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Popular Conversions</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Tools')}>
            <Text style={styles.seeAll}>See all</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={POPULAR}
          numColumns={2}
          scrollEnabled={false}
          keyExtractor={item => item.id}
          columnWrapperStyle={{ gap: 12 }}
          contentContainerStyle={{ gap: 12 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => navigation.navigate('Tools')}
              style={styles.toolCard}
              activeOpacity={0.8}>
              <View style={styles.toolIconBox}>
                <Icon name={ICON_MAP[item.icon] || 'file-outline'} size={28} color="#E63946" />
              </View>
              <Text style={styles.toolLabel}>{item.label}</Text>
              <Text style={styles.toolTap}>Tap to convert</Text>
            </TouchableOpacity>
          )}
        />

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#0D1B2A' },
  scroll: { flex: 1, paddingHorizontal: 16 },
  header: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', paddingTop: 16, paddingBottom: 20,
  },
  title: { fontSize: 28, fontWeight: 'bold', color: 'white' },
  accent: { color: '#E63946' },
  subtitle: { color: '#64748b', fontSize: 13, marginTop: 2 },
  settingsBtn: {
    backgroundColor: '#1D3557', padding: 10, borderRadius: 12,
  },
  banner: {
    backgroundColor: '#E63946', borderRadius: 20, padding: 18,
    marginBottom: 16, flexDirection: 'row', alignItems: 'center', gap: 14,
  },
  bannerIconBox: {
    backgroundColor: 'rgba(0,0,0,0.2)', padding: 10, borderRadius: 14,
  },
  bannerText: { flex: 1 },
  bannerTitle: { color: 'white', fontSize: 17, fontWeight: 'bold' },
  bannerSub: { color: 'rgba(255,255,255,0.75)', fontSize: 12, marginTop: 2 },
  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 24 },
  statCard: {
    flex: 1, backgroundColor: '#1D3557', borderRadius: 14,
    padding: 14, alignItems: 'center', gap: 4,
  },
  statNum: { color: 'white', fontSize: 16, fontWeight: 'bold', marginTop: 4 },
  statLabel: { color: '#64748b', fontSize: 11 },
  sectionHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 12,
  },
  sectionTitle: { color: 'white', fontSize: 17, fontWeight: 'bold' },
  seeAll: { color: '#E63946', fontSize: 13, fontWeight: '600' },
  toolCard: {
    flex: 1, backgroundColor: '#1D3557', borderRadius: 16,
    padding: 16, alignItems: 'center',
  },
  toolIconBox: {
    backgroundColor: 'rgba(230,57,70,0.12)', padding: 12,
    borderRadius: 12, marginBottom: 8,
  },
  toolLabel: { color: 'white', fontSize: 12, fontWeight: '700', textAlign: 'center' },
  toolTap: { color: '#64748b', fontSize: 10, marginTop: 3 },
});