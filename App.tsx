import React, { useEffect } from 'react';
import { Provider } from 'react-redux';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { store } from './src/store';
import AppNavigator from './src/navigation/AppNavigator';
import { useDesignSystemFonts } from './src/utils/fonts';
import { useTheme } from './src/utils/theme';
import { setAppearance } from './src/store/slices/appearanceSlice';
import { APPEARANCE_STORAGE_KEY } from './src/store/slices/appearanceSlice';
import type { AppearancePreference } from './src/store/slices/appearanceSlice';
import './src/i18n/config'; // Initialize i18n

function AppContent() {
  const fontsLoaded = useDesignSystemFonts();
  const { colors } = useTheme();

  useEffect(() => {
    AsyncStorage.getItem(APPEARANCE_STORAGE_KEY).then((value) => {
      if (value === 'light' || value === 'dark' || value === 'system') {
        store.dispatch(setAppearance(value as AppearancePreference));
      }
    });
  }, []);

  if (!fontsLoaded) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.primaryBackground }]}>
        <ActivityIndicator size="large" color={colors.tertiary} />
      </View>
    );
  }

  return <AppNavigator />;
}

export default function App() {
  return (
    <SafeAreaProvider>
      <Provider store={store}>
        <AppContent />
      </Provider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F2F2F2',
  },
});
