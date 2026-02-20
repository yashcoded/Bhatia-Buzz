import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { MatrimonialProfile, Match } from '../../types';
import * as firestoreService from '../../services/firebase/firestore';
import * as matchingService from '../../services/matching/algorithm';
import { DUMMY_MATRIMONIAL_PROFILES } from '../../fixtures/dummyMatrimonialProfiles';

export interface MatchFilters {
  ageMin: number;
  ageMax: number;
  locationQuery: string;
  locationRadiusKm: number;
  genderFilter: 'all' | 'male' | 'female';
}

interface MatrimonialState {
  profiles: MatrimonialProfile[];
  currentProfile?: MatrimonialProfile;
  matches: Match[];
  loading: boolean;
  error: string | null;
  matchFilters: MatchFilters;
}

const initialFilters: MatchFilters = {
  ageMin: 18,
  ageMax: 60,
  locationQuery: '',
  locationRadiusKm: 50,
  genderFilter: 'all',
};

const initialState: MatrimonialState = {
  profiles: [],
  currentProfile: undefined,
  matches: [],
  loading: false,
  error: null,
  matchFilters: initialFilters,
};

// Async thunks
export const fetchMatrimonialProfiles = createAsyncThunk(
  'matrimonial/fetchProfiles',
  async (_, { getState }) => {
    const currentUserId = (getState() as { auth: { user: { id?: string } } }).auth?.user?.id;
    let profiles = await firestoreService.getMatrimonialProfiles();
    // In dev, append dummy profiles so you can see how the swipe cards look
    if (__DEV__) {
      const others = DUMMY_MATRIMONIAL_PROFILES.filter((p) => p.userId !== currentUserId);
      const hasOwnProfile = currentUserId && profiles.some((p) => p.userId === currentUserId);
      // If user has no approved profile, add a dummy "your" profile so the swipe screen can render (no infinite loading)
      if (currentUserId && !hasOwnProfile && DUMMY_MATRIMONIAL_PROFILES.length > 0) {
        const dummySelf: MatrimonialProfile = {
          ...DUMMY_MATRIMONIAL_PROFILES[0],
          id: 'dummy-self',
          userId: currentUserId,
        };
        // Put others first so the first card shown is not the user's own profile
        return [...others, dummySelf, ...profiles];
      }
      // Put others first so the first card is never the current user
      return [...others, ...profiles];
    }
    return profiles;
  }
);

export const createMatrimonialProfile = createAsyncThunk(
  'matrimonial/createProfile',
  async (profile: Omit<MatrimonialProfile, 'id' | 'createdAt' | 'status'>) => {
    const id = await firestoreService.createMatrimonialProfile(profile);
    return { id, ...profile, createdAt: new Date().toISOString(), status: 'pending' as const };
  }
);

export const findMatches = createAsyncThunk(
  'matrimonial/findMatches',
  async ({ profileId, allProfiles }: { profileId: string; allProfiles: MatrimonialProfile[] }) => {
    const profile = allProfiles.find((p) => p.id === profileId);
    if (!profile) throw new Error('Profile not found');

    const matchScores = matchingService.findMatches(profile, allProfiles);
    
    // Create match records
    const matches: Match[] = [];
    for (const matchScore of matchScores) {
      const matchData = matchingService.createMatch(profileId, matchScore.profileId, matchScore.score);
      const matchId = await firestoreService.createMatch(matchData);
      matches.push({
        id: matchId,
        ...matchData,
        createdAt: new Date().toISOString(),
      });
    }

    return matches;
  }
);

export const updateMatrimonialProfileStatus = createAsyncThunk(
  'matrimonial/updateProfileStatus',
  async ({ profileId, status, adminNotes }: { profileId: string; status: 'approved' | 'rejected'; adminNotes?: string }) => {
    await firestoreService.updateMatrimonialProfileStatus(profileId, status, adminNotes);
    return { profileId, status, adminNotes };
  }
);

const matrimonialSlice = createSlice({
  name: 'matrimonial',
  initialState,
  reducers: {
    setCurrentProfile: (state, action: PayloadAction<MatrimonialProfile | undefined>) => {
      state.currentProfile = action.payload;
      // Default: show opposite gender only (male account → female only, female account → male only)
      if (action.payload && state.matchFilters.genderFilter === 'all') {
        state.matchFilters.genderFilter = action.payload.personalInfo.gender === 'male' ? 'female' : 'male';
      }
    },
    setMatchFilters: (state, action: PayloadAction<MatchFilters>) => {
      state.matchFilters = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch profiles
      .addCase(fetchMatrimonialProfiles.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMatrimonialProfiles.fulfilled, (state, action) => {
        state.loading = false;
        state.profiles = action.payload;
      })
      .addCase(fetchMatrimonialProfiles.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch profiles';
      })
      // Create profile
      .addCase(createMatrimonialProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createMatrimonialProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.profiles.push(action.payload as MatrimonialProfile);
      })
      .addCase(createMatrimonialProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to create profile';
      })
      // Find matches
      .addCase(findMatches.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(findMatches.fulfilled, (state, action) => {
        state.loading = false;
        state.matches = action.payload;
      })
      .addCase(findMatches.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to find matches';
      })
      // Update profile status
      .addCase(updateMatrimonialProfileStatus.fulfilled, (state, action) => {
        const profile = state.profiles.find((p) => p.id === action.payload.profileId);
        if (profile) {
          profile.status = action.payload.status;
          if (action.payload.adminNotes) {
            profile.adminNotes = action.payload.adminNotes;
          }
        }
      });
  },
});

export const { setCurrentProfile, setMatchFilters, clearError } = matrimonialSlice.actions;
export default matrimonialSlice.reducer;

