import React from 'react';
import { View, StyleSheet, ActivityIndicator, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import { useTheme } from '../utils/theme';

const PANJA_KHADA_URL = 'https://panjakhada.com';

const PanjaKhadaScreen = () => {
  const { colors } = useTheme();
  const themedStyles = React.useMemo(() => ({
    container: { flex: 1, backgroundColor: colors.primaryBackground },
    webview: { flex: 1, backgroundColor: colors.primaryBackground },
    loadingContainer: {
      position: 'absolute' as const,
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      justifyContent: 'center' as const,
      alignItems: 'center' as const,
      backgroundColor: colors.primaryBackground,
    },
  }), [colors]);

  return (
    <SafeAreaView style={themedStyles.container} edges={['bottom', 'left', 'right']}>
      <WebView
        source={{ uri: PANJA_KHADA_URL }}
        style={themedStyles.webview}
        startInLoadingState={true}
        renderLoading={() => (
          <View style={themedStyles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.tertiary} />
          </View>
        )}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        scalesPageToFit={true}
        // Use cache so repeat visits load from cache first (faster)
        cacheEnabled={true}
        cacheMode={Platform.OS === 'android' ? 'LOAD_CACHE_ELSE_NETWORK' : undefined}
        sharedCookiesEnabled={true}
        thirdPartyCookiesEnabled={true}
        onError={(syntheticEvent) => {
          const { nativeEvent } = syntheticEvent;
          if (__DEV__) console.error('WebView error: ', nativeEvent);
        }}
        onHttpError={(syntheticEvent) => {
          const { nativeEvent } = syntheticEvent;
          if (__DEV__) console.error('WebView HTTP error: ', nativeEvent);
        }}
      />
    </SafeAreaView>
  );
};

export default PanjaKhadaScreen;
