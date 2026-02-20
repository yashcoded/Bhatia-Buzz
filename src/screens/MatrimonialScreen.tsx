import React, { useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchMatrimonialProfiles } from '../store/slices/matrimonialSlice';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { Typography, Spacing, BorderRadius } from '../constants/theme';
import type { ThemeColors } from '../constants/theme';
import { useTheme } from '../utils/theme';
import { getFontFamily } from '../utils/fonts';
import Button from '../components/common/Button';
import FadeInView from '../components/common/FadeInView';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const MatrimonialScreen = () => {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const dispatch = useAppDispatch();
  const navigation = useNavigation<NavigationProp>();
  const { profiles, loading } = useAppSelector((state) => state.matrimonial);
  const { user } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (user) {
      loadProfiles();
    }
  }, [user]);

  const loadProfiles = async () => {
    try {
      await dispatch(fetchMatrimonialProfiles()).unwrap();
    } catch (err) {
      console.error('Error loading profiles:', err);
    }
  };

  const handleCreateProfile = () => {
    if (!user) {
      navigation.navigate('Auth');
      return;
    }
    navigation.navigate('CreateMatrimonialProfile');
  };

  const handleSwipe = () => {
    if (!user) {
      navigation.navigate('Auth');
      return;
    }
    navigation.navigate('MatrimonialSwipe');
  };

  const userProfile = profiles.find((p) => p.userId === user?.id);

  // Require sign-in: show gate when not authenticated
  if (!user) {
    return (
      <View style={styles.container}>
        <View style={styles.signInGate}>
          <Text style={styles.signInGateTitle}>Sign in to access Matrimonial</Text>
          <Text style={styles.signInGateText}>
            Create an account or sign in to create your profile, browse matches, and connect.
          </Text>
          <Button
            title="Sign in"
            onPress={() => navigation.navigate('Auth')}
            style={styles.signInButton}
          />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.tertiary} />
        </View>
      ) : (
        <FadeInView style={styles.content}>
          {!userProfile ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyTitle}>No Profile Yet</Text>
              <Text style={styles.emptyText}>
                Create your matrimonial profile to find matches
              </Text>
              <TouchableOpacity style={styles.button} onPress={handleCreateProfile}>
                <Text style={styles.buttonText}>Create Profile</Text>
              </TouchableOpacity>
            </View>
          ) : userProfile.status === 'pending' ? (
            <View style={styles.pendingContainer}>
              <Text style={styles.pendingTitle}>Profile Under Review</Text>
              <Text style={styles.pendingText}>
                Your profile is being reviewed by admins. You'll be notified once it's approved.
              </Text>
            </View>
          ) : (
            <View style={styles.profileContainer}>
              <Text style={styles.welcomeText}>Welcome, {userProfile.personalInfo.name}!</Text>
              <TouchableOpacity style={styles.button} onPress={handleSwipe}>
                <Text style={styles.buttonText}>Find Matches</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.secondaryButton]}
                onPress={() => {
                  navigation.navigate('MatrimonialDetail', { profileId: userProfile.id });
                }}
              >
                <Text style={[styles.buttonText, styles.secondaryButtonText]}>
                  View My Profile
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </FadeInView>
      )}
    </View>
  );
};

function makeStyles(colors: ThemeColors) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.primaryBackground,
    },
    signInGate: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: Spacing.xl,
    },
    signInGateTitle: {
      ...Typography.headline3,
      color: colors.primaryText,
      fontFamily: getFontFamily(600),
      textAlign: 'center',
      marginBottom: Spacing.small,
    },
    signInGateText: {
      ...Typography.body3,
      color: colors.secondaryText,
      fontFamily: getFontFamily(400),
      textAlign: 'center',
      marginBottom: Spacing.xl,
      lineHeight: 22,
    },
    signInButton: { minWidth: 200 },
    centerContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    content: { flex: 1, padding: Spacing.large },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    emptyTitle: {
      ...Typography.headline3,
      color: colors.primaryText,
      fontFamily: getFontFamily(600),
      marginBottom: Spacing.small,
    },
    emptyText: {
      ...Typography.body3,
      color: colors.secondaryText,
      textAlign: 'center',
      marginBottom: Spacing.xl,
    },
    pendingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: Spacing.large,
    },
    pendingTitle: {
      ...Typography.headline3,
      color: colors.primaryText,
      fontFamily: getFontFamily(600),
      marginBottom: Spacing.small,
    },
    pendingText: {
      ...Typography.body3,
      color: colors.secondaryText,
      textAlign: 'center',
    },
    profileContainer: { flex: 1, justifyContent: 'center' },
    welcomeText: {
      ...Typography.headline3,
      color: colors.primaryText,
      fontFamily: getFontFamily(600),
      textAlign: 'center',
      marginBottom: Spacing.xl,
    },
    button: {
      backgroundColor: colors.tertiary,
      borderRadius: BorderRadius.button,
      padding: Spacing.medium,
      alignItems: 'center',
      marginBottom: Spacing.medium,
    },
    secondaryButton: {
      backgroundColor: colors.primaryBackground,
      borderWidth: 1,
      borderColor: colors.tertiary,
    },
    buttonText: {
      color: colors.primaryBackground,
      ...Typography.label1,
      fontFamily: getFontFamily(600),
    },
    secondaryButtonText: { color: colors.tertiary },
  });
}

export default MatrimonialScreen;

