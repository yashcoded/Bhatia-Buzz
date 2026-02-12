import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { MatrimonialProfile, Match } from '../../types';
import * as firestoreService from '../../services/firebase/firestore';
import * as matchingService from '../../services/matching/algorithm';

interface MatrimonialState {
  profiles: MatrimonialProfile[];
  currentProfile?: MatrimonialProfile;
  matches: Match[];
  loading: boolean;
  error: string | null;
}

const initialState: MatrimonialState = {
  profiles: [],
  currentProfile: undefined,
  matches: [],
  loading: false,
  error: null,
};

// Async thunks
export const fetchMatrimonialProfiles = createAsyncThunk(
  'matrimonial/fetchProfiles',
  async () => {
    return await firestoreService.getMatrimonialProfiles();
  }
);

export const createMatrimonialProfile = createAsyncThunk(
  'matrimonial/createProfile',
  async (profile: Omit<MatrimonialProfile, 'id' | 'createdAt' | 'status'>) => {
    const id = await firestoreService.createMatrimonialProfile(profile);
    return { id, ...profile, createdAt: new Date(), status: 'pending' as const };
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
        createdAt: new Date(),
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

export const { setCurrentProfile, clearError } = matrimonialSlice.actions;
export default matrimonialSlice.reducer;

