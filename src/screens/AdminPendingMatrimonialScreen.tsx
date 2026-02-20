import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Card from '../components/common/Card';
import { useTheme } from '../utils/theme';
import { Typography, Spacing } from '../constants/theme';
import { getFontFamily } from '../utils/fonts';
import { RootStackParamList } from '../types';
import { MatrimonialProfile } from '../types';
import * as firestoreService from '../services/firebase/firestore';
import { formatDateShort } from '../utils/locale';

type NavProp = NativeStackNavigationProp<RootStackParamList, 'AdminPendingMatrimonial'>;

const AdminPendingMatrimonialScreen = () => {
  const { colors } = useTheme();
  const navigation = useNavigation<NavProp>();
  const [profiles, setProfiles] = useState<MatrimonialProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const list = await firestoreService.getMatrimonialProfilesForAdmin();
        if (!cancelled) setProfiles(list);
      } catch {
        if (!cancelled) setProfiles([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const renderItem = ({ item }: { item: MatrimonialProfile }) => {
    const name = [item.personalInfo?.name, item.personalInfo?.surname].filter(Boolean).join(' ') || '—';
    const email = item.personalInfo?.emailId || '—';
    return (
      <TouchableOpacity
        onPress={() => navigation.navigate('MatrimonialDetail', { profileId: item.id })}
        activeOpacity={0.85}
      >
        <Card style={[styles.card, { borderLeftColor: colors.tertiary }]} padding={Spacing.medium}>
          <Text style={[styles.name, { color: colors.primaryText }]} numberOfLines={1}>
            {name}
          </Text>
          <Text style={[styles.email, { color: colors.secondaryText }]} numberOfLines={1}>
            {email}
          </Text>
          <Text style={[styles.date, { color: colors.secondaryText }]}>
            Submitted: {formatDateShort(item.createdAt)}
          </Text>
        </Card>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.primaryBackground }]} edges={['bottom', 'left', 'right']}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.tertiary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.primaryBackground }]} edges={['bottom', 'left', 'right']}>
      <FlatList
        data={profiles}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={[styles.emptyText, { color: colors.secondaryText }]}>
              No pending matrimonial profiles
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  list: { padding: Spacing.standard, paddingBottom: Spacing.xxxl },
  card: {
    marginBottom: Spacing.medium,
    borderLeftWidth: 4,
  },
  name: {
    ...Typography.headline4,
    fontFamily: getFontFamily(600),
    marginBottom: Spacing.xxs,
  },
  email: { ...Typography.body3, marginBottom: Spacing.xxs },
  date: { ...Typography.label5 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  empty: { padding: Spacing.xxl, alignItems: 'center' },
  emptyText: { ...Typography.body2 },
});

export default AdminPendingMatrimonialScreen;
