/**
 * Google Sign-In using expo-auth-session (OAuth 2.0 + PKCE).
 * Requires EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID in .env.
 * See docs/GOOGLE_SIGNIN_SETUP.md for setup.
 */

import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import * as Crypto from 'expo-crypto';
import { Platform } from 'react-native';

// Required for WebBrowser to complete auth session on web
if (Platform.OS === 'web') {
  WebBrowser.maybeCompleteAuthSession();
}

const GOOGLE_DISCOVERY = {
  authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
  tokenEndpoint: 'https://oauth2.googleapis.com/token',
};

const SCOPES = ['openid', 'profile', 'email'];

function getGoogleClientId(): string {
  const id =
    process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID ||
    (typeof global !== 'undefined' && (global as any).expo?.config?.extra?.google?.webClientId);
  if (!id?.trim()) {
    throw new Error(
      'Google Web Client ID is not set. Add EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID to .env. See docs/GOOGLE_SIGNIN_SETUP.md.'
    );
  }
  return id.trim();
}

function base64UrlEncode(bytes: Uint8Array): string {
  const base64 = btoa(String.fromCharCode(...bytes));
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

async function generateCodeVerifier(): Promise<string> {
  const bytes = await Crypto.getRandomBytesAsync(32);
  return base64UrlEncode(bytes);
}

async function sha256Base64Url(input: string): Promise<string> {
  const digest = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    input,
    { encoding: Crypto.CryptoEncoding.BASE64 }
  );
  return digest.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

/**
 * Opens Google OAuth and returns the Google ID token for Firebase.
 */
export const getGoogleIdToken = async (): Promise<string> => {
  const clientId = getGoogleClientId();
  const redirectUri = AuthSession.makeRedirectUri({
    scheme: undefined,
    path: undefined,
    useProxy: false,
  });

  const codeVerifier = await generateCodeVerifier();
  const codeChallenge = await sha256Base64Url(codeVerifier);
  const state = await generateCodeVerifier();

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: SCOPES.join(' '),
    state,
    code_challenge: codeChallenge,
    code_challenge_method: 'S256',
  });

  const authUrl = `${GOOGLE_DISCOVERY.authorizationEndpoint}?${params.toString()}`;

  const result = await WebBrowser.openAuthSessionAsync(authUrl, redirectUri, {
    preferEphemeralSession: true,
  });

  if (result.type !== 'success' || !result.url) {
    if (result.type === 'cancel' || result.type === 'dismiss') {
      throw new Error('Google Sign-In was cancelled.');
    }
    throw new Error('Google Sign-In failed. Please try again.');
  }

  const url = result.url;
  const parsed = new URL(url);
  const code = parsed.searchParams.get('code');
  const returnedState = parsed.searchParams.get('state');

  if (returnedState !== state) {
    throw new Error('Invalid state returned. Please try again.');
  }
  if (!code) {
    throw new Error('No authorization code received. Please try again.');
  }

  const tokenParams = new URLSearchParams({
    client_id: clientId,
    code,
    code_verifier: codeVerifier,
    grant_type: 'authorization_code',
    redirect_uri: redirectUri,
  });

  const tokenRes = await fetch(GOOGLE_DISCOVERY.tokenEndpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: tokenParams.toString(),
  });

  if (!tokenRes.ok) {
    const errText = await tokenRes.text();
    console.error('Google token exchange failed:', tokenRes.status, errText);
    throw new Error('Failed to complete Google Sign-In. Please try again.');
  }

  const tokenData = await tokenRes.json();
  const idToken = tokenData.id_token;
  if (!idToken) {
    throw new Error('Google did not return an ID token. Please try again.');
  }

  return idToken;
};
