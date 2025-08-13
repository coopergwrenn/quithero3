/**
 * Design System Tokens for QuitHero
 * Following iOS Human Interface Guidelines and WCAG accessibility standards
 */

export const Colors = {
  // Primary Purple Accent
  purple: {
    50: '#F3F0FF',
    100: '#E9E2FF',
    200: '#D6CCFF',
    300: '#B8A3FF',
    400: '#9575FF',
    500: '#8B5CF6', // Primary accent
    600: '#7C3AED',
    700: '#6D28D9',
    800: '#5B21B6',
    900: '#4C1D95',
  },

  // Dark Theme Base
  dark: {
    background: '#000000',
    surface: '#1A1A1A',
    surfaceElevated: '#2A2A2A',
    border: '#3A3A3A',
    borderSubtle: '#2A2A2A',
  },

  // Text Colors (WCAG AA+ compliant)
  text: {
    primary: '#FFFFFF',
    secondary: '#B3B3B3',
    tertiary: '#808080',
    inverse: '#000000',
    accent: '#8B5CF6',
  },

  // Semantic Colors
  success: {
    background: '#0F2A1F',
    border: '#1F4A35',
    text: '#22C55E',
  },
  warning: {
    background: '#2A1F0F',
    border: '#4A351F',
    text: '#F59E0B',
  },
  error: {
    background: '#2A0F0F',
    border: '#4A1F1F',
    text: '#EF4444',
  },
  info: {
    background: '#0F1A2A',
    border: '#1F354A',
    text: '#3B82F6',
  },
} as const;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
} as const;

export const BorderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
} as const;

export const Typography = {
  // iOS HIG Typography Scale
  largeTitle: {
    fontSize: 34,
    lineHeight: 41,
    fontWeight: '700' as const,
    letterSpacing: 0.37,
  },
  title1: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '700' as const,
    letterSpacing: 0.36,
  },
  title2: {
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '700' as const,
    letterSpacing: 0.35,
  },
  title3: {
    fontSize: 20,
    lineHeight: 25,
    fontWeight: '600' as const,
    letterSpacing: 0.38,
  },
  headline: {
    fontSize: 17,
    lineHeight: 22,
    fontWeight: '600' as const,
    letterSpacing: -0.43,
  },
  body: {
    fontSize: 17,
    lineHeight: 22,
    fontWeight: '400' as const,
    letterSpacing: -0.43,
  },
  callout: {
    fontSize: 16,
    lineHeight: 21,
    fontWeight: '400' as const,
    letterSpacing: -0.32,
  },
  subheadline: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '400' as const,
    letterSpacing: -0.24,
  },
  footnote: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '400' as const,
    letterSpacing: -0.08,
  },
  caption1: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '400' as const,
    letterSpacing: 0,
  },
  caption2: {
    fontSize: 11,
    lineHeight: 13,
    fontWeight: '400' as const,
    letterSpacing: 0.07,
  },
} as const;

export const Shadows = {
  sm: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.18,
    shadowRadius: 1.0,
    elevation: 1,
  },
  md: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.23,
    shadowRadius: 2.62,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.32,
    shadowRadius: 5.46,
    elevation: 9,
  },
} as const;

export const Layout = {
  screenPadding: Spacing.lg,
  cardPadding: Spacing.md,
  sectionSpacing: Spacing.xl,
  componentSpacing: Spacing.md,
} as const;