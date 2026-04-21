import React from 'react';
import { View, ViewProps, StyleSheet } from 'react-native';

type Props = ViewProps & {
  children: React.ReactNode;
};

export default function Card({ children, style, ...props }: Props) {
  return (
    <View style={[styles.card, style]} {...props}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1D3557',
    borderRadius: 16,
    padding: 16,
  },
});