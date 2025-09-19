import { Colors, Typography, Spacing, BorderRadius, Shadows, Layout } from './tokens';

/**
 * QuitHero Dark Theme Configuration
 * Premium dark interface with electric purple accent
 */

export const Theme = {
  colors: Colors,
  typography: Typography,
  spacing: Spacing,
  borderRadius: BorderRadius,
  shadows: Shadows,
  layout: Layout,

  // Component-specific theme tokens
  components: {
    button: {
      primary: {
        background: 'rgba(30, 42, 58, 0.8)', // Dark navy glass-morphism
        text: Colors.text.primary,
        border: Colors.purple[500],
        glow: Colors.purple[500],
      },
      secondary: {
        background: 'transparent',
        text: Colors.purple[500],
        border: Colors.purple[500],
      },
      ghost: {
        background: 'transparent',
        text: Colors.text.secondary,
        border: 'transparent',
      },
    },
    card: {
      background: Colors.dark.surface,
      border: Colors.dark.border,
      text: Colors.text.primary,
    },
    badge: {
      primary: {
        background: Colors.purple[500],
        text: Colors.text.primary,
      },
      success: {
        background: Colors.success.background,
        text: Colors.success.text,
        border: Colors.success.border,
      },
      warning: {
        background: Colors.warning.background,
        text: Colors.warning.text,
        border: Colors.warning.border,
      },
      secondary: {
        background: Colors.dark.surfaceElevated,
        text: Colors.purple[500],
        border: Colors.purple[500],
      },
    },
    progressBar: {
      background: Colors.dark.surfaceElevated,
      fill: Colors.purple[500],
      text: Colors.text.primary,
    },
  },
} as const;

export type ThemeType = typeof Theme;