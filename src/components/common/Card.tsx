import React from 'react';
import { View, ViewProps } from 'react-native';

type Props = ViewProps & {
  children: React.ReactNode;
};

export default function Card({ children, className, ...props }: Props) {
  return (
    <View
      className={`bg-secondary rounded-2xl p-4 ${className || ''}`}
      {...props}>
      {children}
    </View>
  );
}