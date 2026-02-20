import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  ActivityIndicator,
  View,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { Colors, Typography, BorderRadius, TouchTarget, Shadows } from '../../constants/theme';
import { getFontFamily } from '../../utils/fonts';

interface GoogleSignInButtonProps {
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
}

const GoogleSignInButton: React.FC<GoogleSignInButtonProps> = ({
  onPress,
  disabled = false,
  loading = false,
  fullWidth = true,
  style,
}) => {
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.85}
      style={[
        styles.button,
        fullWidth && styles.fullWidth,
        isDisabled && styles.disabled,
        style,
      ]}
    >
      <View style={styles.content}>
        {loading ? (
          <ActivityIndicator color="#5F6368" size="small" />
        ) : (
          <>
            {/* Official Google "G" mark (SVG) */}
            <View style={styles.googleLogo} pointerEvents="none">
              <Svg width={18} height={18} viewBox="0 0 18 18">
                <Path
                  fill="#EA4335"
                  d="M9 3.48c1.69 0 2.84.73 3.49 1.34l2.54-2.54C13.46.89 11.44 0 9 0 5.48 0 2.44 2.02.96 4.96l2.98 2.31C4.68 5.01 6.69 3.48 9 3.48z"
                />
                <Path
                  fill="#4285F4"
                  d="M17.64 9.2c0-.63-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.71-1.57 2.68-3.89 2.68-6.62z"
                />
                <Path
                  fill="#FBBC05"
                  d="M3.94 10.09a5.4 5.4 0 0 1 0-3.18V4.65H.96a9 9 0 0 0 0 8.1l2.98-2.31z"
                />
                <Path
                  fill="#34A853"
                  d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.81.54-1.85.86-3.04.86-2.31 0-4.32-1.53-5.03-3.59H.96v2.26A9 9 0 0 0 9 18z"
                />
              </Svg>
            </View>
            <Text style={styles.buttonText}>Sign in with Google</Text>
          </>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    height: TouchTarget.recommended,
    borderRadius: BorderRadius.button,
    backgroundColor: Colors.primaryBackground,
    borderWidth: 1,
    borderColor: '#DADCE0', // Google's standard border color
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.subtle,
  },
  fullWidth: {
    width: '100%',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  googleLogo: {
    width: 20,
    height: 20,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    ...Typography.label1,
    color: '#3C4043', // Google's standard text color
    fontFamily: getFontFamily(500),
    letterSpacing: 0,
  },
  disabled: {
    opacity: 0.6,
  },
});

export default GoogleSignInButton;

