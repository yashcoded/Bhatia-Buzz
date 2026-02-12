import Constants from 'expo-constants';

type ExpoExtra = {
  firebase?: {
    apiKey?: string;
    authDomain?: string;
    projectId?: string;
    storageBucket?: string;
    messagingSenderId?: string;
    appId?: string;
  };
  instagram?: {
    accessToken?: string;
  };
};

const extra = (Constants.expoConfig?.extra ?? {}) as ExpoExtra;

// Firebase Configuration
// Primary source: app.config.ts -> expo.extra.firebase
// Fallback: process.env for web tooling
export const firebaseConfig = {
  apiKey:
    extra.firebase?.apiKey ||
    process.env.EXPO_PUBLIC_FIREBASE_API_KEY ||
    'your-api-key',
  authDomain:
    extra.firebase?.authDomain ||
    process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN ||
    'your-auth-domain',
  projectId:
    extra.firebase?.projectId ||
    process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID ||
    'your-project-id',
  storageBucket:
    extra.firebase?.storageBucket ||
    process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET ||
    'your-storage-bucket',
  messagingSenderId:
    extra.firebase?.messagingSenderId ||
    process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ||
    'your-sender-id',
  appId:
    extra.firebase?.appId ||
    process.env.EXPO_PUBLIC_FIREBASE_APP_ID ||
    'your-app-id',
};

// Instagram API Configuration
export const instagramConfig = {
  accessToken:
    extra.instagram?.accessToken ||
    process.env.EXPO_PUBLIC_INSTAGRAM_ACCESS_TOKEN ||
    '',
  apiUrl: 'https://graph.instagram.com',
  version: 'v18.0',
};

// App Configuration
export const appConfig = {
  name: 'Bhatia Buzz',
  version: '1.0.0',
  cacheTimeout: 3600000, // 1 hour in milliseconds
  paginationLimit: 20,
  /** Optional: URL to docs (e.g. GitHub repo docs folder) for "View docs online" in About screen */
  docsBaseUrl: process.env.EXPO_PUBLIC_DOCS_BASE_URL || '',
};

// Contact Information (Configurable)
export const contactInfo = {
  privacyEmail: process.env.EXPO_PUBLIC_PRIVACY_EMAIL || 'privacy@bhatiabuzz.com',
  legalEmail: process.env.EXPO_PUBLIC_LEGAL_EMAIL || 'legal@bhatiabuzz.com',
  supportEmail: process.env.EXPO_PUBLIC_SUPPORT_EMAIL || 'support@bhatiabuzz.com',
};

// Hugging Face API Configuration
export const huggingFaceConfig = {
  apiToken: process.env.EXPO_PUBLIC_HUGGING_FACE_TOKEN || '',
  modelName: 'HamedSarraf/Face-Detection',
  apiUrl: 'https://api-inference.huggingface.co/models',
};

// Collection Names
export const COLLECTIONS = {
  USERS: 'users',
  POSTS: 'posts',
  REQUESTS: 'requests',
  MATRIMONIAL_PROFILES: 'matrimonialProfiles',
  MATCHES: 'matches',
  COMMENTS: 'comments',
  REPORTS: 'reports',
} as const;

