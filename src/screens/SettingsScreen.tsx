import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, Platform, Share } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { deleteAccount, resendVerificationEmail } from '../store/slices/authSlice';
import { exportUserData, exportDataToJSON } from '../utils/dataExport';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { Colors, Typography, Spacing, BorderRadius } from '../constants/theme';
import { getFontFamily } from '../utils/fonts';
import { RootStackParamList } from '../types';
import { formatDate } from '../utils/locale';

type SettingsScreenNavigationProp = StackNavigationProp<RootStackParamList>;

const SettingsScreen = () => {
  const navigation = useNavigation<SettingsScreenNavigationProp>();
  const dispatch = useAppDispatch();
  const { user, loading: authLoading } = useAppSelector((state) => state.auth);
  const insets = useSafeAreaInsets();
  const [isExporting, setIsExporting] = useState(false);

  const handleResendVerification = async () => {
    try {
      await dispatch(resendVerificationEmail()).unwrap();
      Alert.alert('Email sent', 'Please check your inbox and click the verification link.');
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to send verification email. Try again later.');
    }
  };

  const handleExportData = async () => {
    if (!user) return;

    setIsExporting(true);
    try {
      const data = await exportUserData(user.id, user);
      const jsonString = exportDataToJSON(data);

      // Share the data (works on both iOS and Android)
      await Share.share({
        message: jsonString,
        title: 'Bhatia Buzz Data Export',
      });

      Alert.alert('Success', 'Your data has been prepared for export. Please save it securely.');
    } catch (err: any) {
      console.error('Error exporting data:', err);
      Alert.alert('Error', 'Failed to export data. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleEditProfile = () => {
    navigation.navigate('EditProfile' as any);
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account? This action cannot be undone. All your data including posts, requests, and profile information will be permanently deleted.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            // Second confirmation
            Alert.alert(
              'Final Confirmation',
              'This will permanently delete your account and all associated data. This action cannot be reversed. Are you absolutely sure?',
              [
                {
                  text: 'Cancel',
                  style: 'cancel',
                },
                {
                  text: 'Yes, Delete My Account',
                  style: 'destructive',
                  onPress: async () => {
                    try {
                      await dispatch(deleteAccount()).unwrap();
                      Alert.alert(
                        'Account Deleted',
                        'Your account has been successfully deleted. You will be signed out.',
                        [{ text: 'OK' }]
                      );
                    } catch (error: any) {
                      Alert.alert(
                        'Error',
                        error.message || 'Failed to delete account. Please try again.',
                        [{ text: 'OK' }]
                      );
                    }
                  },
                },
              ]
            );
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom', 'left', 'right']}>
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.content, { paddingTop: Platform.OS === 'ios' ? insets.top + Spacing.medium : Spacing.standard }]}
      >
          {/* Edit Profile Section */}
          <Card style={styles.section} padding={Spacing.medium}>
            <Text style={styles.sectionTitle}>Profile Settings</Text>
            <Text style={styles.sectionDescription}>
              Update your profile information, photo, and contact details
            </Text>
            <View style={styles.buttonContainer}>
              <Button
                title="✏️ Edit Profile"
                onPress={handleEditProfile}
                variant="secondary"
              />
            </View>
          </Card>

          {/* Account Actions Section */}
          <Card style={styles.section} padding={Spacing.medium}>
            <Text style={styles.sectionTitle}>Account Actions</Text>
            
            {/* Delete Account */}
            <View style={styles.dangerSection}>
              <Text style={styles.dangerTitle}>Delete Account</Text>
              <Text style={styles.dangerDescription}>
                Permanently delete your account and all associated data. This action cannot be undone.
              </Text>
              <View style={styles.buttonContainer}>
                <Button
                  title="🗑️ Delete My Account"
                  onPress={handleDeleteAccount}
                  variant="secondary"
                />
              </View>
            </View>
          </Card>

          {/* About & Developer */}
          <Card style={styles.section} padding={Spacing.medium}>
            <Text style={styles.sectionTitle}>About & Developer</Text>
            <Text style={styles.sectionDescription}>
              How the app works, features, and documentation (API keys, setup)
            </Text>
            <View style={styles.buttonContainer}>
              <Button
                title="📖 About & Developer Docs"
                onPress={() => navigation.navigate('AboutDeveloper' as any)}
                variant="secondary"
              />
            </View>
          </Card>

          {/* Legal & Privacy */}
          <Card style={styles.section} padding={Spacing.medium}>
            <Text style={styles.sectionTitle}>Legal & Privacy</Text>
            <Text style={styles.sectionDescription}>
              Review our legal documents and privacy information
            </Text>
            <View style={styles.buttonContainer}>
              <Button
                title="📄 Privacy Policy"
                onPress={() => navigation.navigate('PrivacyPolicy' as any)}
                variant="secondary"
              />
            </View>
            <View style={styles.buttonContainer}>
              <Button
                title="📋 Terms of Service"
                onPress={() => navigation.navigate('TermsOfService' as any)}
                variant="secondary"
              />
            </View>
          </Card>

          {/* Data Export (GDPR) */}
          <Card style={styles.section} padding={Spacing.medium}>
            <Text style={styles.sectionTitle}>Data Export</Text>
            <Text style={styles.sectionDescription}>
              Download a copy of all your data (GDPR Right to Data Portability)
            </Text>
            <View style={styles.buttonContainer}>
              <Button
                title={isExporting ? 'Exporting...' : '📥 Export My Data'}
                onPress={handleExportData}
                variant="secondary"
                loading={isExporting}
                disabled={isExporting}
              />
            </View>
          </Card>

          {/* Email verification banner */}
          {user && user.emailVerified === false && (
            <Card style={[styles.section, styles.verificationBanner]} padding={Spacing.medium}>
              <Text style={styles.verificationTitle}>Verify your email</Text>
              <Text style={styles.verificationText}>
                We sent a verification link to {user.email}. Click the link in that email to verify your account.
              </Text>
              <Button
                title="Resend verification email"
                onPress={handleResendVerification}
                loading={authLoading}
                variant="secondary"
                style={styles.buttonContainer}
              />
            </Card>
          )}

          {/* Account Information */}
          <Card style={styles.section} padding={Spacing.medium}>
            <Text style={styles.sectionTitle}>Account Information</Text>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Username</Text>
              <Text style={styles.infoValue}>{user?.displayName || 'N/A'}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Email</Text>
              <Text style={styles.infoValue}>{user?.email}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Member Since</Text>
              <Text style={styles.infoValue}>
                {user?.createdAt
                  ? formatDate(user.createdAt)
                  : 'N/A'}
              </Text>
            </View>
          </Card>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primaryBackground,
  },
  content: {
    padding: Spacing.standard,
  },
  section: {
    marginBottom: Spacing.large,
  },
  sectionTitle: {
    ...Typography.headline4,
    color: Colors.primaryText,
    fontFamily: getFontFamily(600),
    marginBottom: Spacing.xs,
  },
  sectionDescription: {
    ...Typography.body3,
    color: Colors.secondaryText,
    fontFamily: getFontFamily(400),
    marginBottom: Spacing.medium,
    lineHeight: 22,
  },
  buttonContainer: {
    marginTop: Spacing.small,
  },
  dangerSection: {
    marginTop: Spacing.medium,
    paddingTop: Spacing.medium,
    borderTopWidth: 1,
    borderTopColor: Colors.alternate + '33',
  },
  dangerTitle: {
    ...Typography.label1,
    color: Colors.error,
    fontFamily: getFontFamily(600),
    marginBottom: Spacing.xs,
  },
  dangerDescription: {
    ...Typography.body4,
    color: Colors.secondaryText,
    fontFamily: getFontFamily(400),
    marginBottom: Spacing.medium,
    lineHeight: 20,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.small,
    borderBottomWidth: 1,
    borderBottomColor: Colors.alternate + '1A',
  },
  infoLabel: {
    ...Typography.label2,
    color: Colors.secondaryText,
    fontFamily: getFontFamily(500),
    flex: 1,
  },
  infoValue: {
    ...Typography.body3,
    color: Colors.primaryText,
    fontFamily: getFontFamily(400),
    flex: 1,
    textAlign: 'right',
  },
  verificationBanner: {
    borderLeftWidth: 4,
    borderLeftColor: Colors.tertiary,
  },
  verificationTitle: {
    ...Typography.label1,
    color: Colors.primaryText,
    fontFamily: getFontFamily(600),
    marginBottom: Spacing.xs,
  },
  verificationText: {
    ...Typography.body3,
    color: Colors.secondaryText,
    fontFamily: getFontFamily(400),
    marginBottom: Spacing.small,
    lineHeight: 22,
  },
});

export default SettingsScreen;

