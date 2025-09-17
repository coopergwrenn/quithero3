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
    borderRadius: Theme.borderRadius.lg, // Larger radius for modern look
    borderWidth: 1,
    borderColor: Theme.colors.dark.borderSubtle, // Subtle border
  },
  elevated: {
    backgroundColor: Theme.colors.dark.surfaceElevated,
    borderColor: Theme.colors.dark.border,
    ...Theme.shadows.lg, // Stronger shadow for elevated cards
  },
});