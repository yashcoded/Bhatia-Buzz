import React, { useEffect, useState, useMemo, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Modal,
  Animated,
  PanResponder,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../utils/theme';
import { useResponsiveLayout } from '../utils/useResponsiveLayout';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchMatrimonialProfiles, findMatches, setCurrentProfile } from '../store/slices/matrimonialSlice';
import { MatrimonialProfile, RootStackParamList } from '../types';
import { formatHeightForDisplay } from '../utils/height';
import MatrimonialProfileDetailContent from '../components/matrimonial/MatrimonialProfileDetailContent';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const MatrimonialSwipeScreen = () => {
  const { colors } = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const dispatch = useAppDispatch();
  const { profiles, currentProfile, loading, matchFilters } = useAppSelector((state) => state.matrimonial);
  const { user } = useAppSelector((state) => state.auth);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [detailExpanded, setDetailExpanded] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  const { contentWidth, isTablet } = useResponsiveLayout();
  const contentWidthRef = useRef(contentWidth);
  contentWidthRef.current = contentWidth;
  const cardWrapperStyle = isTablet ? { maxWidth: contentWidth, width: '100%' as const, alignSelf: 'center' as const, flex: 1 } : { flex: 1 };
  const SWIPE_THRESHOLD = 120;
  const exitX = contentWidth * 0.6;

  const translateX = useRef(new Animated.Value(0)).current;
  const rotate = useRef(new Animated.Value(0)).current;
  const nextProfileRef = useRef<() => void>(() => {});
  const doLikeThenNextRef = useRef<() => void | Promise<void>>(async () => {});
  const openDetailRef = useRef<() => void>(() => {});
  const isAnimatingRef = useRef(false);

  const rotateInterpolate = rotate.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: ['-12deg', '0deg', '12deg'],
  });

  const resetCardPosition = () => {
    translateX.setValue(0);
    rotate.setValue(0);
  };

  const runExitAnimation = (direction: 'left' | 'right', onComplete: () => void) => {
    if (isAnimatingRef.current) return;
    isAnimatingRef.current = true;
    setIsAnimating(true);
    const toX = direction === 'left' ? -exitX : exitX;
    const toRotate = direction === 'left' ? -0.15 : 0.15;
    Animated.parallel([
      Animated.timing(translateX, {
        toValue: toX,
        duration: 220,
        useNativeDriver: true,
      }),
      Animated.timing(rotate, {
        toValue: toRotate,
        duration: 220,
        useNativeDriver: true,
      }),
    ]).start(() => {
      resetCardPosition();
      isAnimatingRef.current = false;
      setIsAnimating(false);
      onComplete();
    });
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => !isAnimatingRef.current,
      onStartShouldSetPanResponderCapture: () => !isAnimatingRef.current,
      onMoveShouldSetPanResponder: (_, g) => !isAnimatingRef.current && Math.abs(g.dx) > 8,
      onMoveShouldSetPanResponderCapture: (_, g) => !isAnimatingRef.current && Math.abs(g.dx) > 8,
      onPanResponderMove: (_, gestureState) => {
        if (isAnimatingRef.current) return;
        const w = contentWidthRef.current || 300;
        translateX.setValue(gestureState.dx);
        rotate.setValue(gestureState.dx / (w / 2));
      },
      onPanResponderRelease: (_, gestureState) => {
        if (isAnimatingRef.current) return;
        const { dx, vx } = gestureState;
        const isTap = Math.abs(dx) < 12 && Math.abs(gestureState.dy) < 12;
        if (isTap) {
          openDetailRef.current();
          return;
        }
        const shouldPass = dx < -SWIPE_THRESHOLD || (dx < 0 && vx < -0.25);
        const shouldLike = dx > SWIPE_THRESHOLD || (dx > 0 && vx > 0.25);
        if (shouldPass) {
          runExitAnimation('left', () => nextProfileRef.current());
        } else if (shouldLike) {
          runExitAnimation('right', () => doLikeThenNextRef.current());
        } else {
          Animated.parallel([
            Animated.spring(translateX, {
              toValue: 0,
              useNativeDriver: true,
              tension: 80,
              friction: 10,
            }),
            Animated.spring(rotate, {
              toValue: 0,
              useNativeDriver: true,
              tension: 80,
              friction: 10,
            }),
          ]).start();
        }
      },
    })
  ).current;

  useEffect(() => {
    loadProfiles();
  }, []);

  useEffect(() => {
    if (profiles.length > 0 && !currentProfile) {
      const userProfile = profiles.find((p) => p.userId === user?.id);
      if (userProfile) {
        dispatch(setCurrentProfile(userProfile));
      }
    }
  }, [profiles, user, currentProfile, dispatch]);

  const loadProfiles = async () => {
    try {
      await dispatch(fetchMatrimonialProfiles()).unwrap();
    } catch (err) {
      console.error('Error loading profiles:', err);
    }
  };

  const nextProfile = () => {
    if (currentIndex < filteredProfiles.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const doLikeThenNext = async () => {
    if (!currentProfile) return;
    const profileToMatch = filteredProfiles[currentIndex];
    if (!profileToMatch || profileToMatch.userId === user?.id) {
      nextProfile();
      return;
    }
    try {
      await dispatch(
        findMatches({
          profileId: currentProfile.id,
          allProfiles: profiles,
        })
      ).unwrap();
      nextProfile();
    } catch (err) {
      console.error('Error finding matches:', err);
    }
  };

  const handleLike = () => {
    runExitAnimation('right', () => doLikeThenNext());
  };

  const handlePass = () => {
    runExitAnimation('left', nextProfile);
  };

  const openDetail = () => setDetailExpanded(true);
  nextProfileRef.current = nextProfile;
  doLikeThenNextRef.current = doLikeThenNext;
  openDetailRef.current = openDetail;

  const { ageMin: minAgeNum, ageMax: maxAgeNum, locationQuery: locationFilter, genderFilter } = matchFilters;
  const locationLower = locationFilter.trim().toLowerCase();

  const filteredProfiles = useMemo(() => {
    return profiles.filter((p) => {
      if (p.userId === user?.id) return false;
      const age = p.personalInfo.age;
      if (age != null && (age < minAgeNum || age > maxAgeNum)) return false;
      if (genderFilter !== 'all' && p.personalInfo.gender !== genderFilter) return false;
      if (locationLower) {
        const address = (p.personalInfo.presentAddress || '').toLowerCase();
        const native = (p.personalInfo.nativePlace || '').toLowerCase();
        if (!address.includes(locationLower) && !native.includes(locationLower)) return false;
      }
      return true;
    });
  }, [profiles, user?.id, minAgeNum, maxAgeNum, locationLower, genderFilter]);

  useEffect(() => {
    setCurrentIndex(0);
  }, [minAgeNum, maxAgeNum, locationLower, genderFilter]);

  useEffect(() => {
    resetCardPosition();
  }, [currentIndex]);

  const profileToShow = filteredProfiles[currentIndex];
  const userProfile = currentProfile || profiles.find((p) => p.userId === user?.id);

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (!userProfile && !loading) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.emptyText}>Create your matrimonial profile first to see matches.</Text>
        <TouchableOpacity
          style={styles.createProfileButton}
          onPress={() => navigation.navigate('CreateMatrimonialProfile')}
        >
          <Text style={styles.createProfileButtonText}>Create profile</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!profileToShow || profileToShow.userId === user?.id) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.emptyText}>No more profiles to show</Text>
      </View>
    );
  }

  const closeDetail = () => setDetailExpanded(false);

  return (
    <View style={[styles.container, { backgroundColor: colors.primaryBackground }]}>
      <View style={cardWrapperStyle}>
      <Animated.View
        style={[
          styles.card,
          {
            transform: [{ translateX }, { rotate: rotateInterpolate }],
          },
        ]}
        {...panResponder.panHandlers}
      >
        <View style={styles.cardInner}>
          {profileToShow.photos.length > 0 ? (
            <Image source={{ uri: profileToShow.photos[0] }} style={styles.photo} />
          ) : (
            <View style={styles.photoPlaceholder}>
              <Text style={styles.photoPlaceholderText}>No Photo</Text>
            </View>
          )}

          <View style={styles.cardContent}>
            <Text style={styles.name}>{profileToShow.personalInfo.name}</Text>
            <Text style={styles.age}>{profileToShow.personalInfo.age != null ? `${profileToShow.personalInfo.age} years` : ''}</Text>
            {profileToShow.personalInfo.presentAddress ? (
              <Text style={styles.location}>{profileToShow.personalInfo.presentAddress}</Text>
            ) : null}
            {profileToShow.personalInfo.height && (
              <Text style={styles.height}>
                {formatHeightForDisplay(
                  profileToShow.personalInfo.height,
                  profileToShow.personalInfo.heightInCm
                )}
              </Text>
            )}
            <Text style={styles.education}>{profileToShow.personalInfo.education}</Text>
            {profileToShow.personalInfo.bio ? (
              <Text style={styles.bio} numberOfLines={2}>{profileToShow.personalInfo.bio}</Text>
            ) : null}
            <Text style={styles.tapHint}>Tap card for full profile · swipe to pass/like</Text>
          </View>
        </View>
      </Animated.View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.passButton, isAnimating && styles.actionDisabled]}
          onPress={handlePass}
          disabled={isAnimating}
        >
          <Text style={styles.passButtonText}>✕</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.likeButton, isAnimating && styles.actionDisabled]}
          onPress={handleLike}
          disabled={isAnimating}
        >
          <Text style={styles.likeButtonText}>♥</Text>
        </TouchableOpacity>
      </View>
      </View>

      {/* Bumble-style expand: full profile in modal */}
      <Modal
        visible={detailExpanded}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={closeDetail}
      >
        <SafeAreaView style={[styles.modalRoot, { backgroundColor: colors.primaryBackground }]}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={closeDetail} style={styles.modalCloseBtn}>
              <Text style={styles.modalCloseText}>✕ Close</Text>
            </TouchableOpacity>
          </View>
          <MatrimonialProfileDetailContent profile={profileToShow} compact />
          <View style={styles.modalActions}>
            <TouchableOpacity
              style={[styles.modalActionBtn, styles.modalPassBtn]}
              onPress={() => { closeDetail(); handlePass(); }}
            >
              <Text style={styles.modalPassBtnText}>Pass</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalActionBtn, styles.modalLikeBtn]}
              onPress={() => { closeDetail(); handleLike(); }}
            >
              <Text style={styles.modalLikeBtnText}>Like</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  cardInner: {
    flex: 1,
  },
  photo: {
    width: '100%',
    height: '60%',
  },
  photoPlaceholder: {
    width: '100%',
    height: '60%',
    backgroundColor: '#ddd',
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoPlaceholderText: {
    fontSize: 18,
    color: '#666',
  },
  cardContent: {
    padding: 20,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  age: {
    fontSize: 18,
    color: '#666',
    marginBottom: 5,
  },
  location: {
    fontSize: 16,
    color: '#666',
    marginBottom: 5,
  },
  height: {
    fontSize: 16,
    color: '#666',
    marginBottom: 5,
  },
  education: {
    fontSize: 16,
    color: '#666',
    marginBottom: 10,
  },
  bio: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  passButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#FF3B30',
    justifyContent: 'center',
    alignItems: 'center',
  },
  passButtonText: {
    fontSize: 30,
    color: '#FF3B30',
  },
  likeButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#34C759',
    justifyContent: 'center',
    alignItems: 'center',
  },
  likeButtonText: {
    fontSize: 30,
    color: '#fff',
  },
  actionDisabled: {
    opacity: 0.6,
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    paddingHorizontal: 24,
  },
  createProfileButton: {
    marginTop: 16,
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: '#007AFF',
    borderRadius: 10,
  },
  createProfileButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
  tapHint: {
    fontSize: 12,
    color: '#007AFF',
    marginTop: 8,
  },
  modalRoot: {
    flex: 1,
    backgroundColor: '#fff',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalCloseBtn: {
    padding: 8,
  },
  modalCloseText: {
    fontSize: 16,
    color: '#007AFF',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    backgroundColor: '#fff',
  },
  modalActionBtn: {
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 28,
    minWidth: 120,
    alignItems: 'center',
  },
  modalPassBtn: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#FF3B30',
  },
  modalPassBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF3B30',
  },
  modalLikeBtn: {
    backgroundColor: '#34C759',
  },
  modalLikeBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});

export default MatrimonialSwipeScreen;

