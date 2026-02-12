import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Post } from '../../types';
import * as firestoreService from '../../services/firebase/firestore';
import * as instagramService from '../../services/instagram/api';

interface FeedState {
  posts: Post[];
  loading: boolean;
  refreshing: boolean;
  error: string | null;
  nextCursor?: string;
}

const initialState: FeedState = {
  posts: [],
  loading: false,
  refreshing: false,
  error: null,
  nextCursor: undefined,
};

// Async thunks
export const fetchPosts = createAsyncThunk('feed/fetchPosts', async () => {
  return await firestoreService.getPosts();
});

export const fetchMorePosts = createAsyncThunk(
  'feed/fetchMorePosts',
  async (lastDoc: any) => {
    return await firestoreService.getPosts(lastDoc);
  }
);

export const fetchInstagramPosts = createAsyncThunk(
  'feed/fetchInstagramPosts',
  async ({ userId, userName }: { userId: string; userName: string }) => {
    // Check cache first
    const cacheKey = `instagram_${userId}`;
    const cached = instagramService.getCachedInstagramPosts(cacheKey);
    if (cached) {
      return { posts: cached, nextCursor: undefined };
    }

    const result = await instagramService.fetchInstagramPosts(userId, userName);
    instagramService.setCachedInstagramPosts(cacheKey, result.posts);
    return result;
  }
);

export const likePost = createAsyncThunk(
  'feed/likePost',
  async ({ postId, userId }: { postId: string; userId: string }) => {
    await firestoreService.likePost(postId, userId);
    return { postId, userId };
  }
);

export const addComment = createAsyncThunk(
  'feed/addComment',
  async ({ postId, comment }: { postId: string; comment: any }) => {
    return await firestoreService.addComment(postId, comment);
  }
);

const feedSlice = createSlice({
  name: 'feed',
  initialState,
  reducers: {
    setRefreshing: (state, action: PayloadAction<boolean>) => {
      state.refreshing = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    addPost: (state, action: PayloadAction<Post>) => {
      state.posts.unshift(action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch posts
      .addCase(fetchPosts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPosts.fulfilled, (state, action) => {
        state.loading = false;
        state.posts = action.payload;
      })
      .addCase(fetchPosts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch posts';
      })
      // Fetch Instagram posts
      .addCase(fetchInstagramPosts.pending, (state) => {
        if (state.posts.length === 0) {
          state.loading = true;
        } else {
          state.refreshing = true;
        }
        state.error = null;
      })
      .addCase(fetchInstagramPosts.fulfilled, (state, action) => {
        state.loading = false;
        state.refreshing = false;
        state.posts = [...state.posts, ...action.payload.posts];
        state.nextCursor = action.payload.nextCursor;
      })
      .addCase(fetchInstagramPosts.rejected, (state, action) => {
        state.loading = false;
        state.refreshing = false;
        state.error = action.error.message || 'Failed to fetch Instagram posts';
      })
      // Like post
      .addCase(likePost.fulfilled, (state, action) => {
        const post = state.posts.find((p) => p.id === action.payload.postId);
        if (post) {
          const isLiked = post.likedBy.includes(action.payload.userId);
          post.likes = isLiked ? post.likes - 1 : post.likes + 1;
          if (isLiked) {
            post.likedBy = post.likedBy.filter((id) => id !== action.payload.userId);
          } else {
            post.likedBy.push(action.payload.userId);
          }
        }
      });
  },
});

export const { setRefreshing, clearError, addPost } = feedSlice.actions;
export default feedSlice.reducer;

