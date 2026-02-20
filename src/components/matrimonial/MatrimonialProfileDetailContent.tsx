import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, Image } from 'react-native';
import { MatrimonialProfile } from '../../types';
import { formatHeightForDisplay } from '../../utils/height';
import type { ThemeColors } from '../../constants/theme';
import { useTheme } from '../../utils/theme';
import { useResponsiveLayout } from '../../utils/useResponsiveLayout';

const PHOTO_HEIGHT = 320;

interface MatrimonialProfileDetailContentProps {
  profile: MatrimonialProfile;
  /** If true, show compact (e.g. inside modal with own scroll). */
  compact?: boolean;
  /** Optional footer (e.g. admin actions) rendered at the end of the scroll content. */
  footer?: React.ReactNode;
}

function makeStyles(colors: ThemeColors) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.primaryBackground },
    content: { padding: 20, paddingBottom: 40, backgroundColor: colors.primaryBackground },
    contentCompact: { padding: 16, paddingBottom: 100, backgroundColor: colors.primaryBackground },
    photosSection: { marginBottom: 20 },
    photoScroll: { height: PHOTO_HEIGHT },
    mainPhoto: { height: PHOTO_HEIGHT, resizeMode: 'cover' as const },
    photoPlaceholder: {
      backgroundColor: colors.secondaryBackground,
      justifyContent: 'center' as const,
      alignItems: 'center' as const,
      marginBottom: 20,
    },
    photoPlaceholderText: { fontSize: 16, color: colors.secondaryText },
    photoCountWrap: { position: 'absolute' as const, bottom: 8, right: 12 },
    photoCount: {
      backgroundColor: 'rgba(0,0,0,0.5)',
      color: '#FFF',
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 4,
      fontSize: 12,
    },
    section: { marginBottom: 24 },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '700' as const,
      color: colors.tertiary,
      marginBottom: 12,
    },
    infoRow: { flexDirection: 'row' as const, marginBottom: 8 },
    infoLabel: {
      fontWeight: '600' as const,
      width: 140,
      color: colors.secondaryText,
      fontSize: 14,
    },
    infoValue: { flex: 1, color: colors.primaryText, fontSize: 14 },
    bioBlock: { marginTop: 8 },
    bioLabel: {
      fontWeight: '600' as const,
      marginBottom: 4,
      color: colors.secondaryText,
      fontSize: 14,
    },
    bioText: { color: colors.primaryText, lineHeight: 22, fontSize: 14 },
  });
}

/**
 * Full profile detail in matrimonial-website style sections:
 * Basic Details → Religion & Community → Education & Career → Family Details → Partner Preferences
 */
const MatrimonialProfileDetailContent = ({ profile, compact, footer }: MatrimonialProfileDetailContentProps) => {
  const { colors } = useTheme();
  const { contentWidth } = useResponsiveLayout();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const { personalInfo, familyInfo, preferences, photos } = profile;

  const InfoRow = ({ label, value }: { label: string; value: string | number | undefined }) =>
    value != null && String(value).trim() !== '' ? (
      <View style={styles.infoRow}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{String(value)}</Text>
      </View>
    ) : null;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={compact ? styles.contentCompact : styles.content}
      showsVerticalScrollIndicator={!compact}
    >
      {/* Photos - like matrimonial site gallery */}
      {photos.length > 0 ? (
        <View style={[styles.photosSection, { height: PHOTO_HEIGHT }]}>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            style={styles.photoScroll}
          >
            {photos.map((uri, i) => (
              <Image key={i} source={{ uri }} style={[styles.mainPhoto, { width: contentWidth }]} />
            ))}
          </ScrollView>
          {photos.length > 1 ? (
            <View style={styles.photoCountWrap}>
              <Text style={styles.photoCount}>
                {photos.length} photo{photos.length !== 1 ? 's' : ''}
              </Text>
            </View>
          ) : null}
        </View>
      ) : (
        <View style={[styles.photoPlaceholder, { height: PHOTO_HEIGHT }]}>
          <Text style={styles.photoPlaceholderText}>No Photo</Text>
        </View>
      )}

      {/* Basic Details (name, age, DOB, height, place of birth, native place, bio) */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Basic Details</Text>
        <InfoRow label="Name" value={`${personalInfo.name} ${personalInfo.surname}`.trim()} />
        <InfoRow label="Age" value={personalInfo.age != null ? `${personalInfo.age} years` : undefined} />
        <InfoRow label="Date of Birth" value={personalInfo.dateOfBirth} />
        <InfoRow label="Gender" value={personalInfo.gender === 'male' ? 'Male' : 'Female'} />
        {personalInfo.height && (
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Height</Text>
            <Text style={styles.infoValue}>
              {formatHeightForDisplay(personalInfo.height, personalInfo.heightInCm)}
            </Text>
          </View>
        )}
        <InfoRow label="Place of Birth" value={personalInfo.placeOfBirth} />
        <InfoRow label="Native Place" value={personalInfo.nativePlace} />
        {personalInfo.timeOfBirth && (
          <InfoRow label="Time of Birth" value={personalInfo.timeOfBirth} />
        )}
        {personalInfo.physicalDisability && (
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Physical Disability</Text>
            <Text style={styles.infoValue}>Yes</Text>
          </View>
        )}
        {personalInfo.engagedBeforeOrDivorcee && (
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Previously engaged / divorcee</Text>
            <Text style={styles.infoValue}>Yes</Text>
          </View>
        )}
        {personalInfo.bio ? (
          <View style={styles.bioBlock}>
            <Text style={styles.bioLabel}>About</Text>
            <Text style={styles.bioText}>{personalInfo.bio}</Text>
          </View>
        ) : null}
      </View>

      {/* Religion & Community */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Religion & Community</Text>
        <InfoRow label="Religion" value={personalInfo.religion} />
        <InfoRow label="Caste" value={personalInfo.caste} />
        <InfoRow label="Gotra" value={personalInfo.gotra} />
        <InfoRow label="Complexion" value={personalInfo.complexion} />
      </View>

      {/* Education & Career */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Education & Career</Text>
        <InfoRow label="Education" value={personalInfo.education} />
        <InfoRow label="Occupation" value={personalInfo.occupation} />
        <InfoRow label="Nationality" value={personalInfo.nationality} />
        <InfoRow label="Present Address" value={personalInfo.presentAddress} />
      </View>

      {/* Contact (optional - some sites show only after interest) */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Contact</Text>
        <InfoRow label="Email" value={personalInfo.emailId} />
        <InfoRow label="Phone" value={personalInfo.phoneNumber} />
      </View>

      {/* Family Details */}
      {familyInfo && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Family Details</Text>
          <InfoRow label="Father's Name" value={familyInfo.fatherName} />
          <InfoRow label="Mother's Name" value={familyInfo.motherName} />
          <InfoRow label="Siblings" value={familyInfo.siblings} />
          <InfoRow label="Younger Brothers" value={familyInfo.youngerBrothers} />
          <InfoRow label="Younger Sibling Names" value={familyInfo.youngerSiblingNames} />
          <InfoRow label="Grand Parents" value={familyInfo.grandParents} />
          <InfoRow label="Maternal Grand Parents" value={familyInfo.maternalGrandParents} />
          {familyInfo.familyBackground ? (
            <View style={styles.bioBlock}>
              <Text style={styles.bioLabel}>Family Background</Text>
              <Text style={styles.bioText}>{familyInfo.familyBackground}</Text>
            </View>
          ) : null}
        </View>
      )}

      {/* Partner Preferences */}
      {preferences &&
        (preferences.minAge != null ||
          preferences.maxAge != null ||
          (preferences.education && preferences.education.length > 0) ||
          (preferences.location && preferences.location.length > 0) ||
          preferences.other) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Partner Preferences</Text>
            {(preferences.minAge != null || preferences.maxAge != null) && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Age</Text>
                <Text style={styles.infoValue}>
                  {[preferences.minAge, preferences.maxAge].filter(Boolean).join(' – ')} years
                </Text>
              </View>
            )}
            {preferences.education && preferences.education.length > 0 && (
              <InfoRow label="Education" value={preferences.education.join(', ')} />
            )}
            {preferences.location && preferences.location.length > 0 && (
              <InfoRow label="Preferred Locations" value={preferences.location.join(', ')} />
            )}
            {preferences.other ? (
              <View style={styles.bioBlock}>
                <Text style={styles.bioLabel}>Other</Text>
                <Text style={styles.bioText}>{preferences.other}</Text>
              </View>
            ) : null}
          </View>
        )}
      {footer}
    </ScrollView>
  );
};

export default MatrimonialProfileDetailContent;
