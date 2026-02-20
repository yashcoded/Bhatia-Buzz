import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';
import { Platform } from 'react-native';
import { firebaseConfig } from '../../constants/config';

let app: FirebaseApp;
let auth: Auth;
let firestore: Firestore;
let storage: FirebaseStorage;

// Initialize Firebase only if it hasn't been initialized
if (getApps().length === 0) {
  try {
    app = initializeApp(firebaseConfig);

    // Use AsyncStorage persistence on React Native so auth survives app restarts
    if (Platform.OS === 'web') {
      auth = getAuth(app);
    } else {
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      const { initializeAuth, getReactNativePersistence } = require('firebase/auth');
      auth = initializeAuth(app, {
        persistence: getReactNativePersistence(AsyncStorage),
      });
    }

    firestore = getFirestore(app);
    storage = getStorage(app);
  } catch (error: any) {
    if (typeof __DEV__ !== 'undefined' && __DEV__) {
      console.error('Firebase initialization error:', error?.code, error?.message);
    }
    throw error;
  }
} else {
  app = getApps()[0];
  auth = getAuth(app);
  firestore = getFirestore(app);
  storage = getStorage(app);
}

export { app, auth, firestore, storage };

