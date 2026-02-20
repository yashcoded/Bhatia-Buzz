/**
 * Stub responses for E2E tests so we do not hit live APIs (Firebase, Hugging Face, Instagram).
 * Use these in Playwright route interception to avoid cost and flakiness.
 * For unit tests (Jest) with axios, use moxios to stub the same endpoints.
 */

/** Firebase Auth: no user / invalid token - app shows login */
export const FIREBASE_AUTH_STUB = { users: [] };

/** Firebase Auth token endpoint - return 401 so SDK treats as signed out */
export const FIREBASE_AUTH_TOKEN_STUB = (): Record<string, unknown> => ({
  error: { message: 'INVALID_CREDENTIAL', code: 401 },
});

/** Firestore runQuery: empty result (valid RunQueryResponse array) */
export const FIRESTORE_STUB = (): Array<{ document: null; skippedResults?: number }> => [
  { document: null, skippedResults: 0 },
];

/** Firestore batchGet / commit: success with no writes (avoids write errors in E2E) */
export const FIRESTORE_BATCH_STUB = (): Record<string, unknown> => ({
  writeResults: [],
  commitTime: new Date().toISOString(),
});

/** Hugging Face face detection: one face detected (for matrimonial flow) */
export const HUGGING_FACE_FACE_STUB = (): Array<{ label: string; box: Record<string, number>; score: number }> => [
  { label: 'face', box: { xmin: 10, ymin: 10, xmax: 100, ymax: 100 }, score: 0.95 },
];

/** Instagram Graph API: empty feed */
export const INSTAGRAM_STUB = (): Record<string, unknown> => ({ data: [], paging: {} });

/** Firebase Storage: empty list (no files) */
export const FIREBASE_STORAGE_STUB = (): Record<string, unknown> => ({ items: [] });

/** Generic 200 JSON stub for any unexpected API (avoid real calls) */
export const GENERIC_OK_STUB = (): Record<string, unknown> => ({ ok: true });
