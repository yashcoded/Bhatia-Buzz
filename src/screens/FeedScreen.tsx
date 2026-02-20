import React, { useEffect, useCallback, useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import Svg, { Path } from 'react-native-svg';
import * as ImagePicker from 'expo-image-picker';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchPosts, fetchInstagramPosts, setRefreshing, addPost } from '../store/slices/feedSlice';
import { createPost } from '../services/firebase/firestore';
import { uploadPostImage } from '../services/firebase/storage';
import PostCard from '../components/feed/PostCard';
import Button from '../components/common/Button';
import FadeInView from '../components/common/FadeInView';
import { Post } from '../types';
import { Typography, Spacing, BorderRadius, Shadows, TouchTarget, type ThemeColors } from '../constants/theme';
import { useTheme } from '../utils/theme';
import { useResponsiveLayout } from '../utils/useResponsiveLayout';
import { getFontFamily } from '../utils/fonts';

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

// Search Icon
const SearchIcon = ({ color, size }: { color: string; size: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M21 21L15 15M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);


type FeedScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

const FeedScreen = () => {
  const { colors } = useTheme();
  const dispatch = useAppDispatch();
  const navigation = useNavigation<FeedScreenNavigationProp>();
  const { posts, loading, refreshing, error } = useAppSelector((state) => state.feed);
  const { user } = useAppSelector((state) => state.auth);
  const insets = useSafeAreaInsets();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  
  // Admin create post modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPostContent, setNewPostContent] = useState('');
  const [selectedImageUri, setSelectedImageUri] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  
  const isAdmin = user?.role === 'admin';
  const { contentWidth, isTablet } = useResponsiveLayout();
  const feedWrapperStyle = isTablet ? { maxWidth: contentWidth, width: '100%' as const, alignSelf: 'center' as const } : undefined;

  // Request gallery permissions and pick image
  const pickImage = async () => {
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

  // Remove selected image
  const removeImage = () => {
    setSelectedImageUri(null);
  };

  const loadPosts = useCallback(async () => {
    try {
      // Fetch Firestore posts first
      await dispatch(fetchPosts()).unwrap();
      
      // Fetch Instagram posts if user is available (non-blocking)
      if (user) {
        try {
          await dispatch(fetchInstagramPosts({ userId: user.id, userName: user.displayName })).unwrap();
        } catch (err) {
          // Instagram errors are non-critical, just log
          console.warn('Instagram posts fetch failed (non-critical):', err);
        }
      }
    } catch (err) {
      console.error('Error loading posts:', err);
    }
  }, [dispatch, user?.id]); // Only depend on user.id, so it reloads if user changes but posts still load without user

  // Load posts on mount and when user becomes available (e.g., after signup)
  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  const handleRefresh = useCallback(async () => {
    dispatch(setRefreshing(true));
    await loadPosts();
    dispatch(setRefreshing(false));
  }, [dispatch, loadPosts]);

  const handleCreatePost = async () => {
    if (!newPostContent.trim()) {
      Alert.alert('Error', 'Please enter some content for the post');
      return;
    }
    
    if (!user) return;
    
    setIsCreating(true);
    let imageUrl: string | undefined;

    try {
      // Upload image first if one is selected
      if (selectedImageUri) {
        setIsUploadingImage(true);
        try {
          // Convert URI to blob
          const response = await fetch(selectedImageUri);
          const blob = await response.blob();
          
          // Upload to Firebase Storage using user ID as path
          imageUrl = await uploadPostImage(user.id, blob, true);
          console.log('Image uploaded successfully:', imageUrl);
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

      const postData = {
        userId: user.id,
        userName: user.displayName || 'Admin',
        userAvatar: user.photoURL,
        content: newPostContent.trim(),
        imageUrl,
        likes: 0,
        comments: [],
        likedBy: [],
      };
      
      const postId = await createPost(postData);
      
      // Add to local state immediately
      const newPost: Post = {
        id: postId,
        ...postData,
        createdAt: new Date().toISOString(),
      };
      dispatch(addPost(newPost));
      
      // Reset form and close modal
      setNewPostContent('');
      setSelectedImageUri(null);
      setShowCreateModal(false);
      
      Alert.alert('Success', 'Post created successfully!');
    } catch (err: any) {
      console.error('Error creating post:', err);
      Alert.alert('Error', err.message || 'Failed to create post');
    } finally {
      setIsCreating(false);
    }
  };

  const renderPost = ({ item, index }: { item: Post; index: number }) => (
    <FadeInView delay={index * 35} slideUp duration={320}>
      <PostCard post={item} />
    </FadeInView>
  );

  if (loading && posts.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.tertiary} />
      </View>
    );
  }

  if (error && posts.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom', 'left', 'right']}>
      <View style={[{ flex: 1 }, feedWrapperStyle]}>
        {/* Facebook-style Header */}
        <View style={[styles.fbHeader, { paddingTop: Platform.OS === 'ios' ? insets.top + Spacing.xs : Spacing.xs }]}>
          <View style={styles.fbHeaderContent}>
            {/* Left: Logo/Brand */}
            <View style={styles.fbHeaderLeft}>
              <View style={styles.fbHeaderLogoContainer}>
                <Text style={styles.fbHeaderLogoText}>Bhatia</Text>
                <Text style={[styles.fbHeaderLogoText, styles.fbHeaderLogoAccent]}>Buzz</Text>
              </View>
            </View>
            
            {/* Right: Action Icons */}
            <View style={styles.fbHeaderRight}>
              <TouchableOpacity style={styles.fbHeaderIconButton} activeOpacity={0.7}>
                <SearchIcon color={colors.primaryText} size={24} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
        
        {/* Create Post Button - Facebook style below header - only for authenticated admins */}
        {user && isAdmin && (
          <TouchableOpacity
            style={styles.createPostButton}
            onPress={() => setShowCreateModal(true)}
            activeOpacity={0.7}
          >
            <View style={styles.createPostButtonContent}>
              {user?.photoURL ? (
                <Image source={{ uri: user.photoURL }} style={styles.createPostAvatar} />
              ) : (
                <View style={[styles.createPostAvatar, styles.createPostAvatarPlaceholder]}>
                  <Text style={styles.createPostAvatarText}>
                    {(user?.displayName || user?.email || 'U').charAt(0).toUpperCase()}
                  </Text>
                </View>
              )}
              <View style={styles.createPostButtonTextContainer}>
                <Text style={styles.createPostButtonText}>What's on your mind?</Text>
              </View>
              <View style={styles.createPostButtonIcon}>
                <PlusIcon color={colors.tertiary} size={20} />
              </View>
            </View>
          </TouchableOpacity>
        )}
        
        <FlatList
        data={posts}
        renderItem={renderPost}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.tertiary}
            colors={[colors.tertiary]}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No posts yet. Pull to refresh!</Text>
          </View>
        }
        />
      </View>
      
      {/* Create Post Modal */}
      <Modal
        visible={showCreateModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => {
          setShowCreateModal(false);
          setNewPostContent('');
          setSelectedImageUri(null);
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
                  setNewPostContent('');
                  setSelectedImageUri(null);
                }}
              >
                <Text style={styles.modalCancel}>Cancel</Text>
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Create Post</Text>
              <View style={{ width: 60 }} />
            </View>
            
            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              <Text style={styles.inputLabel}>Content *</Text>
              <TextInput
                style={styles.textArea}
                placeholder="What's happening in the community?"
                placeholderTextColor={colors.secondaryText}
                value={newPostContent}
                onChangeText={setNewPostContent}
                multiline
                numberOfLines={5}
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
                  <ActivityIndicator size="small" color={colors.tertiary} />
                  <Text style={styles.uploadStatusText}>
                    {isUploadingImage ? 'Uploading image...' : 'Creating post...'}
                  </Text>
                </View>
              )}
              
              <View style={styles.modalActions}>
                <Button
                  title={isCreating ? 'Creating...' : 'Create Post'}
                  onPress={handleCreatePost}
                  loading={isCreating || isUploadingImage}
                  disabled={isCreating || isUploadingImage || !newPostContent.trim()}
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

function makeStyles(colors: ThemeColors) {
  return StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primaryBackground,
  },
  fbHeader: {
    backgroundColor: colors.primaryBackground,
    borderBottomWidth: 1,
    borderBottomColor: colors.alternate + '1A',
    ...Shadows.subtle,
    zIndex: 10,
  },
  fbHeaderContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.standard,
    paddingVertical: Spacing.medium,
    minHeight: 56,
  },
  fbHeaderLeft: {
    flex: 1,
    justifyContent: 'center',
  },
  fbHeaderLogoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  fbHeaderLogoText: {
    ...Typography.headline4,
    fontSize: 28,
    fontWeight: '700',
    color: colors.primaryText,
    fontFamily: getFontFamily(700),
    letterSpacing: -0.5,
  },
  fbHeaderLogoAccent: {
    color: colors.primary,
  },
  fbHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  fbHeaderIconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.alternate + '0D',
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Legacy header styles (keeping for reference, can be removed)
  header: {
    paddingHorizontal: Spacing.standard,
    paddingBottom: Spacing.medium,
  },
  headerTitle: {
    ...Typography.headline3,
    color: colors.primaryText,
    fontFamily: getFontFamily(600),
    marginBottom: Spacing.xxs,
  },
  headerSubtitle: {
    ...Typography.body3,
    color: colors.secondaryText,
    fontFamily: getFontFamily(400),
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    ...Typography.body2,
    color: colors.error,
    fontFamily: getFontFamily(500),
  },
  emptyContainer: {
    padding: Spacing.xxl,
    alignItems: 'center',
  },
  emptyText: {
    ...Typography.body2,
    color: colors.secondaryText,
    fontFamily: getFontFamily(400),
  },
  // Create Post Button (Facebook style)
  createPostButton: {
    backgroundColor: colors.primaryBackground,
    borderBottomWidth: 1,
    borderBottomColor: colors.alternate + '1A',
    paddingHorizontal: Spacing.standard,
    paddingVertical: Spacing.medium,
  },
  createPostButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  createPostAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: Spacing.medium,
  },
  createPostAvatarPlaceholder: {
    backgroundColor: colors.tertiary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  createPostAvatarText: {
    color: colors.primaryBackground,
    fontSize: 18,
    fontFamily: getFontFamily(600),
  },
  createPostButtonTextContainer: {
    flex: 1,
  },
  createPostButtonText: {
    ...Typography.body2,
    color: colors.secondaryText,
    fontFamily: getFontFamily(400),
  },
  createPostButtonIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.alternate + '0D',
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: colors.primaryBackground,
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
    borderBottomColor: colors.alternate + '33',
  },
  modalCancel: {
    ...Typography.label1,
    color: colors.tertiary,
    fontFamily: getFontFamily(500),
  },
  modalTitle: {
    ...Typography.headline4,
    color: colors.primaryText,
    fontFamily: getFontFamily(600),
  },
  modalBody: {
    flex: 1,
    padding: Spacing.standard,
  },
  inputLabel: {
    ...Typography.label2,
    color: colors.primaryText,
    fontFamily: getFontFamily(600),
    marginBottom: Spacing.xs,
    marginTop: Spacing.medium,
  },
  input: {
    ...Typography.body3,
    height: TouchTarget.recommended,
    borderWidth: 1.5,
    borderColor: colors.alternate + '33',
    borderRadius: BorderRadius.button,
    paddingHorizontal: Spacing.medium,
    backgroundColor: colors.secondaryBackground,
    color: colors.primaryText,
    fontFamily: getFontFamily(400),
  },
  textArea: {
    ...Typography.body3,
    minHeight: 120,
    borderWidth: 1.5,
    borderColor: colors.alternate + '33',
    borderRadius: BorderRadius.button,
    paddingHorizontal: Spacing.medium,
    paddingVertical: Spacing.small,
    backgroundColor: colors.secondaryBackground,
    color: colors.primaryText,
    fontFamily: getFontFamily(400),
  },
  modalActions: {
    marginTop: Spacing.large,
    marginBottom: Spacing.xxl,
  },
  imagePickerButton: {
    height: TouchTarget.recommended,
    borderWidth: 2,
    borderColor: colors.alternate + '66',
    borderStyle: 'dashed',
    borderRadius: BorderRadius.button,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.secondaryBackground,
    marginBottom: Spacing.medium,
  },
  imagePickerText: {
    ...Typography.label1,
    color: colors.secondaryText,
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
    backgroundColor: colors.error + 'E6',
    paddingHorizontal: Spacing.small,
    paddingVertical: Spacing.xxs,
    borderRadius: BorderRadius.small,
  },
  removeImageText: {
    ...Typography.label4,
    color: colors.primaryBackground,
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
    color: colors.secondaryText,
    marginLeft: Spacing.xs,
    fontFamily: getFontFamily(500),
  },
  });
}

export default FeedScreen;

