/**
 * Design System Theme
 * Based on Apple Design Award-Worthy UI Principles
 */

export type ColorScheme = 'light' | 'dark';

// Light theme (default)
export const LightColors = {
  primary: '#FFB74D',
  secondary: '#6B705C',
  tertiary: '#5D9CEC',
  alternate: '#D76D5B',
  primaryText: '#2C2520',
  secondaryText: '#6E665E',
  primaryBackground: '#FFFFFF',
  secondaryBackground: '#FDFBF7',
  // Softer header so it's not pure white (easier on eyes, works with notch/camera)
  headerBackground: '#F2F2F2',
  tabBarBackground: '#F2F2F2',
  success: '#34C759',
  error: '#FF3B30',
  warning: '#FF9500',
  info: '#5D9CEC',
} as const;

// Dark theme
export const DarkColors = {
  primary: '#FFB74D',
  secondary: '#8B9A7A',
  tertiary: '#7AB8F5',
  alternate: '#E07D6B',
  primaryText: '#F2F2F2',
  secondaryText: '#B0B0B0',
  primaryBackground: '#121212',
  secondaryBackground: '#1E1E1E',
  headerBackground: '#1C1C1E',
  tabBarBackground: '#1C1C1E',
  success: '#34C759',
  error: '#FF6B6B',
  warning: '#FFB84D',
  info: '#7AB8F5',
} as const;

export type ThemeColors = typeof LightColors;

export function getThemeColors(scheme: ColorScheme): ThemeColors {
  return scheme === 'dark' ? DarkColors : LightColors;
}

/** @deprecated Use getThemeColors('light') or useTheme() for light/dark. Kept for backward compatibility. */
export const Colors = LightColors;

// Opacity levels
export const Opacity = {
  // Background tints
  subtle: 0.08, // Card backgrounds
  light: 0.1, // Hover states
  medium: 0.2, // Borders, overlays
  strong: 0.3, // Shadows, emphasis

  // Text opacity
  deemphasis: 0.75, // Secondary labels
  muted: 0.8, // Subdued elements
  standard: 0.9, // Normal elements (on dark)
  full: 1.0, // Primary elements
} as const;

// Spacing (8px grid system)
export const Spacing = {
  // Horizontal screen padding
  standard: 32, // Default for all screens
  tight: 25, // Legacy (avoid in new screens)
  loose: 40, // For extra breathing room

  // Vertical spacing
  xxxl: 40, // Major section breaks
  xxl: 32, // Between major elements
  xl: 28, // Between medium elements
  large: 24, // Standard element spacing
  medium: 20, // Between related items
  small: 16, // Between card elements
  xs: 12, // Icon-to-text spacing
  xxs: 8, // Minimal spacing
} as const;

// Typography sizes
export const Typography = {
  // Headlines
  headline1: {
    fontSize: 48,
    fontWeight: '700' as const,
    letterSpacing: -1.2,
    lineHeight: 48 * 1.1, // 1.1 for headlines
  },
  headline2: {
    fontSize: 44,
    fontWeight: '600' as const,
    letterSpacing: -0.5,
    lineHeight: 44 * 1.1,
  },
  headline3: {
    fontSize: 32,
    fontWeight: '600' as const,
    letterSpacing: -0.5,
    lineHeight: 32 * 1.2,
  },
  headline4: {
    fontSize: 28,
    fontWeight: '500' as const,
    letterSpacing: -0.3,
    lineHeight: 28 * 1.2,
  },

  // Body Text
  body1: {
    fontSize: 20,
    fontWeight: '500' as const,
    letterSpacing: -0.2,
    lineHeight: 20 * 1.4, // 1.4 for body
  },
  body2: {
    fontSize: 18,
    fontWeight: '400' as const,
    letterSpacing: 0.0,
    lineHeight: 18 * 1.4,
  },
  body3: {
    fontSize: 16,
    fontWeight: '400' as const,
    letterSpacing: 0.0,
    lineHeight: 16 * 1.4,
  },
  body4: {
    fontSize: 15,
    fontWeight: '400' as const,
    letterSpacing: 0.0,
    lineHeight: 15 * 1.4,
  },

  // Labels
  label1: {
    fontSize: 17,
    fontWeight: '600' as const,
    letterSpacing: -0.2,
    lineHeight: 17 * 1.0,
  },
  label2: {
    fontSize: 15,
    fontWeight: '500' as const,
    letterSpacing: 0.3,
    lineHeight: 15 * 1.0,
  },
  label3: {
    fontSize: 14,
    fontWeight: '500' as const,
    letterSpacing: 1.5,
    lineHeight: 14 * 1.0,
  },
  label4: {
    fontSize: 13,
    fontWeight: '400' as const,
    letterSpacing: 0.0,
    lineHeight: 13 * 1.0,
  },
  label5: {
    fontSize: 12,
    fontWeight: '600' as const,
    letterSpacing: 1.5,
    lineHeight: 12 * 1.0,
  },

  // Special Numbers
  price: {
    fontSize: 56,
    fontWeight: '700' as const,
    letterSpacing: -2.0,
    lineHeight: 56 * 1.0,
  },
  stats: {
    fontSize: 24,
    fontWeight: '600' as const,
    letterSpacing: 0.0,
    lineHeight: 24 * 1.0,
  },
} as const;

// Border radius
export const BorderRadius = {
  button: 14, // Buttons
  card: 16, // Cards
  pill: 20, // Pills/Badges (fully rounded)
  small: 8, // Small elements
  medium: 12, // Medium elements
} as const;

// Icon sizes
export const IconSize = {
  hero: 28, // Main CTAs, focal points
  large: 24, // Feature icons, card headers
  standard: 20, // Button icons, list items
  small: 16, // Inline icons, chevrons
} as const;

// Touch targets
export const TouchTarget = {
  minimum: 44, // Minimum touch target
  recommended: 56, // Recommended touch target (7 × 8px)
} as const;

// Shadows
export const Shadows = {
  subtle: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 4,
  },
  dramatic: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.2,
    shadowRadius: 24,
    elevation: 8,
  },
  colored: (color: string, opacity: number = 0.3) => ({
    shadowColor: color,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: opacity,
    shadowRadius: 16,
    elevation: 4,
  }),
} as const;

// Animation timings
export const Animation = {
  fast: 200, // Micro-interactions
  standard: 400, // Standard transitions
  slow: 800, // Dramatic reveals
} as const;

// Font families (will be loaded via expo-google-fonts)
export const FontFamily = {
  primary: 'Outfit', // Clean, modern, readable
  script: 'Borel', // For special moments like greetings
  monospace: 'Montserrat', // For numbers/stats
} as const;

// Responsive layout (phone vs tablet / iPad)
export const Layout = {
  /** Min width to treat as tablet (e.g. iPad) */
  tabletMinWidth: 600,
  /** Max content width so layout doesn't stretch too wide on tablet */
  maxContentWidth: 600,
} as const;

