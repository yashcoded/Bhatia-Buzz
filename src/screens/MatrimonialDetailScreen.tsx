import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image } from 'react-native';
import { RouteProp, useRoute } from '@react-navigation/native';
import { RootStackParamList } from '../types';
import { useAppSelector } from '../store/hooks';
import { formatHeightForDisplay } from '../utils/height';

type MatrimonialDetailRouteProp = RouteProp<RootStackParamList, 'MatrimonialDetail'>;

const MatrimonialDetailScreen = () => {
  const route = useRoute<MatrimonialDetailRouteProp>();
  const { profileId } = route.params;
  const { profiles } = useAppSelector((state) => state.matrimonial);
  const profile = profiles.find((p) => p.id === profileId);

  if (!profile) {
    return (
      <View style={styles.container}>
        <Text>Profile not found</Text>
      </View>
    );
  }

  const { personalInfo, familyInfo, preferences } = profile;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* Photos */}
        {profile.photos.length > 0 && (
          <View style={styles.photosContainer}>
            <Image source={{ uri: profile.photos[0] }} style={styles.mainPhoto} />
          </View>
        )}

        {/* Personal Info - order: DOB, Place of Birth, Height, Caste, Religion, Gotra, Complexion, Education, Occupation, Nationality */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Personal Information</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Name:</Text>
            <Text style={styles.infoValue}>{personalInfo.name}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Date of Birth:</Text>
            <Text style={styles.infoValue}>{personalInfo.dateOfBirth}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Place of Birth:</Text>
            <Text style={styles.infoValue}>{personalInfo.placeOfBirth}</Text>
          </View>
          {personalInfo.height && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Height:</Text>
              <Text style={styles.infoValue}>
                {formatHeightForDisplay(personalInfo.height, personalInfo.heightInCm)}
              </Text>
            </View>
          )}
          {personalInfo.caste && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Caste:</Text>
              <Text style={styles.infoValue}>{personalInfo.caste}</Text>
            </View>
          )}
          {personalInfo.religion && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Religion:</Text>
              <Text style={styles.infoValue}>{personalInfo.religion}</Text>
            </View>
          )}
          {personalInfo.gotra && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Gotra:</Text>
              <Text style={styles.infoValue}>{personalInfo.gotra}</Text>
            </View>
          )}
          {personalInfo.complexion && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Complexion:</Text>
              <Text style={styles.infoValue}>{personalInfo.complexion}</Text>
            </View>
          )}
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Education:</Text>
            <Text style={styles.infoValue}>{personalInfo.education}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Occupation:</Text>
            <Text style={styles.infoValue}>{personalInfo.occupation}</Text>
          </View>
          {personalInfo.nationality && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Nationality:</Text>
              <Text style={styles.infoValue}>{personalInfo.nationality}</Text>
            </View>
          )}
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Address:</Text>
            <Text style={styles.infoValue}>{personalInfo.presentAddress}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Contact:</Text>
            <Text style={styles.infoValue}>{personalInfo.emailId}</Text>
          </View>
          {personalInfo.phoneNumber ? (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Phone:</Text>
              <Text style={styles.infoValue}>{personalInfo.phoneNumber}</Text>
            </View>
          ) : null}
          {personalInfo.bio && (
            <View style={styles.bioContainer}>
              <Text style={styles.bioLabel}>Bio:</Text>
              <Text style={styles.bioText}>{personalInfo.bio}</Text>
            </View>
          )}
        </View>

        {/* Family Info - Father, Mother, Younger Sibling */}
        {familyInfo && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Family Information</Text>
            {familyInfo.fatherName && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Father:</Text>
                <Text style={styles.infoValue}>{familyInfo.fatherName}</Text>
              </View>
            )}
            {familyInfo.motherName && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Mother:</Text>
                <Text style={styles.infoValue}>{familyInfo.motherName}</Text>
              </View>
            )}
            {familyInfo.youngerBrothers !== undefined && familyInfo.youngerBrothers !== null && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Number of younger siblings:</Text>
                <Text style={styles.infoValue}>{familyInfo.youngerBrothers}</Text>
              </View>
            )}
            {familyInfo.youngerSiblingNames && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Younger sibling names:</Text>
                <Text style={styles.infoValue}>{familyInfo.youngerSiblingNames}</Text>
              </View>
            )}
            {familyInfo.siblings !== undefined && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Siblings:</Text>
                <Text style={styles.infoValue}>{familyInfo.siblings}</Text>
              </View>
            )}
            {familyInfo.grandParents && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Grand Parents:</Text>
                <Text style={styles.infoValue}>{familyInfo.grandParents}</Text>
              </View>
            )}
            {familyInfo.maternalGrandParents && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Maternal Grand Parents:</Text>
                <Text style={styles.infoValue}>{familyInfo.maternalGrandParents}</Text>
              </View>
            )}
            {familyInfo.familyBackground && (
              <View style={styles.bioContainer}>
                <Text style={styles.bioLabel}>Family Background:</Text>
                <Text style={styles.bioText}>{familyInfo.familyBackground}</Text>
              </View>
            )}
          </View>
        )}

        {/* Preference */}
        {preferences && (preferences.other || preferences.minAge || preferences.maxAge || (preferences.education && preferences.education.length > 0) || (preferences.location && preferences.location.length > 0)) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Preference</Text>
            {preferences.other && (
              <View style={styles.bioContainer}>
                <Text style={styles.bioLabel}>Preference:</Text>
                <Text style={styles.bioText}>{preferences.other}</Text>
              </View>
            )}
            {preferences.minAge != null && preferences.maxAge != null && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Age Range:</Text>
                <Text style={styles.infoValue}>
                  {preferences.minAge} - {preferences.maxAge} years
                </Text>
              </View>
            )}
            {preferences.education && preferences.education.length > 0 && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Education:</Text>
                <Text style={styles.infoValue}>{preferences.education.join(', ')}</Text>
              </View>
            )}
            {preferences.location && preferences.location.length > 0 && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Preferred Locations:</Text>
                <Text style={styles.infoValue}>{preferences.location.join(', ')}</Text>
              </View>
            )}
          </View>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    padding: 20,
  },
  photosContainer: {
    marginBottom: 20,
  },
  mainPhoto: {
    width: '100%',
    height: 300,
    borderRadius: 8,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#007AFF',
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  infoLabel: {
    fontWeight: '600',
    width: 120,
    color: '#666',
  },
  infoValue: {
    flex: 1,
    color: '#333',
  },
  bioContainer: {
    marginTop: 10,
  },
  bioLabel: {
    fontWeight: '600',
    marginBottom: 5,
    color: '#666',
  },
  bioText: {
    color: '#333',
    lineHeight: 20,
  },
});

export default MatrimonialDetailScreen;

