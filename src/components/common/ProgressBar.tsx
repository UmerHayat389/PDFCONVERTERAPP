import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

type Props = {
  progress: number; // 0 to 100
  label?: string;
};

export default function ProgressBar({ progress, label }: Props) {
  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${Math.min(progress, 100)}%` }]} />
      </View>
      <Text style={styles.percent}>{Math.round(progress)}%</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  label: {
    color: '#94a3b8',
    fontSize: 12,
    marginBottom: 4,
  },
  track: {
    width: '100%',
    backgroundColor: '#334155',
    borderRadius: 999,
    height: 8,
  },
  fill: {
    backgroundColor: '#E63946',
    height: 8,
    borderRadius: 999,
  },
  percent: {
    color: '#94a3b8',
    fontSize: 12,
    marginTop: 4,
    textAlign: 'right',
  },
});