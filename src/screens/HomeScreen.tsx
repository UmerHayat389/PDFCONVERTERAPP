import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { CONVERSIONS } from '../utils/constants';

const RECENT_TOOLS = CONVERSIONS.slice(0, 6);

export default function HomeScreen({ navigation }: any) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.scroll}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>
            PDF <Text style={styles.titleAccent}>Converter</Text>
          </Text>
          <Text style={styles.subtitle}>Convert, compress & scan documents</Text>
        </View>

        {/* Quick Action Banner */}
        <TouchableOpacity
          onPress={() => navigation.navigate('Scanner')}
          style={styles.banner}>
          <Icon name="scan-helper" size={40} color="white" />
          <View style={styles.bannerText}>
            <Text style={styles.bannerTitle}>Scan Document</Text>
            <Text style={styles.bannerSub}>Use camera to scan & convert instantly</Text>
          </View>
          <Icon name="chevron-right" size={24} color="white" />
        </TouchableOpacity>

        {/* Popular Conversions */}
        <Text style={styles.sectionTitle}>Popular Conversions</Text>
        <FlatList
          data={RECENT_TOOLS}
          numColumns={2}
          scrollEnabled={false}
          keyExtractor={item => item.id}
          columnWrapperStyle={{ gap: 12 }}
          contentContainerStyle={{ gap: 12 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => navigation.navigate('Tools')}
              style={styles.toolCard}>
              <Icon name={item.icon} size={30} color="#E63946" />
              <Text style={styles.toolLabel}>{item.label}</Text>
            </TouchableOpacity>
          )}
        />

        <View style={{ height: 24 }} />
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
  header: {
    paddingTop: 16,
    paddingBottom: 24,
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    color: 'white',
  },
  titleAccent: {
    color: '#E63946',
  },
  subtitle: {
    color: '#94a3b8',
    marginTop: 4,
  },
  banner: {
    backgroundColor: '#E63946',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    flexDirection: 'row',
    alignItems: 'center',
  },
  bannerText: {
    marginLeft: 16,
    flex: 1,
  },
  bannerTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  bannerSub: {
    color: '#fecaca',
    fontSize: 13,
    marginTop: 4,
  },
  sectionTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  toolCard: {
    flex: 1,
    backgroundColor: '#1D3557',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  toolLabel: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 8,
    textAlign: 'center',
  },
});