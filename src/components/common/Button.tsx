import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Typography, BorderRadius, TouchTarget, Shadows } from '../../constants/theme';
import { useRTL } from '../../utils/rtl';

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
  const isDisabled = disabled || loading;
  const isRTL = useRTL();

  if (variant === 'primary') {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={isDisabled}
        activeOpacity={0.8}
        style={[
          styles.button,
          fullWidth && styles.fullWidth,
          isDisabled && styles.disabled,
          style,
        ]}
      >
        <LinearGradient
          colors={[Colors.tertiary, Colors.tertiary + 'E6']} // E6 = 90% opacity
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
      </TouchableOpacity>
    );
  }

  if (variant === 'secondary') {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={isDisabled}
        activeOpacity={0.8}
        style={[
          styles.button,
          styles.secondaryButton,
          fullWidth && styles.fullWidth,
          isDisabled && styles.disabled,
          style,
        ]}
      >
        {loading ? (
          <ActivityIndicator color={Colors.tertiary} />
        ) : (
          <Text style={[styles.secondaryText, textStyle]}>{title}</Text>
        )}
      </TouchableOpacity>
    );
  }

  if (variant === 'outline') {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={isDisabled}
        activeOpacity={0.8}
        style={[
          styles.button,
          styles.outlineButton,
          fullWidth && styles.fullWidth,
          isDisabled && styles.disabled,
          style,
        ]}
      >
        {loading ? (
          <ActivityIndicator color={Colors.alternate} />
        ) : (
          <Text style={[styles.outlineText, textStyle]}>{title}</Text>
        )}
      </TouchableOpacity>
    );
  }

  // Text variant
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.6}
      style={[styles.textButton, fullWidth && styles.fullWidth, style]}
    >
      {loading ? (
        <ActivityIndicator color={Colors.tertiary} />
      ) : (
        <Text style={[styles.textButtonText, textStyle]}>{title}</Text>
      )}
    </TouchableOpacity>
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
  secondaryButton: {
    backgroundColor: Colors.secondaryBackground,
    borderWidth: 1.5,
    borderColor: Colors.alternate,
  },
  secondaryText: {
    ...Typography.label1,
    color: Colors.tertiary,
    fontFamily: 'Outfit',
    textAlign: 'center',
    lineHeight: Typography.label1.fontSize * 1.2,
  },
  outlineButton: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: Colors.alternate,
    ...Shadows.subtle,
  },
  outlineText: {
    ...Typography.label1,
    color: Colors.alternate,
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
    color: Colors.tertiary,
    fontFamily: 'Outfit',
    textAlign: 'center',
    lineHeight: Typography.label1.fontSize * 1.2,
  },
  disabled: {
    opacity: 0.5,
  },
});

export default Button;

