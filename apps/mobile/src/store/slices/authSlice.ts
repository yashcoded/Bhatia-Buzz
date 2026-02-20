import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { User } from '../../types';
import * as authService from '../../services/firebase/auth';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  loading: true,
  error: null,
};

// Async thunks
export const signInUser = createAsyncThunk(
  'auth/signIn',
  async ({ email, password }: { email: string; password: string }) => {
    return await authService.signIn(email, password);
  }
);

export const signUpUser = createAsyncThunk(
  'auth/signUp',
  async ({ email, password, displayName }: { email: string; password: string; displayName: string }) => {
    return await authService.signUp(email, password, displayName);
  }
);

export const signInWithGoogleUser = createAsyncThunk(
  'auth/signInWithGoogle',
  async () => {
    return await authService.signInWithGoogle();
  }
);

export const signOutUser = createAsyncThunk('auth/signOut', async () => {
  await authService.signOut();
});

export const getCurrentUser = createAsyncThunk('auth/getCurrentUser', async () => {
  return await authService.getCurrentUser();
});

export const updateUserProfile = createAsyncThunk(
  'auth/updateProfile',
  async (updates: {
    displayName?: string;
    phoneNumber?: string | null;
    photoURL?: string | null;
  }, { getState }) => {
    const state = getState() as { auth: AuthState };
    const currentUser = state.auth.user;
    
    if (!currentUser) {
      throw new Error('No authenticated user');
    }

    // Update Firebase Auth profile (displayName, photoURL)
    await authService.updateFirebaseAuthProfile({
      displayName: updates.displayName,
      photoURL: updates.photoURL,
    });

    // Update Firestore user document (including phoneNumber)
    await authService.updateFirestoreUser(currentUser.id, updates);

    // Return updated user data
    return {
      ...currentUser,
      displayName: updates.displayName ?? currentUser.displayName,
      phoneNumber: updates.phoneNumber ?? currentUser.phoneNumber,
      photoURL: updates.photoURL ?? currentUser.photoURL,
    };
  }
);

export const deleteAccount = createAsyncThunk('auth/deleteAccount', async () => {
  await authService.deleteAccount();
});

export const changePassword = createAsyncThunk(
  'auth/changePassword',
  async ({ currentPassword, newPassword }: { currentPassword: string; newPassword: string }) => {
    await authService.changePassword(currentPassword, newPassword);
  }
);

export const resendVerificationEmail = createAsyncThunk(
  'auth/resendVerificationEmail',
  async () => {
    await authService.resendVerificationEmail();
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User | null>) => {
      state.user = action.payload;
      state.isAuthenticated = !!action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Sign in
      .addCase(signInUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(signInUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(signInUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Sign in failed';
      })
      // Sign up
      .addCase(signUpUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(signUpUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(signUpUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Sign up failed';
      })
      // Sign in with Google
      .addCase(signInWithGoogleUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(signInWithGoogleUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(signInWithGoogleUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Google sign in failed';
      })
      // Sign out
      .addCase(signOutUser.fulfilled, (state) => {
        state.user = null;
        state.isAuthenticated = false;
      })
      // Get current user
      .addCase(getCurrentUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(getCurrentUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = !!action.payload;
      })
      .addCase(getCurrentUser.rejected, (state) => {
        state.loading = false;
        state.isAuthenticated = false;
      })
      // Update profile
      .addCase(updateUserProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to update profile';
      })
      // Delete account
      .addCase(deleteAccount.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteAccount.fulfilled, (state) => {
        state.loading = false;
        state.user = null;
        state.isAuthenticated = false;
      })
      .addCase(deleteAccount.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to delete account';
      })
      // Change password
      .addCase(changePassword.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(changePassword.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(changePassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to change password';
      })
      // Resend verification email
      .addCase(resendVerificationEmail.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(resendVerificationEmail.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(resendVerificationEmail.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to send verification email';
      });
  },
});

export const { setUser, clearError } = authSlice.actions;
export default authSlice.reducer;

