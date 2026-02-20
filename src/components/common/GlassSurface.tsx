import React from 'react';
import { View, StyleSheet, Platform, ViewStyle } from 'react-native';
import { useTheme } from '../../utils/theme';

// Optional liquid glass (iOS 26+) – fallback if not installed or unsupported
let GlassView: React.ComponentType<any> | null = null;
try {
  const glass = require('expo-glass-effect');
  GlassView = glass.GlassView ?? null;
} catch {
  GlassView = null;
}

// Blur fallback (Android + iOS < 26)
let BlurView: React.ComponentType<any> | null = null;
try {
  BlurView = require('expo-blur').BlurView;
} catch {
  BlurView = null;
}

export interface GlassSurfaceProps {
  children?: React.ReactNode;
  style?: ViewStyle;
  /** Optional tint for glass (hex). Uses theme headerBackground for tab/header. */
  tintColor?: string;
  /** 'clear' | 'regular' for iOS liquid glass. Ignored on fallback. */
  glassEffectStyle?: 'clear' | 'regular';
}

/**
 * Renders a glass-style surface: native Liquid Glass on iOS 26+, BlurView on Android / older iOS.
 * Use for tab bar, headers, modals, or cards.
 */
const GlassSurface: React.FC<GlassSurfaceProps> = ({
  children,
  style,
  tintColor,
  glassEffectStyle = 'regular',
}) => {
  const { colors, isDark } = useTheme();
  const tint = tintColor ?? (isDark ? colors.headerBackground : colors.tabBarBackground);
  const fillStyle = [StyleSheet.absoluteFill, style];
  const useLiquidGlass = Platform.OS === 'ios' && GlassView !== null;
  const useBlur = BlurView !== null && !useLiquidGlass;

  if (useLiquidGlass && GlassView) {
    return (
      <GlassView
        style={fillStyle}
        tintColor={tint}
        glassEffectStyle={glassEffectStyle}
      >
        {children}
      </GlassView>
    );
  }

  if (useBlur && BlurView) {
    return (
      <View style={fillStyle} pointerEvents="box-none">
        <BlurView
          intensity={80}
          tint={isDark ? 'dark' : 'light'}
          style={StyleSheet.absoluteFill}
          {...(Platform.OS === 'android' && { experimentalBlurMethod: 'dimezisBlurView' })}
        />
        {children != null ? <View style={styles.content}>{children}</View> : null}
      </View>
    );
  }

  // No blur/glass available: semi-transparent surface so effect is still visible
  return (
    <View
      style={[
        fillStyle,
        {
          backgroundColor: isDark ? 'rgba(28,28,30,0.92)' : 'rgba(242,242,247,0.92)',
        },
      ]}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  fallback: {
    overflow: 'hidden',
  },
  content: {
    flex: 1,
  },
});

export default GlassSurface;
