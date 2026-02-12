import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Image,
  ActivityIndicator,
  Modal,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import * as Localization from 'expo-localization';
import { parsePhoneNumber, getCountryCallingCode, AsYouType, isValidPhoneNumber } from 'libphonenumber-js';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { updateUserProfile, changePassword } from '../store/slices/authSlice';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import {
  Colors,
  Typography,
  Spacing,
  BorderRadius,
  TouchTarget,
  Shadows,
} from '../constants/theme';
import { getFontFamily } from '../utils/fonts';
import { uploadProfilePhoto } from '../services/firebase/storage';
import { updateFirestoreUser, updateFirebaseAuthProfile } from '../services/firebase/auth';

const EditProfileScreen = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const insets = useSafeAreaInsets();

  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber || '');
  const [photoURL, setPhotoURL] = useState(user?.photoURL || '');
  const [selectedImageUri, setSelectedImageUri] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSavingDisplayName, setIsSavingDisplayName] = useState(false);
  const [isSavingPhoneNumber, setIsSavingPhoneNumber] = useState(false);
  
  // Track initial values to prevent saving unchanged values
  const [initialDisplayName, setInitialDisplayName] = useState(user?.displayName || '');
  const [initialPhoneNumber, setInitialPhoneNumber] = useState(user?.phoneNumber || '');
  
  // Country code detection - get from device locale or default to US
  const [selectedCountryCode, setSelectedCountryCode] = useState<string>(() => {
    try {
      // Try to get country from device locale (e.g., "en-US" -> "US")
      const locale = Localization.locale || 'en-US';
      const country = locale.split('-')[1]?.toUpperCase() || 'US';
      return country;
    } catch {
      return 'US'; // Default to US
    }
  });
  
  // Parse existing phone number to get country code if it exists
  useEffect(() => {
    if (phoneNumber && phoneNumber.startsWith('+')) {
      try {
        const parsed = parsePhoneNumber(phoneNumber);
        if (parsed?.country) {
          setSelectedCountryCode(parsed.country);
        }
      } catch {
        // If parsing fails, keep current country code
      }
    }
  }, [phoneNumber]);
  
  // Change password modal state
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  useEffect(() => {
    if (user) {
      setDisplayName(user.displayName || '');
      setPhotoURL(user.photoURL || '');
      setInitialDisplayName(user.displayName || '');
      
      // Parse phone number if it exists
      if (user.phoneNumber) {
        try {
          // If phone number starts with +, parse it
          if (user.phoneNumber.startsWith('+')) {
            const parsed = parsePhoneNumber(user.phoneNumber);
            if (parsed?.country) {
              setSelectedCountryCode(parsed.country);
              // Display national number (without country code)
              setPhoneNumber(parsed.formatNational() || parsed.nationalNumber || '');
            } else {
              setPhoneNumber(user.phoneNumber);
            }
          } else {
            setPhoneNumber(user.phoneNumber);
          }
          setInitialPhoneNumber(user.phoneNumber);
        } catch {
          // If parsing fails, use original phone number
          setPhoneNumber(user.phoneNumber);
          setInitialPhoneNumber(user.phoneNumber);
        }
      } else {
        setPhoneNumber('');
        setInitialPhoneNumber('');
      }
    }
  }, [user]);

  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Sorry, we need camera roll permissions to upload photos!',
          [{ text: 'OK' }]
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setSelectedImageUri(result.assets[0].uri);
        // Auto-upload image immediately
        await uploadSelectedImage(result.assets[0].uri);
      }
    } catch (err: any) {
      console.error('Error picking image:', err);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  };

  const uploadSelectedImage = async (imageUri: string) => {
    if (!user) return;

    setIsUploading(true);
    try {
      const response = await fetch(imageUri);
      const blob = await response.blob();

      const newPhotoURL = await uploadProfilePhoto(user.id, blob);
      
      // Update Firebase Auth profile (photoURL)
      await updateFirebaseAuthProfile({
        photoURL: newPhotoURL,
      });

      // Update Firestore user document
      await updateFirestoreUser(user.id, {
        photoURL: newPhotoURL,
      });

      // Update Redux store
      await dispatch(
        updateUserProfile({
          photoURL: newPhotoURL,
        })
      ).unwrap();

      setPhotoURL(newPhotoURL);
      setSelectedImageUri(null); // Clear selected URI after upload
    } catch (err: any) {
      console.error('Error uploading image:', err);
      Alert.alert('Upload Error', 'Failed to upload image. Please try again.');
      setSelectedImageUri(null); // Reset on error
    } finally {
      setIsUploading(false);
    }
  };

  const removeImage = async () => {
    if (!user) return;

    setSelectedImageUri(null);
    
    // Update Firebase Auth profile (remove photoURL)
    await updateFirebaseAuthProfile({
      photoURL: null,
    });

    // Update Firestore user document
    await updateFirestoreUser(user.id, {
      photoURL: null,
    });

    // Update Redux store
    await dispatch(
      updateUserProfile({
        photoURL: null,
      })
    ).unwrap();

    setPhotoURL('');
  };

  // Format phone number as user types based on country
  const formatPhoneNumber = (value: string): string => {
    if (!value) return '';
    
    try {
      // If it already starts with +, parse it and extract the national number
      if (value.startsWith('+')) {
        try {
          const parsed = parsePhoneNumber(value);
          if (parsed?.country) {
            setSelectedCountryCode(parsed.country);
            // Return national number without country code (since we show it separately)
            return parsed.nationalNumber || parsed.formatNational();
          }
        } catch {
          // If parsing fails, remove the + and format as local number
          const withoutPlus = value.replace(/^\+/, '');
          const formatter = new AsYouType(selectedCountryCode);
          return formatter.input(withoutPlus).replace(/^\+[\d]+\s*/, '');
        }
      } else {
        // Format based on selected country (local format)
        const formatter = new AsYouType(selectedCountryCode);
        const formatted = formatter.input(value);
        
        // Remove country code from formatted result since we show it separately
        // The formatter might add country code, so we extract just the national part
        try {
          const parsed = parsePhoneNumber(formatted, selectedCountryCode);
          if (parsed) {
            return parsed.formatNational();
          }
        } catch {
          // If we can't parse, try to remove country code pattern
          return formatted.replace(/^\+\d+\s*/, '');
        }
        
        return formatted;
      }
    } catch {
      // If formatting fails, return original value
      return value;
    }
  };

  const validatePhoneNumber = (phone: string): boolean => {
    if (!phone.trim()) return true; // Empty is allowed
    
    try {
      // If phone starts with +, validate as-is
      if (phone.startsWith('+')) {
        return isValidPhoneNumber(phone);
      } else {
        // Combine country code with phone number for validation
        try {
          const countryCode = getCountryCallingCode(selectedCountryCode);
          const fullNumber = `+${countryCode}${phone.replace(/\D/g, '')}`;
          return isValidPhoneNumber(fullNumber);
        } catch {
          // If we can't get country code, validate without it
          return isValidPhoneNumber(phone, selectedCountryCode);
        }
      }
    } catch {
      return false;
    }
  };

  const handlePhoneNumberChange = (value: string) => {
    // Remove non-digit characters except + and spaces
    const cleaned = value.replace(/[^\d+\s\-()]/g, '');
    
    // Format the phone number
    const formatted = formatPhoneNumber(cleaned);
    setPhoneNumber(formatted);
  };

  // Auto-save display name with debouncing
  useEffect(() => {
    if (!user) return;
    
    const trimmedName = displayName.trim();
    
    // Don't save if unchanged
    if (trimmedName === initialDisplayName) return;
    
    // Don't save if empty (but allow user to type)
    if (!trimmedName) {
      // If user cleared the name, don't save but don't block them
      return;
    }

    // Debounce: wait 1 second after user stops typing
    const timeoutId = setTimeout(async () => {
      setIsSavingDisplayName(true);
      try {
        // Update Firebase Auth profile (displayName)
        await updateFirebaseAuthProfile({
          displayName: trimmedName,
        });

        // Update Firestore user document
        await updateFirestoreUser(user.id, {
          displayName: trimmedName,
        });

        // Update Redux store
        await dispatch(
          updateUserProfile({
            displayName: trimmedName,
          })
        ).unwrap();

        setInitialDisplayName(trimmedName); // Update initial value
      } catch (err: any) {
        console.error('Error saving display name:', err);
        Alert.alert('Error', 'Failed to save display name. Please try again.');
      } finally {
        setIsSavingDisplayName(false);
      }
    }, 1000); // 1 second debounce

    return () => clearTimeout(timeoutId);
  }, [displayName, user, initialDisplayName, dispatch]);

  // Auto-save phone number with debouncing
  useEffect(() => {
    if (!user) return;
    
    // Don't save if unchanged
    const trimmedPhone = phoneNumber.trim();
    
    // Normalize initial phone number for comparison (convert to national format if it's in E.164)
    let initialPhoneForComparison = initialPhoneNumber;
    if (initialPhoneNumber && initialPhoneNumber.startsWith('+')) {
      try {
        const parsed = parsePhoneNumber(initialPhoneNumber);
        initialPhoneForComparison = parsed.formatNational() || parsed.nationalNumber || initialPhoneNumber;
      } catch {
        // If parsing fails, use original
      }
    }
    
    if (trimmedPhone === initialPhoneForComparison) return;

    // Validate phone number if not empty
    if (trimmedPhone && !validatePhoneNumber(trimmedPhone)) {
      return; // Don't save invalid phone numbers
    }

    // Debounce: wait 1 second after user stops typing
    const timeoutId = setTimeout(async () => {
      setIsSavingPhoneNumber(true);
      try {
        // Format phone number to international format before saving
        let phoneToSave = trimmedPhone;
        if (trimmedPhone && !trimmedPhone.startsWith('+')) {
          try {
            // Try to parse and format with country code
            const parsed = parsePhoneNumber(trimmedPhone, selectedCountryCode);
            if (parsed?.isValid()) {
              phoneToSave = parsed.format('E.164'); // E.164 format: +1234567890
            }
          } catch {
            // If parsing fails, keep original value but prepend country code if possible
            if (selectedCountryCode) {
              try {
                const countryCode = getCountryCallingCode(selectedCountryCode);
                phoneToSave = `+${countryCode}${trimmedPhone.replace(/\D/g, '')}`;
              } catch {
                // If we can't get country code, keep original
                phoneToSave = trimmedPhone;
              }
            }
          }
        }

        // Update Firestore user document (phoneNumber is only in Firestore, not Auth)
        await updateFirestoreUser(user.id, {
          phoneNumber: phoneToSave || null,
        });

        // Update Redux store
        await dispatch(
          updateUserProfile({
            phoneNumber: phoneToSave || null,
          })
        ).unwrap();

        setInitialPhoneNumber(phoneToSave); // Store E.164 format for comparison
        
        // Display in national format (without country code) since we show code separately
        try {
          const parsed = parsePhoneNumber(phoneToSave);
          if (parsed) {
            setPhoneNumber(parsed.formatNational() || parsed.nationalNumber || '');
          } else {
            setPhoneNumber(trimmedPhone); // Fallback to original if parsing fails
          }
        } catch {
          setPhoneNumber(trimmedPhone); // Fallback to original if parsing fails
        }
      } catch (err: any) {
        console.error('Error saving phone number:', err);
        Alert.alert('Error', 'Failed to save phone number. Please try again.');
      } finally {
        setIsSavingPhoneNumber(false);
      }
    }, 1000); // 1 second debounce

    return () => clearTimeout(timeoutId);
  }, [phoneNumber, user, initialPhoneNumber, selectedCountryCode, dispatch]);


  const handleChangePassword = () => {
    setShowChangePasswordModal(true);
  };

  const handleCloseChangePasswordModal = () => {
    setShowChangePasswordModal(false);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const handleSubmitPasswordChange = async () => {
    // Validation
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all password fields');
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert('Error', 'New password must be at least 6 characters long');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'New password and confirm password do not match');
      return;
    }

    if (currentPassword === newPassword) {
      Alert.alert('Error', 'New password must be different from current password');
      return;
    }

    setIsChangingPassword(true);

    try {
      await dispatch(
        changePassword({
          currentPassword,
          newPassword,
        })
      ).unwrap();

      Alert.alert('Success', 'Password changed successfully!', [
        {
          text: 'OK',
          onPress: handleCloseChangePasswordModal,
        },
      ]);
    } catch (err: any) {
      console.error('Error changing password:', err);
      Alert.alert('Error', err.message || 'Failed to change password. Please try again.');
    } finally {
      setIsChangingPassword(false);
    }
  };

  const displayImageUri = selectedImageUri || photoURL;

  return (
    <SafeAreaView style={styles.container} edges={['bottom', 'left', 'right']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView 
          showsVerticalScrollIndicator={false} 
          contentContainerStyle={[styles.content, { paddingTop: Platform.OS === 'ios' ? insets.top + Spacing.medium : Spacing.standard }]}
        >
          {/* Photo Section */}
          <Card style={styles.section} padding={Spacing.medium}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Profile Photo</Text>
              {isUploading && (
                <View style={styles.savingIndicator}>
                  <ActivityIndicator size="small" color={Colors.tertiary} />
                  <Text style={styles.savingText}>Uploading...</Text>
                </View>
              )}
            </View>
            <View style={styles.photoSection}>
              {displayImageUri ? (
                <View style={styles.photoContainer}>
                  <Image source={{ uri: displayImageUri }} style={styles.photo} />
                  <View style={styles.photoActions}>
                    <Button
                      title="Change Photo"
                      onPress={pickImage}
                      variant="secondary"
                      style={styles.photoButton}
                    />
                    <View style={styles.buttonSpacer} />
                    <Button
                      title="Remove"
                      onPress={removeImage}
                      variant="outline"
                      style={styles.photoButton}
                    />
                  </View>
                </View>
              ) : (
                <View style={styles.photoPlaceholderContainer}>
                  <View style={styles.photoPlaceholder}>
                    <Text style={styles.photoPlaceholderText}>
                      {(displayName || user?.email || 'U').charAt(0).toUpperCase()}
                    </Text>
                  </View>
                  <View style={styles.photoActions}>
                    <Button
                      title="📷 Add Photo"
                      onPress={pickImage}
                      variant="secondary"
                      style={styles.photoButton}
                    />
                  </View>
                </View>
              )}
            </View>
          </Card>

          {/* Form Section */}
          <Card style={styles.section} padding={Spacing.medium}>
            <Text style={styles.sectionTitle}>Profile Information</Text>

            <View style={styles.labelContainer}>
              <Text style={styles.inputLabel}>Display Name *</Text>
              {isSavingDisplayName && (
                <View style={styles.savingIndicator}>
                  <ActivityIndicator size="small" color={Colors.tertiary} />
                  <Text style={styles.savingText}>Saving...</Text>
                </View>
              )}
            </View>
            <TextInput
              style={styles.input}
              placeholder="Enter your display name"
              placeholderTextColor={Colors.secondaryText}
              value={displayName}
              onChangeText={setDisplayName}
              maxLength={50}
              editable={!isSavingDisplayName}
            />

            <View style={styles.labelContainer}>
              <Text style={styles.inputLabel}>Phone Number</Text>
              {isSavingPhoneNumber && (
                <View style={styles.savingIndicator}>
                  <ActivityIndicator size="small" color={Colors.tertiary} />
                  <Text style={styles.savingText}>Saving...</Text>
                </View>
              )}
            </View>
            <View style={styles.phoneInputContainer}>
              <View style={styles.countryCodeContainer}>
                <Text style={styles.countryCodeText}>
                  +{getCountryCallingCode(selectedCountryCode) || '1'}
                </Text>
              </View>
              <TextInput
                style={[styles.input, styles.phoneInput]}
                placeholder={`Enter phone number (${selectedCountryCode})`}
                placeholderTextColor={Colors.secondaryText}
                value={phoneNumber}
                onChangeText={handlePhoneNumberChange}
                keyboardType="phone-pad"
                maxLength={25}
                editable={!isSavingPhoneNumber}
              />
            </View>
            <Text style={styles.inputHint}>
              Country: {selectedCountryCode}. Format will be applied automatically.
            </Text>

            <Text style={styles.inputLabel}>Email</Text>
            <TextInput
              style={[styles.input, styles.disabledInput]}
              value={user?.email || ''}
              editable={false}
              placeholderTextColor={Colors.secondaryText}
            />
            <Text style={styles.inputHint}>
              Email cannot be changed. Contact support if you need to change it.
            </Text>
          </Card>

          {/* Change Password Button */}
          <Card style={styles.section} padding={Spacing.medium}>
            <Text style={styles.sectionTitle}>Security</Text>
            <Text style={styles.sectionDescription}>
              Change your password to keep your account secure
            </Text>
            <Button
              title="🔒 Change Password"
              onPress={handleChangePassword}
              variant="secondary"
            />
          </Card>

        </ScrollView>
      </KeyboardAvoidingView>

      {/* Change Password Modal */}
      <Modal
        visible={showChangePasswordModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={handleCloseChangePasswordModal}
      >
        <SafeAreaView style={styles.modalContainer}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.modalKeyboardView}
          >
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={handleCloseChangePasswordModal}>
                <Text style={styles.modalCancel}>Cancel</Text>
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Change Password</Text>
              <View style={{ width: 60 }} />
            </View>

            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              <Text style={styles.inputLabel}>Current Password *</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your current password"
                placeholderTextColor={Colors.secondaryText}
                value={currentPassword}
                onChangeText={setCurrentPassword}
                secureTextEntry
                autoCapitalize="none"
              />

              <Text style={styles.inputLabel}>New Password *</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter new password (min. 6 characters)"
                placeholderTextColor={Colors.secondaryText}
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry
                autoCapitalize="none"
              />
              <Text style={styles.inputHint}>
                Password must be at least 6 characters long
              </Text>

              <Text style={styles.inputLabel}>Confirm New Password *</Text>
              <TextInput
                style={styles.input}
                placeholder="Confirm your new password"
                placeholderTextColor={Colors.secondaryText}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
                autoCapitalize="none"
              />

              {isChangingPassword && (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="small" color={Colors.tertiary} />
                  <Text style={styles.loadingText}>Changing password...</Text>
                </View>
              )}

              <View style={styles.modalActions}>
                <Button
                  title={isChangingPassword ? 'Changing...' : 'Change Password'}
                  onPress={handleSubmitPasswordChange}
                  variant="primary"
                  disabled={isChangingPassword}
                  loading={isChangingPassword}
                />
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primaryBackground,
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    padding: Spacing.standard,
  },
  section: {
    marginBottom: Spacing.large,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.medium,
  },
  sectionTitle: {
    ...Typography.headline4,
    color: Colors.primaryText,
    fontFamily: getFontFamily(600),
  },
  labelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
    marginTop: Spacing.medium,
  },
  savingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  savingText: {
    ...Typography.label4,
    color: Colors.secondaryText,
    fontFamily: getFontFamily(400),
    marginLeft: Spacing.xxs,
  },
  photoSection: {
    alignItems: 'center',
  },
  photoContainer: {
    alignItems: 'center',
  },
  photo: {
    width: 150,
    height: 150,
    borderRadius: 75,
    marginBottom: Spacing.medium,
    borderWidth: 4,
    borderColor: Colors.primaryBackground,
    ...Shadows.medium,
  },
  photoPlaceholderContainer: {
    alignItems: 'center',
  },
  photoPlaceholder: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: Colors.tertiary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.medium,
    borderWidth: 4,
    borderColor: Colors.primaryBackground,
    ...Shadows.medium,
  },
  photoPlaceholderText: {
    color: Colors.primaryBackground,
    fontSize: 60,
    fontFamily: getFontFamily(700),
  },
  photoActions: {
    flexDirection: 'row',
    width: '100%',
  },
  photoButton: {
    flex: 1,
  },
  buttonSpacer: {
    width: Spacing.small,
  },
  inputLabel: {
    ...Typography.label2,
    color: Colors.primaryText,
    fontFamily: getFontFamily(600),
    marginBottom: Spacing.xs,
    marginTop: Spacing.medium,
  },
  input: {
    ...Typography.body3,
    height: TouchTarget.recommended,
    borderWidth: 1.5,
    borderColor: Colors.alternate + '33',
    borderRadius: BorderRadius.button,
    paddingHorizontal: Spacing.medium,
    backgroundColor: Colors.secondaryBackground,
    color: Colors.primaryText,
    fontFamily: getFontFamily(400),
  },
  phoneInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  countryCodeContainer: {
    height: TouchTarget.recommended,
    minWidth: 60,
    borderWidth: 1.5,
    borderColor: Colors.alternate + '33',
    borderRadius: BorderRadius.button,
    backgroundColor: Colors.secondaryBackground,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.small,
  },
  countryCodeText: {
    ...Typography.body3,
    color: Colors.tertiary,
    fontFamily: getFontFamily(600),
  },
  phoneInput: {
    flex: 1,
  },
  disabledInput: {
    backgroundColor: Colors.alternate + '0D',
    color: Colors.secondaryText,
  },
  inputHint: {
    ...Typography.label4,
    color: Colors.secondaryText,
    fontFamily: getFontFamily(400),
    marginTop: Spacing.xxs,
    fontStyle: 'italic',
  },
  saveSection: {
    marginTop: Spacing.medium,
    marginBottom: Spacing.xxxl,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.small,
  },
  loadingText: {
    ...Typography.label2,
    color: Colors.secondaryText,
    fontFamily: getFontFamily(400),
    marginLeft: Spacing.xs,
  },
  sectionDescription: {
    ...Typography.body4,
    color: Colors.secondaryText,
    fontFamily: getFontFamily(400),
    marginBottom: Spacing.medium,
    lineHeight: 20,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: Colors.primaryBackground,
  },
  modalKeyboardView: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.standard,
    paddingVertical: Spacing.medium,
    borderBottomWidth: 1,
    borderBottomColor: Colors.alternate + '33',
  },
  modalCancel: {
    ...Typography.label1,
    color: Colors.tertiary,
    fontFamily: getFontFamily(500),
  },
  modalTitle: {
    ...Typography.headline4,
    color: Colors.primaryText,
    fontFamily: getFontFamily(600),
  },
  modalBody: {
    flex: 1,
    padding: Spacing.standard,
  },
  modalActions: {
    marginTop: Spacing.large,
    marginBottom: Spacing.xxxl,
  },
});

export default EditProfileScreen;

