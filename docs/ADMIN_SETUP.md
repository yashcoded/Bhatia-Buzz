# Admin Setup Guide

This guide explains how to set up admin users for the Bhatia Buzz app.

## What Admins Can Do

- **Feed**: Create new posts using the floating action button (FAB)
- **Requests**: Approve/reject condolence and celebration requests
- **Matrimonial**: Approve/reject matrimonial profiles

## How User Documents Are Created

The app **automatically creates a user document** in Firestore when a user signs in for the first time. This means:
- You don't need to manually create the `users` collection
- Just sign in with any account, and a document will be created with `role: "user"`
- Then you can change the role to `"admin"` in the Firebase Console

## Setting Up Admin Users

### Method 1: Firebase Console (Recommended for first admin)

**Step 1: Sign in to the app first**
- Open the app and sign in with your email/password
- This automatically creates your user document in Firestore

**Step 2: Make yourself admin in Firebase Console**
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project (`bhatia-buzz`)
3. Navigate to **Firestore Database** → **Data**
4. You should now see the `users` collection (created when you signed in)
5. Click on your user document (it will have your user ID as the document name)
6. Find the `role` field and click the pencil icon to edit
7. Change the value from `user` to `admin`
8. Click **Update**

**Step 3: Sign out and sign back in**
- In the app, go to Profile → Sign Out
- Sign back in
- You should now see the **+ button** on the Feed screen!

### Method 2: Using Firebase Admin SDK (For automation)

If you have a backend/Cloud Functions, you can use the Admin SDK:

```javascript
const admin = require('firebase-admin');

async function makeUserAdmin(userId) {
  await admin.firestore()
    .collection('users')
    .doc(userId)
    .update({ role: 'admin' });
}
```

### Method 3: Cloud Function Trigger (For self-service)

Create a Cloud Function that promotes specific email addresses to admin:

```javascript
// functions/index.js
const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

// List of admin email addresses
const ADMIN_EMAILS = [
  'admin@example.com',
  'owner@bhatiabuzz.com',
];

exports.setAdminRole = functions.firestore
  .document('users/{userId}')
  .onCreate(async (snap, context) => {
    const user = snap.data();
    
    if (ADMIN_EMAILS.includes(user.email)) {
      await snap.ref.update({ role: 'admin' });
      console.log(`Made ${user.email} an admin`);
    }
  });
```

## Firestore Security Rules for Admin

Make sure your `firestore.rules` includes admin checks:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper function to check if user is admin
    function isAdmin() {
      return request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // Posts - anyone can read, only admins can create/update/delete
    match /posts/{postId} {
      allow read: if true;
      allow create, update, delete: if isAdmin();
    }
    
    // Requests - users can create, admins can update status
    match /requests/{requestId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update: if isAdmin();
      allow delete: if isAdmin();
    }
    
    // Matrimonial profiles - users can create their own, admins can update status
    match /matrimonialProfiles/{profileId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
      allow update: if isAdmin() || request.auth.uid == resource.data.userId;
      allow delete: if isAdmin();
    }
  }
}
```

## Verifying Admin Status

After setting up an admin user:

1. Sign out of the app
2. Sign back in with the admin account
3. Go to the **Feed** tab
4. You should see a **floating + button** in the bottom-right corner
5. Tap it to create a new post

## Troubleshooting

### FAB not showing?

1. Check the user's `role` field in Firestore is exactly `"admin"` (lowercase)
2. Sign out and sign back in to refresh the user data
3. Check the console logs for the user object

### Permission denied when creating posts?

1. Make sure Firestore rules are deployed: `firebase deploy --only firestore:rules`
2. Verify the user document has `role: "admin"`

### How to find a user's ID?

1. Go to Firebase Console → Authentication → Users
2. Find the user by email
3. Copy the **User UID** column value
4. Use this ID to find/update the document in Firestore → users collection

## Quick Start: Make yourself admin

1. Sign up/sign in to the app with your email
2. Go to Firebase Console → Firestore → users
3. Find your user document (search by email in the data)
4. Click the document, then click "Edit field"
5. Change `role` from `user` to `admin`
6. Save
7. Sign out and sign back in to the app
8. You should now see the + button on the Feed screen!

