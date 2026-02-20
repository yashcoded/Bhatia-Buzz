import React, { useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchRequests } from '../store/slices/requestsSlice';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import { useTheme } from '../utils/theme';
import { Typography, Spacing, BorderRadius } from '../constants/theme';
import { getFontFamily } from '../utils/fonts';
import { RootStackParamList } from '../types';
import { Request } from '../types';
import { formatDateShort } from '../utils/locale';

type NavProp = StackNavigationProp<RootStackParamList, 'AdminPendingRequests'>;

const AdminPendingRequestsScreen = () => {
  const { colors } = useTheme();
  const navigation = useNavigation<NavProp>();
  const dispatch = useAppDispatch();
  const { requests, loading } = useAppSelector((state) => state.requests);
  const pendingRequests = requests.filter((r) => r.status === 'pending');

  useEffect(() => {
    dispatch(fetchRequests());
  }, [dispatch]);

  const renderItem = ({ item }: { item: Request }) => (
    <TouchableOpacity onPress={() => navigation.navigate('RequestDetail', { requestId: item.id })} activeOpacity={0.85}>
      <Card style={[styles.card, { borderLeftColor: colors.tertiary }]} padding={Spacing.medium}>
        <View style={styles.header}>
          <Badge
            label={item.type === 'condolence' ? '🕯️ Condolence' : item.type === 'match' ? '💑 Match' : '🎉 Celebration'}
            color={item.type === 'condolence' ? colors.alternate : item.type === 'match' ? colors.primary : colors.tertiary}
          />
          <Text style={[styles.date, { color: colors.secondaryText }]}>{formatDateShort(item.createdAt)}</Text>
        </View>
        <Text style={[styles.title, { color: colors.primaryText }]} numberOfLines={2}>{item.title}</Text>
        <Text style={[styles.description, { color: colors.secondaryText }]} numberOfLines={2}>{item.description}</Text>
        <Text style={[styles.meta, { color: colors.secondaryText }]}>By: {item.userName}</Text>
      </Card>
    </TouchableOpacity>
  );

  if (loading && pendingRequests.length === 0) {
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
        data={pendingRequests}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={[styles.emptyText, { color: colors.secondaryText }]}>No pending requests</Text>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  date: { ...Typography.label5 },
  title: {
    ...Typography.headline4,
    fontFamily: getFontFamily(600),
    marginBottom: Spacing.xxs,
  },
  description: { ...Typography.body3, marginBottom: Spacing.xs },
  meta: { ...Typography.label5 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  empty: { padding: Spacing.xxl, alignItems: 'center' },
  emptyText: { ...Typography.body2 },
});

export default AdminPendingRequestsScreen;
