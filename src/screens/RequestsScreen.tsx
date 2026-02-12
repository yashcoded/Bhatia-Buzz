import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import * as ImagePicker from 'expo-image-picker';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchRequests, createRequest } from '../store/slices/requestsSlice';
import { uploadImage } from '../services/firebase/storage';
import { Request } from '../types';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import { Colors, Typography, Spacing, BorderRadius, Shadows, TouchTarget } from '../constants/theme';
import { getFontFamily } from '../utils/fonts';
import { formatDateShort } from '../utils/locale';

// Plus Icon for FAB
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

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const RequestsScreen = () => {
  const dispatch = useAppDispatch();
  const navigation = useNavigation<NavigationProp>();
  const insets = useSafeAreaInsets();
  const { requests, loading } = useAppSelector((state) => state.requests);
  const { user } = useAppSelector((state) => state.auth);
  const [filter, setFilter] = useState<'all' | 'condolence' | 'celebration' | 'match'>('all');
  
  const isAdmin = user?.role === 'admin';
  const pendingCount = requests.filter((r) => r.status === 'pending').length;
  
  // Create request modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [requestType, setRequestType] = useState<'condolence' | 'celebration' | 'match'>('celebration');
  const [requestTitle, setRequestTitle] = useState('');
  const [requestDescription, setRequestDescription] = useState('');
  const [selectedImageUri, setSelectedImageUri] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  useEffect(() => {
    loadRequests();
  }, [filter]);

  const loadRequests = async () => {
    try {
      const type = filter === 'all' ? undefined : filter;
      await dispatch(fetchRequests(type)).unwrap();
    } catch (err) {
      console.error('Error loading requests:', err);
    }
  };

  const handleRequestPress = (requestId: string) => {
    navigation.navigate('RequestDetail', { requestId });
  };

  // Pick image from gallery
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
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setSelectedImageUri(result.assets[0].uri);
      }
    } catch (err: any) {
      console.error('Error picking image:', err);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  };

  const removeImage = () => {
    setSelectedImageUri(null);
  };

  const handleCreateRequest = async () => {
    // Check authentication first
    if (!user) {
      Alert.alert(
        'Login Required',
        'You need to login or create an account to create requests.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Login',
            onPress: () => navigation.navigate('Auth' as any),
          },
        ]
      );
      return;
    }

    if (!requestTitle.trim() || !requestDescription.trim()) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }
    
    setIsCreating(true);
    let imageUrl: string | undefined;

    try {
      // Upload image first if one is selected
      if (selectedImageUri) {
        setIsUploadingImage(true);
        try {
          const response = await fetch(selectedImageUri);
          const blob = await response.blob();
          
          const timestamp = Date.now();
          const path = `requests/${user.id}_${timestamp}.jpg`;
          imageUrl = await uploadImage(path, blob, { contentType: 'image/jpeg' });
        } catch (err: any) {
          console.error('Error uploading image:', err);
          Alert.alert('Upload Error', 'Failed to upload image. Please try again.');
          setIsUploadingImage(false);
          setIsCreating(false);
          return;
        } finally {
          setIsUploadingImage(false);
        }
      }

      const newRequest: Omit<Request, 'id' | 'createdAt' | 'status'> = {
        type: requestType,
        userId: user.id,
        userName: user.displayName || user.email || 'User',
        title: requestTitle.trim(),
        description: requestDescription.trim(),
        imageUrl,
      };

      await dispatch(createRequest(newRequest)).unwrap();
      
      // Reset form and close modal
      setRequestTitle('');
      setRequestDescription('');
      setSelectedImageUri(null);
      setShowCreateModal(false);
      
      // Reload requests to show the new one
      loadRequests();
      
      Alert.alert('Success', 'Request submitted successfully! Admin will review it soon.');
    } catch (err: any) {
      console.error('Error creating request:', err);
      Alert.alert('Error', err.message || 'Failed to create request');
    } finally {
      setIsCreating(false);
    }
  };

  const resetCreateModal = () => {
    setRequestTitle('');
    setRequestDescription('');
    setSelectedImageUri(null);
    setRequestType('celebration');
  };

  const renderRequest = ({ item }: { item: Request }) => (
    <TouchableOpacity onPress={() => handleRequestPress(item.id)} activeOpacity={0.85}>
      <Card style={styles.requestCard} padding={Spacing.medium}>
        <View style={styles.requestHeader}>
          <Badge
            label={`${
              item.type === 'condolence' ? '🕯️ Condolence' :
              item.type === 'match' ? '💑 Match' : '🎉 Celebration'
            }`}
            color={
              item.type === 'condolence' ? Colors.alternate :
              item.type === 'match' ? Colors.primary : Colors.tertiary
            }
          />
          <Badge
            label={item.status}
            color={item.status === 'approved' ? Colors.success : item.status === 'rejected' ? Colors.error : Colors.warning}
          />
        </View>
        <Text style={styles.requestTitle}>{item.title}</Text>
        <Text style={styles.requestDescription} numberOfLines={2}>
          {item.description}
        </Text>
        <Text style={styles.requestDate}>{formatDateShort(item.createdAt)}</Text>
      </Card>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['bottom', 'left', 'right']}>
      {/* Admin Pending Requests Badge */}
      {isAdmin && pendingCount > 0 && (
        <View style={[styles.pendingBadgeContainer, { paddingTop: Platform.OS === 'ios' ? insets.top + Spacing.xs : Spacing.small }]}>
          <Card style={styles.pendingBadge} padding={Spacing.small}>
            <Text style={styles.pendingBadgeText}>
              ⚠️ {pendingCount} pending request{pendingCount > 1 ? 's' : ''} awaiting your approval
            </Text>
          </Card>
        </View>
      )}
      
      {/* Filter Tabs */}
      <View style={styles.filterBar}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterScroll}
          contentContainerStyle={styles.filterRow}
        >
          <TouchableOpacity
            style={[styles.filterButton, filter === 'all' && styles.filterButtonActive]}
            onPress={() => setFilter('all')}
          >
            <Text style={[styles.filterText, filter === 'all' && styles.filterTextActive]}>
              All
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterButton, filter === 'condolence' && styles.filterButtonActive]}
            onPress={() => setFilter('condolence')}
          >
            <Text
              style={[styles.filterText, filter === 'condolence' && styles.filterTextActive]}
            >
              🕯️ Condolence
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterButton, filter === 'celebration' && styles.filterButtonActive]}
            onPress={() => setFilter('celebration')}
          >
            <Text
              style={[styles.filterText, filter === 'celebration' && styles.filterTextActive]}
            >
              🎉 Celebration
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterButton, filter === 'match' && styles.filterButtonActive]}
            onPress={() => setFilter('match')}
          >
            <Text
              style={[styles.filterText, filter === 'match' && styles.filterTextActive]}
            >
              💑 Match
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {loading && requests.length === 0 ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={Colors.tertiary} />
        </View>
      ) : (
        <FlatList
          data={requests}
          renderItem={renderRequest}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No requests yet</Text>
            </View>
          }
        />
      )}
      
      {/* Create Request FAB - visible to all, but prompts login if not authenticated */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => {
          if (!user) {
            Alert.alert(
              'Login Required',
              'You need to login or create an account to create requests.',
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Login',
                  onPress: () => navigation.navigate('Auth' as any),
                },
              ]
            );
            return;
          }
          setShowCreateModal(true);
        }}
        activeOpacity={0.8}
      >
        <PlusIcon color="#FFFFFF" size={28} />
      </TouchableOpacity>
      
      {/* Create Request Modal */}
      <Modal
        visible={showCreateModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => {
          setShowCreateModal(false);
          resetCreateModal();
        }}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalContainer}
        >
          <SafeAreaView style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <TouchableOpacity
                onPress={() => {
                  setShowCreateModal(false);
                  resetCreateModal();
                }}
              >
                <Text style={styles.modalCancel}>Cancel</Text>
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Create Request</Text>
              <View style={{ width: 60 }} />
            </View>
            
            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              <Text style={styles.inputLabel}>Type *</Text>
              <View style={styles.typeSelector}>
                <TouchableOpacity
                  style={[styles.typeButton, requestType === 'celebration' && styles.typeButtonActive]}
                  onPress={() => setRequestType('celebration')}
                >
                  <Text 
                    style={[styles.typeButtonText, requestType === 'celebration' && styles.typeButtonTextActive]}
                    numberOfLines={1}
                  >
                    🎉 Celebrate
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.typeButton, requestType === 'condolence' && styles.typeButtonActive]}
                  onPress={() => setRequestType('condolence')}
                >
                  <Text 
                    style={[styles.typeButtonText, requestType === 'condolence' && styles.typeButtonTextActive]}
                    numberOfLines={1}
                  >
                    🕯️ Condolence
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.typeButton, requestType === 'match' && styles.typeButtonActive]}
                  onPress={() => setRequestType('match')}
                >
                  <Text 
                    style={[styles.typeButtonText, requestType === 'match' && styles.typeButtonTextActive]}
                    numberOfLines={1}
                  >
                    💑 Match
                  </Text>
                </TouchableOpacity>
              </View>
              
              <Text style={styles.inputLabel}>Title *</Text>
              <TextInput
                style={styles.titleInput}
                placeholder="Enter title"
                placeholderTextColor={Colors.secondaryText}
                value={requestTitle}
                onChangeText={setRequestTitle}
                multiline
                numberOfLines={2}
                textAlignVertical="top"
              />

              <Text style={styles.inputLabel}>Description *</Text>
              <TextInput
                style={styles.textArea}
                placeholder="Enter description"
                placeholderTextColor={Colors.secondaryText}
                value={requestDescription}
                onChangeText={setRequestDescription}
                multiline
                numberOfLines={6}
                textAlignVertical="top"
              />
              
              <Text style={styles.inputLabel}>Image (optional)</Text>
              
              {selectedImageUri ? (
                <View style={styles.imagePreviewContainer}>
                  <Image source={{ uri: selectedImageUri }} style={styles.imagePreview} />
                  <TouchableOpacity
                    style={styles.removeImageButton}
                    onPress={removeImage}
                  >
                    <Text style={styles.removeImageText}>Remove</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity
                  style={styles.imagePickerButton}
                  onPress={pickImage}
                  disabled={isCreating || isUploadingImage}
                >
                  <Text style={styles.imagePickerText}>📷 Pick Photo from Gallery</Text>
                </TouchableOpacity>
              )}
              
              {(isUploadingImage || isCreating) && (
                <View style={styles.uploadStatus}>
                  <ActivityIndicator size="small" color={Colors.tertiary} />
                  <Text style={styles.uploadStatusText}>
                    {isUploadingImage ? 'Uploading image...' : 'Submitting request...'}
                  </Text>
                </View>
              )}
              
              <View style={styles.modalActions}>
                <Button
                  title={isCreating ? 'Submitting...' : 'Submit Request'}
                  onPress={handleCreateRequest}
                  loading={isCreating || isUploadingImage}
                  disabled={isCreating || isUploadingImage || !requestTitle.trim() || !requestDescription.trim()}
                  variant="primary"
                />
              </View>
            </ScrollView>
          </SafeAreaView>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.primaryBackground },
  filterBar: {
    backgroundColor: Colors.primaryBackground,
    borderBottomWidth: 1,
    borderBottomColor: Colors.alternate + '33',
  },
  filterScroll: {
    paddingHorizontal: Spacing.small,
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.small,
  },
  filterButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    minHeight: 32,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: BorderRadius.pill || BorderRadius.button,
    marginRight: Spacing.xs,
    backgroundColor: Colors.secondaryBackground,
    borderWidth: 1,
    borderColor: Colors.alternate + '33',
  },
  filterButtonActive: {
    backgroundColor: Colors.tertiary + '1A', // ~10% tint
    borderColor: Colors.tertiary,
  },
  filterText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.secondaryText,
    fontFamily: getFontFamily(600),
    textAlign: 'center',
    lineHeight: 16,
  },
  filterTextActive: {
    color: Colors.tertiary,
    fontWeight: '700',
  },
  listContent: {
    padding: Spacing.small,
    paddingTop: Spacing.medium,
  },
  requestCard: {
    borderRadius: BorderRadius.card,
    marginBottom: Spacing.small,
  },
  requestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.small,
  },
  requestType: {
    ...Typography.label3,
    color: Colors.tertiary,
    fontFamily: getFontFamily(600),
  },
  requestStatus: {
    ...Typography.label4,
    color: Colors.secondaryText,
    textTransform: 'capitalize',
  },
  requestTitle: {
    ...Typography.headline4,
    color: Colors.primaryText,
    fontFamily: getFontFamily(600),
    marginBottom: Spacing.xxs,
  },
  requestDescription: {
    ...Typography.body3,
    color: Colors.primaryText,
    marginBottom: Spacing.small,
    fontFamily: getFontFamily(400),
  },
  requestDate: {
    ...Typography.label5,
    color: Colors.secondaryText,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    padding: Spacing.xxl,
    alignItems: 'center',
  },
  emptyText: {
    ...Typography.body2,
    color: Colors.secondaryText,
    fontFamily: getFontFamily(400),
  },
  // FAB styles
  fab: {
    position: 'absolute',
    right: Spacing.standard,
    bottom: Spacing.standard,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.tertiary,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.medium,
    elevation: 6,
  },
  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: Colors.primaryBackground,
  },
  modalContent: {
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
  titleInput: {
    ...Typography.body3,
    minHeight: 56,
    paddingVertical: Spacing.medium,
    paddingHorizontal: Spacing.medium,
    borderWidth: 1.5,
    borderColor: Colors.alternate + '33',
    borderRadius: BorderRadius.button,
    backgroundColor: Colors.secondaryBackground,
    color: Colors.primaryText,
    fontFamily: getFontFamily(400),
    lineHeight: Typography.body3.fontSize * 1.4,
    textAlignVertical: 'top',
  },
  textArea: {
    ...Typography.body3,
    minHeight: 120,
    borderWidth: 1.5,
    borderColor: Colors.alternate + '33',
    borderRadius: BorderRadius.button,
    paddingHorizontal: Spacing.medium,
    paddingVertical: Spacing.small,
    backgroundColor: Colors.secondaryBackground,
    color: Colors.primaryText,
    fontFamily: getFontFamily(400),
  },
  typeSelector: {
    flexDirection: 'row',
    gap: Spacing.xs,
    marginBottom: Spacing.small,
  },
  typeButton: {
    flex: 1,
    minWidth: 0,
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.xs,
    borderRadius: BorderRadius.pill || BorderRadius.button,
    borderWidth: 1,
    borderColor: Colors.alternate + '33',
    backgroundColor: Colors.secondaryBackground,
    alignItems: 'center',
    justifyContent: 'center',
  },
  typeButtonActive: {
    borderColor: Colors.tertiary,
    backgroundColor: Colors.tertiary,
  },
  typeButtonText: {
    ...Typography.label2,
    color: Colors.secondaryText,
    fontFamily: getFontFamily(500),
    fontSize: 12,
    textAlign: 'center',
  },
  typeButtonTextActive: {
    color: '#FFFFFF',
    fontFamily: getFontFamily(600),
  },
  imagePickerButton: {
    height: TouchTarget.recommended,
    borderWidth: 2,
    borderColor: Colors.alternate + '66',
    borderStyle: 'dashed',
    borderRadius: BorderRadius.button,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.secondaryBackground,
    marginBottom: Spacing.medium,
  },
  imagePickerText: {
    ...Typography.label1,
    color: Colors.secondaryText,
    fontFamily: getFontFamily(500),
  },
  imagePreviewContainer: {
    marginBottom: Spacing.medium,
    position: 'relative',
  },
  imagePreview: {
    width: '100%',
    height: 200,
    borderRadius: BorderRadius.medium,
    resizeMode: 'cover',
  },
  removeImageButton: {
    position: 'absolute',
    top: Spacing.xs,
    right: Spacing.xs,
    backgroundColor: Colors.error + 'E6',
    paddingHorizontal: Spacing.small,
    paddingVertical: Spacing.xxs,
    borderRadius: BorderRadius.small,
  },
  removeImageText: {
    ...Typography.label4,
    color: Colors.primaryBackground,
    fontFamily: getFontFamily(600),
  },
  uploadStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.small,
    marginBottom: Spacing.medium,
  },
  uploadStatusText: {
    ...Typography.label3,
    color: Colors.secondaryText,
    marginLeft: Spacing.xs,
    fontFamily: getFontFamily(500),
  },
  modalActions: {
    marginTop: Spacing.large,
    marginBottom: Spacing.xxl,
  },
  // Pending badge for admins
  pendingBadgeContainer: {
    paddingHorizontal: Spacing.standard,
    paddingBottom: Spacing.xs,
  },
  pendingBadge: {
    backgroundColor: Colors.warning + '20',
    borderWidth: 1,
    borderColor: Colors.warning,
    borderRadius: BorderRadius.medium,
  },
  pendingBadgeText: {
    ...Typography.label1,
    color: Colors.warning,
    fontFamily: getFontFamily(600),
    textAlign: 'center',
  },
});

export default RequestsScreen;

