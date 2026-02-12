import React from 'react';
import { View, Text, StyleSheet, Image, ScrollView } from 'react-native';
import { RouteProp, useRoute } from '@react-navigation/native';
import { RootStackParamList } from '../types';
import { useAppSelector } from '../store/hooks';
import { formatDateShort } from '../utils/locale';

type RequestDetailRouteProp = RouteProp<RootStackParamList, 'RequestDetail'>;

const RequestDetailScreen = () => {
  const route = useRoute<RequestDetailRouteProp>();
  const { requestId } = route.params;
  const { requests } = useAppSelector((state) => state.requests);
  const request = requests.find((r) => r.id === requestId);

  if (!request) {
    return (
      <View style={styles.container}>
        <Text>Request not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.type}>
            {request.type === 'condolence' ? '🕯️' : '🎉'} {request.type.toUpperCase()}
          </Text>
          <Text style={styles.status}>{request.status}</Text>
        </View>

        <Text style={styles.title}>{request.title}</Text>

        {request.imageUrl && (
          <Image source={{ uri: request.imageUrl }} style={styles.image} />
        )}

        <Text style={styles.description}>{request.description}</Text>

        <View style={styles.meta}>
          <Text style={styles.metaText}>Posted by: {request.userName}</Text>
          <Text style={styles.metaText}>
            Date: {formatDateShort(request.createdAt)}
          </Text>
        </View>

        {request.adminNotes && (
          <View style={styles.adminNotes}>
            <Text style={styles.adminNotesTitle}>Admin Notes:</Text>
            <Text style={styles.adminNotesText}>{request.adminNotes}</Text>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  type: {
    fontWeight: '600',
    fontSize: 14,
    color: '#007AFF',
  },
  status: {
    fontSize: 14,
    color: '#666',
    textTransform: 'capitalize',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  image: {
    width: '100%',
    height: 300,
    borderRadius: 8,
    marginBottom: 15,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 20,
    color: '#333',
  },
  meta: {
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    paddingTop: 15,
    marginBottom: 15,
  },
  metaText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  adminNotes: {
    backgroundColor: '#f9f9f9',
    padding: 15,
    borderRadius: 8,
    marginTop: 10,
  },
  adminNotesTitle: {
    fontWeight: '600',
    marginBottom: 5,
  },
  adminNotesText: {
    fontSize: 14,
    color: '#666',
  },
});

export default RequestDetailScreen;

