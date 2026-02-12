import 'dotenv/config';
import type { ExpoConfig, ConfigContext } from 'expo/config';

function pick(key: string, fallback = ''): string {
  const v = process.env[key];
  return typeof v === 'string' ? v : fallback;
}

export default ({ config }: ConfigContext): ExpoConfig => {
  // Firebase and Instagram: from env only (never commit real values).
  // Local: .env (EXPO_PUBLIC_*). GitHub Actions: workflow env from GitHub Secrets.
  const extraFromEnv = {
    firebase: {
      apiKey: pick('EXPO_PUBLIC_FIREBASE_API_KEY'),
      authDomain: pick('EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN'),
      projectId: pick('EXPO_PUBLIC_FIREBASE_PROJECT_ID'),
      storageBucket: pick('EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET'),
      messagingSenderId: pick('EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID'),
      appId: pick('EXPO_PUBLIC_FIREBASE_APP_ID'),
    },
    instagram: {
      accessToken: pick('EXPO_PUBLIC_INSTAGRAM_ACCESS_TOKEN'),
    },
  };

  return {
    name: config.name || 'Bhatia Buzz',
    slug: config.slug || 'Bhatia-Buzz',
    ...config,
    extra: {
      ...(config.extra ?? {}),
      ...extraFromEnv,
    },
    android: {
      ...config.android,
      package: 'com.bhatiabuzz.app',
    },
    // iOS permissions for image picker
    ios: config.ios
      ? {
          ...config.ios,
          bundleIdentifier: 'com.bhatiabuzz.app',
          infoPlist: {
            ...config.ios.infoPlist,
            NSPhotoLibraryUsageDescription:
              'This app needs access to your photo library to upload images for posts.',
            NSPhotoLibraryAddUsageDescription:
              'This app needs access to save photos to your library.',
            NSLocationWhenInUseUsageDescription:
              'Your region is used to show the correct age requirement for signup (e.g. 16+ in EU).',
          },
        }
      : {
          bundleIdentifier: 'com.bhatiabuzz.app',
          infoPlist: {
            NSPhotoLibraryUsageDescription:
              'This app needs access to your photo library to upload images for posts.',
            NSPhotoLibraryAddUsageDescription:
              'This app needs access to save photos to your library.',
            NSLocationWhenInUseUsageDescription:
              'Your region is used to show the correct age requirement for signup (e.g. 16+ in EU).',
          },
        },
    // Android permissions are handled automatically by expo-image-picker
    plugins: [
      ...(config.plugins || []),
      'expo-localization',
      [
        'expo-location',
        {
          locationWhenInUsePermission:
            'Your region is used to show the correct age requirement for signup (e.g. 16+ in EU).',
        },
      ],
    ],
  };
};


