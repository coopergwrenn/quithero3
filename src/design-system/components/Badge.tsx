import React from 'react';
import { View, Text, ViewStyle, TextStyle, StyleSheet } from 'react-native';
import { Theme } from '../theme';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'primary' | 'success' | 'warning' | 'secondary';
  size?: 'sm' | 'md';
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export function Badge({ 
  children, 
  variant = 'primary', 
  size = 'md',
  style,
  textStyle 
}: BadgeProps) {
  // Safety check for children
  if (!children) {
    console.warn('Badge component received undefined children');
    return null;
  }
  const badgeStyle = [
    styles.base,
    styles[variant],
    styles[size],
    style,
  ];

  const textStyles = [
    styles.text,
    styles[`${size}Text`],
    { color: Theme.components.badge[variant]?.text || Theme.colors.text.primary },
    textStyle,
  ];

  return (
    <View style={badgeStyle}>
      <Text style={textStyles}>{children}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingHorizontal: Theme.spacing.sm,
    paddingVertical: Theme.spacing.xs,
    borderRadius: Theme.borderRadius.full,
    alignSelf: 'flex-start',
    borderWidth: 1,
  },
  primary: {
    backgroundColor: Theme.components.badge.primary.background,
    borderColor: Theme.components.badge.primary.background,
  },
  secondary: {
    backgroundColor: 'transparent',
    borderColor: Theme.colors.dark.border,
  },
  success: {
    backgroundColor: Theme.components.badge.success.background,
    borderColor: Theme.components.badge.success.border,
  },
  warning: {
    backgroundColor: Theme.components.badge.warning.background,
    borderColor: Theme.components.badge.warning.border,
  },
  sm: {
    paddingHorizontal: Theme.spacing.xs,
    paddingVertical: 2,
  },
  md: {
    paddingHorizontal: Theme.spacing.sm,
    paddingVertical: Theme.spacing.xs,
  },
  text: {
    fontWeight: '500',
    textAlign: 'center',
  },
  smText: {
    ...Theme.typography.caption1,
  },
  mdText: {
    ...Theme.typography.footnote,
  },
});