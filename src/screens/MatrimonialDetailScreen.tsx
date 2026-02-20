import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TextInput, Alert, ActivityIndicator, TouchableOpacity } from 'react-native';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../types';
import { MatrimonialProfile } from '../types';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { updateMatrimonialProfileStatus } from '../store/slices/matrimonialSlice';
import { useTheme } from '../utils/theme';
import MatrimonialProfileDetailContent from '../components/matrimonial/MatrimonialProfileDetailContent';
import Button from '../components/common/Button';
import ReportModal from '../components/common/ReportModal';
import * as firestoreService from '../services/firebase/firestore';
import { Spacing } from '../constants/theme';

type MatrimonialDetailRouteProp = RouteProp<RootStackParamList, 'MatrimonialDetail'>;

const MatrimonialDetailScreen = () => {
  const { colors } = useTheme();
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const route = useRoute<MatrimonialDetailRouteProp>();
  const { profileId } = route.params;
  const { profiles } = useAppSelector((state) => state.matrimonial);
  const { user } = useAppSelector((state) => state.auth);
  const [fetchedProfile, setFetchedProfile] = useState<MatrimonialProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');
  const [updating, setUpdating] = useState(false);
  const [reportVisible, setReportVisible] = useState(false);

  const profileFromRedux = profiles.find((p) => p.id === profileId);
  const profile = profileFromRedux ?? fetchedProfile;
  const canReport = user && profile && profile.userId !== user.id;

  useEffect(() => {
    if (profileFromRedux) return;
    let cancelled = false;
    setLoading(true);
    firestoreService.getMatrimonialProfileById(profileId).then((p) => {
      if (!cancelled) {
        setFetchedProfile(p);
      }
      if (!cancelled) setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [profileId, profileFromRedux]);

  const isAdmin = user?.role === 'admin';
  const isPending = profile?.status === 'pending';

  const handleApprove = async () => {
    if (!profile) return;
    setUpdating(true);
    try {
      await dispatch(
        updateMatrimonialProfileStatus({
          profileId: profile.id,
          status: 'approved',
          adminNotes: adminNotes || undefined,
        })
      ).unwrap();
      Alert.alert('Approved', 'The profile has been approved.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (e: any) {
      Alert.alert('Error', e?.message ?? 'Failed to approve');
    } finally {
      setUpdating(false);
    }
  };

  const handleReject = async () => {
    if (!profile) return;
    setUpdating(true);
    try {
      await dispatch(
        updateMatrimonialProfileStatus({
          profileId: profile.id,
          status: 'rejected',
          adminNotes: adminNotes || undefined,
        })
      ).unwrap();
      Alert.alert('Rejected', 'The profile has been rejected.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (e: any) {
      Alert.alert('Error', e?.message ?? 'Failed to reject');
    } finally {
      setUpdating(false);
    }
  };

  if (loading && !profile) {
    return (
      <View style={[styles.container, { backgroundColor: colors.primaryBackground }]}>
        <ActivityIndicator size="large" color={colors.tertiary} />
      </View>
    );
  }

  if (!profile) {
    return (
      <View style={[styles.container, { backgroundColor: colors.primaryBackground }]}>
        <Text style={{ color: colors.primaryText }}>Profile not found</Text>
      </View>
    );
  }

  const adminFooter =
    isAdmin && isPending ? (
      <View style={styles.adminSection}>
        <Text style={[styles.adminSectionTitle, { color: colors.primaryText }]}>Admin actions</Text>
        <TextInput
          style={[
            styles.notesInput,
            {
              backgroundColor: colors.secondaryBackground,
              color: colors.primaryText,
              borderColor: colors.alternate + '33',
            },
          ]}
          placeholder="Admin notes (optional)"
          placeholderTextColor={colors.secondaryText}
          value={adminNotes}
          onChangeText={setAdminNotes}
          multiline
          numberOfLines={3}
        />
        <View style={styles.adminButtons}>
          <Button title="Approve" onPress={handleApprove} variant="primary" disabled={updating} />
          <View style={styles.adminButtonSpacer} />
          <Button title="Reject" onPress={handleReject} variant="secondary" disabled={updating} />
        </View>
      </View>
    ) : null;

  const reportFooter = canReport ? (
    <View style={styles.reportSection}>
      <TouchableOpacity onPress={() => setReportVisible(true)}>
        <Text style={[styles.reportText, { color: colors.secondaryText }]}>Report this profile</Text>
      </TouchableOpacity>
    </View>
  ) : null;

  return (
    <>
      <MatrimonialProfileDetailContent
        profile={profile}
        footer={
          <>
            {adminFooter}
            {reportFooter}
          </>
        }
      />
      {user && profile && (
        <ReportModal
          visible={reportVisible}
          onClose={() => setReportVisible(false)}
          userId={user.id}
          reportedUserId={profile.userId}
          reportedProfileId={profile.id}
        />
      )}
    </>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  adminSection: { margin: Spacing.standard, marginTop: Spacing.large, paddingBottom: Spacing.xxxl },
  adminSectionTitle: { fontWeight: '600', marginBottom: Spacing.small, fontSize: 16 },
  reportSection: { margin: Spacing.standard, marginTop: Spacing.medium },
  reportText: { fontSize: 14, textDecorationLine: 'underline' },
  notesInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: Spacing.medium,
    minHeight: 80,
    marginBottom: Spacing.medium,
  },
  adminButtons: { flexDirection: 'row' },
  adminButtonSpacer: { width: Spacing.medium },
});

export default MatrimonialDetailScreen;
