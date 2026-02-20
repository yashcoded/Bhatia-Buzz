import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { signInUser, signUpUser, signInWithGoogleUser } from '../store/slices/authSlice';
import Button from '../components/common/Button';
import GoogleSignInButton from '../components/common/GoogleSignInButton';
import {
  Colors,
  Typography,
  Spacing,
  BorderRadius,
  TouchTarget,
} from '../constants/theme';
import { useTheme } from '../utils/theme';
import { useTranslation } from 'react-i18next';
import { getFontFamily } from '../utils/fonts';
import {
  getAgeRequirementFromLocale,
  getAgeRequirementWithLocation,
  type AgeRequirement,
} from '../utils/ageCompliance';
import { isDisposableEmail } from '../utils/emailValidation';

const AuthScreen = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const navigation = useNavigation();
  const { loading, error } = useAppSelector((state) => state.auth);
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [age, setAge] = useState('');
  const [ageRequirement, setAgeRequirement] = useState<AgeRequirement>(() =>
    getAgeRequirementFromLocale()
  );
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [acceptedPrivacy, setAcceptedPrivacy] = useState(false);
  const [acceptedAnalytics, setAcceptedAnalytics] = useState(false); // Optional
  const [acceptedMarketing, setAcceptedMarketing] = useState(false); // Optional
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  // When user switches to Sign Up, resolve region (GPS if permitted, else device locale) for age rule
  useEffect(() => {
    if (!isSignUp) return;
    let cancelled = false;
    getAgeRequirementWithLocation().then((req) => {
      if (!cancelled) setAgeRequirement(req);
    });
    return () => {
      cancelled = true;
    };
  }, [isSignUp]);

  const handleSignIn = async () => {
    if (!email || !password) {
      Alert.alert(t('common.error'), t('auth.errorFillFields'));
      return;
    }

    try {
      await dispatch(signInUser({ email, password })).unwrap();
    } catch (err: any) {
      if (typeof __DEV__ !== 'undefined' && __DEV__) console.error('Sign in error:', err);
      Alert.alert(t('auth.errorSignInFailed'), err.message || t('auth.errorGeneric'));
    }
  };

  const handleSignUp = async () => {
    if (!email || !password || !displayName) {
      Alert.alert(t('common.error'), t('auth.errorFillFields'));
      return;
    }

    // Age verification (region-based: e.g. 16+ in EU/EEA, 18+ Brazil/India, 13+ elsewhere)
    const ageNum = parseInt(age, 10);
    const minAge = ageRequirement.minAge;
    if (!age || isNaN(ageNum) || ageNum < minAge) {
      Alert.alert(t('auth.ageRequirementTitle'), t(ageRequirement.messageKey), [{ text: t('common.ok') }]);
      return;
    }

    // Consent verification - Terms and Privacy are required
    if (!acceptedTerms || !acceptedPrivacy) {
      Alert.alert(t('auth.consentRequiredTitle'), t('auth.consentRequired'));
      return;
    }

    // Block disposable/temporary emails (spam prevention; better deliverability)
    if (isDisposableEmail(email)) {
      Alert.alert(t('common.error'), t('auth.emailDisposable'));
      return;
    }

    try {
      await dispatch(signUpUser({ email, password, displayName })).unwrap();
      Alert.alert(
        t('auth.verificationSentTitle'),
        t('auth.verificationSentMessage'),
        [{ text: t('common.ok') }]
      );
    } catch (err: any) {
      if (typeof __DEV__ !== 'undefined' && __DEV__) console.error('Sign up error:', err);
      Alert.alert(t('auth.errorSignUpFailed'), err.message || t('auth.errorGeneric'));
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await dispatch(signInWithGoogleUser()).unwrap();
    } catch (err: any) {
      Alert.alert(t('auth.errorSignInFailed'), t('auth.errorGeneric'));
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.content}>
            {/* Title */}
            <Text style={styles.title}>Bhatia</Text>
            <Text style={[styles.title, styles.titleAccent]}>Buzz</Text>

            {/* Subtitle */}
            <Text style={styles.subtitle}>
              {isSignUp ? t('auth.subtitleSignUp') : t('auth.subtitleSignIn')}
            </Text>

            {/* Form */}
            <View style={styles.form}>
              {isSignUp && (
                <>
                  <TextInput
                    style={styles.input}
                    placeholder={t('auth.displayName')}
                    placeholderTextColor={colors.secondaryText}
                    value={displayName}
                    onChangeText={setDisplayName}
                    autoCapitalize="words"
                  />
                  <TextInput
                    style={styles.input}
                    placeholder={t('auth.agePlaceholder', { minAge: ageRequirement.minAge })}
                    placeholderTextColor={colors.secondaryText}
                    value={age}
                    onChangeText={setAge}
                    keyboardType="number-pad"
                  />
                </>
              )}

              <TextInput
                style={styles.input}
                placeholder={t('auth.email')}
                placeholderTextColor={colors.secondaryText}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
              />

              <TextInput
                style={styles.input}
                placeholder={t('auth.password')}
                placeholderTextColor={colors.secondaryText}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoCapitalize="none"
              />

              {error && <Text style={styles.errorText}>{error}</Text>}

              {/* Consent checkboxes for signup */}
              {isSignUp && (
                <View style={styles.consentContainer}>
                  <TouchableOpacity
                    style={styles.checkboxRow}
                    onPress={() => setAcceptedTerms(!acceptedTerms)}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.checkbox, acceptedTerms && styles.checkboxChecked]}>
                      {acceptedTerms && <Text style={styles.checkmark}>✓</Text>}
                    </View>
                    <Text style={styles.consentText}>
                      {t('auth.agreeTerms')}{' '}
                      <Text style={styles.linkText} onPress={() => navigation?.navigate('TermsOfService' as any)}>
                        {t('auth.termsOfService')}
                      </Text>
                    </Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={styles.checkboxRow}
                    onPress={() => setAcceptedPrivacy(!acceptedPrivacy)}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.checkbox, acceptedPrivacy && styles.checkboxChecked]}>
                      {acceptedPrivacy && <Text style={styles.checkmark}>✓</Text>}
                    </View>
                    <Text style={styles.consentText}>
                      {t('auth.agreePrivacy')}{' '}
                      <Text style={styles.linkText} onPress={() => navigation?.navigate('PrivacyPolicy' as any)}>
                        {t('auth.privacyPolicy')}
                      </Text>
                    </Text>
                  </TouchableOpacity>
                </View>
              )}

              {/* Primary CTA */}
              <View style={styles.buttonContainer}>
                <Button
                  title={isSignUp ? t('auth.signUp') : t('auth.signIn')}
                  onPress={isSignUp ? handleSignUp : handleSignIn}
                  loading={loading}
                  variant="primary"
                />
              </View>

              {/* Divider */}
              <View style={styles.dividerContainer}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>{t('auth.or')}</Text>
                <View style={styles.dividerLine} />
              </View>

              {/* Google Sign In */}
              <View style={styles.buttonContainer}>
                <GoogleSignInButton
                  onPress={handleGoogleSignIn}
                  loading={loading}
                  disabled={loading}
                />
              </View>

              {/* Switch Mode */}
              <Button
                title={
                  isSignUp
                    ? t('auth.alreadyHaveAccount')
                    : t('auth.dontHaveAccount')
                }
                onPress={() => setIsSignUp(!isSignUp)}
                disabled={loading}
                variant="text"
                fullWidth={false}
              />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

function makeStyles(colors: import('../constants/theme').ThemeColors) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.primaryBackground,
    },
    keyboardView: { flex: 1 },
    scrollContent: { flexGrow: 1, justifyContent: 'center' },
    content: {
      paddingHorizontal: Spacing.standard,
      paddingVertical: Spacing.xxl,
    },
    title: {
      ...Typography.headline2,
      textAlign: 'center',
      color: colors.primaryText,
      fontFamily: getFontFamily(600),
      marginBottom: Spacing.xxs,
    },
    titleAccent: { color: colors.primary },
    subtitle: {
      ...Typography.body2,
      textAlign: 'center',
      color: colors.secondaryText,
      fontFamily: getFontFamily(400),
      marginBottom: Spacing.xxl,
    },
    form: { marginTop: Spacing.large },
    input: {
      ...Typography.body3,
      height: TouchTarget.recommended,
      borderWidth: 1.5,
      borderColor: colors.alternate + '33',
      borderRadius: BorderRadius.button,
      paddingHorizontal: Spacing.medium,
      marginBottom: Spacing.medium,
      backgroundColor: colors.secondaryBackground,
      color: colors.primaryText,
      fontFamily: getFontFamily(400),
    },
    buttonContainer: { marginBottom: Spacing.medium },
    errorText: {
      ...Typography.label4,
      color: colors.error,
      textAlign: 'center',
      marginBottom: Spacing.medium,
      fontFamily: getFontFamily(500),
    },
    dividerContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginVertical: Spacing.medium,
    },
    dividerLine: {
      flex: 1,
      height: 1,
      backgroundColor: colors.alternate + '33',
    },
    dividerText: {
      ...Typography.label3,
      color: colors.secondaryText,
      marginHorizontal: Spacing.small,
      fontFamily: getFontFamily(500),
    },
    consentContainer: { marginVertical: Spacing.medium },
    checkboxRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: Spacing.small,
    },
    checkbox: {
      width: 20,
      height: 20,
      borderWidth: 2,
      borderColor: colors.alternate + '66',
      borderRadius: 4,
      marginRight: Spacing.small,
      justifyContent: 'center',
      alignItems: 'center',
    },
    checkboxChecked: {
      backgroundColor: colors.tertiary,
      borderColor: colors.tertiary,
    },
    checkmark: {
      color: colors.primaryBackground,
      fontSize: 14,
      fontWeight: 'bold',
    },
    consentText: {
      ...Typography.body4,
      color: colors.secondaryText,
      fontFamily: getFontFamily(400),
      flex: 1,
    },
    linkText: {
      color: colors.tertiary,
      fontFamily: getFontFamily(600),
      textDecorationLine: 'underline',
    },
  });
}

export default AuthScreen;
