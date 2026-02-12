import React from 'react';
import { View, StyleSheet, ActivityIndicator, Platform } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import { Colors } from '../constants/theme';

const PANJA_KHADA_URL = 'https://panjakhada.com';

const PanjaKhadaScreen = () => {
  return (
    <SafeAreaView style={styles.container} edges={['bottom', 'left', 'right']}>
      <WebView
        source={{ uri: PANJA_KHADA_URL }}
        style={styles.webview}
        startInLoadingState={true}
        renderLoading={() => (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.tertiary} />
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primaryBackground,
  },
  webview: {
    flex: 1,
    backgroundColor: Colors.primaryBackground,
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.primaryBackground,
  },
});

export default PanjaKhadaScreen;
