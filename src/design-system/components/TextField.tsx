import React, { useState } from 'react';
import { View, TextInput, Text, ViewStyle, TextStyle, StyleSheet } from 'react-native';
import { Theme } from '../theme';

interface TextFieldProps {
  label?: string;
  placeholder?: string;
  value?: string;
  onChangeText?: (text: string) => void;
  multiline?: boolean;
  numberOfLines?: number;
  keyboardType?: 'default' | 'numeric' | 'email-address';
  secureTextEntry?: boolean;
  disabled?: boolean;
  error?: string;
  style?: ViewStyle;
  inputStyle?: TextStyle;
}

export function TextField({
  label,
  placeholder,
  value,
  onChangeText,
  multiline = false,
  numberOfLines,
  keyboardType = 'default',
  secureTextEntry = false,
  disabled = false,
  error,
  style,
  inputStyle,
}: TextFieldProps) {
  const [isFocused, setIsFocused] = useState(false);

  const containerStyle = [
    styles.container,
    style,
  ];

  const inputContainerStyle = [
    styles.inputContainer,
    isFocused && styles.focused,
    error && styles.error,
    disabled && styles.disabled,
  ];

  const textInputStyle = [
    styles.input,
    multiline && styles.multiline,
    inputStyle,
  ];

  return (
    <View style={containerStyle}>
      {label && (
        <Text style={styles.label}>{label}</Text>
      )}
      <View style={inputContainerStyle}>
        <TextInput
          style={textInputStyle}
          placeholder={placeholder}
          placeholderTextColor={Theme.colors.text.tertiary}
          value={value}
          onChangeText={onChangeText}
          multiline={multiline}
          numberOfLines={numberOfLines}
          keyboardType={keyboardType}
          secureTextEntry={secureTextEntry}
          editable={!disabled}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />
      </View>
      {error && (
        <Text style={styles.errorText}>{error}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  label: {
    ...Theme.typography.footnote,
    color: Theme.colors.text.secondary,
    marginBottom: Theme.spacing.xs,
    fontWeight: '500',
  },
  inputContainer: {
    borderWidth: 1,
    borderColor: Theme.colors.dark.border,
    borderRadius: Theme.borderRadius.md,
    backgroundColor: Theme.colors.dark.surface,
  },
  focused: {
    borderColor: Theme.colors.purple[500],
  },
  error: {
    borderColor: Theme.colors.error.text,
  },
  disabled: {
    opacity: 0.5,
    backgroundColor: Theme.colors.dark.background,
  },
  input: {
    ...Theme.typography.body,
    color: Theme.colors.text.primary,
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.sm,
    minHeight: 44, // iOS HIG minimum touch target
  },
  multiline: {
    minHeight: 88,
    textAlignVertical: 'top',
  },
  errorText: {
    ...Theme.typography.caption1,
    color: Theme.colors.error.text,
    marginTop: Theme.spacing.xs,
  },
});