import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from 'react-native';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchMatrimonialProfiles, findMatches, setCurrentProfile } from '../store/slices/matrimonialSlice';
import { MatrimonialProfile } from '../types';
import { formatHeightForDisplay } from '../utils/height';

const MatrimonialSwipeScreen = () => {
  const dispatch = useAppDispatch();
  const { profiles, currentProfile, loading } = useAppSelector((state) => state.matrimonial);
  const { user } = useAppSelector((state) => state.auth);
  const [currentIndex, setCurrentIndex] = useState(0);

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

  const handleLike = async () => {
    if (!currentProfile) return;

    const profileToMatch = profiles[currentIndex];
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

  const handlePass = () => {
    nextProfile();
  };

  const nextProfile = () => {
    if (currentIndex < profiles.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const profileToShow = profiles[currentIndex];
  const userProfile = currentProfile || profiles.find((p) => p.userId === user?.id);

  if (loading || !userProfile) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
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

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        {profileToShow.photos.length > 0 ? (
          <Image source={{ uri: profileToShow.photos[0] }} style={styles.photo} />
        ) : (
          <View style={styles.photoPlaceholder}>
            <Text style={styles.photoPlaceholderText}>No Photo</Text>
          </View>
        )}

        <View style={styles.cardContent}>
          <Text style={styles.name}>{profileToShow.personalInfo.name}</Text>
          <Text style={styles.age}>{profileToShow.personalInfo.age} years old</Text>
          {(profileToShow.personalInfo as any).location != null && (
            <Text style={styles.location}>{(profileToShow.personalInfo as any).location}</Text>
          )}
          {profileToShow.personalInfo.height && (
            <Text style={styles.height}>
              {formatHeightForDisplay(
                profileToShow.personalInfo.height,
                profileToShow.personalInfo.heightInCm
              )}
            </Text>
          )}
          <Text style={styles.education}>{profileToShow.personalInfo.education}</Text>
          {profileToShow.personalInfo.bio && (
            <Text style={styles.bio}>{profileToShow.personalInfo.bio}</Text>
          )}
        </View>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity style={styles.passButton} onPress={handlePass}>
          <Text style={styles.passButtonText}>✕</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.likeButton} onPress={handleLike}>
          <Text style={styles.likeButtonText}>♥</Text>
        </TouchableOpacity>
      </View>
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
  emptyText: {
    fontSize: 18,
    color: '#666',
  },
});

export default MatrimonialSwipeScreen;

