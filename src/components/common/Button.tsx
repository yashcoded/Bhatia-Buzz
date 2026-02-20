import React, { useMemo } from 'react';
import {
  Pressable,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
} from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Typography, BorderRadius, TouchTarget, Shadows } from '../../constants/theme';
import { useTheme } from '../../utils/theme';
import { useRTL } from '../../utils/rtl';

const springConfig = { damping: 18, stiffness: 400 };

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'text';
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  fullWidth = true,
  style,
  textStyle,
}) => {
  const { colors } = useTheme();
  const isDisabled = disabled || loading;
  const isRTL = useRTL();
  const scale = useSharedValue(1);
  const animatedScale = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const themedStyles = useMemo(() => ({
    secondaryButton: {
      backgroundColor: colors.secondaryBackground,
      borderWidth: 1.5,
      borderColor: colors.alternate,
    },
    secondaryText: { color: colors.tertiary },
    outlineButton: {
      backgroundColor: 'transparent' as const,
      borderWidth: 1.5,
      borderColor: colors.alternate,
      ...Shadows.subtle,
    },
    outlineText: { color: colors.alternate },
    textButtonText: { color: colors.tertiary },
  }), [colors]);

  const onPressIn = () => {
    if (!isDisabled) scale.value = withSpring(0.97, springConfig);
  };
  const onPressOut = () => {
    scale.value = withSpring(1, springConfig);
  };

  if (variant === 'primary') {
    return (
      <Animated.View
        style={[
          styles.button,
          fullWidth && styles.fullWidth,
          isDisabled && styles.disabled,
          style,
          animatedScale,
        ]}
      >
        <Pressable
          onPress={onPress}
          onPressIn={onPressIn}
          onPressOut={onPressOut}
          disabled={isDisabled}
          style={styles.pressableFill}
        >
          <LinearGradient
            colors={[colors.tertiary, colors.tertiary + 'E6']}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={styles.gradient}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={[styles.primaryText, textStyle]}>{title}</Text>
            )}
          </LinearGradient>
        </Pressable>
      </Animated.View>
    );
  }

  if (variant === 'secondary') {
    return (
      <Animated.View
        style={[
          styles.button,
          themedStyles.secondaryButton,
          fullWidth && styles.fullWidth,
          isDisabled && styles.disabled,
          style,
          animatedScale,
        ]}
      >
        <Pressable
          onPress={onPress}
          onPressIn={onPressIn}
          onPressOut={onPressOut}
          disabled={isDisabled}
          style={styles.pressableFill}
        >
          {loading ? (
            <ActivityIndicator color={colors.tertiary} />
          ) : (
            <Text style={[styles.secondaryText, themedStyles.secondaryText, textStyle]}>{title}</Text>
          )}
        </Pressable>
      </Animated.View>
    );
  }

  if (variant === 'outline') {
    return (
      <Animated.View
        style={[
          styles.button,
          themedStyles.outlineButton,
          fullWidth && styles.fullWidth,
          isDisabled && styles.disabled,
          style,
          animatedScale,
        ]}
      >
        <Pressable
          onPress={onPress}
          onPressIn={onPressIn}
          onPressOut={onPressOut}
          disabled={isDisabled}
          style={styles.pressableFill}
        >
          {loading ? (
            <ActivityIndicator color={colors.alternate} />
          ) : (
            <Text style={[styles.outlineText, themedStyles.outlineText, textStyle]}>{title}</Text>
          )}
        </Pressable>
      </Animated.View>
    );
  }

  // Text variant
  return (
    <Animated.View style={[styles.textButton, fullWidth && styles.fullWidth, style, animatedScale]}>
      <Pressable
        onPress={onPress}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        disabled={isDisabled}
        style={styles.pressableFill}
      >
        {loading ? (
          <ActivityIndicator color={colors.tertiary} />
        ) : (
          <Text style={[styles.textButtonText, themedStyles.textButtonText, textStyle]}>{title}</Text>
        )}
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  button: {
    height: TouchTarget.recommended,
    borderRadius: BorderRadius.button,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.medium,
  },
  fullWidth: {
    width: '100%',
  },
  pressableFill: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: BorderRadius.button,
  },
  gradient: {
    width: '100%',
    height: '100%',
    borderRadius: BorderRadius.button,
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryText: {
    ...Typography.label1,
    color: '#FFFFFF',
    fontFamily: 'Outfit',
    textAlign: 'center',
    lineHeight: Typography.label1.fontSize * 1.2,
  },
  secondaryText: {
    ...Typography.label1,
    fontFamily: 'Outfit',
    textAlign: 'center',
    lineHeight: Typography.label1.fontSize * 1.2,
  },
  outlineText: {
    ...Typography.label1,
    fontFamily: 'Outfit',
    textAlign: 'center',
    lineHeight: Typography.label1.fontSize * 1.2,
  },
  textButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    minHeight: TouchTarget.minimum,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textButtonText: {
    ...Typography.label1,
    fontFamily: 'Outfit',
    textAlign: 'center',
    lineHeight: Typography.label1.fontSize * 1.2,
  },
  disabled: {
    opacity: 0.5,
  },
});

export default Button;

