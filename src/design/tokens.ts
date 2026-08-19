// DESIGN TOKENS — VetStock
// Source of truth: DESIGN.md — do not edit values here without updating DESIGN.md
// This file is the single import point for all visual tokens.

import { Platform } from 'react-native';

// ============================================================================
// COLORS
// ============================================================================

export const colors = {
  // Brand palette (green veterinary)
  brand: {
    50: '#E8F5E9',
    100: '#C8E6C9',
    200: '#A5D6A7',
    300: '#81C784',
    400: '#66BB6A',
    500: '#4CAF50', // ⚠️ Fails AA on white — never use as text on white
    600: '#2E7D32', // Primary brand, primary buttons, FAB
    700: '#1B5E20', // Primary dark, headers, nav bar
    800: '#145218',
    900: '#0D3B0F',
  },

  // Semantic colors (status/feedback) — all pass WCAG AA on light & dark
  semantic: {
    success: '#2E7D32',
    warning: '#E65100',
    danger: '#C62828',
    info: '#1565C0',
  },

  // Category colors (fixed — do not change)
  category: {
    medicamentos: '#1565C0',
    vacinas: '#2E7D32',
    antiparasitarios: '#6A1B9A',
    solucoes: '#00838F',
    suplementos: '#E65100',
    equipamentos: '#37474F',
    outros: '#795548',
  },

  // Neutral scale
  neutral: {
    0: '#FFFFFF',
    50: '#FAFAFA',
    100: '#F4F6F9',
    200: '#EEEEEE',
    300: '#E0E0E0',
    400: '#BDBDBD',
    500: '#9E9E9E',
    600: '#757575',
    700: '#555555',
    800: '#333333',
    900: '#212121',
    950: '#111111',
  },

  // Surface & overlay
  surface: {
    primary: '#FFFFFF',        // Cards, modals, sheets
    secondary: '#FAFAFA',      // Input bg, alternate rows
    tertiary: '#F4F6F9',       // Page background
    overlayScrim: 'rgba(0,0,0,0.4)',
    overlayStrong: 'rgba(0,0,0,0.5)',
  },
} as const;

// ============================================================================
// SPACING (base unit: 4px)
// ============================================================================

export const spacing = {
  0: 0,
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  8: 32,
  10: 40,
  12: 48,
  16: 64,
} as const;

// ============================================================================
// TYPOGRAPHY
// ============================================================================

export const typography = {
  // Font family — system fonts only (no custom fonts)
  fontFamily: Platform.select({
    ios: 'System',
    android: 'Roboto',
    web: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    default: 'System',
  }),

  // Type scale (modular scale ratio 1.25)
  sizes: {
    displayLg: 32,
    displayMd: 28,
    displaySm: 24,
    headingLg: 22,
    headingMd: 20,
    headingSm: 18,
    bodyLg: 16,
    bodyMd: 15,
    bodySm: 14,
    labelLg: 13,
    labelMd: 12,
    labelSm: 11,
    caption: 10,
  },

  // Line heights (1.25 ratio for headings, ~1.5 for body)
  lineHeights: {
    displayLg: 40,
    displayMd: 36,
    displaySm: 32,
    headingLg: 28,
    headingMd: 28,
    headingSm: 24,
    bodyLg: 24,
    bodyMd: 22,
    bodySm: 20,
    labelLg: 20,
    labelMd: 18,
    labelSm: 16,
    caption: 14,
  },

  // Font weights
  weights: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },

  // Letter spacing
  letterSpacing: {
    displayLg: -0.5,
    displayMd: -0.25,
    displaySm: 0,
    headingLg: 0,
    headingMd: 0,
    headingSm: 0,
    bodyLg: 0,
    bodyMd: 0,
    bodySm: 0,
    labelLg: 0,
    labelMd: 0,
    labelSm: 0,
    caption: 0,
  },
} as const;
// ============================================================================
// BORDER RADIUS
// ============================================================================

export const borderRadius = {
  none: 0,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
} as const;

// ============================================================================
// ELEVATION / SHADOWS (Platform-adaptive)
// ============================================================================

export const elevation = {
  // iOS shadows
  ios: {
    0: { shadowOpacity: 0, shadowRadius: 0, shadowOffset: { width: 0, height: 0 }, elevation: 0 },
    1: { shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 2, shadowOffset: { width: 0, height: 1 }, elevation: 1 },
    2: { shadowColor: '#000', shadowOpacity: 0.07, shadowRadius: 4, shadowOffset: { width: 0, height: 2 }, elevation: 2 },
    3: { shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 8, shadowOffset: { width: 0, height: 4 }, elevation: 3 },
    4: { shadowColor: '#000', shadowOpacity: 0.10, shadowRadius: 16, shadowOffset: { width: 0, height: 8 }, elevation: 6 },
    5: { shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: 24, shadowOffset: { width: 0, height: 12 }, elevation: 8 },
  },

  // Android elevation values (used directly via `elevation` prop)
  android: {
    0: 0,
    1: 1,
    2: 2,
    3: 3,
    4: 6,
    5: 8,
  },

  // Web box-shadows
  web: {
    0: 'none',
    1: '0 1px 2px rgba(0,0,0,0.08)',
    2: '0 2px 6px rgba(0,0,0,0.10)',
    3: '0 4px 12px rgba(0,0,0,0.12)',
    4: '0 8px 24px rgba(0,0,0,0.15)',
    5: '0 12px 32px rgba(0,0,0,0.18)',
  },
} as const;

// Helper: get elevation styles for current platform
export const getElevation = (level: 0 | 1 | 2 | 3 | 4 | 5) => {
  if (Platform.OS === 'ios') {
    return elevation.ios[level];
  }
  if (Platform.OS === 'android') {
    return { elevation: elevation.android[level] };
  }
  // web
  return { boxShadow: elevation.web[level] };
};

// ============================================================================
// MOTION / ANIMATION
// ============================================================================

export const motion = {
  durations: {
    fast: 150,
    normal: 250,
    slow: 350,
  },
  easing: {
    standard: 'ease-in-out',
    decelerate: 'ease-out',
    accelerate: 'ease-in',
  },
} as const;

// ============================================================================
// BREAKPOINTS (Web / Responsive)
// ============================================================================

export const breakpoints = {
  mobile: 480,
  mobileLg: 768,
  tablet: 1024,
  desktop: 1440,
} as const;

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Scale a base font size by the system fontScale, clamped to [0.85, 1.3]
 * Prevents broken layouts at extreme accessibility sizes.
 */
export const scaledFontSize = (baseSize: number, fontScale: number): number => {
  const clampedScale = Math.max(0.85, Math.min(1.3, fontScale));
  return Math.round(baseSize * clampedScale);
};

/**
 * Get category color with opacity for badge backgrounds
 */
export const getCategoryBadgeBg = (categoryKey: keyof typeof colors.category): string => {
  return colors.category[categoryKey] + '22'; // 13% opacity
};

/**
 * Get semantic color with opacity for status badge backgrounds
 */
export const getSemanticBadgeBg = (semanticKey: keyof typeof colors.semantic): string => {
  return colors.semantic[semanticKey] + '22'; // 13% opacity
};

/**
 * Get spacing value by token key
 */
export const getSpacing = (key: keyof typeof spacing): number => spacing[key];

/**
 * Get border radius value by token key
 */
export const getRadius = (key: keyof typeof borderRadius): number => borderRadius[key];

// ============================================================================
// TYPE EXPORTS (for TypeScript consumers)
// ============================================================================

export type ColorToken = keyof typeof colors.brand | keyof typeof colors.semantic | keyof typeof colors.category | keyof typeof colors.neutral | keyof typeof colors.surface;
export type SpacingToken = keyof typeof spacing;
export type RadiusToken = keyof typeof borderRadius;
export type ElevationLevel = 0 | 1 | 2 | 3 | 4 | 5;
export type FontSizeToken = keyof typeof typography.sizes;
export type FontWeightToken = keyof typeof typography.weights;
export type BreakpointToken = keyof typeof breakpoints;