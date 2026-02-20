import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, Platform, Linking } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { signOutUser } from '../store/slices/authSlice';
import { RootStackParamList } from '../types';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import FadeInView from '../components/common/FadeInView';
import { Typography, Spacing, BorderRadius, Shadows } from '../constants/theme';
import type { ThemeColors } from '../constants/theme';
import { useTheme } from '../utils/theme';
import { getFontFamily } from '../utils/fonts';
import { formatDate } from '../utils/locale';

type ProfileScreenNavigationProp = StackNavigationProp<RootStackParamList>;

function makeStyles(colors: ThemeColors) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.primaryBackground },
    fadeWrap: { flex: 1 },
    headerGradient: {
      paddingBottom: Spacing.xxxl,
      borderBottomLeftRadius: BorderRadius.card * 2,
      borderBottomRightRadius: BorderRadius.card * 2,
      ...Shadows.subtle,
    },
    header: { alignItems: 'center', paddingHorizontal: Spacing.standard },
    avatarContainer: { position: 'relative', marginBottom: Spacing.medium },
    avatar: {
      width: 120,
      height: 120,
      borderRadius: 60,
      borderWidth: 4,
      borderColor: colors.primaryBackground,
      ...Shadows.medium,
    },
    avatarBorder: {
      position: 'absolute',
      top: -2,
      left: -2,
      right: -2,
      bottom: -2,
      borderRadius: 62,
      borderWidth: 2,
      borderColor: colors.tertiary,
    },
    avatarPlaceholder: {
      width: 120,
      height: 120,
      borderRadius: 60,
      backgroundColor: colors.tertiary,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: Spacing.medium,
      borderWidth: 4,
      borderColor: colors.primaryBackground,
      ...Shadows.medium,
    },
    avatarText: {
      color: colors.primaryBackground,
      fontSize: 48,
      fontFamily: getFontFamily(700),
    },
    name: {
      ...Typography.headline3,
      color: colors.primaryText,
      fontFamily: getFontFamily(700),
      marginBottom: Spacing.xxs,
      textAlign: 'center',
    },
    email: {
      ...Typography.body3,
      color: colors.secondaryText,
      marginBottom: Spacing.medium,
      fontFamily: getFontFamily(400),
      textAlign: 'center',
    },
    adminBadge: { marginTop: Spacing.xs, alignSelf: 'center' },
    content: { padding: Spacing.standard, paddingTop: Spacing.large },
    section: { marginBottom: Spacing.large },
    sectionTitle: {
      ...Typography.headline4,
      color: colors.primaryText,
      fontFamily: getFontFamily(600),
      marginBottom: Spacing.medium,
    },
    bio: {
      ...Typography.body3,
      color: colors.primaryText,
      marginBottom: Spacing.medium,
      lineHeight: 24,
      fontFamily: getFontFamily(400),
    },
    infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.medium },
    infoLabel: {
      ...Typography.label2,
      color: colors.secondaryText,
      fontFamily: getFontFamily(600),
      marginRight: Spacing.small,
    },
    infoValue: {
      ...Typography.body3,
      color: colors.primaryText,
      fontFamily: getFontFamily(400),
      flex: 1,
    },
    interests: { marginTop: Spacing.small },
    interestsList: { flexDirection: 'row', flexWrap: 'wrap', marginTop: Spacing.xs },
    interestBadge: { marginRight: Spacing.xs, marginBottom: Spacing.xs },
    statsRow: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      alignItems: 'center',
      paddingVertical: Spacing.medium,
    },
    statItem: { flex: 1, alignItems: 'center' },
    statValue: {
      ...Typography.label2,
      color: colors.secondaryText,
      fontFamily: getFontFamily(500),
      marginBottom: Spacing.xxs,
    },
    statLabel: {
      ...Typography.body2,
      color: colors.primaryText,
      fontFamily: getFontFamily(600),
    },
    statDivider: {
      width: 1,
      height: 40,
      backgroundColor: colors.alternate + '33',
    },
    actions: { marginTop: Spacing.large, marginBottom: Spacing.xxxl },
    actionSpacer: { height: Spacing.small },
    guestScroll: { flex: 1 },
    guestContainer: { padding: Spacing.standard, paddingBottom: Spacing.xxxl },
    guestTitle: {
      ...Typography.headline3,
      color: colors.primaryText,
      fontFamily: getFontFamily(600),
      marginBottom: Spacing.large,
      textAlign: 'center',
    },
    aboutSection: {
      marginBottom: Spacing.xl,
      padding: Spacing.medium,
      backgroundColor: colors.alternate + '18',
      borderRadius: BorderRadius.card,
    },
    aboutHeading: {
      ...Typography.headline4,
      color: colors.primaryText,
      fontFamily: getFontFamily(600),
      marginBottom: Spacing.small,
    },
    aboutText: {
      ...Typography.body3,
      color: colors.primaryText,
      fontFamily: getFontFamily(400),
      marginBottom: Spacing.small,
      lineHeight: 22,
    },
    aboutBullet: {
      ...Typography.body3,
      color: colors.primaryText,
      fontFamily: getFontFamily(400),
      marginBottom: Spacing.xs,
      paddingLeft: Spacing.small,
      lineHeight: 22,
    },
    createdByWrap: {
      flexDirection: 'row',
      justifyContent: 'center',
      flexWrap: 'wrap',
      marginTop: Spacing.medium,
    },
    createdBy: {
      ...Typography.label2,
      color: colors.secondaryText,
      fontFamily: getFontFamily(500),
    },
    createdByLink: {
      ...Typography.label2,
      color: colors.tertiary,
      fontFamily: getFontFamily(600),
      textDecorationLine: 'underline',
    },
    guestDivider: {
      ...Typography.label2,
      color: colors.secondaryText,
      fontFamily: getFontFamily(500),
      marginBottom: Spacing.medium,
      textAlign: 'center',
    },
    guestText: {
      ...Typography.body2,
      color: colors.secondaryText,
      fontFamily: getFontFamily(400),
      marginBottom: Spacing.xl,
      textAlign: 'center',
    },
    signInLink: { marginTop: Spacing.medium, paddingVertical: Spacing.small, alignItems: 'center' },
    signInLinkText: {
      ...Typography.body3,
      color: colors.tertiary,
      fontFamily: getFontFamily(600),
    },
  });
}

const ProfileScreen = () => {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const dispatch = useAppDispatch();
  const navigation = useNavigation<ProfileScreenNavigationProp>();
  const { user } = useAppSelector((state) => state.auth);
  const insets = useSafeAreaInsets();

  const handleSignOut = async () => {
    try {
      await dispatch(signOutUser()).unwrap();
    } catch (err) {
      console.error('Error signing out:', err);
    }
  };

  const handleSettings = () => {
    const root = navigation.getParent();
    if (root) {
      (root as any).navigate('Settings');
    } else {
      navigation.navigate('Settings');
    }
  };

  const handleRequests = () => {
    // Requests is a stack screen; we're inside the Main tab, so use root stack
    const root = navigation.getParent();
    if (root) {
      (root as any).navigate('Requests', { openMyRequests: true });
    } else {
      navigation.navigate('Requests' as any, { openMyRequests: true });
    }
  };

  // Guest: About the app + login options
  if (!user) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom', 'left', 'right']}>
        <ScrollView style={styles.guestScroll} showsVerticalScrollIndicator={false}>
          <View style={styles.guestContainer}>
            <Text style={styles.guestTitle}>Profile</Text>

            <View style={styles.aboutSection}>
              <Text style={styles.aboutHeading}>About Bhatia Buzz</Text>
              <Text style={styles.aboutText}>
                Bhatia Buzz is a community app for the Bhatia community. Here’s what you can do:
              </Text>
              <Text style={styles.aboutBullet}>• Feed — See posts and updates from the community</Text>
              <Text style={styles.aboutBullet}>• Panja Khada — Community content and engagement</Text>
              <Text style={styles.aboutBullet}>• Requests — Share and view celebration, condolence, and match requests</Text>
              <Text style={styles.aboutBullet}>• Match — Create a matrimonial profile, verify with a photo, and discover matches (requires sign in)</Text>
              <Text style={styles.aboutText}>
                Sign in to access your profile, the Match tab, and to post or respond to requests.
              </Text>
              <TouchableOpacity
                style={styles.createdByWrap}
                onPress={() => Linking.openURL('https://yashcoded.com')}
                activeOpacity={0.7}
              >
                <Text style={styles.createdBy}>Created by </Text>
                <Text style={styles.createdByLink}>Yash Bhatia</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.guestDivider}>Sign in to continue</Text>
            <Button
              title="Login / Sign Up"
              onPress={() => navigation.navigate('Auth')}
              variant="primary"
            />
            <TouchableOpacity
              style={styles.signInLink}
              onPress={() => navigation.navigate('Auth')}
              activeOpacity={0.7}
            >
              <Text style={styles.signInLinkText}>Already have an account? Sign in</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom', 'left', 'right']}>
      <FadeInView style={styles.fadeWrap}>
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Profile Header with Gradient */}
        <LinearGradient
          colors={[colors.tertiary + '20', colors.primaryBackground]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.headerGradient, { paddingTop: Platform.OS === 'ios' ? insets.top + Spacing.large : Spacing.xxl }]}
        >
          <View style={styles.header}>
            {user.photoURL ? (
              <View style={styles.avatarContainer}>
                <Image source={{ uri: user.photoURL }} style={styles.avatar} />
                <View style={styles.avatarBorder} />
              </View>
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarText}>
                  {(user.displayName || user.email || 'U').charAt(0).toUpperCase()}
                </Text>
              </View>
            )}
            <Text style={styles.name}>{user.displayName || 'User'}</Text>
            <Text style={styles.email}>{user.email}</Text>
            {user.role === 'admin' && (
              <Badge label="Admin" color={colors.warning} style={styles.adminBadge} />
            )}
          </View>
        </LinearGradient>

          <View style={styles.content}>
          {/* Profile Info */}
          {user.profile && (
            <Card style={styles.section} padding={Spacing.medium}>
              <Text style={styles.sectionTitle}>Profile Information</Text>
              {user.profile.bio && <Text style={styles.bio}>{user.profile.bio}</Text>}
              {user.profile.location && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>📍 Location</Text>
                  <Text style={styles.infoValue}>{user.profile.location}</Text>
                </View>
              )}
              {user.profile.interests && user.profile.interests.length > 0 && (
                <View style={styles.interests}>
                  <Text style={styles.infoLabel}>🎯 Interests</Text>
                  <View style={styles.interestsList}>
                    {user.profile.interests.map((interest, index) => (
                      <Badge
                        key={index}
                        label={interest}
                        color={colors.tertiary}
                        uppercase={false}
                        style={styles.interestBadge}
                      />
                    ))}
                  </View>
                </View>
              )}
            </Card>
          )}

          {/* Stats or Empty State */}
          <Card style={styles.section} padding={Spacing.medium}>
            <Text style={styles.sectionTitle}>Account Details</Text>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>Member since</Text>
                <Text style={styles.statLabel}>
                  {formatDate(user.createdAt, { month: 'short', year: 'numeric' })}
                </Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>Role</Text>
                <Text style={styles.statLabel}>
                  {user.role === 'admin' ? 'Administrator' : 'Member'}
                </Text>
              </View>
            </View>
          </Card>

          {/* Actions */}
          <View style={styles.actions}>
            <Button
              title="📝 Requests"
              onPress={handleRequests}
              variant="secondary"
            />
            <View style={styles.actionSpacer} />
            <Button title="⚙️ Settings" onPress={handleSettings} variant="secondary" />
            <View style={styles.actionSpacer} />
            <Button
              title="🚪 Sign Out"
              onPress={handleSignOut}
              variant="secondary"
            />
          </View>
        </View>
        </ScrollView>
      </FadeInView>
    </SafeAreaView>
  );
};

export default ProfileScreen;

