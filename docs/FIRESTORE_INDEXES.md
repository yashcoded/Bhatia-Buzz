# Firestore Composite Indexes

## Required Indexes

The app requires the following composite indexes in Firestore for optimal performance.

### Matrimonial Profiles Index

**Collection:** `matrimonialProfiles`  
**Fields:**
- `status` (Ascending)
- `createdAt` (Descending)

**Why:** Used to query approved profiles sorted by creation date.

**Status:** The app has a fallback that performs client-side sorting if the index doesn't exist. The warning can be safely ignored, but creating the index improves performance.

### How to Create Indexes

#### Option 1: Automatic (Recommended)
When you first run a query that requires an index, Firebase Console will show a link to create it automatically. Click the link to create the index.

#### Option 2: Manual Creation
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Navigate to **Firestore Database** > **Indexes**
4. Click **Create Index**
5. Fill in:
   - Collection ID: `matrimonialProfiles`
   - Fields:
     - Field: `status`, Order: `Ascending`
     - Field: `createdAt`, Order: `Descending`
6. Click **Create**

### Current Status

✅ **Client-side fallback implemented** - The app works without the index, sorting profiles on the client side. Creating the index improves query performance for large datasets.

---

**Note:** The console warning about the composite index is informational only. The app functions correctly with client-side sorting as a fallback.
