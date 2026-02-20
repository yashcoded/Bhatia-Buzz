/**
 * Stub responses for E2E tests so we do not hit live APIs (Firebase, Hugging Face, Instagram).
 * Use these in route interception to avoid cost and flakiness.
 */

/** Firebase Auth: no user / invalid token - app shows login */
export const FIREBASE_AUTH_STUB = { users: [] };

/** Firebase Auth token endpoint - return 401 so SDK treats as signed out */
export const FIREBASE_AUTH_TOKEN_STUB = () => ({ error: { message: 'INVALID_CREDENTIAL', code: 401 } });

/** Firestore runQuery: empty result */
export const FIRESTORE_STUB = () => [{ document: null, skippedResults: 0 }];

/** Hugging Face face detection: one face detected (for matrimonial flow) */
export const HUGGING_FACE_FACE_STUB = () => [
  { label: 'face', box: { xmin: 10, ymin: 10, xmax: 100, ymax: 100 }, score: 0.95 },
];

/** Instagram Graph API: empty feed */
export const INSTAGRAM_STUB = () => ({ data: [], paging: {} });

/** Firebase Storage: empty list (no files) */
export const FIREBASE_STORAGE_STUB = () => ({ items: [] });
