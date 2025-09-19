import React from 'react';
import { TouchableOpacity, Text, ViewStyle, TextStyle, StyleSheet, ActivityIndicator } from 'react-native';
import { Theme } from '../theme';

interface ButtonProps {
  children: React.ReactNode;
  onPress?: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  fullWidth?: boolean;
}

export function Button({ 
  children, 
  onPress, 
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  style,
  textStyle,
  fullWidth = false,
}: ButtonProps) {
  const isDisabled = disabled || loading;
  
  const buttonStyle = [
    styles.base,
    styles[variant],
    styles[size],
    fullWidth && styles.fullWidth,
    isDisabled && styles.disabled,
    style,
  ];

  const textStyles = [
    styles.text,
    styles[`${size}Text`],
    { color: Theme.components.button[variant].text },
    isDisabled && styles.disabledText,
    textStyle,
  ];

  return (
    <TouchableOpacity 
      style={buttonStyle} 
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color={Theme.components.button[variant].text} />
      ) : (
        <Text style={textStyles}>{children}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: Theme.borderRadius.lg, // Larger radius for modern look
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  primary: {
    backgroundColor: Theme.components.button.primary.background,
    borderColor: Theme.components.button.primary.border,
    shadowColor: Theme.components.button.primary.glow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  secondary: {
    backgroundColor: Theme.components.button.secondary.background,
    borderColor: Theme.components.button.secondary.border,
  },
  ghost: {
    backgroundColor: Theme.components.button.ghost.background,
    borderColor: Theme.components.button.ghost.border,
  },
  sm: {
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.xs,
    minHeight: 32,
  },
  md: {
    paddingHorizontal: Theme.spacing.lg,
    paddingVertical: Theme.spacing.sm,
    minHeight: 44,
  },
  lg: {
    paddingHorizontal: Theme.spacing.xl,
    paddingVertical: Theme.spacing.md,
    minHeight: 56,
  },
  fullWidth: {
    width: '100%',
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    fontWeight: '600',
    textAlign: 'center',
  },
  smText: {
    ...Theme.typography.footnote,
  },
  mdText: {
    ...Theme.typography.callout,
  },
  lgText: {
    ...Theme.typography.headline,
  },
  disabledText: {
    opacity: 0.6,
  },
});