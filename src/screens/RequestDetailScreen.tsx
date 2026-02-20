import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TextInput, Alert, TouchableOpacity } from 'react-native';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../types';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { updateRequestStatus } from '../store/slices/requestsSlice';
import { useTheme } from '../utils/theme';
import { formatDateShort } from '../utils/locale';
import Button from '../components/common/Button';
import ReportModal from '../components/common/ReportModal';
import { Spacing } from '../constants/theme';

type RequestDetailRouteProp = RouteProp<RootStackParamList, 'RequestDetail'>;

const RequestDetailScreen = () => {
  const { colors } = useTheme();
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const route = useRoute<RequestDetailRouteProp>();
  const { requestId } = route.params;
  const { requests } = useAppSelector((state) => state.requests);
  const { user } = useAppSelector((state) => state.auth);
  const request = requests.find((r) => r.id === requestId);
  const [adminNotes, setAdminNotes] = useState(request?.adminNotes ?? '');
  const [updating, setUpdating] = useState(false);
  const [reportVisible, setReportVisible] = useState(false);

  const isAdmin = user?.role === 'admin';
  const canReport = user && request && request.userId !== user.id;
  const isPending = request?.status === 'pending';

  const handleApprove = async () => {
    if (!request) return;
    setUpdating(true);
    try {
      await dispatch(updateRequestStatus({ requestId: request.id, status: 'approved', adminNotes: adminNotes || undefined })).unwrap();
      Alert.alert('Approved', 'The request has been approved.', [{ text: 'OK', onPress: () => navigation.goBack() }]);
    } catch (e: any) {
      Alert.alert('Error', e?.message ?? 'Failed to approve');
    } finally {
      setUpdating(false);
    }
  };

  const handleReject = async () => {
    if (!request) return;
    setUpdating(true);
    try {
      await dispatch(updateRequestStatus({ requestId: request.id, status: 'rejected', adminNotes: adminNotes || undefined })).unwrap();
      Alert.alert('Rejected', 'The request has been rejected.', [{ text: 'OK', onPress: () => navigation.goBack() }]);
    } catch (e: any) {
      Alert.alert('Error', e?.message ?? 'Failed to reject');
    } finally {
      setUpdating(false);
    }
  };

  if (!request) {
    return (
      <View style={[styles.container, { backgroundColor: colors.primaryBackground }]}>
        <Text style={{ color: colors.primaryText }}>Request not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.primaryBackground }]}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={[styles.type, { color: colors.tertiary }]}>
            {request.type === 'condolence' ? '🕯️' : '🎉'} {request.type.toUpperCase()}
          </Text>
          <Text style={[styles.status, { color: colors.secondaryText }]}>{request.status}</Text>
        </View>

        <Text style={[styles.title, { color: colors.primaryText }]}>{request.title}</Text>

        {request.imageUrl && (
          <Image source={{ uri: request.imageUrl }} style={styles.image} />
        )}

        <Text style={[styles.description, { color: colors.primaryText }]}>{request.description}</Text>

        <View style={[styles.meta, { borderTopColor: colors.alternate + '33' }]}>
          <Text style={[styles.metaText, { color: colors.secondaryText }]}>Posted by: {request.userName}</Text>
          <Text style={[styles.metaText, { color: colors.secondaryText }]}>
            Date: {formatDateShort(request.createdAt)}
          </Text>
          {canReport && (
            <TouchableOpacity
              style={styles.reportRow}
              onPress={() => setReportVisible(true)}
            >
              <Text style={[styles.reportText, { color: colors.secondaryText }]}>Report this request</Text>
            </TouchableOpacity>
          )}
        </View>

        {request.adminNotes && (
          <View style={[styles.adminNotes, { backgroundColor: colors.secondaryBackground }]}>
            <Text style={[styles.adminNotesTitle, { color: colors.primaryText }]}>Admin Notes:</Text>
            <Text style={[styles.adminNotesText, { color: colors.secondaryText }]}>{request.adminNotes}</Text>
          </View>
        )}

        {isAdmin && isPending && (
          <View style={styles.adminSection}>
            <Text style={[styles.adminSectionTitle, { color: colors.primaryText }]}>Admin actions</Text>
            <TextInput
              style={[styles.notesInput, { backgroundColor: colors.secondaryBackground, color: colors.primaryText, borderColor: colors.alternate + '33' }]}
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
        )}

        {user && request && (
          <ReportModal
            visible={reportVisible}
            onClose={() => setReportVisible(false)}
            userId={user.id}
            reportedUserId={request.userId}
            reportedRequestId={request.id}
          />
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  reportRow: { marginTop: Spacing.small },
  reportText: { fontSize: 14, textDecorationLine: 'underline' },
  content: { padding: 20, paddingBottom: 40 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  type: { fontWeight: '600', fontSize: 14 },
  status: { fontSize: 14, textTransform: 'capitalize' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 15 },
  image: {
    width: '100%',
    height: 300,
    borderRadius: 8,
    marginBottom: 15,
  },
  description: { fontSize: 16, lineHeight: 24, marginBottom: 20 },
  meta: { borderTopWidth: 1, paddingTop: 15, marginBottom: 15 },
  metaText: { fontSize: 14, marginBottom: 5 },
  adminNotes: { padding: 15, borderRadius: 8, marginTop: 10 },
  adminNotesTitle: { fontWeight: '600', marginBottom: 5 },
  adminNotesText: { fontSize: 14 },
  adminSection: { marginTop: Spacing.xl },
  adminSectionTitle: { fontWeight: '600', marginBottom: Spacing.small, fontSize: 16 },
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

export default RequestDetailScreen;

