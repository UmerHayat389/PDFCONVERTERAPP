import React, { useEffect, useRef, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, Animated, ActionSheetIOS, Platform, Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import { setRecentFiles, removeRecentFile } from '../store/slices/fileSlice';
import { FileItem } from '../types';
import { loadRecentFiles, saveRecentFiles } from '../utils/storage';

// ─── File type → icon / colour mapping ──────────────────────────────────────
// FileItem.type comes from your existing `types.ts`.
// Map whatever values your conversion service sets on `type`.
const FILE_META: Record<string, { icon: string; color: string; bg: string }> = {
  pdf:   { icon: 'file-pdf-box',      color: '#E8453C', bg: '#FFF0EE' },
  word:  { icon: 'file-word-outline', color: '#3B6EF8', bg: '#EEF3FF' },
  image: { icon: 'image-outline',     color: '#22C55E', bg: '#EDFBF3' },
  excel: { icon: 'microsoft-excel',   color: '#16A34A', bg: '#EDFBF3' },
  // fallback
  default: { icon: 'file-outline',   color: '#94a3b8', bg: '#F1F5F9' },
};

const TOOL_COLORS: Record<number, { bg: string; icon: string }> = {
  0: { bg: '#FFF0EE', icon: '#E8453C' },
  1: { bg: '#EEF3FF', icon: '#3B6EF8' },
  2: { bg: '#EDFBF3', icon: '#22C55E' },
  3: { bg: '#FFF8EB', icon: '#F59E0B' },
  4: { bg: '#F3EEFF', icon: '#8B5CF6' },
};

// ─── Helpers ─────────────────────────────────────────────────────────────────
function getFileMeta(type: string) {
  return FILE_META[type?.toLowerCase()] ?? FILE_META.default;
}

// ─── Animated entrance card ──────────────────────────────────────────────────
function AnimatedCard({
  children, delay, style,
}: {
  children: React.ReactNode;
  delay: number;
  style?: any;
}) {
  const opacity    = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity,    { toValue: 1, duration: 480, delay, useNativeDriver: true }),
      Animated.spring(translateY, { toValue: 0, delay, useNativeDriver: true, damping: 20, stiffness: 130 }),
    ]).start();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Animated.View style={[{ opacity, transform: [{ translateY }] }, style]}>
      {children}
    </Animated.View>
  );
}

// ─── Empty state ─────────────────────────────────────────────────────────────
function EmptyFiles() {
  return (
    <View style={styles.emptyWrap}>
      <View style={styles.emptyIconWrap}>
        <Icon name="folder-open-outline" size={38} color="#CBD5E1" />
      </View>
      <Text style={styles.emptyTitle}>No recent files</Text>
      <Text style={styles.emptySub}>Files you convert or scan will appear here</Text>
    </View>
  );
}

// ════════════════════════════════════════════════════════════════════════════
export default function HomeScreen({ navigation }: any) {
  const dispatch    = useDispatch<AppDispatch>();
  const recentFiles = useSelector((s: RootState) => s.files.recentFiles);

  // ── Custom confirmation modal state ──
  const [confirmItem, setConfirmItem] = useState<FileItem | null>(null);

  // ── Hydrate Redux from AsyncStorage once on mount ──
  useEffect(() => {
    loadRecentFiles().then(files => {
      if (files.length > 0) dispatch(setRecentFiles(files));
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Delete a recent file entry (not the actual file on disk) ──
  const handleDeleteRecent = (item: FileItem) => {
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['Remove from recents', 'Cancel'],
          destructiveButtonIndex: 0,
          cancelButtonIndex: 1,
        },
        idx => {
          if (idx === 0) {
            dispatch(removeRecentFile(item.id));
            saveRecentFiles(recentFiles.filter(f => f.id !== item.id));
          }
        },
      );
    } else {
      setConfirmItem(item);
    }
  };

  const doDelete = () => {
    if (!confirmItem) return;
    dispatch(removeRecentFile(confirmItem.id));
    saveRecentFiles(recentFiles.filter(f => f.id !== confirmItem.id));
    setConfirmItem(null);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 48 }}>

        {/* ── Header ── */}
        <AnimatedCard delay={0}>
          <View style={styles.header}>
            <Text style={styles.greeting}>Welcome! 👋</Text>
            <TouchableOpacity
              style={styles.settingsBtn}
              onPress={() => navigation.navigate('Settings')}>
              <Icon name="cog-outline" size={20} color="#64748b" />
            </TouchableOpacity>
          </View>
        </AnimatedCard>

        {/* ── Hero ── */}
        <AnimatedCard delay={60}>
          <View style={styles.heroRow}>
            <View style={styles.heroText}>
              <Text style={styles.heroTitle}>
                <Text style={styles.heroAccent}>PDF</Text> Converter{'\n'}{'& Scanner'}
              </Text>
              <Text style={styles.heroSub}>All your document needs{'\n'}in one place.</Text>
            </View>
            <View style={styles.heroIllustration}>
              <View style={styles.illustrationDoc}>
                <View style={styles.illustrationPDFBadge}>
                  <Text style={styles.illustrationPDFText}>PDF</Text>
                </View>
                <View style={[styles.docLine, { width: '80%' }]} />
                <View style={[styles.docLine, { width: '58%' }]} />
                <View style={[styles.docLine, { width: '70%' }]} />
              </View>
              <View style={[styles.floatingChip, { bottom: 8, left: -6 }]}>
                <Icon name="image-outline" size={13} color="#fff" />
              </View>
              <View style={[styles.floatingChip, { bottom: 8, right: -6, backgroundColor: '#F59E0B' }]}>
                <Icon name="swap-horizontal" size={13} color="#fff" />
              </View>
            </View>
          </View>
        </AnimatedCard>

        {/* ── Two action cards ── */}
        <AnimatedCard delay={130}>
          <View style={styles.actionRow}>
            <TouchableOpacity
              style={[styles.actionCard, styles.actionBlue]}
              onPress={() => navigation.navigate('Scanner')}
              activeOpacity={0.86}>
              <Text style={styles.actionTitle}>Scan Documents</Text>
              <Text style={styles.actionSub}>Scan any document{'\n'}and save as PDF</Text>
              <View style={styles.actionArrow}>
                <Icon name="arrow-right" size={15} color="#fff" />
              </View>
              <View style={styles.actionBgIcon}>
                <Icon name="scanner" size={54} color="rgba(255,255,255,0.18)" />
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionCard, styles.actionPurple]}
              onPress={() => navigation.navigate('Tools')}
              activeOpacity={0.86}>
              <Text style={styles.actionTitle}>Convert PDF</Text>
              <Text style={styles.actionSub}>Convert to Word,{'\n'}Image, Excel & more</Text>
              <View style={styles.actionArrow}>
                <Icon name="arrow-right" size={15} color="#fff" />
              </View>
              <View style={styles.actionBgIcon}>
                <Icon name="file-multiple-outline" size={54} color="rgba(255,255,255,0.18)" />
              </View>
            </TouchableOpacity>
          </View>
        </AnimatedCard>

        {/* ── Popular Tools ── */}
        <AnimatedCard delay={200}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Popular Tools</Text>
            <TouchableOpacity style={styles.viewAllBtn} onPress={() => navigation.navigate('Tools')}>
              <Text style={styles.viewAllText}>View All</Text>
              <Icon name="chevron-right" size={14} color="#3B6EF8" />
            </TouchableOpacity>
          </View>
        </AnimatedCard>

        {/* Horizontal tool chips */}
        <AnimatedCard delay={240}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.toolsRow}>
            {[
              { label: 'PDF to PDF',    icon: 'file-pdf-box',      idx: 0 },
              { label: 'PDF to\nWord',  icon: 'file-word-outline',  idx: 1 },
              { label: 'PDF to\nExcel', icon: 'microsoft-excel',    idx: 2 },
              { label: 'PDF to\nImage', icon: 'image-outline',      idx: 3 },
              { label: 'More\nTools',   icon: 'dots-grid',          idx: 4 },
            ].map(tool => (
              <TouchableOpacity
                key={tool.idx}
                style={styles.toolChipCard}
                onPress={() => navigation.navigate('Tools')}
                activeOpacity={0.75}>
                <View style={[styles.toolChipIcon, { backgroundColor: TOOL_COLORS[tool.idx].bg }]}>
                  <Icon name={tool.icon} size={30} color={TOOL_COLORS[tool.idx].icon} />
                </View>
                <Text style={styles.toolChipLabel}>{tool.label}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </AnimatedCard>

        {/* ── Recent Documents ── */}
        <AnimatedCard delay={290}>
          <View style={[styles.sectionHeader, { marginTop: 22 }]}>
            <Text style={styles.sectionTitle}>Recent Documents</Text>
            {recentFiles.length > 0 && (
              <TouchableOpacity style={styles.viewAllBtn}>
                <Text style={styles.viewAllText}>View All</Text>
                <Icon name="chevron-right" size={14} color="#3B6EF8" />
              </TouchableOpacity>
            )}
          </View>
        </AnimatedCard>

        {recentFiles.length === 0 ? (
          <AnimatedCard delay={320}>
            <EmptyFiles />
          </AnimatedCard>
        ) : (
          recentFiles.slice(0, 7).map((doc, i) => {
            const meta = getFileMeta(doc.type);
            return (
              <AnimatedCard key={doc.id} delay={320 + i * 50}>
                <TouchableOpacity style={styles.docRow} activeOpacity={0.75}>
                  <View style={[styles.docIconWrap, { backgroundColor: meta.bg }]}>
                    <Icon name={meta.icon} size={26} color={meta.color} />
                  </View>
                  <View style={styles.docInfo}>
                    <Text style={styles.docName} numberOfLines={1}>{doc.name}</Text>
                    <Text style={styles.docMeta}>{doc.size} · {doc.date}</Text>
                  </View>
                  {/* ⋮ menu — remove from recents */}
                  <TouchableOpacity
                    style={styles.docMore}
                    onPress={() => handleDeleteRecent(doc)}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                    <Icon name="dots-vertical" size={18} color="#94a3b8" />
                  </TouchableOpacity>
                </TouchableOpacity>
              </AnimatedCard>
            );
          })
        )}

      </ScrollView>

      {/* ── Custom Remove Confirmation Modal ── */}
      <Modal
        visible={!!confirmItem}
        transparent
        animationType="fade"
        onRequestClose={() => setConfirmItem(null)}>
        <TouchableOpacity
          style={styles.modalBackdrop}
          activeOpacity={1}
          onPress={() => setConfirmItem(null)}>
          <TouchableOpacity activeOpacity={1} style={styles.modalCard}>
            {/* Icon */}
            <View style={styles.modalIconWrap}>
              <Icon name="file-remove-outline" size={28} color="#E8453C" />
            </View>
            <Text style={styles.modalTitle}>Remove file?</Text>
            <Text style={styles.modalMessage} numberOfLines={3}>
              <Text style={styles.modalFileName}>{confirmItem?.name}</Text>
              {' '}will be removed from your recent files.
            </Text>
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalBtnCancel}
                onPress={() => setConfirmItem(null)}>
                <Text style={styles.modalBtnCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalBtnRemove}
                onPress={doDelete}>
                <Icon name="trash-can-outline" size={15} color="#fff" style={{ marginRight: 5 }} />
                <Text style={styles.modalBtnRemoveText}>Remove</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

    </SafeAreaView>
  );
}

// ════════════════════════════════════════════════════════════════════════════
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F4F6FB' },
  scroll:   { flex: 1 },

  header: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: 16, paddingBottom: 4,
  },
  greeting:    { fontSize: 16, fontWeight: '700', color: '#1E2A3B' },
  settingsBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center',
    borderWidth: 0.5, borderColor: '#e2e8f0',
  },

  heroRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 20, paddingTop: 10, paddingBottom: 20,
  },
  heroText:        { flex: 1 },
  heroTitle:       { fontSize: 27, fontWeight: '900', color: '#1E2A3B', lineHeight: 33, letterSpacing: -0.5 },
  heroAccent:      { color: '#3B6EF8' },
  heroSub:         { fontSize: 13, color: '#94a3b8', marginTop: 7, lineHeight: 19, fontWeight: '500' },
  heroIllustration:{ width: 124, height: 124, alignItems: 'center', justifyContent: 'center', position: 'relative' },
  illustrationDoc: {
    width: 84, height: 104, backgroundColor: '#fff',
    borderRadius: 13, padding: 11,
    alignItems: 'flex-start', justifyContent: 'flex-end',
    borderWidth: 0.5, borderColor: '#e2e8f0', gap: 5,
  },
  illustrationPDFBadge: {
    position: 'absolute', top: 9, left: 9,
    backgroundColor: '#E8453C', paddingHorizontal: 5, paddingVertical: 2, borderRadius: 4,
  },
  illustrationPDFText: { color: '#fff', fontSize: 9, fontWeight: '800' },
  docLine:     { height: 5, backgroundColor: '#EEF1F7', borderRadius: 3 },
  floatingChip:{
    position: 'absolute', width: 27, height: 27, borderRadius: 7,
    backgroundColor: '#22C55E', alignItems: 'center', justifyContent: 'center',
    borderWidth: 1.5, borderColor: '#fff',
  },

  actionRow: { flexDirection: 'row', gap: 12, paddingHorizontal: 16, marginBottom: 24 },
  actionCard: {
    flex: 1, borderRadius: 20, padding: 18,
    minHeight: 155, overflow: 'hidden', justifyContent: 'space-between',
  },
  actionBlue:   { backgroundColor: '#3B6EF8' },
  actionPurple: { backgroundColor: '#7C4DFF' },
  actionTitle:  { color: '#fff', fontSize: 14, fontWeight: '800', marginBottom: 4 },
  actionSub:    { color: 'rgba(255,255,255,0.78)', fontSize: 11, lineHeight: 16, fontWeight: '500' },
  actionArrow:  {
    width: 30, height: 30, borderRadius: 15,
    backgroundColor: 'rgba(255,255,255,0.22)',
    alignItems: 'center', justifyContent: 'center',
    alignSelf: 'flex-start', marginTop: 10,
  },
  actionBgIcon: { position: 'absolute', right: 6, bottom: 6 },

  sectionHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', paddingHorizontal: 16, marginBottom: 14,
  },
  sectionTitle: { fontSize: 17, fontWeight: '800', color: '#1E2A3B' },
  viewAllBtn:   { flexDirection: 'row', alignItems: 'center', gap: 2 },
  viewAllText:  { color: '#3B6EF8', fontSize: 13, fontWeight: '700' },

  toolsRow:     { paddingHorizontal: 16, gap: 10 },
  toolChipCard: {
    alignItems: 'center', gap: 10,
    backgroundColor: '#fff', borderRadius: 18,
    paddingVertical: 16, paddingHorizontal: 10, width: 88,
    borderWidth: 0.5, borderColor: '#EEF1F7',
  },
  toolChipIcon: {
    width: 56, height: 56, borderRadius: 15,
    alignItems: 'center', justifyContent: 'center',
  },
  toolChipLabel: {
    fontSize: 10, fontWeight: '700', color: '#475569',
    textAlign: 'center', lineHeight: 14,
  },

  docRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#fff', marginHorizontal: 16,
    marginBottom: 10, borderRadius: 16, padding: 14, gap: 12,
    borderWidth: 0.5, borderColor: '#EEF1F7',
  },
  docIconWrap: { width: 48, height: 48, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  docInfo:     { flex: 1 },
  docName:     { fontSize: 13, fontWeight: '700', color: '#1E2A3B', marginBottom: 3 },
  docMeta:     { fontSize: 11, color: '#94a3b8', fontWeight: '500' },
  docMore:     { padding: 4 },

  emptyWrap: {
    alignItems: 'center', paddingVertical: 30, paddingHorizontal: 24,
    marginHorizontal: 16, backgroundColor: '#fff',
    borderRadius: 20, borderWidth: 1, borderColor: '#E2E8F0',
    borderStyle: 'dashed',
  },
  emptyIconWrap: {
    width: 68, height: 68, borderRadius: 18,
    backgroundColor: '#F8FAFC', alignItems: 'center',
    justifyContent: 'center', marginBottom: 12,
  },
  emptyTitle: { fontSize: 15, fontWeight: '800', color: '#1E2A3B', marginBottom: 5 },
  emptySub:   { fontSize: 12, color: '#94a3b8', fontWeight: '500', textAlign: 'center', lineHeight: 18 },

  // ── Modal ──
  modalBackdrop: {
    flex: 1, backgroundColor: 'rgba(15,23,42,0.45)',
    alignItems: 'center', justifyContent: 'center', padding: 32,
  },
  modalCard: {
    width: '100%', backgroundColor: '#fff',
    borderRadius: 24, padding: 24, alignItems: 'center',
    shadowColor: '#000', shadowOpacity: 0.18, shadowRadius: 24, shadowOffset: { width: 0, height: 8 },
    elevation: 12,
  },
  modalIconWrap: {
    width: 56, height: 56, borderRadius: 16,
    backgroundColor: '#FFF0EE', alignItems: 'center', justifyContent: 'center',
    marginBottom: 14,
  },
  modalTitle: { fontSize: 17, fontWeight: '800', color: '#1E2A3B', marginBottom: 8 },
  modalMessage: { fontSize: 13, color: '#64748b', textAlign: 'center', lineHeight: 20, marginBottom: 24 },
  modalFileName: { fontWeight: '700', color: '#1E2A3B' },
  modalActions: { flexDirection: 'row', gap: 10, width: '100%' },
  modalBtnCancel: {
    flex: 1, paddingVertical: 13, borderRadius: 14,
    backgroundColor: '#F1F5F9', alignItems: 'center', justifyContent: 'center',
  },
  modalBtnCancelText: { fontSize: 14, fontWeight: '700', color: '#475569' },
  modalBtnRemove: {
    flex: 1, paddingVertical: 13, borderRadius: 14,
    backgroundColor: '#E8453C', alignItems: 'center', justifyContent: 'center',
    flexDirection: 'row',
  },
  modalBtnRemoveText: { fontSize: 14, fontWeight: '700', color: '#fff' },
});