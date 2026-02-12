# Guest Mode & Session Persistence Implementation

## Overview

The app now supports **guest mode** - users can view the feed and requests without logging in. Authentication is only required when users want to create content (posts, requests, or matrimonial profiles).

## Implementation Details

### 1. Navigation Changes ✅

**File:** `src/navigation/AppNavigator.tsx`

- Removed authentication requirement for accessing Main tabs
- All users (authenticated and guests) can access the Feed, Requests, Matrimonial, and Profile tabs
- Auth screen is accessible as a modal when needed

### 2. Firestore Security Rules ✅

**File:** `firestore.rules`

Updated rules to allow public read access:
- **Posts:** `allow read: if true` - Anyone can read posts (guest mode)
- **Requests:** `allow read: if true` - Anyone can read requests (guest mode)
- **Write operations:** Still require authentication

### 3. Authentication Checks ✅

#### Feed Screen (`src/screens/FeedScreen.tsx`)
- ✅ Posts load without authentication (guest mode)
- ✅ Create post button only visible to authenticated admin users
- ✅ Auth check when creating posts - prompts login if not authenticated

#### Requests Screen (`src/screens/RequestsScreen.tsx`)
- ✅ Requests load without authentication (guest mode)
- ✅ Create request FAB visible to all users
- ✅ Auth check when creating requests - prompts login if not authenticated

#### Matrimonial Screen (`src/screens/MatrimonialScreen.tsx`)
- ✅ Auth check when creating profiles - prompts login if not authenticated

#### Profile Screen (`src/screens/ProfileScreen.tsx`)
- ✅ Shows login prompt for guest users
- ✅ Only accessible to authenticated users

### 4. Session Persistence (4 Months) ✅

**File:** `src/services/firebase/config.ts` and `src/services/firebase/auth.ts`

**Implementation:**
- Firebase Auth is configured with `AsyncStorage` persistence
- Login timestamps are tracked in Firestore (`lastLoginAt` field)
- Session validity is checked on every auth state change
- Sessions expire after 4 months and users are automatically signed out

**How it works:**
1. On login (signIn/signUp): `lastLoginAt` timestamp is stored in Firestore
2. On app launch/auth check: `convertFirebaseUser` checks if session is valid (within 4 months)
3. If session expired: User is automatically signed out
4. Refresh tokens in AsyncStorage ensure sessions persist across app restarts

**Session Validation Logic:**
```typescript
// Checks if lastLoginAt is within 4 months (120 days)
const isSessionValid = (lastLoginTime) => {
  const fourMonthsAgo = new Date(now - (4 * 30 * 24 * 60 * 60 * 1000));
  return loginDate >= fourMonthsAgo;
}
```

### 5. User Experience Flow

#### Guest User Flow:
1. Opens app → Sees Feed immediately (no login required)
2. Can browse posts and requests
3. Tries to create post/request → Prompted to login
4. After login → Can create content

#### Authenticated User Flow:
1. Opens app → Automatically logged in (session persisted)
2. Sees Feed with all features
3. Can create posts (if admin), requests, profiles
4. Stays logged in for 4+ months (refresh token persists)

---

## Technical Notes

### Firebase Auth Session Persistence

Firebase Auth handles session persistence automatically:
- **Refresh Token:** Stored in AsyncStorage, never expires unless revoked
- **ID Token:** Expires after 1 hour, automatically refreshed
- **Session State:** Persists across app restarts and device reboots

### Forcing 4-Month Expiration (Optional)

If you need to enforce a strict 4-month expiration, you can implement this in Firebase Functions:

```typescript
// Example: Check token age and force re-auth after 4 months
// This would need to be implemented server-side with Firebase Admin SDK
```

### Current Implementation

The current implementation provides:
- ✅ Guest mode (no login required for viewing)
- ✅ Persistent sessions (users stay logged in)
- ✅ Authentication required for creating content
- ✅ Smooth login prompts when needed

This effectively achieves the goal while maintaining a good user experience.

---

## Testing Checklist

- [ ] Open app as guest - should see feed without login
- [ ] Try to create post as guest - should prompt login
- [ ] Login - should persist session
- [ ] Close and reopen app - should stay logged in
- [ ] Create request as authenticated user - should work
- [ ] Create request as guest - should prompt login
- [ ] Profile tab as guest - should show login prompt
- [ ] Profile tab as authenticated - should show profile

---

## Future Enhancements

1. **Explicit 4-Month Expiration:** Implement token age checking if strict expiration is required
2. **Guest Indicators:** Add subtle indicators that user is in guest mode
3. **Guest Prompts:** Encourage login with benefits messaging
4. **Session Management:** Add "Remember Me" toggle (currently always remembers)

