import React from 'react';
import { View, ViewStyle, StyleSheet } from 'react-native';
import { Theme } from '../theme';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  variant?: 'default' | 'elevated';
  padding?: keyof typeof Theme.spacing;
}

export function Card({ 
  children, 
  style, 
  variant = 'default',
  padding = 'md' 
}: CardProps) {
  const cardStyle = [
    styles.base,
    variant === 'elevated' && styles.elevated,
    { padding: Theme.spacing[padding] },
    style,
  ];

  return (
    <View style={cardStyle}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    backgroundColor: Theme.colors.dark.surface,
    borderRadius: Theme.borderRadius.md,
    borderWidth: 1,
    borderColor: Theme.colors.dark.border,
  },
  elevated: {
    backgroundColor: Theme.colors.dark.surfaceElevated,
    ...Theme.shadows.md,
  },
});