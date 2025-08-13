import React from 'react';
import { View, Text, ViewStyle, StyleSheet } from 'react-native';
import { Theme } from '../theme';

interface ProgressBarProps {
  progress: number; // 0-1
  showPercentage?: boolean;
  height?: number;
  style?: ViewStyle;
  label?: string;
}

export function ProgressBar({ 
  progress, 
  showPercentage = false,
  height = 8,
  style,
  label 
}: ProgressBarProps) {
  const clampedProgress = Math.max(0, Math.min(1, progress));
  const percentage = Math.round(clampedProgress * 100);

  return (
    <View style={[styles.container, style]}>
      {label && (
        <Text style={styles.label}>{label}</Text>
      )}
      <View style={[styles.track, { height }]}>
        <View 
          style={[
            styles.fill, 
            { 
              width: `${percentage}%`,
              height: height - 2, // Account for border
            }
          ]} 
        />
      </View>
      {showPercentage && (
        <Text style={styles.percentage}>{percentage}%</Text>
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
  },
  track: {
    backgroundColor: Theme.components.progressBar.background,
    borderRadius: Theme.borderRadius.full,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Theme.colors.dark.border,
  },
  fill: {
    backgroundColor: Theme.components.progressBar.fill,
    borderRadius: Theme.borderRadius.full,
    margin: 1,
  },
  percentage: {
    ...Theme.typography.caption1,
    color: Theme.colors.text.tertiary,
    textAlign: 'right',
    marginTop: Theme.spacing.xs,
  },
});