import React from 'react';
import { TouchableOpacity, Text, ViewStyle, TextStyle, StyleSheet } from 'react-native';
import { Theme } from '../theme';

interface PillChoiceProps {
  children: React.ReactNode;
  onPress?: () => void;
  selected?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export function PillChoice({ 
  children, 
  onPress, 
  selected = false,
  disabled = false,
  style,
  textStyle 
}: PillChoiceProps) {
  const pillStyle = [
    styles.base,
    selected ? styles.selected : styles.unselected,
    disabled && styles.disabled,
    style,
  ];

  const textStyles = [
    styles.text,
    selected ? styles.selectedText : styles.unselectedText,
    disabled && styles.disabledText,
    textStyle,
  ];

  return (
    <TouchableOpacity 
      style={pillStyle} 
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
    >
      <Text style={textStyles}>{children}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.sm,
    borderRadius: Theme.borderRadius.full,
    borderWidth: 1,
    alignSelf: 'flex-start',
    minHeight: 44, // iOS HIG minimum touch target
  },
  selected: {
    backgroundColor: Theme.colors.purple[500],
    borderColor: Theme.colors.purple[500],
  },
  unselected: {
    backgroundColor: 'transparent',
    borderColor: Theme.colors.dark.border,
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    ...Theme.typography.callout,
    fontWeight: '500',
    textAlign: 'center',
  },
  selectedText: {
    color: Theme.colors.text.primary,
  },
  unselectedText: {
    color: Theme.colors.text.secondary,
  },
  disabledText: {
    opacity: 0.6,
  },
});