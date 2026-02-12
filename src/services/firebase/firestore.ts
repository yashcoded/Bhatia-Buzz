import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  Timestamp,
  QueryDocumentSnapshot,
  DocumentData,
  onSnapshot,
  Query,
} from 'firebase/firestore';
import { firestore } from './config';
import { COLLECTIONS } from '../../constants/config';
import { Post, Request, MatrimonialProfile, Match, Comment } from '../../types';

// Generic helper to convert Firestore timestamp to ISO string (Redux-safe)
const convertTimestamp = (data: any): any => {
  if (!data) return data;
  if (data instanceof Timestamp) {
    return data.toDate().toISOString();
  }
  if (typeof data === 'object') {
    const converted: any = {};
    for (const key in data) {
      if (data[key] instanceof Timestamp) {
        converted[key] = data[key].toDate().toISOString();
      } else if (Array.isArray(data[key])) {
        converted[key] = data[key].map(convertTimestamp);
      } else if (typeof data[key] === 'object' && data[key] !== null) {
        converted[key] = convertTimestamp(data[key]);
      } else {
        converted[key] = data[key];
      }
    }
    return converted;
  }
  return data;
};

// Posts
export const getPosts = async (lastDoc?: QueryDocumentSnapshot<DocumentData>): Promise<Post[]> => {
  let q: Query<DocumentData> = query(
    collection(firestore, COLLECTIONS.POSTS),
    orderBy('createdAt', 'desc'),
    limit(20)
  );

  if (lastDoc) {
    q = query(q, startAfter(lastDoc));
  }

  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...convertTimestamp(doc.data()),
  })) as Post[];
};

export const getPost = async (postId: string): Promise<Post | null> => {
  const docRef = doc(firestore, COLLECTIONS.POSTS, postId);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return {
      id: docSnap.id,
      ...convertTimestamp(docSnap.data()),
    } as Post;
  }
  return null;
};

export const createPost = async (post: Omit<Post, 'id' | 'createdAt'>): Promise<string> => {
  const docRef = await addDoc(collection(firestore, COLLECTIONS.POSTS), {
    ...post,
    createdAt: Timestamp.now(),
    likes: 0,
    comments: [],
    likedBy: [],
  });
  return docRef.id;
};

export const likePost = async (postId: string, userId: string): Promise<void> => {
  const postRef = doc(firestore, COLLECTIONS.POSTS, postId);
  const postSnap = await getDoc(postRef);
  
  if (postSnap.exists()) {
    const post = postSnap.data();
    const likedBy = post.likedBy || [];
    const isLiked = likedBy.includes(userId);
    
    await updateDoc(postRef, {
      likes: isLiked ? post.likes - 1 : post.likes + 1,
      likedBy: isLiked
        ? likedBy.filter((id: string) => id !== userId)
        : [...likedBy, userId],
    });
  }
};

export const addComment = async (
  postId: string,
  comment: Omit<Comment, 'id' | 'createdAt'>
): Promise<string> => {
  const commentRef = await addDoc(collection(firestore, COLLECTIONS.COMMENTS), {
    ...comment,
    postId,
    createdAt: Timestamp.now(),
  });

  // Update post comments count
  const postRef = doc(firestore, COLLECTIONS.POSTS, postId);
  const postSnap = await getDoc(postRef);
  if (postSnap.exists()) {
    const post = postSnap.data();
    await updateDoc(postRef, {
      comments: [...(post.comments || []), { id: commentRef.id, ...comment }],
    });
  }

  return commentRef.id;
};

// Subscribe to posts in real-time
export const subscribeToPosts = (
  callback: (posts: Post[]) => void
): (() => void) => {
  const q = query(
    collection(firestore, COLLECTIONS.POSTS),
    orderBy('createdAt', 'desc'),
    limit(20)
  );

  return onSnapshot(q, (snapshot) => {
    const posts = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...convertTimestamp(doc.data()),
    })) as Post[];
    callback(posts);
  });
};

// Requests
export const getRequests = async (type?: 'condolence' | 'celebration' | 'match'): Promise<Request[]> => {
  try {
    // Best case: indexed query (orderBy + where) so results are already sorted
    let q: Query<DocumentData> = query(
      collection(firestore, COLLECTIONS.REQUESTS),
      orderBy('createdAt', 'desc')
    );

    if (type) {
      q = query(q, where('type', '==', type));
    }

    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...convertTimestamp(doc.data()),
    })) as Request[];
  } catch (err: any) {
    // Fallback: avoid composite index requirement by removing orderBy when filtering
    if (err?.code === 'failed-precondition' && type) {
      const q = query(
        collection(firestore, COLLECTIONS.REQUESTS),
        where('type', '==', type),
        limit(50)
      );
      const snapshot = await getDocs(q);
      const requests = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...convertTimestamp(doc.data()),
      })) as Request[];

      // Sort client-side by createdAt desc (ISO strings compare lexicographically)
      return requests.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
    }
    throw err;
  }
};

export const createRequest = async (
  request: Omit<Request, 'id' | 'createdAt' | 'status' | 'adminNotified'>
): Promise<string> => {
  const docRef = await addDoc(collection(firestore, COLLECTIONS.REQUESTS), {
    ...request,
    status: 'pending',
    adminNotified: false, // Admin will be notified
    createdAt: Timestamp.now(),
  });
  return docRef.id;
};

export const updateRequestStatus = async (
  requestId: string,
  status: 'approved' | 'rejected',
  adminNotes?: string
): Promise<void> => {
  const requestRef = doc(firestore, COLLECTIONS.REQUESTS, requestId);
  await updateDoc(requestRef, {
    status,
    adminNotes,
  });
};

// Matrimonial Profiles
export const getMatrimonialProfiles = async (): Promise<MatrimonialProfile[]> => {
  try {
    // Try with composite index (status + createdAt)
    const q = query(
      collection(firestore, COLLECTIONS.MATRIMONIAL_PROFILES),
      where('status', '==', 'approved'),
      orderBy('createdAt', 'desc')
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...convertTimestamp(doc.data()),
    })) as MatrimonialProfile[];
  } catch (error: any) {
    // Fallback: if composite index doesn't exist, query without orderBy and sort client-side
    if (error?.code === 'failed-precondition') {
      // Suppress warning - client-side sorting works fine for this use case
      // To create the composite index, go to Firebase Console > Firestore > Indexes
      // Collection: matrimonialProfiles, Fields: status (Ascending), createdAt (Descending)
      const q = query(
        collection(firestore, COLLECTIONS.MATRIMONIAL_PROFILES),
        where('status', '==', 'approved')
      );

      const snapshot = await getDocs(q);
      const profiles = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...convertTimestamp(doc.data()),
      })) as MatrimonialProfile[];

      // Sort client-side by createdAt descending
      return profiles.sort((a, b) => {
        const dateA = new Date(a.createdAt).getTime();
        const dateB = new Date(b.createdAt).getTime();
        return dateB - dateA;
      });
    }
    throw error;
  }
};

export const createMatrimonialProfile = async (
  profile: Omit<MatrimonialProfile, 'id' | 'createdAt' | 'status'>
): Promise<string> => {
  const docRef = await addDoc(collection(firestore, COLLECTIONS.MATRIMONIAL_PROFILES), {
    ...profile,
    status: 'pending',
    createdAt: Timestamp.now(),
  });
  return docRef.id;
};

export const updateMatrimonialProfileStatus = async (
  profileId: string,
  status: 'approved' | 'rejected',
  adminNotes?: string
): Promise<void> => {
  const profileRef = doc(firestore, COLLECTIONS.MATRIMONIAL_PROFILES, profileId);
  await updateDoc(profileRef, {
    status,
    adminNotes,
  });
};

// Matches
export const createMatch = async (match: Omit<Match, 'id' | 'createdAt'>): Promise<string> => {
  const docRef = await addDoc(collection(firestore, COLLECTIONS.MATCHES), {
    ...match,
    createdAt: Timestamp.now(),
  });
  return docRef.id;
};

export const getMatches = async (profileId: string): Promise<Match[]> => {
  const q = query(
    collection(firestore, COLLECTIONS.MATCHES),
    where('profileId1', '==', profileId)
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...convertTimestamp(doc.data()),
  })) as Match[];
};

