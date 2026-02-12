import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Switch,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Modal,
  FlatList,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import Svg, { Path } from 'react-native-svg';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { createMatrimonialProfile } from '../store/slices/matrimonialSlice';
import { RootStackParamList, PersonalInfo, FamilyInfo, Preferences } from '../types';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import {
  Colors,
  Typography,
  Spacing,
  BorderRadius,
  TouchTarget,
} from '../constants/theme';
import { getFontFamily } from '../utils/fonts';
import { uploadMatrimonialPhoto } from '../services/firebase/storage';
import { formatDateShort } from '../utils/locale';
import { verifyFaceWithHuggingFace } from '../services/faceVerification';
import {
  feetInchesToCm,
  cmToFeetInches,
  formatCm,
  formatFeetInches,
} from '../utils/height';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const CreateMatrimonialProfileScreen = () => {
  const dispatch = useAppDispatch();
  const navigation = useNavigation<NavigationProp>();
  const { user } = useAppSelector((state) => state.auth);
  const insets = useSafeAreaInsets();

  // Personal Information
  const [name, setName] = useState('');
  const [surname, setSurname] = useState('');
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [dateOfBirth, setDateOfBirth] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [heightFeet, setHeightFeet] = useState(5);
  const [heightInches, setHeightInches] = useState(6);
  const [heightCm, setHeightCm] = useState(168);
  const [useCm, setUseCm] = useState(false);
  const [heightPickerOpen, setHeightPickerOpen] = useState<'feet' | 'inches' | 'cm' | null>(null);
  const [physicalDisability, setPhysicalDisability] = useState(false);
  const [timeOfBirth, setTimeOfBirth] = useState(''); // Format: HH:MM AM/PM
  const [placeOfBirth, setPlaceOfBirth] = useState('');
  const [nativePlace, setNativePlace] = useState('');
  const [engagedBeforeOrDivorcee, setEngagedBeforeOrDivorcee] = useState(false);
  const [caste, setCaste] = useState('');
  const [religion, setReligion] = useState('');
  const [gotra, setGotra] = useState('');
  const [complexion, setComplexion] = useState('');
  const [nationality, setNationality] = useState('');

  // Education & Career
  const [education, setEducation] = useState('');
  const [occupation, setOccupation] = useState('');
  const [presentAddress, setPresentAddress] = useState('');
  const [emailId, setEmailId] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');

  // Family Information
  const [fatherName, setFatherName] = useState('');
  const [motherName, setMotherName] = useState('');
  const [grandParents, setGrandParents] = useState('');
  const [maternalGrandParents, setMaternalGrandParents] = useState('');
  const [youngerBrothers, setYoungerBrothers] = useState<string>('');
  const [youngerSiblingNames, setYoungerSiblingNames] = useState('');
  const [preferenceOther, setPreferenceOther] = useState('');

  // Photos
  const [photos, setPhotos] = useState<string[]>([]); // Array of local URIs
  const [isUploadingPhotos, setIsUploadingPhotos] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isVerifyingFace, setIsVerifyingFace] = useState(false);

  // Plus icon for add photo button
  const PlusIcon = ({ color, size }: { color: string; size: number }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 5V19M5 12H19"
        stroke={color}
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );

  // X icon for remove photo button
  const XIcon = ({ color, size }: { color: string; size: number }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M18 6L6 18M6 6L18 18"
        stroke={color}
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );

  // Pick photo from gallery
  const pickPhoto = async () => {
    try {
      // Request permission
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Sorry, we need camera roll permissions to upload photos!',
          [{ text: 'OK' }]
        );
        return;
      }

      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsMultipleSelection: false,
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        if (photos.length >= 5) {
          Alert.alert('Photo Limit', 'You can upload up to 5 photos. Please remove one first.');
          return;
        }
        
        const newPhoto = result.assets[0].uri;
        
        // Verify face before adding photo
        setIsVerifyingFace(true);
        try {
          const verificationResult = await verifyFaceWithHuggingFace(newPhoto);
          
          setIsVerifyingFace(false);
          
          if (!verificationResult.isVisible || !verificationResult.hasFace) {
            Alert.alert(
              'Face Verification Failed',
              verificationResult.error || 'Please ensure your face is clearly visible and facing the camera.',
              [{ text: 'OK' }]
            );
            return;
          }
          
          if (!verificationResult.isFrontal && verificationResult.confidence < 0.6) {
            Alert.alert(
              'Photo Quality Warning',
              'Please upload a photo where you are facing the camera directly for better results.',
              [
                { text: 'Cancel', style: 'cancel' },
                { 
                  text: 'Use Anyway', 
                  onPress: () => setPhotos([...photos, newPhoto])
                }
              ]
            );
            return;
          }
          
          if (verificationResult.faceCount > 1) {
            Alert.alert(
              'Multiple Faces Detected',
              verificationResult.error || 'Please upload a photo with only one person.',
              [{ text: 'OK' }]
            );
            return;
          }
          
          // Face verification passed
          setPhotos([...photos, newPhoto]);
          Alert.alert('Success', 'Photo verified and added successfully!');
        } catch (error: any) {
          setIsVerifyingFace(false);
          console.error('Face verification error:', error);
          Alert.alert(
            'Verification Error',
            'Failed to verify face. You can still add the photo, but please ensure your face is clearly visible.',
            [
              { text: 'Cancel', style: 'cancel' },
              { 
                text: 'Add Anyway', 
                onPress: () => setPhotos([...photos, newPhoto])
              }
            ]
          );
        }
      }
    } catch (error: any) {
      console.error('Error picking photo:', error);
      Alert.alert('Error', 'Failed to pick photo. Please try again.');
    }
  };

  // Remove photo
  const removePhoto = (index: number) => {
    const newPhotos = photos.filter((_, i) => i !== index);
    setPhotos(newPhotos);
  };

  // Move photo up (to lower index)
  const movePhotoUp = (index: number) => {
    if (index === 0) return; // Already at top
    const newPhotos = [...photos];
    [newPhotos[index - 1], newPhotos[index]] = [newPhotos[index], newPhotos[index - 1]];
    setPhotos(newPhotos);
  };

  // Move photo down (to higher index)
  const movePhotoDown = (index: number) => {
    if (index === photos.length - 1) return; // Already at bottom
    const newPhotos = [...photos];
    [newPhotos[index], newPhotos[index + 1]] = [newPhotos[index + 1], newPhotos[index]];
    setPhotos(newPhotos);
  };

  // Format date using locale-aware formatting
  const formatDate = (date: Date | null): string => {
    if (!date) return '';
    return formatDateShort(date);
  };

  // Calculate age from date of birth
  const calculateAge = (dob: Date | null): number | undefined => {
    if (!dob) return undefined;
    try {
      const today = new Date();
      let age = today.getFullYear() - dob.getFullYear();
      const monthDiff = today.getMonth() - dob.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
        age--;
      }
      return age;
    } catch {
      return undefined;
    }
  };

  // Handle date picker change
  const onDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
      if (selectedDate && event.type !== 'dismissed') {
        setDateOfBirth(selectedDate);
      }
    } else {
      // iOS - update date as user scrolls, but don't close until Done is pressed
      if (selectedDate) {
        setDateOfBirth(selectedDate);
      }
    }
  };

  // Handle iOS date picker confirmation
  const handleIOSDateConfirm = () => {
    setShowDatePicker(false);
  };

  // Handle iOS date picker cancellation
  const handleIOSDateCancel = () => {
    setShowDatePicker(false);
    // Optionally restore previous date or keep current selection
  };

  const validateForm = (): boolean => {
    // Validate photos - at least 1 and up to 5 required
    if (photos.length < 1) {
      Alert.alert('Validation Error', 'Please upload at least 1 photo');
      return false;
    }
    if (photos.length > 5) {
      Alert.alert('Validation Error', 'You can upload up to 5 photos');
      return false;
    }
    
    if (!name.trim()) {
      Alert.alert('Validation Error', 'Please enter your name');
      return false;
    }
    if (!surname.trim()) {
      Alert.alert('Validation Error', 'Please enter your surname');
      return false;
    }
    if (!dateOfBirth) {
      Alert.alert('Validation Error', 'Please select your date of birth');
      return false;
    }
    // Validate date is not in the future
    if (dateOfBirth > new Date()) {
      Alert.alert('Validation Error', 'Date of birth cannot be in the future');
      return false;
    }
    const heightString = useCm ? formatCm(heightCm) : formatFeetInches(heightFeet, heightInches);
    if (!heightString) {
      Alert.alert('Validation Error', 'Please select your height');
      return false;
    }
    if (!placeOfBirth.trim()) {
      Alert.alert('Validation Error', 'Please enter your place of birth');
      return false;
    }
    if (!nativePlace.trim()) {
      Alert.alert('Validation Error', 'Please enter your native place');
      return false;
    }
    if (!education.trim()) {
      Alert.alert('Validation Error', 'Please enter your education/qualification');
      return false;
    }
    if (!occupation.trim()) {
      Alert.alert('Validation Error', 'Please enter your job/occupation');
      return false;
    }
    if (!presentAddress.trim()) {
      Alert.alert('Validation Error', 'Please enter your present address');
      return false;
    }
    if (!emailId.trim()) {
      Alert.alert('Validation Error', 'Please enter your email ID');
      return false;
    }
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailId.trim())) {
      Alert.alert('Validation Error', 'Please enter a valid email address');
      return false;
    }
    if (!fatherName.trim()) {
      Alert.alert('Validation Error', 'Please enter your father\'s name');
      return false;
    }
    if (!motherName.trim()) {
      Alert.alert('Validation Error', 'Please enter your mother\'s name');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!user) {
      Alert.alert('Error', 'You must be logged in to create a profile');
      return;
    }

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setIsUploadingPhotos(true);

    try {
      // Upload photos first
      const photoUrls: string[] = [];
      const tempProfileId = `temp_${user.id}_${Date.now()}`;
      
      for (let i = 0; i < photos.length; i++) {
        try {
          const response = await fetch(photos[i]);
          const blob = await response.blob();
          const photoUrl = await uploadMatrimonialPhoto(tempProfileId, blob, i);
          photoUrls.push(photoUrl);
        } catch (error: any) {
          console.error(`Error uploading photo ${i + 1}:`, error);
          throw new Error(`Failed to upload photo ${i + 1}. Please try again.`);
        }
      }

      setIsUploadingPhotos(false);
      
      const age = calculateAge(dateOfBirth);
      
      const personalInfo: PersonalInfo = {
        name: name.trim(),
        surname: surname.trim(),
        age,
        dateOfBirth: formatDate(dateOfBirth),
        gender,
        height: useCm ? formatCm(heightCm) : formatFeetInches(heightFeet, heightInches),
        heightInCm: useCm ? heightCm : feetInchesToCm(heightFeet, heightInches),
        physicalDisability,
        timeOfBirth: timeOfBirth.trim() || undefined,
        placeOfBirth: placeOfBirth.trim(),
        nativePlace: nativePlace.trim(),
        engagedBeforeOrDivorcee,
        caste: caste.trim() || undefined,
        religion: religion.trim() || undefined,
        gotra: gotra.trim() || undefined,
        complexion: complexion.trim() || undefined,
        education: education.trim(),
        occupation: occupation.trim(),
        nationality: nationality.trim() || undefined,
        presentAddress: presentAddress.trim(),
        emailId: emailId.trim(),
        phoneNumber: phoneNumber.trim() || undefined,
      };

      const familyInfo: FamilyInfo = {
        fatherName: fatherName.trim(),
        motherName: motherName.trim(),
        grandParents: grandParents.trim() || undefined,
        maternalGrandParents: maternalGrandParents.trim() || undefined,
        youngerBrothers: youngerBrothers.trim() ? parseInt(youngerBrothers, 10) : undefined,
        youngerSiblingNames: youngerSiblingNames.trim() || undefined,
      };

      const preferences: Preferences = {
        other: preferenceOther.trim() || undefined,
      };

      await dispatch(createMatrimonialProfile({
        userId: user.id,
        personalInfo,
        familyInfo,
        preferences,
        photos: photoUrls,
      })).unwrap();

      Alert.alert(
        'Success',
        'Your profile has been submitted for review. You will be notified once it\'s approved.',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error: any) {
      console.error('Error creating profile:', error);
      setIsUploadingPhotos(false);
      Alert.alert('Error', error.message || 'Failed to create profile. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom', 'left', 'right']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingTop: Platform.OS === 'ios' ? insets.top + Spacing.medium : Spacing.standard },
          ]}
        >
          <Text style={styles.title}>Create Matrimonial Profile</Text>
          <Text style={styles.subtitle}>Please fill in all required fields</Text>

          {/* Personal Information */}
          <Card style={styles.section} padding={Spacing.medium}>
            <Text style={styles.sectionTitle}>Personal Information</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Name *</Text>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="Enter your name"
                placeholderTextColor={Colors.secondaryText}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Surname *</Text>
              <TextInput
                style={styles.input}
                value={surname}
                onChangeText={setSurname}
                placeholder="Enter your surname"
                placeholderTextColor={Colors.secondaryText}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Gender *</Text>
              <View style={styles.genderContainer}>
                <TouchableOpacity
                  style={[styles.genderButton, gender === 'male' && styles.genderButtonActive]}
                  onPress={() => setGender('male')}
                >
                  <Text style={[styles.genderButtonText, gender === 'male' && styles.genderButtonTextActive]}>
                    Male
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.genderButton, gender === 'female' && styles.genderButtonActive]}
                  onPress={() => setGender('female')}
                >
                  <Text style={[styles.genderButtonText, gender === 'female' && styles.genderButtonTextActive]}>
                    Female
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Date of Birth *</Text>
              <TouchableOpacity
                style={styles.dateInput}
                onPress={() => setShowDatePicker(true)}
              >
                <Text style={[styles.dateInputText, !dateOfBirth && styles.dateInputPlaceholder]}>
                  {dateOfBirth ? formatDate(dateOfBirth) : 'Select Date of Birth (DD/MM/YYYY)'}
                </Text>
                <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                  <Path
                    d="M8 2V6M16 2V6M3 10H21M5 4H19C20.1046 4 21 4.89543 21 6V20C21 21.1046 20.1046 22 19 22H5C3.89543 22 3 21.1046 3 20V6C3 4.89543 3.89543 4 5 4Z"
                    stroke={Colors.tertiary}
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </Svg>
              </TouchableOpacity>
              {showDatePicker && (
                <DateTimePicker
                  value={dateOfBirth || new Date(1996, 7, 23)}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={onDateChange}
                  maximumDate={new Date()}
                  minimumDate={new Date(1950, 0, 1)}
                />
              )}
              {Platform.OS === 'ios' && showDatePicker && (
                <View style={styles.iosDatePickerActions}>
                  <TouchableOpacity
                    style={styles.datePickerButton}
                    onPress={handleIOSDateCancel}
                  >
                    <Text style={styles.datePickerButtonText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.datePickerButton, styles.datePickerButtonConfirm]}
                    onPress={handleIOSDateConfirm}
                  >
                    <Text style={[styles.datePickerButtonText, styles.datePickerButtonTextConfirm]}>Done</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Height *</Text>
              <View style={styles.heightRow}>
                <View style={styles.heightSwitchWrap}>
                  <Text style={styles.heightSwitchLabel}>Use cm</Text>
                  <Switch
                    value={useCm}
                    onValueChange={(v) => {
                      setUseCm(v);
                      if (v) setHeightCm(feetInchesToCm(heightFeet, heightInches));
                      else {
                        const { feet, inches } = cmToFeetInches(heightCm);
                        setHeightFeet(feet);
                        setHeightInches(inches);
                      }
                    }}
                    trackColor={{ false: Colors.alternate + '66', true: Colors.tertiary + '80' }}
                    thumbColor={useCm ? Colors.tertiary : Colors.secondaryText}
                  />
                </View>
                {useCm ? (
                  <TouchableOpacity
                    style={styles.heightDropdown}
                    onPress={() => setHeightPickerOpen('cm')}
                  >
                    <Text style={styles.heightDropdownText}>{heightCm} cm</Text>
                  </TouchableOpacity>
                ) : (
                  <View style={styles.heightDropdownRow}>
                    <TouchableOpacity
                      style={[styles.heightDropdown, styles.heightDropdownHalf]}
                      onPress={() => setHeightPickerOpen('feet')}
                    >
                      <Text style={styles.heightDropdownText}>{heightFeet}'</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.heightDropdown, styles.heightDropdownHalf]}
                      onPress={() => setHeightPickerOpen('inches')}
                    >
                      <Text style={styles.heightDropdownText}>{heightInches}"</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
              <Modal
                visible={heightPickerOpen !== null}
                transparent
                animationType="fade"
                onRequestClose={() => setHeightPickerOpen(null)}
              >
                <TouchableOpacity
                  style={styles.pickerOverlay}
                  activeOpacity={1}
                  onPress={() => setHeightPickerOpen(null)}
                >
                  <View style={styles.pickerModal}>
                    {heightPickerOpen === 'feet' && (
                      <FlatList
                        data={[4, 5, 6, 7]}
                        keyExtractor={(n) => String(n)}
                        renderItem={({ item }) => (
                          <TouchableOpacity
                            style={styles.pickerItem}
                            onPress={() => {
                              setHeightFeet(item);
                              setHeightPickerOpen(null);
                            }}
                          >
                            <Text style={styles.pickerItemText}>{item} ft</Text>
                          </TouchableOpacity>
                        )}
                      />
                    )}
                    {heightPickerOpen === 'inches' && (
                      <FlatList
                        data={Array.from({ length: 12 }, (_, i) => i)}
                        keyExtractor={(n) => String(n)}
                        renderItem={({ item }) => (
                          <TouchableOpacity
                            style={styles.pickerItem}
                            onPress={() => {
                              setHeightInches(item);
                              setHeightPickerOpen(null);
                            }}
                          >
                            <Text style={styles.pickerItemText}>{item} in</Text>
                          </TouchableOpacity>
                        )}
                      />
                    )}
                    {heightPickerOpen === 'cm' && (
                      <FlatList
                        data={Array.from({ length: 81 }, (_, i) => i + 140)}
                        keyExtractor={(n) => String(n)}
                        renderItem={({ item }) => (
                          <TouchableOpacity
                            style={styles.pickerItem}
                            onPress={() => {
                              setHeightCm(item);
                              setHeightPickerOpen(null);
                            }}
                          >
                            <Text style={styles.pickerItemText}>{item} cm</Text>
                          </TouchableOpacity>
                        )}
                      />
                    )}
                  </View>
                </TouchableOpacity>
              </Modal>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Physical Disability</Text>
              <View style={styles.genderContainer}>
                <TouchableOpacity
                  style={[styles.genderButton, physicalDisability && styles.genderButtonActive]}
                  onPress={() => setPhysicalDisability(true)}
                >
                  <Text style={[styles.genderButtonText, physicalDisability && styles.genderButtonTextActive]}>
                    Yes
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.genderButton, !physicalDisability && styles.genderButtonActive]}
                  onPress={() => setPhysicalDisability(false)}
                >
                  <Text style={[styles.genderButtonText, !physicalDisability && styles.genderButtonTextActive]}>
                    No
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Time of Birth</Text>
              <TextInput
                style={styles.input}
                value={timeOfBirth}
                onChangeText={setTimeOfBirth}
                placeholder="HH:MM AM/PM (e.g., 8:15 AM)"
                placeholderTextColor={Colors.secondaryText}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Place of Birth *</Text>
              <TextInput
                style={styles.input}
                value={placeOfBirth}
                onChangeText={setPlaceOfBirth}
                placeholder="Enter place of birth"
                placeholderTextColor={Colors.secondaryText}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Native Place *</Text>
              <TextInput
                style={styles.input}
                value={nativePlace}
                onChangeText={setNativePlace}
                placeholder="Enter native place"
                placeholderTextColor={Colors.secondaryText}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Caste</Text>
              <TextInput
                style={styles.input}
                value={caste}
                onChangeText={setCaste}
                placeholder="Enter caste"
                placeholderTextColor={Colors.secondaryText}
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Religion</Text>
              <TextInput
                style={styles.input}
                value={religion}
                onChangeText={setReligion}
                placeholder="Enter religion"
                placeholderTextColor={Colors.secondaryText}
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Gotra</Text>
              <TextInput
                style={styles.input}
                value={gotra}
                onChangeText={setGotra}
                placeholder="Enter gotra"
                placeholderTextColor={Colors.secondaryText}
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Complexion</Text>
              <TextInput
                style={styles.input}
                value={complexion}
                onChangeText={setComplexion}
                placeholder="Enter complexion"
                placeholderTextColor={Colors.secondaryText}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Engaged Before / Divorcee</Text>
              <View style={styles.genderContainer}>
                <TouchableOpacity
                  style={[styles.genderButton, engagedBeforeOrDivorcee && styles.genderButtonActive]}
                  onPress={() => setEngagedBeforeOrDivorcee(true)}
                >
                  <Text style={[styles.genderButtonText, engagedBeforeOrDivorcee && styles.genderButtonTextActive]}>
                    Yes
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.genderButton, !engagedBeforeOrDivorcee && styles.genderButtonActive]}
                  onPress={() => setEngagedBeforeOrDivorcee(false)}
                >
                  <Text style={[styles.genderButtonText, !engagedBeforeOrDivorcee && styles.genderButtonTextActive]}>
                    No
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </Card>

          {/* Education & Career */}
          <Card style={styles.section} padding={Spacing.medium}>
            <Text style={styles.sectionTitle}>Education & Career</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Qualification *</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={education}
                onChangeText={setEducation}
                placeholder="e.g., Software Developer, Master of Science Computer Science"
                placeholderTextColor={Colors.secondaryText}
                multiline
                numberOfLines={3}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Job *</Text>
              <TextInput
                style={[styles.input, styles.jobInput]}
                value={occupation}
                onChangeText={setOccupation}
                placeholder="Enter your job / occupation"
                placeholderTextColor={Colors.secondaryText}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Nationality</Text>
              <TextInput
                style={styles.input}
                value={nationality}
                onChangeText={setNationality}
                placeholder="Enter nationality"
                placeholderTextColor={Colors.secondaryText}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Present Address *</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={presentAddress}
                onChangeText={setPresentAddress}
                placeholder="Enter your present address"
                placeholderTextColor={Colors.secondaryText}
                multiline
                numberOfLines={3}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Contact (Email ID) *</Text>
              <TextInput
                style={styles.input}
                value={emailId}
                onChangeText={setEmailId}
                placeholder="Enter your email / contact"
                placeholderTextColor={Colors.secondaryText}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Phone number</Text>
              <TextInput
                style={styles.input}
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                placeholder="Enter your phone number"
                placeholderTextColor={Colors.secondaryText}
                keyboardType="phone-pad"
              />
            </View>
          </Card>

          {/* Photos */}
          <Card style={styles.section} padding={Spacing.medium}>
            <Text style={styles.sectionTitle}>Photos *</Text>
            <Text style={styles.photoHint}>
              Please upload up to 5 photos ({photos.length}/5)
            </Text>
            
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              style={styles.photosScrollView}
              contentContainerStyle={styles.photosContainer}
            >
              {photos.map((uri, index) => (
                <View key={index} style={styles.photoWrapper}>
                  <Image source={{ uri }} style={styles.photo} />
                  <View style={styles.photoNumber}>
                    <Text style={styles.photoNumberText}>{index + 1}</Text>
                  </View>
                  <View style={styles.photoControls}>
                    {index > 0 && (
                      <TouchableOpacity
                        style={styles.moveButton}
                        onPress={() => movePhotoUp(index)}
                      >
                        <Text style={styles.moveButtonText}>↑</Text>
                      </TouchableOpacity>
                    )}
                    {index < photos.length - 1 && (
                      <TouchableOpacity
                        style={styles.moveButton}
                        onPress={() => movePhotoDown(index)}
                      >
                        <Text style={styles.moveButtonText}>↓</Text>
                      </TouchableOpacity>
                    )}
                    <TouchableOpacity
                      style={styles.removePhotoButton}
                      onPress={() => removePhoto(index)}
                    >
                      <XIcon color="#FFFFFF" size={16} />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
              
              {photos.length < 5 && (
                <TouchableOpacity 
                  style={styles.addPhotoButton} 
                  onPress={pickPhoto}
                  disabled={isVerifyingFace}
                >
                  {isVerifyingFace ? (
                    <>
                      <ActivityIndicator size="small" color={Colors.tertiary} />
                      <Text style={styles.addPhotoText}>Verifying...</Text>
                    </>
                  ) : (
                    <>
                      <PlusIcon color={Colors.tertiary} size={24} />
                      <Text style={styles.addPhotoText}>Add Photo</Text>
                    </>
                  )}
                </TouchableOpacity>
              )}
              {photos.length >= 5 && (
                <View style={styles.addPhotoButtonDisabled}>
                  <Text style={styles.addPhotoTextDisabled}>Max 5 photos</Text>
                </View>
              )}
            </ScrollView>
            
          </Card>

          {/* Family Information */}
          <Card style={styles.section} padding={Spacing.medium}>
            <Text style={styles.sectionTitle}>Family Information</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Father's Name *</Text>
              <TextInput
                style={styles.input}
                value={fatherName}
                onChangeText={setFatherName}
                placeholder="Enter father's name"
                placeholderTextColor={Colors.secondaryText}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Mother's Name *</Text>
              <TextInput
                style={styles.input}
                value={motherName}
                onChangeText={setMotherName}
                placeholder="Enter mother's name"
                placeholderTextColor={Colors.secondaryText}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Grand Parents</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={grandParents}
                onChangeText={setGrandParents}
                placeholder="Enter grandparents name"
                placeholderTextColor={Colors.secondaryText}
                multiline
                numberOfLines={2}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Maternal Grand Parents</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={maternalGrandParents}
                onChangeText={setMaternalGrandParents}
                placeholder="Enter grandparents name"
                placeholderTextColor={Colors.secondaryText}
                multiline
                numberOfLines={2}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Number of younger siblings</Text>
              <TextInput
                style={styles.input}
                value={youngerBrothers}
                onChangeText={setYoungerBrothers}
                placeholder="e.g. 2"
                placeholderTextColor={Colors.secondaryText}
                keyboardType="number-pad"
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Younger sibling names</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={youngerSiblingNames}
                onChangeText={setYoungerSiblingNames}
                placeholder="Names of younger siblings (e.g. comma-separated)"
                placeholderTextColor={Colors.secondaryText}
                multiline
                numberOfLines={2}
              />
            </View>
          </Card>

          {/* Preference */}
          <Card style={styles.section} padding={Spacing.medium}>
            <Text style={styles.sectionTitle}>Preference</Text>
            <View style={styles.inputGroup}>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={preferenceOther}
                onChangeText={setPreferenceOther}
                placeholder="Enter your preferences (e.g. partner criteria)"
                placeholderTextColor={Colors.secondaryText}
                multiline
                numberOfLines={3}
              />
            </View>
          </Card>

          <View style={styles.buttonContainer}>
            <Button
              title={
                isUploadingPhotos 
                  ? `Uploading Photos... (${photos.length}/5)` 
                  : isSubmitting 
                    ? 'Submitting...' 
                    : 'Submit Profile'
              }
              onPress={handleSubmit}
              variant="primary"
              loading={isSubmitting || isUploadingPhotos}
              disabled={isSubmitting || isUploadingPhotos || photos.length < 1}
            />
          </View>

          <View style={{ height: Spacing.xxxl }} />
        </ScrollView>
      </KeyboardAvoidingView>
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
  scrollContent: {
    padding: Spacing.standard,
    paddingBottom: Spacing.xl,
  },
  title: {
    ...Typography.headline2,
    color: Colors.primaryText,
    fontFamily: getFontFamily(600),
    marginBottom: Spacing.xs,
  },
  subtitle: {
    ...Typography.body2,
    color: Colors.secondaryText,
    fontFamily: getFontFamily(400),
    marginBottom: Spacing.large,
  },
  section: {
    marginBottom: Spacing.standard,
  },
  sectionTitle: {
    ...Typography.headline4,
    color: Colors.primaryText,
    fontFamily: getFontFamily(600),
    marginBottom: Spacing.medium,
  },
  inputGroup: {
    marginBottom: Spacing.medium,
  },
  label: {
    ...Typography.body2,
    color: Colors.primaryText,
    fontFamily: getFontFamily(500),
    marginBottom: Spacing.xs,
  },
  input: {
    ...Typography.body1,
    color: Colors.primaryText,
    fontFamily: getFontFamily(400),
    backgroundColor: Colors.alternate + '15',
    borderWidth: 1,
    borderColor: Colors.alternate + '33',
    borderRadius: BorderRadius.medium,
    padding: Spacing.medium,
    minHeight: TouchTarget.minHeight,
  },
  jobInput: {
    textAlignVertical: 'center',
    paddingVertical: Spacing.medium,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  genderContainer: {
    flexDirection: 'row',
    gap: Spacing.small,
  },
  genderButton: {
    flex: 1,
    padding: Spacing.medium,
    borderRadius: BorderRadius.medium,
    borderWidth: 1,
    borderColor: Colors.alternate + '33',
    backgroundColor: Colors.alternate + '15',
    alignItems: 'center',
  },
  genderButtonActive: {
    borderColor: Colors.tertiary,
    backgroundColor: Colors.tertiary + '20',
  },
  genderButtonText: {
    ...Typography.body1,
    color: Colors.secondaryText,
    fontFamily: getFontFamily(500),
  },
  genderButtonTextActive: {
    color: Colors.tertiary,
    fontFamily: getFontFamily(600),
  },
  switchGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.medium,
    paddingVertical: Spacing.small,
  },
  heightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.small,
    flexWrap: 'wrap',
  },
  heightSwitchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.small,
  },
  heightSwitchLabel: {
    ...Typography.body2,
    color: Colors.primaryText,
    fontFamily: getFontFamily(500),
  },
  heightDropdown: {
    flex: 1,
    minHeight: TouchTarget.minimum,
    backgroundColor: Colors.alternate + '15',
    borderWidth: 1,
    borderColor: Colors.alternate + '33',
    borderRadius: BorderRadius.medium,
    paddingHorizontal: Spacing.medium,
    justifyContent: 'center',
  },
  heightDropdownHalf: {
    flex: 0.5,
  },
  heightDropdownRow: {
    flex: 1,
    flexDirection: 'row',
    gap: Spacing.xs,
  },
  heightDropdownText: {
    ...Typography.body1,
    color: Colors.primaryText,
    fontFamily: getFontFamily(400),
  },
  pickerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: Spacing.large,
  },
  pickerModal: {
    backgroundColor: Colors.primaryBackground,
    borderRadius: BorderRadius.card,
    maxHeight: 320,
  },
  pickerItem: {
    paddingVertical: Spacing.medium,
    paddingHorizontal: Spacing.standard,
    borderBottomWidth: 1,
    borderBottomColor: Colors.alternate + '22',
  },
  pickerItemText: {
    ...Typography.body1,
    color: Colors.primaryText,
    fontFamily: getFontFamily(400),
  },
  buttonContainer: {
    marginTop: Spacing.large,
  },
  photoHint: {
    ...Typography.body2,
    color: Colors.secondaryText,
    fontFamily: getFontFamily(400),
    marginBottom: Spacing.medium,
  },
  photosScrollView: {
    marginHorizontal: -Spacing.medium,
  },
  photosContainer: {
    paddingHorizontal: Spacing.medium,
    gap: Spacing.small,
  },
  photoWrapper: {
    position: 'relative',
    width: 100,
    height: 100,
    marginRight: Spacing.small,
  },
  photo: {
    width: 100,
    height: 100,
    borderRadius: BorderRadius.medium,
    backgroundColor: Colors.alternate + '15',
  },
  photoNumber: {
    position: 'absolute',
    top: 4,
    left: 4,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.tertiary + 'CC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoNumberText: {
    ...Typography.caption,
    color: Colors.primaryBackground,
    fontFamily: getFontFamily(600),
    fontSize: 12,
  },
  photoControls: {
    position: 'absolute',
    top: 4,
    right: 4,
    flexDirection: 'column',
    gap: 4,
  },
  moveButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.primaryBackground + 'CC',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.tertiary,
  },
  moveButtonText: {
    ...Typography.caption,
    color: Colors.tertiary,
    fontFamily: getFontFamily(600),
    fontSize: 12,
    lineHeight: 16,
  },
  removePhotoButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.error || '#FF3B30',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.primaryBackground,
  },
  addPhotoButton: {
    width: 100,
    height: 100,
    borderRadius: BorderRadius.medium,
    borderWidth: 2,
    borderColor: Colors.tertiary,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.alternate + '15',
    gap: Spacing.xs,
  },
  addPhotoText: {
    ...Typography.caption,
    color: Colors.tertiary,
    fontFamily: getFontFamily(500),
  },
  photoWarning: {
    ...Typography.caption,
    color: Colors.error || '#FF3B30',
    fontFamily: getFontFamily(500),
    marginTop: Spacing.small,
  },
  addPhotoButtonDisabled: {
    width: 100,
    height: 100,
    borderRadius: BorderRadius.medium,
    borderWidth: 2,
    borderColor: Colors.secondaryText + '33',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.alternate + '08',
  },
  addPhotoTextDisabled: {
    ...Typography.caption,
    color: Colors.secondaryText,
    fontFamily: getFontFamily(400),
    textAlign: 'center',
  },
  dateInput: {
    ...Typography.body1,
    color: Colors.primaryText,
    fontFamily: getFontFamily(400),
    backgroundColor: Colors.alternate + '15',
    borderWidth: 1,
    borderColor: Colors.alternate + '33',
    borderRadius: BorderRadius.medium,
    padding: Spacing.medium,
    minHeight: TouchTarget.minHeight,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateInputText: {
    ...Typography.body1,
    color: Colors.primaryText,
    fontFamily: getFontFamily(400),
    flex: 1,
  },
  dateInputPlaceholder: {
    color: Colors.secondaryText,
  },
  iosDatePickerActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: Spacing.small,
    marginTop: Spacing.small,
  },
  datePickerButton: {
    paddingHorizontal: Spacing.medium,
    paddingVertical: Spacing.small,
    borderRadius: BorderRadius.small,
    backgroundColor: Colors.alternate + '15',
  },
  datePickerButtonConfirm: {
    backgroundColor: Colors.tertiary,
  },
  datePickerButtonText: {
    ...Typography.body2,
    color: Colors.primaryText,
    fontFamily: getFontFamily(500),
  },
  datePickerButtonTextConfirm: {
    color: Colors.primaryBackground,
  },
});

export default CreateMatrimonialProfileScreen;
