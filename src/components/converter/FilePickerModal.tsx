import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

type Props = {
  visible:     boolean;
  onClose:     () => void;
  onPickFile:  () => void;
  onPickImage: () => void;
};

export default function FilePickerModal({
  visible,
  onClose,
  onPickFile,
  onPickImage,
}: Props) {
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const fadeAnim  = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // ✅ FIX: Reset to initial hidden state before animating in.
      // Without this, after the first close the animated values stay at their
      // "closed" position (slideAnim = SCREEN_HEIGHT, fadeAnim = 0) and the
      // sheet is invisible/off-screen on every subsequent open.
      slideAnim.setValue(SCREEN_HEIGHT);
      fadeAnim.setValue(0);

      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 220,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          speed: 20,
          bounciness: 4,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 180,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: SCREEN_HEIGHT,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  return (
    <Modal
      transparent
      animationType="none"
      visible={visible}
      onRequestClose={onClose}>
      <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
        {/* Tap outside to close */}
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          activeOpacity={1}
          onPress={onClose}
        />

        <Animated.View style={[styles.sheet, { transform: [{ translateY: slideAnim }] }]}>
          {/* Handle */}
          <View style={styles.handle} />

          <Text style={styles.title}>Choose Source</Text>
          <Text style={styles.subtitle}>Select where to pick your file from</Text>

          {/* Pick from Files */}
          <TouchableOpacity onPress={onPickFile} style={styles.option} activeOpacity={0.8}>
            <View style={[styles.optionIcon, { backgroundColor: '#EEE8FF' }]}>
              <Icon name="file-outline" size={24} color="#7C5CFC" />
            </View>
            <View style={styles.optionTextWrap}>
              <Text style={styles.optionText}>Pick from Files</Text>
              <Text style={styles.optionSub}>PDF, TXT, DOCX, images…</Text>
            </View>
            <Icon name="chevron-right" size={18} color="#D1D5DB" />
          </TouchableOpacity>

          {/* Pick from Gallery */}
          <TouchableOpacity onPress={onPickImage} style={styles.option} activeOpacity={0.8}>
            <View style={[styles.optionIcon, { backgroundColor: '#D1FAE5' }]}>
              <Icon name="image-outline" size={24} color="#10B981" />
            </View>
            <View style={styles.optionTextWrap}>
              <Text style={styles.optionText}>Pick from Gallery</Text>
              <Text style={styles.optionSub}>JPG, PNG, WEBP…</Text>
            </View>
            <Icon name="chevron-right" size={18} color="#D1D5DB" />
          </TouchableOpacity>

          {/* Cancel */}
          <TouchableOpacity onPress={onClose} style={styles.cancel} activeOpacity={0.7}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.42)',
  },
  sheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 40,
  },
  handle: {
    width: 38,
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    color: '#9CA3AF',
    marginBottom: 20,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#F0F1F5',
  },
  optionIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  optionTextWrap: {
    flex: 1,
  },
  optionText: {
    color: '#111827',
    fontWeight: '700',
    fontSize: 15,
    marginBottom: 2,
  },
  optionSub: {
    color: '#9CA3AF',
    fontSize: 12,
  },
  cancel: {
    alignItems: 'center',
    paddingVertical: 14,
    marginTop: 4,
  },
  cancelText: {
    color: '#9CA3AF',
    fontWeight: '600',
    fontSize: 14,
  },
});