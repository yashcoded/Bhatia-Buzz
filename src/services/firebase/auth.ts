import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithCredential,
  signOut as firebaseSignOut,
  deleteUser,
  updateProfile as firebaseUpdateProfile,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
  User as FirebaseUser,
  onAuthStateChanged,
  sendEmailVerification,
  reload,
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc, deleteDoc, serverTimestamp, collection, query, where, getDocs, Timestamp } from 'firebase/firestore';
import { ref, deleteObject, listAll } from 'firebase/storage';
import { auth, firestore, storage } from './config';
import { User } from '../../types';
import { COLLECTIONS } from '../../constants/config';
import { getGoogleIdToken } from '../../utils/googleSignIn';
import { isDisposableEmail } from '../../utils/emailValidation';

// Only log in development (never log PII or keys in production)
const devLog = (...args: unknown[]) => {
  if (typeof __DEV__ !== 'undefined' && __DEV__) console.log(...args);
};

// Check if session is valid (within 4 months)
const isSessionValid = (lastLoginTime: string | Timestamp | undefined): boolean => {
  if (!lastLoginTime) return true; // No login time recorded, assume valid
  
  try {
    let loginDate: Date;
    if (lastLoginTime instanceof Timestamp) {
      loginDate = lastLoginTime.toDate();
    } else if (typeof lastLoginTime === 'string') {
      loginDate = new Date(lastLoginTime);
    } else {
      return true; // Unknown format, assume valid
    }
    
    const now = new Date();
    const fourMonthsAgo = new Date(now.getTime() - (4 * 30 * 24 * 60 * 60 * 1000)); // ~4 months in milliseconds
    
    return loginDate >= fourMonthsAgo;
  } catch (error) {
    if (typeof __DEV__ !== 'undefined' && __DEV__) console.error('Error checking session validity:', error);
    return true; // On error, assume valid
  }
};

// Convert Firebase User to App User (and auto-create Firestore doc if missing)
const convertFirebaseUser = async (firebaseUser: FirebaseUser): Promise<User | null> => {
  if (!firebaseUser) return null;

  const userDocRef = doc(firestore, COLLECTIONS.USERS, firebaseUser.uid);
  const userDoc = await getDoc(userDocRef);
  let userData = userDoc.data();

  // Check session validity if lastLoginAt exists (4-month expiration)
  if (userDoc.exists() && userData?.lastLoginAt) {
    const sessionValid = isSessionValid(userData.lastLoginAt);
    if (!sessionValid) {
      devLog('Session expired (older than 4 months), signing out...');
      await firebaseSignOut(auth);
      return null; // Return null to indicate session expired
    }
  }

  // Auto-create user document if it doesn't exist
  if (!userDoc.exists()) {
    devLog('User document not found, creating one...');
    const newUserData = {
      id: firebaseUser.uid,
      email: firebaseUser.email || '',
      displayName: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || '',
      photoURL: firebaseUser.photoURL || null,
      phoneNumber: firebaseUser.phoneNumber || null,
      role: 'user', // Default role - change to 'admin' in Firebase Console
      createdAt: serverTimestamp(),
      lastLoginAt: serverTimestamp(), // Track login time for session expiration
    };
    
    // Normalize email to lowercase
    const normalizedEmail = (firebaseUser.email || '').toLowerCase();
    newUserData.email = normalizedEmail;
    
    await setDoc(userDocRef, newUserData);
    devLog('User document created');
    
    // Return the new user data
    return {
      id: firebaseUser.uid,
      email: normalizedEmail,
      displayName: newUserData.displayName,
      photoURL: firebaseUser.photoURL || undefined,
      phoneNumber: firebaseUser.phoneNumber || undefined,
      createdAt: new Date().toISOString(),
      role: 'user',
      profile: undefined,
      emailVerified: firebaseUser.emailVerified ?? false,
    };
  }

  // Convert Date to ISO string for Redux serialization
  const createdAt = userData?.createdAt?.toDate?.() || new Date();
  
  // Normalize email to lowercase for consistency
  const normalizedEmail = (firebaseUser.email || '').toLowerCase();

  return {
    id: firebaseUser.uid,
    email: normalizedEmail,
    displayName: firebaseUser.displayName || userData?.displayName || '',
    photoURL: firebaseUser.photoURL || userData?.photoURL,
    phoneNumber: firebaseUser.phoneNumber || userData?.phoneNumber,
    createdAt: createdAt.toISOString(),
    role: userData?.role || 'user',
    profile: userData?.profile,
    emailVerified: firebaseUser.emailVerified ?? false,
  };
};

// Sign in with email and password
export const signIn = async (email: string, password: string): Promise<User> => {
  // Normalize email to lowercase for consistency
  const normalizedEmail = email.trim().toLowerCase();
  
  try {
    const userCredential = await signInWithEmailAndPassword(auth, normalizedEmail, password);
    
    const user = await convertFirebaseUser(userCredential.user);
    if (!user) {
      throw new Error('Your session has expired. Please sign in again.');
    }
    
    const userDocRef = doc(firestore, COLLECTIONS.USERS, userCredential.user.uid);
    await updateDoc(userDocRef, {
      lastLoginAt: serverTimestamp(),
    });
    
    return user;
  } catch (error: any) {
    if (typeof __DEV__ !== 'undefined' && __DEV__) {
      console.error('Firebase auth error:', error?.code, error?.message);
    }
    
    // Handle user not found
    if (error.code === 'auth/user-not-found') {
      throw new Error('No account found with this email. Please sign up instead.');
    }
    
    // Handle wrong password
    if (error.code === 'auth/wrong-password') {
      throw new Error('Incorrect password. Please try again.');
    }
    
    // Handle invalid email
    if (error.code === 'auth/invalid-email') {
      throw new Error('Please enter a valid email address.');
    }
    
    // Re-throw other errors
    throw error;
  }
};

// Sign up with email and password
export const signUp = async (
  email: string,
  password: string,
  displayName: string
): Promise<User> => {
  try {
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const normalizedEmail = email.trim().toLowerCase();
    if (!emailRegex.test(normalizedEmail)) {
      throw new Error('Please enter a valid email address');
    }
    if (isDisposableEmail(normalizedEmail)) {
      throw new Error('Please use a permanent email address. Temporary or disposable email addresses are not allowed.');
    }

    const userCredential = await createUserWithEmailAndPassword(auth, normalizedEmail, password);
    const user = userCredential.user;

    const now = new Date();

    // Create user document in Firestore
    const userData: Partial<User> = {
      id: user.uid,
      email: normalizedEmail,
      displayName,
      createdAt: now.toISOString(),
      role: 'user',
    };

    await setDoc(doc(firestore, COLLECTIONS.USERS, user.uid), {
      ...userData,
      email: normalizedEmail, // Ensure normalized email is stored
      createdAt: serverTimestamp(),
      lastLoginAt: serverTimestamp(), // Track login time for session expiration
    });

    // Send verification email (standard practice; improves deliverability and trust)
    try {
      await sendEmailVerification(user);
    } catch (veErr: any) {
      if (typeof __DEV__ !== 'undefined' && __DEV__) console.warn('sendEmailVerification failed:', veErr?.code, veErr?.message);
    }

    return {
      ...userData,
      createdAt: now.toISOString(),
      emailVerified: user.emailVerified ?? false,
    } as User;
  } catch (error: any) {
    if (typeof __DEV__ !== 'undefined' && __DEV__) {
      console.error('Firebase signup error:', error?.code, error?.message);
    }
    
    // Handle duplicate email error
    if (error.code === 'auth/email-already-in-use') {
      throw new Error('This email is already registered. Please sign in instead.');
    }
    
    // Handle weak password
    if (error.code === 'auth/weak-password') {
      throw new Error('Password should be at least 6 characters long.');
    }
    
    // Handle invalid email
    if (error.code === 'auth/invalid-email') {
      throw new Error('Please enter a valid email address.');
    }
    
    // Re-throw other errors with friendly message
    throw new Error(error.message || 'Failed to create account. Please try again.');
  }
};

// Sign in with Google
// Gets ID token from getGoogleIdToken() (implement in src/utils/googleSignIn.ts with expo-auth-session or @react-native-google-signin/google-signin).
export const signInWithGoogle = async (idToken?: string): Promise<User> => {
  const token = idToken ?? (await getGoogleIdToken());
  if (!token?.trim()) {
    throw new Error('Google Sign-In was cancelled or failed to return a token.');
  }

  const credential = GoogleAuthProvider.credential(token);
  const userCredential = await signInWithCredential(auth, credential);
  const user = await convertFirebaseUser(userCredential.user);
  
  if (!user) {
    throw new Error('Failed to get user data');
  }
  
  // Update last login timestamp
  const userDocRef = doc(firestore, COLLECTIONS.USERS, userCredential.user.uid);
  await updateDoc(userDocRef, {
    lastLoginAt: serverTimestamp(),
  });

  // Create user document if it doesn't exist
  const userDoc = await getDoc(doc(firestore, COLLECTIONS.USERS, user.id));
  if (!userDoc.exists()) {
    await setDoc(doc(firestore, COLLECTIONS.USERS, user.id), {
      ...user,
      createdAt: serverTimestamp(),
    });
  }

  return user;
};

// Sign in with phone number — not yet implemented. See docs/PHONE_AUTH_SETUP.md.
export const signInWithPhone = async (phoneNumber: string, verificationCode?: string): Promise<string | void> => {
  throw new Error(
    'Phone authentication is not implemented yet. See docs/PHONE_AUTH_SETUP.md for how to add it.'
  );
};

// Sign out
export const signOut = async (): Promise<void> => {
  await firebaseSignOut(auth);
};

// Get current user (resolve null on error so app can show auth screen in CI / invalid config)
export const getCurrentUser = (): Promise<User | null> => {
  return new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      unsubscribe();
      try {
        if (firebaseUser) {
          try {
            await reload(firebaseUser);
          } catch {
            // Ignore reload errors (e.g. network); use cached user
          }
          const user = await convertFirebaseUser(firebaseUser);
          resolve(user);
        } else {
          resolve(null);
        }
      } catch {
        resolve(null);
      }
    });
  });
};

/** Resend verification email to the current user. Use when emailVerified is false. */
export const resendVerificationEmail = async (): Promise<void> => {
  const firebaseUser = auth.currentUser;
  if (!firebaseUser) throw new Error('Not signed in');
  await sendEmailVerification(firebaseUser);
};

// Listen to auth state changes (catch so app still shows auth screen in CI / invalid config)
export const onAuthStateChange = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, async (firebaseUser) => {
    try {
      if (firebaseUser) {
        const user = await convertFirebaseUser(firebaseUser);
        callback(user);
      } else {
        callback(null);
      }
    } catch (e) {
      if (typeof __DEV__ !== 'undefined' && __DEV__) console.warn('Auth state check failed:', (e as Error)?.message);
      callback(null);
    }
  });
};

// Update Firebase Auth profile (displayName, photoURL)
export const updateFirebaseAuthProfile = async (updates: {
  displayName?: string;
  photoURL?: string | null;
}): Promise<void> => {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    throw new Error('No authenticated user');
  }

  const updateData: any = {};
  if (updates.displayName !== undefined) {
    updateData.displayName = updates.displayName;
  }
  if (updates.photoURL !== undefined) {
    updateData.photoURL = updates.photoURL;
  }

  await firebaseUpdateProfile(currentUser, updateData);
};

// Update Firestore user document
export const updateFirestoreUser = async (
  userId: string,
  updates: {
    displayName?: string;
    phoneNumber?: string | null;
    photoURL?: string | null;
  }
): Promise<void> => {
  const userDocRef = doc(firestore, COLLECTIONS.USERS, userId);
  const updateData: any = {};

  if (updates.displayName !== undefined) {
    updateData.displayName = updates.displayName;
  }
  if (updates.phoneNumber !== undefined) {
    updateData.phoneNumber = updates.phoneNumber;
  }
  if (updates.photoURL !== undefined) {
    updateData.photoURL = updates.photoURL;
  }

  await updateDoc(userDocRef, updateData);
};

// Delete all user data from Firestore collections
const deleteUserDataFromFirestore = async (userId: string): Promise<void> => {
  // Delete user document
  const userDocRef = doc(firestore, COLLECTIONS.USERS, userId);
  await deleteDoc(userDocRef);

  // Delete user's posts
  const postsRef = collection(firestore, COLLECTIONS.POSTS);
  const postsQuery = query(postsRef, where('userId', '==', userId));
  const postsSnapshot = await getDocs(postsQuery);
  const deletePostPromises = postsSnapshot.docs.map((doc) => deleteDoc(doc.ref));
  await Promise.all(deletePostPromises);

  // Delete user's requests
  const requestsRef = collection(firestore, COLLECTIONS.REQUESTS);
  const requestsQuery = query(requestsRef, where('userId', '==', userId));
  const requestsSnapshot = await getDocs(requestsQuery);
  const deleteRequestPromises = requestsSnapshot.docs.map((doc) => deleteDoc(doc.ref));
  await Promise.all(deleteRequestPromises);

  // Delete user's matrimonial profile
  const matrimonialRef = collection(firestore, COLLECTIONS.MATRIMONIAL_PROFILES);
  const matrimonialQuery = query(matrimonialRef, where('userId', '==', userId));
  const matrimonialSnapshot = await getDocs(matrimonialQuery);
  const deleteMatrimonialPromises = matrimonialSnapshot.docs.map((doc) => deleteDoc(doc.ref));
  await Promise.all(deleteMatrimonialPromises);
};

// Delete all user data from Storage
const deleteUserDataFromStorage = async (userId: string): Promise<void> => {
  try {
    // Delete profile photos
    const profilePhotosRef = ref(storage, `profiles/${userId}`);
    try {
      const profilePhotosList = await listAll(profilePhotosRef);
      const deleteProfilePhotoPromises = profilePhotosList.items.map((item) => deleteObject(item));
      await Promise.all(deleteProfilePhotoPromises);
    } catch (err) {
      devLog('Profile photos folder not found or already deleted');
    }

    // Delete post images
    const postsRef = ref(storage, `posts/${userId}`);
    try {
      const postsList = await listAll(postsRef);
      const deletePostPromises = postsList.items.map((item) => deleteObject(item));
      await Promise.all(deletePostPromises);
    } catch (err) {
      devLog('Posts folder not found or already deleted');
    }

    // Delete temp images
    const tempRef = ref(storage, `posts/temp`);
    try {
      const tempList = await listAll(tempRef);
      const tempItems = tempList.items.filter((item) => item.name.startsWith(`${userId}_`));
      const deleteTempPromises = tempItems.map((item) => deleteObject(item));
      await Promise.all(deleteTempPromises);
    } catch (err) {
      devLog('Temp folder not found or already deleted');
    }
  } catch (err) {
    if (typeof __DEV__ !== 'undefined' && __DEV__) console.error('Error deleting user data from storage:', err);
    // Continue with account deletion even if storage deletion fails
  }
};

// Delete user account completely (Firebase Auth + Firestore + Storage)
export const deleteAccount = async (): Promise<void> => {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    throw new Error('No authenticated user');
  }

  const userId = currentUser.uid;

  try {
    // 1. Delete user data from Firestore
    await deleteUserDataFromFirestore(userId);

    // 2. Delete user data from Storage
    await deleteUserDataFromStorage(userId);

    // 3. Delete Firebase Auth account (this will sign out the user automatically)
    await deleteUser(currentUser);

    // 4. Sign out (as a safety measure, though deleteUser should do this)
    await firebaseSignOut(auth);
  } catch (error: any) {
    if (typeof __DEV__ !== 'undefined' && __DEV__) console.error('Error deleting account:', error);
    throw new Error(error.message || 'Failed to delete account. Please try again.');
  }
};

// Change user password
export const changePassword = async (
  currentPassword: string,
  newPassword: string
): Promise<void> => {
  const currentUser = auth.currentUser;
  if (!currentUser || !currentUser.email) {
    throw new Error('No authenticated user');
  }

  try {
    // 1. Re-authenticate user with current password
    const credential = EmailAuthProvider.credential(currentUser.email, currentPassword);
    await reauthenticateWithCredential(currentUser, credential);

    // 2. Update password
    await updatePassword(currentUser, newPassword);
  } catch (error: any) {
    if (typeof __DEV__ !== 'undefined' && __DEV__) console.error('Error changing password:', error);
    
    // Provide user-friendly error messages
    if (error.code === 'auth/wrong-password') {
      throw new Error('Current password is incorrect');
    } else if (error.code === 'auth/weak-password') {
      throw new Error('New password is too weak. Please use at least 6 characters.');
    } else if (error.code === 'auth/requires-recent-login') {
      throw new Error('For security, please sign out and sign in again before changing your password.');
    } else {
      throw new Error(error.message || 'Failed to change password. Please try again.');
    }
  }
};
